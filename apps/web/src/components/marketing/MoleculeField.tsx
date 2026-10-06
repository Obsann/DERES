import { useEffect, useRef } from 'react';

type Node = { x: number; y: number; vx: number; vy: number; r: number; accent: boolean };

const LINK = 142;
const REPEL = 160;
const STRENGTH = 2.4;

/**
 * Bonded particle field. Nodes drift slowly and push away from the cursor,
 * stretching the links between them like a loose molecular lattice.
 */
export function MoleculeField({
  className = '',
  tone = 'light',
}: {
  className?: string;
  tone?: 'light' | 'dark';
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const palette =
      tone === 'dark'
        ? {
            bond: '134, 201, 180',
            accentBond: '232, 78, 54',
            node: 'rgba(158, 224, 203, 0.72)',
            accent: 'rgba(232, 78, 54, 0.78)',
            bondAlpha: 0.42,
          }
        : {
            bond: '32, 90, 74',
            accentBond: '186, 59, 42',
            node: 'rgba(28, 91, 72, 0.5)',
            accent: 'rgba(186, 59, 42, 0.55)',
            bondAlpha: 0.38,
          };

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const mouse = { x: -9999, y: -9999, inside: false };
    const nodes: Node[] = [];
    let width = 0;
    let height = 0;
    let dpr = 1;
    let frame = 0;
    let running = true;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(1, Math.floor(rect.width));
      height = Math.max(1, Math.floor(rect.height));
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    };

    const seed = () => {
      nodes.length = 0;
      const count = Math.max(36, Math.min(90, Math.round((width * height) / 11000)));
      for (let i = 0; i < count; i += 1) {
        nodes.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35,
          r: Math.random() < 0.18 ? 2.6 : 1.6 + Math.random() * 0.8,
          accent: Math.random() < 0.1,
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < nodes.length; i += 1) {
        for (let j = i + 1; j < nodes.length; j += 1) {
          const a = nodes[i];
          const b = nodes[j];
          if (!a || !b) continue;
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist >= LINK) continue;
          const alpha = (1 - dist / LINK) * palette.bondAlpha;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle =
            a.accent || b.accent
              ? `rgba(${palette.accentBond}, ${alpha})`
              : `rgba(${palette.bond}, ${alpha})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      for (const node of nodes) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
        ctx.fillStyle = node.accent ? palette.accent : palette.node;
        ctx.fill();
      }
    };

    const step = () => {
      if (!running) return;
      if (!reduce) {
        for (const node of nodes) {
          if (mouse.inside) {
            const dx = node.x - mouse.x;
            const dy = node.y - mouse.y;
            const dist = Math.hypot(dx, dy);
            if (dist < REPEL && dist > 0.4) {
              const force = (1 - dist / REPEL) * STRENGTH;
              node.vx += (dx / dist) * force;
              node.vy += (dy / dist) * force;
            }
          }
          node.vx += (Math.random() - 0.5) * 0.03;
          node.vy += (Math.random() - 0.5) * 0.03;
          node.vx *= 0.9;
          node.vy *= 0.9;
          node.x += node.vx;
          node.y += node.vy;
          if (node.x < 8) {
            node.x = 8;
            node.vx *= -0.8;
          } else if (node.x > width - 8) {
            node.x = width - 8;
            node.vx *= -0.8;
          }
          if (node.y < 8) {
            node.y = 8;
            node.vy *= -0.8;
          } else if (node.y > height - 8) {
            node.y = height - 8;
            node.vy *= -0.8;
          }
        }
      }
      draw();
      frame = window.requestAnimationFrame(step);
    };

    const onMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = event.clientX - rect.left;
      mouse.y = event.clientY - rect.top;
      mouse.inside = mouse.x >= -40 && mouse.y >= -40 && mouse.x <= width + 40 && mouse.y <= height + 40;
    };

    const onVisibility = () => {
      running = !document.hidden;
      if (running) frame = window.requestAnimationFrame(step);
    };

    resize();
    draw();
    if (!reduce) frame = window.requestAnimationFrame(step);

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      running = false;
      window.cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [tone]);

  return <canvas ref={canvasRef} className={`pointer-events-none h-full w-full ${className}`} aria-hidden="true" />;
}
