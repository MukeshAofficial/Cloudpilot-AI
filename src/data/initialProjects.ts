import { ProjectData } from '../types/workspace';
import { synchronizeProjectState } from '../utils/terraformSync';

const RAW_PROJECTS: ProjectData[] = [
  {
    id: 'proj-serverless-vpc',
    name: 'Production VPC & Serverless API',
    description:
      'Simulated multi-tier AWS topology with VPC, Public/Private Subnets, IGW, Route Tables, Security Group, Lambda, S3, IAM, and CloudWatch.',
    region: 'us-east-1',
    updatedAt: 'Simulated sample',
    activeFileName: 'vpc.tf',
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
      Simulation  = "true"
    }
  }
}

# Lambda function attached to isolated VPC private subnet
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

# Primary S3 bucket with strict public access block
resource "aws_s3_bucket" "primary_storage" {
  bucket        = "cloudpilot-sim-app-assets-\${var.environment}"
  force_destroy = false
}

resource "aws_s3_bucket_public_access_block" "storage_block" {
  bucket = aws_s3_bucket.primary_storage.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# CloudWatch log group for structured Lambda telemetry
resource "aws_cloudwatch_log_group" "lambda_logs" {
  name              = "/aws/lambda/\${aws_lambda_function.order_processor.function_name}"
  retention_in_days = 30
}
`,
      'vpc.tf': `# VPC Network Topology (Simulated Sample Configuration)
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

# Public Subnet Tier (us-east-1a)
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

resource "aws_route_table" "public_rt" {
  vpc_id = aws_vpc.main_vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main_igw.id
  }

  tags = {
    Name = "\${var.environment}-public-rt"
  }
}

resource "aws_route_table_association" "public_assoc" {
  subnet_id      = aws_subnet.public_subnet_a.id
  route_table_id = aws_route_table.public_rt.id
}

# Private App Subnet Tier (us-east-1a - Zero Direct Internet Route)
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

resource "aws_route_table" "private_rt" {
  vpc_id = aws_vpc.main_vpc.id

  tags = {
    Name = "\${var.environment}-private-rt"
  }
}

resource "aws_route_table_association" "private_assoc" {
  subnet_id      = aws_subnet.private_subnet_a.id
  route_table_id = aws_route_table.private_rt.id
}

# Stateful Security Group for Private Lambda ENI
resource "aws_security_group" "lambda_sg" {
  name        = "\${var.environment}-lambda-sg"
  description = "Zero inbound rules; stateful HTTPS 443 egress for private compute"
  vpc_id      = aws_vpc.main_vpc.id

  egress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "\${var.environment}-lambda-sg"
  }
}
`,
      'iam.tf': `# IAM Execution Roles & Scoped Least-Privilege Policies
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

resource "aws_iam_role_policy_attachment" "lambda_vpc" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"
}

# Granular S3 object policy - Zero wildcard (*) actions
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
}
`,
      'variables.tf': `variable "aws_region" {
  type        = string
  description = "Simulated target AWS Region"
  default     = "us-east-1"
}

variable "environment" {
  type        = string
  description = "Deployment tier identifier"
  default     = "production"
}
`,
      'outputs.tf': `output "vpc_id" {
  description = "Simulated identifier of the created VPC"
  value       = aws_vpc.main_vpc.id
}

output "lambda_arn" {
  description = "Simulated ARN of the order processor Lambda"
  value       = aws_lambda_function.order_processor.arn
}

