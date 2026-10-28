import React, { useState } from 'react';
import {
  Database,
  Search,
  FileCode2,
  Lock,
  ShieldCheck,
  Server,
  Layers,
  Network,
  ExternalLink,
} from 'lucide-react';
import { AwsResourceItem } from '../../types/workspace';

interface ResourcesViewProps {
  resources: AwsResourceItem[];
  onSelectResource: (file: string) => void;
}

export const ResourcesView: React.FC<ResourcesViewProps> = ({
  resources,
  onSelectResource,
}) => {
  const [search, setSearch] = useState('');
  const [filterService, setFilterService] = useState<string>('all');

  const filteredResources = resources.filter((res) => {
    const matchesSearch =
      res.name.toLowerCase().includes(search.toLowerCase()) ||
      res.type.toLowerCase().includes(search.toLowerCase()) ||
      res.arn.toLowerCase().includes(search.toLowerCase());

    const matchesService = filterService === 'all' || res.service === filterService;
    return matchesSearch && matchesService;
  });

  return (
    <div className="flex-1 flex flex-col h-full bg-[#060810] p-6 overflow-y-auto select-none">
      <div className="max-w-6xl w-full mx-auto space-y-6">
        
        {/* View Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-cyan-400" />
              <span>AWS Resource Inventory</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              All infrastructure resources parsed and synthesized in the active Terraform project.
            </p>
          </div>
          <div className="text-xs font-mono text-cyan-300 bg-cyan-950/60 border border-cyan-500/30 px-3 py-1 rounded-xl">
            {resources.length} Total Resources Declared
          </div>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by resource name or type..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto p-1 bg-black/40 rounded-xl border border-white/10">
            {['all', 'vpc', 'compute', 'storage', 'security'].map((svc) => (
              <button
                key={svc}
                type="button"
                onClick={() => setFilterService(svc)}
                className={`px-3 py-1 rounded-lg text-xs font-mono uppercase transition-colors cursor-pointer ${
                  filterService === svc
                    ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {svc}
              </button>
            ))}
          </div>
        </div>

        {/* Resources Table */}
        <div className="rounded-2xl border border-white/10 bg-[#0A0E1A] overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#070A14] border-b border-white/10 text-[11px] font-mono uppercase text-slate-400">
              <tr>
                <th className="py-3 px-4">Resource Identifier</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Encryption</th>
                <th className="py-3 px-4">Isolation</th>
                <th className="py-3 px-4">File Location</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              {filteredResources.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No resources matched your filter.
                  </td>
                </tr>
              ) : (
                filteredResources.map((res) => (
                  <tr key={res.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-white">
                      {res.name}
                    </td>
                    <td className="py-3.5 px-4 text-cyan-300">
                      {res.type}
                    </td>
                    <td className="py-3.5 px-4">
                      {res.encryption === 'kms' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-purple-300 bg-purple-950/60 border border-purple-500/30 px-2 py-0.5 rounded">
                          <Lock className="w-3 h-3" />
                          <span>KMS CMK</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                          <span>Default</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded">
                        <ShieldCheck className="w-3 h-3" />
                        <span>Private</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {res.file}:{res.lineNumber}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => onSelectResource(res.file)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white/5 border border-white/10 hover:border-cyan-400 text-[11px] text-slate-300 hover:text-white transition-colors cursor-pointer"
                      >
                        <FileCode2 className="w-3 h-3 text-cyan-400" />
                        <span>View HCL</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};
