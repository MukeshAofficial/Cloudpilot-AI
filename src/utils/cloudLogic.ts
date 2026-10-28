/**
 * Pure business logic and utilities for CloudPilot AI.
 */

export interface AccessValidationResult {
  isValid: boolean;
  error?: string;
}

export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  const trimmed = email.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  return emailRegex.test(trimmed);
}

export function validateAccessRequest(
  email: string,
  environment: string
): AccessValidationResult {
  if (!email || !email.trim()) {
    return { isValid: false, error: 'Email address is required.' };
  }
  if (!validateEmail(email)) {
    return { isValid: false, error: 'Please enter a valid business or personal email.' };
  }
  if (!['sandbox', 'team', 'enterprise'].includes(environment)) {
    return { isValid: false, error: 'Please select an infrastructure environment type.' };
  }
  return { isValid: true };
}

export interface SecurityScore {
  score: number;
  totalRules: number;
  checks: { name: string; passed: boolean; tip: string }[];
}

export function auditTerraformHcl(hcl: string): SecurityScore {
  const checks = [
    {
      name: 'Encryption at Rest (KMS / AES256)',
      passed: /kms_key_id|server_side_encryption|encrypted\s*=\s*true|aws_kms_key/i.test(hcl),
      tip: 'Requires customer-managed KMS key or default server-side encryption.',
    },
    {
      name: 'Private Network Isolation',
      passed: /private_subnets|public_access_block|enable_dns_hostnames|map_public_ip_on_launch\s*=\s*false/i.test(hcl),
      tip: 'Requires private subnet segregation or public access block policies.',
    },
    {
      name: 'Explicit Resource Tagging',
      passed: /tags\s*=\s*{/i.test(hcl),
      tip: 'Requires ManagedBy = CloudPilot-AI and Environment tracking tags.',
    },
    {
      name: 'Least-Privilege Scoping',
      passed: !/\*:\*/.test(hcl) && (/statement\s*{/i.test(hcl) || /policy/i.test(hcl) || /iam_role/i.test(hcl)),
      tip: 'Prohibits unrestricted wildcard actions and scopes specific ARNs.',
    },
  ];

  const passedCount = checks.filter((c) => c.passed).length;
  return {
    score: Math.round((passedCount / checks.length) * 100),
    totalRules: checks.length,
    checks,
  };
}

export function matchCloudTalkIntent(query: string): string {
  const q = query.toLowerCase();
  if (q.includes('lambda') || q.includes('error') || q.includes('timeout') || q.includes('spike')) {
    return 'lambda-error-spike';
  }
  if (q.includes('ebs') || q.includes('volume') || q.includes('security group') || q.includes('open') || q.includes('cost')) {
    return 'ebs-unattached-audit';
  }
  if (q.includes('vpc') || q.includes('flow') || q.includes('reject') || q.includes('port 443') || q.includes('network')) {
    return 'vpc-flow-rejections';
  }
  return 'custom-query-analysis';
}
