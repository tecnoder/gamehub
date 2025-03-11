'use client';

import { useEffect, useRef } from 'react';

type Node = {
  x: number;
  y: number;
  radius: number;
  vx: number;
  vy: number;
  color: string;
  opacity: number;
  originalOpacity: number;
};

export default function ConstellationBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<Node[]>([]);
  const mouseRef = useRef<{ x: number; y: number, active: boolean } | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const activeNodeRef = useRef<Node | null>(null);

  // Initialize and animate the constellation
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
      canvas.style.width = '100%';
      canvas.style.height = '100%';
    };

    // Create nodes
    const createNodes = () => {
      nodesRef.current = [];
      // Node count based on screen size (more nodes on larger screens)
      const nodeCount = Math.min(100, Math.max(30, Math.floor((window.innerWidth * window.innerHeight) / 10000)));
      
      for (let i = 0; i < nodeCount; i++) {
        const radius = Math.random() * 1.5 + 1;
        const opacity = Math.random() * 0.5 + 0.1;
        nodesRef.current.push({
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          radius,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          color: getColor(),
          opacity,
          originalOpacity: opacity,
        });
      }
    };
    
    // Color palette
    const getColor = () => {
      const colors = [
        'rgba(139, 92, 246, 1)', // Purple
        'rgba(59, 130, 246, 1)',  // Blue
        'rgba(236, 72, 153, 1)',  // Pink
        'rgba(245, 158, 11, 1)',  // Amber
      ];
      return colors[Math.floor(Math.random() * colors.length)];
    };

    // Draw a node
    const drawNode = (node: Node) => {
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
      ctx.fillStyle = node.color.replace('1)', `${node.opacity})`);
      ctx.fill();
    };

    // Draw a connection between nodes
    const drawConnection = (node1: Node, node2: Node, distance: number, maxDistance: number) => {
      const opacity = (1 - distance / maxDistance) * 0.2;
      ctx.beginPath();
      ctx.moveTo(node1.x, node1.y);
      ctx.lineTo(node2.x, node2.y);
      ctx.strokeStyle = `rgba(139, 92, 246, ${opacity})`;
      ctx.lineWidth = 0.5;
      ctx.stroke();
    };

    // Animation function
    const animate = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      
      // Update and draw nodes
      nodesRef.current.forEach(node => {
        // Apply forces
        node.x += node.vx;
        node.y += node.vy;
        
        // Add some noise to movement
        node.vx += (Math.random() - 0.5) * 0.01;
        node.vy += (Math.random() - 0.5) * 0.01;
        
        // Dampen velocity
        node.vx *= 0.99;
        node.vy *= 0.99;
        
        // Handle edge collisions
        if (node.x < 0 || node.x > window.innerWidth) {
          node.vx = -node.vx;
          node.x = Math.max(0, Math.min(window.innerWidth, node.x));
        }
        
        if (node.y < 0 || node.y > window.innerHeight) {
          node.vy = -node.vy;
          node.y = Math.max(0, Math.min(window.innerHeight, node.y));
        }
        
        // Handle mouse interaction
        if (mouseRef.current) {
          const dx = mouseRef.current.x - node.x;
          const dy = mouseRef.current.y - node.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          // Interactive radius
          const interactiveRadius = 150;
          
          if (distance < interactiveRadius) {
            // Highlight nodes near mouse
            node.opacity = Math.min(1, node.originalOpacity * 3);
            
            // Move nodes away from mouse if mouse is active (pressed)
            if (mouseRef.current.active) {
              const force = (1 - distance / interactiveRadius) * 0.05;
              node.vx -= dx * force;
              node.vy -= dy * force;
            }
          } else {
            // Restore original opacity
            node.opacity = Math.max(node.originalOpacity, node.opacity * 0.95);
          }
        }
        
        drawNode(node);
      });
      
      // Draw connections between nodes and mouse
      const maxDistance = Math.min(window.innerWidth, window.innerHeight) * 0.15;
      
      // Draw connections between nodes that are close enough
      for (let i = 0; i < nodesRef.current.length; i++) {
        for (let j = i + 1; j < nodesRef.current.length; j++) {
          const node1 = nodesRef.current[i];
          const node2 = nodesRef.current[j];
          
          const dx = node1.x - node2.x;
          const dy = node1.y - node2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < maxDistance) {
            drawConnection(node1, node2, distance, maxDistance);
          }
        }
      }
      
      // Draw special connections from mouse to nearby nodes
      if (mouseRef.current) {
        const mouseNode = {
          x: mouseRef.current.x,
          y: mouseRef.current.y,
          radius: 0,
          vx: 0,
          vy: 0,
          color: 'rgba(139, 92, 246, 1)',
          opacity: 1,
          originalOpacity: 1,
        };
        
        // Larger distance for mouse connections
        const mouseMaxDistance = maxDistance * 1.5;
        
        nodesRef.current.forEach(node => {
          const dx = mouseNode.x - node.x;
          const dy = mouseNode.y - node.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < mouseMaxDistance) {
            drawConnection(mouseNode, node, distance, mouseMaxDistance);
          }
        });
        
        // Draw a subtle glow around the mouse position
        if (mouseRef.current.active) {
          const gradient = ctx.createRadialGradient(
            mouseRef.current.x, mouseRef.current.y, 0,
            mouseRef.current.x, mouseRef.current.y, 100
          );
          gradient.addColorStop(0, 'rgba(139, 92, 246, 0.2)');
          gradient.addColorStop(1, 'rgba(139, 92, 246, 0)');
          
          ctx.beginPath();
          ctx.arc(mouseRef.current.x, mouseRef.current.y, 100, 0, Math.PI * 2);
          ctx.fillStyle = gradient;
          ctx.fill();
        }
      }
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    // Add event listeners
    const setupEventListeners = () => {
      const handleMouseMove = (e: MouseEvent) => {
        mouseRef.current = {
          x: e.clientX,
          y: e.clientY,
          active: e.buttons === 1, // Check if mouse button is pressed
        };
      };
      
      const handleMouseDown = () => {
        if (mouseRef.current) {
          mouseRef.current.active = true;
        }
      };
      
      const handleMouseUp = () => {
        if (mouseRef.current) {
          mouseRef.current.active = false;
        }
      };
      
      const handleTouchStart = (e: TouchEvent) => {
        const touch = e.touches[0];
        mouseRef.current = {
          x: touch.clientX,
          y: touch.clientY,
          active: true,
        };
      };
      
      const handleTouchMove = (e: TouchEvent) => {
        const touch = e.touches[0];
        if (mouseRef.current) {
          mouseRef.current.x = touch.clientX;
          mouseRef.current.y = touch.clientY;
        } else {
          mouseRef.current = {
            x: touch.clientX,
            y: touch.clientY,
            active: true,
          };
        }
      };
      
      const handleTouchEnd = () => {
        if (mouseRef.current) {
          mouseRef.current.active = false;
          // Remove mouse reference after a delay
          setTimeout(() => {
            mouseRef.current = null;
          }, 3000);
        }
      };
      
      const handleResize = () => {
        setCanvasDimensions();
        createNodes();
      };
      
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mousedown', handleMouseDown);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchstart', handleTouchStart);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleTouchEnd);
      window.addEventListener('resize', handleResize);
      
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mousedown', handleMouseDown);
        window.removeEventListener('mouseup', handleMouseUp);
        window.removeEventListener('touchstart', handleTouchStart);
        window.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('touchend', handleTouchEnd);
        window.removeEventListener('resize', handleResize);
      };
    };

    // Initialize
    setCanvasDimensions();
    createNodes();
    const cleanupListeners = setupEventListeners();
    animationFrameRef.current = requestAnimationFrame(animate);

    // Cleanup on unmount
    return () => {
      cleanupListeners();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 pointer-events-none z-[-1]"
    />
  );
} 