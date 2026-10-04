export interface SkillCharacterSpec {
  symbol: string;
  code: string;
  badge: string;
  formula: string;
  specs: { label: string; value: string }[];
  architecturalNotes: string;
}

export const SKILL_CHARACTER_MAP: Record<string, SkillCharacterSpec> = {
  // Generative Architectures (node-models)
  'Diffusion & Latent Dynamics': {
    symbol: '≋',
    code: 'SDE-DIFFUSION',
    badge: 'SCORE SDE // STOCHASTIC',
    formula: 'dx = -½ β(t)x dt + √β(t) dw • softmax(QKᵀ / √d_k)V',
    specs: [
      { label: 'SAMPLER', value: '50-step EDM / Heun' },
      { label: 'LATENT', value: '64×64×4 continuous' },
      { label: 'OBJECTIVE', value: 'Score Matching / VLB' },
      { label: 'PRECISION', value: 'BF16 Tensor Cores' },
    ],
    architecturalNotes:
      'Continuous-time variance-preserving SDE with classifier-free guidance, achieving photorealistic generative convergence with reduced step trajectories.',
  },
  'Transformers & Self-Attention': {
    symbol: '☵',
    code: 'TRANSFORMER-ATTN',
    badge: 'FLASH-ATTN // ROPE',
    formula: 'Attn(Q,K,V) = softmax(QKᵀ / √d_k)V',
    specs: [
      { label: 'CONTEXT', value: '128k Tokens (Paged)' },
      { label: 'HEADS', value: '16 Multi-Query (GQA)' },
      { label: 'KERNEL', value: 'FlashAttention-2 Fused' },
      { label: 'COMPLEXITY', value: 'Sliding-Window O(N)' },
    ],
    architecturalNotes:
      'Hardware-fused attention kernel with rotary positional embeddings and zero-copy paged KV cache for high-throughput sequence modeling.',
  },
  'Representation & Embeddings': {
    symbol: '◎',
    code: 'EMBED-MANIFOLD',
    badge: 'METRIC MANIFOLD // INFONCE',
    formula: 'ℒ_NCE = -log (e^{sim(q,k_+)/τ} / ∑ e^{sim(q,k_i)/τ})',
    specs: [
      { label: 'MANIFOLD', value: 'Riemannian Hypersphere 𝕊ⁿ' },
      { label: 'DIMENSION', value: '1536-D Isotropic' },
      { label: 'DISTANCE', value: 'Cosine & Geodesic' },
      { label: 'MARGIN', value: 'ArcFace Angular Penalty' },
    ],
    architecturalNotes:
      'Deep metric learning mapping multimodal representations to isometric hyperspherical manifolds with maximal inter-class angular separation.',
  },
  'PyTorch & Computational Graphs': {
    symbol: '⚙',
    code: 'AUTOGRAD-GRAPH',
    badge: 'AUTOGRAD // CUDA 12.4',
    formula: '∇_θ ℒ = ∑_{v ∈ DAG} (∂ℒ/∂v)(∂v/∂θ)',
    specs: [
      { label: 'RUNTIME', value: 'PyTorch 2.4 + TorchDynamo' },
      { label: 'ALLOCATOR', value: 'CUDA Caching Allocator' },
      { label: 'JIT ENGINE', value: 'TorchInductor Triton' },
      { label: 'GRAPHS', value: 'CUDA Graph Capture' },
    ],
    architecturalNotes:
      'Dynamic autograd execution graph compiled via TorchInductor with custom Triton fused kernels to maximize GPU roofline compute saturation.',
  },

  // Neural Systems & Data Infrastructure (node-systems)
  'Vector Search & Embeddings': {
    symbol: '⬡',
    code: 'HNSW-INDEX',
    badge: 'HNSW GRAPH // 1.4MS',
    formula: 'd(u,v) = 1 - (u·v)/(‖u‖‖v‖)',
    specs: [
      { label: 'INDEX', value: 'HNSW M=32, ef=200' },
      { label: 'SCALE', value: '10M+ Vectors Indexed' },
      { label: 'LATENCY', value: 'p99 1.4ms Cosine' },
      { label: 'COMPRESSION', value: 'Scalar Quantization (SQ8)' },
    ],
    architecturalNotes:
      'Hierarchical small-world graph index enabling sub-millisecond approximate nearest neighbor search across dense multi-modal embedding spaces.',
  },
  'Data Pipelines & Feature Handling': {
    symbol: '⇶',
    code: 'ARROW-STREAM',
    badge: 'ARROW IPC // ZERO-COPY',
    formula: 'Throughput ≥ 420 MB/s (p99 < 4.2ms)',
    specs: [
      { label: 'PROTOCOL', value: 'Apache Arrow IPC' },
      { label: 'BUFFER', value: 'Ring-Buffer Lockless' },
      { label: 'STORAGE', value: 'Snappy Columnar Parquet' },
      { label: 'SERIALIZE', value: 'Zero-Copy Shared Memory' },
    ],
    architecturalNotes:
      'High-bandwidth streaming ingestion pipeline handling continuous feature extraction and batch tensor transformation in zero-copy shared memory.',
  },
  'Model Evaluation & Telemetry': {
    symbol: '◬',
    code: 'CALIBRATION-ECE',
    badge: 'CALIBRATION // ECE AUDIT',
    formula: 'ECE = ∑ (|B_m|/N) |acc(B_m) - conf(B_m)|',
    specs: [
      { label: 'ECE', value: '< 0.015 Calibrated' },
      { label: 'METRICS', value: 'ROC-AUC 0.974 / PR-AUC' },
      { label: 'DRIFT TEST', value: 'Kolmogorov-Smirnov' },
      { label: 'UNCERTAINTY', value: 'MC-Dropout Temperature' },
    ],
    architecturalNotes:
      'Continuous statistical validation suite auditing empirical reliability diagrams, confidence calibration, and multivariate concept drift.',
  },
  'Inference & Latency Optimization': {
    symbol: '⚡',
    code: 'TENSORRT-INT8',
    badge: 'TENSORRT 10 // INT8',
    formula: 'Latency_p99 ≤ 12.4ms (Speedup: 3.8×)',
    specs: [
      { label: 'ENGINE', value: 'NVIDIA TensorRT 10.0' },
      { label: 'QUANT', value: 'INT8 SmoothQuant (PTQ)' },
      { label: 'FUSION', value: 'LayerNorm + GeLU Fused' },
      { label: 'THROUGHPUT', value: '1,450 req/sec Peak' },
    ],
    architecturalNotes:
      'Sub-15ms production deployment pipeline utilizing INT8 quantization, layer fusion, and targeted Tensor Core execution.',
  },
};
