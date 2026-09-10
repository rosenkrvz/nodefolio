import * as THREE from 'three';
import { PhaseArtifactInstance } from '../types';

interface AttentionBeam {
  qIdx: number;
  kIdx: number;
  weight: number;
  line: THREE.Line;
  curve: THREE.LineCurve3;
}

export function createPhase04Attention(): PhaseArtifactInstance {
  const group = new THREE.Group();
  group.name = 'phase-04-attention';

  const disposables: { dispose: () => void }[] = [];

  const NUM_TOKENS = 6;
  const SPACING = 2.2;
  const X_OFFSET = -((NUM_TOKENS - 1) * SPACING) / 2;

  // 1. Query Tokens Layer (Top Plane, Y = 2.4)
  const qGroup = new THREE.Group();
  const qPositions: THREE.Vector3[] = [];
  const tokenBoxGeo = new THREE.BoxGeometry(0.8, 0.35, 0.8);
  disposables.push(tokenBoxGeo);

  const qMat = new THREE.MeshStandardMaterial({
    color: 0xe11d48,
    roughness: 0.25,
    metalness: 0.7,
    emissive: 0xbe123c,
    emissiveIntensity: 0.6,
  });
  disposables.push(qMat);

  for (let i = 0; i < NUM_TOKENS; i++) {
    const x = X_OFFSET + i * SPACING;
    const pos = new THREE.Vector3(x, 2.5, 0);
    qPositions.push(pos);

    const box = new THREE.Mesh(tokenBoxGeo, qMat);
    box.position.copy(pos);
    qGroup.add(box);

    // Frame outline
    const wireGeo = new THREE.WireframeGeometry(tokenBoxGeo);
    const wireMat = new THREE.LineBasicMaterial({ color: 0xff4d6d });
    disposables.push(wireGeo, wireMat);
    const wire = new THREE.LineSegments(wireGeo, wireMat);
    wire.position.copy(pos);
    qGroup.add(wire);
  }
  group.add(qGroup);

  // 2. Key / Value Tokens Layer (Bottom Plane, Y = -2.4)
  const kGroup = new THREE.Group();
  const kPositions: THREE.Vector3[] = [];
  const kMat = new THREE.MeshStandardMaterial({
    color: 0x3b82f6,
    roughness: 0.25,
    metalness: 0.7,
    emissive: 0x1d4ed8,
    emissiveIntensity: 0.45,
  });
  disposables.push(kMat);

  for (let j = 0; j < NUM_TOKENS; j++) {
    const x = X_OFFSET + j * SPACING;
    const pos = new THREE.Vector3(x, -2.5, 0);
    kPositions.push(pos);

    const box = new THREE.Mesh(tokenBoxGeo, kMat);
    box.position.copy(pos);
    kGroup.add(box);

    const wireGeo = new THREE.WireframeGeometry(tokenBoxGeo);
    const wireMat = new THREE.LineBasicMaterial({ color: 0x60a5fa });
    disposables.push(wireGeo, wireMat);
    const wire = new THREE.LineSegments(wireGeo, wireMat);
    wire.position.copy(pos);
    kGroup.add(wire);
  }
  group.add(kGroup);

  // 3. Synthetic Attention Matrix (Softmax-like distribution: concentrated on diagonals and key semantic tokens)
  const beams: AttentionBeam[] = [];
  const beamGroup = new THREE.Group();
  group.add(beamGroup);

  for (let q = 0; q < NUM_TOKENS; q++) {
    for (let k = 0; k < NUM_TOKENS; k++) {
      // Softmax affinity formula: high for self-attention diagonal (k == q) and context neighbors
      const dist = Math.abs(q - k);
      let weight = Math.exp(-dist * 0.9);
      if (k === 1 && q > 2) weight += 0.45; // Context salient token
      weight = Math.min(weight, 1.0);

      const qPos = qPositions[q];
      const kPos = kPositions[k];

      const curve = new THREE.LineCurve3(qPos, kPos);
      const points = curve.getPoints(12);
      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
      disposables.push(lineGeo);

      const isHighAttention = weight > 0.4;
      const lineMat = new THREE.LineBasicMaterial({
        color: isHighAttention ? 0xf43f5e : 0x334155,
        transparent: true,
        opacity: Math.max(weight * 0.8, 0.08),
      });
      disposables.push(lineMat);

      const line = new THREE.Line(lineGeo, lineMat);
      beamGroup.add(line);

      beams.push({ qIdx: q, kIdx: k, weight, line, curve });
    }
  }

  // 4. Dynamic routing pulse particles along high-attention beams
  const activeBeams = beams.filter((b) => b.weight > 0.45);
  const pulseGeo = new THREE.SphereGeometry(0.1, 8, 8);
  const pulseMat = new THREE.MeshBasicMaterial({ color: 0xff3b5c });
  disposables.push(pulseGeo, pulseMat);

  const pulses: { beam: AttentionBeam; t: number; speed: number; mesh: THREE.Mesh }[] = [];
  activeBeams.forEach((beam) => {
    const pMesh = new THREE.Mesh(pulseGeo, pulseMat);
    group.add(pMesh);
    pulses.push({
      beam,
      t: Math.random(),
      speed: 0.4 + Math.random() * 0.3,
      mesh: pMesh,
    });
  });

  // 5. Surrounding Tiling & KV-Cache boundary frames
  const frameGeo = new THREE.BoxGeometry(NUM_TOKENS * SPACING + 1.2, 0.08, 2.0);
  const frameMat = new THREE.MeshBasicMaterial({
    color: 0x475569,
    transparent: true,
    opacity: 0.25,
    wireframe: true,
  });
  disposables.push(frameGeo, frameMat);

  const topSram = new THREE.Mesh(frameGeo, frameMat);
  topSram.position.set(0, 3.1, 0);
  group.add(topSram);

  const botSram = new THREE.Mesh(frameGeo, frameMat);
  botSram.position.set(0, -3.1, 0);
  group.add(botSram);

  // Update loop
  const update = (time: number, delta: number) => {
    // Gentle rotation of the entire kernel structure
    group.rotation.y = Math.sin(time * 0.3) * 0.18;

    // Pulse particles flowing between Query and Key tokens
    pulses.forEach((p) => {
      p.t = (p.t + delta * p.speed) % 1.0;
      const pt = p.beam.curve.getPoint(p.t);
      p.mesh.position.copy(pt);
      const scale = 0.8 + Math.sin(p.t * Math.PI) * 0.6;
      p.mesh.scale.set(scale, scale, scale);
    });

    // Subtly modulate beam opacities
    activeBeams.forEach((b, idx) => {
      const mat = b.line.material as THREE.LineBasicMaterial;
      mat.opacity = 0.4 + Math.sin(time * 2.0 + idx) * 0.35;
    });
  };

  const dispose = () => {
    disposables.forEach((d) => d.dispose());
  };

  return {
    group,
    update,
    dispose,
    defaultCameraPosition: [0, 1.2, 13],
    defaultTarget: [0, 0, 0],
  };
}
