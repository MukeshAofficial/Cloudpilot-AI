import { Node, Edge } from '@xyflow/react';

export type WorkspaceViewMode = 'editor' | 'diagram' | 'resources' | 'security' | 'validation';

export interface TerraformFile {
  name: string;
  content: string;
  isEntrypoint?: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  content: string;
  changedFiles?: string[];
  addedResources?: string[];
  securityNote?: string;
  diffSummary?: string;
}

export interface AwsResourceItem {
  id: string;
  name: string;
  type: string;
  service: 'vpc' | 'compute' | 'storage' | 'database' | 'security' | 'network' | 'observability';
  arn: string;
  file: string;
  lineNumber: number;
  status: 'valid' | 'provisioned' | 'updated';
  encryption: 'kms' | 'default' | 'none';
  exposure: 'private' | 'public';
  attributes: Record<string, string | number | boolean>;
}

export interface SecurityFinding {
  id: string;
  rule: string;
  severity: 'high' | 'medium' | 'low';
  category: 'Encryption' | 'Networking' | 'IAM' | 'Logging';
  status: 'passed' | 'warning' | 'failed';
  resourceId: string;
  description: string;
  remediationPrompt: string;
}

export interface ProjectData {
  id: string;
  name: string;
  description: string;
  region: string;
  updatedAt: string;
  files: Record<string, string>; // filename -> content
  activeFileName: string;
  messages: ChatMessage[];
  nodes: Node[];
  edges: Edge[];
  resources: AwsResourceItem[];
  securityFindings: SecurityFinding[];
  originalFilesSnapshot?: Record<string, string>; // for diff view
}

export type BottomPanelTab = 'fmt' | 'validate' | 'security' | 'recommendations' | 'output';
