import { Node, Edge, MarkerType } from '@xyflow/react';
import {
  AwsIconKey,
  AwsResourceItem,
  ProjectData,
} from '../types/workspace';
import { simulateSecurityScan } from './terraformEngine';

const SIMULATED_ACCOUNT_ID = '000000000000';

/**
 * Finds the 1-indexed startLine and endLine of a Terraform resource block
 * matching `terraformAddress` (e.g., "aws_lambda_function.order_processor").
 */
export function findTerraformBlockRange(
  content: string,
  terraformAddress: string
): { startLine: number; endLine: number } | null {
  if (!content || !terraformAddress.includes('.')) return null;
  const [resType, resName] = terraformAddress.split('.');
  const lines = content.split('\n');
  const escapedType = resType.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const escapedName = resName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const headerRegex = new RegExp(
    `^\\s*(?:resource|data)\\s+"${escapedType}"\\s+"${escapedName}"\\s*\\{?`
  );

  let startIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (headerRegex.test(lines[i])) {
      startIdx = i;
      break;
    }
  }

  if (startIdx === -1) return null;

  let braceDepth = 0;
  let seenOpeningBrace = false;

  for (let i = startIdx; i < lines.length; i++) {
    const line = lines[i];
    for (const ch of line) {
      if (ch === '{') {
        braceDepth++;
        seenOpeningBrace = true;
      } else if (ch === '}') {
        braceDepth--;
      }
    }
    if (seenOpeningBrace && braceDepth <= 0) {
      return { startLine: startIdx + 1, endLine: i + 1 };
    }
  }

  return {
    startLine: startIdx + 1,
    endLine: Math.min(lines.length, startIdx + 12),
  };
}

interface RawParsedBlock {
  type: string;
  name: string;
  file: string;
  startLine: number;
  endLine: number;
  body: string;
}

