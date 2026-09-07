import React, { useState, useRef, useEffect, useId } from 'react';
import { NodeData, Pin, CertificateItem, ProjectItem } from '../types';
import { PinPort } from './PinPort';
import { ProfileNodeContent } from './nodes/ProfileNodeContent';
import { SkillsNodeContent } from './nodes/SkillsNodeContent';
import { CertificatesNodeContent } from './nodes/CertificatesNodeContent';
import { ControlsNodeContent } from './nodes/ControlsNodeContent';
import { ProjectNodeContent } from './nodes/ProjectNodeContent';
import { ExperienceNodeContent } from './nodes/ExperienceNodeContent';
import { ClockNodeContent } from './nodes/ClockNodeContent';
import {
  GripHorizontal,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Activity,
  Layers,
  Award,
  Sliders,
  Eye,
  User,
  Clock as ClockIcon,
} from 'lucide-react';

interface GraphNodeProps {
  node: NodeData;
  scale: number;
  isSelected?: boolean;
  onSelectNode?: (nodeId: string) => void;
  onNodeDrag: (nodeId: string, deltaX: number, deltaY: number) => void;
  onOpenCertificateModal: (cert: CertificateItem) => void;
  onOpenProjectModal: (proj: ProjectItem) => void;
  onOpenContactModal: () => void;
  onOpenResumeModal: () => void;
  onOpenExpandedNode?: (node: NodeData) => void;
  onStartDragWire?: (pin: Pin, e: React.MouseEvent) => void;
  onEndDragWire?: (pin: Pin) => void;
}

const CATEGORY_ICON_MAP: Record<string, React.ReactNode> = {
  profile: <User className="w-3.5 h-3.5 text-rose-400" />,
  skills: <Layers className="w-3.5 h-3.5 text-rose-400" />,
  certificates: <Award className="w-3.5 h-3.5 text-rose-400" />,
  controls: <Sliders className="w-3.5 h-3.5 text-rose-400" />,
  project: <Eye className="w-3.5 h-3.5 text-rose-400" />,
  experience: <Activity className="w-3.5 h-3.5 text-rose-400" />,
  clock: <ClockIcon className="w-3.5 h-3.5 text-rose-400" />,
};

