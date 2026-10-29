import React from 'react';
import { AwsIconKey } from '../../types/workspace';

export interface AwsServiceVisualMeta {
  title: string;
  shortLabel: string;
  categoryLabel: string;
  bgGradient: string;
  borderColor: string;
  accentHex: string;
}

export const AWS_ICON_META: Record<AwsIconKey, AwsServiceVisualMeta> = {
  region: {
    title: 'AWS Region',
    shortLabel: 'Region',
    categoryLabel: 'AWS Cloud Region',
    bgGradient: 'from-[#0E7490] to-[#0891B2]',
    borderColor: 'border-cyan-400/50',
    accentHex: '#06B6D4',
  },
  vpc: {
    title: 'Amazon VPC',
    shortLabel: 'VPC',
    categoryLabel: 'Networking & Content Delivery',
    bgGradient: 'from-[#7C3AED] to-[#8C4FFF]',
    borderColor: 'border-[#8C4FFF]/60',
    accentHex: '#8C4FFF',
  },
  'subnet-public': {
    title: 'Public Subnet',
    shortLabel: 'Public Subnet',
    categoryLabel: 'VPC Subnet Tier',
    bgGradient: 'from-[#2E7D32] to-[#3F8624]',
    borderColor: 'border-[#7AA116]/60',
    accentHex: '#7AA116',
  },
  'subnet-private': {
    title: 'Private Subnet',
    shortLabel: 'Private Subnet',
    categoryLabel: 'VPC Isolated Tier',
    bgGradient: 'from-[#007E8A] to-[#00A4A6]',
    borderColor: 'border-[#00A4A6]/60',
    accentHex: '#00A4A6',
  },
  igw: {
    title: 'Internet Gateway',
    shortLabel: 'IGW',
    categoryLabel: 'VPC Edge Gateway',
    bgGradient: 'from-[#6D28D9] to-[#8C4FFF]',
    borderColor: 'border-[#8C4FFF]/50',
    accentHex: '#8C4FFF',
  },
  'nat-gateway': {
    title: 'NAT Gateway',
    shortLabel: 'NAT GW',
    categoryLabel: 'Managed Outbound NAT',
    bgGradient: 'from-[#6D28D9] to-[#8C4FFF]',
    borderColor: 'border-[#8C4FFF]/50',
    accentHex: '#8C4FFF',
  },
  'route-table': {
    title: 'VPC Route Table',
    shortLabel: 'Route Table',
    categoryLabel: 'VPC Routing Control',
    bgGradient: 'from-[#5B21B6] to-[#8C4FFF]',
    borderColor: 'border-[#8C4FFF]/50',
    accentHex: '#8C4FFF',
  },
  'security-group': {
    title: 'Security Group',
    shortLabel: 'SG',
    categoryLabel: 'Stateful Instance Firewall',
    bgGradient: 'from-[#BE123C] to-[#DD344C]',
    borderColor: 'border-[#DD344C]/50',
    accentHex: '#DD344C',
  },
  lambda: {
    title: 'AWS Lambda',
    shortLabel: 'Lambda',
    categoryLabel: 'Serverless Compute',
    bgGradient: 'from-[#D95F02] to-[#ED7100]',
    borderColor: 'border-[#ED7100]/60',
    accentHex: '#ED7100',
  },
  s3: {
    title: 'Amazon S3',
    shortLabel: 'S3',
    categoryLabel: 'Object Storage',
    bgGradient: 'from-[#2D6A1E] to-[#3F8624]',
    borderColor: 'border-[#7AA116]/60',
    accentHex: '#7AA116',
  },
  iam: {
    title: 'AWS IAM',
    shortLabel: 'IAM',
    categoryLabel: 'Identity & Access Management',
    bgGradient: 'from-[#B91C1C] to-[#DD344C]',
    borderColor: 'border-[#DD344C]/60',
    accentHex: '#DD344C',
  },
  cloudwatch: {
    title: 'Amazon CloudWatch',
    shortLabel: 'CloudWatch',
    categoryLabel: 'Management & Observability',
    bgGradient: 'from-[#BE185D] to-[#E7157B]',
    borderColor: 'border-[#E7157B]/60',
    accentHex: '#E7157B',
  },
  kms: {
    title: 'AWS KMS',
    shortLabel: 'KMS',
    categoryLabel: 'Key Management Service',
    bgGradient: 'from-[#B91C1C] to-[#DD344C]',
    borderColor: 'border-[#DD344C]/60',
    accentHex: '#DD344C',
  },
  eip: {
    title: 'Elastic IP',
    shortLabel: 'EIP',
    categoryLabel: 'Static IPv4 Address',
    bgGradient: 'from-[#6D28D9] to-[#8C4FFF]',
    borderColor: 'border-[#8C4FFF]/50',
    accentHex: '#8C4FFF',
  },
};

