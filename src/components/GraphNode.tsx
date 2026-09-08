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
  Grip,
  ChevronDown,
  ChevronUp,
  Maximize,
  Activity,
  Layers,
  Award,
  Sliders,
  Eye,
  User,
  Clock,
  Plus,
  Minus,
} from './icons';

interface GraphNodeProps {
  node: NodeData;
  scale: number;
  nodeScale?: number;
  isSelected?: boolean;
  isDimmed?: boolean;
  onSelectNode?: (nodeId: string) => void;
  onNodeDrag: (nodeId: string, deltaX: number, deltaY: number) => void;
  onNodeResize?: (nodeId: string, newWidth: number) => void;
  onUpdateNodeScale?: (scale: number) => void;
  onOpenCertificateModal: (cert: CertificateItem) => void;
  onOpenProjectModal: (proj: ProjectItem) => void;
  onOpenContactModal: () => void;
  onOpenResumeModal: () => void;
  onOpenFocusedNode?: (node: NodeData) => void;
  onDragStateChange?: (nodeId: string, isDragging: boolean) => void;
}

const CATEGORY_ICON_MAP: Record<string, React.ReactNode> = {
  profile: <User className="w-3.5 h-3.5 text-rose-400" />,
  skills: <Layers className="w-3.5 h-3.5 text-rose-400" />,
  certificates: <Award className="w-3.5 h-3.5 text-rose-400" />,
  controls: <Sliders className="w-3.5 h-3.5 text-rose-400" />,
  project: <Eye className="w-3.5 h-3.5 text-rose-400" />,
  experience: <Activity className="w-3.5 h-3.5 text-rose-400" />,
  clock: <Clock className="w-3.5 h-3.5 text-rose-400" />,
};

