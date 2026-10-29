import React, { useState } from 'react';
import {
  Database,
  Search,
  FileCode2,
  Lock,
  ShieldCheck,
  Eye,
} from 'lucide-react';
import { AwsResourceItem } from '../../types/workspace';
import { AwsServiceIcon, AWS_ICON_META } from './AwsServiceIcon';

interface ResourcesViewProps {
  resources: AwsResourceItem[];
  onOpenInTerraformCode: (resource: AwsResourceItem) => void;
  onInspectResource?: (resource: AwsResourceItem) => void;
}

export const ResourcesView: React.FC<ResourcesViewProps> = ({
  resources,
  onOpenInTerraformCode,
  onInspectResource,
}) => {
  const [search, setSearch] = useState('');
  const [filterService, setFilterService] = useState<string>('all');

  const filteredResources = resources.filter((res) => {
    const q = search.toLowerCase();
    const matchesSearch =
      res.name.toLowerCase().includes(q) ||
      res.type.toLowerCase().includes(q) ||
      res.terraformAddress.toLowerCase().includes(q) ||
      res.arn.toLowerCase().includes(q);

    const matchesService = filterService === 'all' || res.service === filterService;
    return matchesSearch && matchesService;
  });

  const serviceFilters = [
    { id: 'all', label: 'All' },
    { id: 'vpc', label: 'VPC' },
    { id: 'network', label: 'Network' },
    { id: 'compute', label: 'Compute' },
    { id: 'storage', label: 'Storage' },
    { id: 'security', label: 'Security' },
    { id: 'observability', label: 'Logs' },
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-[#060810] p-6 overflow-y-auto select-none">
      <div className="max-w-6xl w-full mx-auto space-y-6">
        {/* View Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-cyan-400" />
              <span>Synchronized AWS Resource Inventory</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Simulated resources parsed directly from your project&apos;s Terraform HCL files (no live AWS connection).
            </p>
          </div>
          <div className="text-xs font-mono text-slate-300 tabular-nums">
            <span className="text-cyan-300 font-semibold">{resources.length}</span> Declared Resources
          </div>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          <div className="relative w-full lg:w-80">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <label htmlFor="resource-inventory-search" className="sr-only">
              Filter resources
            </label>
            <input
              id="resource-inventory-search"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by resource name or type..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#0A0E1C] border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto p-1 bg-[#0A0E1C] rounded-xl border border-white/10">
            {serviceFilters.map((svc) => (
              <button
                key={svc.id}
                type="button"
                onClick={() => setFilterService(svc.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  filterService === svc.id
                    ? 'bg-cyan-500/20 text-cyan-200 font-semibold border border-cyan-500/40'
                    : 'border border-transparent text-slate-400 hover:text-white'
                }`}
              >
                {svc.label}
              </button>
            ))}
          </div>
        </div>

        {/* Resources Table */}
        <div className="rounded-2xl border border-white/10 bg-[#0A0E1A] overflow-x-auto shadow-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#070A14] border-b border-white/10 text-[11px] font-mono text-slate-400">
              <tr>
                <th className="py-3 px-4 font-semibold">AWS Resource</th>
                <th className="py-3 px-4 font-semibold">Terraform Type</th>
                <th className="py-3 px-4 font-semibold">Encryption</th>
                <th className="py-3 px-4 font-semibold">Exposure</th>
                <th className="py-3 px-4 font-semibold">Source Block</th>
                <th className="py-3 px-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              {filteredResources.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">
                    No resources matched your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredResources.map((res) => {
                  const meta = AWS_ICON_META[res.iconKey] || AWS_ICON_META.vpc;
                  return (
                    <tr
                      key={res.id}
                      className="hover:bg-white/[0.03] transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <AwsServiceIcon iconKey={res.iconKey} size="sm" />
                          <div>
                            <div className="font-semibold text-white">{res.name}</div>
                            <div className="text-[10px] text-slate-400">{meta.title}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-cyan-300">{res.type}</td>
                      <td className="py-3 px-4">
                        {res.encryption === 'kms' ? (
                          <span className="inline-flex items-center gap-1.5 text-[11px] text-violet-300">
                            <Lock className="w-3 h-3 text-violet-400" />
                            <span>KMS CMK</span>
                          </span>
                        ) : res.encryption === 'default' ? (
                          <span className="text-[11px] text-slate-300">Default SSE</span>
                        ) : (
                          <span className="text-[11px] text-slate-500">N/A</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 text-[11px] ${
                            res.exposure === 'private'
                              ? 'text-emerald-300'
                              : 'text-amber-300'
                          }`}
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>
                            {res.exposure === 'private' ? 'Private' : 'Edge Perimeter'}
                          </span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-300 tabular-nums">
                        {res.file}:{res.lineNumber}&ndash;{res.endLine}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {onInspectResource && (
                            <button
                              type="button"
                              onClick={() => onInspectResource(res)}
                              aria-label={`Inspect ${res.terraformAddress}`}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 hover:border-indigo-400/60 text-[11px] text-slate-300 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
                            >
                              <Eye className="w-3 h-3 text-indigo-400" />
                              <span>Inspect</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => onOpenInTerraformCode(res)}
                            aria-label={`Open ${res.terraformAddress} in Terraform Code`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30 hover:border-cyan-400 text-[11px] text-cyan-200 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
                          >
                            <FileCode2 className="w-3 h-3 text-cyan-400" />
                            <span>Open in HCL</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
