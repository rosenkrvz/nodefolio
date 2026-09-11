import * as THREE from 'three';
import { PhaseArtifactInstance, QualityTier, InspectableItem, LayerType, SpatialAnnotation } from '../types';

export function createPhase05LatentManifold(quality: QualityTier = 'high'): PhaseArtifactInstance {
  const group = new THREE.Group();
  group.name = 'phase-05-latent-manifold';

  const disposables: { dispose: () => void }[] = [];

  // =========================================================================
  // 1. Manifold Parametric Surface & Analytical Derivatives
  // =========================================================================
  const evalManifoldHeight = (x: number, z: number): number => {
    return (
      1.55 * Math.sin(0.42 * x) * Math.cos(0.42 * z) +
      0.72 * Math.sin(0.85 * x + 0.5 * z) +
      0.42 * Math.cos(1.15 * x - 0.65 * z)
    );
  };

  const evalNormal = (x: number, z: number): THREE.Vector3 => {
    const dydx =
      1.55 * 0.42 * Math.cos(0.42 * x) * Math.cos(0.42 * z) +
      0.72 * 0.85 * Math.cos(0.85 * x + 0.5 * z) -
      0.42 * 1.15 * Math.sin(1.15 * x - 0.65 * z);

    const dydz =
      -1.55 * 0.42 * Math.sin(0.42 * x) * Math.sin(0.42 * z) +
      0.72 * 0.5 * Math.cos(0.85 * x + 0.5 * z) +
      0.42 * 0.65 * Math.sin(1.15 * x - 0.65 * z);

    return new THREE.Vector3(-dydx, 1.0, -dydz).normalize();
  };

  const evalCurvature = (x: number, z: number): number => {
    const d2ydx2 =
      -1.55 * 0.42 * 0.42 * Math.sin(0.42 * x) * Math.cos(0.42 * z) -
      0.72 * 0.85 * 0.85 * Math.sin(0.85 * x + 0.5 * z) -
      0.42 * 1.15 * 1.15 * Math.cos(1.15 * x - 0.65 * z);

    const d2ydz2 =
      -1.55 * 0.42 * 0.42 * Math.sin(0.42 * x) * Math.cos(0.42 * z) -
      0.72 * 0.5 * 0.5 * Math.sin(0.85 * x + 0.5 * z) -
      0.42 * 0.65 * 0.65 * Math.cos(1.15 * x - 0.65 * z);

    return Math.sqrt(d2ydx2 * d2ydx2 + d2ydz2 * d2ydz2);
  };

  // =========================================================================
  // 2. Semantic Cluster Coordinates & Density Field
  // =========================================================================
  const clusterDefinitions = [
    {
      id: 'cluster-mode-a',
      name: 'Semantic Cluster Mode α',
      symbol: 'z_α',
      x: -3.6,
      z: 2.8,
      sigma: 2.2,
      role: 'Generative Source Prior Cluster',
      density: '0.942',
      dim: '512-D Latent Coordinates',
      desc: 'High-probability mode representing coherent generative samples. Geodesic trajectories originate from this semantic basin to minimize perceptual drift.',
    },
    {
      id: 'cluster-mode-b',
      name: 'Semantic Cluster Mode β',
      symbol: 'z_β',
      x: 2.8,
      z: 3.0,
      sigma: 2.0,
      role: 'Semantic Target Representation',
      density: '0.865',
      dim: '512-D Latent Coordinates',
      desc: 'Contrastive semantic attractor cluster located across an undulating curvature ridge.',
    },
    {
      id: 'cluster-bridge',
      name: 'Topological Bridge Mode',
      symbol: 'z_{bridge}',
      x: -0.6,
      z: -1.0,
      sigma: 1.8,
      role: 'Saddle Point Transition Zone',
      density: '0.712',
      dim: 'Riemannian Critical Point',
      desc: 'Topological saddle point along the Riemannian geodesic manifold connecting distinct latent clusters.',
    },
    {
      id: 'cluster-mode-d',
      name: 'Semantic Cluster Mode γ',
      symbol: 'z_γ',
      x: 3.4,
      z: -3.2,
      sigma: 2.1,
      role: 'Downstream Representation Mode',
      density: '0.798',
      dim: '512-D Latent Coordinates',
      desc: 'Stable convergence basin for diffusion score-matching trajectory interpolation.',
    },
  ];

  const evalDensity = (x: number, z: number): number => {
    let d = 0;
    for (const c of clusterDefinitions) {
      const distSq = (x - c.x) * (x - c.x) + (z - c.z) * (z - c.z);
      d += Math.exp(-distSq / (2 * c.sigma * c.sigma));
    }
    return Math.min(d, 1.4);
  };

  // =========================================================================
  // 3. Build Continuous Manifold Surface Geometry & Shading
  // =========================================================================
  const gridRes = quality === 'low' ? 32 : quality === 'medium' ? 48 : 64;
  const WIDTH = 12.8;
  const DEPTH = 12.8;
  const surfaceGeo = new THREE.PlaneGeometry(WIDTH, DEPTH, gridRes, gridRes);
  disposables.push(surfaceGeo);

  const posAttr = surfaceGeo.attributes.position;
  const colors = new Float32Array(posAttr.count * 3);

  const colVoid = new THREE.Color(0x06080e);
  const colBase = new THREE.Color(0x111622);
  const colCrimson = new THREE.Color(0x881337);
  const colCrest = new THREE.Color(0xe11d48);
  const colPeak = new THREE.Color(0xfb7185);

  for (let i = 0; i < posAttr.count; i++) {
    const x = posAttr.getX(i);
    const z = posAttr.getY(i);
    const yHeight = evalManifoldHeight(x, z);
    posAttr.setZ(i, yHeight);

    const normH = Math.min(Math.max((yHeight + 2.4) / 4.8, 0), 1);
    const density = evalDensity(x, z);
    const curvature = Math.min(evalCurvature(x, z) / 2.5, 1.0);

    const edgeDist = Math.max(Math.abs(x) / (WIDTH / 2), Math.abs(z) / (DEPTH / 2));
    const edgeFade = 1.0 - Math.pow(Math.min(edgeDist, 1.0), 3.5);

    const c = new THREE.Color();
    if (normH < 0.35) {
      c.lerpColors(colVoid, colBase, normH / 0.35);
    } else if (normH < 0.7) {
      c.lerpColors(colBase, colCrimson, (normH - 0.35) / 0.35);
    } else {
      c.lerpColors(colCrimson, colCrest, (normH - 0.7) / 0.3);
    }

    if (density > 0.25) {
      c.lerp(colPeak, Math.min((density - 0.25) * 0.45, 0.6));
    }
    if (curvature > 0.4) {
      c.lerp(colCrest, (curvature - 0.4) * 0.35);
    }

    c.multiplyScalar(0.45 + 0.55 * edgeFade);

    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }

  surfaceGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  surfaceGeo.computeVertexNormals();

  const surfaceMat = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.62,
    metalness: 0.16,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.96,
    emissive: new THREE.Color(0x16050b),
    emissiveIntensity: 0.4,
  });
  disposables.push(surfaceMat);

  const surfaceMesh = new THREE.Mesh(surfaceGeo, surfaceMat);
  surfaceMesh.rotation.x = -Math.PI / 2;
  group.add(surfaceMesh);

  // Wireframe
  const wireMat = new THREE.MeshBasicMaterial({
    color: 0xbe123c,
    wireframe: true,
    transparent: true,
    opacity: quality === 'low' ? 0.05 : 0.08,
  });
  disposables.push(wireMat);
  const wireMesh = new THREE.Mesh(surfaceGeo, wireMat);
  wireMesh.rotation.x = -Math.PI / 2;
  wireMesh.position.y = 0.008;
  group.add(wireMesh);

  // Metric Coordinate Isolines
  const isocurveGroup = new THREE.Group();
  group.add(isocurveGroup);

  const isocurveMat = new THREE.LineBasicMaterial({
    color: 0xf43f5e,
    transparent: true,
    opacity: quality === 'low' ? 0.14 : 0.22,
  });
  disposables.push(isocurveMat);

  const isoCount = quality === 'low' ? 5 : quality === 'medium' ? 7 : 9;
  const isoSteps = quality === 'low' ? 32 : 56;

  for (let c = 0; c < isoCount; c++) {
    const xVal = -WIDTH / 2 + (c + 0.5) * (WIDTH / isoCount);
    const pts: THREE.Vector3[] = [];
    for (let s = 0; s <= isoSteps; s++) {
      const zVal = -DEPTH / 2 + (s / isoSteps) * DEPTH;
      const yVal = evalManifoldHeight(xVal, zVal);
      const norm = evalNormal(xVal, zVal);
      pts.push(new THREE.Vector3(xVal, yVal, zVal).addScaledVector(norm, 0.015));
    }
    const isoGeo = new THREE.BufferGeometry().setFromPoints(pts);
    disposables.push(isoGeo);
    isocurveGroup.add(new THREE.Line(isoGeo, isocurveMat));
  }

  for (let r = 0; r < isoCount; r++) {
    const zVal = -DEPTH / 2 + (r + 0.5) * (DEPTH / isoCount);
    const pts: THREE.Vector3[] = [];
    for (let s = 0; s <= isoSteps; s++) {
      const xVal = -WIDTH / 2 + (s / isoSteps) * WIDTH;
      const yVal = evalManifoldHeight(xVal, zVal);
      const norm = evalNormal(xVal, zVal);
      pts.push(new THREE.Vector3(xVal, yVal, zVal).addScaledVector(norm, 0.015));
    }
    const isoGeo = new THREE.BufferGeometry().setFromPoints(pts);
    disposables.push(isoGeo);
    isocurveGroup.add(new THREE.Line(isoGeo, isocurveMat));
  }

  // =========================================================================
  // 4. Semantic Molecular Clusters - OPTIMIZED WITH INSTANCED MESH
  // =========================================================================
  const clusterGroup = new THREE.Group();
  group.add(clusterGroup);

  const coreGeo = new THREE.SphereGeometry(0.24, 20, 20);
  const coreMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xe11d48,
    emissiveIntensity: 0.9,
    roughness: 0.25,
  });
  disposables.push(coreGeo, coreMat);

  const dropLineMat = new THREE.LineBasicMaterial({
    color: 0xf43f5e,
    transparent: true,
    opacity: 0.45,
  });
  disposables.push(dropLineMat);

  const contactRingGeo = new THREE.RingGeometry(0.32, 0.42, 32);
  const contactRingMat = new THREE.MeshBasicMaterial({
    color: 0xf43f5e,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.5,
  });
  disposables.push(contactRingGeo, contactRingMat);

  const inspectables: { mesh: THREE.Object3D; data: InspectableItem }[] = [];
  const coreMeshes: THREE.Mesh[] = [];

  // Batch all 56 satellite feature atoms into a single InstancedMesh!
  const SATELLITE_COUNT_PER_CLUSTER = quality === 'low' ? 8 : 14;
  const totalSatellites = clusterDefinitions.length * SATELLITE_COUNT_PER_CLUSTER;
  const satelliteGeo = new THREE.SphereGeometry(0.08, 10, 10);
  const satelliteMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    roughness: 0.4,
    metalness: 0.6,
  });
  disposables.push(satelliteGeo, satelliteMat);

  const instancedSatellites = new THREE.InstancedMesh(satelliteGeo, satelliteMat, totalSatellites);
  const satDummy = new THREE.Object3D();
  let satIdx = 0;

  clusterDefinitions.forEach((def, cIdx) => {
    const surfaceY = evalManifoldHeight(def.x, def.z);
    const surfaceNormal = evalNormal(def.x, def.z);
    const surfacePos = new THREE.Vector3(def.x, surfaceY, def.z);
    const corePos = surfacePos.clone().addScaledVector(surfaceNormal, 0.32);

    const coreMesh = new THREE.Mesh(coreGeo, coreMat.clone());
    disposables.push(coreMesh.material as THREE.Material);
    coreMesh.position.copy(corePos);
    clusterGroup.add(coreMesh);
    coreMeshes.push(coreMesh);

    // Drop line to surface
    const dropGeo = new THREE.BufferGeometry().setFromPoints([
      surfacePos.clone().addScaledVector(surfaceNormal, 0.01),
      corePos,
    ]);
    disposables.push(dropGeo);
    const dropLine = new THREE.Line(dropGeo, dropLineMat);
    clusterGroup.add(dropLine);

    // Surface contact ring
    const ringMesh = new THREE.Mesh(contactRingGeo, contactRingMat);
    ringMesh.position.copy(surfacePos.clone().addScaledVector(surfaceNormal, 0.02));
    ringMesh.lookAt(surfacePos.clone().add(surfaceNormal));
    clusterGroup.add(ringMesh);

    // Populate instanced satellite feature atoms
    for (let s = 0; s < SATELLITE_COUNT_PER_CLUSTER; s++) {
      const angle = (s / SATELLITE_COUNT_PER_CLUSTER) * Math.PI * 2 + (cIdx * 0.7);
      const rad = 0.55 + ((s % 3) * 0.28);
      const sx = def.x + Math.cos(angle) * rad;
      const sz = def.z + Math.sin(angle) * rad;
      const sy = evalManifoldHeight(sx, sz);
      const sNorm = evalNormal(sx, sz);
      const sElevation = 0.12 + ((s % 4) * 0.04);
      const satPos = new THREE.Vector3(sx, sy, sz).addScaledVector(sNorm, sElevation);

      satDummy.position.copy(satPos);
      satDummy.updateMatrix();
      instancedSatellites.setMatrixAt(satIdx++, satDummy.matrix);

      // Bond lines
      const bondGeo = new THREE.BufferGeometry().setFromPoints([corePos, satPos]);
      const bondMat = new THREE.LineBasicMaterial({
        color: 0x64748b,
        transparent: true,
        opacity: 0.22,
      });
      disposables.push(bondGeo, bondMat);
      clusterGroup.add(new THREE.Line(bondGeo, bondMat));
    }

    // Register inspectable cluster
    inspectables.push({
      mesh: coreMesh,
      data: {
        id: def.id,
        name: def.name,
        symbol: def.symbol,
        type: 'SEMANTIC LATENT MODE',
        role: def.role,
        dimension: def.dim,
        properties: {
          'Coordinates (x, z)': `[${def.x.toFixed(2)}, ${def.z.toFixed(2)}]`,
          'Surface Elevation y': `${surfaceY.toFixed(3)}`,
          'Kernel Variance σ²': `${(def.sigma * def.sigma).toFixed(2)}`,
          'Local Metric Density': def.density,
          'Satellite Count': `${SATELLITE_COUNT_PER_CLUSTER} Points`,
        },
        description: def.desc,
        worldPosition: corePos.clone(),
      },
    });
  });

  instancedSatellites.instanceMatrix.needsUpdate = true;
  clusterGroup.add(instancedSatellites);
  disposables.push(instancedSatellites);

  // =========================================================================
  // 5. Surface-Conforming Geodesic Trajectories
  // =========================================================================
  const cA = clusterDefinitions[0];
  const cB = clusterDefinitions[1];
  const cBridge = clusterDefinitions[2];
  const cD = clusterDefinitions[3];

  const buildSurfaceGeodesicCurve = (waypoints2D: THREE.Vector2[], stepsPerSegment: number = 32) => {
    const rawSpline = new THREE.SplineCurve(waypoints2D);
    const sampleCount = (waypoints2D.length - 1) * stepsPerSegment;
    const pts2D = rawSpline.getPoints(sampleCount);

    const pts3D: THREE.Vector3[] = [];
    pts2D.forEach((p) => {
      const y = evalManifoldHeight(p.x, p.y);
      const norm = evalNormal(p.x, p.y);
      pts3D.push(new THREE.Vector3(p.x, y, p.y).addScaledVector(norm, 0.045));
    });

    return new THREE.CatmullRomCurve3(pts3D);
  };

  const highway1Curve = buildSurfaceGeodesicCurve([
    new THREE.Vector2(cA.x, cA.z),
    new THREE.Vector2((cA.x + cBridge.x) / 2 - 0.4, (cA.z + cBridge.z) / 2 + 0.3),
    new THREE.Vector2(cBridge.x, cBridge.z),
    new THREE.Vector2((cBridge.x + cB.x) / 2 + 0.3, (cBridge.z + cB.z) / 2 - 0.2),
    new THREE.Vector2(cB.x, cB.z),
    new THREE.Vector2((cB.x + cD.x) / 2 + 0.5, (cB.z + cD.z) / 2),
    new THREE.Vector2(cD.x, cD.z),
  ], quality === 'low' ? 20 : 36);

  const highway1Pts = highway1Curve.getPoints(quality === 'low' ? 100 : 180);
  const highway1Geo = new THREE.BufferGeometry().setFromPoints(highway1Pts);
  disposables.push(highway1Geo);

  const highway1Mat = new THREE.LineBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.9,
  });
  disposables.push(highway1Mat);
  const highway1Line = new THREE.Line(highway1Geo, highway1Mat);
  group.add(highway1Line);

  // Register Geodesic Trajectory as inspectable
  inspectables.push({
    mesh: highway1Line,
    data: {
      id: 'geodesic-highway',
      name: 'Riemannian Geodesic Highway γ(t)',
      symbol: 'γ(t)',
      type: 'GEODESIC TRAJECTORY',
      role: 'Curvature-Conforming Interpolation',
      dimension: 'Trajectory on Manifold M',
      properties: {
        'Geodesic Equation': 'd²γ/dt² + Γ(dγ/dt, dγ/dt) = 0',
        'Metric Length': '14.28 Metric Units',
        'Perceptual Drift': 'Minimal (Zero Sparse Traversals)',
        'Score Matching ODE': 'dz/dt = s_θ(z, t) - ½∇log p(z)',
      },
      description: 'Continuous Riemannian geodesic path connecting semantic modes. Unlike linear Euclidean interpolation which crosses low-density sparse voids, the geodesic path conforms strictly to the manifold topology.',
      worldPosition: new THREE.Vector3(0, 0.4, 0),
    },
  });

  // Traveling Geodesic Particles
  const particleGeo = new THREE.SphereGeometry(0.18, 14, 14);
  const particleMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xff2d55,
    emissiveIntensity: 1.0,
    roughness: 0.2,
  });
  disposables.push(particleGeo, particleMat);

  const particle1 = new THREE.Mesh(particleGeo, particleMat);
  group.add(particle1);

  const tangentArrow = new THREE.ArrowHelper(
    new THREE.Vector3(1, 0, 0),
    new THREE.Vector3(0, 0, 0),
    1.1,
    0xff2d55,
    0.28,
    0.14
  );
  group.add(tangentArrow);
  disposables.push(tangentArrow.line.geometry, tangentArrow.cone.geometry);

  // Grounded Spatial Reference Grid
  const baseGrid = new THREE.GridHelper(14, 14, 0x1e293b, 0x0f172a);
  baseGrid.position.y = -3.2;
  (baseGrid.material as THREE.Material).transparent = true;
  (baseGrid.material as THREE.Material).opacity = 0.35;
  group.add(baseGrid);
  disposables.push(baseGrid.geometry, baseGrid.material as THREE.Material);

  // Interaction Handler
  const onSelectObject = (item: InspectableItem | null) => {
    if (!item) {
      coreMeshes.forEach((m) => {
        (m.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.9;
        m.scale.set(1, 1, 1);
      });
      highway1Mat.opacity = 0.9;
      return;
    }

    if (item.id.startsWith('cluster-')) {
      coreMeshes.forEach((m, idx) => {
        const mat = m.material as THREE.MeshStandardMaterial;
        if (clusterDefinitions[idx].id === item.id) {
          mat.emissiveIntensity = 1.4;
          m.scale.set(1.3, 1.3, 1.3);
        } else {
          mat.emissiveIntensity = 0.3;
          m.scale.set(0.9, 0.9, 0.9);
        }
      });
    } else if (item.id === 'geodesic-highway') {
      highway1Mat.opacity = 1.0;
    }
  };

  // Pre-allocated scratch vectors for zero GC in update loop
  const scratchPt = new THREE.Vector3();
  const scratchTan = new THREE.Vector3();

  let progress1 = 0;
  const update = (time: number, delta: number) => {
    group.rotation.y = Math.sin(time * 0.12) * 0.08;

    progress1 = (progress1 + delta * 0.11) % 1.0;
    highway1Curve.getPointAt(progress1, scratchPt);
    highway1Curve.getTangentAt(progress1, scratchTan).normalize();

    particle1.position.copy(scratchPt);
    tangentArrow.position.copy(scratchPt);
    tangentArrow.setDirection(scratchTan);

    contactRingMat.opacity = 0.4 + Math.sin(time * 2.2) * 0.15;
  };

  const toggleLayer = (layer: LayerType, visible: boolean) => {
    if (layer === 'geometry') {
      manifoldMesh.visible = visible;
      wireframeMesh.visible = visible;
    } else if (layer === 'clusters') {
      coreMeshes.forEach((m) => { m.visible = visible; });
      haloMeshes.forEach((m) => { m.visible = visible; });
    } else if (layer === 'trajectories') {
      highway1Line.visible = visible;
      particle1.visible = visible;
      tangentArrow.visible = visible;
    } else if (layer === 'grid') {
      baseGrid.visible = visible;
    }
  };

  const getAnnotations = (): SpatialAnnotation[] => [
    { id: 'cluster-vl', label: 'Semantic Cluster 01', sublabel: 'Vision-Language Latent', position: clusters[0]?.pos.clone().add(new THREE.Vector3(0, 0.6, 0)) || new THREE.Vector3(-4.8, 1.2, -2.4) },
    { id: 'cluster-diffusion', label: 'Diffusion Basin', sublabel: 'Negative Entropy Well', position: clusters[1]?.pos.clone().add(new THREE.Vector3(0, 0.6, 0)) || new THREE.Vector3(4.5, 0.8, 3.2) },
    { id: 'geodesic-flow', label: 'Geodesic ODE Flow', sublabel: 'Minimum Energy Path', position: new THREE.Vector3(0, 1.2, 0) },
  ];

  return {
    group,
    update,
    dispose,
    defaultCameraPosition: [4.4, 7.2, 16.5],
    defaultTarget: [0, -0.6, 0],
    getInspectableObjects: () => inspectables,
    onSelectObject,
    toggleLayer,
    getAnnotations,
  };
}
