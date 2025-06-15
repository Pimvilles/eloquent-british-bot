
import React, { useRef, useEffect } from 'react';

const MatrixRain = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.log('[MatrixRain] Canvas ref not found');
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.log('[MatrixRain] Canvas context not available');
      return;
    }
    
    console.log('[MatrixRain] Initializing canvas...');
    
    // Set canvas size
    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = 300;
      console.log(`[MatrixRain] Canvas size set to ${canvas.width}x${canvas.height}`);
    };
    
    setCanvasSize();
    
    const characters = '01';
    const charArray = characters.split('');
    const fontSize = 16;
    let columns = Math.floor(canvas.width / fontSize);
    let drops: number[] = [];

    console.log(`[MatrixRain] Columns: ${columns}`);

    // Initialize drops
    for (let x = 0; x < columns; x++) {
      drops[x] = Math.random() * -100;
    }

    let animationFrameId: number;

    const draw = () => {
      // Semi-transparent black background for trail effect
      ctx.fillStyle = 'rgba(22, 27, 34, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Blue text
      ctx.fillStyle = '#3b82f6';
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        // Random character
        const text = charArray[Math.floor(Math.random() * charArray.length)];
        
        // Draw character
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        // Reset drop when it goes off screen
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        
        drops[i]++;
      }
      
      animationFrameId = requestAnimationFrame(draw);
    };
    
    // Start animation
    console.log('[MatrixRain] Starting animation...');
    draw();

    const handleResize = () => {
      setCanvasSize();
      columns = Math.floor(canvas.width / fontSize);
      // Reset drops for new column count
      drops = [];
      for (let x = 0; x < columns; x++) {
        drops[x] = Math.random() * -100;
      }
      console.log('[MatrixRain] Resized and reset drops');
    };

    window.addEventListener('resize', handleResize);

    return () => {
      console.log('[MatrixRain] Cleaning up...');
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute top-0 left-0 w-full h-[300px] z-0 pointer-events-none" 
      style={{ display: 'block' }}
    />
  );
};

export default MatrixRain;
