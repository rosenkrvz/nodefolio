import * as THREE from 'three';
import { PhaseArtifactInstance } from '../types';

export function createPhase03MetricSpaces(): PhaseArtifactInstance {
  const group = new THREE.Group();
  group.name = 'phase-03-metric-spaces';

  const disposables: { dispose: () => void }[] = [];

  const RADIUS = 5.0;

  // 1. Hyperspherical metric surface (fine wireframe unit hypersphere S^2)
  const sphereGeo = new THREE.SphereGeometry(RADIUS, 36, 24);
  disposables.push(sphereGeo);

  const sphereMat = new THREE.MeshStandardMaterial({
    color: 0x090d16,
    roughness: 0.4,
    metalness: 0.8,
    transparent: true,
    opacity: 0.65,
  });
  disposables.push(sphereMat);

  const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
  group.add(sphereMesh);

  // Wireframe metric grid (parallels & meridians)
  const wireMat = new THREE.MeshBasicMaterial({
    color: 0x3b82f6,
    wireframe: true,
    transparent: true,
    opacity: 0.16,
  });
  disposables.push(wireMat);
  const wireMesh = new THREE.Mesh(sphereGeo, wireMat);
  group.add(wireMesh);

  // Equator & Great Circles highlighting geodesic lines
  const equatorGeo = new THREE.BufferGeometry();
  const eqPoints: THREE.Vector3[] = [];
  for (let i = 0; i <= 64; i++) {
    const theta = (i / 64) * Math.PI * 2;
    eqPoints.push(new THREE.Vector3(Math.cos(theta) * (RADIUS + 0.02), 0, Math.sin(theta) * (RADIUS + 0.02)));
  }
  equatorGeo.setFromPoints(eqPoints);
  disposables.push(equatorGeo);

  const eqMat = new THREE.LineBasicMaterial({
    color: 0xe11d48,
    transparent: true,
    opacity: 0.5,
  });
  disposables.push(eqMat);
  const equator = new THREE.Line(equatorGeo, eqMat);
  group.add(equator);

  // 2. Semantic Cluster Point Clouds embedded on the sphere
  const CLUSTERS = 4;
  const POINTS_PER_CLUSTER = 35;
  const clusterCenters = [
    new THREE.Vector3(0.6, 0.5, 0.6).normalize().multiplyScalar(RADIUS),
    new THREE.Vector3(-0.7, 0.4, 0.5).normalize().multiplyScalar(RADIUS),
    new THREE.Vector3(0.2, -0.8, 0.5).normalize().multiplyScalar(RADIUS),
    new THREE.Vector3(-0.4, -0.4, -0.8).normalize().multiplyScalar(RADIUS),
  ];

  const pointGeo = new THREE.SphereGeometry(0.09, 8, 8);
  const pointMat = new THREE.MeshBasicMaterial({
    color: 0x94a3b8,
    transparent: true,
    opacity: 0.75,
  });
  disposables.push(pointGeo, pointMat);

  const clusterGroup = new THREE.Group();
  group.add(clusterGroup);

  clusterCenters.forEach((center, cIdx) => {
    for (let p = 0; p < POINTS_PER_CLUSTER; p++) {
      // Perturb on sphere around center
      const offset = new THREE.Vector3(
        (Math.random() - 0.5) * 1.8,
        (Math.random() - 0.5) * 1.8,
        (Math.random() - 0.5) * 1.8
      );
      const pt = new THREE.Vector3().addVectors(center, offset).normalize().multiplyScalar(RADIUS + 0.04);

      const dot = new THREE.Mesh(pointGeo, pointMat);
      dot.position.copy(pt);
      clusterGroup.add(dot);
    }

    // Cluster centroid marker
    const centroidGeo = new THREE.SphereGeometry(0.18, 12, 12);
    const centroidMat = new THREE.MeshStandardMaterial({
      color: cIdx === 0 ? 0xf43f5e : 0x64748b,
      emissive: cIdx === 0 ? 0xe11d48 : 0x334155,
      emissiveIntensity: 0.7,
    });
    disposables.push(centroidGeo, centroidMat);
    const centroid = new THREE.Mesh(centroidGeo, centroidMat);
    centroid.position.copy(center.clone().multiplyScalar(1.01));
    clusterGroup.add(centroid);
  });

  // 3. Contrastive Pair Dynamics: Anchor (x), Positive Pair (x+), Negative Pair (x-)
  const anchorPos = clusterCenters[0].clone().multiplyScalar(1.02);
  const posOffset = new THREE.Vector3(0.5, 0.3, -0.2);
  const positivePos = new THREE.Vector3().addVectors(anchorPos, posOffset).normalize().multiplyScalar(RADIUS * 1.02);
  const negativePos = clusterCenters[1].clone().multiplyScalar(1.02);

  // Anchor Mesh
  const anchorGeo = new THREE.DodecahedronGeometry(0.3, 0);
  const anchorMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xff2d55,
    emissiveIntensity: 0.8,
  });
  disposables.push(anchorGeo, anchorMat);
  const anchorMesh = new THREE.Mesh(anchorGeo, anchorMat);
  anchorMesh.position.copy(anchorPos);
  group.add(anchorMesh);

  // Positive Mesh
  const posGeo = new THREE.SphereGeometry(0.24, 16, 16);
  const posMat = new THREE.MeshStandardMaterial({
    color: 0x10b981,
    emissive: 0x059669,
    emissiveIntensity: 0.8,
  });
  disposables.push(posGeo, posMat);
  const posMesh = new THREE.Mesh(posGeo, posMat);
  posMesh.position.copy(positivePos);
  group.add(posMesh);

  // Negative Mesh
  const negGeo = new THREE.SphereGeometry(0.24, 16, 16);
  const negMat = new THREE.MeshStandardMaterial({
    color: 0x64748b,
    emissive: 0x334155,
    emissiveIntensity: 0.5,
  });
  disposables.push(negGeo, negMat);
  const negMesh = new THREE.Mesh(negGeo, negMat);
  negMesh.position.copy(negativePos);
  group.add(negMesh);

  // 4. Geodesic Great-Circle Arcs (SLERP interpolation on S^2)
  const createGeodesic = (p1: THREE.Vector3, p2: THREE.Vector3, color: number, opacity: number) => {
    const points: THREE.Vector3[] = [];
    const NUM_SEG = 40;
    const v1 = p1.clone().normalize();
    const v2 = p2.clone().normalize();

    for (let i = 0; i <= NUM_SEG; i++) {
      const t = i / NUM_SEG;
      // Spherical linear interpolation
      const v = new THREE.Vector3();
      const q1 = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(1, 0, 0), v1);
      const q2 = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(1, 0, 0), v2);
      q1.slerp(q2, t);
      v.set(1, 0, 0).applyQuaternion(q1).multiplyScalar(RADIUS + 0.08);
      points.push(v);
    }

    const geo = new THREE.BufferGeometry().setFromPoints(points);
    const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity });
    disposables.push(geo, mat);
    return new THREE.Line(geo, mat);
  };

  // Attractive Geodesic (Anchor -> Positive)
  const attractiveArc = createGeodesic(anchorPos, positivePos, 0x10b981, 0.85);
  group.add(attractiveArc);

  // Repulsive Geodesic (Anchor -> Negative)
  const repulsiveArc = createGeodesic(anchorPos, negativePos, 0xef4444, 0.45);
  group.add(repulsiveArc);

  // 5. Geodesic Flow Pulse Particle along Anchor -> Positive
  const pulseGeo = new THREE.SphereGeometry(0.12, 10, 10);
  const pulseMat = new THREE.MeshBasicMaterial({ color: 0x34d399 });
  disposables.push(pulseGeo, pulseMat);
  const pulseMesh = new THREE.Mesh(pulseGeo, pulseMat);
  group.add(pulseMesh);

  let pulseT = 0;
  const update = (time: number, delta: number) => {
    // Subtle rotation of metric space to demonstrate 3D non-Euclidean spherical topology
    sphereMesh.rotation.y += delta * 0.04;
    wireMesh.rotation.y += delta * 0.04;
    clusterGroup.rotation.y += delta * 0.04;

    // Pulse animation
    pulseT = (pulseT + delta * 0.5) % 1.0;
    const v1 = anchorPos.clone().normalize();
    const v2 = positivePos.clone().normalize();
    const q1 = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(1, 0, 0), v1);
    const q2 = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(1, 0, 0), v2);
    q1.slerp(q2, pulseT);
    const pt = new THREE.Vector3(1, 0, 0).applyQuaternion(q1).multiplyScalar(RADIUS + 0.12);
    pulseMesh.position.copy(pt);

    // Dynamic scale pulse on anchor
    const scale = 1.0 + Math.sin(time * 2.5) * 0.1;
    anchorMesh.scale.set(scale, scale, scale);
  };

  const dispose = () => {
    disposables.forEach((d) => d.dispose());
  };

  return {
    group,
    update,
    dispose,
    defaultCameraPosition: [0, 2, 13],
    defaultTarget: [0, 0, 0],
  };
}
