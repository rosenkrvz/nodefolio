import { NodeData, Connection, CertificateItem, ProjectItem } from '../types';

export const INITIAL_NODES: NodeData[] = [
  // 1. Identity & Researcher Profile Node
  {
    id: 'node-profile',
    title: 'Shubham Sharma',
    subtitle: 'AI & Data Science',
    category: 'profile',
    x: 80,
    y: 120,
    width: 330,
    inputs: [],
    outputs: [
      { id: 'pin-prof-models', label: 'representation.stream', color: 'crimson', type: 'output', nodeId: 'node-profile' },
      { id: 'pin-prof-credentials', label: 'academic.core', color: 'crimson', type: 'output', nodeId: 'node-profile' },
    ],
    accentColor: '#e11d48',
    glowColor: 'rgba(225, 29, 72, 0.2)',
    profile: {
      name: 'Shubham Sharma',
      role: 'AI & Data Science',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
      bio: 'Investigating deep representations, generative architectures, and computational systems. Focused on building mathematically grounded tools that bridge statistical learning with interactive reasoning.',
      location: 'Available for Select Computational Research & Engineering Roles',
      status: 'Active Research',
      email: 'marksrv047@gmail.com',
      github: 'https://github.com',
      linkedin: 'https://linkedin.com',
      stats: [
        { label: 'Domain', value: 'Deep Learning' },
        { label: 'Focus', value: 'Generative Systems' },
        { label: 'Infrastructure', value: 'Distributed PyTorch' },
      ],
    },
  },

  // 2. Generative Models & Representation Learning
  {
    id: 'node-models',
    title: 'Generative Architectures',
    subtitle: 'Representation & Learning',
    category: 'skills',
    x: 480,
    y: 80,
    width: 340,
    inputs: [
      { id: 'pin-in-models', label: 'representation.stream', color: 'crimson', type: 'input', nodeId: 'node-models' },
    ],
    outputs: [
      { id: 'pin-out-systems', label: 'inference.tensor', color: 'crimson', type: 'output', nodeId: 'node-models' },
    ],
    accentColor: '#be123c',
    glowColor: 'rgba(190, 18, 60, 0.18)',
    skills: [
      { name: 'Diffusion & Latent Dynamics', level: 94, category: 'Generative', years: 'Research', tags: ['DDPM', 'Score Matching', 'Latent ODEs'] },
      { name: 'Transformers & Self-Attention', level: 96, category: 'Core', years: 'Core', tags: ['FlashAttention', 'RoPE', 'KV Cache'] },
      { name: 'PyTorch & JAX Computation', level: 95, category: 'Frameworks', years: 'Primary', tags: ['Autograd', 'CUDA Kernels', 'XLA'] },
      { name: 'Representation & Embeddings', level: 92, category: 'Theory', years: 'Theory', tags: ['Contrastive', 'Metric Learning'] },
    ],
  },

  // 3. Neural Systems & High-Throughput Inference
  {
    id: 'node-systems',
    title: 'Neural Systems & Scale',
    subtitle: 'Inference Infrastructure',
    category: 'skills',
    x: 480,
    y: 440,
    width: 340,
    inputs: [
      { id: 'pin-in-systems', label: 'inference.tensor', color: 'crimson', type: 'input', nodeId: 'node-systems' },
    ],
    outputs: [
      { id: 'pin-out-project', label: 'pipeline.output', color: 'crimson', type: 'output', nodeId: 'node-systems' },
    ],
    accentColor: '#e11d48',
    glowColor: 'rgba(225, 29, 72, 0.18)',
    skills: [
      { name: 'Vector Search & ANN Indexing', level: 93, category: 'Data', years: 'Systems', tags: ['HNSW', 'IVF-PQ', 'pgvector'] },
      { name: 'Distributed Model Serving', level: 91, category: 'Serving', years: 'Infra', tags: ['vLLM', 'Triton', 'TensorRT-LLM'] },
      { name: 'Data Pipelines & Streaming', level: 90, category: 'Pipelines', years: 'Data', tags: ['Ray', 'Apache Arrow', 'DuckDB'] },
      { name: 'Python, C++ & CUDA', level: 92, category: 'Languages', years: 'Systems', tags: ['Zero-Copy', 'Memory Mapping'] },
    ],
  },

  // 4. Featured Project Artifact: Latent Graph Visualizer
  {
    id: 'node-project',
    title: 'Latent Graph Visualizer',
    subtitle: 'Interactive Research Artifact',
    category: 'project',
    x: 900,
    y: 110,
    width: 360,
    inputs: [
      { id: 'pin-in-project', label: 'pipeline.output', color: 'crimson', type: 'input', nodeId: 'node-project' },
    ],
    outputs: [],
    accentColor: '#f43f5e',
    glowColor: 'rgba(244, 63, 94, 0.2)',
    project: {
      id: 'proj-latent-graph',
      title: 'Latent Graph Visualizer',
      tagline: 'High-Dimensional Generative Space Explorer',
      description: 'An interactive computational workspace mapping continuous latent manifolds to discrete semantic clusters, enabling real-time topological path traversal and parametric interpolation.',
      tags: ['Diffusion Models', 'WebGL Manifolds', 'PyTorch Backend', 'Latent Traversal'],
      metrics: [
        { label: 'Architecture', value: 'Latent Diffusion' },
        { label: 'Computation', value: 'WebGL Accelerated' },
        { label: 'Topology', value: 'Manifold Projection' },
      ],
      image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
      liveUrl: 'https://github.com',
      githubUrl: 'https://github.com',
    },
  },

  // 5. Academic & Technical Foundation
  {
    id: 'node-credentials',
    title: 'Academic & Foundation',
    subtitle: 'Education & Technical Study',
    category: 'certificates',
    x: 900,
    y: 480,
    width: 360,
    inputs: [
      { id: 'pin-in-cred', label: 'academic.core', color: 'crimson', type: 'input', nodeId: 'node-credentials' },
    ],
    outputs: [],
    accentColor: '#9f1239',
    glowColor: 'rgba(159, 18, 57, 0.2)',
    certificates: [
      {
        id: 'acad-comp-sci',
        title: 'Computer Science & Machine Intelligence',
        issuer: 'Formal Academic Study',
        issueDate: 'Curriculum Focus',
        credentialId: 'Verified Academic Track',
        verificationUrl: 'https://github.com',
        badgeColor: '#e11d48',
        skills: ['Statistical Inference', 'Multivariate Optimization', 'Linear Algebra & Tensors', 'Discrete Algorithms'],
        description: 'Rigorous coursework and applied thesis exploration in statistical machine learning, convex optimization, and distributed systems algorithms.',
      },
      {
        id: 'acad-deep-learning',
        title: 'Deep Learning & Neural Architectures',
        issuer: 'Specialized Track',
        issueDate: 'Advanced Competency',
        credentialId: 'Peer-Reviewed Technical Coursework',
        verificationUrl: 'https://github.com',
        badgeColor: '#be123c',
        skills: ['Generative Modeling', 'Attention Mechanisms', 'Probabilistic Graphical Models'],
        description: 'Advanced theoretical study and implementation of modern generative paradigms, normalizing flows, and variational inference.',
      },
    ],
  },
];

export const INITIAL_CONNECTIONS: Connection[] = [
  {
    id: 'conn-prof-models',
    fromNodeId: 'node-profile',
    fromPinId: 'pin-prof-models',
    toNodeId: 'node-models',
    toPinId: 'pin-in-models',
    color: '#e11d48',
    label: 'representation.stream',
    animated: true,
  },
  {
    id: 'conn-models-systems',
    fromNodeId: 'node-models',
    fromPinId: 'pin-out-systems',
    toNodeId: 'node-systems',
    toPinId: 'pin-in-systems',
    color: '#be123c',
    label: 'inference.tensor',
    animated: true,
  },
  {
    id: 'conn-systems-project',
    fromNodeId: 'node-systems',
    fromPinId: 'pin-out-project',
    toNodeId: 'node-project',
    toPinId: 'pin-in-project',
    color: '#f43f5e',
    label: 'pipeline.output',
    animated: true,
  },
  {
    id: 'conn-prof-credentials',
    fromNodeId: 'node-profile',
    fromPinId: 'pin-prof-credentials',
    toNodeId: 'node-credentials',
    toPinId: 'pin-in-cred',
    color: '#9f1239',
    label: 'academic.core',
    animated: true,
  },
];
