import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  signal,
} from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import * as THREE from 'three';
import { SvgIconComponent } from '../svg-icon.component';

@Component({
  selector: 'app-policy-seal-scene',
  imports: [TranslocoPipe, SvgIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="policy-seal-scene" [class.scene-ready]="ready()">
      <canvas #canvas aria-hidden="true"></canvas>
      <div class="seal-fallback" aria-hidden="true">
        <app-icon name="shield" [size]="76" />
      </div>
      <p class="sr-only">{{ 'issued.visualLabel' | transloco }}</p>
    </div>
  `,
})
export class PolicySealSceneComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas', { static: true }) private canvasRef!: ElementRef<HTMLCanvasElement>;

  readonly ready = signal(false);
  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.PerspectiveCamera(34, 1, 0.1, 20);
  private readonly sealGroup = new THREE.Group();
  private readonly timer = new THREE.Timer();
  private readonly motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  private renderer?: THREE.WebGLRenderer;
  private resizeObserver?: ResizeObserver;
  private intersectionObserver?: IntersectionObserver;
  private frameId?: number;
  private visible = true;

  private readonly onVisibilityChange = (): void => {
    if (document.hidden) this.stopAnimation();
    else this.startAnimation();
  };

  ngAfterViewInit(): void {
    try {
      this.createScene();
      this.resizeObserver = new ResizeObserver(() => this.resize());
      this.resizeObserver.observe(this.canvasRef.nativeElement.parentElement!);
      this.intersectionObserver = new IntersectionObserver(
        ([entry]) => {
          this.visible = entry?.isIntersecting ?? true;
          if (this.visible) this.startAnimation();
          else this.stopAnimation();
        },
        { threshold: 0.1 },
      );
      this.intersectionObserver.observe(this.canvasRef.nativeElement);
      this.timer.connect(document);
      document.addEventListener('visibilitychange', this.onVisibilityChange);
      this.resize();
      this.ready.set(true);
      this.startAnimation();
    } catch {
      this.ready.set(false);
    }
  }

  ngOnDestroy(): void {
    this.stopAnimation();
    this.resizeObserver?.disconnect();
    this.intersectionObserver?.disconnect();
    document.removeEventListener('visibilitychange', this.onVisibilityChange);
    this.timer.dispose();
    this.scene.traverse((object) => {
      const renderable = object as THREE.Mesh;
      renderable.geometry?.dispose();
      const material = renderable.material;
      if (Array.isArray(material)) material.forEach((item) => item.dispose());
      else material?.dispose();
    });
    this.renderer?.dispose();
    this.renderer?.forceContextLoss();
  }

  private createScene(): void {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvasRef.nativeElement,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.setClearColor(0x000000, 0);
    this.camera.position.set(0, 0, 6.1);

    const shieldShape = new THREE.Shape();
    shieldShape.moveTo(0, 1.45);
    shieldShape.lineTo(1.08, 0.94);
    shieldShape.lineTo(0.9, -0.52);
    shieldShape.bezierCurveTo(0.76, -1.08, 0.36, -1.42, 0, -1.63);
    shieldShape.bezierCurveTo(-0.36, -1.42, -0.76, -1.08, -0.9, -0.52);
    shieldShape.lineTo(-1.08, 0.94);
    shieldShape.closePath();

    const shield = new THREE.Mesh(
      new THREE.ExtrudeGeometry(shieldShape, {
        depth: 0.22,
        bevelEnabled: true,
        bevelSegments: 4,
        bevelSize: 0.07,
        bevelThickness: 0.07,
      }),
      new THREE.MeshPhysicalMaterial({
        color: 0x09bede,
        roughness: 0.22,
        metalness: 0.42,
        clearcoat: 0.86,
        clearcoatRoughness: 0.16,
      }),
    );
    shield.geometry.center();
    shield.position.z = -0.12;
    this.sealGroup.add(shield);

    const checkMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.32,
      metalness: 0.08,
    });
    const shortStroke = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.62, 0.16), checkMaterial);
    shortStroke.position.set(-0.34, -0.08, 0.2);
    shortStroke.rotation.z = 0.85;
    const longStroke = new THREE.Mesh(new THREE.BoxGeometry(0.18, 1.16, 0.16), checkMaterial);
    longStroke.position.set(0.22, 0.02, 0.2);
    longStroke.rotation.z = -0.72;
    this.sealGroup.add(shortStroke, longStroke);

    const orbit = new THREE.Mesh(
      new THREE.TorusGeometry(1.68, 0.016, 6, 96),
      new THREE.MeshBasicMaterial({ color: 0x5ae7ff, transparent: true, opacity: 0.42 }),
    );
    orbit.rotation.x = 1.06;
    orbit.rotation.z = 0.28;
    this.sealGroup.add(orbit);

    const halo = new THREE.Mesh(
      new THREE.RingGeometry(1.28, 1.88, 64),
      new THREE.MeshBasicMaterial({
        color: 0x1dd2ef,
        transparent: true,
        opacity: 0.07,
        side: THREE.DoubleSide,
      }),
    );
    halo.position.z = -0.52;
    this.sealGroup.add(halo);

    this.sealGroup.scale.setScalar(this.motionQuery.matches ? 1 : 0.55);
    this.scene.add(this.sealGroup);
    this.scene.add(new THREE.HemisphereLight(0xc7f6ff, 0x061426, 2.2));
    const keyLight = new THREE.DirectionalLight(0xffffff, 3.2);
    keyLight.position.set(3, 4, 6);
    this.scene.add(keyLight);
    const rimLight = new THREE.PointLight(0x00d2ff, 15, 8, 2);
    rimLight.position.set(-2.8, -1.5, 2.2);
    this.scene.add(rimLight);
  }

  private resize(): void {
    if (!this.renderer) return;
    const parent = this.canvasRef.nativeElement.parentElement;
    if (!parent) return;
    const width = Math.max(1, parent.clientWidth);
    const height = Math.max(1, parent.clientHeight);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    this.renderer.setSize(width, height, false);
    if (this.motionQuery.matches) this.renderer.render(this.scene, this.camera);
  }

  private startAnimation(): void {
    if (!this.renderer || !this.visible || document.hidden || this.frameId !== undefined) return;
    if (this.motionQuery.matches) {
      this.renderer.render(this.scene, this.camera);
      return;
    }
    this.timer.reset();
    const animate = (timestamp: number): void => {
      this.frameId = requestAnimationFrame(animate);
      this.timer.update(timestamp);
      const elapsed = this.timer.getElapsed();
      const entrance = Math.min(1, elapsed / 0.85);
      const eased = 1 - Math.pow(1 - entrance, 3);
      this.sealGroup.scale.setScalar(0.55 + eased * 0.45);
      this.sealGroup.rotation.y = Math.sin(elapsed * 0.58) * 0.18;
      this.sealGroup.rotation.x = Math.sin(elapsed * 0.43) * 0.055;
      this.sealGroup.position.y = Math.sin(elapsed * 0.9) * 0.055;
      this.renderer!.render(this.scene, this.camera);
    };
    this.frameId = requestAnimationFrame(animate);
  }

  private stopAnimation(): void {
    if (this.frameId === undefined) return;
    cancelAnimationFrame(this.frameId);
    this.frameId = undefined;
  }
}