const GraphNodeComponent: React.FC<GraphNodeProps> = ({
  node,
  scale,
  nodeScale = 1.0,
  isSelected = false,
  isDimmed = false,
  onSelectNode,
  onNodeDrag,
  onNodeResize,
  onUpdateNodeScale,
  onOpenCertificateModal,
  onOpenProjectModal,
  onOpenContactModal,
  onOpenResumeModal,
  onOpenFocusedNode,
  onDragStateChange,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const isDraggingRef = useRef(false);
  const isResizingRef = useRef(false);
  const dragStartPosRef = useRef({ x: 0, y: 0 });
  const nodeRef = useRef<HTMLDivElement>(null);
  const cardElementId = useId();

  // Mouse drag corner resize handler
  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    isResizingRef.current = true;
    setIsResizing(true);
    const startX = e.clientX;
    const startWidth = node.width;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isResizingRef.current) return;
      const dx = (moveEvent.clientX - startX) / scale;
      const newWidth = Math.round(Math.max(240, Math.min(650, startWidth + dx)));
      onNodeResize?.(node.id, newWidth);
    };

    const handleMouseUp = () => {
      isResizingRef.current = false;
      setIsResizing(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Touch drag corner resize handler
  const handleResizeTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    if (e.touches.length === 0) return;
    isResizingRef.current = true;
    setIsResizing(true);
    const startX = e.touches[0].clientX;
    const startWidth = node.width;

    const handleTouchMove = (moveEvent: TouchEvent) => {
      if (!isResizingRef.current || moveEvent.touches.length === 0) return;
      const dx = (moveEvent.touches[0].clientX - startX) / scale;
      const newWidth = Math.round(Math.max(240, Math.min(650, startWidth + dx)));
      onNodeResize?.(node.id, newWidth);
    };

    const handleTouchEnd = () => {
      isResizingRef.current = false;
      setIsResizing(false);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };

    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);
  };

  // Mouse drag handler
  const handleMouseDown = (e: React.MouseEvent) => {
    // Avoid dragging if clicking an interactive control like input/button
    const target = e.target as HTMLElement;
    if (['BUTTON', 'INPUT', 'SELECT', 'A'].includes(target.tagName) || target.closest('button')) {
      return;
    }

    e.stopPropagation();
    isDraggingRef.current = true;
    setIsDragging(true);
    onDragStateChange?.(node.id, true);
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
      setIsDragging(false);
      onDragStateChange?.(node.id, false);
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
    setIsDragging(true);
    onDragStateChange?.(node.id, true);
    dragStartPosRef.current = { x: touch.clientX, y: touch.clientY };
    onSelectNode?.(node.id);

    const handleTouchMove = (moveEvent: TouchEvent) => {
      if (!isDraggingRef.current || moveEvent.touches.length !== 1) return;
      // Prevent browser default page scrolling while dragging node
      if (moveEvent.cancelable) {
        moveEvent.preventDefault();
      }
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
      setIsDragging(false);
      onDragStateChange?.(node.id, false);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };

    window.addEventListener('touchmove', handleTouchMove, { passive: false });
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
        opacity: isDimmed ? 0.38 : 1,
        transition: isDragging ? 'none' : 'opacity 0.2s ease, transform 0.15s cubic-bezier(0.25, 1, 0.5, 1)',
        willChange: isDragging ? 'transform' : 'auto',
      }}
      className={`absolute select-none ${
        isDragging
          ? 'z-40'
          : isSelected
          ? 'z-30'
          : 'z-10 hover:z-20 hover:opacity-100'
      }`}
      onClick={(e) => {
        e.stopPropagation();
        onSelectNode?.(node.id);
      }}
    >
      {/* Node Container Card with Dark Neumorphic Aesthetic */}
      <div
        style={{
          transition: isDragging ? 'none' : undefined,
        }}
        className={`rounded-[30px] node-card transition-all duration-200 ${
          isSelected ? 'node-card-active ring-1 ring-rose-500/40 shadow-[0_0_30px_rgba(225,29,72,0.25)]' : 'hover:border-white/10'
        }`}
      >
        {/* Node Top Header (Draggable Bar) */}
        <div
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onDoubleClick={() => onOpenFocusedNode?.(node)}
          className="flex items-center justify-between px-4 py-3 rounded-t-[30px] bg-white/[0.03] border-b border-white/[0.06] cursor-grab active:cursor-grabbing hover:bg-white/[0.06] transition-colors"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Category Indicator Dot / Icon */}
            <div className="flex items-center justify-center w-5 h-5 rounded-md bg-white/[0.06] border border-white/10 shrink-0">
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

          <div className="flex items-center gap-1 shrink-0">
            {/* Open Focused Artifact Modal */}
            {onOpenFocusedNode && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenFocusedNode(node);
                }}
                className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                title="Inspect detailed artifact"
              >
                <Maximize className="w-3.5 h-3.5 text-rose-400" />
              </button>
            )}

            {/* Quick Node Size Stepper */}
            {onNodeResize && (
              <div className="flex items-center bg-black/30 rounded-md p-0.5 border border-white/[0.08]">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onNodeResize(node.id, Math.max(240, node.width - 30));
                  }}
                  className="p-0.5 rounded text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                  title="Shrink Node Width (-30px)"
                >
                  <Minus className="w-2.5 h-2.5" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onNodeResize(node.id, Math.min(650, node.width + 30));
                  }}
                  className="p-0.5 rounded text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                  title="Expand Node Width (+30px)"
                >
                  <Plus className="w-2.5 h-2.5" />
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
              title={isCollapsed ? 'Expand node' : 'Collapse node'}
            >
              {isCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
            </button>
            <Grip className="w-4 h-4 text-zinc-500 hover:text-zinc-300 transition-colors cursor-grab" />
          </div>
        </div>

        {/* Pins Section: Inputs on Left, Outputs on Right */}
        {(hasInputs || hasOutputs) && (
          <div className="flex justify-between items-start px-3 py-2 bg-black/30 border-b border-white/[0.05] gap-3">
            {/* Input pins column */}
            <div className="flex flex-col gap-1 min-w-0">
              {node.inputs?.map((pin) => (
                <PinPort
                  key={pin.id}
                  pin={pin}
                  isConnected={true}
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
                />
              ))}
            </div>
          </div>
        )}

        {/* Node Body Content */}
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
              <SkillsNodeContent
                skills={node.skills}
                accentColor={node.accentColor}
                onExplore={() => onOpenFocusedNode?.(node)}
              />
            )}

            {node.category === 'certificates' && node.certificates && (
              <CertificatesNodeContent
                certificates={node.certificates}
                onSelectCertificate={onOpenCertificateModal}
                onExplore={() => onOpenFocusedNode?.(node)}
              />
            )}

            {node.category === 'controls' && (
              <ControlsNodeContent
                initialData={node.controlsData}
                nodeScale={nodeScale}
                onUpdateNodeScale={onUpdateNodeScale}
              />
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

        {/* Interactive Corner Resize Grip Handle */}
        {onNodeResize && (
          <div
            onMouseDown={handleResizeMouseDown}
            onTouchStart={handleResizeTouchStart}
            title="Drag to resize node square"
            className="absolute bottom-1 right-1.5 w-5 h-5 flex items-end justify-end p-0.5 cursor-se-resize text-zinc-600 hover:text-rose-400 transition-colors z-20 group/resize select-none"
          >
            <svg
              width="10"
              height="10"
              viewBox="0 0 10 10"
              fill="currentColor"
              className="opacity-40 group-hover/resize:opacity-100 transition-opacity"
            >
              <circle cx="8" cy="8" r="1" />
              <circle cx="8" cy="4.5" r="1" />
              <circle cx="4.5" cy="8" r="1" />
              <circle cx="8" cy="1" r="1" />
              <circle cx="4.5" cy="4.5" r="1" />
              <circle cx="1" cy="8" r="1" />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
};

export const GraphNode = React.memo(GraphNodeComponent, (prev, next) => {
  return (
    prev.node.x === next.node.x &&
    prev.node.y === next.node.y &&
    prev.node.width === next.node.width &&
    prev.scale === next.scale &&
    prev.nodeScale === next.nodeScale &&
    prev.isSelected === next.isSelected &&
    prev.isDimmed === next.isDimmed &&
    prev.node.id === next.node.id
  );
});
