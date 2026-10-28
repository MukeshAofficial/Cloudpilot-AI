import test from 'node:test';
import assert from 'node:assert/strict';
import {
  simulateTerraformFmt,
  simulateTerraformValidate,
  simulateSecurityScan,
} from './terraformEngine.ts';

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
