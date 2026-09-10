import * as THREE from 'three';
import { PhaseArtifactInstance } from '../types';

export function createPhase02Optimization(): PhaseArtifactInstance {
  const group = new THREE.Group();
  group.name = 'phase-02-optimization';

  const disposables: { dispose: () => void }[] = [];

  // 1. Loss function definition: strictly convex paraboloid with anisotropic curvature
  // f(x, z) = a*x^2 + b*z^2
  const computeLoss = (x: number, z: number): number => {
    return 0.14 * (x * x + 1.8 * z * z);
  };

  // 2. Build 3D parametric surface
  const GRID_SIZE = 48;
  const EXTENT = 8.0;
  const planeGeo = new THREE.PlaneGeometry(EXTENT * 2, EXTENT * 2, GRID_SIZE, GRID_SIZE);
  disposables.push(planeGeo);

  // Deform vertices to match loss function
  const posAttr = planeGeo.attributes.position;
  const colors = new Float32Array(posAttr.count * 3);

  const baseColor = new THREE.Color(0x0f172a); // Deep obsidian
  const midColor = new THREE.Color(0xbe123c);  // Crimson
  const peakColor = new THREE.Color(0xfb7185); // Light rose accent

  for (let i = 0; i < posAttr.count; i++) {
    const x = posAttr.getX(i);
    const y = posAttr.getY(i); // In PlaneGeometry, Y will map to Z when rotated
    const zLoss = computeLoss(x, y);
    posAttr.setZ(i, zLoss);

    // Vertex color based on loss height (normalized 0 to 1)
    const normH = Math.min(Math.max(zLoss / 8.0, 0), 1);
    const vertexColor = new THREE.Color();
    if (normH < 0.5) {
      vertexColor.lerpColors(baseColor, midColor, normH * 2.0);
    } else {
      vertexColor.lerpColors(midColor, peakColor, (normH - 0.5) * 2.0);
    }

    colors[i * 3] = vertexColor.r;
    colors[i * 3 + 1] = vertexColor.g;
    colors[i * 3 + 2] = vertexColor.b;
  }

  planeGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  planeGeo.computeVertexNormals();

  // Surface material
  const surfaceMat = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.35,
    metalness: 0.6,
    side: THREE.DoubleSide,
    wireframe: false,
    transparent: true,
    opacity: 0.92,
  });
  disposables.push(surfaceMat);

  const surfaceMesh = new THREE.Mesh(planeGeo, surfaceMat);
  surfaceMesh.rotation.x = -Math.PI / 2; // Lie flat in XZ plane, height in Y
  group.add(surfaceMesh);

  // Wireframe contour overlay
  const wireMat = new THREE.MeshBasicMaterial({
    color: 0xe11d48,
    wireframe: true,
    transparent: true,
    opacity: 0.22,
  });
  disposables.push(wireMat);
  const wireMesh = new THREE.Mesh(planeGeo, wireMat);
  wireMesh.rotation.x = -Math.PI / 2;
  wireMesh.position.y = 0.02; // avoid z-fighting
  group.add(wireMesh);

  // 3. Contour Isolines at discrete energy levels
  const isoLevels = [0.8, 1.8, 3.2, 5.0, 7.2];
  isoLevels.forEach((level) => {
    const rx = Math.sqrt(level / 0.14);
    const rz = Math.sqrt(level / (0.14 * 1.8));

    const curvePoints: THREE.Vector3[] = [];
    const SEGMENTS = 64;
    for (let s = 0; s <= SEGMENTS; s++) {
      const theta = (s / SEGMENTS) * Math.PI * 2;
      const x = rx * Math.cos(theta);
      const z = rz * Math.sin(theta);
      curvePoints.push(new THREE.Vector3(x, level + 0.05, z));
    }

    const isoGeo = new THREE.BufferGeometry().setFromPoints(curvePoints);
    const isoMat = new THREE.LineBasicMaterial({
      color: 0xf43f5e,
      transparent: true,
      opacity: 0.45,
    });
    disposables.push(isoGeo, isoMat);
    const isoLine = new THREE.Line(isoGeo, isoMat);
    group.add(isoLine);
  });

  // 4. Global Minimum Stationary Point θ* at origin (0, 0, 0)
  const minMarkerGeo = new THREE.SphereGeometry(0.28, 20, 20);
  const minMarkerMat = new THREE.MeshStandardMaterial({
    color: 0x10b981, // Emerald stationary point
    emissive: 0x059669,
    emissiveIntensity: 0.8,
    roughness: 0.2,
  });
  disposables.push(minMarkerGeo, minMarkerMat);
  const minMarker = new THREE.Mesh(minMarkerGeo, minMarkerMat);
  minMarker.position.set(0, 0.3, 0);
  group.add(minMarker);

  // Pulsing target ring at minimum
  const minRingGeo = new THREE.RingGeometry(0.5, 0.65, 32);
  const minRingMat = new THREE.MeshBasicMaterial({
    color: 0x10b981,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.5,
  });
  disposables.push(minRingGeo, minRingMat);
  const minRing = new THREE.Mesh(minRingGeo, minRingMat);
  minRing.rotation.x = Math.PI / 2;
  minRing.position.set(0, 0.08, 0);
  group.add(minRing);

  // 5. Optimization Trajectory (Gradient Descent Path)
  // Compute discrete iterative descent steps: x_{t+1} = x_t - η ∇f(x_t)
  const trajectoryPoints: THREE.Vector3[] = [];
  let currX = -6.8;
  let currZ = 4.8;
  const learningRate = 0.08;
  const STEPS = 36;

  for (let step = 0; step < STEPS; step++) {
    const currY = computeLoss(currX, currZ);
    trajectoryPoints.push(new THREE.Vector3(currX, currY + 0.12, currZ));

    // Gradient: [∂f/∂x = 0.28*x, ∂f/∂z = 0.504*z]
    const gradX = 0.28 * currX;
    const gradZ = 0.504 * currZ;

    currX -= learningRate * gradX;
    currZ -= learningRate * gradZ;
  }
  // Clamp final point to minimum
  trajectoryPoints.push(new THREE.Vector3(0, 0.12, 0));

  const trajCurve = new THREE.CatmullRomCurve3(trajectoryPoints);
  const trajDensePoints = trajCurve.getPoints(120);
  const trajGeo = new THREE.BufferGeometry().setFromPoints(trajDensePoints);
  const trajMat = new THREE.LineBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.85,
  });
  disposables.push(trajGeo, trajMat);
  const trajLine = new THREE.Line(trajGeo, trajMat);
  group.add(trajLine);

  // Step vector tick markers along the trajectory
  const stepMarkerGeo = new THREE.SphereGeometry(0.1, 10, 10);
  const stepMarkerMat = new THREE.MeshBasicMaterial({ color: 0xffe4e6 });
  disposables.push(stepMarkerGeo, stepMarkerMat);

  trajectoryPoints.forEach((pt, i) => {
    if (i % 3 === 0) {
      const dot = new THREE.Mesh(stepMarkerGeo, stepMarkerMat);
      dot.position.copy(pt);
      group.add(dot);
    }
  });

  // Iterating particle traversing the descent path
  const descentParticleGeo = new THREE.SphereGeometry(0.24, 16, 16);
  const descentParticleMat = new THREE.MeshStandardMaterial({
    color: 0xff2d55,
    emissive: 0xe11d48,
    emissiveIntensity: 0.9,
    roughness: 0.1,
  });
  disposables.push(descentParticleGeo, descentParticleMat);
  const descentParticle = new THREE.Mesh(descentParticleGeo, descentParticleMat);
  group.add(descentParticle);

  // 6. Tangent gradient vector arrow on the active particle
  const arrowDir = new THREE.Vector3(0, -1, 0);
  const arrowHelper = new THREE.ArrowHelper(arrowDir, new THREE.Vector3(0, 0, 0), 1.2, 0xff2d55, 0.3, 0.18);
  group.add(arrowHelper);
  disposables.push(arrowHelper.line.geometry, arrowHelper.cone.geometry);

  // Update loop
  let particleT = 0;
  const update = (time: number, delta: number) => {
    // Traverse trajectory from t = 0 (high loss) to t = 1 (convergence)
    particleT = (particleT + delta * 0.18) % 1.0;

    const pt = trajCurve.getPointAt(particleT);
    descentParticle.position.copy(pt);

    // Tangent gradient vector
    const tangent = trajCurve.getTangentAt(particleT).normalize();
    arrowHelper.position.copy(pt);
    arrowHelper.setDirection(tangent);

    // Pulsing minimum ring
    const scale = 1.0 + Math.sin(time * 3.0) * 0.15;
    minRing.scale.set(scale, scale, scale);
  };

  const dispose = () => {
    disposables.forEach((d) => d.dispose());
  };

  return {
    group,
    update,
    dispose,
    defaultCameraPosition: [0, 9, 13],
    defaultTarget: [0, 1.5, 0],
  };
}
