import { NodeData, Connection } from '../types';

export const INITIAL_NODES: NodeData[] = [
  // 1. Identity & Researcher Profile Node (Column 1, Row 1)
  {
    id: 'node-profile',
    title: 'Shubham Sharma',
    subtitle: 'AI & Data Science',
    category: 'profile',
    x: 100,
    y: 380,
    width: 340,
    inputs: [
      { id: 'pin-in-profile', label: 'inference.hypothesis', color: 'crimson', type: 'input', nodeId: 'node-profile' },
    ],
    outputs: [
      { id: 'pin-prof-models', label: 'representation.manifold', color: 'crimson', type: 'output', nodeId: 'node-profile' },
      { id: 'pin-prof-credentials', label: 'mathematical.core', color: 'crimson', type: 'output', nodeId: 'node-profile' },
      { id: 'pin-prof-project', label: 'latent.projection', color: 'crimson', type: 'output', nodeId: 'node-profile' },
    ],
    accentColor: '#e11d48',
    glowColor: 'rgba(225, 29, 72, 0.2)',
    profile: {
      name: 'Shubham Sharma',
      role: 'AI & Data Science',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
      bio: 'Studying data, statistical learning, and generative models. Focused on understanding how mathematics, probability, and machine learning can be structured into reliable computational systems.',
      location: 'Open for Software Engineering & Machine Learning Roles',
      status: 'Active Study & Projects',
      email: 'marksrv047@gmail.com',
      github: 'https://github.com/rosenkrvz',
      linkedin: 'https://linkedin.com',
      stats: [
        { label: 'Discipline', value: 'Statistical Learning' },
        { label: 'Focus', value: 'Generative Architectures' },
        { label: 'Computation', value: 'PyTorch & Tensors' },
      ],
    },
  },

  // 2. Generative Models & Representation Learning (Column 2, Row 1)
  {
    id: 'node-models',
    title: 'Generative Architectures',
    subtitle: 'Representation & Learning',
    category: 'skills',
    x: 560,
    y: 380,
    width: 340,
    inputs: [
      { id: 'pin-in-models', label: 'representation.manifold', color: 'crimson', type: 'input', nodeId: 'node-models' },
    ],
    outputs: [
      { id: 'pin-out-systems', label: 'tensor.pipeline', color: 'crimson', type: 'output', nodeId: 'node-models' },
      { id: 'pin-out-clock', label: 'runtime.sync', color: 'crimson', type: 'output', nodeId: 'node-models' },
    ],
    accentColor: '#be123c',
    glowColor: 'rgba(190, 18, 60, 0.18)',
    skills: [
      { name: 'Diffusion & Latent Dynamics', level: 92, category: 'Generative', years: 'Projects', tags: ['DDPM', 'Score Matching', 'Latent ODEs'] },
      { name: 'Transformers & Self-Attention', level: 94, category: 'Core', years: 'Projects', tags: ['Attention Mechanics', 'Sequence Modeling', 'KV Cache'] },
      { name: 'Representation & Embeddings', level: 90, category: 'Theory', years: 'Foundations', tags: ['Contrastive Learning', 'Metric Spaces', 'Manifolds'] },
      { name: 'PyTorch & Computational Graphs', level: 95, category: 'Frameworks', years: 'Practical', tags: ['Autograd', 'Tensor Algebra', 'CUDA'] },
    ],
  },

  // 3. Academic & Technical Foundation (Column 1, Row 2 - under Profile)
  {
    id: 'node-credentials',
    title: 'Academic & Foundation',
    subtitle: 'Mathematics & Computation',
    category: 'certificates',
    x: 100,
    y: 840,
    width: 340,
    inputs: [
      { id: 'pin-in-cred', label: 'mathematical.core', color: 'crimson', type: 'input', nodeId: 'node-credentials' },
    ],
    outputs: [
      { id: 'pin-cred-out', label: 'mathematical.core', color: 'crimson', type: 'output', nodeId: 'node-credentials' },
    ],
    accentColor: '#9f1239',
    glowColor: 'rgba(159, 18, 57, 0.2)',
    certificates: [
      {
        id: 'acad-comp-sci',
        title: 'Computer Science & Machine Intelligence',
        issuer: 'Undergraduate Curriculum & Study',
        issueDate: 'Coursework Focus',
        credentialId: 'Academic Track',
        verificationUrl: 'https://github.com/rosenkrvz/nodefolio',
        badgeColor: '#e11d48',
        skills: ['Linear Algebra & Matrices', 'Probability & Statistics', 'Multivariate Optimization', 'Statistical Machine Learning'],
        description: 'Rigorous coursework in statistical machine learning, convex optimization, linear algebra, and high-dimensional computational systems.',
      },
      {
        id: 'acad-deep-learning',
        title: 'Deep Learning & Neural Architectures',
        issuer: 'Specialized Coursework',
        issueDate: 'Technical Study',
        credentialId: 'Foundational Track',
        verificationUrl: 'https://github.com/rosenkrvz/nodefolio',
        badgeColor: '#be123c',
        skills: ['Generative Modeling', 'Attention Mechanisms', 'Variational Inference'],
        description: 'Theoretical study and implementation of modern generative paradigms, normalizing flows, score matching, and latent embeddings.',
      },
    ],
  },

  // 4. Neural Systems & Data Infrastructure (Column 3, Row 1)
  {
    id: 'node-systems',
    title: 'Neural Systems & Data',
    subtitle: 'Learning Infrastructure',
    category: 'skills',
    x: 1020,
    y: 380,
    width: 340,
    inputs: [
      { id: 'pin-in-systems', label: 'tensor.pipeline', color: 'crimson', type: 'input', nodeId: 'node-systems' },
    ],
    outputs: [
      { id: 'pin-systems-project', label: 'latent.projection', color: 'crimson', type: 'output', nodeId: 'node-systems' },
    ],
    accentColor: '#e11d48',
    glowColor: 'rgba(225, 29, 72, 0.22)',
    skills: [
      { name: 'Vector Search & Embeddings', level: 92, category: 'Data', years: 'Practical', tags: ['HNSW Indexing', 'FAISS', 'Cosine Metrics'] },
      { name: 'Data Pipelines & Feature Handling', level: 90, category: 'Pipelines', years: 'Projects', tags: ['Arrow / Parquet', 'Streaming', 'ETL'] },
      { name: 'Model Evaluation & Telemetry', level: 88, category: 'Analysis', years: 'Core', tags: ['Validation', 'Calibration', 'ECE'] },
      { name: 'Inference & Latency Optimization', level: 86, category: 'Execution', years: 'Exploration', tags: ['TensorRT', 'Quantization (INT8)', 'ONNX'] },
    ],
  },

  // 5. Featured Hero Visual Anchor: Latent Graph Visualizer (Column 4, Row 1)
  {
    id: 'node-project',
    title: 'Latent Graph Visualizer',
    subtitle: 'Interactive Exploration Artifact',
    category: 'project',
    x: 1480,
    y: 380,
    width: 440,
    inputs: [
      { id: 'pin-in-project', label: 'latent.projection', color: 'crimson', type: 'input', nodeId: 'node-project' },
      { id: 'pin-in-project-systems', label: 'inference.graph', color: 'crimson', type: 'input', nodeId: 'node-project' },
    ],
    outputs: [
      { id: 'pin-out-visualizer', label: 'temporal.sync', color: 'crimson', type: 'output', nodeId: 'node-project' },
    ],
    accentColor: '#f43f5e',
    glowColor: 'rgba(244, 63, 94, 0.25)',
    project: {
      id: 'proj-visualizer',
      title: 'Latent Graph Visualizer',
      tagline: 'Interactive High-Dimensional Manifold Explorer',
      description: 'An interactive computational workspace mapping continuous latent spaces to discrete topological clusters, enabling real-time parametric traversal, dimensionality reduction (UMAP/t-SNE), and manifold projection.',
      tags: ['Latent Manifolds', 'Dimensionality Reduction', 't-SNE / UMAP', 'Embedding Topology', 'WebGL'],
      metrics: [
        { label: 'Input Latent', value: '512-D Vectors' },
        { label: 'Projection', value: '3D Manifold' },
        { label: 'Geometry', value: 'Riemannian' },
      ],
      image: '/assets/latent_manifold_artifact.jpg',
      liveUrl: 'https://github.com/rosenkrvz/nodefolio',
      githubUrl: 'https://github.com/rosenkrvz/nodefolio',
    },
  },

  // 6. System Chronometer Node (Column 5, Row 1)
  {
    id: 'node-clock',
    title: 'System Chronometer',
    subtitle: 'Temporal Coordinates • Live Sync',
    category: 'clock',
    x: 2040,
    y: 380,
    width: 260,
    inputs: [
      { id: 'pin-in-clock', label: 'temporal.sync', color: 'crimson', type: 'input', nodeId: 'node-clock' },
    ],
    outputs: [],
    accentColor: '#e11d48',
    glowColor: 'rgba(225, 29, 72, 0.22)',
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
    fromPinId: 'pin-systems-project',
    toNodeId: 'node-project',
    toPinId: 'pin-in-project',
    color: '#f43f5e',
    label: 'latent.projection',
    animated: true,
  },
  {
    id: 'conn-visualizer-clock',
    fromNodeId: 'node-project',
    fromPinId: 'pin-out-visualizer',
    toNodeId: 'node-clock',
    toPinId: 'pin-in-clock',
    color: '#f43f5e',
    label: 'temporal.sync',
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
