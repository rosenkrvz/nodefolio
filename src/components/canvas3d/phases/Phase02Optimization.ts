import * as THREE from 'three';
import { PhaseArtifactInstance, QualityTier, InspectableItem, LayerType, SpatialAnnotation } from '../types';

export function createPhase02Optimization(quality: QualityTier = 'high'): PhaseArtifactInstance {
  const group = new THREE.Group();
  group.name = 'phase-02-optimization';

  const disposables: { dispose: () => void }[] = [];

  // =========================================================================
  // 1. Strictly Convex Anisotropic Loss Landscape
  // f(x, z) = 0.08 * (x^2 + 1.6 * z^2)
  // Well-conditioned in X, steeper in Z (Condition Number κ = 1.60)
  // =========================================================================
  const computeLoss = (x: number, z: number): number => {
    return 0.08 * (x * x + 1.6 * z * z);
  };

  const computeGradient = (x: number, z: number): { gx: number; gz: number } => {
    return {
      gx: 0.16 * x,
      gz: 0.256 * z,
    };
  };

  // 2. Continuous Paraboloid Surface Geometry (Pre-rotated so world space Y is UP)
  const gridSize = quality === 'low' ? 28 : quality === 'medium' ? 40 : 54;
  const EXTENT = 6.2;
  const planeGeo = new THREE.PlaneGeometry(EXTENT * 2, EXTENT * 2, gridSize, gridSize);
  planeGeo.rotateX(-Math.PI / 2);
  disposables.push(planeGeo);

  const posAttr = planeGeo.attributes.position;
  const colors = new Float32Array(posAttr.count * 3);

  const baseColor = new THREE.Color(0x060911);   // Deep obsidian minimum basin
  const midColor = new THREE.Color(0x881337);    // Crimson curvature midtone
  const peakColor = new THREE.Color(0xf43f5e);   // High-loss rose ridge

  for (let i = 0; i < posAttr.count; i++) {
    const x = posAttr.getX(i);
    const z = posAttr.getZ(i);
    const yLoss = computeLoss(x, z);
    posAttr.setY(i, yLoss);

    // Radial distance for soft boundary edge roll-off
    const rDist = Math.sqrt(x * x + z * z) / (EXTENT * 1.25);
    const edgeFade = 1.0 - Math.pow(Math.min(rDist, 1.0), 3.0);

    const normH = Math.min(Math.max(yLoss / 4.6, 0), 1);
    const vertexColor = new THREE.Color();
    if (normH < 0.45) {
      vertexColor.lerpColors(baseColor, midColor, normH / 0.45);
    } else {
      vertexColor.lerpColors(midColor, peakColor, (normH - 0.45) / 0.55);
    }
    vertexColor.multiplyScalar(0.45 + 0.55 * edgeFade);

    colors[i * 3] = vertexColor.r;
    colors[i * 3 + 1] = vertexColor.g;
    colors[i * 3 + 2] = vertexColor.b;
  }

  planeGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  planeGeo.computeVertexNormals();
  planeGeo.computeBoundingSphere();
  planeGeo.computeBoundingBox();

  const surfaceMat = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.55,
    metalness: 0.18,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.94,
    depthWrite: true,
    emissive: new THREE.Color(0x16050b),
    emissiveIntensity: 0.35,
  });
  disposables.push(surfaceMat);

  const surfaceMesh = new THREE.Mesh(planeGeo, surfaceMat);
  surfaceMesh.frustumCulled = false;
  group.add(surfaceMesh);

  // Wireframe lattice overlay
  const wireMat = new THREE.MeshBasicMaterial({
    color: 0xbe123c,
    wireframe: true,
    transparent: true,
    opacity: quality === 'low' ? 0.05 : 0.08,
  });
  disposables.push(wireMat);
  const wireMesh = new THREE.Mesh(planeGeo, wireMat);
  wireMesh.position.y = 0.005;
  group.add(wireMesh);

  // =========================================================================
  // 3. Level-Set Contour Isolines & Orthogonal Gradient Ticks
  // =========================================================================
  const isoGroup = new THREE.Group();
  group.add(isoGroup);

  const isoLevels = [0.4, 1.0, 1.8, 2.8, 3.8];
  const isoSegments = quality === 'low' ? 36 : 64;

  isoLevels.forEach((level) => {
    const rx = Math.sqrt(level / 0.08);
    const rz = Math.sqrt(level / (0.08 * 1.6));

    const curvePoints: THREE.Vector3[] = [];
    for (let s = 0; s <= isoSegments; s++) {
      const theta = (s / isoSegments) * Math.PI * 2;
      const x = rx * Math.cos(theta);
      const z = rz * Math.sin(theta);
      curvePoints.push(new THREE.Vector3(x, level + 0.02, z));
    }

    const isoGeo = new THREE.BufferGeometry().setFromPoints(curvePoints);
    const isoMat = new THREE.LineBasicMaterial({
      color: 0xf43f5e,
      transparent: true,
      opacity: 0.45,
    });
    disposables.push(isoGeo, isoMat);
    const isoLine = new THREE.Line(isoGeo, isoMat);
    isoGroup.add(isoLine);
  });



  // =========================================================================
  // 5. Global Unconstrained Minimum θ* at origin (0, 0, 0)
  // =========================================================================
  const minMarkerGeo = new THREE.SphereGeometry(0.24, 20, 20);
  const minMarkerMat = new THREE.MeshStandardMaterial({
    color: 0x10b981,
    emissive: 0x059669,
    emissiveIntensity: 0.9,
    roughness: 0.2,
  });
  disposables.push(minMarkerGeo, minMarkerMat);
  const minMarker = new THREE.Mesh(minMarkerGeo, minMarkerMat);
  minMarker.position.set(0, 0.16, 0);
  group.add(minMarker);

  // Pulsing target ring at global minimum
  const minRingGeo = new THREE.RingGeometry(0.42, 0.54, 32);
  const minRingMat = new THREE.MeshBasicMaterial({
    color: 0x10b981,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.6,
  });
  disposables.push(minRingGeo, minRingMat);
  const minRing = new THREE.Mesh(minRingGeo, minRingMat);
  minRing.rotation.x = Math.PI / 2;
  minRing.position.set(0, 0.05, 0);
  group.add(minRing);

  // Hessian Curvature Principal Axes (Eigenvectors at Minimum)
  const hessianAxisXGeo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(-1.8, 0.04, 0),
    new THREE.Vector3(1.8, 0.04, 0),
  ]);
  const hessianAxisZGeo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 0.04, -1.4),
    new THREE.Vector3(0, 0.04, 1.4),
  ]);
  const hessianMat = new THREE.LineBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.5 });
  disposables.push(hessianAxisXGeo, hessianAxisZGeo, hessianMat);
  group.add(new THREE.Line(hessianAxisXGeo, hessianMat));
  group.add(new THREE.Line(hessianAxisZGeo, hessianMat));

  // =========================================================================
  // 6. Dual Optimization Trajectories:
  // Path A: Oscillating Vanilla SGD (No Momentum, bounces across steep valley)
  // Path B: Accelerated Momentum / Nesterov (Damped, fast direct descent)
  // =========================================================================
  // Path A: Vanilla SGD
  const sgdPoints: THREE.Vector3[] = [];
  let sgdX = -4.8;
  let sgdZ = 3.6;
  const sgdLR = 0.11;
  for (let s = 0; s < 28; s++) {
    const y = computeLoss(sgdX, sgdZ);
    sgdPoints.push(new THREE.Vector3(sgdX, y + 0.06, sgdZ));
    const { gx, gz } = computeGradient(sgdX, sgdZ);
    sgdX -= sgdLR * gx;
    sgdZ -= sgdLR * gz;
  }
  const sgdCurve = new THREE.CatmullRomCurve3(sgdPoints);
  const sgdGeo = new THREE.BufferGeometry().setFromPoints(sgdCurve.getPoints(quality === 'low' ? 50 : 90));
  const sgdMat = new THREE.LineBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.65 });
  disposables.push(sgdGeo, sgdMat);
  const sgdLine = new THREE.Line(sgdGeo, sgdMat);
  group.add(sgdLine);

  // Path B: Momentum Accelerated Gradient Descent (Primary Focus)
  const momPoints: THREE.Vector3[] = [];
  let momX = -4.8;
  let momZ = 3.6;
  let vx = 0;
  let vz = 0;
  const momBeta = 0.72;
  const momLR = 0.09;
  for (let s = 0; s < 32; s++) {
    const y = computeLoss(momX, momZ);
    momPoints.push(new THREE.Vector3(momX, y + 0.07, momZ));
    const { gx, gz } = computeGradient(momX, momZ);
    vx = momBeta * vx - momLR * gx;
    vz = momBeta * vz - momLR * gz;
    momX += vx;
    momZ += vz;
  }
  momPoints.push(new THREE.Vector3(0, 0.08, 0));

  const momCurve = new THREE.CatmullRomCurve3(momPoints);
  const momTubeGeo = new THREE.TubeGeometry(momCurve, quality === 'low' ? 60 : 100, 0.038, 6, false);
  const momTubeMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0x10b981,
    emissiveIntensity: 0.9,
    roughness: 0.2,
  });
  disposables.push(momTubeGeo, momTubeMat);
  const momTubeMesh = new THREE.Mesh(momTubeGeo, momTubeMat);
  group.add(momTubeMesh);

  // Iterating descent particle along Momentum trajectory
  const descentParticleGeo = new THREE.SphereGeometry(0.18, 16, 16);
  const descentParticleMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0x10b981,
    emissiveIntensity: 1.0,
    roughness: 0.2,
  });
  disposables.push(descentParticleGeo, descentParticleMat);
  const descentParticle = new THREE.Mesh(descentParticleGeo, descentParticleMat);
  group.add(descentParticle);

  const descentArrow = new THREE.ArrowHelper(
    new THREE.Vector3(0, -1, 0),
    new THREE.Vector3(0, 0, 0),
    0.95,
    0x10b981,
    0.22,
    0.12
  );
  group.add(descentArrow);
  disposables.push(descentArrow.line.geometry, descentArrow.cone.geometry);

  // =========================================================================
  // 7. Register Inspectables
  // =========================================================================
  const inspectables: { mesh: THREE.Object3D; data: InspectableItem }[] = [
    {
      mesh: surfaceMesh,
      data: {
        id: 'opt-surface',
        name: 'Convex Loss Landscape f(θ)',
        symbol: 'f(θ)',
        type: 'OBJECTIVE LANDSCAPE',
        role: 'Anisotropic Quadratic Well',
        dimension: 'Parameter Space θ ∈ ℝ²',
        properties: {
          'Loss Function': 'f(x, z) = 0.08(x² + 1.6z²)',
          'Hessian Matrix ∇²f': 'diag([0.160, 0.256]) ≻ 0',
          'Condition Number κ': '1.60 (Ill-Conditioned Valley)',
          'Strong Convexity': 'α = 0.160, L = 0.256',
          'Global Optimum': 'θ* = (0, 0), f(θ*) = 0',
        },
        description: 'Strictly convex loss basin with anisotropic quadratic curvature. Demonstrates why standard SGD oscillates along steep valley walls while Polyak momentum accelerates convergence down the central ridge.',
        worldPosition: new THREE.Vector3(0, 1.8, 0),
      },
    },
    {
      mesh: minMarker,
      data: {
        id: 'opt-minimum',
        name: 'Global Stationary Minimum θ*',
        symbol: 'θ*',
        type: 'STATIONARY POINT',
        role: 'Unconstrained Minimizer',
        dimension: '∇f(θ*) = 0',
        properties: {
          'Coordinates': 'θ* = (0.000, 0.000)',
          'Optimal Loss': 'f(θ*) = 0.0000',
          'Gradient Norm': '||∇f(θ*)|| = 0.000',
          'Curvature Ratio': 'Hessian Eigenvalues: [0.16, 0.256]',
          'Uniqueness': 'Strictly Convex (Unique Global Minimum)',
        },
        description: 'Global stationary point where the gradient identically vanishes. In convex optimization, every local minimum is guaranteed to be a global minimum.',
        worldPosition: minMarker.position.clone(),
      },
    },
    {
      mesh: momTubeMesh,
      data: {
        id: 'opt-momentum-traj',
        name: 'Momentum Accelerated Trajectory',
        symbol: 'v_t = β v_{t-1} - η ∇f',
        type: 'OPTIMIZER DYNAMICS',
        role: 'Heavy-Ball Accelerated Path',
        dimension: 'Convergence: O(1/t²)',
        properties: {
          'Momentum Coefficient β': '0.720',
          'Learning Rate η': '0.090',
          'Oscillation Damping': 'Damped across High-Curvature Axis',
          'Comparison': 'Vanilla SGD (Amber) vs Momentum (Emerald)',
        },
        description: 'Polyak heavy-ball momentum trajectory effectively damping transverse oscillations across the high-curvature axis while accumulating velocity down the principal descent ravine.',
        worldPosition: new THREE.Vector3(-2.4, 1.8, 1.8),
      },
    },
  ];

  // Selection handler
  const onSelectObject = (item: InspectableItem | null) => {
    if (!item) {
      surfaceMat.opacity = 0.94;
      momTubeMat.emissiveIntensity = 0.9;
      minMarkerMat.emissiveIntensity = 0.9;
    } else if (item.id === 'opt-surface') {
      surfaceMat.opacity = 0.98;
    } else if (item.id === 'opt-minimum') {
      minMarkerMat.emissiveIntensity = 1.4;
    } else if (item.id === 'opt-momentum-traj') {
      momTubeMat.emissiveIntensity = 1.4;
    }
  };

  const scratchPos = new THREE.Vector3();
  const scratchTan = new THREE.Vector3();
  let progress = 0;

  const update = (time: number, delta: number) => {
    progress = (progress + delta * 0.15) % 1.0;

    momCurve.getPointAt(progress, scratchPos);
    momCurve.getTangentAt(progress, scratchTan);

    if (isFinite(scratchPos.x) && isFinite(scratchPos.y) && isFinite(scratchPos.z)) {
      descentParticle.position.copy(scratchPos);
      descentArrow.position.copy(scratchPos);
    }

    if (
      isFinite(scratchTan.x) &&
      isFinite(scratchTan.y) &&
      isFinite(scratchTan.z) &&
      scratchTan.lengthSq() > 0.0001
    ) {
      scratchTan.normalize();
      if (Math.abs(scratchTan.y) > 0.999) {
        descentArrow.quaternion.set(0, 0, 0, 1);
      } else {
        descentArrow.setDirection(scratchTan);
      }
    }

    // Pulsing minimum ring
    const s = 1.0 + Math.sin(time * 2.8) * 0.12;
    minRing.scale.set(s, s, s);
  };

  const toggleLayer = (layer: LayerType, visible: boolean) => {
    if (layer === 'geometry') {
      surfaceMesh.visible = visible;
      wireMesh.visible = visible;
      isoGroup.visible = visible;
    } else if (layer === 'trajectories') {
      sgdLine.visible = visible;
      momTubeMesh.visible = visible;
      descentParticle.visible = visible;
      descentArrow.visible = visible;
    } else if (layer === 'clusters') {
      minMarker.visible = visible;
      minRing.visible = visible;
    }
  };

  const getAnnotations = (): SpatialAnnotation[] => [
    { id: 'theta-init', label: 'Initial Point θ₀', sublabel: 'f(θ₀) = 3.92, Step 0', position: new THREE.Vector3(-4.8, 4.2, 3.6) },
    { id: 'sgd-path', label: 'Vanilla SGD (No Momentum)', sublabel: 'Transverse Ravine Oscillation', position: new THREE.Vector3(-3.2, 2.8, 2.2) },
    { id: 'theta-star', label: 'Global Minimum θ*', sublabel: '∇f(θ*) = 0, Loss = 0.00', position: new THREE.Vector3(0, 0.45, 0) },
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
    defaultCameraPosition: [0, 5.2, 9.6],
    defaultTarget: [0, 1.8, 0],
    getInspectableObjects: () => inspectables,
    onSelectObject,
    toggleLayer,
    getAnnotations,
  };
}
