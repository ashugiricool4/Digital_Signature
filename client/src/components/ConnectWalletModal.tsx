import { useState } from 'react';
import { X, ChevronRight } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { WALLET_TYPES } from '@/lib/constants';
import { useWallet } from '@/hooks/useWallet';

interface ConnectWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ConnectWalletModal = ({ isOpen, onClose }: ConnectWalletModalProps) => {
  const { connectWallet } = useWallet();
  const [connecting, setConnecting] = useState(false);
  
  const handleConnect = async (walletType: string) => {
    try {
      setConnecting(true);
      await connectWallet(walletType);
      onClose();
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    } finally {
      setConnecting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-medium">Connect Wallet</DialogTitle>
          <button 
            onClick={onClose}
            className="absolute right-4 top-4 text-slate-400 hover:text-slate-500 dark:hover:text-slate-300"
          >
            <X className="h-4 w-4" />
          </button>
        </DialogHeader>
        
        <div className="p-2">
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            Connect your blockchain wallet to sign and verify messages.
          </p>
          
          <div className="space-y-3">
            {Object.entries(WALLET_TYPES).map(([id, wallet]) => (
              <button
                key={id}
                disabled={!wallet.supported || connecting}
                onClick={() => handleConnect(id)}
                className="w-full flex items-center p-3 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3">
                  {wallet.icon}
                </div>
                <div className="flex-1 text-left">
                  <h4 className="font-medium text-slate-900 dark:text-white">{wallet.name}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{wallet.description}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </button>
            ))}
          </div>
          
          <div className="mt-6 text-center">
            <a href="/learn" className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400">
              What is a blockchain wallet?
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConnectWalletModal;
