import * as THREE from 'three';
import { PhaseArtifactInstance } from '../types';

export function createPhase05LatentManifold(): PhaseArtifactInstance {
  const group = new THREE.Group();
  group.name = 'phase-05-latent-manifold';

  const disposables: { dispose: () => void }[] = [];

  // =========================================================================
  // 1. Manifold Parametric Surface & Analytical Derivatives
  // =========================================================================
  // y(x, z) represents a smooth, non-Euclidean Riemannian latent landscape.
  const evalManifoldHeight = (x: number, z: number): number => {
    return (
      1.55 * Math.sin(0.42 * x) * Math.cos(0.42 * z) +
      0.72 * Math.sin(0.85 * x + 0.5 * z) +
      0.42 * Math.cos(1.15 * x - 0.65 * z)
    );
  };

  // Analytical partial derivatives for computing the exact surface normal:
  // N = (-dy/dx, 1, -dy/dz) / ||N||
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

  // 2nd derivatives for local curvature magnitude calculation
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
  // 4 well-distributed semantic latent modes
  const clusterDefinitions = [
    { id: 'mode-a', x: -3.6, z: 2.8, label: 'Mode α', color: 0xe11d48, sigma: 2.2 },
    { id: 'mode-b', x: 2.8, z: 3.0, label: 'Mode β', color: 0xf43f5e, sigma: 2.0 },
    { id: 'mode-c', x: -0.6, z: -1.0, label: 'Bridge Mode', color: 0xfb7185, sigma: 1.8 },
    { id: 'mode-d', x: 3.4, z: -3.2, label: 'Mode γ', color: 0xe11d48, sigma: 2.1 },
  ];

  // Evaluate local cluster attraction density at (x, z)
  const evalDensity = (x: number, z: number): number => {
    let d = 0;
    for (const c of clusterDefinitions) {
      const distSq = (x - c.x) * (x - c.x) + (z - c.z) * (z - c.z);
      d += Math.exp(-distSq / (2 * c.sigma * c.sigma));
    }
    return Math.min(d, 1.4);
  };

  // =========================================================================
  // 3. Build Continuous Manifold Surface Geometry & Vertex Shading
  // =========================================================================
  const GRID_RES = 64;
  const WIDTH = 12.8; // Calibrated for balanced framing and breathing room
  const DEPTH = 12.8;
  const surfaceGeo = new THREE.PlaneGeometry(WIDTH, DEPTH, GRID_RES, GRID_RES);
  disposables.push(surfaceGeo);

  const posAttr = surfaceGeo.attributes.position;
  const colors = new Float32Array(posAttr.count * 3);

  // Harmonious scientific palette: Obsidian void -> Wine crimson -> Luminous rose
  const colVoid = new THREE.Color(0x06080e);    // Deepest ambient void
  const colBase = new THREE.Color(0x111622);    // Low-energy slate
  const colCrimson = new THREE.Color(0x881337); // Mid-energy metric crimson
  const colCrest = new THREE.Color(0xe11d48);   // Active crest
  const colPeak = new THREE.Color(0xfb7185);    // High semantic density peak

  for (let i = 0; i < posAttr.count; i++) {
    const x = posAttr.getX(i);
    const z = posAttr.getY(i); // PlaneGeometry: Y corresponds to 3D Z when rotated flat
    const yHeight = evalManifoldHeight(x, z);
    posAttr.setZ(i, yHeight);

    // Normalize elevation (approx -2.5 to +2.5)
    const normH = Math.min(Math.max((yHeight + 2.4) / 4.8, 0), 1);
    const density = evalDensity(x, z);
    const curvature = Math.min(evalCurvature(x, z) / 2.5, 1.0);

    // Edge falloff to create organic vignette near boundaries
    const edgeDist = Math.max(Math.abs(x) / (WIDTH / 2), Math.abs(z) / (DEPTH / 2));
    const edgeFade = 1.0 - Math.pow(Math.min(edgeDist, 1.0), 3.5);

    // Compute blended vertex color based on elevation, curvature, and semantic density
    const c = new THREE.Color();
    if (normH < 0.35) {
      c.lerpColors(colVoid, colBase, normH / 0.35);
    } else if (normH < 0.7) {
      c.lerpColors(colBase, colCrimson, (normH - 0.35) / 0.35);
    } else {
      c.lerpColors(colCrimson, colCrest, (normH - 0.7) / 0.3);
    }

    // Blend in local density / curvature highlights (softer, data-driven, not harsh specular glare)
    if (density > 0.25) {
      c.lerp(colPeak, Math.min((density - 0.25) * 0.45, 0.6));
    }
    if (curvature > 0.4) {
      c.lerp(colCrest, (curvature - 0.4) * 0.35);
    }

    // Apply edge fade
    c.multiplyScalar(0.45 + 0.55 * edgeFade);

    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }

  surfaceGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  surfaceGeo.computeVertexNormals();

  // Solid Satin Manifold Material (calibrated roughness/metalness eliminates harsh specular glare)
  const surfaceMat = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.62,   // Satin finish, eliminates blown-out specular streaks
    metalness: 0.16,   // Subtle technical sheen without metallic mirroring
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

  // =========================================================================
  // 4. Subtle, Non-Domineering Wireframe & Coordinate Metric Lines
  // =========================================================================
  // Base triangular wireframe with reduced opacity
  const wireMat = new THREE.MeshBasicMaterial({
    color: 0xbe123c,
    wireframe: true,
    transparent: true,
    opacity: 0.08, // Toned down from 0.18 to prevent visual noise
  });
  disposables.push(wireMat);
  const wireMesh = new THREE.Mesh(surfaceGeo, wireMat);
  wireMesh.rotation.x = -Math.PI / 2;
  wireMesh.position.y = 0.008; // Subtle offset avoids z-fighting
  group.add(wireMesh);

  // Metric Coordinate Isolines (tracing u, v coordinate curves of the metric tensor)
  const isocurveGroup = new THREE.Group();
  group.add(isocurveGroup);

  const isocurveMat = new THREE.LineBasicMaterial({
    color: 0xf43f5e,
    transparent: true,
    opacity: 0.22,
  });
  disposables.push(isocurveMat);

  const ISO_COUNT = 9;
  const ISO_STEPS = 64;

  // Longitudinal curves (fixed X, sweep Z)
  for (let c = 0; c < ISO_COUNT; c++) {
    const xVal = -WIDTH / 2 + (c + 0.5) * (WIDTH / ISO_COUNT);
    const pts: THREE.Vector3[] = [];
    for (let s = 0; s <= ISO_STEPS; s++) {
      const zVal = -DEPTH / 2 + (s / ISO_STEPS) * DEPTH;
      const yVal = evalManifoldHeight(xVal, zVal);
      const norm = evalNormal(xVal, zVal);
      pts.push(new THREE.Vector3(xVal, yVal, zVal).addScaledVector(norm, 0.015));
    }
    const isoGeo = new THREE.BufferGeometry().setFromPoints(pts);
    disposables.push(isoGeo);
    isocurveGroup.add(new THREE.Line(isoGeo, isocurveMat));
  }

  // Latitudinal curves (fixed Z, sweep X)
  for (let r = 0; r < ISO_COUNT; r++) {
    const zVal = -DEPTH / 2 + (r + 0.5) * (DEPTH / ISO_COUNT);
    const pts: THREE.Vector3[] = [];
    for (let s = 0; s <= ISO_STEPS; s++) {
      const xVal = -WIDTH / 2 + (s / ISO_STEPS) * WIDTH;
      const yVal = evalManifoldHeight(xVal, zVal);
      const norm = evalNormal(xVal, zVal);
      pts.push(new THREE.Vector3(xVal, yVal, zVal).addScaledVector(norm, 0.015));
    }
    const isoGeo = new THREE.BufferGeometry().setFromPoints(pts);
    disposables.push(isoGeo);
    isocurveGroup.add(new THREE.Line(isoGeo, isocurveMat));
  }

  // =========================================================================
  // 5. Semantic Molecular Clusters (Spatially Anchored to Manifold)
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

  const satelliteGeo = new THREE.SphereGeometry(0.08, 12, 12);
  const satelliteMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    roughness: 0.4,
    metalness: 0.6,
  });
  disposables.push(satelliteGeo, satelliteMat);

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

  const clusterCenters3D: { id: string; pos: THREE.Vector3; normal: THREE.Vector3 }[] = [];

  clusterDefinitions.forEach((def, cIdx) => {
    const surfaceY = evalManifoldHeight(def.x, def.z);
    const surfaceNormal = evalNormal(def.x, def.z);
    const surfacePos = new THREE.Vector3(def.x, surfaceY, def.z);

    // Position cluster core strictly along the surface normal (elevated 0.32 units)
    const corePos = surfacePos.clone().addScaledVector(surfaceNormal, 0.32);
    clusterCenters3D.push({ id: def.id, pos: corePos, normal: surfaceNormal });

    // Core Mesh
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    coreMesh.position.copy(corePos);
    clusterGroup.add(coreMesh);

    // Topological Drop Line connecting core to surface
    const dropGeo = new THREE.BufferGeometry().setFromPoints([
      surfacePos.clone().addScaledVector(surfaceNormal, 0.01),
      corePos,
    ]);
    disposables.push(dropGeo);
    const dropLine = new THREE.Line(dropGeo, dropLineMat);
    clusterGroup.add(dropLine);

    // Surface Contact Ring oriented along normal
    const ringMesh = new THREE.Mesh(contactRingGeo, contactRingMat);
    ringMesh.position.copy(surfacePos.clone().addScaledVector(surfaceNormal, 0.02));
    ringMesh.lookAt(surfacePos.clone().add(surfaceNormal));
    clusterGroup.add(ringMesh);

    // Satellite Molecular Feature Nodes (14 per cluster, anchored along local normal)
    const SATELLITE_COUNT = 14;
    for (let s = 0; s < SATELLITE_COUNT; s++) {
      const angle = (s / SATELLITE_COUNT) * Math.PI * 2 + (cIdx * 0.7);
      const rad = 0.55 + ((s % 3) * 0.28);
      const sx = def.x + Math.cos(angle) * rad;
      const sz = def.z + Math.sin(angle) * rad;
      const sy = evalManifoldHeight(sx, sz);
      const sNorm = evalNormal(sx, sz);

      // Elevated between 0.12 and 0.26 above surface along normal
      const sElevation = 0.12 + ((s % 4) * 0.04);
      const satPos = new THREE.Vector3(sx, sy, sz).addScaledVector(sNorm, sElevation);

      const satMesh = new THREE.Mesh(satelliteGeo, satelliteMat);
      satMesh.position.copy(satPos);
      clusterGroup.add(satMesh);

      // Subtle bond connector to core
      const bondGeo = new THREE.BufferGeometry().setFromPoints([corePos, satPos]);
      const bondMat = new THREE.LineBasicMaterial({
        color: 0x64748b,
        transparent: true,
        opacity: 0.25,
      });
      disposables.push(bondGeo, bondMat);
      clusterGroup.add(new THREE.Line(bondGeo, bondMat));
    }
  });

  // =========================================================================
  // 6. Surface-Conforming Geodesic Trajectories
  // =========================================================================
  // Connect semantic clusters with true geodesic paths that tightly hug the manifold surface.
  // Highway 1: Mode A -> Bridge Mode -> Mode B -> Mode D
  // Highway 2: Mode A -> Mode D
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
      // Offset slightly above surface along normal to prevent clipping
      pts3D.push(new THREE.Vector3(p.x, y, p.y).addScaledVector(norm, 0.045));
    });

    return new THREE.CatmullRomCurve3(pts3D);
  };

  // Primary Geodesic Trajectory
  const highway1Curve = buildSurfaceGeodesicCurve([
    new THREE.Vector2(cA.x, cA.z),
    new THREE.Vector2((cA.x + cBridge.x) / 2 - 0.4, (cA.z + cBridge.z) / 2 + 0.3),
    new THREE.Vector2(cBridge.x, cBridge.z),
    new THREE.Vector2((cBridge.x + cB.x) / 2 + 0.3, (cBridge.z + cB.z) / 2 - 0.2),
    new THREE.Vector2(cB.x, cB.z),
    new THREE.Vector2((cB.x + cD.x) / 2 + 0.5, (cB.z + cD.z) / 2),
    new THREE.Vector2(cD.x, cD.z),
  ], 40);

  const highway1Pts = highway1Curve.getPoints(200);
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

  // Secondary Branching Geodesic Trajectory
  const highway2Curve = buildSurfaceGeodesicCurve([
    new THREE.Vector2(cA.x, cA.z),
    new THREE.Vector2(-2.2, -0.8),
    new THREE.Vector2(0.5, -2.6),
    new THREE.Vector2(cD.x, cD.z),
  ], 30);

  const highway2Pts = highway2Curve.getPoints(120);
  const highway2Geo = new THREE.BufferGeometry().setFromPoints(highway2Pts);
  disposables.push(highway2Geo);

  const highway2Mat = new THREE.LineBasicMaterial({
    color: 0xf43f5e,
    transparent: true,
    opacity: 0.55,
  });
  disposables.push(highway2Mat);
  const highway2Line = new THREE.Line(highway2Geo, highway2Mat);
  group.add(highway2Line);

  // Traveling Geodesic Particles (Moving smoothly along surface-conforming path)
  const particleGeo = new THREE.SphereGeometry(0.18, 16, 16);
  const particleMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xff2d55,
    emissiveIntensity: 1.0,
    roughness: 0.2,
  });
  disposables.push(particleGeo, particleMat);

  const particle1 = new THREE.Mesh(particleGeo, particleMat);
  group.add(particle1);

  const particle2Mat = new THREE.MeshStandardMaterial({
    color: 0xfecdd3,
    emissive: 0xe11d48,
    emissiveIntensity: 0.8,
    roughness: 0.2,
  });
  disposables.push(particle2Mat);
  const particle2 = new THREE.Mesh(particleGeo, particle2Mat);
  group.add(particle2);

  // Tangent Indicator Arrow (lying directly in the tangent plane along the geodesic)
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

  // =========================================================================
  // 7. Grounded Spatial Reference & Elevation Bounding Ring
  // =========================================================================
  // Subtle reference plane below the manifold giving depth orientation
  const baseGrid = new THREE.GridHelper(14, 14, 0x1e293b, 0x0f172a);
  baseGrid.position.y = -3.2;
  (baseGrid.material as THREE.Material).transparent = true;
  (baseGrid.material as THREE.Material).opacity = 0.35;
  group.add(baseGrid);
  disposables.push(baseGrid.geometry, baseGrid.material as THREE.Material);

  // =========================================================================
  // 8. Animation & Update Loop
  // =========================================================================
  let progress1 = 0;
  let progress2 = 0.5;

  const update = (time: number, delta: number) => {
    // Gentle natural oscillation of the manifold in 3D
    group.rotation.y = Math.sin(time * 0.12) * 0.08;

    // Advance particle 1 along primary geodesic
    progress1 = (progress1 + delta * 0.11) % 1.0;
    const pt1 = highway1Curve.getPointAt(progress1);
    const tangent1 = highway1Curve.getTangentAt(progress1).normalize();

    particle1.position.copy(pt1);
    tangentArrow.position.copy(pt1);
    tangentArrow.setDirection(tangent1);

    // Advance particle 2 along secondary geodesic
    progress2 = (progress2 + delta * 0.08) % 1.0;
    const pt2 = highway2Curve.getPointAt(progress2);
    particle2.position.copy(pt2);

    // Subtle breathing pulse on cluster contact rings
    const ringScale = 1.0 + Math.sin(time * 2.2) * 0.08;
    contactRingMat.opacity = 0.4 + Math.sin(time * 2.2) * 0.15;
    contactRingGeo.parameters.innerRadius; // keep active
  };

  const dispose = () => {
    disposables.forEach((d) => d.dispose());
  };

  return {
    group,
    update,
    dispose,
    // Calibrated elevated oblique perspective giving generous breathing room & immediate depth readability
    defaultCameraPosition: [4.4, 7.2, 16.5],
    defaultTarget: [0, -0.6, 0],
  };
}
