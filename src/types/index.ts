export interface AwsServiceNode {
  id: string;
  name: string;
  category: 'compute' | 'storage' | 'database' | 'security' | 'network' | 'observability';
  icon: string;
  x: number;
  y: number;
  description: string;
  samplePrompt: string;
  status: 'active' | 'analyzing' | 'optimized';
}

export interface CloudTalkScenario {
  id: string;
  query: string;
  targetService: string;
  category: string;
  timeframe: string;
  summary: string;
  steps: {
    title: string;
    detail: string;
    type: 'metric' | 'log' | 'remediation' | 'iam';
  }[];
  verdict: string;
  impact: string;
}

export interface TerraGenTemplate {
  id: string;
  title: string;
  description: string;
  naturalPrompt: string;
  securityBadges: string[];
  hclCode: string;
  complianceNotes: {
    category: string;
    details: string;
    status: 'pass';
  }[];
}

export interface AccessRequestData {
  email: string;
  environment: 'sandbox' | 'team' | 'enterprise';
  cloudProvider: 'aws';
  useCase: string;
}
