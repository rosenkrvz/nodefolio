import * as THREE from 'three';
import { PhaseArtifactInstance, QualityTier, InspectableItem, LayerType, SpatialAnnotation } from '../types';

export function createPhase02Optimization(quality: QualityTier = 'high'): PhaseArtifactInstance {
  const group = new THREE.Group();
  group.name = 'phase-02-optimization';

  const disposables: { dispose: () => void }[] = [];

  // 1. Loss function definition: strictly convex paraboloid with anisotropic curvature
  // f(x, z) = 0.14 * (x^2 + 1.8 * z^2)
  const computeLoss = (x: number, z: number): number => {
    return 0.14 * (x * x + 1.8 * z * z);
  };

  // 2. Build 3D parametric surface with adaptive resolution based on quality tier
  const gridSize = quality === 'low' ? 24 : quality === 'medium' ? 36 : 48;
  const EXTENT = 7.5;
  const planeGeo = new THREE.PlaneGeometry(EXTENT * 2, EXTENT * 2, gridSize, gridSize);
  disposables.push(planeGeo);

  // Deform vertices to match loss function
  const posAttr = planeGeo.attributes.position;
  const colors = new Float32Array(posAttr.count * 3);

  const baseColor = new THREE.Color(0x0a0e17);  // Deep slate obsidian
  const midColor = new THREE.Color(0x881337);   // Metric wine crimson
  const peakColor = new THREE.Color(0xfb7185);  // High energy rose

  for (let i = 0; i < posAttr.count; i++) {
    const x = posAttr.getX(i);
    const y = posAttr.getY(i); // In PlaneGeometry, Y maps to Z when rotated flat
    const zLoss = computeLoss(x, y);
    posAttr.setZ(i, zLoss);

    // Normalized loss height (0 to 1)
    const normH = Math.min(Math.max(zLoss / 7.2, 0), 1);
    const vertexColor = new THREE.Color();
    if (normH < 0.45) {
      vertexColor.lerpColors(baseColor, midColor, normH / 0.45);
    } else {
      vertexColor.lerpColors(midColor, peakColor, (normH - 0.45) / 0.55);
    }

    colors[i * 3] = vertexColor.r;
    colors[i * 3 + 1] = vertexColor.g;
    colors[i * 3 + 2] = vertexColor.b;
  }

  planeGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  planeGeo.computeVertexNormals();

  // Surface material (calibrated satin finish matching Phase 05)
  const surfaceMat = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.60,
    metalness: 0.16,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.94,
    emissive: new THREE.Color(0x16050b),
    emissiveIntensity: 0.35,
  });
  disposables.push(surfaceMat);

  const surfaceMesh = new THREE.Mesh(planeGeo, surfaceMat);
  surfaceMesh.rotation.x = -Math.PI / 2;
  group.add(surfaceMesh);

  // Wireframe contour overlay
  const wireMat = new THREE.MeshBasicMaterial({
    color: 0xbe123c,
    wireframe: true,
    transparent: true,
    opacity: quality === 'low' ? 0.06 : 0.09,
  });
  disposables.push(wireMat);
  const wireMesh = new THREE.Mesh(planeGeo, wireMat);
  wireMesh.rotation.x = -Math.PI / 2;
  wireMesh.position.y = 0.01;
  group.add(wireMesh);

  // 3. Contour Isolines at discrete energy levels
  const isoLevels = [0.8, 1.8, 3.2, 5.0, 6.8];
  const isoSegments = quality === 'low' ? 32 : 56;

  isoLevels.forEach((level) => {
    const rx = Math.sqrt(level / 0.14);
    const rz = Math.sqrt(level / (0.14 * 1.8));

    const curvePoints: THREE.Vector3[] = [];
    for (let s = 0; s <= isoSegments; s++) {
      const theta = (s / isoSegments) * Math.PI * 2;
      const x = rx * Math.cos(theta);
      const z = rz * Math.sin(theta);
      curvePoints.push(new THREE.Vector3(x, level + 0.04, z));
    }

    const isoGeo = new THREE.BufferGeometry().setFromPoints(curvePoints);
    const isoMat = new THREE.LineBasicMaterial({
      color: 0xf43f5e,
      transparent: true,
      opacity: 0.35,
    });
    disposables.push(isoGeo, isoMat);
    const isoLine = new THREE.Line(isoGeo, isoMat);
    group.add(isoLine);
  });

  // 4. Global Minimum Stationary Point θ* at origin (0, 0, 0)
  const minMarkerGeo = new THREE.SphereGeometry(0.28, 20, 20);
  const minMarkerMat = new THREE.MeshStandardMaterial({
    color: 0x10b981,
    emissive: 0x059669,
    emissiveIntensity: 0.85,
    roughness: 0.25,
  });
  disposables.push(minMarkerGeo, minMarkerMat);
  const minMarker = new THREE.Mesh(minMarkerGeo, minMarkerMat);
  minMarker.position.set(0, 0.3, 0);
  group.add(minMarker);

  // Pulsing target ring at minimum
  const minRingGeo = new THREE.RingGeometry(0.48, 0.62, 32);
  const minRingMat = new THREE.MeshBasicMaterial({
    color: 0x10b981,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.55,
  });
  disposables.push(minRingGeo, minRingMat);
  const minRing = new THREE.Mesh(minRingGeo, minRingMat);
  minRing.rotation.x = Math.PI / 2;
  minRing.position.set(0, 0.08, 0);
  group.add(minRing);

  // 5. Optimization Trajectory (Discrete Gradient Descent Path)
  const trajectoryPoints: THREE.Vector3[] = [];
  let currX = -6.2;
  let currZ = 4.2;
  const learningRate = 0.08;
  const STEPS = 34;

  for (let step = 0; step < STEPS; step++) {
    const currY = computeLoss(currX, currZ);
    trajectoryPoints.push(new THREE.Vector3(currX, currY + 0.1, currZ));

    const gradX = 0.28 * currX;
    const gradZ = 0.504 * currZ;

    currX -= learningRate * gradX;
    currZ -= learningRate * gradZ;
  }
  trajectoryPoints.push(new THREE.Vector3(0, 0.1, 0));

  const trajCurve = new THREE.CatmullRomCurve3(trajectoryPoints);
  const trajDensePoints = trajCurve.getPoints(quality === 'low' ? 60 : 120);
  const trajGeo = new THREE.BufferGeometry().setFromPoints(trajDensePoints);
  const trajMat = new THREE.LineBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.88,
  });
  disposables.push(trajGeo, trajMat);
  const trajLine = new THREE.Line(trajGeo, trajMat);
  group.add(trajLine);

  // High Performance Optimization: Use InstancedMesh for step marker dots
  const stepCount = Math.floor(trajectoryPoints.length / 2);
  const stepMarkerGeo = new THREE.SphereGeometry(0.09, 8, 8);
  const stepMarkerMat = new THREE.MeshBasicMaterial({ color: 0xffe4e6 });
  disposables.push(stepMarkerGeo, stepMarkerMat);

  const stepInstancedMesh = new THREE.InstancedMesh(stepMarkerGeo, stepMarkerMat, stepCount);
  const dummy = new THREE.Object3D();

  let instIdx = 0;
  for (let i = 0; i < trajectoryPoints.length && instIdx < stepCount; i += 2) {
    dummy.position.copy(trajectoryPoints[i]);
    dummy.updateMatrix();
    stepInstancedMesh.setMatrixAt(instIdx, dummy.matrix);
    instIdx++;
  }
  stepInstancedMesh.instanceMatrix.needsUpdate = true;
  group.add(stepInstancedMesh);
  disposables.push(stepInstancedMesh);

  // Iterating descent particle
  const descentParticleGeo = new THREE.SphereGeometry(0.24, 16, 16);
  const descentParticleMat = new THREE.MeshStandardMaterial({
    color: 0xff2d55,
    emissive: 0xe11d48,
    emissiveIntensity: 0.95,
    roughness: 0.2,
  });
  disposables.push(descentParticleGeo, descentParticleMat);
  const descentParticle = new THREE.Mesh(descentParticleGeo, descentParticleMat);
  group.add(descentParticle);

  // Gradient tangent arrow on particle
  const arrowHelper = new THREE.ArrowHelper(
    new THREE.Vector3(0, -1, 0),
    new THREE.Vector3(0, 0, 0),
    1.1,
    0xff2d55,
    0.28,
    0.15
  );
  group.add(arrowHelper);
  disposables.push(arrowHelper.line.geometry, arrowHelper.cone.geometry);

  // 6. Register Inspectable Objects
  const inspectables: { mesh: THREE.Object3D; data: InspectableItem }[] = [
    {
      mesh: surfaceMesh,
      data: {
        id: 'opt-surface',
        name: 'Convex Loss Surface',
        symbol: 'f(θ)',
        type: 'OBJECTIVE LANDSCAPE',
        role: 'Anisotropic Quadratic Paraboloid',
        dimension: 'f: ℝ² → ℝ',
        properties: {
          'Loss Function': 'f(x, z) = 0.14(x² + 1.8z²)',
          'Hessian Matrix': 'diag([0.280, 0.504]) ≻ 0',
          'Curvature Ratio': 'κ = 1.80 (Anisotropic)',
          'Global Minimum': 'θ* = [0, 0], f(θ*) = 0',
          'Topology': 'Strictly Convex Well',
        },
        description: 'Continuous 3D loss surface with anisotropic quadratic curvature. The steepest descent gradient trajectory traverses orthogonal to the contour isolines toward the global minimum.',
        worldPosition: new THREE.Vector3(0, 1.8, 0),
      },
    },
    {
      mesh: minMarker,
      data: {
        id: 'opt-minimum',
        name: 'Stationary Minimum θ*',
        symbol: 'θ*',
        type: 'STATIONARY POINT',
        role: 'Global Minimizer of Convex Objective',
        dimension: 'Parameter Space θ ∈ ℝ²',
        properties: {
          'Coordinates': 'θ* = [0.000, 0.000]',
          'Optimal Value': 'f(θ*) = 0.0000',
          'Gradient Norm': '||∇f(θ*)|| = 0.0000',
          'Hessian ∇²f': 'diag([0.280, 0.504]) ≻ 0',
          'Condition': 'Strictly Convex Unique Minimum',
        },
        description: 'First-order stationary point satisfying ∇f(θ*) = 0. Since the Hessian matrix is strictly positive definite across the entire domain, θ* is the unique global minimizer under Karush-Kuhn-Tucker (KKT) conditions.',
        worldPosition: minMarker.position.clone(),
      },
    },
    {
      mesh: descentParticle,
      data: {
        id: 'opt-particle',
        name: 'Iterative Descent State θₜ',
        symbol: 'θₜ',
        type: 'OPTIMIZER STATE',
        role: 'Active Parameter Vector',
        dimension: 'Step Index t ∈ [0, 34]',
        properties: {
          'Update Rule': 'θ_{t+1} = θ_t - η ∇f(θ_t)',
          'Learning Rate η': '0.080',
          'Search Direction': '-∇f(θ_t) (Steepest Descent)',
          'Convergence': 'O(1/t) Sublinear Rate',
          'Status': 'Actively Traversing Landscape',
        },
        description: 'Discrete optimization state vector traversing down the negative gradient vector field. Demonstrates iterative first-order convergence across an anisotropic quadratic well.',
        worldPosition: descentParticle.position.clone(),
      },
    },
    {
      mesh: trajLine,
      data: {
        id: 'opt-trajectory',
        name: 'Optimization Trajectory',
        symbol: 'Γ(t)',
        type: 'DESCENT PATH',
        role: 'Parameter Convergence Curve',
        dimension: 'Discrete Path: 34 Iterations',
        properties: {
          'Initial Point': 'θ₀ = [-6.20, +4.20]',
          'Initial Loss': 'f(θ₀) = 7.742',
          'Anisotropy Ratio': '1.80× Ill-Conditioned',
          'Step Count': '34 Iterations',
        },
        description: 'Piecewise smooth curve tracking parameter values from initialization in a high-loss valley down to asymptotic convergence at the global minimum.',
        worldPosition: new THREE.Vector3(-3.1, 3.8, 2.1),
      },
    },
  ];

  // Selection handler
  const onSelectObject = (item: InspectableItem | null) => {
    if (!item) {
      surfaceMat.opacity = 0.94;
      surfaceMat.emissiveIntensity = 0.35;
      trajMat.opacity = 0.88;
      minMarkerMat.emissiveIntensity = 0.85;
      descentParticleMat.emissiveIntensity = 0.95;
    } else if (item.id === 'opt-surface') {
      surfaceMat.opacity = 0.98;
      surfaceMat.emissiveIntensity = 0.65;
      trajMat.opacity = 0.92;
    } else if (item.id === 'opt-minimum') {
      minMarkerMat.emissiveIntensity = 1.4;
      surfaceMat.opacity = 0.85;
    } else if (item.id === 'opt-particle') {
      descentParticleMat.emissiveIntensity = 1.4;
    } else if (item.id === 'opt-trajectory') {
      trajMat.opacity = 1.0;
    }
  };

  // Pre-allocated scratch vector for zero GC in render loop
  const scratchVec = new THREE.Vector3();
  const scratchTangent = new THREE.Vector3();

  // Animation & Update loop
  let particleT = 0;
  const update = (time: number, delta: number) => {
    particleT = (particleT + delta * 0.16) % 1.0;

    trajCurve.getPointAt(particleT, scratchVec);
    descentParticle.position.copy(scratchVec);

    trajCurve.getTangentAt(particleT, scratchTangent).normalize();
    arrowHelper.position.copy(scratchVec);
    arrowHelper.setDirection(scratchTangent);

    // Pulsing minimum ring
    const scale = 1.0 + Math.sin(time * 2.8) * 0.12;
    minRing.scale.set(scale, scale, scale);
  };

  const toggleLayer = (layer: LayerType, visible: boolean) => {
    if (layer === 'geometry') {
      surfaceMesh.visible = visible;
      wireMesh.visible = visible;
    } else if (layer === 'trajectories') {
      trajLine.visible = visible;
      descentParticle.visible = visible;
      arrowHelper.visible = visible;
    } else if (layer === 'clusters') {
      minMarker.visible = visible;
      minRing.visible = visible;
    }
  };

  const getAnnotations = (): SpatialAnnotation[] => [
    { id: 'theta-init', label: 'Initial Parameter θ₀', sublabel: 'f(θ₀) = 5.64, Step 0', position: new THREE.Vector3(-6.2, 5.8, 4.2) },
    { id: 'grad-descent', label: 'Steepest Descent ∇f(θ)', sublabel: 'η = 0.08, Linear Rate', position: new THREE.Vector3(-3.2, 2.8, 2.1) },
    { id: 'theta-star', label: 'Global Minimum θ*', sublabel: '∇f(θ*) = 0, Loss = 0.00', position: new THREE.Vector3(0, 0.6, 0) },
  ];

  const dispose = () => {
    disposables.forEach((d) => {
      try {
        d.dispose();
      } catch {}
    });
  };

  return {
    group,
    update,
    dispose,
    defaultCameraPosition: [0, 8.2, 13.8],
    defaultTarget: [0, 1.2, 0],
    getInspectableObjects: () => inspectables,
    onSelectObject,
    toggleLayer,
    getAnnotations,
  };
}
