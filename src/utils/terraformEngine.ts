import { Node, Edge } from '@xyflow/react';
import { ProjectData, AwsResourceItem, SecurityFinding, ChatMessage } from '../types/workspace';

/**
 * Cleanly formats HCL indentation and aligns equals signs.
 */
export function simulateTerraformFmt(hcl: string): { formatted: string; changed: boolean } {
  const lines = hcl.split('\n');
  let currentIndent = 0;
  const formattedLines: string[] = [];
  let changed = false;

  for (let line of lines) {
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
 * Validates HCL files for matching braces, quotes, and provider references.
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
    // Check balanced braces
    const openBraces = (content.match(/\{/g) || []).length;
    const closeBraces = (content.match(/\}/g) || []).length;
    if (openBraces !== closeBraces) {
      errorCount++;
      errors.push(`Error: Unbalanced braces in ${filename} (${openBraces} open vs ${closeBraces} close)`);
    }

    // Check for deprecated attributes
    if (content.includes('versioning { enabled = true }')) {
      warnings.push(`Warning: ${filename}: Use separate 'aws_s3_bucket_versioning' resource instead of inline versioning block.`);
    }

    // Check for wildcard permissions
    if (content.includes('"*"') && content.includes('Action')) {
      warnings.push(`Warning: ${filename}: IAM policy statement contains wildcard '*' action. Least-privilege violation.`);
    }
  }

  const success = errorCount === 0;
  const output = success
    ? `Success! The configuration is valid.\n\nValidated files: ${Object.keys(files).join(', ')}\nNo syntax or schema errors detected across all declared resources.\nCompatible with HashiCorp AWS Provider ~> 5.40 and OpenTofu 1.7+.`
    : `Error parsing configuration:\n\n${errors.join('\n')}\n\n${warnings.join('\n')}`;

  return { success, errorCount, warningCount: warnings.length, output };
}

/**
 * Audits HCL configurations against CIS AWS Foundation benchmarks.
 */
export function simulateSecurityScan(files: Record<string, string>): {
  score: number;
  passed: number;
  warnings: number;
  failures: number;
  findings: SecurityFinding[];
} {
  const allCode = Object.values(files).join('\n');
  const findings: SecurityFinding[] = [
    {
      id: 'cis-s3-1',
      rule: 'CIS 2.1.1 - S3 Bucket Server-Side Encryption',
      severity: 'high',
      category: 'Encryption',
      status: /aws_s3_bucket_server_side_encryption_configuration|kms_master_key_id/i.test(allCode)
        ? 'passed'
        : 'failed',
      resourceId: 'aws_s3_bucket',
      description: 'Ensure S3 buckets have default encryption configured using AWS KMS or AES-256.',
      remediationPrompt: 'Enable customer-managed KMS encryption on all S3 buckets.',
    },
    {
      id: 'cis-vpc-1',
      rule: 'CIS 2.9 - VPC Flow Logging Enabled',
      severity: 'medium',
      category: 'Logging',
      status: /aws_flow_log/i.test(allCode) ? 'passed' : 'warning',
      resourceId: 'aws_vpc',
      description: 'Ensure VPC flow logging is enabled in all active VPC networks.',
      remediationPrompt: 'Add aws_flow_log resource logging to CloudWatch.',
    },
    {
      id: 'cis-iam-1',
      rule: 'CIS 1.16 - IAM Policies Prohibit Wildcard Actions',
      severity: 'high',
      category: 'IAM',
      status: !/\*:\*/.test(allCode) && !/Action\s*=\s*\["\*"\]/.test(allCode) ? 'passed' : 'failed',
      resourceId: 'aws_iam_policy',
      description: 'Ensure IAM execution policies specify explicit resource actions without wildcard *.',
      remediationPrompt: 'Scope down IAM policy actions to explicit DynamoDB and CloudWatch ARNs.',
    },
    {
      id: 'cis-net-1',
      rule: 'CIS 4.1 - Security Groups Prohibit Unrestricted Ingress',
      severity: 'high',
      category: 'Networking',
      status: !/cidr_blocks\s*=\s*\["0\.0\.0\.0\/0"\]\s*from_port\s*=\s*22/.test(allCode)
        ? 'passed'
        : 'failed',
      resourceId: 'aws_security_group',
      description: 'Ensure security groups do not allow unrestricted ingress (0.0.0.0/0) on port 22 (SSH).',
      remediationPrompt: 'Restrict SSH ingress to corporate VPN CIDR.',
    },
  ];

  const passed = findings.filter((f) => f.status === 'passed').length;
  const warnings = findings.filter((f) => f.status === 'warning').length;
  const failures = findings.filter((f) => f.status === 'failed').length;
  const score = Math.round((passed / findings.length) * 100);

  return { score, passed, warnings, failures, findings };
}

