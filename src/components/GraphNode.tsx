import React, { useState, useRef, useEffect, useId, useCallback } from 'react';
import { NodeData, Pin, CertificateItem, ProjectItem } from '../types';
import { PinPort } from './PinPort';
import { ProfileNodeContent } from './nodes/ProfileNodeContent';
import { SkillsNodeContent } from './nodes/SkillsNodeContent';
import { CertificatesNodeContent } from './nodes/CertificatesNodeContent';
import { ControlsNodeContent } from './nodes/ControlsNodeContent';
import { ProjectNodeContent } from './nodes/ProjectNodeContent';
import { ExperienceNodeContent } from './nodes/ExperienceNodeContent';
import { ClockNodeContent } from './nodes/ClockNodeContent';
import { ResearchMiniVisualizer } from './nodes/ResearchMiniVisualizer';
import { VisitorNodeContent } from './nodes/VisitorNodeContent';
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
  BarChart,
  Binary,
  Database,
  Sparkles,
  Terminal,
  Compass,
  Cpu,
  FileText,
  Trash,
} from './icons';

interface GraphNodeProps {
  node: NodeData;
  scale: number;
  isSelected?: boolean;
  isDimmed?: boolean;
  onSelectNode?: (nodeId: string) => void;
  onNodeDrag: (nodeId: string, deltaX: number, deltaY: number) => void;
  onNodeResize?: (nodeId: string, newWidth: number) => void;
  onOpenCertificateModal: (cert: CertificateItem) => void;
  onOpenProjectModal: (proj: ProjectItem) => void;
  onOpenContactModal: () => void;
  onOpenResumeModal: () => void;
  onOpenFocusedNode?: (node: NodeData) => void;
  onDragStateChange?: (nodeId: string, isDragging: boolean) => void;
  onDeleteVisitorNode?: (id: string) => void;
}

const CATEGORY_ICON_MAP: Record<string, React.ReactNode> = {
  profile: <User className="w-3.5 h-3.5 text-rose-400" />,
  skills: <Layers className="w-3.5 h-3.5 text-rose-400" />,
  certificates: <Award className="w-3.5 h-3.5 text-rose-400" />,
  controls: <Sliders className="w-3.5 h-3.5 text-rose-400" />,
  project: <Eye className="w-3.5 h-3.5 text-rose-400" />,
  experience: <Activity className="w-3.5 h-3.5 text-rose-400" />,
  clock: <Clock className="w-3.5 h-3.5 text-rose-400" />,
  statistics: <BarChart className="w-3.5 h-3.5 text-rose-400" />,
  optimization: <Sliders className="w-3.5 h-3.5 text-rose-400" />,
  pipeline: <Binary className="w-3.5 h-3.5 text-rose-400" />,
  evaluation: <Activity className="w-3.5 h-3.5 text-rose-400" />,
  vectors: <Database className="w-3.5 h-3.5 text-rose-400" />,
  vision: <Eye className="w-3.5 h-3.5 text-rose-400" />,
  generative: <Sparkles className="w-3.5 h-3.5 text-rose-400" />,
  software: <Terminal className="w-3.5 h-3.5 text-rose-400" />,
  experiment: <Compass className="w-3.5 h-3.5 text-rose-400" />,
  computational: <Cpu className="w-3.5 h-3.5 text-rose-400" />,
  visitor: <FileText className="w-3.5 h-3.5 text-rose-400" />,
};

