import React from 'react';
import { NodeData, SkillItem, CertificateItem, ProjectItem } from '../../types';

interface PrintCVDocumentProps {
  nodes: NodeData[];
}

export const PrintCVDocument: React.FC<PrintCVDocumentProps> = ({ nodes }) => {
  const profileNode = nodes.find((n) => n.id === 'node-profile')?.profile;
  const credNode = nodes.find((n) => n.id === 'node-credentials')?.certificates || [];
  const modelsSkills = nodes.find((n) => n.id === 'node-models')?.skills || [];
  const systemsSkills = nodes.find((n) => n.id === 'node-systems')?.skills || [];
  const projectNode = nodes.find((n) => n.id === 'node-project')?.project;

  const name = profileNode?.name || 'SHUBHAM SHARMA';
  const role = profileNode?.role || 'AI & Data Science';
  const email = profileNode?.email || 'marksrv047@gmail.com';
  const github = profileNode?.github || 'https://github.com/rosenkrvz';
  const githubUser = 'github.com/rosenkrvz';
  const linkedin = profileNode?.linkedin || 'https://linkedin.com';
  const linkedinUser = 'linkedin.com/in/shubham-sharma';
  const portfolioUrl = 'nodefolio-rosenkrvz.vercel.app';
  const location = 'India • Open for Global Remote & Relocation';

  // Structured Projects & Research Initiatives using verified portfolio & chronicle milestone data
  const researchProjects = [
    {
      title: projectNode?.title || 'Latent Graph Visualizer',
      subtitle: 'High-Dimensional Manifold & Topological Cluster Explorer',
      role: 'System Architect & Developer',
      period: '2025 — Present',
      description:
        'Engineered an interactive computational system mapping continuous neural latent spaces to discrete topological clusters. Implemented parametric traversal algorithms, non-linear dimensionality reduction projections (UMAP and t-SNE), and high-framerate WebGL coordinate rendering for 512-dimensional embedding manifolds.',
      technologies: ['PyTorch', 'WebGL / Canvas', 'Dimensionality Reduction (UMAP / t-SNE)', 'Embedding Manifolds', 'TypeScript'],
      highlights: [
        'Projected 512-D vectors onto 3D continuous Riemannian manifolds with real-time parametric orbit traversal at 60 FPS.',
        'Evaluated geodesic trajectory interpolation against standard Euclidean baselines to eliminate semantic collapse in sparse regions.',
      ],
    },
    {
      title: 'First-Principles Autograd Engine & Reverse-Mode Autodiff',
      subtitle: 'Directed Acyclic Graph (DAG) Execution Tape & Tape Recording',
      role: 'Research & Core Engineering',
      period: '2023 — 2024',
      description:
        'Constructed a lightweight scalar and multi-dimensional tensor automatic differentiation engine from scratch in Python with C++ acceleration. Built explicit DAG topological sorting, dynamic backward execution tapes, and reverse-mode derivative propagation to study exact activation memory lifetimes.',
      technologies: ['Python', 'C++ / CPython', 'DAG Topological Sort', 'Reverse-Mode Autodiff', 'Dynamic Graph Tapes'],
      highlights: [
        'Implemented automatic chain-rule differentiation with backward tape accumulation and tensor broadcasting bookkeeping.',
        'Profiled activation memory lifetimes during forward passes to implement zero-copy tensor reuse patterns.',
      ],
    },
    {
      title: 'Self-Attention Memory Hierarchy & KV-Cache Benchmarks',
      subtitle: 'Transformer Inference Memory-Bandwidth & Tiling Profiling',
      role: 'Experimental Benchmarking',
      period: '2024 — 2025',
      description:
        'Investigated memory-bandwidth bottlenecks in transformer attention mechanisms through tiled matrix algebra and cache management. Analyzed GPU global memory (HBM) versus on-chip SRAM round-trips during long-sequence generation.',
      technologies: ['PyTorch', 'Triton', 'FlashAttention Mechanics', 'Tiled Matrix Multiplication', 'KV-Cache Dynamics'],
      highlights: [
        'Fused online softmax computation into outer tiled matrix loops, eliminating quadratic N x N memory materialization.',
        'Documented empirical speedups and memory-bandwidth scaling across context windows ranging from 2K to 32K tokens.',
      ],
    },
    {
      title: 'Hyperspherical Uniformity & Contrastive Metric Spaces',
      subtitle: 'Representation Learning & Embedding Geometry Formulation',
      role: 'Theoretical Study & Evaluation',
      period: '2024',
      description:
        'Formulated and tested multi-modal contrastive InfoNCE representations to prevent dimensional shrinkage and representation collapse. Evaluated hyperspherical alignment, singular value decay, and temperature scaling parameters.',
      technologies: ['PyTorch', 'Metric Spaces', 'Contrastive Learning (InfoNCE)', 'Hyperspherical Embeddings', 'NumPy / SciPy'],
      highlights: [
        'Benchmarked temperature schedules to optimize negative pair repulsion without destabilizing gradient variance.',
        'Demonstrated uniform feature distribution across unit hyperspheres to preserve metric downstream transferability.',
      ],
    },
  ];

  return (
    <article
      id="print-cv-document"
      aria-label="Printable Curriculum Vitae"
      className="print-cv-root font-body text-zinc-900 bg-white"
    >
      {/* ═════════════════ DOCUMENT HEADER ═════════════════ */}
      <header className="print-cv-header pb-3 mb-3 border-b border-zinc-300">
        <div className="flex flex-row justify-between items-start">
          <div>
            <h1 className="font-display font-bold text-[22pt] text-zinc-950 uppercase tracking-tight leading-none m-0">
              {name}
            </h1>
            <div className="font-display font-semibold text-[10pt] text-rose-700 uppercase tracking-wider mt-1">
              {role} <span className="text-zinc-400 font-normal">|</span> Computational Systems &amp; Statistical Learning
            </div>
          </div>

          <div className="text-right text-[8.2pt] font-body text-zinc-600 space-y-0.5">
            <div>
              <span className="font-semibold text-zinc-800">Email:</span>{' '}
              <a href={`mailto:${email}`} className="text-zinc-900 underline hover:text-rose-700">
                {email}
              </a>
            </div>
            <div>
              <span className="font-semibold text-zinc-800">GitHub:</span>{' '}
              <a href={github} target="_blank" rel="noreferrer" className="text-zinc-900 underline hover:text-rose-700">
                {githubUser}
              </a>
            </div>
            <div>
              <span className="font-semibold text-zinc-800">LinkedIn:</span>{' '}
              <a href={linkedin} target="_blank" rel="noreferrer" className="text-zinc-900 underline hover:text-rose-700">
                {linkedinUser}
              </a>
            </div>
            <div>
              <span className="font-semibold text-zinc-800">Portfolio:</span>{' '}
              <span className="text-zinc-900 font-medium">{portfolioUrl}</span>
            </div>
          </div>
        </div>

        {/* Location & Status Bar */}
        <div className="mt-2 pt-1.5 border-t border-zinc-150 flex items-center justify-between text-[8.2pt] text-zinc-600">
          <div>
            <span className="font-semibold text-zinc-800">Location:</span> {location}
          </div>
          <div>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-600 mr-1.5 align-middle" />
            <span className="font-semibold text-zinc-800">Primary Focus:</span> Generative Architectures &amp; Distributed Tensors
          </div>
        </div>

        {/* Professional Summary / Research Thesis Statement */}
        <div className="mt-2 text-[8.8pt] text-zinc-700 leading-relaxed text-justify">
          <p className="m-0">
            AI &amp; Data Science engineer focused on the intersection of theoretical statistics, mathematical optimization, and high-performance neural computing. Experience designing from-scratch computational graph runtimes, benchmarking attention memory hierarchies, and engineering interactive manifold projection tools. Committed to rigorous computational verification, verifiable code, and modular machine learning systems.
          </p>
        </div>
      </header>

      {/* ═════════════════ EDUCATION & ACADEMIC FOUNDATION ═════════════════ */}
      <section className="print-cv-section mb-3.5">
        <h2 className="print-heading font-display font-bold text-[10.5pt] text-zinc-950 uppercase tracking-wider pb-0.5 mb-2 border-b border-zinc-300 flex items-center justify-between">
          <span>Education &amp; Academic Foundation</span>
          <span className="font-body text-[7.5pt] font-normal text-zinc-500 uppercase tracking-normal">Academic Rigor</span>
        </h2>

        <div className="space-y-2">
          {credNode.map((c) => (
            <div key={c.id} className="print-avoid-break">
              <div className="flex justify-between items-baseline">
                <h3 className="font-display font-bold text-[9.5pt] text-zinc-900 m-0">
                  {c.title}
                </h3>
                <span className="font-body text-[8.2pt] font-semibold text-zinc-600">
                  {c.issueDate}
                </span>
              </div>

              <div className="flex justify-between items-baseline text-[8.2pt] text-rose-700 font-medium mt-0.5">
                <span>{c.issuer}</span>
                <span className="text-zinc-500 text-[7.8pt]">Track: {c.credentialId}</span>
              </div>

              <p className="text-[8.5pt] text-zinc-700 leading-normal mt-0.5 m-0">
                {c.description}
              </p>

              {c.skills && c.skills.length > 0 && (
                <div className="text-[7.8pt] text-zinc-600 mt-0.5">
                  <span className="font-semibold text-zinc-800">Key Coursework &amp; Topics:</span>{' '}
                  {c.skills.join(' • ')}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ═════════════════ TECHNICAL SKILLS & CAPABILITIES ═════════════════ */}
      <section className="print-cv-section mb-3.5 print-avoid-break">
        <h2 className="print-heading font-display font-bold text-[10.5pt] text-zinc-950 uppercase tracking-wider pb-0.5 mb-2 border-b border-zinc-300 flex items-center justify-between">
          <span>Technical Skills &amp; Capabilities</span>
          <span className="font-body text-[7.5pt] font-normal text-zinc-500 uppercase tracking-normal">Core Taxonomy</span>
        </h2>

        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[8.5pt]">
          {/* Column 1: Generative & Deep Learning */}
          <div className="space-y-0.5">
            <div className="font-display font-bold text-[8.8pt] text-zinc-900 uppercase tracking-wider text-rose-700">
              Generative Architectures &amp; Deep Learning
            </div>
            <ul className="list-disc list-inside text-zinc-700 space-y-0.5 pl-0.5 m-0 text-[8.2pt]">
              {modelsSkills.map((s) => (
                <li key={s.name} className="leading-tight">
                  <span className="font-semibold text-zinc-800">{s.name}:</span>{' '}
                  <span className="text-zinc-600">{s.tags.join(', ')}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: Systems, Infrastructure & Data */}
          <div className="space-y-0.5">
            <div className="font-display font-bold text-[8.8pt] text-zinc-900 uppercase tracking-wider text-rose-700">
              Neural Systems &amp; Data Infrastructure
            </div>
            <ul className="list-disc list-inside text-zinc-700 space-y-0.5 pl-0.5 m-0 text-[8.2pt]">
              {systemsSkills.map((s) => (
                <li key={s.name} className="leading-tight">
                  <span className="font-semibold text-zinc-800">{s.name}:</span>{' '}
                  <span className="text-zinc-600">{s.tags.join(', ')}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Row 2: Languages & Tooling */}
          <div className="col-span-2 pt-1 border-t border-zinc-150 flex items-baseline justify-between text-[8.2pt]">
            <div>
              <span className="font-semibold text-zinc-900">Languages &amp; Core Frameworks:</span>{' '}
              <span className="text-zinc-700">Python, C++, TypeScript, JavaScript, PyTorch, Triton, WebGL, CUDA, NumPy, SciPy</span>
            </div>
            <div className="text-zinc-500 text-[7.8pt]">
              <span className="font-semibold text-zinc-700">Tools:</span> Git, Linux, Docker, Arrow, Parquet, FAISS, ONNX
            </div>
          </div>
        </div>
      </section>

      {/* ═════════════════ AREAS OF FOCUS & COLLABORATIONS ═════════════════ */}
      <section className="print-cv-section mb-3.5 print-avoid-break">
        <h2 className="print-heading font-display font-bold text-[10.5pt] text-zinc-950 uppercase tracking-wider pb-0.5 mb-2 border-b border-zinc-300 flex items-center justify-between">
          <span>Areas of Active Study &amp; Technical Focus</span>
          <span className="font-body text-[7.5pt] font-normal text-zinc-500 uppercase tracking-normal">Research Interests</span>
        </h2>

        <div className="flex flex-wrap items-center gap-1.5 text-[8pt] text-zinc-700">
          {[
            'Statistical Learning & Inference',
            'Generative Architectures (Diffusion & Transformers)',
            'Latent Topology & Manifold Geometry',
            'Computational Graph Runtimes & Autograd',
            'Tensor Optimization & KV-Cache Dynamics',
            'High-Dimensional Embedding Projections',
          ].map((area) => (
            <span
              key={area}
              className="px-2 py-0.5 bg-zinc-100 border border-zinc-200 rounded text-zinc-800 font-medium"
            >
              {area}
            </span>
          ))}
        </div>

        <p className="text-[8.2pt] text-zinc-600 mt-2 m-0 leading-normal">
          <span className="font-semibold text-zinc-800">Professional Alignment:</span> Open for Software Engineering roles, Machine Learning engineering positions, and collaborative systems research.
        </p>
      </section>

      {/* ═════════════════ PROJECTS & COMPUTATIONAL RESEARCH (PAGE 2) ═════════════════ */}
      <section className="print-cv-section print-break-before-page mb-3.5">
        <h2 className="print-heading font-display font-bold text-[10.5pt] text-zinc-950 uppercase tracking-wider pb-0.5 mb-2.5 border-b border-zinc-300 flex items-center justify-between">
          <span>Projects &amp; Computational Research</span>
          <span className="font-body text-[7.5pt] font-normal text-zinc-500 uppercase tracking-normal">Engineering &amp; Systems</span>
        </h2>

        <div className="space-y-3.5">
          {researchProjects.map((p) => (
            <div key={p.title} className="print-avoid-break">
              <div className="flex justify-between items-baseline">
                <div className="flex items-baseline gap-2">
                  <h3 className="font-display font-bold text-[9.5pt] text-zinc-950 m-0">
                    {p.title}
                  </h3>
                  <span className="text-[8.2pt] text-rose-700 font-medium">
                    [{p.subtitle}]
                  </span>
                </div>
                <span className="font-body text-[8.2pt] font-semibold text-zinc-600 shrink-0">
                  {p.period}
                </span>
              </div>

              <div className="text-[8pt] font-medium text-zinc-600 mt-0.5">
                <span className="text-zinc-800 font-semibold">Role:</span> {p.role} &bull;{' '}
                <span className="text-zinc-800 font-semibold">Stack:</span> {p.technologies.join(', ')}
              </div>

              <p className="text-[8.5pt] text-zinc-700 leading-normal mt-1 m-0 text-justify">
                {p.description}
              </p>

              <ul className="list-disc list-inside text-[8.2pt] text-zinc-600 mt-1 space-y-0.5 pl-0.5 m-0">
                {p.highlights.map((h, i) => (
                  <li key={i} className="leading-tight">
                    {h}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ═════════════════ DOCUMENT FOOTER ═════════════════ */}
      <footer className="print-cv-footer pt-2 mt-4 border-t border-zinc-200 flex justify-between items-center text-[7.5pt] text-zinc-500 font-body">
        <div>
          <span className="font-semibold text-zinc-700">SHUBHAM SHARMA</span> &bull; Curriculum Vitae &bull; Built with Nodefolio
        </div>
        <div>
          Verified Document &bull; {portfolioUrl} &bull; Generated {new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
        </div>
      </footer>
    </article>
  );
};