export const GraphNode: React.FC<GraphNodeProps> = ({
  node,
  scale,
  isSelected = false,
  onSelectNode,
  onNodeDrag,
  onOpenCertificateModal,
  onOpenProjectModal,
  onOpenContactModal,
  onOpenResumeModal,
  onOpenExpandedNode,
  onStartDragWire,
  onEndDragWire,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isDraggingRef = useRef(false);
  const dragStartPosRef = useRef({ x: 0, y: 0 });
  const nodeRef = useRef<HTMLDivElement>(null);
  const cardElementId = useId();

  // Mouse drag handler
  const handleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (['BUTTON', 'INPUT', 'SELECT', 'A'].includes(target.tagName) || target.closest('button')) {
      return;
    }

    e.stopPropagation();
    isDraggingRef.current = true;
    dragStartPosRef.current = { x: e.clientX, y: e.clientY };
    onSelectNode?.(node.id);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const dx = (moveEvent.clientX - dragStartPosRef.current.x) / scale;
      const dy = (moveEvent.clientY - dragStartPosRef.current.y) / scale;
      if (dx !== 0 || dy !== 0) {
        dragStartPosRef.current = { x: moveEvent.clientX, y: moveEvent.clientY };
        onNodeDrag(node.id, dx, dy);
      }
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Touch drag support for mobile / tablets
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    const target = e.target as HTMLElement;
    if (['BUTTON', 'INPUT', 'SELECT', 'A'].includes(target.tagName) || target.closest('button')) {
      return;
    }

    const touch = e.touches[0];
    isDraggingRef.current = true;
    dragStartPosRef.current = { x: touch.clientX, y: touch.clientY };
    onSelectNode?.(node.id);

    const handleTouchMove = (moveEvent: TouchEvent) => {
      if (!isDraggingRef.current || moveEvent.touches.length !== 1) return;
      const t = moveEvent.touches[0];
      const dx = (t.clientX - dragStartPosRef.current.x) / scale;
      const dy = (t.clientY - dragStartPosRef.current.y) / scale;
      if (dx !== 0 || dy !== 0) {
        dragStartPosRef.current = { x: t.clientX, y: t.clientY };
        onNodeDrag(node.id, dx, dy);
      }
    };

    const handleTouchEnd = () => {
      isDraggingRef.current = false;
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };

    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);
  };

  const hasInputs = node.inputs && node.inputs.length > 0;
  const hasOutputs = node.outputs && node.outputs.length > 0;

  return (
    <div
      ref={nodeRef}
      id={`graph-node-${node.id}`}
      style={{
        transform: `translate(${node.x}px, ${node.y}px)`,
        width: `${node.width}px`,
      }}
      className={`absolute select-none z-10 transition-shadow duration-200 ${
        isSelected ? 'z-30' : 'hover:z-20'
      }`}
      onClick={(e) => {
        e.stopPropagation();
        onSelectNode?.(node.id);
      }}
    >
      {/* Node Container Card with Dark Neumorphic Aesthetic (#212121) */}
      <div
        className={`rounded-[30px] node-card transition-all duration-200 overflow-hidden ${
          isSelected ? 'node-card-active ring-1 ring-rose-500/50 shadow-[0_0_30px_rgba(225,29,72,0.25)]' : 'hover:border-white/15'
        }`}
      >
        {/* Node Top Header (Draggable Bar) */}
        <div
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onDoubleClick={() => onOpenExpandedNode?.(node)}
          className="flex items-center justify-between px-4 py-3 rounded-t-[30px] bg-white/[0.04] border-b border-white/[0.08] cursor-grab active:cursor-grabbing hover:bg-white/[0.07] transition-colors"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Category Indicator Dot / Icon */}
            <div className="flex items-center justify-center w-6 h-6 rounded-md bg-white/[0.06] border border-white/10 shrink-0">
              {CATEGORY_ICON_MAP[node.category] || <Layers className="w-3.5 h-3.5 text-white" />}
            </div>

            <div className="min-w-0">
              <h3 className="text-sm sm:text-[15px] font-semibold text-white tracking-wide truncate font-display uppercase">
                {node.title}
              </h3>
              {node.subtitle && (
                <p className="text-xs font-body text-zinc-400 truncate tracking-normal font-medium mt-0.5">
                  {node.subtitle}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Focused Inspection Trigger */}
            <button
              type="button"
              onClick={() => onOpenExpandedNode?.(node)}
              className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Open focused inspection modal"
            >
              <Maximize2 className="w-3.5 h-3.5 text-rose-400" />
            </button>

            {/* Collapse toggle */}
            <button
              type="button"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
              title={isCollapsed ? 'Expand node' : 'Collapse node'}
            >
              {isCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
            </button>

            <GripHorizontal className="w-4 h-4 text-zinc-500 hover:text-zinc-300 transition-colors cursor-grab" />
          </div>
        </div>

        {/* Pins Section: Inputs on Left, Outputs on Right with Drag handlers */}
        {(hasInputs || hasOutputs) && (
          <div className="flex justify-between items-start px-3 py-2 bg-black/40 border-b border-white/[0.06] gap-3">
            {/* Input pins column */}
            <div className="flex flex-col gap-1 min-w-0">
              {node.inputs?.map((pin) => (
                <PinPort
                  key={pin.id}
                  pin={pin}
                  isConnected={true}
                  onStartDragWire={onStartDragWire}
                  onEndDragWire={onEndDragWire}
                />
              ))}
            </div>

            {/* Output pins column */}
            <div className="flex flex-col gap-1 min-w-0 ml-auto">
              {node.outputs?.map((pin) => (
                <PinPort
                  key={pin.id}
                  pin={pin}
                  isConnected={true}
                  onStartDragWire={onStartDragWire}
                  onEndDragWire={onEndDragWire}
                />
              ))}
            </div>
          </div>
        )}

        {/* Node Body Content with generous spacing to avoid text clipping */}
        {!isCollapsed && (
          <div className="p-4 sm:p-5 pb-6">
            {node.category === 'profile' && node.profile && (
              <ProfileNodeContent
                data={node.profile}
                onOpenContact={onOpenContactModal}
                onOpenResume={onOpenResumeModal}
              />
            )}

            {node.category === 'skills' && node.skills && (
              <SkillsNodeContent skills={node.skills} accentColor={node.accentColor} />
            )}

            {node.category === 'certificates' && node.certificates && (
              <CertificatesNodeContent
                certificates={node.certificates}
                onSelectCertificate={onOpenCertificateModal}
              />
            )}

            {node.category === 'controls' && (
              <ControlsNodeContent initialData={node.controlsData} />
            )}

            {node.category === 'project' && node.project && (
              <ProjectNodeContent
                project={node.project}
                onOpenModal={onOpenProjectModal}
              />
            )}

            {node.category === 'experience' && node.experience && (
              <ExperienceNodeContent experience={node.experience} />
            )}

            {node.category === 'clock' && (
              <ClockNodeContent />
            )}
          </div>
        )}
      </div>
    </div>
  );
};
