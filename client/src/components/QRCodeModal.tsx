import { X } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { saveAs } from 'file-saver';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: string;
  address?: string;
}

const QRCodeModal = ({ isOpen, onClose, data, address }: QRCodeModalProps) => {
  const handleDownload = () => {
    const canvas = document.getElementById('qr-code-canvas') as HTMLCanvasElement;
    if (canvas) {
      canvas.toBlob((blob) => {
        if (blob) {
          saveAs(blob, 'blocksign-qrcode.png');
        }
      });
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        const canvas = document.getElementById('qr-code-canvas') as HTMLCanvasElement;
        const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve));
        
        if (blob) {
          const file = new File([blob], 'blocksign-qrcode.png', { type: 'image/png' });
          await navigator.share({
            title: 'BlockSign Signature QR Code',
            text: 'Scan this QR code to verify my blockchain signature',
            files: [file]
          });
        }
      } catch (error) {
        console.error('Error sharing QR code:', error);
      }
    } else {
      alert('Web Share API is not supported in your browser');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-medium">Signature QR Code</DialogTitle>
          <button 
            onClick={onClose}
            className="absolute right-4 top-4 text-slate-400 hover:text-slate-500 dark:hover:text-slate-300"
          >
            <X className="h-4 w-4" />
          </button>
        </DialogHeader>
        
        <div className="p-2 text-center">
          <div className="mb-4 bg-white inline-block p-4 rounded-lg">
            <QRCodeCanvas
              id="qr-code-canvas"
              value={data}
              size={200}
              level="H"
              includeMargin={true}
            />
          </div>
          
          {address && (
            <div className="mb-4">
              <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-1">Signer</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400">{address}</p>
            </div>
          )}
          
          <div className="flex justify-center space-x-3">
            <Button
              variant="outline"
              onClick={handleDownload}
              className="px-4 py-2 text-sm font-medium"
            >
              Download
            </Button>
            <Button
              onClick={handleShare}
              className="px-4 py-2 text-sm font-medium"
            >
              Share
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QRCodeModal;
