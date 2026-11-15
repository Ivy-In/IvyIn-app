"use client";
import { useEffect, useRef } from "react";
import css from "./reel.module.css";

// Scene 4 of the reel: an isometric field of metallic cubes rippling out from a point like a liquid
// surface, lit in ultramarine and porcelain. The ripple's centre drifts toward the pointer.
// three.js loads only when the field is about to scroll into view, rendering pauses off screen and in
// background tabs, and reduced motion gets a single still frame. If WebGL is unavailable the CSS
// gradient behind the canvas stays as the fallback.
export function CubeWave({ className }: { className?: string }) {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let dispose = () => {};
    let started = false;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const start = async () => {
      started = true;
      const THREE = await import("three");
      if (!host.current) return;

      let renderer: import("three").WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
      } catch {
        return; // no WebGL: keep the CSS fallback
      }
      const small = el.clientWidth < 700;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, small ? 1.25 : 1.5));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.domElement.className = css.cubeCanvas;
      el.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const pmrem = new THREE.PMREMGenerator(renderer);
      // A tiny "studio" for reflections: a carbon room with ultramarine and porcelain light panels.
      const studio = new THREE.Scene();
      const room = new THREE.Mesh(new THREE.BoxGeometry(40, 40, 40), new THREE.MeshBasicMaterial({ color: 0x0e0f12, side: THREE.BackSide }));
      studio.add(room);
      const panel = (color: number, w: number, h: number, x: number, y: number, z: number, intensity: number) => {
        const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(intensity), side: THREE.DoubleSide }));
        m.position.set(x, y, z); m.lookAt(0, 0, 0); studio.add(m);
      };
      // Seen from the isometric camera, top faces mirror the upper back-left, side faces the low corners.
      panel(0x244cff, 26, 22, -13, 15, -13, 1.7);  // tops: ultramarine sky
      panel(0xe8ebed, 22, 3, -9, 18, -15, 4);    // tops: a porcelain strip that sweeps across as cubes tilt
      panel(0x244cff, 24, 16, 17, -7, -13, 1.8);   // right-facing sides
      panel(0x1e3599, 24, 16, -13, -7, 17, 1.6);   // left-facing sides, deeper blue
      const env = pmrem.fromScene(studio, 0.03).texture;
      studio.traverse((o) => { const m = o as import("three").Mesh; m.geometry?.dispose(); (m.material as import("three").Material | undefined)?.dispose(); });
      scene.environment = env;
      scene.environmentIntensity = 1.0;

      const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 200);
      camera.position.set(22, 20, 22);
      camera.lookAt(0, 0, 0);

      const blue = new THREE.DirectionalLight(0x244cff, 3);
      blue.position.set(-12, 6, 4);
      const white = new THREE.DirectionalLight(0xe8ebed, 0.8);
      blue.target.position.set(0, 0, 0);
      white.position.set(8, 14, -6);
      const rim = new THREE.DirectionalLight(0x244cff, 1.5);
      rim.position.set(4, 3, 16);
      scene.add(blue, white, rim, new THREE.AmbientLight(0x17191d, 0.4));

      const N = small ? 18 : 26;
      const gap = 1.08;
      const geo = new THREE.BoxGeometry(0.92, 1, 0.92);
      const mat = new THREE.MeshStandardMaterial({ color: 0x9aa0aa, metalness: 1, roughness: 0.24 });
      const mesh = new THREE.InstancedMesh(geo, mat, N * N);
      mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      scene.add(mesh);

      const cells: { x: number; z: number }[] = [];
      for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) cells.push({ x: (i - (N - 1) / 2) * gap, z: (j - (N - 1) / 2) * gap });
      const m4 = new THREE.Matrix4();
      const q = new THREE.Quaternion();
      const e = new THREE.Euler();
      const p = new THREE.Vector3();
      const s = new THREE.Vector3();

      const center = new THREE.Vector2(0, 0);
      const target = new THREE.Vector2(0, 0);
      const ray = new THREE.Raycaster();
      const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
      const hit = new THREE.Vector3();
      const onMove = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        const ndc = new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
        ray.setFromCamera(ndc, camera);
        if (ray.ray.intersectPlane(plane, hit)) target.set(THREE.MathUtils.clamp(hit.x, -9, 9), THREE.MathUtils.clamp(hit.z, -9, 9));
      };
      const onLeave = () => target.set(0, 0);
      el.addEventListener("pointermove", onMove);
      el.addEventListener("pointerleave", onLeave);

      const resize = () => {
        const w = el.clientWidth, h = el.clientHeight;
        if (!w || !h) return;
        renderer.setSize(w, h, false);
        const view = small ? 20 : 24;
        const a = w / h;
        camera.left = -view * a / 2; camera.right = view * a / 2; camera.top = view / 2; camera.bottom = -view / 2;
        camera.updateProjectionMatrix();
      };
      const ro = new ResizeObserver(resize);
      ro.observe(el);
      resize();

      const frame = (t: number) => {
        center.lerp(target, 0.04);
        for (let k = 0; k < cells.length; k++) {
          const c = cells[k];
          const d = Math.hypot(c.x - center.x, c.z - center.y);
          const ph = d * 0.62 - t * 2.1;
          const w = Math.sin(ph);
          // Tilt each cube with the slope of the wave so reflections roll across the surface like liquid.
          const slope = Math.cos(ph) * 0.32;
          const ux = d > 0.001 ? (c.x - center.x) / d : 0, uz = d > 0.001 ? (c.z - center.y) / d : 0;
          e.set(uz * slope, 0, -ux * slope);
          q.setFromEuler(e);
          const h = 0.5 + (w + 1) * 0.85;
          p.set(c.x, w * 0.55 + h / 2 - 1, c.z);
          s.set(1, h, 1);
          m4.compose(p, q, s);
          mesh.setMatrixAt(k, m4);
        }
        mesh.instanceMatrix.needsUpdate = true;
        renderer.render(scene, camera);
      };

      let raf = 0;
      let visible = false;
      const t0 = performance.now();
      const loop = () => {
        raf = 0;
        if (!visible || document.hidden) return;
        frame((performance.now() - t0) / 1000);
        raf = requestAnimationFrame(loop);
      };
      const io2 = new IntersectionObserver(([e]) => {
        visible = e.isIntersecting;
        if (visible && !raf && !reduce) raf = requestAnimationFrame(loop);
      });
      io2.observe(el);
      const onVis = () => { if (!document.hidden && visible && !raf && !reduce) raf = requestAnimationFrame(loop); };
      document.addEventListener("visibilitychange", onVis);
      if (reduce) frame(1.4);
      el.setAttribute("data-live", "");

      dispose = () => {
        cancelAnimationFrame(raf);
        io2.disconnect(); ro.disconnect();
        document.removeEventListener("visibilitychange", onVis);
        el.removeEventListener("pointermove", onMove);
        el.removeEventListener("pointerleave", onLeave);
        geo.dispose(); mat.dispose(); env.dispose(); pmrem.dispose();
        renderer.dispose(); renderer.domElement.remove();
      };
    };

    // Load early: begin once the field is within a screen and a half of the viewport.
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started) { io.disconnect(); start(); }
    }, { rootMargin: "150% 0px" });
    io.observe(el);
    return () => { io.disconnect(); dispose(); };
  }, []);

  return <div ref={host} className={`${css.cubes} ${className ?? ""}`} aria-hidden="true" />;
}
