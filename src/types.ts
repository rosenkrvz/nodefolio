export type PinColor = 'crimson' | 'red' | 'rose' | 'white' | 'yellow' | 'green' | 'blue' | 'purple' | 'cyan' | 'amber';

export interface Pin {
  id: string;
  label: string;
  color: PinColor;
  type: 'input' | 'output';
  nodeId: string;
}

export interface Connection {
  id: string;
  fromNodeId: string;
  fromPinId: string;
  toNodeId: string;
  toPinId: string;
  color?: string;
  label?: string;
  animated?: boolean;
}

export interface SkillItem {
  name: string;
  level: number; // 1-100
  category: string;
  years: string;
  icon?: string;
  tags: string[];
}

export interface CertificateItem {
  id: string;
  title: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  credentialId: string;
  verificationUrl: string;
  badgeColor: string;
  skills: string[];
  description: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  tagline: string;
  description: string;
  tags: string[];
  metrics: { label: string; value: string }[];
  image: string;
  liveUrl?: string;
  githubUrl?: string;
  parameters?: { label: string; value: string }[];
}

export interface ExperienceItem {
  role: string;
  company: string;
  period: string;
  description: string;
  highlights: string[];
}

export type NodeCategory =
  | 'profile'
  | 'skills'
  | 'certificates'
  | 'project'
  | 'experience'
  | 'controls'
  | 'clock'
  | 'statistics'
  | 'optimization'
  | 'pipeline'
  | 'evaluation'
  | 'vectors'
  | 'vision'
  | 'generative'
  | 'software'
  | 'experiment'
  | 'computational'
  | 'visitor';

export type NodeShape = 'square' | 'capsule' | 'circular' | 'sticky';

export interface ResearchNodeSpec {
  domain: string;
  method: string;
  state: string;
  compute: string;
  overview: string;
  computationalDetails: string[];
  metrics?: { label: string; value: string }[];
  tags: string[];
  relatedNodeIds?: string[];
  visualizationType?:
    | 'distribution'
    | 'trajectory'
    | 'pipeline'
    | 'benchmarks'
    | 'pointcloud'
    | 'featuregrid'
    | 'particlefield'
    | 'architecture'
    | 'iterations'
    | 'latencyclock';
}

export interface VisitorNodeData {
  id: string;
  name: string;
  message: string;
  category: 'note' | 'idea' | 'question' | 'observation';
  shape: 'square' | 'capsule' | 'sticky';
  accent: 'crimson' | 'white' | 'zinc';
  createdAt: number;
  approved: boolean;
}

export interface NodeData {
  id: string;
  title: string;
  subtitle?: string;
  category: NodeCategory;
  shape?: NodeShape;
  x: number;
  y: number;
  width: number;
  height?: number;
  inputs: Pin[];
  outputs: Pin[];
  accentColor?: string;
  glowColor?: string;
  // Payload
  profile?: {
    name: string;
    role: string;
    avatar: string;
    bio: string;
    location: string;
    status: string;
    email: string;
    github: string;
    linkedin: string;
    stats: { label: string; value: string }[];
  };
  skills?: SkillItem[];
  certificates?: CertificateItem[];
  project?: ProjectItem;
  experience?: ExperienceItem[];
  controlsData?: {
    model: string;
    samplingMethod: string;
    qualitySteps: number;
    promptStrength: number;
    randomness: number;
  };
  researchData?: ResearchNodeSpec;
  visitorData?: VisitorNodeData;
}

export interface CanvasTransform {
  x: number;
  y: number;
  scale: number;
}
