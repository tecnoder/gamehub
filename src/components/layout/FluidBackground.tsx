'use client';

import { useEffect, useRef } from 'react';

type Point = {
  x: number;
  y: number;
  vx: number;
  vy: number;
};

type Ribbon = {
  points: Point[];
  color: string;
  tension: number;
  width: number;
  alpha: number;
};

export default function FluidBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ribbonsRef = useRef<Ribbon[]>([]);
  const mouseRef = useRef<{ x: number; y: number; vx: number; vy: number } | null>(null);
  const rafRef = useRef<number>(0);

  // Helper function to generate random color
  const randomColor = () => {
    const colors = [
      'rgba(139, 92, 246, 0.5)', // Purple
      'rgba(59, 130, 246, 0.5)',  // Blue
      'rgba(236, 72, 153, 0.4)',  // Pink
      'rgba(245, 158, 11, 0.4)',  // Amber
      'rgba(16, 185, 129, 0.4)',  // Emerald
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Initialize the canvas and start animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    const setCanvasDimensions = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
    };

    // Initialize ribbons
    const initRibbons = () => {
      ribbonsRef.current = [];
      const ribbonCount = Math.max(5, Math.min(15, Math.floor(window.innerWidth / 200)));
      
      for (let i = 0; i < ribbonCount; i++) {
        const ribbon: Ribbon = {
          points: [],
          color: randomColor(),
          tension: 0.3 + Math.random() * 0.2,
          width: Math.random() * 2 + 1,
          alpha: 0.5 + Math.random() * 0.5,
        };
        
        // Create initial points for the ribbon
        const pointCount = Math.floor(Math.random() * 3) + 5;
        for (let j = 0; j < pointCount; j++) {
          ribbon.points.push({
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            vx: Math.random() * 2 - 1,
            vy: Math.random() * 2 - 1,
          });
        }
        
        ribbonsRef.current.push(ribbon);
      }
    };

    // Draw a single ribbon
    const drawRibbon = (ribbon: Ribbon) => {
      const { points, color, width, alpha } = ribbon;
      if (points.length < 2) return;

      ctx.strokeStyle = color.replace(')', `, ${alpha})`);
      ctx.lineWidth = width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);

      // Draw smooth curve through points
      for (let i = 0; i < points.length - 1; i++) {
        const x_mid = (points[i].x + points[i + 1].x) / 2;
        const y_mid = (points[i].y + points[i + 1].y) / 2;
        const cp_x1 = (x_mid + points[i].x) / 2;
        const cp_x2 = (x_mid + points[i + 1].x) / 2;
        
        ctx.quadraticCurveTo(points[i].x, points[i].y, x_mid, y_mid);
      }
      
      ctx.stroke();
    };

    // Update ribbon positions
    const updateRibbons = () => {
      ribbonsRef.current.forEach(ribbon => {
        ribbon.points.forEach(point => {
          // Add some noise to the movement
          point.vx += (Math.random() - 0.5) * 0.1;
          point.vy += (Math.random() - 0.5) * 0.1;
          
          // Dampen velocity
          point.vx *= 0.98;
          point.vy *= 0.98;
          
          // Apply mouse influence if close enough
          if (mouseRef.current) {
            const dx = mouseRef.current.x - point.x;
            const dy = mouseRef.current.y - point.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 300) {
              const force = (1 - distance / 300) * 0.03;
              point.vx -= dx * force;
              point.vy -= dy * force;
              
              // Add some of the mouse velocity
              point.vx += mouseRef.current.vx * force * 2;
              point.vy += mouseRef.current.vy * force * 2;
            }
          }
          
          // Update position
          point.x += point.vx;
          point.y += point.vy;
          
          // Bounce off edges with some randomness
          if (point.x < 0) {
            point.x = 0;
            point.vx = Math.abs(point.vx) * (0.5 + Math.random() * 0.5);
          } else if (point.x > window.innerWidth) {
            point.x = window.innerWidth;
            point.vx = -Math.abs(point.vx) * (0.5 + Math.random() * 0.5);
          }
          
          if (point.y < 0) {
            point.y = 0;
            point.vy = Math.abs(point.vy) * (0.5 + Math.random() * 0.5);
          } else if (point.y > window.innerHeight) {
            point.y = window.innerHeight;
            point.vy = -Math.abs(point.vy) * (0.5 + Math.random() * 0.5);
          }
        });
      });
    };

    // Animation frame
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width / (window.devicePixelRatio || 1), canvas.height / (window.devicePixelRatio || 1));
      
      // Draw radial gradient background
      const gradient = ctx.createRadialGradient(
        canvas.width / (2 * (window.devicePixelRatio || 1)), 
        canvas.height / (2 * (window.devicePixelRatio || 1)), 
        0,
        canvas.width / (2 * (window.devicePixelRatio || 1)), 
        canvas.height / (2 * (window.devicePixelRatio || 1)), 
        canvas.width / ((window.devicePixelRatio || 1))
      );
      gradient.addColorStop(0, 'rgba(17, 24, 39, 1)');
      gradient.addColorStop(1, 'rgba(30, 41, 59, 1)');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width / (window.devicePixelRatio || 1), canvas.height / (window.devicePixelRatio || 1));
      
      // Add subtle glow around mouse position
      if (mouseRef.current) {
        const mouseGlow = ctx.createRadialGradient(
          mouseRef.current.x, mouseRef.current.y, 0,
          mouseRef.current.x, mouseRef.current.y, 200
        );
        mouseGlow.addColorStop(0, 'rgba(139, 92, 246, 0.15)');
        mouseGlow.addColorStop(1, 'rgba(139, 92, 246, 0)');
        
        ctx.beginPath();
        ctx.arc(mouseRef.current.x, mouseRef.current.y, 200, 0, Math.PI * 2);
        ctx.fillStyle = mouseGlow;
        ctx.fill();
      }
      
      // Update and draw all ribbons
      updateRibbons();
      ribbonsRef.current.forEach(ribbon => drawRibbon(ribbon));
      
      rafRef.current = requestAnimationFrame(animate);
    };

    // Set up event listeners
    const setupEventListeners = () => {
      let lastMouseX = 0;
      let lastMouseY = 0;
      
      const handleMouseMove = (e: MouseEvent) => {
        const newX = e.clientX;
        const newY = e.clientY;
        
        if (mouseRef.current) {
          // Calculate velocity from movement
          mouseRef.current.vx = (newX - lastMouseX) * 0.1;
          mouseRef.current.vy = (newY - lastMouseY) * 0.1;
          mouseRef.current.x = newX;
          mouseRef.current.y = newY;
        } else {
          mouseRef.current = { x: newX, y: newY, vx: 0, vy: 0 };
        }
        
        lastMouseX = newX;
        lastMouseY = newY;
      };
      
      const handleTouchMove = (e: TouchEvent) => {
        e.preventDefault();
        const touch = e.touches[0];
        const newX = touch.clientX;
        const newY = touch.clientY;
        
        if (mouseRef.current) {
          mouseRef.current.vx = (newX - lastMouseX) * 0.1;
          mouseRef.current.vy = (newY - lastMouseY) * 0.1;
          mouseRef.current.x = newX;
          mouseRef.current.y = newY;
        } else {
          mouseRef.current = { x: newX, y: newY, vx: 0, vy: 0 };
        }
        
        lastMouseX = newX;
        lastMouseY = newY;
      };
      
      const handleMouseLeave = () => {
        mouseRef.current = null;
      };
      
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('mouseleave', handleMouseLeave);
      window.addEventListener('resize', () => {
        setCanvasDimensions();
        initRibbons();
      });
      
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('mouseleave', handleMouseLeave);
        window.removeEventListener('resize', () => {
          setCanvasDimensions();
          initRibbons();
        });
      };
    };

    // Initialize everything
    setCanvasDimensions();
    initRibbons();
    const cleanup = setupEventListeners();
    
    // Start animation
    rafRef.current = requestAnimationFrame(animate);
    
    // Cleanup
    return () => {
      cleanup();
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[-2]"
    />
  );
} 