function extractRawResourceBlocks(files: Record<string, string>): RawParsedBlock[] {
  const orderedFileNames = Object.keys(files).sort((a, b) => {
    const priority = (f: string) =>
      f === 'vpc.tf' ? 0 : f === 'main.tf' ? 1 : f === 'iam.tf' ? 2 : 3;
    return priority(a) - priority(b) || a.localeCompare(b);
  });

  const blocks: RawParsedBlock[] = [];
  const headerRe = /^\s*resource\s+"([^"]+)"\s+"([^"]+)"\s*\{?/;

  for (const file of orderedFileNames) {
    const content = files[file] || '';
    const lines = content.split('\n');
    let i = 0;

    while (i < lines.length) {
      const match = lines[i].match(headerRe);
      if (!match) {
        i++;
        continue;
      }

      const [, type, name] = match;
      const startLine = i + 1;
      let depth = 0;
      let opened = false;
      let endIdx = i;

      for (let j = i; j < lines.length; j++) {
        for (const ch of lines[j]) {
          if (ch === '{') {
            depth++;
            opened = true;
          } else if (ch === '}') {
            depth--;
          }
        }
        endIdx = j;
        if (opened && depth <= 0) {
          break;
        }
      }

      const body = lines.slice(i, endIdx + 1).join('\n');
      blocks.push({
        type,
        name,
        file,
        startLine,
        endLine: endIdx + 1,
        body,
      });

      i = endIdx + 1;
    }
  }

  return blocks;
}

function readStringAttr(body: string, key: string): string | undefined {
  const re = new RegExp(`\\b${key}\\s*=\\s*"([^"]+)"`);
  const m = body.match(re);
  if (!m) return undefined;
  return m[1].replace(/\$\{var\.environment\}/g, 'production').replace(/\$\{var\.aws_region\}/g, 'us-east-1');
}

function readNumberAttr(body: string, key: string): number | undefined {
  const re = new RegExp(`\\b${key}\\s*=\\s*(\\d+)`);
  const m = body.match(re);
  return m ? Number(m[1]) : undefined;
}

function readBoolAttr(body: string, key: string): boolean | undefined {
  const re = new RegExp(`\\b${key}\\s*=\\s*(true|false)`);
  const m = body.match(re);
  return m ? m[1] === 'true' : undefined;
}

/**
 * Parses HCL files into structured AwsResourceItem inventory records.
 */
export function parseTerraformResources(
  files: Record<string, string>,
  region = 'us-east-1'
): AwsResourceItem[] {
  const rawBlocks = extractRawResourceBlocks(files);
  const allHcl = Object.values(files).join('\n');

  // Detect companion security configurations across files
  const kmsEncryptedBuckets = new Set<string>();
  const publicBlockedBuckets = new Set<string>();
  let hasVpcFlowLog = false;
  let hasZeroWildcardIam = true;

  for (const b of rawBlocks) {
    if (b.type === 'aws_s3_bucket_server_side_encryption_configuration') {
      const bucketRef = b.body.match(/aws_s3_bucket\.([a-zA-Z0-9_-]+)/);
      if (bucketRef && /aws:kms|kms_master_key_id/i.test(b.body)) {
        kmsEncryptedBuckets.add(bucketRef[1]);
      }
    }
    if (b.type === 'aws_s3_bucket_public_access_block') {
      const bucketRef = b.body.match(/aws_s3_bucket\.([a-zA-Z0-9_-]+)/);
      if (bucketRef && /block_public_acls\s*=\s*true/.test(b.body)) {
        publicBlockedBuckets.add(bucketRef[1]);
      }
    }
    if (b.type === 'aws_flow_log') {
      hasVpcFlowLog = true;
    }
    if (b.type === 'aws_iam_policy' || b.type === 'aws_iam_role_policy') {
      if (/\*:\*|Action\s*=\s*\[\s*"\*"\s*\]|Action\s*=\s*"\*"/.test(b.body)) {
        hasZeroWildcardIam = false;
      }
    }
  }

  const hasAnyKmsKey = rawBlocks.some((b) => b.type === 'aws_kms_key');
  const items: AwsResourceItem[] = [];

  for (const b of rawBlocks) {
    const address = `${b.type}.${b.name}`;

    switch (b.type) {
      case 'aws_vpc': {
        const cidr = readStringAttr(b.body, 'cidr_block') || '10.0.0.0/16';
        const dnsHostnames = readBoolAttr(b.body, 'enable_dns_hostnames') ?? true;
        const dnsSupport = readBoolAttr(b.body, 'enable_dns_support') ?? true;
        items.push({
          id: `res-${address}`,
          name: b.name,
          type: b.type,
          terraformAddress: address,
          iconKey: 'vpc',
          service: 'vpc',
          arn: `arn:aws:ec2:${region}:${SIMULATED_ACCOUNT_ID}:vpc/vpc-sim-${b.name.replace(/_/g, '-')}`,
          file: b.file,
          lineNumber: b.startLine,
          endLine: b.endLine,
          status: 'valid',
          encryption: 'none',
          exposure: 'private',
          subnetTier: 'vpc',
          securitySummary: hasVpcFlowLog
            ? 'Isolated CIDR · VPC Flow Logs Active'
            : 'Isolated CIDR · DNS Hostnames Enabled',
          details: `Virtual Private Cloud (${cidr}) with internal DNS resolution and tiered subnet boundaries.`,
          attributes: {
            cidr_block: cidr,
            enable_dns_hostnames: dnsHostnames,
            enable_dns_support: dnsSupport,
            flow_logs_enabled: hasVpcFlowLog,
          },
        });
        break;
      }

      case 'aws_subnet': {
        const cidr = readStringAttr(b.body, 'cidr_block') || '10.0.1.0/24';
        const az =
          readStringAttr(b.body, 'availability_zone')?.replace('us-east-1', region) ||
          `${region}a`;
        const mapPublicIp = readBoolAttr(b.body, 'map_public_ip_on_launch') ?? false;
        const isPublic =
          /public/i.test(b.name) || /Tier\s*=\s*"Public"/i.test(b.body) || mapPublicIp;
        const iconKey: AwsIconKey = isPublic ? 'subnet-public' : 'subnet-private';

        items.push({
          id: `res-${address}`,
          name: b.name,
          type: b.type,
          terraformAddress: address,
          iconKey,
          service: 'network',
          arn: `arn:aws:ec2:${region}:${SIMULATED_ACCOUNT_ID}:subnet/subnet-sim-${b.name.replace(/_/g, '-')}`,
          file: b.file,
          lineNumber: b.startLine,
          endLine: b.endLine,
          status: 'valid',
          encryption: 'none',
          exposure: isPublic ? 'public' : 'private',
          subnetTier: isPublic ? 'public' : 'private',
          securitySummary: isPublic
            ? `Public Perimeter Tier · Auto-Public IP: ${mapPublicIp ? 'On' : 'Off'}`
            : 'Private Isolated Tier · Zero Direct Internet Route',
          details: isPublic
            ? `Public subnet (${cidr}) in ${az} hosting controlled edge gateways.`
            : `Isolated private subnet (${cidr}) in ${az} with no direct inbound internet route.`,
          attributes: {
            cidr_block: cidr,
            availability_zone: az,
            tier: isPublic ? 'Public' : 'Private',
            map_public_ip_on_launch: mapPublicIp,
          },
        });
        break;
      }

      case 'aws_internet_gateway': {
        items.push({
          id: `res-${address}`,
          name: b.name,
          type: b.type,
          terraformAddress: address,
          iconKey: 'igw',
          service: 'network',
          arn: `arn:aws:ec2:${region}:${SIMULATED_ACCOUNT_ID}:internet-gateway/igw-sim-${b.name.replace(/_/g, '-')}`,
          file: b.file,
          lineNumber: b.startLine,
          endLine: b.endLine,
          status: 'valid',
          encryption: 'none',
          exposure: 'public',
          subnetTier: 'vpc',
          securitySummary: 'VPC Edge Attachment · Controlled via Public Route Table',
          details: 'Horizontally scaled VPC edge gateway routing public subnet traffic.',
          attributes: {
            vpc_attachment: 'aws_vpc.main_vpc',
            edge_scope: 'North-South Public Perimeter',
          },
        });
        break;
      }

      case 'aws_nat_gateway': {
        const connectivity = readStringAttr(b.body, 'connectivity_type') || 'public';
        items.push({
          id: `res-${address}`,
          name: b.name,
          type: b.type,
          terraformAddress: address,
          iconKey: 'nat-gateway',
          service: 'network',
          arn: `arn:aws:ec2:${region}:${SIMULATED_ACCOUNT_ID}:natgateway/nat-sim-${b.name.replace(/_/g, '-')}`,
          file: b.file,
          lineNumber: b.startLine,
          endLine: b.endLine,
          status: 'provisioned',
          encryption: 'none',
          exposure: 'public',
          subnetTier: 'public',
          securitySummary: 'Outbound-Only SNAT · Zero Inbound Port Forwarding',
          details: 'Managed NAT Gateway in public subnet enabling private compute egress via Elastic IP.',
          attributes: {
            connectivity_type: connectivity,
            allocation: 'aws_eip.nat_ip',
            inbound_exposure: 'Blocked (Stateful Outbound Only)',
          },
        });
        break;
      }

      case 'aws_route_table': {
        const isPublicRt =
          /public/i.test(b.name) || /aws_internet_gateway/i.test(b.body);
        const usesNat = /aws_nat_gateway/i.test(b.body) || allHcl.includes('aws_nat_gateway');
        items.push({
          id: `res-${address}`,
          name: b.name,
          type: b.type,
          terraformAddress: address,
          iconKey: 'route-table',
          service: 'network',
          arn: `arn:aws:ec2:${region}:${SIMULATED_ACCOUNT_ID}:route-table/rtb-sim-${b.name.replace(/_/g, '-')}`,
          file: b.file,
          lineNumber: b.startLine,
          endLine: b.endLine,
          status: 'valid',
          encryption: 'none',
          exposure: isPublicRt ? 'public' : 'private',
          subnetTier: isPublicRt ? 'public' : 'private',
          securitySummary: isPublicRt
            ? '0.0.0.0/0 -> Internet Gateway'
            : usesNat
            ? '0.0.0.0/0 -> NAT Gateway (Private Egress)'
            : '10.0.0.0/16 Local VPC Only (Air-Gapped)',
          details: isPublicRt
            ? 'Public tier route table directing 0.0.0.0/0 traffic to VPC Internet Gateway.'
            : usesNat
            ? 'Private tier route table directing outbound 0.0.0.0/0 traffic through NAT Gateway.'
            : 'Isolated private route table restricting traffic strictly to internal VPC CIDR.',
          attributes: {
            tier: isPublicRt ? 'Public' : 'Private',
            default_route: isPublicRt
              ? '0.0.0.0/0 -> igw'
              : usesNat
              ? '0.0.0.0/0 -> nat_gateway'
              : 'local_only (10.0.0.0/16)',
          },
        });
        break;
      }

      case 'aws_security_group': {
        const desc =
          readStringAttr(b.body, 'description') ||
          'Stateful security group protecting VPC workloads';
        const hasOpenSsh =
          /cidr_blocks\s*=\s*\["0\.0\.0\.0\/0"\]/.test(b.body) &&
          /from_port\s*=\s*22/.test(b.body);
        items.push({
          id: `res-${address}`,
          name: b.name,
          type: b.type,
          terraformAddress: address,
          iconKey: 'security-group',
          service: 'security',
          arn: `arn:aws:ec2:${region}:${SIMULATED_ACCOUNT_ID}:security-group/sg-sim-${b.name.replace(/_/g, '-')}`,
          file: b.file,
          lineNumber: b.startLine,
          endLine: b.endLine,
          status: 'valid',
          encryption: 'none',
          exposure: hasOpenSsh ? 'public' : 'private',
          subnetTier: 'private',
          securitySummary: hasOpenSsh
            ? 'Warning: 0.0.0.0/0 SSH Ingress'
            : 'Zero Inbound Rules · Stateful HTTPS Egress',
          details: desc,
          attributes: {
            ingress_rules: hasOpenSsh ? '0.0.0.0/0:22' : 'None (Deny All Inbound)',
            egress_rules: 'HTTPS 443 / VPC Internal',
            stateful: true,
          },
        });
        break;
      }

      case 'aws_lambda_function': {
        const fnName = readStringAttr(b.body, 'function_name') || b.name;
        const runtime = readStringAttr(b.body, 'runtime') || 'nodejs20.x';
        const memory = readNumberAttr(b.body, 'memory_size') || 256;
        const timeout = readNumberAttr(b.body, 'timeout') || 15;
        const inVpc = /vpc_config\s*\{/.test(b.body);
        const xray = /mode\s*=\s*"Active"/.test(b.body);
        items.push({
          id: `res-${address}`,
          name: b.name,
          type: b.type,
          terraformAddress: address,
          iconKey: 'lambda',
          service: 'compute',
          arn: `arn:aws:lambda:${region}:${SIMULATED_ACCOUNT_ID}:function:${fnName}`,
          file: b.file,
          lineNumber: b.startLine,
          endLine: b.endLine,
          status: 'valid',
          encryption: hasAnyKmsKey ? 'kms' : 'default',
          exposure: 'private',
          subnetTier: inVpc ? 'private' : 'regional',
          securitySummary: inVpc
            ? 'Private Subnet ENI · Scoped IAM Role'
            : 'Regional Compute · Scoped IAM Role',
          details: `Lambda (${runtime}, ${memory} MB, ${timeout}s timeout)${
            inVpc ? ' attached to isolated VPC private subnet' : ''
          }${xray ? ' with Active X-Ray tracing.' : '.'}`,
          attributes: {
            function_name: fnName,
            runtime,
            memory_size_mb: memory,
            timeout_sec: timeout,
            vpc_isolated: inVpc,
            xray_tracing: xray ? 'Active' : 'PassThrough',
          },
        });
        break;
      }

      case 'aws_s3_bucket': {
        const bucketName = readStringAttr(b.body, 'bucket') || b.name;
        const forceDestroy = readBoolAttr(b.body, 'force_destroy') ?? false;
        const isKms = kmsEncryptedBuckets.has(b.name) || hasAnyKmsKey;
        const isPrivate = publicBlockedBuckets.has(b.name) || allHcl.includes('aws_s3_bucket_public_access_block');
        items.push({
          id: `res-${address}`,
          name: b.name,
          type: b.type,
          terraformAddress: address,
          iconKey: 's3',
          service: 'storage',
          arn: `arn:aws:s3:::${bucketName}`,
          file: b.file,
          lineNumber: b.startLine,
          endLine: b.endLine,
          status: 'valid',
          encryption: isKms ? 'kms' : 'default',
          exposure: isPrivate ? 'private' : 'public',
          subnetTier: 'regional',
          securitySummary: `${isKms ? 'SSE-KMS CMK' : 'SSE-S3 AES-256'} · ${
            isPrivate ? 'Public Access Blocked' : 'Check Public ACLs'
          }`,
          details: `S3 bucket (${bucketName}) with ${
            isPrivate ? 'all 4 public access block guards enabled' : 'standard ACLs'
          } and ${isKms ? 'customer-managed KMS encryption' : 'default server-side encryption'}.`,
          attributes: {
            bucket: bucketName,
            encryption_mode: isKms ? 'aws:kms (Bucket Key)' : 'AES256 (SSE-S3)',
            block_public_access: isPrivate,
            force_destroy: forceDestroy,
          },
        });
        break;
      }

      case 'aws_iam_role': {
        const roleName = readStringAttr(b.body, 'name') || b.name;
        items.push({
          id: `res-${address}`,
          name: b.name,
          type: b.type,
          terraformAddress: address,
          iconKey: 'iam',
          service: 'security',
          arn: `arn:aws:iam::${SIMULATED_ACCOUNT_ID}:role/${roleName}`,
          file: b.file,
          lineNumber: b.startLine,
          endLine: b.endLine,
          status: 'valid',
          encryption: 'none',
          exposure: 'private',
          subnetTier: 'regional',
          securitySummary: hasZeroWildcardIam
            ? 'Least-Privilege · Zero Wildcards (*)'
            : 'Review Policy Wildcards',
          details: `IAM execution role (${roleName}) assumed via STS with granular ARN-scoped permissions.`,
          attributes: {
            role_name: roleName,
            trusted_principal: 'lambda.amazonaws.com',
            wildcard_actions: !hasZeroWildcardIam,
          },
        });
        break;
      }

      case 'aws_cloudwatch_log_group': {
        const logGroupName =
          readStringAttr(b.body, 'name')?.replace(
            /\$\{aws_lambda_function\.[^}]+\}/g,
            'production-order-processor'
          ) || `/aws/terragen/${b.name}`;
        const retention = readNumberAttr(b.body, 'retention_in_days') || 30;
        const kmsKey = /kms_key_id/.test(b.body);
        items.push({
          id: `res-${address}`,
          name: b.name,
          type: b.type,
          terraformAddress: address,
          iconKey: 'cloudwatch',
          service: 'observability',
          arn: `arn:aws:logs:${region}:${SIMULATED_ACCOUNT_ID}:log-group:${logGroupName}`,
          file: b.file,
          lineNumber: b.startLine,
          endLine: b.endLine,
          status: 'valid',
          encryption: kmsKey ? 'kms' : 'default',
          exposure: 'private',
          subnetTier: 'regional',
          securitySummary: `${retention}-Day Retention · Structured Audit Stream`,
          details: `CloudWatch Log Group (${logGroupName}) retaining structured telemetry for ${retention} days.`,
          attributes: {
            log_group_name: logGroupName,
            retention_in_days: retention,
            encrypted_logs: kmsKey ? 'KMS CMK' : 'CloudWatch Default',
          },
        });
        break;
      }

      case 'aws_kms_key': {
        const desc = readStringAttr(b.body, 'description') || 'Customer Managed KMS Key';
        const windowDays = readNumberAttr(b.body, 'deletion_window_in_days') || 30;
        const rotation = readBoolAttr(b.body, 'enable_key_rotation') ?? true;
        items.push({
          id: `res-${address}`,
          name: b.name,
          type: b.type,
          terraformAddress: address,
          iconKey: 'kms',
          service: 'security',
          arn: `arn:aws:kms:${region}:${SIMULATED_ACCOUNT_ID}:key/cmk-sim-${b.name.replace(/_/g, '-')}`,
          file: b.file,
          lineNumber: b.startLine,
          endLine: b.endLine,
          status: 'provisioned',
          encryption: 'kms',
          exposure: 'private',
          subnetTier: 'regional',
          securitySummary: `CMK · ${rotation ? '365-Day Auto Rotation' : 'Manual Rotation'}`,
          details: `${desc} (${windowDays}-day deletion guard).`,
          attributes: {
            key_usage: 'ENCRYPT_DECRYPT',
            enable_key_rotation: rotation,
            deletion_window_days: windowDays,
          },
        });
        break;
      }

      case 'aws_eip': {
        const domain = readStringAttr(b.body, 'domain') || 'vpc';
        items.push({
          id: `res-${address}`,
          name: b.name,
          type: b.type,
          terraformAddress: address,
          iconKey: 'eip',
          service: 'network',
          arn: `arn:aws:ec2:${region}:${SIMULATED_ACCOUNT_ID}:elastic-ip/eipalloc-sim-${b.name.replace(/_/g, '-')}`,
          file: b.file,
          lineNumber: b.startLine,
          endLine: b.endLine,
          status: 'provisioned',
          encryption: 'none',
          exposure: 'public',
          subnetTier: 'public',
          securitySummary: 'Dedicated Static IPv4 · Bound to NAT Gateway',
          details: 'Static public IPv4 address allocated in VPC domain for deterministic outbound SNAT.',
          attributes: {
            domain,
            simulated_ipv4: '198.51.100.42 (RFC 5737 Test-Net)',
          },
        });
        break;
      }

      default:
        break;
    }
  }

  return items;
}

function makeEdge(params: {
  id: string;
  source: string;
  target: string;
  sourceHandle: string;
  targetHandle: string;
  label: string;
  protocol: string;
  securityNote: string;
  color: string;
  animated?: boolean;
  dashed?: boolean;
}): Edge {
  return {
    id: params.id,
    source: params.source,
    target: params.target,
    sourceHandle: params.sourceHandle,
    targetHandle: params.targetHandle,
    type: 'awsFlowEdge',
    animated: params.animated ?? true,
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: params.color,
      width: 16,
      height: 16,
    },
    data: {
      label: params.label,
      protocol: params.protocol,
      securityNote: params.securityNote,
      color: params.color,
      dashed: params.dashed ?? false,
    },
  };
}

/**
 * Builds synchronized React Flow nodes (Region, VPC, Public/Private Subnets, AWS Resources)
 * and directional labeled edges from parsed AwsResourceItem[].
 */
export function buildTopologyFromResources(
  region: string,
  resources: AwsResourceItem[],
  existingNodes: Node[] = [],
  options: { resetLayout?: boolean } = {}
): { nodes: Node[]; edges: Edge[] } {
  const existingPosMap = new Map<string, { x: number; y: number }>();
  if (!options.resetLayout) {
    for (const n of existingNodes) {
      if (n.type === 'awsNode' && n.position) {
        existingPosMap.set(n.id, n.position);
      }
    }
  }

  const getPos = (id: string, fallback: { x: number; y: number }) =>
    existingPosMap.get(id) || fallback;

  const vpc = resources.find((r) => r.type === 'aws_vpc');
  const publicSubnets = resources.filter(
    (r) => r.type === 'aws_subnet' && r.subnetTier === 'public'
  );
  const privateSubnets = resources.filter(
    (r) => r.type === 'aws_subnet' && r.subnetTier === 'private'
  );
  const igw = resources.find((r) => r.type === 'aws_internet_gateway');
  const natGateways = resources.filter((r) => r.type === 'aws_nat_gateway');
  const publicRts = resources.filter(
    (r) => r.type === 'aws_route_table' && r.subnetTier === 'public'
  );
  const privateRts = resources.filter(
    (r) => r.type === 'aws_route_table' && r.subnetTier === 'private'
  );
  const securityGroups = resources.filter((r) => r.type === 'aws_security_group');
  const lambdas = resources.filter((r) => r.type === 'aws_lambda_function');
  const s3Buckets = resources.filter((r) => r.type === 'aws_s3_bucket');
  const iamRoles = resources.filter((r) => r.type === 'aws_iam_role');
  const logGroups = resources.filter((r) => r.type === 'aws_cloudwatch_log_group');
  const kmsKeys = resources.filter((r) => r.type === 'aws_kms_key');

  const containerNodes: Node[] = [];
  const resourceNodes: Node[] = [];
  const edges: Edge[] = [];

  const toAwsNode = (res: AwsResourceItem, defaultPos: { x: number; y: number }): Node => ({
    id: res.id,
    type: 'awsNode',
    position: getPos(res.id, defaultPos),
    draggable: true,
    zIndex: 10,
    data: {
      label: res.name,
      terraformType: res.type,
      terraformAddress: res.terraformAddress,
      iconKey: res.iconKey,
      service: res.service,
      arn: res.arn,
      details: res.details,
      securitySummary: res.securitySummary,
      status: res.status,
      file: res.file,
      lineNumber: res.lineNumber,
      endLine: res.endLine,
      encryption: res.encryption,
      exposure: res.exposure,
      attributes: res.attributes,
      resource: res,
    },
  });

  if (vpc) {
    // Determine Regional Services right-side columns
    const primaryRegional = [...iamRoles, ...s3Buckets, ...logGroups.slice(0, 1)];
    const secondaryRegional = [...kmsKeys, ...logGroups.slice(1)];
    const hasSecondRegionalCol = secondaryRegional.length > 0;
    const hasPublicSubnet = publicSubnets.length > 0;
    const hasPrivateSubnet = privateSubnets.length > 0;

    const regionWidth = hasSecondRegionalCol ? 1560 : 1280;
    const regionHeight = 668;

    // 1. AWS Region Container
    containerNodes.push({
      id: 'container-region',
      type: 'regionGroup',
      position: { x: 24, y: 20 },
      draggable: false,
      selectable: false,
      zIndex: -30,
      style: { width: regionWidth, height: regionHeight },
      data: {
        label: `AWS Cloud · Region ${region}`,
        region,
        simulated: true,
      },
    });

    // 2. VPC Container inside Region
    const vpcWidth = 892;
    const vpcHeight = 584;
    containerNodes.push({
      id: vpc.id,
      type: 'vpcGroup',
      position: { x: 56, y: 80 },
      draggable: false,
      selectable: false,
      zIndex: -20,
      style: { width: vpcWidth, height: vpcHeight },
      data: {
        label: `VPC: ${vpc.name}`,
        cidr: String(vpc.attributes.cidr_block || '10.0.0.0/16'),
        terraformAddress: vpc.terraformAddress,
        file: vpc.file,
        resource: vpc,
      },
    });

    // 3. Public Subnet Boundary Container (top right of VPC)
    if (hasPublicSubnet) {
      const pubSub = publicSubnets[0];
      containerNodes.push({
        id: pubSub.id,
        type: 'subnetGroup',
        position: { x: 376, y: 140 },
        draggable: false,
        selectable: false,
        zIndex: -10,
        style: { width: 546, height: 214 },
        data: {
          label: `Public Subnet (${pubSub.name})`,
          cidr: String(pubSub.attributes.cidr_block || '10.0.1.0/24'),
          az: String(pubSub.attributes.availability_zone || `${region}a`),
          tier: 'public',
          terraformAddress: pubSub.terraformAddress,
          file: pubSub.file,
          resource: pubSub,
        },
      });
    }

    // 4. Private Subnet Boundary Container (bottom of VPC)
    if (hasPrivateSubnet) {
      const privSub = privateSubnets[0];
      containerNodes.push({
        id: privSub.id,
        type: 'subnetGroup',
        position: { x: 82, y: 384 },
        draggable: false,
        selectable: false,
        zIndex: -10,
        style: { width: 840, height: 254 },
        data: {
          label: `Private Subnet (${privSub.name})`,
          cidr: String(privSub.attributes.cidr_block || '10.0.2.0/24'),
          az: String(privSub.attributes.availability_zone || `${region}a`),
          tier: 'private',
          terraformAddress: privSub.terraformAddress,
          file: privSub.file,
          resource: privSub,
        },
      });
    }

    // 5. Place VPC Perimeter & Subnet Resources
    if (igw) {
      resourceNodes.push(toAwsNode(igw, { x: 84, y: 206 }));
    }

    publicRts.forEach((rt, idx) => {
      resourceNodes.push(toAwsNode(rt, { x: 404 + idx * 280, y: 206 }));
    });

    natGateways.forEach((nat, idx) => {
      const xOffset = publicRts.length > 0 ? 684 : 404 + idx * 280;
      resourceNodes.push(toAwsNode(nat, { x: xOffset, y: 206 }));
    });

    // Private Subnet Resources: Private Route Table -> Security Group -> Lambda
    let privSlotIndex = 0;
    const privSlots = [
      { x: 104, y: 468 },
      { x: 400, y: 468 },
      { x: 696, y: 468 },
    ];

    privateRts.forEach((rt) => {
      const pos = privSlots[Math.min(privSlotIndex++, privSlots.length - 1)];
      resourceNodes.push(toAwsNode(rt, pos));
    });

    securityGroups.forEach((sg) => {
      const pos = privSlots[Math.min(privSlotIndex++, privSlots.length - 1)];
      resourceNodes.push(toAwsNode(sg, pos));
    });

    lambdas.forEach((fn, idx) => {
      const basePos =
        privSlotIndex < privSlots.length
          ? privSlots[privSlotIndex++]
          : { x: 696, y: 468 + idx * 112 };
      resourceNodes.push(toAwsNode(fn, basePos));
    });

    // 6. Regional Managed Services (inside AWS Region, outside VPC)
    primaryRegional.forEach((res, idx) => {
      resourceNodes.push(toAwsNode(res, { x: 1012, y: 140 + idx * 176 }));
    });

    secondaryRegional.forEach((res, idx) => {
      resourceNodes.push(toAwsNode(res, { x: 1308, y: 228 + idx * 176 }));
    });
  } else {
    // Non-VPC Regional Topology (e.g. Hardened S3 + KMS or Blank starter)
    const visibleRegional = resources.filter((r) => r.type !== 'aws_eip');
    const cols = Math.max(2, Math.min(3, visibleRegional.length));
    const rows = Math.max(1, Math.ceil(visibleRegional.length / cols));
    const regionWidth = Math.max(820, cols * 310 + 140);
    const regionHeight = Math.max(420, rows * 190 + 150);

    containerNodes.push({
      id: 'container-region',
      type: 'regionGroup',
      position: { x: 32, y: 24 },
      draggable: false,
      selectable: false,
      zIndex: -30,
      style: { width: regionWidth, height: regionHeight },
      data: {
        label: `AWS Cloud · Region ${region}`,
        region,
        simulated: true,
      },
    });

    visibleRegional.forEach((res, idx) => {
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      resourceNodes.push(
        toAwsNode(res, {
          x: 96 + col * 300,
          y: 120 + row * 175,
        })
      );
    });
  }

  // 7. Build Directional Architectural Connections
  const pubRt = publicRts[0];
  const privRt = privateRts[0];
  const nat = natGateways[0];
  const sg = securityGroups[0];
  const primaryLambda = lambdas[0];
  const primaryS3 = s3Buckets[0];
  const primaryIam = iamRoles[0];
  const primaryCw = logGroups[0];
  const secondaryCw = logGroups[1];
  const primaryKms = kmsKeys[0];

  if (igw && pubRt) {
    edges.push(
      makeEdge({
        id: `edge-${igw.id}-${pubRt.id}`,
        source: igw.id,
        target: pubRt.id,
        sourceHandle: 'right-source',
        targetHandle: 'left-target',
        label: '0.0.0.0/0 Route',
        protocol: 'IPv4 North-South Gateway Route',
        securityNote: 'Public route scoped strictly to edge subnet resources.',
        color: '#38BDF8',
        animated: true,
      })
    );
  }

  if (nat && igw) {
    edges.push(
      makeEdge({
        id: `edge-${nat.id}-${igw.id}`,
        source: nat.id,
        target: igw.id,
        sourceHandle: 'top-source',
        targetHandle: 'top-target',
        label: 'SNAT Egress · EIP',
        protocol: 'Outbound NAT Translation (TCP/HTTPS)',
        securityNote: 'Translates private egress via static Elastic IP; drops unsolicited inbound packets.',
        color: '#06B6D4',
        animated: true,
      })
    );
  }

  if (privRt && nat) {
    edges.push(
      makeEdge({
        id: `edge-${privRt.id}-${nat.id}`,
        source: privRt.id,
        target: nat.id,
        sourceHandle: 'top-source',
        targetHandle: 'bottom-target',
        label: '0.0.0.0/0 Private Egress',
        protocol: 'VPC Route Table -> NAT Gateway',
        securityNote: 'Private workloads reach external APIs without public IPv4 addresses.',
        color: '#22D3EE',
        animated: true,
      })
    );
  }

  if (privRt && sg) {
    edges.push(
      makeEdge({
        id: `edge-${privRt.id}-${sg.id}`,
        source: privRt.id,
        target: sg.id,
        sourceHandle: 'right-source',
        targetHandle: 'left-target',
        label: '10.0.2.0/24 Route',
        protocol: 'VPC Internal Routing',
        securityNote: 'Isolated private subnet routing table with zero inbound internet route.',
        color: '#8B5CF6',
        animated: false,
      })
    );
  } else if (igw && !pubRt && sg) {
    edges.push(
      makeEdge({
        id: `edge-${igw.id}-${sg.id}`,
        source: igw.id,
        target: sg.id,
        sourceHandle: 'bottom-source',
        targetHandle: 'top-target',
        label: 'VPC Perimeter Boundary',
        protocol: 'Filtered VPC Perimeter',
        securityNote: 'Security group blocks unsolicited inbound traffic.',
        color: '#38BDF8',
        animated: false,
      })
    );
  }

  if (sg && primaryLambda) {
    edges.push(
      makeEdge({
        id: `edge-${sg.id}-${primaryLambda.id}`,
        source: sg.id,
        target: primaryLambda.id,
        sourceHandle: 'right-source',
        targetHandle: 'left-target',
        label: 'HTTPS 443 · ENI',
        protocol: 'Hyperplane VPC ENI Attachment',
        securityNote: 'Zero inbound ports open; allows outbound HTTPS 443.',
        color: '#A855F7',
        animated: true,
      })
    );
  }

  if (primaryIam && primaryLambda) {
    edges.push(
      makeEdge({
        id: `edge-${primaryIam.id}-${primaryLambda.id}`,
        source: primaryIam.id,
        target: primaryLambda.id,
        sourceHandle: 'left-source',
        targetHandle: 'top-target',
        label: 'sts:AssumeRole (Scoped)',
        protocol: 'AWS STS Temporary Credentials',
        securityNote: 'Zero wildcard (*) actions; scoped strictly to bucket & log ARNs.',
        color: '#F43F5E',
        animated: false,
        dashed: true,
      })
    );
  }

  if (primaryLambda && primaryS3) {
    edges.push(
      makeEdge({
        id: `edge-${primaryLambda.id}-${primaryS3.id}`,
        source: primaryLambda.id,
        target: primaryS3.id,
        sourceHandle: 'right-source',
        targetHandle: 'left-target',
        label: 'HTTPS · s3:Get/PutObject',
        protocol: 'TLS 1.3 S3 Object API',
        securityNote: 'Encrypted in transit and at rest with public access blocked.',
        color: '#10B981',
        animated: true,
      })
    );
  }

  if (primaryLambda && primaryCw) {
    edges.push(
      makeEdge({
        id: `edge-${primaryLambda.id}-${primaryCw.id}`,
        source: primaryLambda.id,
        target: primaryCw.id,
        sourceHandle: 'bottom-source',
        targetHandle: 'left-target',
        label: 'PutLogEvents · X-Ray',
        protocol: 'CloudWatch Logs & X-Ray Telemetry',
        securityNote: 'Structured execution logs with retention policy enforced.',
        color: '#EC4899',
        animated: true,
      })
    );
  }

  if (primaryKms && primaryS3) {
    const kmsOnRight = vpc !== undefined;
    edges.push(
      makeEdge({
        id: `edge-${primaryKms.id}-${primaryS3.id}`,
        source: primaryKms.id,
        target: primaryS3.id,
        sourceHandle: kmsOnRight ? 'left-source' : 'right-source',
        targetHandle: kmsOnRight ? 'right-target' : 'left-target',
        label: 'SSE-KMS · Bucket Key',
        protocol: 'AWS KMS Envelope Encryption (CMK)',
        securityNote: '365-day automated key rotation with S3 Bucket Key enabled.',
        color: '#A855F7',
        animated: true,
      })
    );
  }

  if (secondaryCw && primaryS3) {
    edges.push(
      makeEdge({
        id: `edge-${primaryS3.id}-${secondaryCw.id}`,
        source: primaryS3.id,
        target: secondaryCw.id,
        sourceHandle: 'bottom-source',
        targetHandle: 'left-target',
        label: 'Audit Trail Stream',
        protocol: 'CloudWatch Centralized Audit Logs',
        securityNote: '90-day immutable retention for compliance auditing.',
        color: '#38BDF8',
        animated: true,
      })
    );
  }

  return {
    nodes: [...containerNodes, ...resourceNodes],
    edges,
  };
}

/**
 * Synchronizes a ProjectData object so `resources`, `nodes`, `edges`, and
 * `securityFindings` always reflect the current `.tf` files and region.
 */
export function synchronizeProjectState(
  project: ProjectData,
  options: { resetLayout?: boolean } = {}
): ProjectData {
  const resources = parseTerraformResources(project.files, project.region);
  const { nodes, edges } = buildTopologyFromResources(
    project.region,
    resources,
    project.nodes,
    options
  );
  const scan = simulateSecurityScan(project.files);

  return {
    ...project,
    resources,
    nodes,
    edges,
    securityFindings: scan.findings,
  };
}
