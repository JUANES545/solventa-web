import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  effect,
  inject,
} from '@angular/core';
import * as THREE from 'three';
import { ThemePreference } from '../../models/domain.models';
import { ThemeService } from '../../core/theme.service';

interface AmbientOrb {
  group: THREE.Group;
  normalizedX: number;
  normalizedY: number;
  depth: number;
  scale: number;
  phase: number;
  basePosition: THREE.Vector3;
}

@Component({
  selector: 'app-ambient-background',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<canvas #canvas class="ambient-background-canvas" aria-hidden="true"></canvas>`,
})
export class AmbientBackgroundComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas', { static: true }) private canvasRef!: ElementRef<HTMLCanvasElement>;

  private readonly theme = inject(ThemeService);
  private readonly flowScene = new THREE.Scene();
  private readonly orbScene = new THREE.Scene();
  private readonly flowCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  private readonly orbCamera = new THREE.PerspectiveCamera(42, 1, 0.1, 40);
  private readonly orbGroup = new THREE.Group();
  private readonly timer = new THREE.Timer();
  private readonly pointer = new THREE.Vector2();
  private readonly pointerTarget = new THREE.Vector2();
  private readonly systemThemeQuery = this.createMediaQuery('(prefers-color-scheme: dark)');
  private readonly motionQuery = this.createMediaQuery('(prefers-reduced-motion: reduce)');
  private readonly orbs: AmbientOrb[] = [];

  private renderer?: THREE.WebGLRenderer;
  private flowMaterial?: THREE.ShaderMaterial;
  private orbMaterial?: THREE.ShaderMaterial;
  private particleMaterial?: THREE.PointsMaterial;
  private frameId?: number;
  private darkMode = false;
  private scrollTarget = 0;
  private lastFrameAt = 0;
  private viewHalfWidth = 1;
  private viewHalfHeight = 1;

  private readonly onPointerMove = (event: PointerEvent): void => {
    this.pointerTarget.set(
      (event.clientX / Math.max(window.innerWidth, 1)) * 2 - 1,
      -(event.clientY / Math.max(window.innerHeight, 1)) * 2 + 1,
    );
  };

  private readonly onPointerLeave = (): void => {
    this.pointerTarget.set(0, 0);
  };

  private readonly onScroll = (): void => {
    this.scrollTarget = window.scrollY / Math.max(window.innerHeight, 1);
  };

  private readonly onResize = (): void => this.resize();

  private readonly onVisibilityChange = (): void => {
    if (document.hidden) this.stopAnimation();
    else this.startAnimation();
  };

  private readonly onSystemThemeChange = (): void => {
    if (this.theme.preference() !== 'system') return;
    this.darkMode = Boolean(this.systemThemeQuery?.matches);
    this.applyTheme(true);
  };

  constructor() {
    effect(() => {
      const preference = this.theme.preference();
      this.darkMode = this.resolveDarkMode(preference);
      this.applyTheme(Boolean(this.renderer));
    });
  }

  ngAfterViewInit(): void {
    try {
      this.createScene();
      this.timer.connect(document);
      window.addEventListener('pointermove', this.onPointerMove, { passive: true });
      document.documentElement.addEventListener('mouseleave', this.onPointerLeave);
      window.addEventListener('blur', this.onPointerLeave);
      window.addEventListener('scroll', this.onScroll, { passive: true });
      window.addEventListener('resize', this.onResize, { passive: true });
      document.addEventListener('visibilitychange', this.onVisibilityChange);
      this.systemThemeQuery?.addEventListener('change', this.onSystemThemeChange);
      this.motionQuery?.addEventListener('change', this.onMotionPreferenceChange);
      this.resize();
      this.onScroll();
      this.startAnimation();
    } catch {
      this.renderer?.dispose();
      this.renderer = undefined;
    }
  }

  ngOnDestroy(): void {
    this.stopAnimation();
    window.removeEventListener('pointermove', this.onPointerMove);
    document.documentElement.removeEventListener('mouseleave', this.onPointerLeave);
    window.removeEventListener('blur', this.onPointerLeave);
    window.removeEventListener('scroll', this.onScroll);
    window.removeEventListener('resize', this.onResize);
    document.removeEventListener('visibilitychange', this.onVisibilityChange);
    this.systemThemeQuery?.removeEventListener('change', this.onSystemThemeChange);
    this.motionQuery?.removeEventListener('change', this.onMotionPreferenceChange);
    this.timer.dispose();

    const geometries = new Set<THREE.BufferGeometry>();
    const materials = new Set<THREE.Material>();
    for (const scene of [this.flowScene, this.orbScene]) {
      scene.traverse((object) => {
        const renderable = object as THREE.Mesh | THREE.Points;
        if (renderable.geometry) geometries.add(renderable.geometry);
        const material = renderable.material;
        if (Array.isArray(material)) material.forEach((item) => materials.add(item));
        else if (material) materials.add(material);
      });
    }
    geometries.forEach((geometry) => geometry.dispose());
    materials.forEach((material) => material.dispose());
    this.renderer?.dispose();
    this.renderer?.forceContextLoss();
  }

  private readonly onMotionPreferenceChange = (): void => {
    this.stopAnimation();
    this.startAnimation();
  };

  private createScene(): void {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvasRef.nativeElement,
      alpha: true,
      antialias: true,
      powerPreference: 'low-power',
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.autoClear = false;

    this.flowMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uPointer: { value: new THREE.Vector2(0.5, 0.5) },
        uColorA: { value: new THREE.Color() },
        uColorB: { value: new THREE.Color() },
        uColorC: { value: new THREE.Color() },
        uOpacity: { value: 0.4 },
      },
      vertexShader: `
        varying vec2 vUv;

        void main() {
          vUv = uv;
          gl_Position = vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        precision highp float;

        varying vec2 vUv;
        uniform float uTime;
        uniform vec2 uPointer;
        uniform vec3 uColorA;
        uniform vec3 uColorB;
        uniform vec3 uColorC;
        uniform float uOpacity;

        float hash(vec2 point) {
          return fract(sin(dot(point, vec2(127.1, 311.7))) * 43758.5453123);
        }

        float noise(vec2 point) {
          vec2 cell = floor(point);
          vec2 local = fract(point);
          local = local * local * (3.0 - 2.0 * local);

          float bottomLeft = hash(cell);
          float bottomRight = hash(cell + vec2(1.0, 0.0));
          float topLeft = hash(cell + vec2(0.0, 1.0));
          float topRight = hash(cell + vec2(1.0, 1.0));
          return mix(mix(bottomLeft, bottomRight, local.x), mix(topLeft, topRight, local.x), local.y);
        }

        float flowNoise(vec2 point) {
          float value = noise(point);
          value += noise(point * 2.07 + 4.8) * 0.48;
          value += noise(point * 4.13 - 2.7) * 0.22;
          return value / 1.7;
        }

        void main() {
          vec2 aspectUv = vec2(vUv.x * 1.55, vUv.y);
          float slowTime = uTime * 0.035;
          vec2 current = aspectUv * 2.55 + vec2(slowTime, -slowTime * 0.68);
          current.x += sin(aspectUv.y * 4.2 + slowTime * 2.0) * 0.18;

          float mist = flowNoise(current);
          float ribbon = smoothstep(0.47, 0.82, mist) * (1.0 - smoothstep(0.82, 1.03, mist));
          float horizon = exp(-pow((vUv.y - 0.44) * 2.25, 2.0));
          float pointerGlow = smoothstep(0.34, 0.0, distance(vUv, uPointer));

          vec3 color = mix(uColorA, uColorB, smoothstep(0.2, 0.88, mist));
          color = mix(color, uColorC, ribbon * 0.55 + pointerGlow * 0.16);
          float alpha = (mist * 0.055 + ribbon * 0.055 + horizon * 0.018 + pointerGlow * 0.02) * uOpacity;
          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });
    this.flowScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.flowMaterial));

    this.orbMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: new THREE.Color() },
        uOpacity: { value: 0.06 },
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vViewPosition;

        void main() {
          vNormal = normalize(normalMatrix * normal);
          vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
          vViewPosition = viewPosition.xyz;
          gl_Position = projectionMatrix * viewPosition;
        }
      `,
      fragmentShader: `
        precision highp float;

        varying vec3 vNormal;
        varying vec3 vViewPosition;
        uniform vec3 uColor;
        uniform float uOpacity;

        void main() {
          vec3 viewDirection = normalize(-vViewPosition);
          float rim = pow(1.0 - max(0.0, dot(viewDirection, vNormal)), 2.4);
          float veil = smoothstep(0.16, 0.92, rim);
          gl_FragColor = vec4(uColor, (rim * 0.72 + veil * 0.28) * uOpacity);
        }
      `,
      transparent: true,
      depthWrite: false,
      side: THREE.FrontSide,
    });

    const sphereGeometry = new THREE.SphereGeometry(1, 48, 32);
    const orbSpecs = [
      [-0.84, 0.72, -1.3, 0.82, 0.3],
      [0.86, 0.56, -2.6, 1.22, 1.8],
      [-0.74, -0.64, -2.9, 1.04, 3.1],
      [0.72, -0.7, -1.8, 0.64, 4.7],
      [0.12, 1.04, -3.6, 0.5, 5.5],
      [1.08, -0.04, -3.5, 0.44, 2.5],
    ] as const;

    orbSpecs.forEach(([x, y, depth, scale, phase]) => {
      const group = new THREE.Group();
      const surface = new THREE.Mesh(sphereGeometry, this.orbMaterial!);
      group.add(surface);
      group.scale.setScalar(scale);
      this.orbGroup.add(group);
      this.orbs.push({
        group,
        normalizedX: x,
        normalizedY: y,
        depth,
        scale,
        phase,
        basePosition: new THREE.Vector3(),
      });
    });

    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(72 * 3);
    for (let index = 0; index < 72; index++) {
      const seed = index * 12.9898;
      particlePositions[index * 3] = Math.sin(seed) * 7.5;
      particlePositions[index * 3 + 1] = Math.sin(seed * 1.71 + 2.4) * 4.3;
      particlePositions[index * 3 + 2] = -1.2 - (index % 7) * 0.48;
    }
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    this.particleMaterial = new THREE.PointsMaterial({
      color: 0x2f7f9d,
      size: 0.018,
      transparent: true,
      opacity: 0.18,
      sizeAttenuation: true,
      depthWrite: false,
    });
    this.orbGroup.add(new THREE.Points(particleGeometry, this.particleMaterial));
    this.orbScene.add(this.orbGroup);
    this.orbCamera.position.z = 7;
    this.applyTheme(false);
  }

  private applyTheme(renderAfterUpdate: boolean): void {
    if (!this.flowMaterial || !this.orbMaterial || !this.particleMaterial) {
      return;
    }

    const palette = this.darkMode
      ? {
          flow: ['#0d4268', '#16a4c2', '#586fb2'],
          orb: '#66e7ff',
          particle: '#79eaff',
          flowOpacity: 0.82,
          orbOpacity: 0.12,
          particleOpacity: 0.24,
        }
      : {
          flow: ['#2b6385', '#6bc7d4', '#566a9f'],
          orb: '#176988',
          particle: '#22718e',
          flowOpacity: 0.72,
          orbOpacity: 0.072,
          particleOpacity: 0.16,
        };

    this.flowMaterial.uniforms['uColorA'].value.set(palette.flow[0]);
    this.flowMaterial.uniforms['uColorB'].value.set(palette.flow[1]);
    this.flowMaterial.uniforms['uColorC'].value.set(palette.flow[2]);
    this.flowMaterial.uniforms['uOpacity'].value = palette.flowOpacity;
    this.orbMaterial.uniforms['uColor'].value.set(palette.orb);
    this.orbMaterial.uniforms['uOpacity'].value = palette.orbOpacity;
    this.particleMaterial.color.set(palette.particle);
    this.particleMaterial.opacity = palette.particleOpacity;

    if (renderAfterUpdate) this.renderFrame(this.timer.getElapsed());
  }

  private resize(): void {
    if (!this.renderer) return;
    const width = Math.max(1, window.innerWidth);
    const height = Math.max(1, window.innerHeight);
    this.orbCamera.aspect = width / height;
    this.orbCamera.updateProjectionMatrix();
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.2));
    this.renderer.setSize(width, height, false);

    const verticalFov = THREE.MathUtils.degToRad(this.orbCamera.fov);
    this.viewHalfHeight = Math.tan(verticalFov / 2) * this.orbCamera.position.z;
    this.viewHalfWidth = this.viewHalfHeight * this.orbCamera.aspect;
    this.orbs.forEach((orb) => {
      orb.basePosition.set(
        orb.normalizedX * this.viewHalfWidth,
        orb.normalizedY * this.viewHalfHeight,
        orb.depth,
      );
      orb.group.position.copy(orb.basePosition);
    });
    this.renderFrame(this.timer.getElapsed());
  }

  private startAnimation(): void {
    if (!this.renderer || document.hidden || this.frameId !== undefined) return;
    if (this.motionQuery?.matches) {
      this.pointer.set(0, 0);
      this.renderFrame(0);
      return;
    }

    this.timer.reset();
    const animate = (timestamp: number): void => {
      this.frameId = requestAnimationFrame(animate);
      if (timestamp - this.lastFrameAt < 30) return;
      this.lastFrameAt = timestamp;
      this.timer.update(timestamp);
      this.renderFrame(this.timer.getElapsed());
    };
    this.frameId = requestAnimationFrame(animate);
  }

  private stopAnimation(): void {
    if (this.frameId === undefined) return;
    cancelAnimationFrame(this.frameId);
    this.frameId = undefined;
  }

  private renderFrame(elapsed: number): void {
    if (!this.renderer || !this.flowMaterial) return;
    this.pointer.lerp(this.pointerTarget, 0.045);
    this.flowMaterial.uniforms['uTime'].value = elapsed;
    this.flowMaterial.uniforms['uPointer'].value.set(
      this.pointer.x * 0.5 + 0.5,
      this.pointer.y * 0.5 + 0.5,
    );

    const pointerWorld = new THREE.Vector2(
      this.pointer.x * this.viewHalfWidth,
      this.pointer.y * this.viewHalfHeight,
    );
    this.orbs.forEach((orb, index) => {
      const driftX = Math.sin(elapsed * 0.12 + orb.phase) * (0.08 + orb.scale * 0.035);
      const driftY = Math.cos(elapsed * 0.1 + orb.phase * 1.3) * (0.11 + orb.scale * 0.04);
      const dx = orb.basePosition.x - pointerWorld.x;
      const dy = orb.basePosition.y - pointerWorld.y;
      const distance = Math.max(Math.hypot(dx, dy), 0.001);
      const influence = Math.max(0, 1 - distance / 2.8) * 0.22;
      const targetX = orb.basePosition.x + driftX + (dx / distance) * influence;
      const targetY =
        orb.basePosition.y +
        driftY +
        (dy / distance) * influence +
        Math.sin(this.scrollTarget * 0.7 + orb.phase) * 0.12;

      orb.group.position.x += (targetX - orb.group.position.x) * 0.035;
      orb.group.position.y += (targetY - orb.group.position.y) * 0.035;
      orb.group.rotation.x = elapsed * (0.018 + index * 0.0018) + orb.phase;
      orb.group.rotation.y = elapsed * (0.025 + index * 0.0022) - orb.phase * 0.4;
      const pulse = orb.scale * (1 + Math.sin(elapsed * 0.16 + orb.phase) * 0.018);
      orb.group.scale.setScalar(pulse);
    });
    this.orbGroup.rotation.z = this.pointer.x * 0.012;

    this.renderer.clear();
    this.renderer.render(this.flowScene, this.flowCamera);
    this.renderer.clearDepth();
    this.renderer.render(this.orbScene, this.orbCamera);
  }

  private resolveDarkMode(preference: ThemePreference): boolean {
    return (
      preference === 'dark' || (preference === 'system' && Boolean(this.systemThemeQuery?.matches))
    );
  }

  private createMediaQuery(query: string): MediaQueryList | undefined {
    return typeof window.matchMedia === 'function' ? window.matchMedia(query) : undefined;
  }
}
