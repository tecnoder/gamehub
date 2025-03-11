'use client';

import { useEffect, useState, useRef } from 'react';

type Particle = {
  x: number;
  y: number;
  size: number;
  color: string;
  speedX: number;
  speedY: number;
  opacity: number;
};

type MousePosition = {
  x: number;
  y: number;
};

export default function InteractiveBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [particles, setParticles] = useState<Particle[]>([]);
  const [mousePosition, setMousePosition] = useState<MousePosition | null>(null);
  const [isTouch, setIsTouch] = useState(false);
  const animationFrameRef = useRef<number>(0);
  const lastMousePosition = useRef<MousePosition | null>(null);

  // Generate initial particles
  useEffect(() => {
    const generateParticles = () => {
      const newParticles: Particle[] = [];
      const colors = [
        'rgba(139, 92, 246, 0.6)', // Purple
        'rgba(59, 130, 246, 0.6)', // Blue
        'rgba(236, 72, 153, 0.5)', // Pink
        'rgba(16, 185, 129, 0.4)', // Green
      ];

      const particleCount = Math.floor((dimensions.width * dimensions.height) / 15000);
      
      for (let i = 0; i < particleCount; i++) {
        newParticles.push({
          x: Math.random() * dimensions.width,
          y: Math.random() * dimensions.height,
          size: Math.random() * 3 + 1,
          color: colors[Math.floor(Math.random() * colors.length)],
          speedX: Math.random() * 0.5 - 0.25,
          speedY: Math.random() * 0.5 - 0.25,
          opacity: Math.random() * 0.5 + 0.2,
        });
      }
      
      setParticles(newParticles);
    };

    if (dimensions.width > 0 && dimensions.height > 0) {
      generateParticles();
    }
  }, [dimensions]);

  // Set up canvas dimensions
  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Mouse and touch event handlers
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      lastMousePosition.current = { x: e.clientX, y: e.clientY };
    };

    const handleTouchMove = (e: TouchEvent) => {
      setIsTouch(true);
      const touch = e.touches[0];
      setMousePosition({ x: touch.clientX, y: touch.clientY });
      lastMousePosition.current = { x: touch.clientX, y: touch.clientY };
    };

    const handleTouchEnd = () => {
      setIsTouch(false);
      // Keep last position for a smooth effect when touch ends
      setTimeout(() => {
        if (!isTouch) {
          setMousePosition(null);
        }
      }, 3000);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('mouseout', () => setMousePosition(null));

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('mouseout', () => setMousePosition(null));
    };
  }, [isTouch]);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);
      
      // Draw and update particles
      const updatedParticles = particles.map(particle => {
        // Apply mouse influence if mouse is present
        if (mousePosition) {
          const dx = mousePosition.x - particle.x;
          const dy = mousePosition.y - particle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          // Interactive range radius
          const radius = 200; 
          
          if (distance < radius) {
            // Calculate force (stronger when closer)
            const force = (1 - distance / radius) * 0.2;
            
            // Repel particles from mouse (negative force pushes away)
            particle.speedX -= (dx / distance) * force;
            particle.speedY -= (dy / distance) * force;
          }
        }
        
        // Update position with current speed
        let newX = particle.x + particle.speedX;
        let newY = particle.y + particle.speedY;
        
        // Boundary check with bounce effect
        if (newX < 0 || newX > dimensions.width) {
          particle.speedX = -particle.speedX * 0.5;
          newX = Math.max(0, Math.min(dimensions.width, newX));
        }
        
        if (newY < 0 || newY > dimensions.height) {
          particle.speedY = -particle.speedY * 0.5;
          newY = Math.max(0, Math.min(dimensions.height, newY));
        }
        
        // Dampen speed for stability
        particle.speedX *= 0.99;
        particle.speedY *= 0.99;
        
        // Add some randomness for organic movement
        particle.speedX += (Math.random() - 0.5) * 0.01;
        particle.speedY += (Math.random() - 0.5) * 0.01;
        
        // Draw the particle
        ctx.beginPath();
        ctx.arc(newX, newY, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color.replace(')', `, ${particle.opacity})`);
        ctx.fill();
        
        return {
          ...particle,
          x: newX,
          y: newY,
        };
      });
      
      setParticles(updatedParticles);
      
      // Draw mouse glow effect if mouse is present
      if (mousePosition) {
        const gradient = ctx.createRadialGradient(
          mousePosition.x, mousePosition.y, 0,
          mousePosition.x, mousePosition.y, 150
        );
        gradient.addColorStop(0, 'rgba(139, 92, 246, 0.3)');
        gradient.addColorStop(1, 'rgba(139, 92, 246, 0)');
        
        ctx.beginPath();
        ctx.arc(mousePosition.x, mousePosition.y, 150, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      }
      
      // Connect particles that are close to each other
      for (let i = 0; i < updatedParticles.length; i++) {
        for (let j = i + 1; j < updatedParticles.length; j++) {
          const dx = updatedParticles[i].x - updatedParticles[j].x;
          const dy = updatedParticles[i].y - updatedParticles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 100) {
            ctx.beginPath();
            ctx.moveTo(updatedParticles[i].x, updatedParticles[i].y);
            ctx.lineTo(updatedParticles[j].x, updatedParticles[j].y);
            ctx.strokeStyle = `rgba(139, 92, 246, ${0.2 * (1 - distance / 100)})`; // Purple with distance-based opacity
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [dimensions, particles, mousePosition]);

  return (
    <canvas
      ref={canvasRef}
      width={dimensions.width}
      height={dimensions.height}
      className="fixed inset-0 pointer-events-none z-[-1]"
    />
  );
} 