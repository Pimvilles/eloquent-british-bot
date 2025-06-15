
import React, { useRef, useEffect } from 'react';

const MatrixRain = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = 300;

    const characters = '01';
    const charArray = characters.split('');
    const fontSize = 16;
    let columns = Math.floor(width / fontSize);
    let drops: number[] = [];

    const resetDrops = () => {
        drops = [];
        for (let x = 0; x < columns; x++) {
            drops[x] = 1 + Math.random() * 250;
        }
    }
    resetDrops();


    let animationFrameId: number;

    let lastTime = 0;
    const fps = 20;
    const interval = 1000 / fps;

    const draw = (timestamp: number) => {
      animationFrameId = requestAnimationFrame(draw);
      if (timestamp - lastTime < interval) {
        return;
      }
      lastTime = timestamp;

      if (!ctx) return;
      ctx.fillStyle = 'rgba(22, 27, 34, 0.1)';
      ctx.fillRect(0, 0, width, height);
      
      ctx.fillStyle = '#3b82f6';
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = charArray[Math.floor(Math.random() * charArray.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };
    
    draw(0);

    const handleResize = () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = 300;
        columns = Math.floor(width / fontSize);
        resetDrops();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-[300px] z-0" />;
};

export default MatrixRain;