interface AwsServiceIconProps {
  iconKey: AwsIconKey;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

export const AwsServiceIcon: React.FC<AwsServiceIconProps> = ({
  iconKey,
  size = 'md',
  className = '',
}) => {
  const meta = AWS_ICON_META[iconKey] || AWS_ICON_META.vpc;

  const sizeClasses = {
    xs: 'w-5 h-5 rounded',
    sm: 'w-7 h-7 rounded-md',
    md: 'w-9 h-9 rounded-lg',
    lg: 'w-12 h-12 rounded-xl',
  }[size];

  const svgSizes = {
    xs: 'w-3.5 h-3.5',
    sm: 'w-4 h-4',
    md: 'w-5.5 h-5.5',
    lg: 'w-7 h-7',
  }[size];

  const renderGlyph = () => {
    switch (iconKey) {
      case 'region':
        return (
          <svg viewBox="0 0 32 32" fill="none" className={svgSizes} aria-hidden="true">
            <path
              d="M7 5V27M7 6H23L19.5 11.5L23 17H7"
              stroke="white"
              strokeWidth="2.1"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="7" cy="27" r="1.8" fill="white" />
          </svg>
        );

      case 'vpc':
        return (
          <svg viewBox="0 0 32 32" fill="none" className={svgSizes} aria-hidden="true">
            <path
              d="M9.5 22.5H7.8C5.15 22.5 3 20.35 3 17.7C3 15.32 4.73 13.35 7.01 12.97C7.68 9.02 11.11 6 15.25 6C19.86 6 23.6 9.74 23.6 14.35C23.6 14.52 23.59 14.69 23.58 14.86C26.07 15.27 28 17.43 28 20.05C28 22.95 25.65 25.3 22.75 25.3H21.5"
              stroke="white"
              strokeWidth="1.9"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <rect
              x="11"
              y="16.5"
              width="9"
              height="7.5"
              rx="1.5"
              stroke="white"
              strokeWidth="1.9"
            />
            <path
              d="M13.2 16.5V14.5C13.2 13.23 14.23 12.2 15.5 12.2C16.77 12.2 17.8 13.23 17.8 14.5V16.5"
              stroke="white"
              strokeWidth="1.9"
              strokeLinecap="round"
            />
            <circle cx="15.5" cy="20.2" r="1.1" fill="white" />
          </svg>
        );

      case 'subnet-public':
        return (
          <svg viewBox="0 0 32 32" fill="none" className={svgSizes} aria-hidden="true">
            <rect
              x="4"
              y="4"
              width="24"
              height="24"
              rx="4"
              stroke="white"
              strokeWidth="1.7"
              strokeDasharray="3 2.5"
            />
            <rect x="10.5" y="15.5" width="11" height="8" rx="1.6" stroke="white" strokeWidth="1.9" />
            <path
              d="M13 15.5V12.2C13 10.43 14.43 9 16.2 9C17.65 9 18.88 9.96 19.27 11.28"
              stroke="white"
              strokeWidth="1.9"
              strokeLinecap="round"
            />
            <circle cx="16" cy="19.5" r="1.2" fill="white" />
          </svg>
        );

      case 'subnet-private':
        return (
          <svg viewBox="0 0 32 32" fill="none" className={svgSizes} aria-hidden="true">
            <rect
              x="4"
              y="4"
              width="24"
              height="24"
              rx="4"
              stroke="white"
              strokeWidth="1.7"
              strokeDasharray="3 2.5"
            />
            <rect x="10.5" y="15" width="11" height="8.5" rx="1.6" stroke="white" strokeWidth="1.9" />
            <path
              d="M12.8 15V12.2C12.8 10.43 14.23 9 16 9C17.77 9 19.2 10.43 19.2 12.2V15"
              stroke="white"
              strokeWidth="1.9"
              strokeLinecap="round"
            />
            <circle cx="16" cy="19.2" r="1.2" fill="white" />
          </svg>
        );

      case 'igw':
        return (
          <svg viewBox="0 0 32 32" fill="none" className={svgSizes} aria-hidden="true">
            <circle cx="16" cy="16" r="10.5" stroke="white" strokeWidth="1.8" />
            <ellipse cx="16" cy="16" rx="5" ry="10.5" stroke="white" strokeWidth="1.5" />
            <path d="M5.8 16H26.2" stroke="white" strokeWidth="1.5" />
            <path
              d="M16 2.5V8.5M16 2.5L13.5 5M16 2.5L18.5 5"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );

      case 'nat-gateway':
        return (
          <svg viewBox="0 0 32 32" fill="none" className={svgSizes} aria-hidden="true">
            <circle cx="16" cy="16" r="9.5" stroke="white" strokeWidth="1.8" />
            <path
              d="M5 11H13L16 16M5 21H13L16 16M5 16H26.5M26.5 16L23 12.5M26.5 16L23 19.5"
              stroke="white"
              strokeWidth="1.9"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );

      case 'route-table':
        return (
          <svg viewBox="0 0 32 32" fill="none" className={svgSizes} aria-hidden="true">
            <rect x="4.5" y="6" width="11" height="20" rx="2" stroke="white" strokeWidth="1.9" />
            <path d="M7.5 11H12.5M7.5 16H12.5M7.5 21H12.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
            <path
              d="M15.5 11H21L26.5 8M26.5 8L23.5 6.8M26.5 8L25.2 11M15.5 16H27M27 16L24.2 13.5M27 16L24.2 18.5M15.5 21H21L26.5 24M26.5 24L25.2 21M26.5 24L23.5 25.2"
              stroke="white"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );

      case 'security-group':
        return (
          <svg viewBox="0 0 32 32" fill="none" className={svgSizes} aria-hidden="true">
            <path
              d="M16 4.5L25.5 8.5V15.5C25.5 21.4 21.45 26.25 16 28C10.55 26.25 6.5 21.4 6.5 15.5V8.5L16 4.5Z"
              stroke="white"
              strokeWidth="1.9"
              strokeLinejoin="round"
            />
            <path
              d="M11.5 14H20.5M11.5 18.5H18.5"
              stroke="white"
              strokeWidth="1.9"
              strokeLinecap="round"
            />
            <circle cx="19.8" cy="18.5" r="1.2" fill="white" />
          </svg>
        );

      case 'lambda':
        return (
          <svg viewBox="0 0 32 32" fill="none" className={svgSizes} aria-hidden="true">
            <path
              d="M9.5 7H14.5L22.8 25H18.3L14.8 17.1L11.2 25H6.8L12.7 12.6L10.3 7.5"
              stroke="white"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );

      case 's3':
        return (
          <svg viewBox="0 0 32 32" fill="none" className={svgSizes} aria-hidden="true">
            <ellipse cx="16" cy="9.5" rx="8.5" ry="3.5" stroke="white" strokeWidth="1.9" />
            <path
              d="M7.5 9.5L9.5 23.5C9.5 25.43 12.41 27 16 27C19.59 27 22.5 25.43 22.5 23.5L24.5 9.5"
              stroke="white"
              strokeWidth="1.9"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M7.5 9.5C7.5 5.2 24.5 5.2 24.5 9.5"
              stroke="white"
              strokeWidth="1.6"
              strokeDasharray="2.5 2"
            />
            <circle cx="16" cy="18" r="2" fill="white" />
          </svg>
        );

      case 'iam':
        return (
          <svg viewBox="0 0 32 32" fill="none" className={svgSizes} aria-hidden="true">
            <circle cx="12.5" cy="11.5" r="4" stroke="white" strokeWidth="1.9" />
            <path
              d="M5.5 24.5C5.5 20.63 8.63 17.5 12.5 17.5C15.1 17.5 17.36 18.92 18.57 21.02"
              stroke="white"
              strokeWidth="1.9"
              strokeLinecap="round"
            />
            <circle cx="22" cy="17.5" r="3.2" stroke="white" strokeWidth="1.9" />
            <path
              d="M22 20.7V26.5M22 24H24.8"
              stroke="white"
              strokeWidth="1.9"
              strokeLinecap="round"
            />
          </svg>
        );

      case 'cloudwatch':
        return (
          <svg viewBox="0 0 32 32" fill="none" className={svgSizes} aria-hidden="true">
            <circle cx="14.5" cy="14.5" r="8.5" stroke="white" strokeWidth="1.9" />
            <path
              d="M9.8 15.5H12.2L13.8 11.2L15.8 18.2L17.4 14.2H19.4"
              stroke="white"
              strokeWidth="1.9"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M20.8 20.8L26.5 26.5"
              stroke="white"
              strokeWidth="2.3"
              strokeLinecap="round"
            />
          </svg>
        );

      case 'kms':
        return (
          <svg viewBox="0 0 32 32" fill="none" className={svgSizes} aria-hidden="true">
            <path
              d="M16 4L26 9.8V22.2L16 28L6 22.2V9.8L16 4Z"
              stroke="white"
              strokeWidth="1.9"
              strokeLinejoin="round"
            />
            <circle cx="14" cy="14.5" r="3" stroke="white" strokeWidth="1.9" />
            <path
              d="M16.3 16.6L21.5 21.8M19.5 19.8L21.5 17.8"
              stroke="white"
              strokeWidth="1.9"
              strokeLinecap="round"
            />
          </svg>
        );

      case 'eip':
      default:
        return (
          <svg viewBox="0 0 32 32" fill="none" className={svgSizes} aria-hidden="true">
            <rect x="6" y="8" width="20" height="16" rx="3" stroke="white" strokeWidth="1.9" />
            <circle cx="12" cy="16" r="1.5" fill="white" />
            <circle cx="16" cy="16" r="1.5" fill="white" />
            <circle cx="20" cy="16" r="1.5" fill="white" />
          </svg>
        );
    }
  };

  return (
    <div
      className={`inline-flex shrink-0 items-center justify-center bg-gradient-to-br ${meta.bgGradient} border ${meta.borderColor} shadow-md ${sizeClasses} ${className}`}
      title={meta.title}
    >
      {renderGlyph()}
    </div>
  );
};
