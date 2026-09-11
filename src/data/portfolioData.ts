import { NodeData, Connection, ProjectItem, LabEntry } from '../types';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * PORTFOLIO TECHNICAL PROJECTS (WORK INDEX)
 * Authentically represents implementations built and validated by Shubham Sharma.
 * Every project maps cleanly to Level 1 / Level 2 / Level 3 case studies.
 * ═══════════════════════════════════════════════════════════════════════════
 */
export const PORTFOLIO_PROJECTS: ProjectItem[] = [
  {
    id: 'proj-visualizer',
    title: 'Latent Graph Visualizer',
    tagline: 'Interactive High-Dimensional Manifold & Geodesic Traversal Workspace',
    category: 'Visualization & Interactive Systems',
    status: 'Interactive Prototype • Active Study',
    description:
      'An interactive computational workspace mapping continuous 512-dimensional latent spaces to discrete topological clusters, enabling real-time parametric traversal, dimensionality reduction (UMAP / t-SNE / PCA), and Riemannian geodesic projection.',
    problem:
      'High-dimensional neural representations (512-D bottleneck tensors from diffusion and transformer networks) are fundamentally opaque. Standard Euclidean linear interpolation cuts straight across low-density sparse voids, causing severe perceptual degradation and mode collapse during generative transitions.',
    approach:
      'Engineered an interactive 3D WebGL projection surface that treats the latent distribution as a curved Riemannian manifold. Used Runge-Kutta numerical integration along score-matching vector field tangents to compute authentic geodesic transport paths.',
    implementation: [
      'Built a WebGL / Three.js parametric height-deformation shader with dynamic isocurve contours',
      'Implemented instant topological switching between UMAP, t-SNE, and PCA clustering projections with fluid cubic-bezier morphing',
      'Engineered instanced buffer geometries for 50+ cluster feature atoms to guarantee locked 60 FPS viewport orbit',
      'Added zero-overhead direct DOM orientation matrix tracking and responsive viewport auto-framing',
    ],
    contribution:
      'Sole developer and researcher. Designed the mathematical formulation, authored all WebGL/Three.js rendering pipelines, and built the interactive exploration workspace.',
    learnings:
      'Learned the critical trade-offs between local neighborhood preservation and global structure fidelity in non-linear dimensionality reduction. Discovered how high-dimensional space sparsity often leads to false clustering unless regularized against geometric manifold curvature.',
    tags: ['WebGL', 'Three.js', 'PyTorch', 'Riemannian Manifolds', 't-SNE / UMAP / PCA', 'Score Matching', 'TypeScript'],
    metrics: [
      { label: 'Embedding Space', value: '512-D Latent' },
      { label: 'Render Telemetry', value: '60 FPS Orbit' },
      { label: 'Topologies', value: 'UMAP / t-SNE / PCA' },
    ],
    image: '/assets/latent_manifold_artifact.jpg',
    liveUrl: 'https://github.com/rosenkrvz/nodefolio',
    githubUrl: 'https://github.com/rosenkrvz/nodefolio',
    relatedResearchPhaseId: 'phase-05',
    relatedLabId: 'lab-latent-manifold',
  },
  {
    id: 'proj-autograd',
    title: 'Autograd Engine from Scratch',
    tagline: 'First-Principles Reverse-Mode Autodiff & Dynamic Computational DAG Tape',
    category: 'Computational Systems & Deep Learning Core',
    status: 'Built & Validated',
    description:
      'A lightweight scalar and tensor automatic differentiation engine constructed from scratch in C++ and Python, featuring dynamic DAG execution tape recording, topological sorting, and reverse-mode adjoint sensitivity accumulation.',
    problem:
      'Relying exclusively on high-level framework abstractions creates an illusion of understanding without grasping topological graph sorting, activation memory life-cycles, and backward tape accumulation mechanics.',
    approach:
      'Constructed a clean directed acyclic graph (DAG) execution engine implementing the multivariate chain rule across reverse topological graph order, validated analytically against numerical finite differences.',
    implementation: [
      'Engineered dynamic computational tape recording forward operation closures and parent operand references',
      'Implemented Kahn\'s topological sort algorithm to order backward derivative execution with O(|V| + |E|) time complexity',
      'Authored C++ tensor arithmetic kernels with lightweight Python C-API bindings',
      'Verified numerical stability and analytical gradient precision across complex non-linear compositions',
    ],
    contribution:
      'Designed and coded the entire autograd tape, memory allocation logic, topological sorting traversal, and unit verification tests.',
    learnings:
      'Demystified how tensor frameworks allocate activation memory during the forward pass and reclaim intermediate memory during reverse-mode propagation.',
    tags: ['Python', 'C++', 'Computational Graphs', 'Reverse-Mode Autodiff', 'DAG Topological Sort', 'Linear Algebra'],
    metrics: [
      { label: 'Graph Ops', value: '10 Core Primitives' },
      { label: 'Complexity', value: 'O(|V| + |E|) Time' },
      { label: 'Validation', value: 'Finite Difference Checked' },
    ],
    image: '/assets/latent_manifold_artifact.jpg',
    liveUrl: 'https://github.com/rosenkrvz/nodefolio',
    githubUrl: 'https://github.com/rosenkrvz/nodefolio',
    relatedResearchPhaseId: 'phase-01',
    relatedLabId: 'lab-autograd-tape',
  },
  {
    id: 'proj-attention',
    title: 'KV-Cache Dynamics & Tiled Kernels',
    tagline: 'Memory-Hierarchy-Aware Self-Attention Tiling & SRAM Flow Benchmarks',
    category: 'Neural Systems & Execution Infrastructure',
    status: 'Measured Benchmark',
    description:
      'An empirical dissection of memory-bandwidth bottlenecks in transformer inference through tiled matrix algebra and FlashAttention-style online softmax forward passes implemented in PyTorch and Triton.',
    problem:
      'Transformer sequence scaling is constrained by memory bandwidth rather than pure compute capacity due to repeated O(N²) round-trips between GPU High-Bandwidth Memory (HBM) and on-chip SRAM.',
    approach:
      'Implemented tiled matrix multiplication that fuses the online softmax computation into the outer loop, completely eliminating the need to materialize the quadratic intermediate attention matrix in global memory.',
    implementation: [
      'Constructed tiled matrix forward passes in Triton and PyTorch with block tiling parameters Br and Bc',
      'Implemented online softmax scaling using incremental row maximum tracking to preserve exact mathematical precision',
      'Profiled latency and memory throughput across varying sequence lengths (512 to 8,192 tokens)',
      'Benchmarked static vs. dynamic KV-cache memory allocation patterns during autoregressive generation',
    ],
    contribution:
      'Authored the tiled kernel benchmarks, memory profiling scripts, and comparative throughput analysis against eager PyTorch execution.',
    learnings:
      'Learned that deep learning algorithms must be designed with explicit awareness of hardware memory hierarchies; mathematical formulation and physical execution are fundamentally inseparable.',
    tags: ['PyTorch', 'Triton', 'FlashAttention', 'Memory Hierarchy', 'KV Cache', 'Tiled Matrix Algebra'],
    metrics: [
      { label: 'Memory I/O', value: 'O(N) Flash Style' },
      { label: 'Tiling Strategy', value: 'On-Chip SRAM' },
      { label: 'Bottleneck', value: 'Memory-IO Bound' },
    ],
    image: '/assets/latent_manifold_artifact.jpg',
    liveUrl: 'https://github.com/rosenkrvz/nodefolio',
    githubUrl: 'https://github.com/rosenkrvz/nodefolio',
    relatedResearchPhaseId: 'phase-04',
    relatedLabId: 'lab-attention-tiling',
  },
  {
    id: 'proj-metric',
    title: 'Contrastive Metric Space Benchmark',
    tagline: 'Hyperspherical Uniformity & Representation Geometry Under Temperature Scaling',
    category: 'AI / ML & Representation Learning',
    status: 'Empirical Study Complete',
    description:
      'An empirical study analyzing alignment and uniformity properties in multi-modal contrastive formulations, evaluating InfoNCE temperature scaling against dimensional collapse across the unit hypersphere S².',
    problem:
      'Self-supervised representation models risk dimensional collapse, where embeddings collapse into narrow low-dimensional subspaces instead of utilizing the full representational capacity of the hypersphere.',
    approach:
      'Evaluated InfoNCE loss dynamics under varying temperature schedules, measuring positive pair alignment tensions alongside repulsive forces to quantify hyperspherical uniformity and singular value decay.',
    implementation: [
      'Constructed synthetic and image embedding benchmark pipelines in PyTorch',
      'Monitored singular value spectra to detect early dimensional shrinkage and cluster collapse',
      'Implemented geodesic distance calculations across unit spherical manifolds',
      'Formulated an adaptive temperature schedule that achieves uniform sample distribution without gradient explosion',
    ],
    contribution:
      'Formulated the empirical evaluation protocol, authored the training pipelines, and mapped the representation geometry distributions.',
    learnings:
      'Discovered that balancing positive alignment with uniform negative distribution across the unit hypersphere is fundamental for robust embedding spaces.',
    tags: ['PyTorch', 'Metric Spaces', 'Contrastive Learning', 'Hyperspherical Uniformity', 'InfoNCE', 'Embeddings'],
    metrics: [
      { label: 'Loss Metric', value: 'InfoNCE' },
      { label: 'Geometry', value: 'Unit Sphere S²' },
      { label: 'Temperature', value: 'τ = 0.07' },
    ],
    image: '/assets/latent_manifold_artifact.jpg',
    liveUrl: 'https://github.com/rosenkrvz/nodefolio',
    githubUrl: 'https://github.com/rosenkrvz/nodefolio',
    relatedResearchPhaseId: 'phase-03',
    relatedLabId: 'lab-metric-spaces',
  },
  {
    id: 'proj-optimization',
    title: 'Convex Objective Landscape Analyzer',
    tagline: 'Loss Surface Geometry, Ill-Conditioned Valleys & Convergence Trajectories',
    category: 'Optimization & Mathematical Foundations',
    status: 'Foundational Study • Validated',
    description:
      'A continuous 3D numerical loss surface visualization with gradient descent convergence trajectories, condition number analysis, and Lagrangian duality verification.',
    problem:
      'Standard gradient descent oscillates violently in ill-conditioned loss valleys where orthogonal curvatures differ significantly, obscuring how adaptive momentum algorithms stabilize convergence.',
    approach:
      'Analyzed Hessian eigenvalues and condition numbers on anisotropic quadratic paraboloids, comparing adaptive learning rate updates against steepest descent vectors.',
    implementation: [
      'Implemented numerical gradient descent convergence simulations in NumPy and Python',
      'Generated parametric 3D contour isolines and global minimum stationary points',
      'Formulated formal derivations of KKT conditions and Lagrangian dual bounds',
      'Visualized steepest descent trajectories converging along principal curvature vectors',
    ],
    contribution:
      'Authored the numerical simulation routines, derived the quadratic optimization equations, and built the 3D parametric landscape visualizer.',
    learnings:
      'Locally quadratic approximations of loss surfaces explain why adaptive optimizers (Adam, RMSProp) stabilize training in ill-conditioned valleys where standard SGD oscillates.',
    tags: ['Python', 'NumPy', 'Convex Optimization', 'Loss Landscapes', 'Gradient Descent', 'KKT Duality'],
    metrics: [
      { label: 'Condition No.', value: 'κ = 1.80' },
      { label: 'Learning Rate', value: 'η = 0.08' },
      { label: 'Convergence', value: 'Linear O(1/k)' },
    ],
    image: '/assets/latent_manifold_artifact.jpg',
    liveUrl: 'https://github.com/rosenkrvz/nodefolio',
    githubUrl: 'https://github.com/rosenkrvz/nodefolio',
    relatedResearchPhaseId: 'phase-02',
    relatedLabId: 'lab-convex-landscape',
  },
  {
    id: 'proj-nodefolio',
    title: 'Nodefolio Spatial Workspace Engine',
    tagline: 'Responsive Computational Graph Workspace & Continuous Hermite Scroll Architecture',
    category: 'Web / Interactive Systems Architecture',
    status: 'Production • Live System',
    description:
      'An open-source interactive spatial portfolio and research workspace built with React, Three.js, and TypeScript, featuring continuous hermite scroll choreography, responsive node graph auto-fitting, and dedicated 3D WebGL research instruments.',
    problem:
      'Traditional web portfolios are flat, disconnected pages that isolate interactive 3D work from technical documentation, case studies, and engineering logs.',
    approach:
      'Engineered a unified continuous spatial architecture where an editorial landing cover lifts smoothly via quintic smootherstep curves into an interactive node graph, connected seamlessly to a production 3D research instrument.',
    implementation: [
      'Engineered calculateAutoFitTransform() calculating node bounding boxes and safe insets to adapt to any viewport from 320px to 4K',
      'Built hardware-accelerated cubic bezier spline connections with animated SVG energy pulses',
      'Implemented isolated pointer capture ensuring 3D model rotation inside node containers does not trigger canvas drag events',
      'Created zero-overhead direct DOM orientation tracking for 60 FPS WebGL rendering',
    ],
    contribution:
      'Sole author and designer. Architected the component tree, spatial algorithms, spline mathematics, and visual identity.',
    learnings:
      'Spatial interfaces demand bounding-box-aware layout engines rather than rigid CSS breakpoints, and multi-tier gesture isolation is essential for nested 3D canvas elements.',
    tags: ['React', 'TypeScript', 'Vite', 'Three.js', 'TailwindCSS', 'CSS Math', 'Spatial UI'],
    metrics: [
      { label: 'Architecture', value: 'Continuous Spatial' },
      { label: 'Viewport Adaptation', value: 'Dynamic Bounding Box' },
      { label: 'Framerate', value: 'Locked 60 FPS' },
    ],
    image: '/assets/latent_manifold_artifact.jpg',
    liveUrl: 'https://github.com/rosenkrvz/nodefolio',
    githubUrl: 'https://github.com/rosenkrvz/nodefolio',
    relatedLabId: 'lab-nodespace-fitting',
  },
];

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * LAB BUILD LOG & EXPERIMENT HISTORY
 * Authentic chronological technical dispatches capturing experiments,
 * optimizations, breakthroughs, and architectural lessons learned.
 * ═══════════════════════════════════════════════════════════════════════════
 */
