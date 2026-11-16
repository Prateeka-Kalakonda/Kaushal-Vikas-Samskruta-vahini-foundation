import React, { useEffect, useRef } from 'react';
import p5 from 'p5';

const P5Renderer = ({ params }) => {
  const renderRef = useRef();

  useEffect(() => {
    const Sketch = (p) => {
      let x = 0;
      
      p.setup = () => {
        p.createCanvas(renderRef.current.clientWidth, renderRef.current.clientHeight);
      };

      p.draw = () => {
        p.background(248, 250, 252); // Slate-50
        p.fill(59, 130, 246); // Blue-500
        p.noStroke();
        
        // Simple oscillation based on params
        let amplitude = (params.amplitude || 50);
        let speed = (params.speed || 0.05);
        
        let y = p.height / 2 + p.sin(p.frameCount * speed) * amplitude;
        p.ellipse(p.width / 2, y, 50, 50);
        
        // Draw a label
        p.fill(100);
        p.text(`Amplitude: ${amplitude}`, 20, 20);
      };

      p.windowResized = () => {
        p.resizeCanvas(renderRef.current.clientWidth, renderRef.current.clientHeight);
      };
    };

    const myP5 = new p5(Sketch, renderRef.current);

    return () => myP5.remove();
  }, [params]);

  return <div ref={renderRef} className="w-full h-full" />;
};

export default P5Renderer;