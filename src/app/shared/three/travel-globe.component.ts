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

interface Destination {
  city: string;
  latitude: number;
  longitude: number;
}

@Component({
  selector: 'app-travel-globe',
  imports: [TranslocoPipe, SvgIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="travel-globe"
      [class.scene-ready]="ready()"
      (pointermove)="handlePointerMove($event)"
      (pointerleave)="handlePointerLeave()"
    >
      <canvas #canvas aria-hidden="true"></canvas>
      <div class="globe-fallback" aria-hidden="true">
        <app-icon name="globe" [size]="92" />
      </div>
      @if (activeCity()) {
        <span
          class="globe-tooltip"
          aria-hidden="true"
          [style.left.px]="tooltipX()"
          [style.top.px]="tooltipY()"
          >{{ activeCity() }}</span
        >
      }
      <p class="sr-only">{{ 'landing.globeLabel' | transloco }}</p>
    </div>
  `,
})
export class TravelGlobeComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas', { static: true }) private canvasRef!: ElementRef<HTMLCanvasElement>;

  readonly ready = signal(false);
  readonly activeCity = signal('');
  readonly tooltipX = signal(0);
  readonly tooltipY = signal(0);

  private readonly pointer = new THREE.Vector2(4, 4);
  private readonly raycaster = new THREE.Raycaster();
  private readonly destinationNodes: THREE.Mesh[] = [];
  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.PerspectiveCamera(38, 1, 0.1, 30);
  private readonly globeGroup = new THREE.Group();
  private readonly timer = new THREE.Timer();
  private readonly motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  private renderer?: THREE.WebGLRenderer;
  private resizeObserver?: ResizeObserver;
  private intersectionObserver?: IntersectionObserver;
  private frameId?: number;
  private visible = true;
  private targetTiltX = 0;
  private targetTiltY = 0;
  private lastRaycastAt = 0;
  private routePlane?: THREE.Group;
  private featuredRoute?: THREE.QuadraticBezierCurve3;

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
        { threshold: 0.08 },
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

  handlePointerMove(event: PointerEvent): void {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const localX = event.clientX - rect.left;
    const localY = event.clientY - rect.top;
    this.pointer.set((localX / rect.width) * 2 - 1, -(localY / rect.height) * 2 + 1);
    this.targetTiltY = this.pointer.x * 0.18;
    this.targetTiltX = this.pointer.y * 0.1;
    this.tooltipX.set(Math.min(rect.width - 88, Math.max(14, localX + 12)));
    this.tooltipY.set(Math.min(rect.height - 42, Math.max(14, localY - 34)));

    const now = performance.now();
    if (now - this.lastRaycastAt < 48 || !this.renderer) return;
    this.lastRaycastAt = now;
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const hit = this.raycaster.intersectObjects(this.destinationNodes, false)[0];
    this.activeCity.set((hit?.object.userData['city'] as string | undefined) ?? '');
  }

  handlePointerLeave(): void {
    this.targetTiltX = 0;
    this.targetTiltY = 0;
    this.pointer.set(4, 4);
    this.activeCity.set('');
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
    const canvas = this.canvasRef.nativeElement;
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.renderer.setClearColor(0x000000, 0);
    this.camera.position.set(0, 0.08, 5.3);

    const globeGeometry = new THREE.IcosahedronGeometry(1.36, 4);
    const globeMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x0b3458,
      roughness: 0.36,
      metalness: 0.16,
      clearcoat: 0.72,
      clearcoatRoughness: 0.24,
    });
    this.globeGroup.add(new THREE.Mesh(globeGeometry, globeMaterial));

    const gridGeometry = new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(1.375, 2));
    const gridMaterial = new THREE.LineBasicMaterial({
      color: 0x42ddff,
      transparent: true,
      opacity: 0.16,
    });
    this.globeGroup.add(new THREE.LineSegments(gridGeometry, gridMaterial));

    const atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(1.46, 28, 20),
      new THREE.MeshBasicMaterial({
        color: 0x29d7ff,
        transparent: true,
        opacity: 0.055,
        side: THREE.BackSide,
      }),
    );
    this.globeGroup.add(atmosphere);

    const origin = this.latLonToVector(4.711, -74.072, 1.405);
    const destinations: Destination[] = [
      { city: 'Madrid', latitude: 40.4168, longitude: -3.7038 },
      { city: 'Ciudad de México', latitude: 19.4326, longitude: -99.1332 },
      { city: 'Nueva York', latitude: 40.7128, longitude: -74.006 },
      { city: 'São Paulo', latitude: -23.5505, longitude: -46.6333 },
    ];

    this.addNode(origin, 'Bogotá', true);
    destinations.forEach((destination, index) => {
      const end = this.latLonToVector(destination.latitude, destination.longitude, 1.405);
      this.addNode(end, destination.city, false);
      const curve = this.createRoute(origin, end);
      const route = new THREE.Mesh(
        new THREE.TubeGeometry(curve, 44, index === 0 ? 0.013 : 0.008, 5, false),
        new THREE.MeshBasicMaterial({
          color: index === 0 ? 0x5ce8ff : 0x2ca9c8,
          transparent: true,
          opacity: index === 0 ? 0.9 : 0.44,
        }),
      );
      this.globeGroup.add(route);
      if (index === 0) this.featuredRoute = curve;
    });

    this.routePlane = this.createPlaneMarker();
    this.globeGroup.add(this.routePlane);
    this.scene.add(this.globeGroup);
    this.scene.add(this.createParticles());

    this.scene.add(new THREE.HemisphereLight(0xa9efff, 0x071324, 1.8));
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.6);
    keyLight.position.set(3.5, 4.2, 5);
    this.scene.add(keyLight);
    const rimLight = new THREE.PointLight(0x00cbed, 12, 9, 2);
    rimLight.position.set(-3.2, -0.8, 2.8);
    this.scene.add(rimLight);
  }

  private addNode(position: THREE.Vector3, city: string, origin: boolean): void {
    const node = new THREE.Mesh(
      new THREE.SphereGeometry(origin ? 0.065 : 0.052, 12, 10),
      new THREE.MeshBasicMaterial({ color: origin ? 0xffffff : 0x63e8ff }),
    );
    node.position.copy(position);
    node.userData['city'] = city;
    this.destinationNodes.push(node);
    this.globeGroup.add(node);
  }

  private createRoute(start: THREE.Vector3, end: THREE.Vector3): THREE.QuadraticBezierCurve3 {
    const midpoint = start.clone().add(end).normalize();
    const distance = start.distanceTo(end);
    midpoint.multiplyScalar(1.55 + distance * 0.28);
    return new THREE.QuadraticBezierCurve3(start, midpoint, end);
  }

  private createPlaneMarker(): THREE.Group {
    const marker = new THREE.Group();
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const body = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.18, 4), material);
    const wings = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.012, 0.055), material);
    wings.position.y = -0.035;
    marker.add(body, wings);
    marker.scale.setScalar(0.78);
    return marker;
  }

  private createParticles(): THREE.Points {
    const positions = new Float32Array(84 * 3);
    for (let index = 0; index < 84; index++) {
      const angle = index * 2.399963;
      const radius = 2.2 + ((index * 17) % 19) * 0.06;
      positions[index * 3] = Math.cos(angle) * radius;
      positions[index * 3 + 1] = Math.sin(angle * 1.37) * 2.05;
      positions[index * 3 + 2] = -1.5 - ((index * 13) % 24) * 0.11;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return new THREE.Points(
      geometry,
      new THREE.PointsMaterial({
        color: 0x8deeff,
        size: 0.027,
        transparent: true,
        opacity: 0.5,
        sizeAttenuation: true,
      }),
    );
  }

  private latLonToVector(latitude: number, longitude: number, radius: number): THREE.Vector3 {
    const phi = THREE.MathUtils.degToRad(90 - latitude);
    const theta = THREE.MathUtils.degToRad(longitude + 180);
    return new THREE.Vector3(
      -radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta),
    );
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
      this.renderFrame(0);
      return;
    }
    this.timer.reset();
    const animate = (timestamp: number): void => {
      this.frameId = requestAnimationFrame(animate);
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
    if (!this.renderer) return;
    this.globeGroup.rotation.x += (this.targetTiltX - this.globeGroup.rotation.x) * 0.035;
    const targetY = elapsed * 0.055 + this.targetTiltY;
    this.globeGroup.rotation.y += (targetY - this.globeGroup.rotation.y) * 0.035;

    if (this.routePlane && this.featuredRoute) {
      const progress = (elapsed * 0.055 + 0.16) % 1;
      const position = this.featuredRoute.getPointAt(progress);
      const tangent = this.featuredRoute.getTangentAt(progress).normalize();
      this.routePlane.position.copy(position);
      this.routePlane.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), tangent);
    }
    this.renderer.render(this.scene, this.camera);
  }
}