export const LAB_ENTRIES: LabEntry[] = [
  {
    id: 'lab-nodespace-fitting',
    date: 'SEP 2026',
    displayYear: '2026',
    period: 'SEPTEMBER 2026',
    numeral: '01',
    title: 'Responsive Node Space Auto-Fitting & Bounding Box Scaling',
    type: 'OPTIMIZATION',
    context:
      'Displaying an interactive node graph across mobile screens, tablets, laptops, and ultra-wide displays requires dynamic spatial scaling rather than fixed CSS pixel coordinates.',
    problem:
      'Nodes were overflowing the viewport on smaller laptop screens while leaving massive unused voids on ultra-wide monitors. Spline coordinates occasionally clipped, and touch gestures caused accidental browser scrolling.',
    investigation:
      'Tested pure CSS media queries, which proved too rigid for dynamically arranged graph nodes. Also evaluated naive viewport scaling (CSS zoom), which produced blurry text rendering and unaligned mouse hit-boxes.',
    approach:
      'Developed a mathematical two-pass bounding-box fitting algorithm that calculates the actual bounding box encompassing all active nodes, subtracts UI safe-area margins (header, dock, inspection drawers), and smoothly interpolates optimal translation and zoom scale.',
    implementation:
      'Implemented calculateAutoFitTransform() in App.tsx with debounced resize observers, touch gesture boundaries, and touch-action: none isolation.',
    result:
      'All graph nodes remain centered, legible, and visually balanced across screen sizes from 320px mobile to 2560px monitors with zero clipping.',
    lesson:
      'Spatial interfaces require layout systems designed for dynamic bounding boxes, not hardcoded viewport pixel assumptions.',
    status: 'production',
    statusLabel: 'SYSTEM OPTIMIZED',
    tags: ['Spatial UI', 'Bounding Box', 'Responsive Math', 'Touch Gestures', 'React 18'],
    relatedProjectId: 'proj-nodefolio',
    metrics: [
      { label: 'Target Viewports', value: '320px to 4K' },
      { label: 'Scaling Mode', value: 'Dynamic Bounding Box' },
      { label: 'Status', value: 'Deployed' },
    ],
  },
  {
    id: 'lab-latent-manifold',
    date: 'AUG 2026',
    displayYear: '2026',
    period: 'AUGUST 2026',
    numeral: '02',
    title: 'Continuous Riemannian Latent Manifold Traversal & Geodesic ODEs',
    type: 'BUILD',
    context:
      'High-dimensional latent representations in generative models are often treated as flat Euclidean spaces, ignoring the geometric distortion induced by deep non-linear decoder networks.',
    problem:
      'Linear Euclidean interpolation frequently traverses low-probability sparse regions, causing perceptual distortion and mode collapse between semantic endpoints.',
    investigation:
      'Compared linear interpolation against spherical SLERP and score-matching vector field paths. Observed that vector field tangents naturally follow high-probability density ridges.',
    approach:
      'Constructed an interactive 3D WebGL manifold workspace where semantic modes act as curvature wells, with geodesic paths computed via Runge-Kutta numerical integration along score-matching vector fields.',
    implementation:
      'Engineered a Three.js parametric height-deformation shader with dynamic isocurve contours, instanced satellite cluster atoms, and dynamic tangent frames.',
    result:
      'Smooth, continuous interpolation along high-probability ridges with real-time 60 FPS interactive orbit and zero perceptual drift.',
    lesson:
      'Geometry-aware interpolation preserves semantic fidelity far better than flat linear shortcuts in deep representation spaces.',
    status: 'active',
    statusLabel: 'INTERACTIVE STUDY',
    tags: ['PyTorch', 'Vector Fields', 'Riemannian Manifolds', 'Score Matching', 'WebGL Projection'],
    relatedProjectId: 'proj-visualizer',
    relatedResearchPhaseId: 'phase-05',
    metrics: [
      { label: 'Topology', value: 'Non-Euclidean' },
      { label: 'Compute', value: 'WebGL / Three.js' },
      { label: 'Status', value: 'Interactive' },
    ],
  },
  {
    id: 'lab-attention-tiling',
    date: 'JAN 2025',
    displayYear: '2025',
    period: 'Q4 2024 — Q1 2025',
    numeral: '03',
    title: 'Self-Attention Memory Hierarchy & KV-Cache Dynamics',
    type: 'EXPERIMENT',
    context:
      'Transformer sequence scaling is constrained by memory bandwidth rather than pure compute capacity due to repeated round-trips between GPU global memory (HBM) and on-chip SRAM.',
    problem:
      'Materializing the quadratic N x N attention matrix in global memory creates massive IO overhead and exhausts VRAM during long-context evaluation.',
    investigation:
      'Implemented tiled matrix multiplication in Triton and PyTorch to profile memory traffic during long-context forward passes against standard eager attention.',
    approach:
      'Fused online softmax computation into the outer tiled loop, eliminating the need to materialize the quadratic N x N attention matrix in GPU global memory.',
    implementation:
      'Authored tiled forward pass kernels in Triton, tracking online softmax scaling factors with block tiling on SRAM.',
    result:
      'Drastically reduced global memory roundtrips from O(N²) to O(N), proving how hardware memory hierarchy awareness unlocks sequence scalability.',
    lesson:
      'Modern deep learning algorithms must be designed with explicit awareness of hardware memory hierarchies; mathematical formulation and physical execution are inseparable.',
    status: 'verified',
    statusLabel: 'MEASURED BENCHMARK',
    tags: ['PyTorch', 'Triton', 'FlashAttention', 'Memory Hierarchy', 'KV Cache', 'Tiled Matrix'],
    relatedProjectId: 'proj-attention',
    relatedResearchPhaseId: 'phase-04',
    metrics: [
      { label: 'Bottleneck', value: 'Memory IO' },
      { label: 'Tiling', value: 'On-Chip SRAM' },
      { label: 'Status', value: 'Benchmarked' },
    ],
  },
  {
    id: 'lab-metric-spaces',
    date: 'JUL 2024',
    displayYear: '2024',
    period: 'MID — LATE 2024',
    numeral: '04',
    title: 'Hyperspherical Uniformity & Contrastive Representation Spaces',
    type: 'RESEARCH',
    context:
      'Self-supervised representation models risk representation collapse and dimensional shrinkage, where embeddings collapse along low-dimensional subspaces instead of utilizing the full hypersphere.',
    problem:
      'Low temperature hyperparameters aggressively separate negative samples to enforce uniformity but increase gradient variance; high temperatures yield smooth cluster separation but risk collapse.',
    investigation:
      'Monitored InfoNCE loss dynamics under varying temperatures across synthetic and image benchmarks, tracking spherical harmonics and singular value decay.',
    approach:
      'Formulated an adaptive temperature schedule that balances positive pair alignment with uniform negative distribution across the unit hypersphere S².',
    implementation:
      'Constructed contrastive learning loss pipelines and geodesic distance metrics on manifolds in PyTorch.',
    result:
      'Established optimal temperature regimes that maximize representation uniformity without inducing gradient variance instability.',
    lesson:
      'Balancing positive pair alignment with uniform negative distribution across the unit hypersphere is fundamental for robust embedding spaces.',
    status: 'verified',
    statusLabel: 'EMPIRICAL STUDY',
    tags: ['Metric Spaces', 'Contrastive Learning', 'Hyperspherical Uniformity', 'InfoNCE', 'Embeddings'],
    relatedProjectId: 'proj-metric',
    relatedResearchPhaseId: 'phase-03',
    metrics: [
      { label: 'Loss Metric', value: 'InfoNCE' },
      { label: 'Geometry', value: 'Unit Sphere S²' },
      { label: 'Status', value: 'Completed' },
    ],
  },
  {
    id: 'lab-convex-landscape',
    date: 'DEC 2023',
    displayYear: '2023',
    period: '2023 — 2024',
    numeral: '05',
    title: 'Convex Optimization, Probability & Statistical Machine Learning',
    type: 'DEBUG',
    context:
      'Deep learning abstractions often obscure the underlying mathematical principles that govern gradient convergence, regularization, and probabilistic uncertainty.',
    problem:
      'Locally quadratic approximations of loss surfaces show why standard stochastic gradient descent oscillates in ill-conditioned valleys where orthogonal curvatures differ by orders of magnitude.',
    investigation:
      'Completed formal derivations and numerical implementations of convex optimization methods (Lagrangian duality, KKT conditions, proximal operators) and probabilistic inference.',
    approach:
      'Analyzed Hessian eigenvalues and condition numbers on anisotropic paraboloids, comparing adaptive learning rates against steepest descent vectors.',
    implementation:
      'Built numerical gradient descent simulators and 3D parametric loss landscapes with contour isolines.',
    result:
      'Demonstrated how adaptive momentum dampens orthogonal oscillations and accelerates convergence along the principal eigenvector.',
    lesson:
      'A thorough mathematical foundation in linear algebra and multivariable optimization provides the essential tools to evaluate and implement complex machine learning literature.',
    status: 'foundation',
    statusLabel: 'FOUNDATIONAL RIGOR',
    tags: ['Linear Algebra', 'Convex Optimization', 'Probability Theory', 'Bayesian Inference', 'Multivariate'],
    relatedProjectId: 'proj-optimization',
    relatedResearchPhaseId: 'phase-02',
    metrics: [
      { label: 'Domain', value: 'Optimization' },
      { label: 'Method', value: 'KKT Duality' },
      { label: 'Status', value: 'Coursework' },
    ],
  },
  {
    id: 'lab-autograd-tape',
    date: 'MAY 2023',
    displayYear: '2023',
    period: 'EARLY 2023',
    numeral: '06',
    title: 'First Principles: Computational Graphs & Reverse-Mode Autodiff',
    type: 'BUILD',
    context:
      'Relying exclusively on high-level framework abstractions creates an illusion of understanding without grasping topological graph sorting and backward tape accumulation.',
    problem:
      'Demystifying how tensor frameworks allocate activation memory during the forward pass and reclaim intermediate tensors during backward passes.',
    investigation:
      'Constructed a lightweight scalar and tensor autograd engine from scratch in Python with a C++ extension.',
    approach:
      'Implemented dynamic tape recording where operations register closures during forward execution, followed by reverse-mode chain-rule traversal along a directed acyclic graph.',
    implementation:
      'Wrote DAG topological sorting via Kahn\'s algorithm, dynamic tape recording, and reverse-mode derivative propagation.',
    result:
      'A functional automatic differentiation engine passing analytical gradient checks against numerical finite differences.',
    lesson:
      'Backpropagation is mathematically straightforward—an ordered chain-rule traversal along a directed acyclic graph—while the engineering challenge lies in memory management and broadcast bookkeeping.',
    status: 'deployed',
    statusLabel: 'SYSTEM BUILT',
    tags: ['Computational Graphs', 'Reverse-Mode Autodiff', 'DAG Topological Sort', 'Autograd Tape', 'C++ / Python'],
    relatedProjectId: 'proj-autograd',
    relatedResearchPhaseId: 'phase-01',
    metrics: [
      { label: 'Engine', value: 'From Scratch' },
      { label: 'Architecture', value: 'DAG Tape' },
      { label: 'Status', value: 'Built & Tested' },
    ],
  },
];

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * WORK VISUAL PROJECT INDEX (INITIAL NODES)
 * Square nodes arranged in a semantic hierarchy:
 * Root (Identity) -> Domain Pillars -> Concrete Technical Projects
 * ═══════════════════════════════════════════════════════════════════════════
 */
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
    project: PORTFOLIO_PROJECTS[0],
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
