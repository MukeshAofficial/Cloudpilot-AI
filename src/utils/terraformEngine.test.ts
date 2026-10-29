import test from 'node:test';
import assert from 'node:assert/strict';
import {
  simulateTerraformFmt,
  simulateTerraformValidate,
  simulateSecurityScan,
  applyAiPromptToProject,
} from './terraformEngine';
import {
  findTerraformBlockRange,
  parseTerraformResources,
  buildTopologyFromResources,
  synchronizeProjectState,
} from './terraformSync';
import { INITIAL_PROJECTS } from '../data/initialProjects';

test('simulateTerraformFmt indents nested blocks', () => {
  const unformatted = 'resource "aws_vpc" "main" {\ncidr_block = "10.0.0.0/16"\n}';
  const result = simulateTerraformFmt(unformatted);
  assert.equal(result.changed, true);
  assert.match(result.formatted, / {2}cidr_block = "10.0.0.0\/16"/);
});

test('simulateTerraformValidate catches unbalanced braces', () => {
  const validFiles = {
    'main.tf': 'resource "aws_s3_bucket" "b" { bucket = "my-bucket" }',
  };
  const invalidFiles = {
    'main.tf': 'resource "aws_s3_bucket" "b" { bucket = "my-bucket"',
  };

  const validRes = simulateTerraformValidate(validFiles);
  assert.equal(validRes.success, true);
  assert.equal(validRes.errorCount, 0);

  const invalidRes = simulateTerraformValidate(invalidFiles);
  assert.equal(invalidRes.success, false);
  assert.equal(invalidRes.errorCount, 1);
});

test('simulateSecurityScan scores compliant HCL with high rating', () => {
  const secureCode = {
    'main.tf': `
      resource "aws_s3_bucket_server_side_encryption_configuration" "kms" {
        kms_master_key_id = "arn:aws:kms:..."
      }
      resource "aws_flow_log" "traffic" {}
      resource "aws_iam_policy" "scoped" {
        Action = ["s3:GetObject"]
      }
    `,
  };

  const report = simulateSecurityScan(secureCode);
  assert.equal(report.score >= 75, true);
  assert.equal(report.failures, 0);
});

test('findTerraformBlockRange locates exact 1-based start and end lines of a resource block', () => {
  const sampleHcl = [
    'provider "aws" {',
    '  region = "us-east-1"',
    '}',
    '',
    'resource "aws_lambda_function" "order_processor" {',
    '  function_name = "order-processor"',
    '  vpc_config {',
    '    subnet_ids = ["subnet-1"]',
    '  }',
    '}',
    '',
    'resource "aws_s3_bucket" "assets" {',
    '  bucket = "my-assets"',
    '}',
  ].join('\n');

  const lambdaRange = findTerraformBlockRange(sampleHcl, 'aws_lambda_function.order_processor');
  assert.deepEqual(lambdaRange, { startLine: 5, endLine: 10 });

  const s3Range = findTerraformBlockRange(sampleHcl, 'aws_s3_bucket.assets');
  assert.deepEqual(s3Range, { startLine: 12, endLine: 14 });
});

test('INITIAL_PROJECTS[0] synchronizes VPC, Subnets, IGW, Route Tables, SG, Lambda, S3, IAM, and CloudWatch with simulated ARNs', () => {
  const proj = INITIAL_PROJECTS[0];
  const iconKeys = new Set(proj.resources.map((r) => r.iconKey));

  assert.equal(iconKeys.has('vpc'), true);
  assert.equal(iconKeys.has('subnet-public'), true);
  assert.equal(iconKeys.has('subnet-private'), true);
  assert.equal(iconKeys.has('igw'), true);
  assert.equal(iconKeys.has('route-table'), true);
  assert.equal(iconKeys.has('security-group'), true);
  assert.equal(iconKeys.has('lambda'), true);
  assert.equal(iconKeys.has('s3'), true);
  assert.equal(iconKeys.has('iam'), true);
  assert.equal(iconKeys.has('cloudwatch'), true);

  // Every simulated ARN uses 000000000000 or s3 simulated bucket naming (never real account IDs)
  for (const res of proj.resources) {
    assert.equal(res.arn.includes('123456789012'), false);
    if (!res.arn.startsWith('arn:aws:s3:::')) {
      assert.equal(res.arn.includes('000000000000'), true);
    }
  }

  // Topology includes Region, VPC, Public Subnet, and Private Subnet containers
  const nodeTypes = proj.nodes.map((n) => n.type);
  assert.equal(nodeTypes.includes('regionGroup'), true);
  assert.equal(nodeTypes.includes('vpcGroup'), true);
  assert.equal(nodeTypes.filter((t) => t === 'subnetGroup').length, 2);
  assert.equal(proj.edges.length >= 5, true);
});

test('applyAiPromptToProject synchronizes NAT Gateway across HCL files, resources, diagram nodes, and directional edges', () => {
  const baseProj = INITIAL_PROJECTS[0];
  const updated = applyAiPromptToProject(
    baseProj,
    'Add a multi-AZ NAT gateway with private subnet routing'
  );

  assert.equal(updated.files['vpc.tf'].includes('aws_nat_gateway'), true);
  assert.equal(
    updated.resources.some((r) => r.iconKey === 'nat-gateway'),
    true
  );
  assert.equal(
    updated.nodes.some((n) => n.data?.iconKey === 'nat-gateway'),
    true
  );
  assert.equal(
    updated.edges.some((e) => String(e.data?.label).includes('Private Egress')),
    true
  );
});

test('buildTopologyFromResources preserves user-dragged node positions until resetLayout is requested', () => {
  const proj = INITIAL_PROJECTS[0];
  const lambdaNode = proj.nodes.find((n) => n.data?.iconKey === 'lambda');
  assert.ok(lambdaNode);

  const draggedNodes = proj.nodes.map((n) =>
    n.id === lambdaNode.id ? { ...n, position: { x: 777, y: 555 } } : n
  );

  const synced = synchronizeProjectState({ ...proj, nodes: draggedNodes });
  const afterSyncLambda = synced.nodes.find((n) => n.id === lambdaNode.id);
  assert.deepEqual(afterSyncLambda?.position, { x: 777, y: 555 });

  const reset = synchronizeProjectState(synced, { resetLayout: true });
  const afterResetLambda = reset.nodes.find((n) => n.id === lambdaNode.id);
  assert.notDeepEqual(afterResetLambda?.position, { x: 777, y: 555 });
});
