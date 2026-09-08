import React, { useState } from 'react';
import { NodeData, Connection, CertificateItem, ProjectItem } from '../types';
import { Search, ArrowRight } from './icons';

interface InspectorListViewProps {
  nodes: NodeData[];
  connections: Connection[];
  onFocusNodeOnCanvas: (nodeId: string) => void;
  onOpenCertificateModal: (cert: CertificateItem) => void;
  onOpenProjectModal: (proj: ProjectItem) => void;
  onOpenContact: () => void;
}

export const InspectorListView: React.FC<InspectorListViewProps> = ({
  nodes,
  connections,
  onFocusNodeOnCanvas,
  onOpenCertificateModal,
  onOpenProjectModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'skills' | 'certificates' | 'project'>('all');

  const filteredNodes = nodes.filter((node) => {
    if (selectedFilter !== 'all') {
      if (selectedFilter === 'skills' && node.category !== 'skills') return false;
      if (selectedFilter === 'certificates' && node.category !== 'certificates') return false;
      if (selectedFilter === 'project' && node.category !== 'project') return false;
    }
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const titleMatch = node.title.toLowerCase().includes(query);
    const subtitleMatch = node.subtitle?.toLowerCase().includes(query);
    const skillsMatch = node.skills?.some((s) => s.name.toLowerCase().includes(query));
    const certsMatch = node.certificates?.some(
      (c) => c.title.toLowerCase().includes(query) || c.issuer.toLowerCase().includes(query)
    );
    return titleMatch || subtitleMatch || skillsMatch || certsMatch;
  });

  return (
    <div className="absolute inset-0 pt-20 pb-12 px-4 sm:px-8 max-w-5xl mx-auto overflow-y-auto z-30 pointer-events-auto">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-8 bg-black/60 backdrop-blur-md p-4 rounded-xl border border-white/[0.08]">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search nodes or topics..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-black/50 border border-white/[0.08] text-white placeholder:text-zinc-600 text-xs font-body focus:border-rose-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto font-body">
          {(['all', 'skills', 'certificates', 'project'] as const).map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setSelectedFilter(filter)}
              className={`px-3 py-1 rounded-lg text-xs capitalize transition-all whitespace-nowrap ${
                selectedFilter === filter
                  ? 'bg-rose-950/50 text-rose-300 border border-rose-500/30'
                  : 'bg-white/[0.03] text-zinc-400 hover:text-white border border-white/[0.06]'
              }`}
            >
              {filter === 'certificates' ? 'Credentials' : filter}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Nodes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pb-12">
        {filteredNodes.map((node) => {
          const outgoingConns = connections.filter((c) => c.fromNodeId === node.id);

          return (
            <div
              key={node.id}
              className="p-5 rounded-xl bg-black/70 border border-white/[0.08] hover:border-rose-500/30 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: node.accentColor || '#e11d48' }}
                    />
                    <h3 className="font-display text-base sm:text-lg text-white font-bold tracking-wide uppercase">{node.title}</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => onFocusNodeOnCanvas(node.id)}
                    className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 font-body font-semibold"
                  >
                    <span>Inspect</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {node.subtitle && (
                  <p className="text-xs text-zinc-400 font-body font-medium mb-3">{node.subtitle}</p>
                )}

                {/* Profile */}
                {node.category === 'profile' && node.profile && (
                  <p className="text-xs sm:text-sm text-zinc-200 font-body leading-relaxed">{node.profile.bio}</p>
                )}

                {/* Skills */}
                {node.category === 'skills' && node.skills && (
                  <div className="space-y-1.5 pt-1">
                    {node.skills.map((s) => (
                      <div key={s.name} className="flex items-baseline justify-between text-xs py-1 border-b border-white/[0.04]">
                        <span className="text-zinc-100 font-body text-xs sm:text-sm font-semibold">{s.name}</span>
                        <span className="font-body text-xs text-zinc-400 font-medium">{s.category}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Credentials */}
                {node.category === 'certificates' && node.certificates && (
                  <div className="space-y-2 pt-1">
                    {node.certificates.map((cert) => (
                      <div
                        key={cert.id}
                        onClick={() => onOpenCertificateModal(cert)}
                        className="p-2.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] cursor-pointer transition-colors"
                      >
                        <div className="text-xs sm:text-sm font-body font-semibold text-zinc-100">{cert.title}</div>
                        <div className="text-xs text-zinc-400 font-body font-medium mt-0.5">
                          {cert.issuer} • {cert.issueDate}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Project */}
                {node.category === 'project' && node.project && (
                  <div className="space-y-2 pt-1">
                    <p className="text-xs sm:text-sm text-zinc-200 font-body leading-relaxed">{node.project.description}</p>
                    <button
                      type="button"
                      onClick={() => onOpenProjectModal(node.project!)}
                      className="text-xs font-body font-semibold text-rose-400 hover:text-rose-300 transition-colors pt-1 inline-block"
                    >
                      Open Artifact Details →
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs font-body text-zinc-400 font-medium">
                <span>Active Connections: {outgoingConns.length}</span>
                <span className="uppercase text-rose-400 font-semibold">{node.category}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