output "s3_bucket_name" {
  description = "Name of the private storage bucket"
  value       = aws_s3_bucket.primary_storage.id
}
`,
    },
    messages: [
      {
        id: 'msg-init-1',
        sender: 'assistant',
        timestamp: '10:00 AM',
        content:
          'Initialized simulated AWS topology from your Terraform HCL: Region `us-east-1`, VPC `10.0.0.0/16`, Public & Private Subnets, Internet Gateway, Route Tables, Security Group, isolated Lambda, S3, IAM, and CloudWatch. Try asking to add a NAT Gateway or KMS CMK encryption.',
        changedFiles: ['vpc.tf', 'main.tf', 'iam.tf', 'variables.tf', 'outputs.tf'],
        addedResources: [
          'aws_vpc.main_vpc',
          'aws_subnet.public_subnet_a',
          'aws_subnet.private_subnet_a',
          'aws_route_table.public_rt',
          'aws_route_table.private_rt',
          'aws_security_group.lambda_sg',
          'aws_lambda_function.order_processor',
          'aws_s3_bucket.primary_storage',
        ],
        securityNote: 'Simulated HCL model — no live AWS credentials or cloud connection used.',
      },
    ],
    nodes: [],
    edges: [],
    resources: [],
    securityFindings: [],
  },
  {
    id: 'proj-kms-lake',
    name: 'NAT Egress & Hardened KMS Data Lake',
    description:
      'Complete CIS-hardened topology with NAT Gateway private egress, KMS Customer Managed Key, S3 bucket keying, and VPC Flow Logs.',
    region: 'us-west-2',
    updatedAt: 'Simulated sample',
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
}

resource "aws_kms_key" "datalake_key" {
  description             = "Customer Managed Key for Data Lake encryption"
  deletion_window_in_days = 30
  enable_key_rotation     = true
}

resource "aws_s3_bucket" "datalake" {
  bucket        = "cloudpilot-sim-secure-lake-usw2"
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
}

resource "aws_lambda_function" "parquet_ingestor" {
  function_name = "datalake-parquet-ingestor"
  role          = aws_iam_role.ingestor_exec.arn
  handler       = "index.handler"
  runtime       = "python3.12"
  timeout       = 30
  memory_size   = 512

  vpc_config {
    subnet_ids         = [aws_subnet.private_subnet_a.id]
    security_group_ids = [aws_security_group.ingestor_sg.id]
  }

  tracing_config {
    mode = "Active"
  }
}

resource "aws_cloudwatch_log_group" "ingestor_logs" {
  name              = "/aws/lambda/datalake-parquet-ingestor"
  retention_in_days = 90
}
`,
      'vpc.tf': `resource "aws_vpc" "datalake_vpc" {
  cidr_block           = "10.20.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true
}

resource "aws_internet_gateway" "main_igw" {
  vpc_id = aws_vpc.datalake_vpc.id
}

resource "aws_subnet" "public_subnet_a" {
  vpc_id                  = aws_vpc.datalake_vpc.id
  cidr_block              = "10.20.1.0/24"
  availability_zone       = "us-west-2a"
  map_public_ip_on_launch = false

  tags = {
    Tier = "Public"
  }
}

resource "aws_eip" "nat_ip" {
  domain = "vpc"
}

resource "aws_nat_gateway" "primary_nat" {
  allocation_id     = aws_eip.nat_ip.id
  subnet_id         = aws_subnet.public_subnet_a.id
  connectivity_type = "public"
}

resource "aws_route_table" "public_rt" {
  vpc_id = aws_vpc.datalake_vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main_igw.id
  }
}

resource "aws_subnet" "private_subnet_a" {
  vpc_id                  = aws_vpc.datalake_vpc.id
  cidr_block              = "10.20.2.0/24"
  availability_zone       = "us-west-2a"
  map_public_ip_on_launch = false

  tags = {
    Tier = "Private"
  }
}

resource "aws_route_table" "private_rt" {
  vpc_id = aws_vpc.datalake_vpc.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.primary_nat.id
  }
}

resource "aws_security_group" "ingestor_sg" {
  name        = "datalake-ingestor-sg"
  description = "Private ETL security group with stateful HTTPS egress"
  vpc_id      = aws_vpc.datalake_vpc.id

  egress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_flow_log" "vpc_audit" {
  vpc_id          = aws_vpc.datalake_vpc.id
  traffic_type    = "ALL"
  log_destination = aws_cloudwatch_log_group.ingestor_logs.arn
}
`,
      'iam.tf': `resource "aws_iam_role" "ingestor_exec" {
  name               = "datalake-parquet-ingestor-role"
  assume_role_policy = "{}"
}

resource "aws_iam_policy" "datalake_scoped" {
  name = "datalake-kms-s3-scoped"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["s3:PutObject", "kms:GenerateDataKey"]
        Resource = "\${aws_s3_bucket.datalake.arn}/*"
      }
    ]
  })
}
`,
      'variables.tf': `variable "aws_region" {
  type    = string
  default = "us-west-2"
}
`,
      'outputs.tf': `output "kms_key_arn" {
  value = aws_kms_key.datalake_key.arn
}

output "bucket_id" {
  value = aws_s3_bucket.datalake.id
}
`,
    },
    messages: [
      {
        id: 'msg-lake-1',
        sender: 'assistant',
        timestamp: '09:30 AM',
        content:
          'Simulated Data Lake architecture loaded in `us-west-2` with NAT Gateway private egress, KMS Customer Managed Key (CMK), S3 Bucket Key encryption, and VPC Flow Logs.',
        changedFiles: ['main.tf', 'vpc.tf', 'iam.tf'],
        addedResources: [
          'aws_vpc.datalake_vpc',
          'aws_nat_gateway.primary_nat',
          'aws_kms_key.datalake_key',
          'aws_s3_bucket.datalake',
          'aws_lambda_function.parquet_ingestor',
        ],
        securityNote: '100% CIS AWS Foundations v3.0 simulated benchmark score.',
      },
    ],
    nodes: [],
    edges: [],
    resources: [],
    securityFindings: [],
  },
];

