import { AwsServiceNode, CloudTalkScenario, TerraGenTemplate } from '../types';

export const AWS_SERVICE_NODES: AwsServiceNode[] = [
  {
    id: 'lambda',
    name: 'AWS Lambda',
    category: 'compute',
    icon: 'Terminal',
    x: 48,
    y: 20,
    description: 'Serverless event execution with sub-second cold start tracking',
    samplePrompt: 'Why did order-processor error spike at 14:02 UTC?',
    status: 'analyzing',
  },
  {
    id: 's3',
    name: 'Amazon S3',
    category: 'storage',
    icon: 'Database',
    x: 80,
    y: 28,
    description: 'Object storage with automatic KMS key rotation and lifecycle audits',
    samplePrompt: 'Find public bucket ACL drift and unencrypted storage',
    status: 'active',
  },
  {
    id: 'vpc',
    name: 'Amazon VPC',
    category: 'network',
    icon: 'Network',
    x: 22,
    y: 35,
    description: 'Isolated virtual networks with flow log packet analysis',
    samplePrompt: 'Inspect rejected ingress packets on TCP port 443',
    status: 'optimized',
  },
  {
    id: 'iam',
    name: 'AWS IAM',
    category: 'security',
    icon: 'ShieldCheck',
    x: 75,
    y: 72,
    description: 'Role-based access control with least-privilege policy generation',
    samplePrompt: 'Prune unused wildcard permissions on staging roles',
    status: 'active',
  },
  {
    id: 'cloudwatch',
    name: 'CloudWatch',
    category: 'observability',
    icon: 'Activity',
    x: 18,
    y: 70,
    description: 'Log aggregation, metric alarms, and synthetic trace correlations',
    samplePrompt: 'Filter ERROR traces across all container log groups',
    status: 'analyzing',
  },
  {
    id: 'rds',
    name: 'Amazon RDS',
    category: 'database',
    icon: 'Layers',
    x: 45,
    y: 84,
    description: 'Multi-AZ relational databases with automated snapshot policies',
    samplePrompt: 'Detect slow queries and IOPS bottleneck thresholds',
    status: 'optimized',
  },
  {
    id: 'ec2',
    name: 'Amazon EC2',
    category: 'compute',
    icon: 'Server',
    x: 86,
    y: 50,
    description: 'Elastic compute capacity with EBS volume rightsizing',
    samplePrompt: 'Find detached gp3 volumes and idle t3.xlarge instances',
    status: 'active',
  },
];

export const CLOUDTALK_SCENARIOS: CloudTalkScenario[] = [
  {
    id: 'lambda-error-spike',
    query: 'Why did Lambda invoke error rate spike at 14:00?',
    targetService: 'AWS Lambda · us-east-1',
    category: 'Incident Diagnosis',
    timeframe: 'Oct 28, 14:00 - 14:15 UTC',
    summary: 'Detected a 340% error rate increase caused by downstream DynamoDB ProvisionedThroughputExceededException on table `orders-v2`.',
    steps: [
      {
        title: 'CloudWatch Metric Anomaly Detected',
        detail: 'Lambda metric `Errors` jumped from 0.02% to 14.8% at 14:02 UTC across 12 concurrent warm containers.',
        type: 'metric',
      },
      {
        title: 'Log Group Log Stream Inspection',
        detail: 'Extracted 1,420 ERROR log events in `/aws/lambda/checkout-order-processor`. Key error stack: `DynamoDB: ProvisionedThroughputExceededException (HTTP 400)`.',
        type: 'log',
      },
      {
        title: 'Root Cause & IAM Verification',
        detail: 'DynamoDB table read capacity was capped at 50 RCU while incoming traffic surged to 320 RCU. IAM execution role is healthy.',
        type: 'iam',
      },
      {
        title: 'Instant Remediation Proposal',
        detail: 'Enable on-demand billing mode (`billing_mode = "PAY_PER_REQUEST"`) or raise auto-scaling target from 50 to 500 RCU.',
        type: 'remediation',
      },
    ],
    verdict: 'Downstream capacity exhaustion in DynamoDB, not application code failure.',
    impact: 'Estimated cost to resolve: ~$0.004/hr with zero downtime.',
  },
  {
    id: 'ebs-unattached-audit',
    query: 'Find unattached EBS volumes and open security groups',
    targetService: 'Amazon EC2 & VPC · Global',
    category: 'Cost & Security Audit',
    timeframe: 'Live Scan across all active regions',
    summary: 'Identified 8 unattached gp2/gp3 volumes incurring $412/month and 2 security groups permitting unrestricted SSH (0.0.0.0/0).',
    steps: [
      {
        title: 'EC2 DescribeVolumes Inventory',
        detail: 'Queried status = `available`. Found 8 volumes unattached for > 30 days totaling 3.2 TB with no snapshot activity.',
        type: 'metric',
      },
      {
        title: 'Security Group Ingress Rule Analysis',
        detail: 'SG `sg-0a4b791fc2` allows port 22 (SSH) and port 3389 (RDP) from `0.0.0.0/0`. Violates CIS AWS Benchmark 4.1.',
        type: 'iam',
      },
      {
        title: 'Snapshot & Cost Prevention Protocol',
        detail: 'CloudPilot generated a safe snapshot command for all 8 volumes before deletion, preventing accidental data loss.',
        type: 'log',
      },
      {
        title: 'Single-Command Cleanup Script',
        detail: 'Ready-to-run AWS CLI and Terraform removal block with restrictive CIDR rule to corporate VPN gateway.',
        type: 'remediation',
      },
    ],
    verdict: 'Immediate cost reduction opportunity and critical perimeter hardening.',
    impact: 'Recovers $4,944/year and closes public attack vectors.',
  },
  {
    id: 'vpc-flow-rejections',
    query: 'Explain VPC flow log connection rejections on port 443',
    targetService: 'Amazon VPC · eu-west-1',
    category: 'Network Inspection',
    timeframe: 'Past 60 minutes',
    summary: 'Analyzed 45,000 flow log records. Traffic from API Gateway VPC Link was dropped by Network ACL rule #100 on private subnet-08c.',
    steps: [
      {
        title: 'VPC Flow Log Ingestion',
        detail: 'Filtered `action = REJECT` on destination port 443. High density of TCP SYN packets from CIDR 10.0.16.0/20.',
        type: 'log',
      },
      {
        title: 'Network ACL vs Security Group Trace',
        detail: 'Security Group ingress allows 443 from all internal VPC subnets. Rejection occurs upstream at the stateless subnet NACL boundary.',
        type: 'metric',
      },
      {
        title: 'Ephemeral Return Port Conflict',
        detail: 'Outbound ephemeral ports (1024-65535) were blocked in NACL outbound rule table, preventing return ACK packets.',
        type: 'iam',
      },
      {
        title: 'Remediation Rule Injection',
        detail: 'Add NACL rule 110: ALLOW TCP ports 1024-65535 egress on private subnet route table.',
        type: 'remediation',
      },
    ],
    verdict: 'Stateless NACL outbound ephemeral port blockage, not routing table failure.',
    impact: 'Restores inter-service API traffic in seconds.',
  },
];

