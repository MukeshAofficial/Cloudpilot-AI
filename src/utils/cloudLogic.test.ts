import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateEmail,
  validateAccessRequest,
  auditTerraformHcl,
  matchCloudTalkIntent,
} from './cloudLogic.ts';

test('validateEmail checks standard email addresses', () => {
  assert.equal(validateEmail('devops@acme.com'), true);
  assert.equal(validateEmail('user.name+tag@company.co.uk'), true);
  assert.equal(validateEmail(''), false);
  assert.equal(validateEmail('invalid-email'), false);
  assert.equal(validateEmail('@domain.com'), false);
});

test('validateAccessRequest handles required fields and environments', () => {
  assert.deepEqual(validateAccessRequest('sre@cloudpilot.ai', 'team'), { isValid: true });
  assert.deepEqual(validateAccessRequest('', 'team'), {
    isValid: false,
    error: 'Email address is required.',
  });
  assert.deepEqual(validateAccessRequest('not-an-email', 'team'), {
    isValid: false,
    error: 'Please enter a valid business or personal email.',
  });
  assert.deepEqual(validateAccessRequest('valid@corp.io', 'invalid-env'), {
    isValid: false,
    error: 'Please select an infrastructure environment type.',
  });
});

test('auditTerraformHcl audits security controls in HCL text', () => {
  const secureHcl = `
    resource "aws_s3_bucket" "secure_storage" {
      bucket = "cloudpilot-data-lake"
      tags = {
        ManagedBy = "CloudPilot-AI"
      }
    }
    resource "aws_s3_bucket_server_side_encryption_configuration" "kms" {
      rule {
        apply_server_side_encryption_by_default {
          kms_master_key_id = "arn:aws:kms:us-east-1:123456789012:key/pilot"
          sse_algorithm     = "aws:kms"
        }
      }
    }
    resource "aws_s3_bucket_public_access_block" "block" {
      block_public_acls = true
    }
    data "aws_iam_policy_document" "scoped" {
      statement {
        actions = ["s3:GetObject"]
      }
    }
  `;

  const report = auditTerraformHcl(secureHcl);
  assert.equal(report.score, 100);
  assert.equal(report.checks.every((c) => c.passed), true);
});

test('matchCloudTalkIntent parses natural keywords into matching scenarios', () => {
  assert.equal(
    matchCloudTalkIntent('Why did Lambda invoke error rate spike at 14:00?'),
    'lambda-error-spike'
  );
  assert.equal(
    matchCloudTalkIntent('Check open security group and unused EBS volumes'),
    'ebs-unattached-audit'
  );
  assert.equal(
    matchCloudTalkIntent('VPC flow log rejection on 443'),
    'vpc-flow-rejections'
  );
  assert.equal(
    matchCloudTalkIntent('What is my total cost this month?'),
    'ebs-unattached-audit'
  );
});