export const INITIAL_PROJECTS: ProjectData[] = RAW_PROJECTS.map((proj) =>
  synchronizeProjectState(proj)
);

/**
 * Creates a synchronized starter project from user-selected template options.
 */
export function createSynchronizedStarterProject(
  name: string,
  description: string,
  region: string,
  template: string
): ProjectData {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  let files: Record<string, string>;

  if (template === 'vpc-serverless') {
    files = {
      ...RAW_PROJECTS[0].files,
      'variables.tf': `variable "aws_region" {\n  type    = string\n  default = "${region}"\n}\n\nvariable "environment" {\n  type    = string\n  default = "${slug}"\n}\n`,
    };
  } else if (template === 's3-kms') {
    files = {
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
  region = "${region}"
}

resource "aws_kms_key" "data_key" {
  description             = "Customer Managed Key for ${name}"
  deletion_window_in_days = 30
  enable_key_rotation     = true
}

resource "aws_s3_bucket" "primary_storage" {
  bucket        = "${slug}-secure-bucket"
  force_destroy = false
}

resource "aws_s3_bucket_server_side_encryption_configuration" "kms_enc" {
  bucket = aws_s3_bucket.primary_storage.id

  rule {
    apply_server_side_encryption_by_default {
      kms_master_key_id = aws_kms_key.data_key.arn
      sse_algorithm     = "aws:kms"
    }
    bucket_key_enabled = true
  }
}

resource "aws_s3_bucket_public_access_block" "block" {
  bucket                  = aws_s3_bucket.primary_storage.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_cloudwatch_log_group" "storage_audit" {
  name              = "/aws/s3/${slug}-audit"
  retention_in_days = 90
}
`,
      'variables.tf': `variable "aws_region" {\n  default = "${region}"\n}\n`,
      'outputs.tf': `output "bucket_name" {\n  value = aws_s3_bucket.primary_storage.id\n}\n`,
    };
  } else {
    files = {
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
  region = "${region}"
}

resource "aws_s3_bucket" "starter_bucket" {
  bucket        = "${slug}-artifacts"
  force_destroy = false
}

resource "aws_s3_bucket_public_access_block" "starter_block" {
  bucket                  = aws_s3_bucket.starter_bucket.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}
`,
      'variables.tf': `variable "aws_region" {\n  default = "${region}"\n}\n`,
      'outputs.tf': `output "region" {\n  value = var.aws_region\n}\n`,
    };
  }

  const base: ProjectData = {
    id: `proj-${Date.now()}`,
    name,
    description:
      description || 'Simulated Terraform infrastructure project managed via TerraGen AI.',
    region,
    updatedAt: 'Just now',
    activeFileName: files['vpc.tf'] ? 'vpc.tf' : 'main.tf',
    files,
    messages: [
      {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        timestamp: 'Just now',
        content: `Created simulated project "${name}" in region \`${region}\` using template \`${template}\`. Diagram nodes, resource inventory, and HCL files are synchronized.`,
        securityNote: 'Simulated offline HCL environment — no live AWS connection.',
      },
    ],
    nodes: [],
    edges: [],
    resources: [],
    securityFindings: [],
  };

  return synchronizeProjectState(base);
}
