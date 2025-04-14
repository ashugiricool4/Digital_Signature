import { useEffect, useRef } from 'react';
import { Download } from 'lucide-react';
import { saveAs } from 'file-saver';

interface SignatureVisualizationProps {
  signature: string;
  message?: string;
  type?: 'standard' | 'animated' | 'color';
}

const SignatureVisualization = ({ signature, message, type = 'standard' }: SignatureVisualizationProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Generate a visualization based on the signature
  useEffect(() => {
    if (!signature || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Remove 0x prefix if present
    const cleanSignature = signature.startsWith('0x') ? signature.slice(2) : signature;
    
    // Use signature to generate visualization
    const bytes = cleanSignature.match(/.{1,2}/g) || [];
    const values = bytes.map(byte => parseInt(byte, 16));
    
    // Set style based on type
    let strokeColor = '#6366f1'; // primary color
    
    if (type === 'color') {
      // Generate color from first bytes
      const r = values[0] || 0;
      const g = values[1] || 0;
      const b = values[2] || 0;
      strokeColor = `rgb(${r}, ${g}, ${b})`;
    }
    
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Draw path
    ctx.beginPath();
    
    // Start from the middle
    const startX = 10;
    const startY = canvas.height / 2;
    ctx.moveTo(startX, startY);
    
    // Use values from signature to create a unique path
    const step = (canvas.width - 20) / Math.min(values.length, 20);
    
    for (let i = 0; i < Math.min(values.length, 20); i++) {
      const value = values[i];
      const normalizedValue = (value / 255) * (canvas.height - 20) + 10;
      ctx.lineTo(startX + (i + 1) * step, normalizedValue);
    }
    
    ctx.stroke();
    
    // Add pulse animation if type is 'animated'
    if (type === 'animated') {
      let opacity = 0.6;
      let direction = 0.01;
      
      const animate = () => {
        // Only animate if we're still mounted
        if (!canvasRef.current) return;
        
        opacity += direction;
        if (opacity >= 1 || opacity <= 0.6) {
          direction = -direction;
        }
        
        ctx.globalAlpha = opacity;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        
        for (let i = 0; i < Math.min(values.length, 20); i++) {
          const value = values[i];
          const normalizedValue = (value / 255) * (canvas.height - 20) + 10;
          ctx.lineTo(startX + (i + 1) * step, normalizedValue);
        }
        
        ctx.stroke();
        
        requestAnimationFrame(animate);
      };
      
      const animationId = requestAnimationFrame(animate);
      
      return () => {
        cancelAnimationFrame(animationId);
      };
    }
  }, [signature, type]);
  
  const handleExport = () => {
    if (canvasRef.current) {
      canvasRef.current.toBlob(function(blob) {
        if (blob) {
          saveAs(blob, 'signature-visualization.png');
        }
      });
    }
  };
  
  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-3 mt-3">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Signature Visualization</span>
        <button 
          onClick={handleExport}
          className="text-xs text-primary-600 dark:text-primary-400 flex items-center"
        >
          <Download className="w-3 h-3 mr-1" />
          Export as Image
        </button>
      </div>
      <div className="bg-slate-100 dark:bg-slate-800 rounded p-3 h-16 flex items-center justify-center">
        <canvas 
          ref={canvasRef} 
          width="220" 
          height="40" 
          className={type === 'animated' ? 'signature-pulse' : ''}
        />
      </div>
    </div>
  );
};

export default SignatureVisualization;
