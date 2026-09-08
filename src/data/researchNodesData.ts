import { NodeData, Connection } from '../types';

export const EXPANDED_RESEARCH_NODES: NodeData[] = [
  // -------------------------------------------------------------
  // NODE 01 — STATISTICAL INFERENCE (Column 2, Tier 3)
  // -------------------------------------------------------------
  {
    id: 'node-inference',
    title: 'Statistical Inference',
    subtitle: 'Probability & Decision Systems',
    category: 'statistics',
    shape: 'square',
    x: 560,
    y: 1000,
    width: 340,
    inputs: [
      { id: 'pin-inf-in', label: 'mathematical.core', color: 'crimson', type: 'input', nodeId: 'node-inference' },
    ],
    outputs: [
      { id: 'pin-inf-out', label: 'hypothesis.dist', color: 'rose', type: 'output', nodeId: 'node-inference' },
    ],
    accentColor: '#f43f5e',
    glowColor: 'rgba(244, 63, 94, 0.22)',
    researchData: {
      domain: 'Statistics',
      method: 'Inference',
      state: 'Foundational',
      compute: 'Analytical',
      overview:
        'Formalizes probabilistic reasoning, Bayesian belief updating, and hypothesis testing. Serves as the mathematical bedrock for evaluating confidence intervals and parameter distributions in machine learning.',
      computationalDetails: [
        'Bayesian prior-to-posterior conjugate updating for parametric distributions.',
        'Maximum Likelihood Estimation (MLE) and Maximum A Posteriori (MAP) formulations.',
        'Markov Chain Monte Carlo (MCMC) and Metropolis-Hastings sampling for intractable posteriors.',
        'Hypothesis testing, false discovery rate (FDR) control, and p-value calibration.',
      ],
      metrics: [
        { label: 'Prior Belief', value: 'Conjugate Beta-Binomial' },
        { label: 'Sampling Mode', value: 'Hamiltonian MC' },
        { label: 'Confidence', value: '99.4% Credible' },
      ],
      tags: ['Probability Models', 'Bayesian Reasoning', 'Statistical Estimation', 'Hypothesis Testing'],
      relatedNodeIds: ['node-credentials', 'node-eval', 'node-optimization'],
      visualizationType: 'distribution',
    },
  },

  // -------------------------------------------------------------
  // NODE 02 — OPTIMIZATION ENGINE (Column 2, Tier 4)
  // -------------------------------------------------------------
  {
    id: 'node-optimization',
    title: 'Optimization Engine',
    subtitle: 'Learning Through Objective Functions',
    category: 'optimization',
    shape: 'square',
    x: 560,
    y: 1460,
    width: 340,
    inputs: [
      { id: 'pin-opt-in', label: 'loss.gradient', color: 'crimson', type: 'input', nodeId: 'node-optimization' },
    ],
    outputs: [
      { id: 'pin-opt-out', label: 'param.trajectory', color: 'crimson', type: 'output', nodeId: 'node-optimization' },
    ],
    accentColor: '#e11d48',
    glowColor: 'rgba(225, 29, 72, 0.22)',
    researchData: {
      domain: 'Mathematics / Computation',
      method: 'Optimization',
      state: 'Active',
      compute: 'Iterative',
      overview:
        'Analyzes the topology of loss landscapes, convex and non-convex convergence behaviors, and adaptive learning rate schedulers to guide high-dimensional neural parameter trajectories.',
      computationalDetails: [
        'First-order stochastic gradient methods with adaptive momentum (AdamW, Lion, Sophia).',
        'Hessian spectrum inspection, saddle-point escape dynamics, and condition number conditioning.',
        'Learning rate warmup schedules, cosine annealing, and gradient norm clipping.',
        'Constrained and projected gradient descent over manifold-bounded parameter spaces.',
      ],
      metrics: [
        { label: 'Objective', value: 'Minimize L(θ)' },
        { label: 'Hessian Cond', value: 'κ ≈ 14.8' },
        { label: 'Convergence', value: 'O(1/√T) Guaranteed' },
      ],
      tags: ['Gradient Descent', 'Convex Optimization', 'Loss Landscapes', 'Parameter Search'],
      relatedNodeIds: ['node-systems', 'node-models', 'node-generative', 'node-lab'],
      visualizationType: 'trajectory',
    },
  },

  // -------------------------------------------------------------
  // NODE 03 — DATA PIPELINE (Column 1, Tier 1)
  // -------------------------------------------------------------
  {
    id: 'node-pipeline',
    title: 'Data Pipeline',
    subtitle: 'From Raw Signals to Features',
    category: 'pipeline',
    shape: 'square',
    x: 100,
    y: 80,
    width: 340,
    inputs: [],
    outputs: [
      { id: 'pin-pipe-out', label: 'feature.store', color: 'crimson', type: 'output', nodeId: 'node-pipeline' },
      { id: 'pin-pipe-vision', label: 'raw.stream', color: 'rose', type: 'output', nodeId: 'node-pipeline' },
    ],
    accentColor: '#be123c',
    glowColor: 'rgba(190, 18, 60, 0.18)',
    researchData: {
      domain: 'Data / Infrastructure',
      method: 'Pipeline',
      state: 'Streaming',
      compute: 'Distributed',
      overview:
        'High-throughput data ingestion, transformation, deduplication, and schema validation translating noisy real-world signals into standardized tensor features.',
      computationalDetails: [
        'Zero-copy columnar memory layouts using Apache Arrow and streaming Parquet partitions.',
        'MinHash LSH for fuzzy text and signal deduplication at scale.',
        'Online feature store materialization with sub-millisecond retrieval guarantees.',
        'Strict schema contracts and distribution anomaly monitoring on feature drift.',
      ],
      metrics: [
        { label: 'Throughput', value: '420 MB/s Stream' },
        { label: 'Encoding', value: 'Arrow Columnar' },
        { label: 'Dedup Ratio', value: '18.4% Redundant' },
      ],
      tags: ['Collection', 'Cleaning', 'Transformation', 'Feature Engineering'],
      relatedNodeIds: ['node-systems', 'node-vision', 'node-eval'],
      visualizationType: 'pipeline',
    },
  },

  // -------------------------------------------------------------
  // NODE 04 — MODEL EVALUATION (Column 3, Tier 3)
  // -------------------------------------------------------------
  {
    id: 'node-eval',
    title: 'Model Evaluation',
    subtitle: 'Measurement, Error & Generalization',
    category: 'evaluation',
    shape: 'square',
    x: 1020,
    y: 1000,
    width: 340,
    inputs: [
      { id: 'pin-eval-in', label: 'hypothesis.dist', color: 'rose', type: 'input', nodeId: 'node-eval' },
    ],
    outputs: [
      { id: 'pin-eval-out', label: 'error.signal', color: 'crimson', type: 'output', nodeId: 'node-eval' },
    ],
    accentColor: '#f43f5e',
    glowColor: 'rgba(244, 63, 94, 0.2)',
    researchData: {
      domain: 'Machine Learning',
      method: 'Evaluation',
      state: 'Benchmarking',
      compute: 'Analytical',
      overview:
        'Comprehensive empirical evaluation framework auditing generalization bounds, classification calibration (ECE), out-of-distribution robustness, and adversarial vulnerability.',
      computationalDetails: [
        'Expected Calibration Error (ECE) and Brier Score tracking confidence reliability.',
        'Stratified k-fold cross-validation with leakage-isolated preprocessing pipelines.',
        'Covariate shift and concept drift detection via Wasserstein distance tests.',
        'Precision-Recall AUC profiling across imbalanced evaluation splits.',
      ],
      metrics: [
        { label: 'ROC-AUC', value: '0.984' },
        { label: 'Calibration ECE', value: '0.012' },
        { label: 'Shift Metric', value: 'W-Dist < 0.04' },
      ],
      tags: ['Accuracy', 'Precision / Recall', 'Calibration', 'Distribution Shift'],
      relatedNodeIds: ['node-inference', 'node-systems', 'node-pipeline'],
      visualizationType: 'benchmarks',
    },
  },

  // -------------------------------------------------------------
  // NODE 05 — VECTOR SYSTEMS (Column 4, Tier 1)
  // -------------------------------------------------------------
  {
    id: 'node-vector',
    title: 'Vector Systems',
    subtitle: 'Embeddings & Similarity',
    category: 'vectors',
    shape: 'square',
    x: 1480,
    y: 80,
    width: 340,
    inputs: [
      { id: 'pin-vec-in', label: 'latent.projection', color: 'crimson', type: 'input', nodeId: 'node-vector' },
    ],
    outputs: [
      { id: 'pin-vec-out', label: 'hnsw.index', color: 'rose', type: 'output', nodeId: 'node-vector' },
    ],
    accentColor: '#e11d48',
    glowColor: 'rgba(225, 29, 72, 0.22)',
    researchData: {
      domain: 'Representation / Data',
      method: 'Search',
      state: 'Experimental',
      compute: 'High-Dimensional',
      overview:
        'Sub-linear nearest neighbor retrieval across dense high-dimensional manifolds using Hierarchical Navigable Small World (HNSW) graphs and product quantization.',
      computationalDetails: [
        'HNSW graph index construction with tuned M and efSearch connectivity parameters.',
        'Cosine, Inner Product, and Euclidean metric space normalization.',
        'Product Quantization (PQ) reducing vector memory footprint by 75% with minimal recall degradation.',
        'Manifold clustering via k-means and topological persistent homology analysis.',
      ],
      metrics: [
        { label: 'Dimension', value: '1536-D Dense' },
        { label: 'Latency', value: '1.4ms Top-100' },
        { label: 'Recall@10', value: '98.2%' },
      ],
      tags: ['Embeddings', 'Vector Search', 'Similarity Spaces', 'High-Dimensional Indexing'],
      relatedNodeIds: ['node-project', 'node-systems', 'node-models'],
      visualizationType: 'pointcloud',
    },
  },

  // -------------------------------------------------------------
  // NODE 06 — COMPUTER VISION (Column 2, Tier 1)
  // -------------------------------------------------------------
  {
    id: 'node-vision',
    title: 'Computer Vision',
    subtitle: 'Signals, Features & Visual Reps',
    category: 'vision',
    shape: 'square',
    x: 560,
    y: 80,
    width: 340,
    inputs: [
      { id: 'pin-vis-in', label: 'raw.stream', color: 'rose', type: 'input', nodeId: 'node-vision' },
    ],
    outputs: [
      { id: 'pin-vis-out', label: 'spatial.embedding', color: 'crimson', type: 'output', nodeId: 'node-vision' },
    ],
    accentColor: '#be123c',
    glowColor: 'rgba(190, 18, 60, 0.2)',
    researchData: {
      domain: 'Perception / Machine Learning',
      method: 'Vision',
      state: 'Active',
      compute: 'GPU-Accelerated',
      overview:
        'Extracts hierarchical semantic features from visual signals through convolutional spatial filters, patch tokenization, and vision transformer (ViT) self-attention.',
      computationalDetails: [
        'Multi-scale feature pyramid networks (FPN) preserving spatial fidelity across receptive fields.',
        'Vision Transformer (ViT) patch extraction (16x16) with 2D learnable positional embeddings.',
        'Self-supervised pre-training via Masked Autoencoders (MAE) with high masking ratios.',
        'Deformable attention layers focusing on semantic object contours.',
      ],
      metrics: [
        { label: 'Backbone', value: 'ViT-Base / Patch16' },
        { label: 'Receptive Field', value: 'Infinite (Global)' },
        { label: 'Attention Heads', value: '12-Head Multi' },
      ],
      tags: ['Image Features', 'Representation Learning', 'Vision Models', 'Spatial Information'],
      relatedNodeIds: ['node-pipeline', 'node-models', 'node-generative'],
      visualizationType: 'featuregrid',
    },
  },

  // -------------------------------------------------------------
  // NODE 07 — GENERATIVE SYSTEMS (Column 3, Tier 4)
  // -------------------------------------------------------------
  {
    id: 'node-generative',
    title: 'Generative Systems',
    subtitle: 'Learning Distributions & Structure',
    category: 'generative',
    shape: 'square',
    x: 1020,
    y: 1460,
    width: 340,
    inputs: [
      { id: 'pin-gen-in', label: 'param.trajectory', color: 'crimson', type: 'input', nodeId: 'node-generative' },
    ],
    outputs: [
      { id: 'pin-gen-out', label: 'score.manifold', color: 'rose', type: 'output', nodeId: 'node-generative' },
      { id: 'pin-gen-lab', label: 'latent.stress', color: 'crimson', type: 'output', nodeId: 'node-generative' },
    ],
    accentColor: '#f43f5e',
    glowColor: 'rgba(244, 63, 94, 0.24)',
    researchData: {
      domain: 'Generative AI',
      method: 'Generative',
      state: 'Experimental',
      compute: 'Diffusion ODE',
      overview:
        'Models complex data probability distributions through forward noise perturbation and reverse score matching, solving reverse-time Stochastic Differential Equations (SDEs).',
      computationalDetails: [
        'Score-based generative modeling matching score functions ∇_x log p_t(x).',
        'Euler-Maruyama and Runge-Kutta numerical solvers for deterministic sampling (DDIM).',
        'Classifier-free guidance (CFG) balancing sample fidelity against mode diversity.',
        'Latent Space autoencoding compressing pixel spaces into smooth continuous manifolds.',
      ],
      metrics: [
        { label: 'Sampler', value: 'Heun 2nd-Order' },
        { label: 'Steps', value: '25 Steps Convergence' },
        { label: 'FID Target', value: '1.82 Benchmark' },
      ],
      tags: ['Diffusion', 'Generative Models', 'Latent Spaces', 'Sampling'],
      relatedNodeIds: ['node-models', 'node-project', 'node-optimization', 'node-lab'],
      visualizationType: 'particlefield',
    },
  },

  // -------------------------------------------------------------
  // NODE 08 — SOFTWARE SYSTEMS (Column 5, Tier 3)
  // -------------------------------------------------------------
  {
    id: 'node-software',
    title: 'Software Systems',
    subtitle: 'Turning Models Into Software',
    category: 'software',
    shape: 'square',
    x: 2040,
    y: 1120,
    width: 340,
    inputs: [
      { id: 'pin-soft-in', label: 'cuda.kernels', color: 'crimson', type: 'input', nodeId: 'node-software' },
    ],
    outputs: [
      { id: 'pin-soft-out', label: 'runtime.api', color: 'rose', type: 'output', nodeId: 'node-software' },
    ],
    accentColor: '#9f1239',
    glowColor: 'rgba(159, 18, 57, 0.2)',
    researchData: {
      domain: 'Engineering',
      method: 'Architecture',
      state: 'Building',
      compute: 'Full Stack',
      overview:
        'Bridges mathematical prototypes and mission-critical production software through low-overhead APIs, microservice isolation, async queues, and observable runtime telemetry.',
      computationalDetails: [
        'Asynchronous Python / TypeScript runtime orchestration with backpressure control.',
        'Dynamic batching and memory-efficient streaming endpoints with SSE / WebSockets.',
        'Containerized microservices running under strict health probes and auto-scaling triggers.',
        'Distributed tracing and OpenTelemetry metrics for tail-latency bottleneck isolation.',
      ],
      metrics: [
        { label: 'API p99 Latency', value: '14.2ms Target' },
        { label: 'Concurrency', value: 'Async Event Loop' },
        { label: 'Uptime', value: 'Fault Tolerant' },
      ],
      tags: ['APIs', 'Architecture', 'Backend Systems', 'Deployment'],
      relatedNodeIds: ['node-computational', 'node-systems', 'node-clock'],
      visualizationType: 'architecture',
    },
  },

  // -------------------------------------------------------------
  // NODE 09 — EXPERIMENT LAB (Column 4, Tier 4)
  // -------------------------------------------------------------
  {
    id: 'node-lab',
    title: 'Experiment Lab',
    subtitle: 'Ideas Under Computational Stress',
    category: 'experiment',
    shape: 'square',
    x: 1480,
    y: 1460,
    width: 340,
    inputs: [
      { id: 'pin-lab-in', label: 'latent.stress', color: 'crimson', type: 'input', nodeId: 'node-lab' },
    ],
    outputs: [
      { id: 'pin-lab-out', label: 'ablation.telemetry', color: 'rose', type: 'output', nodeId: 'node-lab' },
    ],
    accentColor: '#f43f5e',
    glowColor: 'rgba(244, 63, 94, 0.26)',
    researchData: {
      domain: 'Experimentation',
      method: 'Stress Test',
      state: 'Experimental',
      compute: 'Continuous',
      overview:
        'A sandboxed empirical laboratory subjecting architectural hypotheses, extreme loss bounds, and unconventional hyper-parameters to computational stress testing.',
      computationalDetails: [
        'Ablation matrix evaluation isolating the marginal utility of each attention component.',
        'Gradient explosion and vanish stress-testing across extreme layer depths.',
        'Documented non-convergent runs and unexpected topological artifacts.',
        'Continuous learning loops logging failure modes to eliminate dead-end search spaces.',
      ],
      metrics: [
        { label: 'Hypotheses Run', value: '142 Tracked' },
        { label: 'Surviving Ideas', value: '19 Validated' },
        { label: 'Failure Insights', value: 'Critical Learnings' },
      ],
      tags: ['Experiments', 'Prototypes', 'Failed Approaches', 'Unexpected Results'],
      relatedNodeIds: ['node-generative', 'node-optimization', 'node-models'],
      visualizationType: 'iterations',
    },
  },

  // -------------------------------------------------------------
  // NODE 10 — COMPUTATIONAL SYSTEMS (Column 5, Tier 2)
  // -------------------------------------------------------------
  {
    id: 'node-computational',
    title: 'Computational Systems',
    subtitle: 'Where Math Becomes Software',
    category: 'computational',
    shape: 'square',
    x: 2040,
    y: 680,
    width: 340,
    inputs: [],
    outputs: [
      { id: 'pin-comp-out', label: 'cuda.kernels', color: 'crimson', type: 'output', nodeId: 'node-computational' },
    ],
    accentColor: '#e11d48',
    glowColor: 'rgba(225, 29, 72, 0.2)',
    researchData: {
      domain: 'Systems / Computation',
      method: 'Architecture',
      state: 'Active',
      compute: 'Scalable',
      overview:
        'The algorithmic conduit translating abstract linear algebra and mathematical operators into high-throughput parallel execution, memory hierarchies, and hardware acceleration.',
      computationalDetails: [
        'Hardware-aware algorithmic design exploiting GPU shared memory and tensor cores.',
        'Memory bandwidth bounds (roofline model analysis) vs. compute compute-bound regimes.',
        'Kernel fusion and operator compilation via PyTorch 2.0 TorchDynamo / TorchInductor.',
        'Asymptotic complexity tuning reducing O(N^2) sequence computations to linear approximations.',
      ],
      metrics: [
        { label: 'Roofline Peak', value: 'Compute Bound' },
        { label: 'Fused Ops', value: 'Flash Attention' },
        { label: 'Precision', value: 'FP16 / BF16 Mixed' },
      ],
      tags: ['Algorithms', 'Complexity', 'Architecture', 'Performance'],
      relatedNodeIds: ['node-software', 'node-systems', 'node-optimization'],
      visualizationType: 'latencyclock',
    },
  },
];

