import React from 'react';
import { NodeData } from '../../types';

interface PrintCVDocumentProps {
  nodes: NodeData[];
}

export const PrintCVDocument: React.FC<PrintCVDocumentProps> = ({ nodes }) => {
  const profileNode = nodes.find((n) => n.id === 'node-profile')?.profile;

  const name = profileNode?.name || 'SHUBHAM SHARMA';
  const role = 'AI & Data Science Scholar • IIT Jodhpur';
  const email = profileNode?.email || 'marksrv047@gmail.com';
  const phone = profileNode?.phone || '+91 8882082760';
  const location = 'Ghaziabad, Uttar Pradesh, India';
  const githubUser = 'github.com/rosenkrvz';
  const linkedinUser = 'linkedin.com/in/shubham-sharma';
  const portfolioUrl = 'nodefolio-rosenkrvz.vercel.app';
  const photoUrl = profileNode?.avatar || '/assets/shubham_photo.webp';

  const objective =
    'I work for a research-oriented approach towards a descriptive data-driven environment that focuses on purpose rather than just plain definition.';

  return (
    <article
      id="print-cv-document"
      aria-label="Printable Curriculum Vitae - Shubham Sharma"
      className="print-cv-root font-body text-zinc-900 bg-white"
    >
      {/* ═════════════════════════════════════════════════════════════
          PAGE 1: IDENTITY, OBJECTIVE, EDUCATION & WORK EXPERIENCE
          ═════════════════════════════════════════════════════════════ */}
      <section className="print-page print-page-1 flex flex-col justify-between">
        <div>
          {/* ──────── EXECUTIVE HEADER (MIRRORS RESUME MODAL) ──────── */}
          <header className="print-cv-header pb-3 mb-3 border-b border-zinc-200">
            <div className="flex flex-row items-center gap-4">
              {/* Framed Candidate Portrait */}
              <div className="shrink-0">
                <div className="w-[72px] h-[86px] rounded-lg overflow-hidden border border-zinc-300 bg-zinc-50 shadow-sm">
                  <img
                    src={photoUrl}
                    alt={name}
                    className="w-full h-full object-cover object-top"
                  />
                </div>
              </div>

              {/* Identity & Main Headlines */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h1 className="font-display font-bold text-[20pt] text-zinc-950 uppercase tracking-tight leading-none m-0">
                    {name}
                  </h1>
                  <span className="font-mono text-[7.5pt] px-2 py-0.5 rounded border border-rose-500/30 bg-rose-50 text-rose-700 font-semibold uppercase tracking-wider">
                    Curriculum Vitae / Specification
                  </span>
                </div>

                <div className="font-display font-semibold text-[9pt] text-rose-700 uppercase tracking-wide mt-1">
                  {role} <span className="text-zinc-400 font-normal">|</span> Computational Systems &amp; Data Engineering
                </div>

                {/* Clean Contact Details Row */}
                <div className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[7.8pt] text-zinc-600">
                  <span className="font-medium text-zinc-800">{email}</span>
                  <span className="text-zinc-300">&bull;</span>
                  <span>{phone}</span>
                  <span className="text-zinc-300">&bull;</span>
                  <span>{location}</span>
                  <span className="text-zinc-300">&bull;</span>
                  <span className="font-medium text-zinc-800">{portfolioUrl}</span>
                  <span className="text-zinc-300">&bull;</span>
                  <span>{githubUser}</span>
                  <span className="text-zinc-300">&bull;</span>
                  <span>{linkedinUser}</span>
                </div>
              </div>
            </div>

            {/* Career Objective Box */}
            <div className="mt-2.5 p-2.5 rounded-lg bg-zinc-50/80 border border-zinc-200">
              <div className="font-display font-bold text-[7.8pt] uppercase tracking-wider text-rose-700 mb-0.5">
                Career Objective
              </div>
              <p className="text-[8.2pt] text-zinc-700 italic leading-snug m-0">
                &ldquo;{objective}&rdquo;
              </p>
            </div>
          </header>

          {/* ──────── ACADEMIC FOUNDATION & CREDENTIALS ──────── */}
          <section className="print-cv-section mb-3.5">
            <h2 className="print-heading font-display font-bold text-[9.5pt] text-zinc-950 uppercase tracking-wider pb-1 mb-2 border-b border-zinc-200 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-600 shrink-0" />
                Academic Foundation &amp; Credentials
              </span>
              <span className="font-mono text-[7pt] font-normal text-zinc-400 uppercase tracking-normal">Rigorous Academic Track</span>
            </h2>

            <div className="space-y-2">
              {/* Higher Education: IIT Jodhpur Card */}
              <div className="p-2.5 rounded-lg border border-zinc-200 bg-white">
                <div className="flex justify-between items-baseline">
                  <h3 className="font-display font-bold text-[9pt] text-zinc-950 m-0">
                    Bachelor of Science (B.S.), AI &amp; Data Science
                  </h3>
                  <span className="font-mono text-[7.5pt] font-semibold px-2 py-0.5 rounded bg-zinc-100 border border-zinc-200 text-zinc-700">
                    2025 — 2029
                  </span>
                </div>
                <div className="text-[8pt] text-rose-700 font-semibold mt-0.5">
                  Indian Institute of Technology Jodhpur (IIT Jodhpur) <span className="text-zinc-400 font-normal">&bull;</span> <span className="text-zinc-600 font-normal">Department of Computer Science &amp; Data Intelligence</span>
                </div>
                <p className="text-[7.8pt] text-zinc-600 leading-snug mt-1 m-0">
                  Rigorous foundations across mathematical modeling, statistical inference, convex optimization, high-dimensional manifolds, and scalable machine learning systems.
                </p>
              </div>

              {/* Secondary Education: Dual Structured Columns */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 rounded-lg border border-zinc-200 bg-zinc-50/50">
                  <div className="flex justify-between items-baseline">
                    <span className="font-display font-bold text-[8.2pt] text-zinc-900">
                      Senior Secondary (XII), CBSE Science
                    </span>
                    <span className="font-mono text-[7.5pt] font-bold text-rose-700 px-1.5 py-0.5 rounded bg-rose-50 border border-rose-200/60">84.20%</span>
                  </div>
                  <div className="text-[7.5pt] text-zinc-500 mt-0.5">
                    Silver Shine School &bull; Passing Year: 2025
                  </div>
                </div>

                <div className="p-2 rounded-lg border border-zinc-200 bg-zinc-50/50">
                  <div className="flex justify-between items-baseline">
                    <span className="font-display font-bold text-[8.2pt] text-zinc-900">
                      Secondary (X), CBSE
                    </span>
                    <span className="font-mono text-[7.5pt] font-bold text-rose-700 px-1.5 py-0.5 rounded bg-rose-50 border border-rose-200/60">90.67%</span>
                  </div>
                  <div className="text-[7.5pt] text-zinc-500 mt-0.5">
                    Silver Shine School &bull; Passing Year: 2023
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ──────── WORK & RESEARCH EXPERIENCE ──────── */}
          <section className="print-cv-section mb-2">
            <h2 className="print-heading font-display font-bold text-[9.5pt] text-zinc-950 uppercase tracking-wider pb-1 mb-2 border-b border-zinc-200 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-600 shrink-0" />
                Work &amp; Research Experience
              </span>
              <span className="font-mono text-[7pt] font-normal text-zinc-400 uppercase tracking-normal">Industry &amp; Applied Practice</span>
            </h2>

            <div className="space-y-2.5">
              {/* Experience 1: Doingly */}
              <div className="p-2.5 rounded-lg border border-zinc-200 bg-white">
                <div className="flex justify-between items-baseline">
                  <h3 className="font-display font-bold text-[9pt] text-zinc-950 m-0">
                    Research &amp; Data Science &bull; Internship
                  </h3>
                  <span className="font-mono text-[7.5pt] font-semibold px-2 py-0.5 rounded bg-rose-50 border border-rose-200/60 text-rose-700">
                    Jun 2026 — Present
                  </span>
                </div>
                <div className="text-[8pt] text-zinc-600 font-medium mt-0.5">
                  Doingly Analysis &amp; Consultancy &bull; Delhi, India
                </div>
                <ul className="list-disc list-inside text-[7.8pt] text-zinc-700 mt-1.5 space-y-0.5 pl-0.5 m-0 leading-snug">
                  <li>Conduct quantitative research, statistical analysis, and data modeling for active consulting engagements.</li>
                  <li>Process, structure, and explore multi-dimensional datasets to uncover hidden patterns and formulate actionable solutions.</li>
                  <li>Implement Python and statistical learning frameworks for analytical modeling, validation, and rapid experimentation.</li>
                  <li>Synthesize complex research findings into clear, data-backed recommendations and strategic executive briefs.</li>
                </ul>
              </div>

              {/* Experience 2: Visible Logic Labs */}
              <div className="p-2.5 rounded-lg border border-zinc-200 bg-white">
                <div className="flex justify-between items-baseline">
                  <h3 className="font-display font-bold text-[9pt] text-zinc-950 m-0">
                    Core Team Member
                  </h3>
                  <span className="font-mono text-[7.5pt] font-semibold px-2 py-0.5 rounded bg-zinc-100 border border-zinc-200 text-zinc-700">
                    Feb 2026 — Present
                  </span>
                </div>
                <div className="text-[8pt] text-zinc-600 font-medium mt-0.5">
                  Visible Logic Labs &bull; Virtual / Remote
                </div>
                <ul className="list-disc list-inside text-[7.8pt] text-zinc-700 mt-1.5 space-y-0.5 pl-0.5 m-0 leading-snug">
                  <li>Support product marketing, outreach, and user growth initiatives to scale technical product adoption and community reach.</li>
                  <li>Create, structure, and maintain detailed technical documentation, API specifications, and architecture workflows.</li>
                  <li>Collaborate cross-functionally on product feature ideation, UX flows, and robust user-focused implementations.</li>
                  <li>Formulate actionable roadmaps and drive practical technical solutions through structured execution and sprint planning.</li>
                </ul>
              </div>
            </div>
          </section>
        </div>

        {/* Page 1 Running Footer */}
        <div className="pt-2 border-t border-zinc-200 flex justify-between items-center text-[7pt] text-zinc-400 font-mono">
          <span>SHUBHAM SHARMA &bull; Verified Curriculum Vitae</span>
          <span>Page 1 of 2</span>
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════════
          PAGE 2: KEY PROJECTS, COMPETENCIES & EXTRACURRICULAR
          ═════════════════════════════════════════════════════════════ */}
      <section className="print-page print-page-2 print-break-before-page flex flex-col justify-between pt-1">
        <div>
          {/* Running Mini-Header for Page 2 */}
          <div className="flex justify-between items-baseline pb-1.5 mb-2.5 border-b border-zinc-200 text-[7.5pt] text-zinc-500 font-mono">
            <span className="font-display font-bold text-zinc-900 uppercase tracking-wide">
              {name} &bull; Curriculum Vitae
            </span>
            <span>AI &amp; Data Science &bull; IIT Jodhpur</span>
          </div>

          {/* ──────── KEY PROJECTS & COMPUTATIONAL SYSTEMS ──────── */}
          <section className="print-cv-section mb-3.5">
            <h2 className="print-heading font-display font-bold text-[9.5pt] text-zinc-950 uppercase tracking-wider pb-1 mb-2 border-b border-zinc-200 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-600 shrink-0" />
                Key Projects &amp; Computational Systems
              </span>
              <span className="font-mono text-[7pt] font-normal text-zinc-400 uppercase tracking-normal">Engineering &amp; Research</span>
            </h2>

            <div className="space-y-2.5">
              {/* Project 1: Nirogshaala */}
              <div className="p-2.5 rounded-lg border border-zinc-200 bg-white">
                <div className="flex justify-between items-baseline">
                  <div className="flex items-baseline gap-2">
                    <h3 className="font-display font-bold text-[9pt] text-zinc-950 m-0">
                      Full-Stack Consultation Website (Nirogshaala)
                    </h3>
                    <span className="font-mono text-[7pt] text-rose-700 font-semibold px-1.5 py-0.2 rounded bg-rose-50 border border-rose-200/50">
                      Production Web Architecture
                    </span>
                  </div>
                  <span className="font-mono text-[7.5pt] font-semibold text-zinc-600">
                    Apr 2026 — Sep 2026
                  </span>
                </div>
                <div className="text-[7.5pt] text-zinc-500 mt-0.5">
                  <span className="font-bold text-zinc-700">Stack:</span> React, Next.js, TypeScript, Tailwind CSS, Responsive UI/UX Architecture, RESTful API
                </div>
                <ul className="list-disc list-inside text-[7.8pt] text-zinc-700 mt-1 space-y-0.5 pl-0.5 m-0 leading-snug">
                  <li>Architected and engineered the end-to-end digital consultation web platform delivering clean, accessible user experiences.</li>
                  <li>Structured intuitive navigation funnels and consultation scheduling workflows to maximize user access and engagement.</li>
                  <li>Focused on high-performance frontend optimization, clean styling hierarchies, and consistent visual branding.</li>
                </ul>
              </div>

              {/* Project 2: Latent Graph Visualizer */}
              <div className="p-2.5 rounded-lg border border-zinc-200 bg-white">
                <div className="flex justify-between items-baseline">
                  <div className="flex items-baseline gap-2">
                    <h3 className="font-display font-bold text-[9pt] text-zinc-950 m-0">
                      Latent Graph Visualizer &amp; Manifold Explorer
                    </h3>
                    <span className="font-mono text-[7pt] text-rose-700 font-semibold px-1.5 py-0.2 rounded bg-rose-50 border border-rose-200/50">
                      High-Dimensional Geometry
                    </span>
                  </div>
                  <span className="font-mono text-[7.5pt] font-semibold text-zinc-600">
                    2025 — Present
                  </span>
                </div>
                <div className="text-[7.5pt] text-zinc-500 mt-0.5">
                  <span className="font-bold text-zinc-700">Stack:</span> PyTorch, WebGL / Three.js, UMAP / t-SNE, High-Dimensional Embeddings, TypeScript
                </div>
                <ul className="list-disc list-inside text-[7.8pt] text-zinc-700 mt-1 space-y-0.5 pl-0.5 m-0 leading-snug">
                  <li>Engineered interactive computational workspaces projecting 512-dimensional neural latent spaces into continuous topological clusters.</li>
                  <li>Implemented real-time 3D coordinate orbit traversal rendering at constant 60 FPS using hardware-accelerated WebGL shaders.</li>
                  <li>Evaluated non-linear dimensionality reduction projections (UMAP and t-SNE) against geodesic baselines to prevent semantic collapse.</li>
                </ul>
              </div>

              {/* Project 3: Autograd Engine */}
              <div className="p-2.5 rounded-lg border border-zinc-200 bg-white">
                <div className="flex justify-between items-baseline">
                  <div className="flex items-baseline gap-2">
                    <h3 className="font-display font-bold text-[9pt] text-zinc-950 m-0">
                      First-Principles Autograd Engine &amp; Reverse-Mode Tape
                    </h3>
                    <span className="font-mono text-[7pt] text-rose-700 font-semibold px-1.5 py-0.2 rounded bg-rose-50 border border-rose-200/50">
                      Computational Graphs
                    </span>
                  </div>
                  <span className="font-mono text-[7.5pt] font-semibold text-zinc-600">
                    2023 — 2024
                  </span>
                </div>
                <div className="text-[7.5pt] text-zinc-500 mt-0.5">
                  <span className="font-bold text-zinc-700">Stack:</span> Python, C++, DAG Topological Sort, Reverse-Mode Autodiff, Memory Profiling
                </div>
                <ul className="list-disc list-inside text-[7.8pt] text-zinc-700 mt-1 space-y-0.5 pl-0.5 m-0 leading-snug">
                  <li>Constructed a tensor automatic differentiation runtime from scratch with dynamic DAG tape recording and C++ backend kernels.</li>
                  <li>Implemented reverse-mode derivative propagation using topological graph evaluation and zero-copy tensor caching patterns.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* ──────── TECHNICAL & ANALYTICAL COMPETENCIES ──────── */}
          <section className="print-cv-section mb-3">
            <h2 className="print-heading font-display font-bold text-[9.5pt] text-zinc-950 uppercase tracking-wider pb-1 mb-2 border-b border-zinc-200 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-600 shrink-0" />
                Technical &amp; Analytical Competencies
              </span>
              <span className="font-mono text-[7pt] font-normal text-zinc-400 uppercase tracking-normal">Taxonomy Matrix</span>
            </h2>

            <div className="grid grid-cols-2 gap-2 text-[7.8pt]">
              <div className="p-2 rounded-lg border border-zinc-200 bg-zinc-50/50">
                <div className="font-bold text-zinc-900 mb-0.5">Programming &amp; Frameworks</div>
                <div className="text-zinc-600 leading-snug">Python, SQL, C++, TypeScript, JavaScript, PyTorch, NumPy, SciPy, Git, Linux, Bash</div>
              </div>

              <div className="p-2 rounded-lg border border-zinc-200 bg-zinc-50/50">
                <div className="font-bold text-zinc-900 mb-0.5">Data Science &amp; Pipelines</div>
                <div className="text-zinc-600 leading-snug">Data Analytics, Extraction, Cleaning, Data Engineering, Annotation, Manipulation, Statistical Inference</div>
              </div>

              <div className="p-2 rounded-lg border border-zinc-200 bg-zinc-50/50">
                <div className="font-bold text-zinc-900 mb-0.5">Web &amp; Systems Engineering</div>
                <div className="text-zinc-600 leading-snug">Full-Stack Web Dev, UI &amp; UX Architecture, REST APIs, WebGL Shaders, Performance Optimization</div>
              </div>

              <div className="p-2 rounded-lg border border-zinc-200 bg-zinc-50/50">
                <div className="font-bold text-zinc-900 mb-0.5">Core Capabilities</div>
                <div className="text-zinc-600 leading-snug">Problem Solving, Technical Writing, Scientific Documentation, Creative Writing, English (Written &amp; Spoken)</div>
              </div>
            </div>
          </section>

          {/* ──────── EXTRACURRICULAR & INNOVATION ──────── */}
          <section className="print-cv-section mb-2">
            <h2 className="print-heading font-display font-bold text-[9.5pt] text-zinc-950 uppercase tracking-wider pb-1 mb-2 border-b border-zinc-200 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-600 shrink-0" />
                Extracurricular Activities &amp; Applied Innovation
              </span>
              <span className="font-mono text-[7pt] font-normal text-zinc-400 uppercase tracking-normal">Engineering Initiatives</span>
            </h2>

            <div className="p-2.5 bg-zinc-50/80 border border-zinc-200 rounded-lg">
              <div className="flex justify-between items-baseline">
                <h3 className="font-display font-bold text-[8.6pt] text-zinc-900 m-0">
                  Core Team Member &bull; Technical Startup on EV Braking Efficiency
                </h3>
                <span className="font-mono text-[7.5pt] font-bold text-rose-700 px-1.5 py-0.2 rounded bg-rose-50 border border-rose-200/50">IIT Jodhpur</span>
              </div>
              <p className="text-[7.8pt] text-zinc-600 leading-snug mt-1 m-0">
                Played a key role as a Core Team Member in an engineering startup initiative at IIT Jodhpur focused on improving electric vehicle braking efficiency. Investigated an innovative thermodynamic approach recovering kinetic heat generated through friction during braking and converting it into usable electrical energy, with the objective of improving overall powertrain energy efficiency and extending EV driving range.
              </p>
            </div>
          </section>
        </div>

        {/* ──────── DOCUMENT FOOTER ──────── */}
        <footer className="print-cv-footer pt-2 border-t border-zinc-200 flex justify-between items-center text-[7pt] text-zinc-400 font-mono">
          <div>
            <span className="font-bold text-zinc-700">SHUBHAM SHARMA</span> &bull; Verified Curriculum Vitae &bull; Built with Nodefolio
          </div>
          <div>
            {portfolioUrl} &bull; Page 2 of 2
          </div>
        </footer>
      </section>
    </article>
  );
};
