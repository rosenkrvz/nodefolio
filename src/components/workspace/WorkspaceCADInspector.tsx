import React, { useState } from 'react';
import {
  Close,
  Maximize,
  ArrowUpRight,
  ExternalLink,
  Layers,
  ChevronRight,
} from '../icons';
import { playSound } from '../../lib/sound';
import { NodeData, Connection } from '../../types';

interface WorkspaceCADInspectorProps {
  isOpen: boolean;
  onClose: () => void;
  selectedNode: NodeData | null;
  nodes: NodeData[];
  connections: Connection[];
  onSelectNode: (nodeId: string) => void;
  onOpenFocusedNode: (node: NodeData) => void;
  transform: { x: number; y: number; scale: number };
  onFitScreen: () => void;
}

export const WorkspaceCADInspector: React.FC<WorkspaceCADInspectorProps> = ({
  isOpen,
  onClose,
  selectedNode,
  nodes,
  connections,
  onSelectNode,
  onOpenFocusedNode,
  transform,
  onFitScreen,
}) => {
  const [activeTab, setActiveTab] = useState<'item' | 'graph' | 'view'>('item');

  if (!isOpen) return null;

  const connectedInputs = selectedNode
    ? connections.filter((c) => c.toNodeId === selectedNode.id)
    : [];
  const connectedOutputs = selectedNode
    ? connections.filter((c) => c.fromNodeId === selectedNode.id)
    : [];

  return (
    <aside
      role="complementary"
      aria-label="Workspace CAD Inspector (N-Panel)"
      className="absolute right-0 top-0 bottom-0 w-72 sm:w-80 bg-[#14161d]/95 backdrop-blur-md border-l border-[#282d38] z-30 flex flex-col font-mono text-xs select-none shadow-2xl animate-in slide-in-from-right duration-200"
    >
      {/* CAD Sidebar Top Tabs */}
      <div className="flex items-center justify-between border-b border-[#282d38] bg-[#111319] px-2 py-1 shrink-0">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => {
              playSound('click');
              setActiveTab('item');
            }}
            className={`px-2.5 py-1 rounded-[2px] text-[10.5px] font-semibold transition-all cursor-pointer ${
              activeTab === 'item'
                ? 'bg-[#222736] text-white border border-rose-500/50 shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            Item
          </button>
          <button
            type="button"
            onClick={() => {
              playSound('click');
              setActiveTab('graph');
            }}
            className={`px-2.5 py-1 rounded-[2px] text-[10.5px] font-semibold transition-all cursor-pointer ${
              activeTab === 'graph'
                ? 'bg-[#222736] text-white border border-rose-500/50 shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            Graph
          </button>
          <button
            type="button"
            onClick={() => {
              playSound('click');
              setActiveTab('view');
            }}
            className={`px-2.5 py-1 rounded-[2px] text-[10.5px] font-semibold transition-all cursor-pointer ${
              activeTab === 'view'
                ? 'bg-[#222736] text-white border border-rose-500/50 shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            View
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            playSound('close');
            onClose();
          }}
          className="p-1 rounded-[2px] text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
          title="Close Sidebar [N]"
        >
          <Close className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4 text-zinc-300">
        {activeTab === 'item' && (
          <>
            {/* Viewport Transform Section */}
            <div className="space-y-2 pb-3 border-b border-[#282d38]">
              <div className="flex items-center justify-between text-[10px] text-zinc-400 uppercase tracking-wider font-bold">
                <span className="text-zinc-400">Node Transform</span>
                <span className="text-rose-400 font-semibold">2D CARTESIAN</span>
              </div>

              <div className="p-2.5 rounded-[3px] bg-[#1a1d26] border border-[#2b313d] space-y-2">
                <div className="flex items-center justify-between text-[10.5px]">
                  <span className="text-zinc-400">Target:</span>
                  <span className="font-semibold text-white truncate max-w-[170px]">
                    {selectedNode ? selectedNode.title : 'None Selected'}
                  </span>
                </div>

                {selectedNode ? (
                  <>
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div className="p-1.5 rounded-[2px] bg-black/40 border border-white/[0.06]">
                        <span className="text-[9px] text-zinc-400 block">Location X</span>
                        <span className="text-xs font-semibold text-rose-300 font-mono">
                          {Math.round(selectedNode.x)} px
                        </span>
                      </div>
                      <div className="p-1.5 rounded-[2px] bg-black/40 border border-white/[0.06]">
                        <span className="text-[9px] text-zinc-400 block">Location Y</span>
                        <span className="text-xs font-semibold text-rose-300 font-mono">
                          {Math.round(selectedNode.y)} px
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-zinc-400 pt-1">
                      <span>Node Width:</span>
                      <span className="font-semibold text-zinc-200">{selectedNode.width || 280} px</span>
                    </div>
                  </>
                ) : (
                  <div className="text-[10px] text-zinc-400 italic py-1">
                    Click any node in the graph to view spatial coordinates and port diagnostics.
                  </div>
                )}
              </div>
            </div>

            {/* Active Component Details or Node List */}
            {selectedNode ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[10px] text-zinc-400 uppercase tracking-wider font-bold">
                  <span>Active Component</span>
                  <span className="text-rose-400 uppercase text-[9.5px]">
                    {selectedNode.category}
                  </span>
                </div>

                <div className="p-3 rounded-[3px] bg-[#1a1d26] border border-[#2b313d] space-y-3">
                  <div>
                    <h3 className="font-display font-bold text-sm text-white tracking-wide leading-tight">
                      {selectedNode.title}
                    </h3>
                    <p className="font-mono text-[10px] text-rose-400/90 mt-0.5">
                      {selectedNode.subtitle}
                    </p>
                  </div>

                  {/* Port Diagnostic */}
                  <div className="space-y-2 pt-1 border-t border-white/[0.06]">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-zinc-400">Inputs ({connectedInputs.length}):</span>
                      <span className="text-zinc-200">
                        {selectedNode.inputs?.length || 0} Port{selectedNode.inputs?.length === 1 ? '' : 's'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-zinc-400">Outputs ({connectedOutputs.length}):</span>
                      <span className="text-zinc-200">
                        {selectedNode.outputs?.length || 0} Port{selectedNode.outputs?.length === 1 ? '' : 's'}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      playSound('open');
                      onOpenFocusedNode(selectedNode);
                    }}
                    className="w-full py-2 px-3 rounded-[3px] bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs tracking-wider uppercase flex items-center justify-between cursor-pointer transition-all shadow-[0_0_12px_rgba(244,63,94,0.3)] active:scale-[0.98]"
                  >
                    <span>INSPECT FULL SPECIFICATION</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px] text-zinc-400 uppercase tracking-wider font-bold">
                  <span>Scene Nodes ({nodes.length})</span>
                  <span className="text-zinc-400">Select to focus</span>
                </div>

                <div className="space-y-1 max-h-[340px] overflow-y-auto pr-1">
                  {nodes.map((n) => (
                    <button
                      key={n.id}
                      type="button"
                      onClick={() => {
                        playSound('select');
                        onSelectNode(n.id);
                      }}
                      className="w-full p-2 rounded-[2px] bg-[#1a1d26] hover:bg-[#222736] border border-[#2b313d] hover:border-rose-500/40 text-left transition-all cursor-pointer flex items-center justify-between group"
                    >
                      <div className="min-w-0 pr-2">
                        <span className="block font-semibold text-zinc-200 group-hover:text-white truncate text-[11px]">
                          {n.title}
                        </span>
                        <span className="block text-[9.5px] text-rose-400/80 truncate">
                          {n.subtitle}
                        </span>
                      </div>
                      <ChevronRight className="w-3 h-3 text-zinc-500 group-hover:text-rose-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === 'graph' && (
          <div className="space-y-4">
            {/* Active Connections List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[10px] text-zinc-400 uppercase tracking-wider font-bold">
                <span>Active Splines ({connections.length})</span>
                <span className="text-emerald-400">Signal: LIVE</span>
              </div>
              <div className="space-y-1 max-h-[220px] overflow-y-auto pr-1">
                {connections.map((c, idx) => (
                  <div
                    key={idx}
                    className="p-1.5 rounded-[2px] bg-[#1a1d26] border border-[#2b313d] text-[9.5px] text-zinc-300 flex items-center justify-between"
                  >
                    <span className="truncate max-w-[100px] text-zinc-400">{c.fromNodeId}</span>
                    <span className="text-rose-400 font-bold">&rarr;</span>
                    <span className="truncate max-w-[100px] text-zinc-200">{c.toNodeId}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'view' && (
          <div className="space-y-4">
            {/* Viewport Coordinates */}
            <div className="space-y-2">
              <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-bold block">
                Viewport Navigation
              </span>
              <div className="p-3 rounded-[3px] bg-[#1a1d26] border border-[#2b313d] space-y-2 text-[10.5px]">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Scale Level:</span>
                  <span className="font-bold text-white font-mono">
                    {Math.round(transform.scale * 100)}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Pan Offset X:</span>
                  <span className="font-mono text-zinc-200">{Math.round(transform.x)} px</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Pan Offset Y:</span>
                  <span className="font-mono text-zinc-200">{Math.round(transform.y)} px</span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    playSound('secondaryClick');
                    onFitScreen();
                  }}
                  className="w-full mt-2 py-1.5 rounded-[2px] bg-white/[0.06] hover:bg-white/[0.12] text-zinc-200 hover:text-white font-semibold text-[10px] uppercase transition-all cursor-pointer"
                >
                  Recenter Graph [Home]
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Status Strip */}
      <div className="p-2 border-t border-[#282d38] bg-[#111319] text-[9px] text-zinc-500 flex items-center justify-between shrink-0">
        <span>PRESS [N] TO TOGGLE</span>
        <span className="text-emerald-400 font-semibold">&bull; ACTIVE</span>
      </div>
    </aside>
  );
};