export const EXPANDED_CONNECTIONS: Connection[] = [
  // 1. Credentials -> Statistical Inference
  {
    id: 'conn-cred-inference',
    fromNodeId: 'node-credentials',
    fromPinId: 'pin-cred-out',
    toNodeId: 'node-inference',
    toPinId: 'pin-inf-in',
    color: '#9f1239',
    label: 'mathematical.core',
    animated: true,
  },
  // 2. Statistical Inference -> Model Evaluation
  {
    id: 'conn-inference-eval',
    fromNodeId: 'node-inference',
    fromPinId: 'pin-inf-out',
    toNodeId: 'node-eval',
    toPinId: 'pin-eval-in',
    color: '#f43f5e',
    label: 'hypothesis.dist',
    animated: true,
  },
  // 3. Model Evaluation -> Neural Systems & Data
  {
    id: 'conn-eval-systems',
    fromNodeId: 'node-eval',
    fromPinId: 'pin-eval-out',
    toNodeId: 'node-systems',
    toPinId: 'pin-in-systems',
    color: '#e11d48',
    label: 'error.signal',
    animated: true,
  },
  // 4. Data Pipeline -> Neural Systems
  {
    id: 'conn-pipeline-systems',
    fromNodeId: 'node-pipeline',
    fromPinId: 'pin-pipe-out',
    toNodeId: 'node-systems',
    toPinId: 'pin-in-systems',
    color: '#be123c',
    label: 'feature.store',
    animated: true,
  },
  // 5. Data Pipeline -> Computer Vision
  {
    id: 'conn-pipeline-vision',
    fromNodeId: 'node-pipeline',
    fromPinId: 'pin-pipe-vision',
    toNodeId: 'node-vision',
    toPinId: 'pin-vis-in',
    color: '#be123c',
    label: 'raw.stream',
    animated: true,
  },
  // 6. Computer Vision -> Generative Architectures
  {
    id: 'conn-vision-models',
    fromNodeId: 'node-vision',
    fromPinId: 'pin-vis-out',
    toNodeId: 'node-models',
    toPinId: 'pin-in-models',
    color: '#f43f5e',
    label: 'spatial.embedding',
    animated: true,
  },
  // 7. Neural Systems -> Vector Systems
  {
    id: 'conn-systems-vector',
    fromNodeId: 'node-systems',
    fromPinId: 'pin-out-project',
    toNodeId: 'node-vector',
    toPinId: 'pin-vec-in',
    color: '#e11d48',
    label: 'latent.projection',
    animated: true,
  },
  // 8. Vector Systems -> Latent Graph Visualizer
  {
    id: 'conn-vector-project',
    fromNodeId: 'node-vector',
    fromPinId: 'pin-vec-out',
    toNodeId: 'node-project',
    toPinId: 'pin-in-project',
    color: '#f43f5e',
    label: 'hnsw.index',
    animated: true,
  },
  // 9. Optimization Engine -> Generative Systems
  {
    id: 'conn-opt-generative',
    fromNodeId: 'node-optimization',
    fromPinId: 'pin-opt-out',
    toNodeId: 'node-generative',
    toPinId: 'pin-gen-in',
    color: '#e11d48',
    label: 'param.trajectory',
    animated: true,
  },
  // 10. Generative Systems -> Experiment Lab
  {
    id: 'conn-generative-lab',
    fromNodeId: 'node-generative',
    fromPinId: 'pin-gen-lab',
    toNodeId: 'node-lab',
    toPinId: 'pin-lab-in',
    color: '#f43f5e',
    label: 'latent.stress',
    animated: true,
  },
  // 11. Experiment Lab -> Optimization Engine (feedback loop)
  {
    id: 'conn-lab-optimization',
    fromNodeId: 'node-lab',
    fromPinId: 'pin-lab-out',
    toNodeId: 'node-optimization',
    toPinId: 'pin-opt-in',
    color: '#e11d48',
    label: 'ablation.telemetry',
    animated: true,
  },
  // 12. Computational Systems -> Software Systems
  {
    id: 'conn-comp-software',
    fromNodeId: 'node-computational',
    fromPinId: 'pin-comp-out',
    toNodeId: 'node-software',
    toPinId: 'pin-soft-in',
    color: '#e11d48',
    label: 'cuda.kernels',
    animated: true,
  },
  // 13. Software Systems -> Clock
  {
    id: 'conn-software-clock',
    fromNodeId: 'node-software',
    fromPinId: 'pin-soft-out',
    toNodeId: 'node-clock',
    toPinId: 'pin-in-clock',
    color: '#9f1239',
    label: 'runtime.api',
    animated: true,
  },
];
