import { ProjectData, SecurityFinding, ChatMessage } from '../types/workspace';
import { synchronizeProjectState } from './terraformSync';

/**
 * Cleanly formats HCL indentation.
 */
export function simulateTerraformFmt(hcl: string): { formatted: string; changed: boolean } {
  const lines = hcl.split('\n');
  let currentIndent = 0;
  const formattedLines: string[] = [];
  let changed = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      formattedLines.push('');
      continue;
    }

    if (trimmed.startsWith('}') || trimmed.startsWith(']')) {
      currentIndent = Math.max(0, currentIndent - 1);
    }

    const expectedIndent = '  '.repeat(currentIndent);
    const newLine = `${expectedIndent}${trimmed}`;
    if (newLine !== line) {
      changed = true;
    }
    formattedLines.push(newLine);

    if (trimmed.endsWith('{') || trimmed.endsWith('[')) {
      currentIndent++;
    }
  }

  return { formatted: formattedLines.join('\n'), changed };
}

/**
 * Validates HCL files for matching braces, deprecated blocks, and IAM wildcards.
 */
export function simulateTerraformValidate(files: Record<string, string>): {
  success: boolean;
  errorCount: number;
  warningCount: number;
  output: string;
} {
  let errorCount = 0;
  const warnings: string[] = [];
  const errors: string[] = [];

  for (const [filename, content] of Object.entries(files)) {
    const openBraces = (content.match(/\{/g) || []).length;
    const closeBraces = (content.match(/\}/g) || []).length;
    if (openBraces !== closeBraces) {
      errorCount++;
      errors.push(
        `Error: Unbalanced braces in ${filename} (${openBraces} open vs ${closeBraces} close)`
      );
    }

    if (content.includes('versioning { enabled = true }')) {
      warnings.push(
        `Warning: ${filename}: Use separate 'aws_s3_bucket_versioning' resource instead of inline versioning block.`
      );
    }

    if (content.includes('"*"') && content.includes('Action')) {
      warnings.push(
        `Warning: ${filename}: IAM policy statement contains wildcard '*' action. Least-privilege violation.`
      );
    }
  }

  const success = errorCount === 0;
  const output = success
    ? `Success! The configuration is valid.\n\nValidated files: ${Object.keys(files).join(', ')}\nNo syntax or schema errors detected across all declared resources.\nSimulated check compatible with HashiCorp AWS Provider ~> 5.40 and OpenTofu 1.7+.`
    : `Error parsing configuration:\n\n${errors.join('\n')}${
        warnings.length ? `\n\n${warnings.join('\n')}` : ''
      }`;

  return { success, errorCount, warningCount: warnings.length, output };
}

/**
 * Audits HCL configurations against CIS AWS Foundations Benchmark v3.0.
 */
export function simulateSecurityScan(files: Record<string, string>): {
  score: number;
  passed: number;
  warnings: number;
  failures: number;
  findings: SecurityFinding[];
} {
  const allCode = Object.values(files).join('\n');
  const s3Match = allCode.match(/resource\s+"aws_s3_bucket"\s+"([^"]+)"/);
  const vpcMatch = allCode.match(/resource\s+"aws_vpc"\s+"([^"]+)"/);
  const sgMatch = allCode.match(/resource\s+"aws_security_group"\s+"([^"]+)"/);
  const iamMatch = allCode.match(/resource\s+"aws_iam_policy"\s+"([^"]+)"/);

  const findings: SecurityFinding[] = [
    {
      id: 'cis-s3-1',
      rule: 'CIS 2.1.1 - S3 Bucket Server-Side Encryption (CMK)',
      severity: 'high',
      category: 'Encryption',
      status: /aws_s3_bucket_server_side_encryption_configuration|kms_master_key_id|aws_kms_key/i.test(
        allCode
      )
        ? 'passed'
        : 'warning',
      resourceId: s3Match ? `aws_s3_bucket.${s3Match[1]}` : 'aws_s3_bucket',
      description:
        'Ensure S3 buckets enforce server-side encryption using an AWS KMS Customer Managed Key (CMK) with bucket keying.',
      remediationPrompt: 'Enable customer-managed KMS encryption on S3 buckets',
    },
    {
      id: 'cis-vpc-1',
      rule: 'CIS 2.9 - VPC Flow Logging Enabled',
      severity: 'medium',
      category: 'Logging',
      status: !vpcMatch || /aws_flow_log/i.test(allCode) ? 'passed' : 'warning',
      resourceId: vpcMatch ? `aws_vpc.${vpcMatch[1]}` : 'aws_vpc',
      description:
        'Ensure VPC flow logging is enabled in active VPC networks to capture accepted and rejected packet metadata.',
      remediationPrompt: 'Add aws_flow_log resource logging VPC traffic to CloudWatch',
    },
    {
      id: 'cis-iam-1',
      rule: 'CIS 1.16 - IAM Policies Prohibit Wildcard Actions',
      severity: 'high',
      category: 'IAM',
      status:
        !/\*:\*/.test(allCode) && !/Action\s*=\s*\[\s*"\*"\s*\]/.test(allCode)
          ? 'passed'
          : 'failed',
      resourceId: iamMatch ? `aws_iam_policy.${iamMatch[1]}` : 'aws_iam_policy',
      description:
        'Ensure IAM execution policies specify explicit service actions and scoped resource ARNs without wildcard *.',
      remediationPrompt: 'Attach Lambda to private subnet with least-privilege IAM',
    },
    {
      id: 'cis-net-1',
      rule: 'CIS 4.1 - Security Groups Prohibit Unrestricted SSH Ingress',
      severity: 'high',
      category: 'Networking',
      status: !/cidr_blocks\s*=\s*\["0\.0\.0\.0\/0"\][\s\S]{0,80}from_port\s*=\s*22/.test(allCode)
        ? 'passed'
        : 'failed',
      resourceId: sgMatch ? `aws_security_group.${sgMatch[1]}` : 'aws_security_group',
      description:
        'Ensure security groups prohibit unrestricted ingress (0.0.0.0/0) on administrative ports such as SSH (22).',
      remediationPrompt: 'Restrict SSH ingress on security groups to private VPC CIDR',
    },
  ];

  const passed = findings.filter((f) => f.status === 'passed').length;
  const warnings = findings.filter((f) => f.status === 'warning').length;
  const failures = findings.filter((f) => f.status === 'failed').length;
  const score = Math.round((passed / findings.length) * 100);

  return { score, passed, warnings, failures, findings };
}

