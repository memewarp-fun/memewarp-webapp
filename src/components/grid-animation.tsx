"use client";

import { useEffect, useRef } from "react";

export function GridAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const gridSize = 50;
    const dots: Dot[] = [];
    let mouseX = 0;
    let mouseY = 0;

    class Dot {
      x: number;
      y: number;
      baseX: number;
      baseY: number;
      size: number;
      glowIntensity: number;

      constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.baseX = x;
        this.baseY = y;
        this.size = 2;
        this.glowIntensity = Math.random() * 0.5 + 0.5;
      }

      update() {
        const dx = mouseX - this.x;
        const dy = mouseY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxDistance = 150;

        if (distance < maxDistance) {
          const force = (1 - distance / maxDistance) * 0.3;
          this.x = this.baseX + dx * force;
          this.y = this.baseY + dy * force;
          this.glowIntensity = Math.min(1, this.glowIntensity + 0.1);
        } else {
          this.x += (this.baseX - this.x) * 0.1;
          this.y += (this.baseY - this.y) * 0.1;
          this.glowIntensity += (0.5 - this.glowIntensity) * 0.05;
        }

        this.glowIntensity += (Math.random() - 0.5) * 0.02;
        this.glowIntensity = Math.max(0.3, Math.min(1, this.glowIntensity));
      }

      draw() {
        if (!ctx) return;

        // Glow effect
        ctx.shadowBlur = 20;
        ctx.shadowColor = `rgba(34, 197, 94, ${this.glowIntensity})`;

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(34, 197, 94, ${this.glowIntensity})`;
        ctx.fill();

        // Reset shadow
        ctx.shadowBlur = 0;
      }
    }

    // Create grid of dots
    for (let x = 0; x < canvas.width + gridSize; x += gridSize) {
      for (let y = 0; y < canvas.height + gridSize; y += gridSize) {
        dots.push(new Dot(x, y));
      }
    }

    function drawGrid() {
      if (!ctx) return;

      ctx.strokeStyle = "rgba(34, 197, 94, 0.1)";
      ctx.lineWidth = 0.5;

      // Vertical lines
      for (let x = 0; x < canvas.width + gridSize; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      // Horizontal lines
      for (let y = 0; y < canvas.height + gridSize; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
    }

    function drawConnections() {
      if (!ctx) return;

      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
          const dx = dots[i].x - dots[j].x;
          const dy = dots[i].y - dots[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 100) {
            const opacity = (1 - distance / 100) * 0.5 * Math.min(dots[i].glowIntensity, dots[j].glowIntensity);
            ctx.strokeStyle = `rgba(34, 197, 94, ${opacity})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(dots[i].x, dots[i].y);
            ctx.lineTo(dots[j].x, dots[j].y);
            ctx.stroke();
          }
        }
      }
    }

    function animate() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      drawGrid();

      dots.forEach(dot => {
        dot.update();
      });

      drawConnections();

      dots.forEach(dot => {
        dot.draw();
      });

      requestAnimationFrame(animate);
    }

    animate();

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    };

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      // Recreate dots for new size
      dots.length = 0;
      for (let x = 0; x < canvas.width + gridSize; x += gridSize) {
        for (let y = 0; y < canvas.height + gridSize; y += gridSize) {
          dots.push(new Dot(x, y));
        }
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-0"
      style={{ opacity: 0.6 }}
    />
  );
}