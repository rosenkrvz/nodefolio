import * as THREE from 'three';
import { PhaseArtifactInstance } from '../types';

export function createPhase05LatentManifold(): PhaseArtifactInstance {
  const group = new THREE.Group();
  group.name = 'phase-05-latent-manifold';

  const disposables: { dispose: () => void }[] = [];

  // 1. Manifold parametric elevation formula: Riemannian non-linear embedding
  const evalManifoldHeight = (x: number, z: number): number => {
    return (
      1.35 * Math.sin(0.38 * x) * Math.cos(0.38 * z) +
      0.65 * Math.sin(0.75 * x + 0.45 * z) +
      0.35 * Math.cos(1.15 * x - 0.65 * z)
    );
  };

  // 2. Build Continuous Manifold Surface
  const GRID_RES = 64;
  const WIDTH = 14.0;
  const DEPTH = 14.0;
  const surfaceGeo = new THREE.PlaneGeometry(WIDTH, DEPTH, GRID_RES, GRID_RES);
  disposables.push(surfaceGeo);

  const posAttr = surfaceGeo.attributes.position;
  const colors = new Float32Array(posAttr.count * 3);

  const colBase = new THREE.Color(0x0a0e17);  // Deep slate obsidian
  const colMid = new THREE.Color(0xbe123c);   // Crimson
  const colPeak = new THREE.Color(0xfb7185);  // High-energy rose

  for (let i = 0; i < posAttr.count; i++) {
    const x = posAttr.getX(i);
    const z = posAttr.getY(i); // Note: Y becomes Z when rotated flat
    const yHeight = evalManifoldHeight(x, z);
    posAttr.setZ(i, yHeight);

    // Curvature/elevation normalized color (range roughly -2.2 to +2.2)
    const norm = (yHeight + 2.2) / 4.4;
    const clamped = Math.min(Math.max(norm, 0), 1);

    const c = new THREE.Color();
    if (clamped < 0.45) {
      c.lerpColors(colBase, colMid, clamped / 0.45);
    } else {
      c.lerpColors(colMid, colPeak, (clamped - 0.45) / 0.55);
    }

    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }

  surfaceGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  surfaceGeo.computeVertexNormals();

  // Solid manifold sheet
  const surfaceMat = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.32,
    metalness: 0.65,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.94,
  });
  disposables.push(surfaceMat);

  const surfaceMesh = new THREE.Mesh(surfaceGeo, surfaceMat);
  surfaceMesh.rotation.x = -Math.PI / 2;
  group.add(surfaceMesh);

  // Metric Curvature Wireframe Grid
  const wireMat = new THREE.MeshBasicMaterial({
    color: 0xf43f5e,
    wireframe: true,
    transparent: true,
    opacity: 0.18,
  });
  disposables.push(wireMat);
  const wireMesh = new THREE.Mesh(surfaceGeo, wireMat);
  wireMesh.rotation.x = -Math.PI / 2;
  wireMesh.position.y = 0.02;
  group.add(wireMesh);

  // 3. True Geodesic Trajectory Curve across the manifold surface
  const geodesicPoints: THREE.Vector3[] = [];
  const NUM_STEPS = 80;
  // Waypoints spanning across high and low curvature regions
  const waypoints = [
    new THREE.Vector2(-5.2, 4.8),
    new THREE.Vector2(-2.8, 1.2),
    new THREE.Vector2(0.2, -0.8),
    new THREE.Vector2(3.1, -2.4),
    new THREE.Vector2(5.4, -4.5),
  ];

  const spline2D = new THREE.SplineCurve(waypoints);
  const rawPoints = spline2D.getPoints(NUM_STEPS);

  rawPoints.forEach((p2) => {
    const h = evalManifoldHeight(p2.x, p2.y);
    // Position on 3D manifold (X, Y=Height, Z=p2.y)
    geodesicPoints.push(new THREE.Vector3(p2.x, h + 0.08, p2.y));
  });

  const geodesicCurve = new THREE.CatmullRomCurve3(geodesicPoints);
  const denseGeodesicPts = geodesicCurve.getPoints(160);
  const geodesicGeo = new THREE.BufferGeometry().setFromPoints(denseGeodesicPts);
  disposables.push(geodesicGeo);

  const geodesicMat = new THREE.LineBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.95,
  });
  disposables.push(geodesicMat);
  const geodesicLine = new THREE.Line(geodesicGeo, geodesicMat);
  group.add(geodesicLine);

  // 4. Tangent Vector Frames (T_z M) along the geodesic
  const tangentGroup = new THREE.Group();
  group.add(tangentGroup);

  const TANGENT_COUNT = 6;
  const tangentArrows: THREE.ArrowHelper[] = [];

  for (let k = 0; k < TANGENT_COUNT; k++) {
    const u = (k + 0.5) / TANGENT_COUNT;
    const pt = geodesicCurve.getPointAt(u);
    const tangent = geodesicCurve.getTangentAt(u).normalize();

    const arrow = new THREE.ArrowHelper(tangent, pt, 1.1, 0xff2d55, 0.3, 0.16);
    tangentGroup.add(arrow);
    tangentArrows.push(arrow);
    disposables.push(arrow.line.geometry, arrow.cone.geometry);
  }

  // 5. Embedded Latent Clusters
  const clusterPositions = [
    new THREE.Vector2(-4.5, 3.8),
    new THREE.Vector2(-1.5, -2.2),
    new THREE.Vector2(3.8, 3.2),
    new THREE.Vector2(4.2, -3.6),
  ];

  const clusterPointGeo = new THREE.SphereGeometry(0.12, 10, 10);
  const clusterPointMat = new THREE.MeshBasicMaterial({ color: 0x94a3b8 });
  disposables.push(clusterPointGeo, clusterPointMat);

  const clusterCenterGeo = new THREE.SphereGeometry(0.28, 16, 16);
  const clusterCenterMat = new THREE.MeshStandardMaterial({
    color: 0xe11d48,
    emissive: 0xbe123c,
    emissiveIntensity: 0.8,
  });
  disposables.push(clusterCenterGeo, clusterCenterMat);

  clusterPositions.forEach((center2D) => {
    const centerH = evalManifoldHeight(center2D.x, center2D.y);
    const centerMesh = new THREE.Mesh(clusterCenterGeo, clusterCenterMat);
    centerMesh.position.set(center2D.x, centerH + 0.15, center2D.y);
    group.add(centerMesh);

    // Halo ring
    const ringGeo = new THREE.RingGeometry(0.45, 0.58, 24);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xf43f5e,
      transparent: true,
      opacity: 0.4,
      side: THREE.DoubleSide,
    });
    disposables.push(ringGeo, ringMat);
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.set(center2D.x, centerH + 0.1, center2D.y);
    group.add(ring);

    // Nearby cluster points
    for (let p = 0; p < 18; p++) {
      const ox = (Math.random() - 0.5) * 1.6;
      const oz = (Math.random() - 0.5) * 1.6;
      const px = center2D.x + ox;
      const pz = center2D.y + oz;
      const py = evalManifoldHeight(px, pz);

      const dot = new THREE.Mesh(clusterPointGeo, clusterPointMat);
      dot.position.set(px, py + 0.06, pz);
      group.add(dot);
    }
  });

  // 6. Active Traveling Geodesic Particle
  const particleGeo = new THREE.SphereGeometry(0.22, 16, 16);
  const particleMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xff2d55,
    emissiveIntensity: 1.0,
  });
  disposables.push(particleGeo, particleMat);
  const particle = new THREE.Mesh(particleGeo, particleMat);
  group.add(particle);

  // Dynamic moving tangent arrow on particle
  const particleArrow = new THREE.ArrowHelper(
    new THREE.Vector3(1, 0, 0),
    new THREE.Vector3(0, 0, 0),
    1.4,
    0xff2d55,
    0.35,
    0.2
  );
  group.add(particleArrow);
  disposables.push(particleArrow.line.geometry, particleArrow.cone.geometry);

  // Update loop
  let particleProgress = 0;
  const update = (time: number, delta: number) => {
    // Gentle rotation of the entire manifold
    group.rotation.y = Math.sin(time * 0.18) * 0.1;

    // Move particle along geodesic
    particleProgress = (particleProgress + delta * 0.14) % 1.0;
    const pt = geodesicCurve.getPointAt(particleProgress);
    const tangent = geodesicCurve.getTangentAt(particleProgress).normalize();

    particle.position.copy(pt);
    particleArrow.position.copy(pt);
    particleArrow.setDirection(tangent);

    // Subtle breath on tangent arrows
    tangentArrows.forEach((arr, idx) => {
      const s = 1.0 + Math.sin(time * 2.0 + idx) * 0.15;
      arr.scale.set(s, s, s);
    });
  };

  const dispose = () => {
    disposables.forEach((d) => d.dispose());
  };

  return {
    group,
    update,
    dispose,
    defaultCameraPosition: [0, 8.5, 14],
    defaultTarget: [0, 0, 0],
  };
}