const GraphNodeComponent: React.FC<GraphNodeProps> = ({
  node,
  scale,
  isSelected = false,
  isDimmed = false,
  onSelectNode,
  onNodeDrag,
  onNodeResize,
  onOpenCertificateModal,
  onOpenProjectModal,
  onOpenContactModal,
  onOpenResumeModal,
  onOpenFocusedNode,
  onDragStateChange,
  onDeleteVisitorNode,
}) => {
  if (!node || typeof node !== 'object' || typeof node.x !== 'number' || !isFinite(node.x) || typeof node.y !== 'number' || !isFinite(node.y)) {
    return null;
  }

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isOriginExpanding, setIsOriginExpanding] = useState(false);
  const isDraggingRef = useRef(false);
  const isResizingRef = useRef(false);
  const isMouseDownRef = useRef(false);
  const hasActuallyDraggedRef = useRef(false);
  const dragStartClientPosRef = useRef({ x: 0, y: 0 });
  const dragStartPosRef = useRef({ x: 0, y: 0 });
  const touchStartPosRef = useRef({ x: 0, y: 0 });
  const touchHasDraggedRef = useRef(false);
  const lastTouchTapRef = useRef<{ time: number; x: number; y: number }>({ time: 0, x: 0, y: 0 });
  const nodeRef = useRef<HTMLDivElement>(null);
  const cardElementId = useId();

  const onNodeDragRef = useRef(onNodeDrag);
  onNodeDragRef.current = onNodeDrag;
  const scaleRef = useRef(scale);
  scaleRef.current = scale;

  const handleOpenFocus = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsOriginExpanding(true);
    setTimeout(() => setIsOriginExpanding(false), 450);
    onOpenFocusedNode?.(node);
  }, [node, onOpenFocusedNode]);

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    // Avoid opening modal if clicking interactive controls or resize handles
    const target = e.target as HTMLElement;
    if (
      ['BUTTON', 'INPUT', 'SELECT', 'A', 'TEXTAREA'].includes(target.tagName) ||
      target.closest('button') ||
      target.closest('a') ||
      target.closest('input') ||
      target.closest('select') ||
      target.closest('.port-pin') ||
      target.closest('.resize-handle') ||
      target.closest('[data-resize-handle]') ||
      target.closest('.group\\/side-resize') ||
      target.closest('.group\\/corner-resize')
    ) {
      return;
    }

    // Exclude deliberate resize sides and corners geometrically
    if (nodeRef.current) {
      const rect = nodeRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      const fromRight = rect.width - clickX;
      const fromBottom = rect.height - clickY;

      // Bottom-right corner resize zone: within 28px of right and bottom edges
      const isBottomRightCorner = fromRight <= 28 && fromBottom <= 28;
      // Right side resize zone: within 16px of right edge
      const isRightSide = fromRight <= 16;

      if (isBottomRightCorner || isRightSide) {
        return;
      }
    }

    e.stopPropagation();
    handleOpenFocus(e);
  }, [handleOpenFocus]);

  // Deliberate Side / Corner Resize Mouse Handler
  const handleResizeMouseDown = (e: React.MouseEvent, direction: 'right' | 'corner') => {
    e.stopPropagation();
    e.preventDefault();
    isResizingRef.current = true;
    setIsResizing(true);
    document.body.style.cursor = direction === 'right' ? 'ew-resize' : 'nwse-resize';
    const startX = e.clientX;
    const startWidth = node.width;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isResizingRef.current) return;
      const dx = (moveEvent.clientX - startX) / scale;
      const newWidth = Math.round(Math.max(240, Math.min(680, startWidth + dx)));
      onNodeResize?.(node.id, newWidth);
    };

    const handleMouseUp = () => {
      isResizingRef.current = false;
      setIsResizing(false);
      document.body.style.cursor = '';
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Deliberate Side / Corner Resize Touch Handler
  const handleResizeTouchStart = (e: React.TouchEvent, direction: 'right' | 'corner') => {
    e.stopPropagation();
    if (e.touches.length === 0) return;
    isResizingRef.current = true;
    setIsResizing(true);
    const startX = e.touches[0].clientX;
    const startWidth = node.width;

    const handleTouchMove = (moveEvent: TouchEvent) => {
      if (!isResizingRef.current || moveEvent.touches.length === 0) return;
      const dx = (moveEvent.touches[0].clientX - startX) / scale;
      const newWidth = Math.round(Math.max(240, Math.min(680, startWidth + dx)));
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

  // Mouse drag handler with threshold to preserve clean double-click gestures
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;

    // Avoid dragging if clicking an interactive control like input/button/link/pin/resize-handle
    const target = e.target as HTMLElement;
    if (
      ['BUTTON', 'INPUT', 'SELECT', 'A', 'TEXTAREA'].includes(target.tagName) ||
      target.closest('button') ||
      target.closest('a') ||
      target.closest('.port-pin') ||
      target.closest('.resize-handle') ||
      target.closest('[data-resize-handle]') ||
      target.closest('.group\\/side-resize') ||
      target.closest('.group\\/corner-resize')
    ) {
      return;
    }

    e.stopPropagation();
    isMouseDownRef.current = true;
    hasActuallyDraggedRef.current = false;
    dragStartClientPosRef.current = { x: e.clientX, y: e.clientY };
    dragStartPosRef.current = { x: e.clientX, y: e.clientY };
    onSelectNode?.(node.id);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isMouseDownRef.current) return;

      const clientDx = moveEvent.clientX - dragStartClientPosRef.current.x;
      const clientDy = moveEvent.clientY - dragStartClientPosRef.current.y;

      // Only engage drag if movement exceeds threshold (prevents micro-movements on double-click from dragging)
      if (!hasActuallyDraggedRef.current) {
        if (Math.hypot(clientDx, clientDy) > 4) {
          hasActuallyDraggedRef.current = true;
          isDraggingRef.current = true;
          setIsDragging(true);
          onDragStateChange?.(node.id, true);
          dragStartPosRef.current = { x: moveEvent.clientX, y: moveEvent.clientY };
        } else {
          return;
        }
      }

      const s = scaleRef.current || 1;
      const dx = (moveEvent.clientX - dragStartPosRef.current.x) / s;
      const dy = (moveEvent.clientY - dragStartPosRef.current.y) / s;
      if (dx !== 0 || dy !== 0) {
        dragStartPosRef.current = { x: moveEvent.clientX, y: moveEvent.clientY };
        onNodeDragRef.current?.(node.id, dx, dy);
      }
    };

    const handleMouseUp = () => {
      isMouseDownRef.current = false;
      if (hasActuallyDraggedRef.current) {
        isDraggingRef.current = false;
        setIsDragging(false);
        onDragStateChange?.(node.id, false);
      }
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Touch drag & double-tap support for mobile / tablets
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    const target = e.target as HTMLElement;
    if (
      ['BUTTON', 'INPUT', 'SELECT', 'A', 'TEXTAREA'].includes(target.tagName) ||
      target.closest('button') ||
      target.closest('a') ||
      target.closest('.port-pin') ||
      target.closest('.resize-handle') ||
      target.closest('[data-resize-handle]') ||
      target.closest('.group\\/side-resize') ||
      target.closest('.group\\/corner-resize')
    ) {
      return;
    }

    const touch = e.touches[0];
    touchStartPosRef.current = { x: touch.clientX, y: touch.clientY };
    dragStartPosRef.current = { x: touch.clientX, y: touch.clientY };
    touchHasDraggedRef.current = false;
    onSelectNode?.(node.id);

    const handleTouchMove = (moveEvent: TouchEvent) => {
      if (moveEvent.touches.length !== 1) return;
      const t = moveEvent.touches[0];
      const dist = Math.hypot(
        t.clientX - touchStartPosRef.current.x,
        t.clientY - touchStartPosRef.current.y
      );

      if (!touchHasDraggedRef.current) {
        if (dist > 6) {
          touchHasDraggedRef.current = true;
          isDraggingRef.current = true;
          setIsDragging(true);
          onDragStateChange?.(node.id, true);
          dragStartPosRef.current = { x: t.clientX, y: t.clientY };
        } else {
          return;
        }
      }

      if (moveEvent.cancelable) {
        moveEvent.preventDefault();
      }
      const s = scaleRef.current || 1;
      const dx = (t.clientX - dragStartPosRef.current.x) / s;
      const dy = (t.clientY - dragStartPosRef.current.y) / s;
      if (dx !== 0 || dy !== 0) {
        dragStartPosRef.current = { x: t.clientX, y: t.clientY };
        onNodeDragRef.current?.(node.id, dx, dy);
      }
    };

    const handleTouchEnd = (endEvent: TouchEvent) => {
      if (touchHasDraggedRef.current) {
        isDraggingRef.current = false;
        setIsDragging(false);
        onDragStateChange?.(node.id, false);
      } else {
        // Detect intentional double tap on touchscreen
        const touchEnd = endEvent.changedTouches[0];
        if (touchEnd) {
          // Check if touch target is a resize handle
          const targetEl = document.elementFromPoint(touchEnd.clientX, touchEnd.clientY);
          if (
            targetEl?.closest('.resize-handle') ||
            targetEl?.closest('[data-resize-handle]') ||
            targetEl?.closest('.group\\/side-resize') ||
            targetEl?.closest('.group\\/corner-resize')
          ) {
            return;
          }

          if (nodeRef.current) {
            const rect = nodeRef.current.getBoundingClientRect();
            const touchX = touchEnd.clientX - rect.left;
            const touchY = touchEnd.clientY - rect.top;
            const fromRight = rect.width - touchX;
            const fromBottom = rect.height - touchY;
            if ((fromRight <= 28 && fromBottom <= 28) || fromRight <= 16) {
              return;
            }
          }

          const now = Date.now();
          const dt = now - lastTouchTapRef.current.time;
          const dist = Math.hypot(
            touchEnd.clientX - lastTouchTapRef.current.x,
            touchEnd.clientY - lastTouchTapRef.current.y
          );
          if (dt > 0 && dt < 320 && dist < 25) {
            handleOpenFocus();
            lastTouchTapRef.current = { time: 0, x: 0, y: 0 };
          } else {
            lastTouchTapRef.current = { time: now, x: touchEnd.clientX, y: touchEnd.clientY };
          }
        }
      }
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
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onDoubleClick={handleDoubleClick}
      title="Double-click to open detailed artifact"
      style={{
        transform: `translate(${node.x}px, ${node.y}px)`,
        width: `${node.width}px`,
        opacity: isDimmed ? 0.38 : 1,
        transition: isDragging ? 'none' : 'opacity 0.2s ease, transform 0.15s cubic-bezier(0.25, 1, 0.5, 1)',
        willChange: isDragging ? 'transform' : 'auto',
      }}
      className={`absolute select-none cursor-grab active:cursor-grabbing ${
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
        onDoubleClick={handleDoubleClick}
        style={{
          transition: isDragging ? 'none' : undefined,
        }}
        className={`${
          node.shape === 'capsule'
            ? 'rounded-[36px]'
            : node.shape === 'sticky'
            ? 'rounded-2xl rotate-[-1deg]'
            : 'rounded-[30px]'
        } node-card transition-all duration-300 ${
          isOriginExpanding
            ? 'ring-2 ring-rose-500 shadow-[0_0_35px_rgba(244,63,94,0.6)] border-rose-500/80 scale-[1.015]'
            : isSelected
            ? 'node-card-active ring-1 ring-rose-500/40 shadow-[0_0_30px_rgba(225,29,72,0.25)]'
            : 'hover:border-white/10'
        }`}
      >
        {/* Node Top Header (Draggable Bar) */}
        <div
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onDoubleClick={handleDoubleClick}
          className={`flex items-center justify-between px-4 py-3 ${
            node.shape === 'capsule'
              ? 'rounded-t-[36px]'
              : node.shape === 'sticky'
              ? 'rounded-t-2xl'
              : 'rounded-t-[30px]'
          } bg-white/[0.03] border-b border-white/[0.06] cursor-grab active:cursor-grabbing hover:bg-white/[0.06] transition-colors`}
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
                onClick={handleOpenFocus}
                className={`p-1 rounded-md transition-all duration-200 ${
                  isOriginExpanding
                    ? 'text-white bg-rose-500/20 scale-110 shadow-[0_0_12px_rgba(244,63,94,0.4)]'
                    : 'text-zinc-400 hover:text-white hover:bg-white/10'
                }`}
                title="Inspect detailed artifact"
              >
                <Maximize className="w-3.5 h-3.5 text-rose-400" />
              </button>
            )}

            {/* Remove option for personal notes */}
            {node.category === 'visitor' && onDeleteVisitorNode && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteVisitorNode(node.id);
                }}
                className="p-1 rounded-md text-zinc-400 hover:text-rose-400 hover:bg-rose-500/20 transition-all cursor-pointer group/del"
                title="Remove personal note"
                aria-label="Remove personal note"
              >
                <Trash className="w-3.5 h-3.5 text-rose-400/80 group-hover/del:text-rose-400 transition-colors" />
              </button>
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
                onExplore={() => handleOpenFocus()}
              />
            )}

            {node.category === 'certificates' && node.certificates && (
              <CertificatesNodeContent
                certificates={node.certificates}
                onSelectCertificate={onOpenCertificateModal}
                onExplore={() => handleOpenFocus()}
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

            {node.category === 'visitor' && node.visitorData && (
              <VisitorNodeContent
                visitorData={node.visitorData}
                onDelete={onDeleteVisitorNode}
              />
            )}

            {node.researchData && (
              <div className="p-4 space-y-3 font-body">
                {/* Domain & State Header Badge */}
                <div className="flex items-center justify-between text-[10px] font-tech text-zinc-400 uppercase tracking-widest border-b border-white/[0.06] pb-2">
                  <span className="text-rose-400 font-bold truncate max-w-[170px]">
                    {node.researchData.domain}
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/[0.06] text-zinc-300 font-medium shrink-0">
                    {node.researchData.state}
                  </span>
                </div>

                {/* Dedicated Lightweight Mini-Visualization */}
                <ResearchMiniVisualizer
                  type={node.researchData.visualizationType || 'distribution'}
                  accentColor={node.accentColor}
                />

                {/* Abstract Preview */}
                <p className="text-xs text-zinc-300 line-clamp-2 leading-relaxed font-normal">
                  {node.researchData.overview}
                </p>

                {/* Tags */}
                {Array.isArray(node.researchData.tags) && (
                  <div className="flex flex-wrap gap-1 pt-0.5">
                    {node.researchData.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded bg-white/[0.03] border border-white/[0.06] text-[9px] font-tech text-zinc-400"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* View Technical Specification Trigger */}
                {onOpenFocusedNode && (
                  <button
                    type="button"
                    onClick={handleOpenFocus}
                    className="w-full pt-1 text-left text-[11px] font-tech font-semibold text-rose-400 hover:text-rose-300 transition-colors uppercase tracking-wider flex items-center justify-between group/link cursor-pointer"
                  >
                    <span>View Technical Specification</span>
                    <span className="group-hover/link:translate-x-0.5 transition-transform">↗</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* ═══════════ DELIBERATE SIDE & CORNER RESIZE HANDLES ═══════════ */}
        {onNodeResize && (
          <>
            {/* Right Side Edge Resize Zone: Shows standard OS-style horizontal arrow ↔ */}
            <div
              onMouseDown={(e) => handleResizeMouseDown(e, 'right')}
              onTouchStart={(e) => handleResizeTouchStart(e, 'right')}
              onDoubleClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
              }}
              data-resize-handle="side"
              title="Drag side to resize node width"
              className="resize-handle resize-handle-side absolute -right-2 top-4 bottom-4 w-4 z-30 cursor-ew-resize flex items-center justify-center group/side-resize"
            >
              {/* Subtle hover hairline indicator */}
              <div className="w-[3px] h-12 rounded-full bg-white/20 group-hover/side-resize:bg-rose-500/80 group-hover/side-resize:shadow-[0_0_8px_#f43f5e] transition-all duration-150" />

              {/* Standard OS Double-Ended Horizontal Resize Arrow: ↔ */}
              <div
                className={`absolute -right-3 p-1 rounded-md bg-[#0c0e14]/95 border border-rose-500/70 shadow-[0_0_12px_rgba(244,63,94,0.45)] text-rose-400 pointer-events-none transition-all duration-150 ${
                  isResizing
                    ? 'opacity-100 scale-105'
                    : 'opacity-0 group-hover/side-resize:opacity-100 scale-90 group-hover/side-resize:scale-100'
                }`}
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="7 8 3 12 7 16" />
                  <polyline points="17 8 21 12 17 16" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                </svg>
              </div>
            </div>

            {/* Bottom-Right Corner Resize Zone: Shows standard OS-style diagonal arrow ⤡ */}
            <div
              onMouseDown={(e) => handleResizeMouseDown(e, 'corner')}
              onTouchStart={(e) => handleResizeTouchStart(e, 'corner')}
              onDoubleClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
              }}
              data-resize-handle="corner"
              title="Drag corner to resize node square"
              className="resize-handle resize-handle-corner absolute -bottom-2 -right-2 w-7 h-7 z-30 cursor-nwse-resize flex items-center justify-center group/corner-resize"
            >
              {/* Standard OS Diagonal Window Resize Arrow: ⤡ */}
              <div
                className={`p-1.5 rounded-md bg-[#0c0e14]/95 border border-rose-500/80 shadow-[0_0_12px_rgba(244,63,94,0.5)] text-rose-400 pointer-events-none transition-all duration-150 ${
                  isResizing
                    ? 'opacity-100 scale-105'
                    : 'opacity-0 group-hover/corner-resize:opacity-100 scale-90 group-hover/corner-resize:scale-100'
                }`}
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="15 3 21 3 21 9" />
                  <polyline points="9 21 3 21 3 15" />
                  <line x1="21" y1="3" x2="3" y2="21" />
                </svg>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export const GraphNode = React.memo(GraphNodeComponent, (prev, next) => {
  if (!prev?.node || !next?.node) return false;
  return (
    prev.node.x === next.node.x &&
    prev.node.y === next.node.y &&
    prev.node.width === next.node.width &&
    prev.scale === next.scale &&
    prev.isSelected === next.isSelected &&
    prev.isDimmed === next.isDimmed &&
    prev.node.id === next.node.id
  );
});