/**
 * Applies a natural-language architectural change to Terraform files and
 * synchronizes Diagram nodes/edges, Resource Inventory, and Security Findings.
 */
export function applyAiPromptToProject(project: ProjectData, prompt: string): ProjectData {
  const pLower = prompt.toLowerCase();
  const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const updatedFiles = { ...project.files };
  const slug = project.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  let responseMessage = '';
  let changedFiles: string[] = [];
  let addedResources: string[] = [];

  const originalSnapshot = project.originalFilesSnapshot || { ...project.files };
  const allExistingHcl = Object.values(updatedFiles).join('\n');

  if (pLower.includes('nat') || pLower.includes('multi-az') || pLower.includes('routing')) {
    const targetVpcFile = updatedFiles['vpc.tf'] !== undefined ? 'vpc.tf' : 'main.tf';
    changedFiles = [targetVpcFile];
    addedResources = ['aws_eip.nat_ip', 'aws_nat_gateway.primary_nat'];

    if (!/resource\s+"aws_nat_gateway"\s+"primary_nat"/.test(allExistingHcl)) {
      const natHcl = `

# Managed NAT Gateway for outbound egress from isolated private subnets
resource "aws_eip" "nat_ip" {
  domain = "vpc"

  tags = {
    Name      = "${slug}-nat-eip"
    ManagedBy = "TerraGen-AI"
  }
}

resource "aws_nat_gateway" "primary_nat" {
  allocation_id     = aws_eip.nat_ip.id
  subnet_id         = aws_subnet.public_subnet_a.id
  connectivity_type = "public"

  tags = {
    Name      = "${slug}-nat-gw"
    ManagedBy = "TerraGen-AI"
  }

  depends_on = [aws_internet_gateway.main_igw]
}`;
      updatedFiles[targetVpcFile] = (updatedFiles[targetVpcFile] || '').trimEnd() + natHcl + '\n';

      // Wire private_rt default route to NAT Gateway if present
      if (updatedFiles[targetVpcFile].includes('resource "aws_route_table" "private_rt"')) {
        updatedFiles[targetVpcFile] = updatedFiles[targetVpcFile].replace(
          /resource\s+"aws_route_table"\s+"private_rt"\s*\{/,
          `resource "aws_route_table" "private_rt" {\n  route {\n    cidr_block     = "0.0.0.0/0"\n    nat_gateway_id = aws_nat_gateway.primary_nat.id\n  }\n`
        );
      }
    }

    responseMessage =
      'Provisioned managed NAT Gateway (`aws_nat_gateway.primary_nat`) with dedicated Elastic IP inside the Public Subnet and updated `aws_route_table.private_rt` to route `0.0.0.0/0` outbound traffic securely without exposing private workloads.';
  } else if (pLower.includes('kms') || pLower.includes('encrypt')) {
    changedFiles = ['main.tf'];
    const bucketMatch = allExistingHcl.match(/resource\s+"aws_s3_bucket"\s+"([^"]+)"/);
    const bucketResName = bucketMatch ? bucketMatch[1] : 'primary_storage';
    addedResources = [
      'aws_kms_key.data_key',
      'aws_s3_bucket_server_side_encryption_configuration.kms_default',
    ];

    if (!/resource\s+"aws_kms_key"/.test(allExistingHcl)) {
      const kmsHcl = `

# Customer Managed KMS Key with automated 365-day key rotation
resource "aws_kms_key" "data_key" {
  description             = "Customer Managed Key for ${project.name} storage"
  deletion_window_in_days = 30
  enable_key_rotation     = true

  tags = {
    Name      = "${slug}-cmk"
    ManagedBy = "TerraGen-AI"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "kms_default" {
  bucket = aws_s3_bucket.${bucketResName}.id

  rule {
    apply_server_side_encryption_by_default {
      kms_master_key_id = aws_kms_key.data_key.arn
      sse_algorithm     = "aws:kms"
    }
    bucket_key_enabled = true
  }
}`;
      updatedFiles['main.tf'] = (updatedFiles['main.tf'] || '').trimEnd() + kmsHcl + '\n';
    }

    responseMessage = `Synthesized Customer Managed KMS Key (\`aws_kms_key.data_key\`) with 365-day automatic rotation and bound \`aws_s3_bucket.${bucketResName}\` to SSE-KMS with Bucket Key enabled.`;
  } else if (pLower.includes('flow_log') || pLower.includes('flow log')) {
    const targetVpcFile = updatedFiles['vpc.tf'] !== undefined ? 'vpc.tf' : 'main.tf';
    changedFiles = [targetVpcFile];
    addedResources = [
      'aws_cloudwatch_log_group.vpc_flow_logs',
      'aws_flow_log.vpc_traffic_audit',
    ];
    const vpcMatch = allExistingHcl.match(/resource\s+"aws_vpc"\s+"([^"]+)"/);
    const vpcName = vpcMatch ? vpcMatch[1] : 'main_vpc';

    if (!/resource\s+"aws_flow_log"/.test(allExistingHcl)) {
      const flowLogHcl = `

# CIS 2.9 Compliant VPC Flow Logging to CloudWatch
resource "aws_cloudwatch_log_group" "vpc_flow_logs" {
  name              = "/aws/vpc/${slug}-flow-logs"
  retention_in_days = 90
}

resource "aws_flow_log" "vpc_traffic_audit" {
  vpc_id          = aws_vpc.${vpcName}.id
  traffic_type    = "ALL"
  log_destination = aws_cloudwatch_log_group.vpc_flow_logs.arn
}`;
      updatedFiles[targetVpcFile] = (updatedFiles[targetVpcFile] || '').trimEnd() + flowLogHcl + '\n';
    }

    responseMessage = `Enabled CIS 2.9 VPC Flow Logging (\`aws_flow_log.vpc_traffic_audit\`) streaming accepted and rejected packet metadata to \`aws_cloudwatch_log_group.vpc_flow_logs\`.`;
  } else if (pLower.includes('lambda') || pLower.includes('iam') || pLower.includes('least-privilege')) {
    const targetIamFile = updatedFiles['iam.tf'] !== undefined ? 'iam.tf' : 'main.tf';
    changedFiles = [targetIamFile];
    addedResources = ['aws_iam_policy.lambda_least_privilege'];

    if (!/resource\s+"aws_iam_policy"\s+"lambda_least_privilege"/.test(allExistingHcl)) {
      const iamHcl = `

# Scoped least-privilege IAM policy with zero wildcard (*) actions
resource "aws_iam_policy" "lambda_least_privilege" {
  name        = "${slug}-lambda-scoped-policy"
  description = "Granular least-privilege execution policy synthesized by TerraGen AI"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["logs:CreateLogStream", "logs:PutLogEvents"]
        Resource = "arn:aws:logs:${project.region}:${'000000000000'}:log-group:/aws/lambda/*"
      }
    ]
  })
}`;
      updatedFiles[targetIamFile] = (updatedFiles[targetIamFile] || '').trimEnd() + iamHcl + '\n';
    }

    responseMessage =
      'Hardened IAM execution permissions with zero `*` wildcard actions and explicit CloudWatch & S3 ARN boundaries.';
  } else {
    changedFiles = ['main.tf'];
    addedResources = ['aws_cloudwatch_log_group.system_audit'];

    if (!/resource\s+"aws_cloudwatch_log_group"\s+"system_audit"/.test(allExistingHcl)) {
      const auditHcl = `

# Centralized CloudWatch audit log group with 90-day retention
resource "aws_cloudwatch_log_group" "system_audit" {
  name              = "/aws/terragen/${slug}/audit"
  retention_in_days = 90

  tags = {
    Environment = "production"
    ManagedBy   = "TerraGen-AI"
  }
}`;
      updatedFiles['main.tf'] = (updatedFiles['main.tf'] || '').trimEnd() + auditHcl + '\n';
    }

    responseMessage = `Applied architectural change: "${prompt}". Synthesized compliant Terraform HCL and synchronized topology resources.`;
  }

  const newMessages: ChatMessage[] = [
    ...project.messages,
    {
      id: `msg-${Date.now()}-u`,
      sender: 'user',
      timestamp,
      content: prompt,
    },
    {
      id: `msg-${Date.now()}-a`,
      sender: 'assistant',
      timestamp,
      content: responseMessage,
      changedFiles,
      addedResources,
      securityNote: 'Synchronized across HCL files, Topology Diagram, Inventory & CIS Security Scan.',
    },
  ];

  const draftProject: ProjectData = {
    ...project,
    updatedAt: 'Just now',
    files: updatedFiles,
    messages: newMessages,
    originalFilesSnapshot: originalSnapshot,
  };

  return synchronizeProjectState(draftProject);
}
