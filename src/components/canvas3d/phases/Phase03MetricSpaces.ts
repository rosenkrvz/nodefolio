import * as THREE from 'three';
import { PhaseArtifactInstance, QualityTier, InspectableItem } from '../types';

export function createPhase03MetricSpaces(quality: QualityTier = 'high'): PhaseArtifactInstance {
  const group = new THREE.Group();
  group.name = 'phase-03-metric-spaces';

  const disposables: { dispose: () => void }[] = [];

  const RADIUS = 4.8;

  // 1. Hyperspherical metric surface S²
  const sphereWidthSegs = quality === 'low' ? 18 : quality === 'medium' ? 26 : 36;
  const sphereHeightSegs = quality === 'low' ? 12 : quality === 'medium' ? 18 : 24;
  const sphereGeo = new THREE.SphereGeometry(RADIUS, sphereWidthSegs, sphereHeightSegs);
  disposables.push(sphereGeo);

  const sphereMat = new THREE.MeshStandardMaterial({
    color: 0x070b14,
    roughness: 0.55,
    metalness: 0.2,
    transparent: true,
    opacity: 0.72,
    emissive: new THREE.Color(0x0e1422),
    emissiveIntensity: 0.3,
  });
  disposables.push(sphereMat);

  const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
  group.add(sphereMesh);

  // Wireframe metric grid (parallels & meridians)
  const wireMat = new THREE.MeshBasicMaterial({
    color: 0x3b82f6,
    wireframe: true,
    transparent: true,
    opacity: quality === 'low' ? 0.08 : 0.12,
  });
  disposables.push(wireMat);
  const wireMesh = new THREE.Mesh(sphereGeo, wireMat);
  group.add(wireMesh);

  // Equator Great Circle
  const equatorGeo = new THREE.BufferGeometry();
  const eqPoints: THREE.Vector3[] = [];
  const eqSteps = quality === 'low' ? 32 : 64;
  for (let i = 0; i <= eqSteps; i++) {
    const theta = (i / eqSteps) * Math.PI * 2;
    eqPoints.push(new THREE.Vector3(Math.cos(theta) * (RADIUS + 0.02), 0, Math.sin(theta) * (RADIUS + 0.02)));
  }
  equatorGeo.setFromPoints(eqPoints);
  disposables.push(equatorGeo);

  const eqMat = new THREE.LineBasicMaterial({
    color: 0xe11d48,
    transparent: true,
    opacity: 0.45,
  });
  disposables.push(eqMat);
  const equator = new THREE.Line(equatorGeo, eqMat);
  group.add(equator);

  // 2. Semantic Cluster Point Clouds - HIGH PERFORMANCE INSTANCED MESH
  // Slashes 140 draw calls down to 1 single draw call!
  const CLUSTERS = 4;
  const pointsPerCluster = quality === 'low' ? 16 : quality === 'medium' ? 24 : 32;
  const totalPoints = CLUSTERS * pointsPerCluster;

  const clusterCenters = [
    new THREE.Vector3(0.6, 0.5, 0.6).normalize().multiplyScalar(RADIUS),
    new THREE.Vector3(-0.7, 0.4, 0.5).normalize().multiplyScalar(RADIUS),
    new THREE.Vector3(0.2, -0.8, 0.5).normalize().multiplyScalar(RADIUS),
    new THREE.Vector3(-0.4, -0.4, -0.8).normalize().multiplyScalar(RADIUS),
  ];

  const pointGeo = new THREE.SphereGeometry(0.08, 8, 8);
  const pointMat = new THREE.MeshBasicMaterial({
    color: 0x94a3b8,
    transparent: true,
    opacity: 0.8,
  });
  disposables.push(pointGeo, pointMat);

  const instancedPoints = new THREE.InstancedMesh(pointGeo, pointMat, totalPoints);
  const dummy = new THREE.Object3D();

  let pIdx = 0;
  clusterCenters.forEach((center, cIdx) => {
    for (let p = 0; p < pointsPerCluster; p++) {
      const seed = p * 1.37 + cIdx * 4.19;
      const ox = Math.sin(seed) * 1.2;
      const oy = Math.cos(seed * 1.5) * 1.2;
      const oz = Math.sin(seed * 2.1) * 1.2;

      const pt = new THREE.Vector3(center.x + ox, center.y + oy, center.z + oz)
        .normalize()
        .multiplyScalar(RADIUS + 0.04);

      dummy.position.copy(pt);
      dummy.updateMatrix();
      instancedPoints.setMatrixAt(pIdx++, dummy.matrix);
    }
  });
  instancedPoints.instanceMatrix.needsUpdate = true;
  group.add(instancedPoints);
  disposables.push(instancedPoints);

  // Cluster centroid markers
  const centroidMeshes: THREE.Mesh[] = [];
  const centroidGeo = new THREE.SphereGeometry(0.18, 12, 12);
  disposables.push(centroidGeo);

  clusterCenters.forEach((center, cIdx) => {
    const cMat = new THREE.MeshStandardMaterial({
      color: cIdx === 0 ? 0xf43f5e : 0x64748b,
      emissive: cIdx === 0 ? 0xe11d48 : 0x334155,
      emissiveIntensity: 0.7,
      roughness: 0.3,
    });
    disposables.push(cMat);
    const centroid = new THREE.Mesh(centroidGeo, cMat);
    centroid.position.copy(center.clone().multiplyScalar(1.01));
    group.add(centroid);
    centroidMeshes.push(centroid);
  });

  // 3. Contrastive Pair Dynamics: Anchor (x), Positive (x⁺), Negative (x⁻)
  const anchorPos = clusterCenters[0].clone().multiplyScalar(1.02);
  const posOffset = new THREE.Vector3(0.45, 0.25, -0.2);
  const positivePos = new THREE.Vector3().addVectors(anchorPos, posOffset).normalize().multiplyScalar(RADIUS * 1.02);
  const negativePos = clusterCenters[1].clone().multiplyScalar(1.02);

  // Anchor Mesh
  const anchorGeo = new THREE.DodecahedronGeometry(0.3, 0);
  const anchorMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xff2d55,
    emissiveIntensity: 0.85,
    roughness: 0.2,
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
    emissiveIntensity: 0.85,
    roughness: 0.2,
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
    roughness: 0.3,
  });
  disposables.push(negGeo, negMat);
  const negMesh = new THREE.Mesh(negGeo, negMat);
  negMesh.position.copy(negativePos);
  group.add(negMesh);

  // 4. Geodesic Great-Circle Arcs (Spherical SLERP on S²)
  const createGeodesic = (p1: THREE.Vector3, p2: THREE.Vector3, color: number, opacity: number) => {
    const points: THREE.Vector3[] = [];
    const NUM_SEG = quality === 'low' ? 24 : 40;
    const v1 = p1.clone().normalize();
    const v2 = p2.clone().normalize();

    for (let i = 0; i <= NUM_SEG; i++) {
      const t = i / NUM_SEG;
      const q1 = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(1, 0, 0), v1);
      const q2 = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(1, 0, 0), v2);
      q1.slerp(q2, t);
      const v = new THREE.Vector3(1, 0, 0).applyQuaternion(q1).multiplyScalar(RADIUS + 0.08);
      points.push(v);
    }

    const geo = new THREE.BufferGeometry().setFromPoints(points);
    const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity });
    disposables.push(geo, mat);
    return new THREE.Line(geo, mat);
  };

  const attractiveArc = createGeodesic(anchorPos, positivePos, 0x10b981, 0.9);
  group.add(attractiveArc);

  const repulsiveArc = createGeodesic(anchorPos, negativePos, 0xef4444, 0.45);
  group.add(repulsiveArc);

  // Pulse particle flowing between Anchor and Positive
  const pulseGeo = new THREE.SphereGeometry(0.12, 10, 10);
  const pulseMat = new THREE.MeshBasicMaterial({ color: 0x34d399 });
  disposables.push(pulseGeo, pulseMat);
  const pulseMesh = new THREE.Mesh(pulseGeo, pulseMat);
  group.add(pulseMesh);

  // 5. Register Inspectable Items
  const inspectables: { mesh: THREE.Object3D; data: InspectableItem }[] = [
    {
      mesh: anchorMesh,
      data: {
        id: 'metric-anchor',
        name: 'Anchor Sample x',
        symbol: 'x',
        type: 'CONTRASTIVE ANCHOR',
        role: 'Reference Embedding Representation',
        dimension: 'Hyperspherical Vector x ∈ S²',
        properties: {
          'Norm ||x||': '1.0000 (Unit Norm L₂)',
          'InfoNCE Loss': 'ℒ_{InfoNCE} = -log[sim(x, x⁺) / Σ sim(x, x⁻)]',
          'Temperature τ': '0.070 (Optimal Sharpening)',
          'Topological Uniformity': '𝒰_{uniform} = 0.942',
        },
        description: 'Reference embedding vector projected onto the unit hypersphere. Contrastive InfoNCE learning attracts x towards its positive pair x⁺ while uniformly repelling all negative samples x⁻ across the spherical surface.',
        worldPosition: anchorPos.clone(),
      },
    },
    {
      mesh: posMesh,
      data: {
        id: 'metric-positive',
        name: 'Positive Pair x⁺',
        symbol: 'x⁺',
        type: 'POSITIVE PAIR',
        role: 'Semantically Aligned Representation',
        dimension: 'Geodesic Distance on S²',
        properties: {
          'Cosine Similarity': 'cos(x, x⁺) = +0.892',
          'Geodesic Arc d_g': '0.471 rad (Great Circle)',
          'Mutual Information': 'I(x; x⁺) ≥ log(K) - ℒ_{InfoNCE}',
          'Alignment Metric': '𝒪_{align} = E[||x - x⁺||²] = 0.052',
        },
        description: 'Augmented or semantically equivalent representation pair. Contrastive optimization minimizes the geodesic distance d_g(x, x⁺) along the Riemannian metric arc.',
        worldPosition: positivePos.clone(),
      },
    },
    {
      mesh: negMesh,
      data: {
        id: 'metric-negative',
        name: 'Negative Sample x⁻',
        symbol: 'x⁻',
        type: 'NEGATIVE SAMPLE',
        role: 'Contrastive Class Repulsion',
        dimension: 'Hyperspherical Uniformity Field',
        properties: {
          'Cosine Similarity': 'cos(x, x⁻) = -0.342',
          'Geodesic Arc d_g': '1.921 rad (Repulsive)',
          'Uniformity Loss': 'log E[exp(-2||x - x⁻||²)]',
          'Dimensional Collapse': 'Prevented (Hypersphere Full Capacity)',
        },
        description: 'Negative sample drawn from contrasting data classes. Repulsion prevents representation collapse by distributing embeddings uniformly across all spherical degrees of freedom.',
        worldPosition: negativePos.clone(),
      },
    },
    {
      mesh: centroidMeshes[0],
      data: {
        id: 'metric-cluster-0',
        name: 'Semantic Cluster 𝒞₀',
        symbol: '𝒞₀',
        type: 'EMBEDDING CLUSTER',
        role: 'High-Density Latent Centroid',
        dimension: `${pointsPerCluster} Embedded Points`,
        properties: {
          'Cluster Density': '0.845 pts / rad²',
          'Dispersion σ': '0.182 rad',
          'Singular Value Ratio': 'λ₁ / λ₂ = 1.14 (Isotropic)',
        },
        description: 'Dense neighborhood of semantic representations demonstrating natural geometric clustering without dimensional collapse on the unit hypersphere.',
        worldPosition: centroidMeshes[0].position.clone(),
      },
    },
  ];

  // Selection Handler
  const onSelectObject = (item: InspectableItem | null) => {
    const attrMat = attractiveArc.material as THREE.LineBasicMaterial;
    const repMat = repulsiveArc.material as THREE.LineBasicMaterial;

    if (!item) {
      attrMat.opacity = 0.9;
      repMat.opacity = 0.45;
      anchorMat.emissiveIntensity = 0.85;
      posMat.emissiveIntensity = 0.85;
      negMat.emissiveIntensity = 0.5;
    } else if (item.id === 'metric-anchor' || item.id === 'metric-positive') {
      attrMat.opacity = 1.0;
      repMat.opacity = 0.15;
      anchorMat.emissiveIntensity = 1.2;
      posMat.emissiveIntensity = 1.2;
    } else if (item.id === 'metric-negative') {
      attrMat.opacity = 0.2;
      repMat.opacity = 0.9;
      negMat.emissiveIntensity = 1.0;
    }
  };

  // Pre-allocated scratch vectors for zero GC in render loop
  const scratchPos = new THREE.Vector3();
  const v1 = anchorPos.clone().normalize();
  const v2 = positivePos.clone().normalize();
  const q1 = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(1, 0, 0), v1);
  const q2 = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(1, 0, 0), v2);
  const scratchQuat = new THREE.Quaternion();

  let pulseT = 0;
  const update = (time: number, delta: number) => {
    // Gentle rotation of the metric space
    sphereMesh.rotation.y += delta * 0.035;
    wireMesh.rotation.y += delta * 0.035;
    instancedPoints.rotation.y += delta * 0.035;

    // Pulse animation between Anchor and Positive
    pulseT = (pulseT + delta * 0.45) % 1.0;
    scratchQuat.copy(q1).slerp(q2, pulseT);
    scratchPos.set(1, 0, 0).applyQuaternion(scratchQuat).multiplyScalar(RADIUS + 0.1);
    pulseMesh.position.copy(scratchPos);

    // Dynamic scale breathing on anchor
    const scale = 1.0 + Math.sin(time * 2.4) * 0.08;
    anchorMesh.scale.set(scale, scale, scale);
  };

  const dispose = () => {
    disposables.forEach((d) => d.dispose());
  };

  return {
    group,
    update,
    dispose,
    defaultCameraPosition: [0, 2.2, 13.5],
    defaultTarget: [0, 0, 0],
    getInspectableObjects: () => inspectables,
    onSelectObject,
  };
}
