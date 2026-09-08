import React, { SVGProps } from 'react';
import {
  ArrowRight as UntitledArrowRight,
  ArrowLeft as UntitledArrowLeft,
  ArrowUp as UntitledArrowUp,
  ArrowDown as UntitledArrowDown,
  ArrowUpRight as UntitledArrowUpRight,
  ChevronDown as UntitledChevronDown,
  ChevronUp as UntitledChevronUp,
  ChevronRight as UntitledChevronRight,
  ChevronLeft as UntitledChevronLeft,
  XClose as UntitledXClose,
  Plus as UntitledPlus,
  Minus as UntitledMinus,
  Maximize01 as UntitledMaximize01,
  SearchMd as UntitledSearchMd,
  LinkExternal01 as UntitledLinkExternal01,
  Copy01 as UntitledCopy01,
  Check as UntitledCheck,
  CheckCircle as UntitledCheckCircle,
  Send01 as UntitledSend01,
  Share07 as UntitledShare07,
  Printer as UntitledPrinter,
  RefreshCcw01 as UntitledRefreshCcw01,
  Sliders01 as UntitledSliders01,
  Grid01 as UntitledGrid01,
  DotsGrid as UntitledDotsGrid,
  Activity as UntitledActivity,
  Clock as UntitledClock,
  CpuChip01 as UntitledCpuChip01,
  LayersTwo01 as UntitledLayersTwo01,
  Terminal as UntitledTerminal,
  Code01 as UntitledCode01,
  Compass as UntitledCompass,
  Eye as UntitledEye,
  User01 as UntitledUser01,
  Award01 as UntitledAward01,
  Mail01 as UntitledMail01,
  Calendar as UntitledCalendar,
  Briefcase01 as UntitledBriefcase01,
  Building01 as UntitledBuilding01,
  File02 as UntitledFile02,
  ShieldTick as UntitledShieldTick,
  Globe01 as UntitledGlobe01,
  Stars01 as UntitledStars01,
  GitCommit as UntitledGitCommit,
  BarChart01 as UntitledBarChart01,
  Dataflow01 as UntitledDataflow01,
  Database01 as UntitledDatabase01,
  BookOpen01 as UntitledBookOpen01,
  Menu01 as UntitledMenu01,
  VolumeMax as UntitledVolumeMax,
  VolumeX as UntitledVolumeX,
} from '@untitledui/icons';

export interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number;
  className?: string;
  color?: string;
  strokeWidth?: number | string;
}

/**
 * Higher-order wrapper to enforce Untitled UI design system standards:
 * - Default stroke-width: 1.5
 * - Color inheritance: currentColor / inherit
 * - Semantic class pass-through
 */
function createIcon(Component: React.ComponentType<any>, defaultStrokeWidth: number = 1.5) {
  const WrappedIcon: React.FC<IconProps> = ({
    strokeWidth = defaultStrokeWidth,
    className = '',
    ...props
  }) => {
    return <Component strokeWidth={strokeWidth} className={className} {...props} />;
  };
  return WrappedIcon;
}

// Directional & Navigation
export const ArrowRight = createIcon(UntitledArrowRight);
export const ArrowLeft = createIcon(UntitledArrowLeft);
export const ArrowUp = createIcon(UntitledArrowUp);
export const ArrowDown = createIcon(UntitledArrowDown);
export const ArrowUpRight = createIcon(UntitledArrowUpRight);
export const ChevronDown = createIcon(UntitledChevronDown);
export const ChevronUp = createIcon(UntitledChevronUp);
export const ChevronRight = createIcon(UntitledChevronRight);
export const ChevronLeft = createIcon(UntitledChevronLeft);

// Actions & Controls
export const Close = createIcon(UntitledXClose);
export const Plus = createIcon(UntitledPlus);
export const Minus = createIcon(UntitledMinus);
export const Maximize = createIcon(UntitledMaximize01);
export const Search = createIcon(UntitledSearchMd);
export const ExternalLink = createIcon(UntitledLinkExternal01);
export const Copy = createIcon(UntitledCopy01);
export const Check = createIcon(UntitledCheck);
export const CheckCircle = createIcon(UntitledCheckCircle);
export const Send = createIcon(UntitledSend01);
export const Share = createIcon(UntitledShare07);
export const Printer = createIcon(UntitledPrinter);
export const RotateCcw = createIcon(UntitledRefreshCcw01);
export const Sliders = createIcon(UntitledSliders01);
export const Grid = createIcon(UntitledGrid01);
export const Grip = createIcon(UntitledDotsGrid);
export const Menu = createIcon(UntitledMenu01);
export const VolumeMax = createIcon(UntitledVolumeMax);
export const VolumeX = createIcon(UntitledVolumeX);

// Semantic Domain & Workspace
export const Activity = createIcon(UntitledActivity);
export const Clock = createIcon(UntitledClock);
export const Cpu = createIcon(UntitledCpuChip01);
export const Layers = createIcon(UntitledLayersTwo01);
export const Terminal = createIcon(UntitledTerminal);
export const Code = createIcon(UntitledCode01);
export const Compass = createIcon(UntitledCompass);
export const Eye = createIcon(UntitledEye);
export const User = createIcon(UntitledUser01);
export const Award = createIcon(UntitledAward01);
export const Mail = createIcon(UntitledMail01);
export const Calendar = createIcon(UntitledCalendar);
export const Briefcase = createIcon(UntitledBriefcase01);
export const Building = createIcon(UntitledBuilding01);
export const FileText = createIcon(UntitledFile02);
export const ShieldCheck = createIcon(UntitledShieldTick);
export const Globe = createIcon(UntitledGlobe01);
export const Sparkles = createIcon(UntitledStars01);
export const GitCommit = createIcon(UntitledGitCommit);
export const BarChart = createIcon(UntitledBarChart01);
export const Binary = createIcon(UntitledDataflow01);
export const Database = createIcon(UntitledDatabase01);
export const BookOpen = createIcon(UntitledBookOpen01);

// Official Brand Icons (Styled to Untitled UI 1.5px stroke weight standards)
export const GitHub: React.FC<IconProps> = ({
  className = '',
  strokeWidth = 1.5,
  ...props
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);

export const LinkedIn: React.FC<IconProps> = ({
  className = '',
  strokeWidth = 1.5,
  ...props
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

/**
 * Centralized Icon Namespace Object
 * Allows: <Icon.ArrowRight className="w-4 h-4" />
 */
export const Icon = {
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  ChevronLeft,
  Close,
  Plus,
  Minus,
  Maximize,
  Search,
  ExternalLink,
  Copy,
  Check,
  CheckCircle,
  Send,
  Share,
  Printer,
  RotateCcw,
  Sliders,
  Grid,
  Grip,
  Menu,
  VolumeMax,
  VolumeX,
  Activity,
  Clock,
  Cpu,
  Layers,
  Terminal,
  Code,
  Compass,
  Eye,
  User,
  Award,
  Mail,
  Calendar,
  Briefcase,
  Building,
  FileText,
  ShieldCheck,
  Globe,
  Sparkles,
  GitCommit,
  BarChart,
  Binary,
  Database,
  BookOpen,
  GitHub,
  LinkedIn,
};

export default Icon;
