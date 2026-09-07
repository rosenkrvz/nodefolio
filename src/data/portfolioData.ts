import { NodeData, Connection } from '../types';

export const INITIAL_NODES: NodeData[] = [
  // 1. Identity & Researcher Profile Node (Positioned in lower left quadrant)
  {
    id: 'node-profile',
    title: 'Shubham Sharma',
    subtitle: 'AI & Data Science',
    category: 'profile',
    x: 60,
    y: 520,
    width: 340,
    inputs: [],
    outputs: [
      { id: 'pin-prof-models', label: 'representation.manifold', color: 'crimson', type: 'output', nodeId: 'node-profile' },
      { id: 'pin-prof-credentials', label: 'mathematical.core', color: 'crimson', type: 'output', nodeId: 'node-profile' },
    ],
    accentColor: '#e11d48',
    glowColor: 'rgba(225, 29, 72, 0.2)',
    profile: {
      name: 'Shubham Sharma',
      role: 'AI & Data Science',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
      bio: 'Studying data, statistical learning, and generative models. Focused on understanding how mathematics, probability, and machine learning can be structured into reliable computational systems.',
      location: 'Available for Select Computational Research & Engineering Roles',
      status: 'Active Research',
      email: 'marksrv047@gmail.com',
      github: 'https://github.com/rosenkrvz',
      linkedin: 'https://linkedin.com',
      stats: [
        { label: 'Discipline', value: 'Statistical Learning' },
        { label: 'Focus', value: 'Generative Models' },
        { label: 'Computation', value: 'PyTorch & Tensors' },
      ],
    },
  },

  // 2. Generative Models & Representation Learning (Positioned lower middle)
  {
    id: 'node-models',
    title: 'Generative Architectures',
    subtitle: 'Representation & Learning',
    category: 'skills',
    x: 430,
    y: 520,
    width: 340,
    inputs: [
      { id: 'pin-in-models', label: 'representation.manifold', color: 'crimson', type: 'input', nodeId: 'node-models' },
    ],
    outputs: [
      { id: 'pin-out-systems', label: 'tensor.pipeline', color: 'crimson', type: 'output', nodeId: 'node-models' },
    ],
    accentColor: '#be123c',
    glowColor: 'rgba(190, 18, 60, 0.18)',
    skills: [
      { name: 'Diffusion & Latent Dynamics', level: 95, category: 'Generative', years: 'Research', tags: ['DDPM', 'Score Matching', 'Latent ODEs'] },
      { name: 'Transformers & Self-Attention', level: 96, category: 'Core', years: 'Core', tags: ['FlashAttention', 'Sequence Modeling', 'KV Cache'] },
      { name: 'Representation & Embeddings', level: 93, category: 'Theory', years: 'Theory', tags: ['Contrastive Learning', 'Metric Spaces', 'Manifolds'] },
      { name: 'PyTorch & Computational Graphs', level: 95, category: 'Frameworks', years: 'Primary', tags: ['Autograd', 'Tensor Algebra', 'CUDA'] },
    ],
  },

  // 3. Neural Systems & Data Infrastructure (Positioned lower center-right)
  {
    id: 'node-systems',
    title: 'Neural Systems & Data',
    subtitle: 'Learning Infrastructure',
    category: 'skills',
    x: 800,
    y: 520,
    width: 340,
    inputs: [
      { id: 'pin-in-systems', label: 'tensor.pipeline', color: 'crimson', type: 'input', nodeId: 'node-systems' },
    ],
    outputs: [
      { id: 'pin-out-project', label: 'latent.projection', color: 'crimson', type: 'output', nodeId: 'node-systems' },
    ],
    accentColor: '#e11d48',
    glowColor: 'rgba(225, 29, 72, 0.18)',
    skills: [
      { name: 'Vector Search & Embeddings', level: 94, category: 'Data', years: 'Indexing', tags: ['High-Dim Indexing', 'HNSW', 'Vector Search'] },
      { name: 'Data Pipelines & Feature Store', level: 91, category: 'Pipelines', years: 'Data', tags: ['Parquet/Arrow', 'Data Streaming', 'Tensors'] },
      { name: 'Model Evaluation & Telemetry', level: 92, category: 'Analysis', years: 'Validation', tags: ['Loss Landscapes', 'Out-of-Distribution', 'Metrics'] },
      { name: 'Inference & Latency Tuning', level: 90, category: 'Execution', years: 'Runtime', tags: ['Quantization', 'Model Serving', 'Memory Bounds'] },
    ],
  },

  // 4. Featured Hero Visual Anchor: Latent Graph Visualizer (Right side of Hero Heading)
  {
    id: 'node-project',
    title: 'Latent Graph Visualizer',
    subtitle: 'Interactive Research Artifact',
    category: 'project',
    x: 690,
    y: 50,
    width: 440,
    inputs: [
      { id: 'pin-in-project', label: 'latent.projection', color: 'crimson', type: 'input', nodeId: 'node-project' },
    ],
    outputs: [
      { id: 'pin-out-visualizer', label: 'manifold.signal', color: 'crimson', type: 'output', nodeId: 'node-project' },
    ],
    accentColor: '#f43f5e',
    glowColor: 'rgba(244, 63, 94, 0.22)',
    project: {
      id: 'proj-latent-graph',
      title: 'Latent Graph Visualizer',
      tagline: 'High-Dimensional Generative Manifold Explorer',
      description: 'An interactive computational workspace mapping continuous latent spaces to discrete topological clusters, enabling real-time parametric traversal, dimensionality reduction (UMAP/t-SNE), and manifold projection.',
      tags: ['Latent Manifolds', 'Dimensionality Reduction', 't-SNE / UMAP', 'Embedding Topology', 'WebGL'],
      metrics: [
        { label: 'Input Latent', value: '512-D Space' },
        { label: 'Projection', value: '3D Manifold' },
        { label: 'Convergence', value: 'Loss 0.0142' },
      ],
      image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
      liveUrl: 'https://github.com/rosenkrvz/nodefolio',
      githubUrl: 'https://github.com/rosenkrvz/nodefolio',
    },
  },

  // 5. Academic & Technical Foundation (Positioned lower right)
  {
    id: 'node-credentials',
    title: 'Academic & Foundation',
    subtitle: 'Mathematics & Computation',
    category: 'certificates',
    x: 1170,
    y: 520,
    width: 340,
    inputs: [
      { id: 'pin-in-cred', label: 'mathematical.core', color: 'crimson', type: 'input', nodeId: 'node-credentials' },
    ],
    outputs: [],
    accentColor: '#9f1239',
    glowColor: 'rgba(159, 18, 57, 0.2)',
    certificates: [
      {
        id: 'acad-comp-sci',
        title: 'Computer Science & Machine Intelligence',
        issuer: 'Formal Academic Curriculum',
        issueDate: 'Curriculum Focus',
        credentialId: 'Curriculum Focus',
        verificationUrl: 'https://github.com/rosenkrvz/nodefolio',
        badgeColor: '#e11d48',
        skills: ['Linear Algebra & Matrices', 'Probability & Statistics', 'Multivariate Optimization', 'Statistical Machine Learning'],
        description: 'Rigorous coursework in statistical machine learning, convex optimization, linear algebra, and high-dimensional computational systems.',
      },
      {
        id: 'acad-deep-learning',
        title: 'Deep Learning & Neural Architectures',
        issuer: 'Specialized Track',
        issueDate: 'Advanced Competency',
        credentialId: 'Specialized Coursework',
        verificationUrl: 'https://github.com/rosenkrvz/nodefolio',
        badgeColor: '#be123c',
        skills: ['Generative Modeling', 'Attention Mechanisms', 'Variational Inference'],
        description: 'Advanced theoretical study and implementation of modern generative paradigms, normalizing flows, score matching, and latent embeddings.',
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
    label: 'representation.manifold',
    animated: true,
  },
  {
    id: 'conn-models-systems',
    fromNodeId: 'node-models',
    fromPinId: 'pin-out-systems',
    toNodeId: 'node-systems',
    toPinId: 'pin-in-systems',
    color: '#be123c',
    label: 'tensor.pipeline',
    animated: true,
  },
  {
    id: 'conn-systems-project',
    fromNodeId: 'node-systems',
    fromPinId: 'pin-out-project',
    toNodeId: 'node-project',
    toPinId: 'pin-in-project',
    color: '#f43f5e',
    label: 'latent.projection',
    animated: true,
  },
  {
    id: 'conn-prof-credentials',
    fromNodeId: 'node-profile',
    fromPinId: 'pin-prof-credentials',
    toNodeId: 'node-credentials',
    toPinId: 'pin-in-cred',
    color: '#9f1239',
    label: 'mathematical.core',
    animated: true,
  },
];
