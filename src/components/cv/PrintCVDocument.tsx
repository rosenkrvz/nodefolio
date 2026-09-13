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
  const photoUrl = profileNode?.avatar || '/assets/shubham_photo.jpg';

  const objective =
    'I work for a research-oriented approach towards a descriptive data-driven environment that focuses on purpose rather than just plain definition.';

  return (
    <article
      id="print-cv-document"
      aria-label="Printable Curriculum Vitae - Shubham Sharma"
      className="print-cv-root font-body text-zinc-900 bg-white"
    >
      {/* ═════════════════════════════════════════════════════════════
          PAGE 1: IDENTITY, OBJECTIVE, EDUCATION, EXPERIENCE & SKILLS
          ═════════════════════════════════════════════════════════════ */}
      <section className="print-page print-page-1 flex flex-col justify-between">
        <div>
          {/* ──────── HEADER SECTION WITH CANDIDATE PHOTO ──────── */}
          <header className="print-cv-header pb-2.5 mb-2.5 border-b-2 border-zinc-800">
            <div className="flex flex-row items-center gap-4">
              {/* High-Resolution Framed Candidate Portrait */}
              <div className="shrink-0">
                <div className="w-[78px] h-[96px] rounded-md overflow-hidden border-2 border-zinc-900 bg-zinc-100 shadow-sm">
                  <img
                    src={photoUrl}
                    alt={name}
                    className="w-full h-full object-cover object-top"
                  />
                </div>
              </div>

              {/* Identity & Main Headlines */}
              <div className="flex-1 min-w-0">
                <h1 className="font-display font-bold text-[22pt] text-zinc-950 uppercase tracking-tight leading-none m-0">
                  {name}
                </h1>
                <div className="font-display font-semibold text-[9.5pt] text-rose-700 uppercase tracking-wider mt-1">
                  {role} <span className="text-zinc-400 font-normal">|</span> Computational Systems &amp; Data Engineering
                </div>

                {/* Contact Coordinates Badges */}
                <div className="mt-2 grid grid-cols-3 gap-x-3 gap-y-1 text-[8pt] text-zinc-700">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="font-bold text-zinc-900">Email:</span>
                    <a href={`mailto:${email}`} className="text-zinc-800 underline hover:text-rose-700 truncate">
                      {email}
                    </a>
                  </div>
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="font-bold text-zinc-900">Phone:</span>
                    <span className="text-zinc-800">{phone}</span>
                  </div>
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="font-bold text-zinc-900">Location:</span>
                    <span className="text-zinc-800">{location}</span>
                  </div>
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="font-bold text-zinc-900">Portfolio:</span>
                    <span className="text-zinc-800 font-medium">{portfolioUrl}</span>
                  </div>
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="font-bold text-zinc-900">GitHub:</span>
                    <a href={`https://${githubUser}`} target="_blank" rel="noreferrer" className="text-zinc-800 underline hover:text-rose-700 truncate">
                      {githubUser}
                    </a>
                  </div>
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="font-bold text-zinc-900">LinkedIn:</span>
                    <a href={`https://${linkedinUser}`} target="_blank" rel="noreferrer" className="text-zinc-800 underline hover:text-rose-700 truncate">
                      {linkedinUser}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Career Objective */}
            <div className="mt-2.5 pt-2 border-t border-zinc-200">
              <div className="flex items-baseline gap-2">
                <span className="font-display font-bold text-[8pt] uppercase tracking-wider text-rose-700 shrink-0">
                  Career Objective:
                </span>
                <p className="text-[8.4pt] text-zinc-800 italic leading-snug m-0">
                  &ldquo;{objective}&rdquo;
                </p>
              </div>
            </div>
          </header>

          {/* ──────── EDUCATION & ACADEMIC BACKGROUND ──────── */}
          <section className="print-cv-section mb-3">
            <h2 className="print-heading font-display font-bold text-[10pt] text-zinc-950 uppercase tracking-wider pb-0.5 mb-1.5 border-b border-zinc-300 flex items-center justify-between">
              <span>Education &amp; Academic Foundation</span>
              <span className="font-body text-[7.5pt] font-normal text-zinc-500 uppercase tracking-normal">Rigorous Academic Track</span>
            </h2>

            <div className="space-y-2">
              {/* IIT Jodhpur */}
              <div className="print-avoid-break">
                <div className="flex justify-between items-baseline">
                  <h3 className="font-display font-bold text-[9.2pt] text-zinc-900 m-0">
                    Bachelor of Science (B.S.), AI &amp; Data Science
                  </h3>
                  <span className="font-body text-[8pt] font-bold text-zinc-700">
                    2025 — 2029
                  </span>
                </div>
                <div className="flex justify-between items-baseline text-[8pt] text-rose-700 font-semibold mt-0.5">
                  <span>Indian Institute of Technology Jodhpur (IIT Jodhpur)</span>
                  <span className="text-zinc-500 text-[7.5pt] font-normal">Department of Computer Science &amp; Data Intelligence</span>
                </div>
                <p className="text-[8pt] text-zinc-700 leading-snug mt-0.5 m-0">
                  Specialized curriculum encompassing mathematical foundations of machine learning, statistical inference, high-performance computing, convex optimization, and scalable data engineering systems.
                </p>
              </div>

              {/* High School Stages - Two Column Clean Layout */}
              <div className="grid grid-cols-2 gap-3 pt-1 border-t border-zinc-150">
                <div>
                  <div className="flex justify-between items-baseline">
                    <span className="font-display font-bold text-[8.6pt] text-zinc-900">
                      Senior Secondary (XII), CBSE Science
                    </span>
                    <span className="text-[7.8pt] font-bold text-rose-700">84.20%</span>
                  </div>
                  <div className="text-[7.8pt] text-zinc-600">
                    Silver Shine School &bull; Passing Year: 2025
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-baseline">
                    <span className="font-display font-bold text-[8.6pt] text-zinc-900">
                      Secondary (X), CBSE
                    </span>
                    <span className="text-[7.8pt] font-bold text-rose-700">90.67%</span>
                  </div>
                  <div className="text-[7.8pt] text-zinc-600">
                    Silver Shine School &bull; Passing Year: 2023
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ──────── WORK & RESEARCH EXPERIENCE ──────── */}
          <section className="print-cv-section mb-3">
            <h2 className="print-heading font-display font-bold text-[10pt] text-zinc-950 uppercase tracking-wider pb-0.5 mb-1.5 border-b border-zinc-300 flex items-center justify-between">
              <span>Work &amp; Research Experience</span>
              <span className="font-body text-[7.5pt] font-normal text-zinc-500 uppercase tracking-normal">Industry &amp; Applied Practice</span>
            </h2>

            <div className="space-y-2.5">
              {/* Doingly */}
              <div className="print-avoid-break">
                <div className="flex justify-between items-baseline">
                  <div className="flex items-baseline gap-2">
                    <h3 className="font-display font-bold text-[9.2pt] text-zinc-950 m-0">
                      Research &amp; Data Science &bull; Internship
                    </h3>
                  </div>
                  <span className="font-body text-[8pt] font-bold text-zinc-700">
                    Jun 2026 — Present
                  </span>
                </div>
                <div className="text-[8pt] text-rose-700 font-semibold mt-0.5">
                  Doingly Analysis &amp; Consultancy &bull; Delhi, India
                </div>
                <ul className="list-disc list-inside text-[8pt] text-zinc-750 mt-1 space-y-0.5 pl-0.5 m-0 leading-snug">
                  <li>Conduct quantitative research, statistical analysis, and data modeling for active consulting engagements.</li>
                  <li>Process, structure, and explore multi-dimensional datasets to identify hidden patterns, extract insights, and formulate actionable client solutions.</li>
                  <li>Implement Python and statistical learning frameworks for analytical modeling, validation, and rapid experimentation.</li>
                  <li>Synthesize complex research findings into clear, data-backed recommendations and strategic executive briefs.</li>
                </ul>
              </div>

              {/* Visible Logic Labs */}
              <div className="print-avoid-break pt-1.5 border-t border-zinc-150">
                <div className="flex justify-between items-baseline">
                  <h3 className="font-display font-bold text-[9.2pt] text-zinc-950 m-0">
                    Core Team Member
                  </h3>
                  <span className="font-body text-[8pt] font-bold text-zinc-700">
                    Feb 2026 — Present
                  </span>
                </div>
                <div className="text-[8pt] text-rose-700 font-semibold mt-0.5">
                  Visible Logic Labs &bull; Virtual / Remote
                </div>
                <ul className="list-disc list-inside text-[8pt] text-zinc-750 mt-1 space-y-0.5 pl-0.5 m-0 leading-snug">
                  <li>Support product marketing, outreach, and user growth initiatives to scale technical product adoption and community reach.</li>
                  <li>Create, structure, and maintain detailed technical documentation, API specifications, and architecture workflows.</li>
                  <li>Collaborate cross-functionally on product feature ideation, UX flows, and robust user-focused implementations.</li>
                  <li>Formulate actionable roadmaps and drive practical technical solutions through structured execution and sprint planning.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* ──────── TECHNICAL & ANALYTICAL SKILLS ──────── */}
          <section className="print-cv-section mb-1 print-avoid-break">
            <h2 className="print-heading font-display font-bold text-[10pt] text-zinc-950 uppercase tracking-wider pb-0.5 mb-1.5 border-b border-zinc-300 flex items-center justify-between">
              <span>Technical &amp; Analytical Competencies</span>
              <span className="font-body text-[7.5pt] font-normal text-zinc-500 uppercase tracking-normal">Categorized Taxonomy</span>
            </h2>

            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[8pt]">
              <div>
                <span className="font-bold text-zinc-900">Programming &amp; Frameworks:</span>{' '}
                <span className="text-zinc-700">Python, SQL, C++, TypeScript, JavaScript, PyTorch, NumPy, SciPy, Git, Linux</span>
              </div>

              <div>
                <span className="font-bold text-zinc-900">Data Science &amp; Pipelines:</span>{' '}
                <span className="text-zinc-700">Data Analytics, Data Extraction, Data Cleaning, Data Engineering, Annotation, Manipulation, Statistical Modeling</span>
              </div>

              <div>
                <span className="font-bold text-zinc-900">Web &amp; Systems Engineering:</span>{' '}
                <span className="text-zinc-700">Full-Stack Web Dev, UI &amp; UX Design, Responsive Layouts, REST APIs, WebGL, Performance Optimization</span>
              </div>

              <div>
                <span className="font-bold text-zinc-900">Professional Competencies:</span>{' '}
                <span className="text-zinc-700">Problem Solving, Technical Writing, Scientific Documentation, Creative Writing, English (Written &amp; Spoken)</span>
              </div>
            </div>
          </section>
        </div>

        {/* Page 1 Running Footer */}
        <div className="pt-2 border-t border-zinc-200 flex justify-between items-center text-[7.2pt] text-zinc-500 font-body">
          <span>SHUBHAM SHARMA &bull; Curriculum Vitae</span>
          <span>Page 1 of 2</span>
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════════
          PAGE 2: FEATURED PROJECTS, EXTRACURRICULAR, AWARDS & FOOTER
          ═════════════════════════════════════════════════════════════ */}
      <section className="print-page print-page-2 print-break-before-page flex flex-col justify-between pt-1">
        <div>
          {/* Running Mini-Header for Page 2 */}
          <div className="flex justify-between items-baseline pb-1 mb-2 border-b border-zinc-300 text-[8pt] text-zinc-600">
            <span className="font-display font-bold text-zinc-900 uppercase tracking-wide">
              {name} &bull; Curriculum Vitae
            </span>
            <span>AI &amp; Data Science &bull; IIT Jodhpur</span>
          </div>

          {/* ──────── FEATURED PROJECTS & ENGINEERING ──────── */}
          <section className="print-cv-section mb-3">
            <h2 className="print-heading font-display font-bold text-[10pt] text-zinc-950 uppercase tracking-wider pb-0.5 mb-2 border-b border-zinc-300 flex items-center justify-between">
              <span>Key Projects &amp; Computational Systems</span>
              <span className="font-body text-[7.5pt] font-normal text-zinc-500 uppercase tracking-normal">Engineering &amp; Research</span>
            </h2>

            <div className="space-y-2.5">
              {/* Nirogshaala */}
              <div className="print-avoid-break">
                <div className="flex justify-between items-baseline">
                  <div className="flex items-baseline gap-2">
                    <h3 className="font-display font-bold text-[9.2pt] text-zinc-950 m-0">
                      Full-Stack Consultation Website (Nirogshaala)
                    </h3>
                    <span className="text-[7.8pt] text-rose-700 font-semibold">
                      [Production Web Architecture]
                    </span>
                  </div>
                  <span className="font-body text-[8pt] font-bold text-zinc-700">
                    Apr 2026 — Sep 2026
                  </span>
                </div>
                <div className="text-[7.8pt] text-zinc-600 mt-0.5">
                  <span className="font-bold text-zinc-800">Stack:</span> React, Next.js, TypeScript, Tailwind CSS, Responsive UI/UX Architecture, RESTful API
                </div>
                <p className="text-[8pt] text-zinc-700 leading-snug mt-1 m-0">
                  Architected and engineered the end-to-end digital consultation web platform for Nirogshaala, delivering a clean, highly accessible user experience.
                </p>
                <ul className="list-disc list-inside text-[8pt] text-zinc-750 mt-0.5 space-y-0.5 pl-0.5 m-0 leading-snug">
                  <li>Engineered responsive, cross-device layouts for mobile, tablet, and desktop with seamless component states.</li>
                  <li>Structured intuitive navigation funnels and consultation scheduling workflows to maximize user access.</li>
                  <li>Focused on high-performance frontend optimization, clean styling hierarchies, and consistent visual branding.</li>
                </ul>
              </div>

              {/* Latent Graph Visualizer */}
              <div className="print-avoid-break pt-1.5 border-t border-zinc-150">
                <div className="flex justify-between items-baseline">
                  <div className="flex items-baseline gap-2">
                    <h3 className="font-display font-bold text-[9.2pt] text-zinc-950 m-0">
                      Latent Graph Visualizer &amp; Manifold Explorer
                    </h3>
                    <span className="text-[7.8pt] text-rose-700 font-semibold">
                      [High-Dimensional Geometry]
                    </span>
                  </div>
                  <span className="font-body text-[8pt] font-bold text-zinc-700">
                    2025 — Present
                  </span>
                </div>
                <div className="text-[7.8pt] text-zinc-600 mt-0.5">
                  <span className="font-bold text-zinc-800">Stack:</span> PyTorch, WebGL / Canvas, UMAP / t-SNE, High-Dimensional Embeddings, TypeScript
                </div>
                <p className="text-[8pt] text-zinc-700 leading-snug mt-1 m-0">
                  Engineered an interactive computational workspace projecting 512-dimensional neural latent spaces into continuous topological clusters and Riemannian manifolds.
                </p>
                <ul className="list-disc list-inside text-[8pt] text-zinc-750 mt-0.5 space-y-0.5 pl-0.5 m-0 leading-snug">
                  <li>Implemented real-time 3D coordinate orbit traversal rendering at a constant 60 FPS using hardware-accelerated WebGL.</li>
                  <li>Evaluated non-linear dimensionality reduction projections (UMAP and t-SNE) against geodesic baselines to avoid semantic collapse.</li>
                </ul>
              </div>

              {/* First-Principles Autograd Engine */}
              <div className="print-avoid-break pt-1.5 border-t border-zinc-150">
                <div className="flex justify-between items-baseline">
                  <div className="flex items-baseline gap-2">
                    <h3 className="font-display font-bold text-[9.2pt] text-zinc-950 m-0">
                      First-Principles Autograd Engine &amp; Reverse-Mode Tape
                    </h3>
                    <span className="text-[7.8pt] text-rose-700 font-semibold">
                      [Computational Graphs]
                    </span>
                  </div>
                  <span className="font-body text-[8pt] font-bold text-zinc-700">
                    2023 — 2024
                  </span>
                </div>
                <div className="text-[7.8pt] text-zinc-600 mt-0.5">
                  <span className="font-bold text-zinc-800">Stack:</span> Python, C++, DAG Topological Sort, Reverse-Mode Autodiff, Memory Profiling
                </div>
                <p className="text-[8pt] text-zinc-700 leading-snug mt-1 m-0">
                  Constructed a scalar and multi-dimensional tensor automatic differentiation runtime from scratch with dynamic DAG tape recording and C++ backend routines.
                </p>
                <ul className="list-disc list-inside text-[8pt] text-zinc-750 mt-0.5 space-y-0.5 pl-0.5 m-0 leading-snug">
                  <li>Built reverse-mode derivative propagation using topological graph evaluation and zero-copy tensor caching patterns.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* ──────── EXTRA-CURRICULAR & INNOVATION ──────── */}
          <section className="print-cv-section mb-3 print-avoid-break">
            <h2 className="print-heading font-display font-bold text-[10pt] text-zinc-950 uppercase tracking-wider pb-0.5 mb-1.5 border-b border-zinc-300 flex items-center justify-between">
              <span>Extracurricular Activities &amp; Applied Innovation</span>
              <span className="font-body text-[7.5pt] font-normal text-zinc-500 uppercase tracking-normal">Engineering Initiatives</span>
            </h2>

            <div className="p-2 bg-zinc-50 border border-zinc-200 rounded">
              <div className="flex justify-between items-baseline">
                <h3 className="font-display font-bold text-[8.8pt] text-zinc-900 m-0">
                  Core Team Member &bull; Technical Startup on EV Braking Efficiency
                </h3>
                <span className="text-[7.8pt] font-bold text-rose-700">IIT Jodhpur</span>
              </div>
              <p className="text-[8pt] text-zinc-700 leading-snug mt-1 m-0">
                Played a key role as a Core Team Member in an engineering startup initiative at IIT Jodhpur focused on improving electric vehicle braking efficiency. Investigated an innovative thermodynamic approach recovering kinetic heat generated through friction during braking and converting it into usable electrical energy, with the objective of improving overall powertrain energy efficiency and extending EV driving range.
              </p>
            </div>
          </section>
        </div>

        {/* ──────── DOCUMENT FOOTER ──────── */}
        <footer className="print-cv-footer pt-2 border-t border-zinc-200 flex justify-between items-center text-[7.2pt] text-zinc-500 font-body">
          <div>
            <span className="font-bold text-zinc-800">SHUBHAM SHARMA</span> &bull; Verified Curriculum Vitae &bull; Built with Nodefolio
          </div>
          <div>
            {portfolioUrl} &bull; Page 2 of 2
          </div>
        </footer>
      </section>
    </article>
  );
};