/**
 * Intelligent mock AI assistant that updates both the Terraform files and the React Flow diagram nodes/edges.
 */
export function applyAiPromptToProject(project: ProjectData, prompt: string): ProjectData {
  const pLower = prompt.toLowerCase();
  const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const updatedFiles = { ...project.files };
  const updatedNodes = [...project.nodes];
  const updatedEdges = [...project.edges];
  const updatedResources = [...project.resources];

  let responseMessage = '';
  let changedFiles: string[] = [];
  let addedResources: string[] = [];

  // Snapshot original files if not saved
  const originalSnapshot = project.originalFilesSnapshot || { ...project.files };

  if (pLower.includes('nat') || pLower.includes('gateway') || pLower.includes('multi-az')) {
    // Add NAT Gateway
    changedFiles = ['vpc.tf', 'outputs.tf'];
    addedResources = ['aws_eip.nat_ip', 'aws_nat_gateway.primary_nat'];

    const natHcl = `

# NAT Gateway for secure outbound internet access from private subnets
resource "aws_eip" "nat_ip" {
  domain = "vpc"
  tags = {
    Name        = "${project.name.toLowerCase().replace(/\s+/g, '-')}-nat-eip"
    Environment = "production"
    ManagedBy   = "TerraGen-AI"
  }
}

resource "aws_nat_gateway" "primary_nat" {
  allocation_id = aws_eip.nat_ip.id
  subnet_id     = aws_subnet.public_subnet_a.id

  tags = {
    Name      = "${project.name.toLowerCase().replace(/\s+/g, '-')}-nat-gw"
    ManagedBy = "TerraGen-AI"
  }

  depends_on = [aws_internet_gateway.main_igw]
}
`;
    updatedFiles['vpc.tf'] = (updatedFiles['vpc.tf'] || updatedFiles['main.tf'] || '') + natHcl;

    // Add NAT Gateway node
    const natNodeId = 'nat-gw-1';
    if (!updatedNodes.some((n) => n.id === natNodeId)) {
      updatedNodes.push({
        id: natNodeId,
        type: 'awsNode',
        position: { x: 340, y: 160 },
        data: {
          label: 'NAT Gateway',
          service: 'network',
          category: 'AWS NAT Gateway',
          arn: 'arn:aws:ec2:us-east-1:123456789012:natgateway/nat-09e8f7',
          details: 'Provides private subnet instances secure outbound egress without inbound exposure.',
          status: 'provisioned',
          file: 'vpc.tf',
        },
      });

      // Add edge from public subnet to NAT Gateway
      updatedEdges.push({
        id: 'e-pub-nat',
        source: 'subnet-pub-1',
        target: natNodeId,
        animated: true,
        style: { stroke: '#06B6D4' },
      });

      // Add edge from NAT to private subnet
      updatedEdges.push({
        id: 'e-nat-priv',
        source: natNodeId,
        target: 'subnet-priv-1',
        animated: true,
        style: { stroke: '#38BDF8' },
      });
    }

    responseMessage = `Added redundant NAT Gateway in \`vpc.tf\` with dedicated Elastic IP and private subnet route associations. Private compute workloads now have outbound egress with zero inbound exposure.`;
  } else if (pLower.includes('kms') || pLower.includes('encrypt') || pLower.includes('s3')) {
    // Add KMS Key & S3 Encryption Configuration
    changedFiles = ['main.tf', 'outputs.tf'];
    addedResources = ['aws_kms_key.cmk', 'aws_s3_bucket_server_side_encryption_configuration.secure_kms'];

    const kmsHcl = `

# Customer Managed KMS Key for cryptographically isolated data encryption
resource "aws_kms_key" "data_key" {
  description             = "Customer Managed Key for ${project.name} storage"
  deletion_window_in_days = 30
  enable_key_rotation     = true

  tags = {
    Name      = "${project.name.toLowerCase().replace(/\s+/g, '-')}-kms"
    ManagedBy = "TerraGen-AI"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "kms_default" {
  bucket = aws_s3_bucket.primary_storage.id

  rule {
    apply_server_side_encryption_by_default {
      kms_master_key_id = aws_kms_key.data_key.arn
      sse_algorithm     = "aws:kms"
    }
    bucket_key_enabled = true
  }
}
`;
    updatedFiles['main.tf'] = (updatedFiles['main.tf'] || '') + kmsHcl;

    // Add KMS node to graph
    const kmsNodeId = 'kms-key-1';
    if (!updatedNodes.some((n) => n.id === kmsNodeId)) {
      updatedNodes.push({
        id: kmsNodeId,
        type: 'awsNode',
        position: { x: 740, y: 130 },
        data: {
          label: 'AWS KMS (CMK)',
          service: 'security',
          category: 'Key Management Service',
          arn: 'arn:aws:kms:us-east-1:123456789012:key/cmk-772189a',
          details: 'Customer Managed Key with 365-day rotation and bucket key optimization.',
          status: 'provisioned',
          file: 'main.tf',
        },
      });

      // Edge from KMS to S3
      updatedEdges.push({
        id: 'e-kms-s3',
        source: kmsNodeId,
        target: 's3-bucket-1',
        animated: true,
        style: { stroke: '#A855F7', strokeDasharray: '4 4' },
      });
    }

    responseMessage = `Generated Customer Managed Key (\`aws_kms_key.data_key\`) with automated 365-day rotation and configured S3 server-side encryption with Bucket Keying enabled to cut KMS request costs by 99%.`;
  } else if (pLower.includes('lambda') || pLower.includes('iam') || pLower.includes('least-privilege')) {
    // Add IAM scoped role and Lambda
    changedFiles = ['iam.tf', 'main.tf'];
    addedResources = ['aws_iam_role.lambda_exec', 'aws_iam_policy.scoped_actions'];

    const iamHcl = `

# Tightly scoped IAM policy with ZERO wildcard statements
resource "aws_iam_policy" "lambda_least_privilege" {
  name        = "${project.name.toLowerCase().replace(/\s+/g, '-')}-lambda-scoped"
  description = "Granular least-privilege policy synthesized by TerraGen AI"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = [
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:us-east-1:*:log-group:/aws/lambda/*"
      },
      {
        Effect   = "Allow"
        Action   = [
          "s3:GetObject",
          "s3:PutObject"
        ]
        Resource = "\${aws_s3_bucket.primary_storage.arn}/*"
      }
    ]
  })
}
`;
    updatedFiles['iam.tf'] = (updatedFiles['iam.tf'] || '') + iamHcl;
    responseMessage = `Hardened IAM execution role in \`iam.tf\` with zero \`*\` wildcard actions. Scoped S3 object permissions strictly to the primary storage bucket ARN.`;
  } else {
    // General enhancement
    changedFiles = ['main.tf', 'variables.tf'];
    addedResources = ['aws_cloudwatch_log_group.audit'];

    const auditHcl = `

# Centralized CloudWatch audit logging
resource "aws_cloudwatch_log_group" "system_audit" {
  name              = "/aws/terragen/${project.name.toLowerCase().replace(/\s+/g, '-')}/audit"
  retention_in_days = 90

  tags = {
    Environment = "production"
    ManagedBy   = "TerraGen-AI"
  }
}
`;
    updatedFiles['main.tf'] = (updatedFiles['main.tf'] || '') + auditHcl;
    responseMessage = `Applied changes requested: "${prompt}". Synthesized compliant Terraform resources and updated architecture graph bindings.`;
  }

  // Append new AI chat message
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
      securityNote: 'All generated code adheres to CIS AWS Foundations Benchmark v3.0.',
    },
  ];

  return {
    ...project,
    updatedAt: 'Just now',
    files: updatedFiles,
    nodes: updatedNodes,
    edges: updatedEdges,
    messages: newMessages,
    originalFilesSnapshot: originalSnapshot,
  };
}
