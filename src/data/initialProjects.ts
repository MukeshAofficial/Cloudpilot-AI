import { ProjectData } from '../types/workspace';

export const INITIAL_PROJECTS: ProjectData[] = [
  {
    id: 'proj-serverless-vpc',
    name: 'Production VPC & Serverless API',
    description: 'High-availability multi-tier architecture with VPC, private subnet isolated Lambda, S3, and least-privilege IAM.',
    region: 'us-east-1',
    updatedAt: '2 mins ago',
    activeFileName: 'main.tf',
    files: {
      'main.tf': `terraform {
  required_version = ">= 1.8.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.40"
    }
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Environment = var.environment
      ManagedBy   = "TerraGen-AI"
      Project     = "CloudPilot-Production"
    }
  }
}

# Lambda function running inside VPC private subnet
resource "aws_lambda_function" "order_processor" {
  function_name = "\${var.environment}-order-processor"
  role          = aws_iam_role.lambda_exec.arn
  handler       = "index.handler"
  runtime       = "nodejs20.x"
  timeout       = 15
  memory_size   = 256

  vpc_config {
    subnet_ids         = [aws_subnet.private_subnet_a.id]
    security_group_ids = [aws_security_group.lambda_sg.id]
  }

  tracing_config {
    mode = "Active"
  }

  environment {
    variables = {
      ASSETS_BUCKET = aws_s3_bucket.primary_storage.id
      ENV           = var.environment
    }
  }
}

# Primary S3 bucket with strict security defaults
resource "aws_s3_bucket" "primary_storage" {
  bucket        = "cloudpilot-prod-app-assets-\${var.environment}"
  force_destroy = false
}

resource "aws_s3_bucket_public_access_block" "storage_block" {
  bucket = aws_s3_bucket.primary_storage.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# CloudWatch log group for Lambda telemetry
resource "aws_cloudwatch_log_group" "lambda_logs" {
  name              = "/aws/lambda/\${aws_lambda_function.order_processor.function_name}"
  retention_in_days = 30
}`,
      'vpc.tf': `# VPC Network Infrastructure
resource "aws_vpc" "main_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "\${var.environment}-vpc"
  }
}

resource "aws_internet_gateway" "main_igw" {
  vpc_id = aws_vpc.main_vpc.id

  tags = {
    Name = "\${var.environment}-igw"
  }
}

# Public Subnet tier
resource "aws_subnet" "public_subnet_a" {
  vpc_id                  = aws_vpc.main_vpc.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "\${var.aws_region}a"
  map_public_ip_on_launch = false

  tags = {
    Name = "\${var.environment}-public-a"
    Tier = "Public"
  }
}

# Private Subnet tier (No direct public route)
resource "aws_subnet" "private_subnet_a" {
  vpc_id                  = aws_vpc.main_vpc.id
  cidr_block              = "10.0.2.0/24"
  availability_zone       = "\${var.aws_region}a"
  map_public_ip_on_launch = false

  tags = {
    Name = "\${var.environment}-private-a"
    Tier = "Private"
  }
}

# Security group with restricted ingress
resource "aws_security_group" "lambda_sg" {
  name        = "\${var.environment}-lambda-sg"
  description = "Restricted ingress/egress for private compute"
  vpc_id      = aws_vpc.main_vpc.id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "\${var.environment}-lambda-sg"
  }
}`,
      'iam.tf': `# IAM Execution Roles & Policies
data "aws_iam_policy_document" "lambda_assume_role" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "lambda_exec" {
  name               = "\${var.environment}-order-processor-role"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume_role.json
}

# Attach AWS managed VPC execution policy
resource "aws_iam_role_policy_attachment" "lambda_vpc" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"
}

# Tightly scoped policy for S3 bucket access - NO WILDCARDS
resource "aws_iam_policy" "s3_access" {
  name = "\${var.environment}-lambda-s3-scoped"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["s3:GetObject", "s3:PutObject"]
        Resource = "\${aws_s3_bucket.primary_storage.arn}/*"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "s3_attach" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = aws_iam_policy.s3_access.arn
}`,
      'variables.tf': `variable "aws_region" {
  type        = string
  description = "Target AWS Region"
  default     = "us-east-1"
}

variable "environment" {
  type        = string
  description = "Target deployment environment"
  default     = "production"
}`,
      'outputs.tf': `output "vpc_id" {
  description = "Identifier of the created VPC"
  value       = aws_vpc.main_vpc.id
}

output "lambda_arn" {
  description = "ARN of the order processor function"
  value       = aws_lambda_function.order_processor.arn
}

output "s3_bucket_name" {
  description = "Name of the secure storage bucket"
  value       = aws_s3_bucket.primary_storage.id
}`,
    },
    messages: [
      {
        id: 'msg-init-1',
        sender: 'assistant',
        timestamp: '10:00 AM',
        content:
          'Welcome to the TerraGen AI Workspace. I have initialized your project with a multi-tier production VPC, isolated private subnet Lambda, S3 public access block, and least-privilege IAM policies. What architectural changes would you like to make?',
        changedFiles: ['main.tf', 'vpc.tf', 'iam.tf', 'variables.tf', 'outputs.tf'],
        addedResources: ['aws_vpc', 'aws_subnet', 'aws_lambda_function', 'aws_s3_bucket', 'aws_iam_role'],
        securityNote: 'Default encryption and CIS Benchmark 1.2 rules enforced.',
      },
    ],
    nodes: [
      {
        id: 'region-group',
        type: 'regionNode',
        position: { x: 40, y: 30 },
        data: { label: 'AWS Region: us-east-1' },
      },
      {
        id: 'vpc-main',
        type: 'vpcNode',
        position: { x: 70, y: 90 },
        data: {
          label: 'VPC: 10.0.0.0/16',
          name: 'production-vpc',
          cidr: '10.0.0.0/16',
          file: 'vpc.tf',
        },
      },
      {
        id: 'igw-main',
        type: 'awsNode',
        position: { x: 100, y: 150 },
        data: {
          label: 'Internet Gateway',
          service: 'network',
          category: 'AWS IGW',
          arn: 'arn:aws:ec2:us-east-1:123456789012:internet-gateway/igw-08a912',
          details: 'Direct internet connectivity for public subnets',
          status: 'valid',
          file: 'vpc.tf',
        },
      },
      {
        id: 'subnet-pub-1',
        type: 'awsNode',
        position: { x: 320, y: 150 },
        data: {
          label: 'Public Subnet (10.0.1.0/24)',
          service: 'network',
          category: 'AWS Subnet',
          arn: 'arn:aws:ec2:us-east-1:123456789012:subnet/subnet-01public',
          details: 'Subnet tier with map_public_ip_on_launch = false',
          status: 'valid',
          file: 'vpc.tf',
        },
      },
      {
        id: 'subnet-priv-1',
        type: 'awsNode',
        position: { x: 320, y: 280 },
        data: {
          label: 'Private Subnet (10.0.2.0/24)',
          service: 'network',
          category: 'AWS Subnet',
          arn: 'arn:aws:ec2:us-east-1:123456789012:subnet/subnet-02private',
          details: 'Isolated network tier with zero direct internet access',
          status: 'valid',
          file: 'vpc.tf',
        },
      },
      {
        id: 'lambda-1',
        type: 'awsNode',
        position: { x: 570, y: 280 },
        data: {
          label: 'Lambda: order-processor',
          service: 'compute',
          category: 'AWS Lambda',
          arn: 'arn:aws:lambda:us-east-1:123456789012:function:order-processor',
          details: 'Node.js 20.x runtime inside VPC private subnet with active X-Ray tracing',
          status: 'valid',
          file: 'main.tf',
        },
      },
      {
        id: 's3-bucket-1',
        type: 'awsNode',
        position: { x: 800, y: 280 },
        data: {
          label: 'S3: app-assets-prod',
          service: 'storage',
          category: 'Amazon S3',
          arn: 'arn:aws:s3:::cloudpilot-prod-app-assets',
          details: 'Block all public access enabled, private object ACLs',
          status: 'valid',
          file: 'main.tf',
        },
      },
      {
        id: 'iam-role-1',
        type: 'awsNode',
        position: { x: 570, y: 150 },
        data: {
          label: 'IAM: order-processor-role',
          service: 'security',
          category: 'AWS IAM',
          arn: 'arn:aws:iam::123456789012:role/order-processor-role',
          details: 'Scoped least-privilege policy without wildcard statements',
          status: 'valid',
          file: 'iam.tf',
        },
      },
      {
        id: 'cloudwatch-1',
        type: 'awsNode',
        position: { x: 570, y: 410 },
        data: {
          label: 'CloudWatch: /aws/lambda/logs',
          service: 'observability',
          category: 'AWS CloudWatch',
          arn: 'arn:aws:logs:us-east-1:123456789012:log-group:/aws/lambda/order-processor',
          details: '30-day retention with error alarm metric filters',
          status: 'valid',
          file: 'main.tf',
        },
      },
    ],
    edges: [
      { id: 'e-igw-pub', source: 'igw-main', target: 'subnet-pub-1', animated: true, style: { stroke: '#38BDF8' } },
      { id: 'e-pub-priv', source: 'subnet-pub-1', target: 'subnet-priv-1', style: { stroke: '#475569' } },
      { id: 'e-priv-lambda', source: 'subnet-priv-1', target: 'lambda-1', animated: true, style: { stroke: '#06B6D4' } },
      { id: 'e-iam-lambda', source: 'iam-role-1', target: 'lambda-1', style: { stroke: '#E11D48', strokeDasharray: '4 4' } },
      { id: 'e-lambda-s3', source: 'lambda-1', target: 's3-bucket-1', animated: true, style: { stroke: '#10B981' } },
      { id: 'e-lambda-cw', source: 'lambda-1', target: 'cloudwatch-1', style: { stroke: '#F59E0B' } },
    ],
    resources: [
      {
        id: 'res-vpc',
        name: 'main_vpc',
        type: 'aws_vpc',
        service: 'vpc',
        arn: 'arn:aws:ec2:us-east-1:123456789012:vpc/vpc-0981a',
        file: 'vpc.tf',
        lineNumber: 2,
        status: 'valid',
        encryption: 'default',
        exposure: 'private',
        attributes: { cidr_block: '10.0.0.0/16', enable_dns_hostnames: true },
      },
      {
        id: 'res-lambda',
        name: 'order_processor',
        type: 'aws_lambda_function',
        service: 'compute',
        arn: 'arn:aws:lambda:us-east-1:123456789012:function:order_processor',
        file: 'main.tf',
        lineNumber: 23,
        status: 'valid',
        encryption: 'default',
        exposure: 'private',
        attributes: { runtime: 'nodejs20.x', memory: 256, timeout: 15 },
      },
      {
        id: 'res-s3',
        name: 'primary_storage',
        type: 'aws_s3_bucket',
        service: 'storage',
        arn: 'arn:aws:s3:::cloudpilot-prod-app-assets',
        file: 'main.tf',
        lineNumber: 47,
        status: 'valid',
        encryption: 'default',
        exposure: 'private',
        attributes: { public_access_block: true, versioning: true },
      },
      {
        id: 'res-iam',
        name: 'lambda_exec',
        type: 'aws_iam_role',
        service: 'security',
        arn: 'arn:aws:iam::123456789012:role/lambda_exec',
        file: 'iam.tf',
        lineNumber: 12,
        status: 'valid',
        encryption: 'none',
        exposure: 'private',
        attributes: { assume_role: 'lambda.amazonaws.com', wildcard_free: true },
      },
    ],
    securityFindings: [
      {
        id: 'f-1',
        rule: 'CIS 2.1.1 - S3 Bucket Server-Side Encryption',
        severity: 'medium',
        category: 'Encryption',
        status: 'warning',
        resourceId: 'aws_s3_bucket.primary_storage',
        description: 'S3 bucket uses default AWS encryption instead of Customer-Managed Key (KMS CMK).',
        remediationPrompt: 'Enable customer-managed KMS encryption on S3 primary storage.',
      },
      {
        id: 'f-2',
        rule: 'CIS 2.9 - VPC Flow Logs Enabled',
        severity: 'low',
        category: 'Logging',
        status: 'passed',
        resourceId: 'aws_vpc.main_vpc',
        description: 'VPC network traffic flow is recorded to CloudWatch logs.',
        remediationPrompt: 'Configure aws_flow_log on main_vpc.',
      },
      {
        id: 'f-3',
        rule: 'CIS 1.16 - IAM Zero Wildcard Actions',
        severity: 'high',
        category: 'IAM',
        status: 'passed',
        resourceId: 'aws_iam_policy.s3_access',
        description: 'All IAM actions are strictly scoped without unrestricted * wildcards.',
        remediationPrompt: 'Scope down IAM actions to specific ARNs.',
      },
    ],
  },
  {
    id: 'proj-kms-lake',
    name: 'Hardened S3 Data Lake with KMS',
    description: 'Enterprise object storage with customer-managed KMS keys, bucket keying, TLS 1.3 enforcement, and audit logs.',
    region: 'us-east-1',
    updatedAt: '1 hour ago',
    activeFileName: 'main.tf',
    files: {
      'main.tf': `terraform {
  required_version = ">= 1.8.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.40"
    }
  }
}

resource "aws_kms_key" "datalake_key" {
  description             = "Customer Managed Key for Data Lake"
  deletion_window_in_days = 30
  enable_key_rotation     = true

  tags = {
    ManagedBy = "TerraGen-AI"
  }
}

resource "aws_s3_bucket" "datalake" {
  bucket        = "cloudpilot-secure-lake-prod"
  force_destroy = false
}

resource "aws_s3_bucket_server_side_encryption_configuration" "kms_enc" {
  bucket = aws_s3_bucket.datalake.id

  rule {
    apply_server_side_encryption_by_default {
      kms_master_key_id = aws_kms_key.datalake_key.arn
      sse_algorithm     = "aws:kms"
    }
    bucket_key_enabled = true
  }
}

resource "aws_s3_bucket_public_access_block" "block" {
  bucket = aws_s3_bucket.datalake.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}`,
      'variables.tf': `variable "aws_region" {
  type    = string
  default = "us-east-1"
}`,
      'outputs.tf': `output "kms_key_arn" {
  value = aws_kms_key.datalake_key.arn
}

output "bucket_id" {
  value = aws_s3_bucket.datalake.id
}`,
    },
    messages: [
      {
        id: 'msg-lake-1',
        sender: 'assistant',
        timestamp: '9:30 AM',
        content: 'Data Lake project initialized with Customer Managed KMS Key (CMK) and strict public access block.',
        changedFiles: ['main.tf', 'variables.tf', 'outputs.tf'],
        addedResources: ['aws_kms_key', 'aws_s3_bucket'],
      },
    ],
    nodes: [
      {
        id: 'kms-lake-1',
        type: 'awsNode',
        position: { x: 200, y: 150 },
        data: {
          label: 'AWS KMS Key (CMK)',
          service: 'security',
          category: 'AWS KMS',
          arn: 'arn:aws:kms:us-east-1:123456789012:key/lake-key-1',
          details: 'Automatic 365-day rotation with bucket key enabled',
          status: 'valid',
          file: 'main.tf',
        },
      },
      {
        id: 's3-lake-1',
        type: 'awsNode',
        position: { x: 500, y: 150 },
        data: {
          label: 'S3: Data Lake Storage',
          service: 'storage',
          category: 'Amazon S3',
          arn: 'arn:aws:s3:::cloudpilot-secure-lake-prod',
          details: 'Server-side encrypted at rest with customer KMS key',
          status: 'valid',
          file: 'main.tf',
        },
      },
    ],
    edges: [
      { id: 'e-kms-lake', source: 'kms-lake-1', target: 's3-lake-1', animated: true, style: { stroke: '#A855F7' } },
    ],
    resources: [
      {
        id: 'res-kms',
        name: 'datalake_key',
        type: 'aws_kms_key',
        service: 'security',
        arn: 'arn:aws:kms:us-east-1:123456789012:key/lake-key-1',
        file: 'main.tf',
        lineNumber: 12,
        status: 'valid',
        encryption: 'kms',
        exposure: 'private',
        attributes: { rotation: true, deletion_window: 30 },
      },
      {
        id: 'res-lake-s3',
        name: 'datalake',
        type: 'aws_s3_bucket',
        service: 'storage',
        arn: 'arn:aws:s3:::cloudpilot-secure-lake-prod',
        file: 'main.tf',
        lineNumber: 22,
        status: 'valid',
        encryption: 'kms',
        exposure: 'private',
        attributes: { bucket_key: true, public_access_block: true },
      },
    ],
    securityFindings: [
      {
        id: 'f-lake-1',
        rule: 'CIS 2.1.1 - S3 Bucket Server-Side Encryption',
        severity: 'high',
        category: 'Encryption',
        status: 'passed',
        resourceId: 'aws_s3_bucket.datalake',
        description: 'S3 bucket is encrypted using Customer Managed Key (CMK).',
        remediationPrompt: '',
      },
    ],
  },
];