export const TERRAGEN_TEMPLATES: TerraGenTemplate[] = [
  {
    id: 'vpc-secure',
    title: 'High-Availability Multi-AZ VPC',
    description: 'Isolated network architecture with public/private tiering, redundant NAT gateways, and VPC Flow Logs enabled.',
    naturalPrompt: 'Create a production-grade VPC in us-east-1 across 3 availability zones with private subnets, dual NAT gateways, and strict flow log logging to CloudWatch.',
    securityBadges: ['KMS Encrypted Logs', 'Private Subnet Isolated', 'Zero 0.0.0.0/0 Ingress', 'CIS Benchmark 1.2'],
    hclCode: `terraform {
  required_version = ">= 1.8.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.40"
    }
  }
}

# High-Availability VPC generated by CloudPilot AI TerraGen
resource "aws_vpc" "production" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name        = "cloudpilot-prod-vpc"
    Environment = "production"
    ManagedBy   = "CloudPilot-AI"
  }
}

# Private Subnets for secure compute & databases (No direct internet exposure)
resource "aws_subnet" "private_tier" {
  count             = 3
  vpc_id            = aws_vpc.production.id
  cidr_block        = cidrsubnet(aws_vpc.production.cidr_block, 4, count.index)
  availability_zone = data.aws_availability_zones.available.names[count.index]

  map_public_ip_on_launch = false

  tags = {
    Name = "cloudpilot-private-az\${count.index + 1}"
    Tier = "Private"
  }
}

# KMS Key for Flow Log Encryption at Rest
resource "aws_kms_key" "flow_logs_key" {
  description             = "CloudPilot customer-managed key for VPC flow logs"
  deletion_window_in_days = 30
  enable_key_rotation     = true

  tags = {
    ManagedBy = "CloudPilot-AI"
  }
}

# Flow Logs targeting CloudWatch with strict IAM role
resource "aws_flow_log" "vpc_traffic_audit" {
  iam_role_arn    = aws_iam_role.flow_logs_writer.arn
  log_destination = aws_cloudwatch_log_group.vpc_flow.arn
  traffic_type    = "ALL"
  vpc_id          = aws_vpc.production.id
}`,
    complianceNotes: [
      {
        category: 'Network Tiering',
        details: 'Compute instances launch with map_public_ip_on_launch = false in strictly isolated private subnets.',
        status: 'pass',
      },
      {
        category: 'Encryption at Rest',
        details: 'Flow logs stored in CloudWatch encrypted using an AWS KMS Customer Managed Key with 365-day rotation.',
        status: 'pass',
      },
      {
        category: 'Auditability',
        details: 'ALL traffic (ACCEPT and REJECT) captured for compliance auditing and incident forensics.',
        status: 'pass',
      },
    ],
  },
  {
    id: 's3-lake',
    title: 'Hardened S3 Data Lake with KMS',
    description: 'Object storage with default KMS key encryption, strict public access blocks, versioning, and bucket logging.',
    naturalPrompt: 'Set up an enterprise-grade S3 data lake bucket with customer-managed KMS encryption, TLS 1.3 enforcement, and all public access blocked.',
    securityBadges: ['KMS CMK Encryption', 'Block All Public Access', 'TLS 1.2+ Enforced', 'Bucket Versioning'],
    hclCode: `resource "aws_kms_key" "datalake_key" {
  description             = "Customer Managed Key for Data Lake storage"
  deletion_window_in_days = 30
  enable_key_rotation     = true

  tags = {
    ManagedBy = "CloudPilot-AI"
  }
}

resource "aws_s3_bucket" "datalake" {
  bucket        = "cloudpilot-secure-datalake-prod"
  force_destroy = false

  tags = {
    Environment = "production"
    ManagedBy   = "CloudPilot-AI"
  }
}

# Enforce Customer Managed KMS Encryption
resource "aws_s3_bucket_server_side_encryption_configuration" "kms_encryption" {
  bucket = aws_s3_bucket.datalake.id

  rule {
    apply_server_side_encryption_by_default {
      kms_master_key_id = aws_kms_key.datalake_key.arn
      sse_algorithm     = "aws:kms"
    }
    bucket_key_enabled = true
  }
}

# Strict Public Access Block (CIS AWS Benchmark 2.1.5)
resource "aws_s3_bucket_public_access_block" "security_block" {
  bucket = aws_s3_bucket.datalake.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Enforce In-Transit TLS 1.2+ HTTPS Only
resource "aws_s3_bucket_policy" "enforce_tls" {
  bucket = aws_s3_bucket.datalake.id
  policy = data.aws_iam_policy_document.deny_insecure_transport.json
}`,
    complianceNotes: [
      {
        category: 'Access Restriction',
        details: 'All four public access block flags are set to true, preventing accidental external exposure.',
        status: 'pass',
      },
      {
        category: 'Data Protection',
        details: 'Dual protection: Server-side KMS encryption at rest plus bucket policy denying any non-TLS connection.',
        status: 'pass',
      },
      {
        category: 'Durability',
        details: 'Bucket key enabled to reduce KMS API costs by up to 99% while maintaining cryptographic isolation.',
        status: 'pass',
      },
    ],
  },
  {
    id: 'serverless-api',
    title: 'Zero-Trust Serverless API & IAM',
    description: 'API Gateway HTTP API routed to Lambda with tightly scoped IAM roles, zero wildcard permissions, and X-Ray tracing.',
    naturalPrompt: 'Generate a serverless API Gateway connected to an order processing Lambda with least-privilege IAM and active X-Ray tracing.',
    securityBadges: ['Least-Privilege IAM', 'No Wildcard Statements', 'AWS X-Ray Active', 'CloudWatch Logs Scoped'],
    hclCode: `data "aws_iam_policy_document" "lambda_trust" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "order_handler_role" {
  name               = "cloudpilot-order-handler-execution-role"
  assume_role_policy = data.aws_iam_policy_document.lambda_trust.json
}

# Tightly scoped IAM policy - ZERO WILDCARD ACTIONS
resource "aws_iam_policy" "scoped_execution" {
  name        = "cloudpilot-order-handler-least-privilege"
  description = "Tightly scoped policy generated by CloudPilot AI"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = [
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:*:*:log-group:/aws/lambda/order-handler:*"
      },
      {
        Effect   = "Allow"
        Action   = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem"
        ]
        Resource = "arn:aws:dynamodb:us-east-1:*:table/orders-production"
      }
    ]
  })
}

resource "aws_lambda_function" "order_handler" {
  function_name = "order-handler-production"
  role          = aws_iam_role.order_handler_role.arn
  handler       = "index.handler"
  runtime       = "nodejs20.x"

  tracing_config {
    mode = "Active"
  }
}`,
    complianceNotes: [
      {
        category: 'IAM Least Privilege',
        details: 'Zero wildcard permissions. DynamoDB actions are restricted solely to the orders table ARN.',
        status: 'pass',
      },
      {
        category: 'Observability',
        details: 'AWS X-Ray tracing mode set to Active for full distributed request telemetry.',
        status: 'pass',
      },
      {
        category: 'Runtime Integrity',
        details: 'Node.js 20.x runtime on Amazon Linux 2023 with minimal execution container attack surface.',
        status: 'pass',
      },
    ],
  },
];
