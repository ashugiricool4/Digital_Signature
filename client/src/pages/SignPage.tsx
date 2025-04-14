import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Clipboard, RefreshCw, Copy, QrCode, Save, FileText, Code, Repeat, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useWallet } from '@/hooks/useWallet';
import ConnectWalletModal from '@/components/ConnectWalletModal';
import QRCodeModal from '@/components/QRCodeModal';
import NetworkBadge from '@/components/NetworkBadge';
import SignatureVisualization from '@/components/SignatureVisualization';
import { MESSAGE_TYPES, DOCUMENT_TEMPLATES, EXAMPLE_TYPED_DATA } from '@/lib/constants';
import { signMessage, signTypedData, signDocument } from '@/lib/blocksign';
import { truncateAddress, formatDateTime } from '@/lib/utils';

const SignPage = () => {
  const { connected, address, chainId, ensName } = useWallet();
  const [messageType, setMessageType] = useState<string>(MESSAGE_TYPES.TEXT);
  const [message, setMessage] = useState<string>('');
  const [signature, setSignature] = useState<string>('');
  const [signingError, setSigningError] = useState<string | null>(null);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState<boolean>(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState<boolean>(false);
  const [isSigningInProgress, setIsSigningInProgress] = useState<boolean>(false);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [documentHash, setDocumentHash] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [structuredData, setStructuredData] = useState<any>(EXAMPLE_TYPED_DATA);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Initialize with a default message
  useEffect(() => {
    setMessage('I agree to the terms and conditions of BlockSign on ' + new Date().toLocaleDateString() + '.');
  }, []);

  // Update document template when selected
  useEffect(() => {
    if (selectedTemplate) {
      const template = DOCUMENT_TEMPLATES.find(t => t.id === selectedTemplate);
      if (template) {
        // Replace placeholders
        let content = template.content;
        content = content.replace('[SIGNER NAME]', ensName || truncateAddress(address || ''));
        content = content.replace('[DATE]', new Date().toLocaleDateString());
        content = content.replace('[TIME]', new Date().toLocaleTimeString());
        content = content.replace('[RANDOM_ID]', Math.random().toString(36).substring(2, 10).toUpperCase());
        setMessage(content);
      }
    }
  }, [selectedTemplate, ensName, address]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setDocumentFile(file);
    }
  };

  const handleBrowseFiles = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setDocumentFile(file);
    }
  };

  const handlePaste = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      setMessage(clipboardText);
      toast({
        title: "Pasted from clipboard",
        description: "The text has been pasted into the message field.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Paste failed",
        description: "Could not read from clipboard. Make sure you've granted permission.",
      });
    }
  };

  const handleClear = () => {
    setMessage('');
    setSignature('');
    setDocumentFile(null);
    setDocumentHash(null);
    setSigningError(null);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "The content has been copied to your clipboard.",
    });
  };

  const handleSign = async () => {
    if (!connected) {
      setIsWalletModalOpen(true);
      return;
    }

    if (!message && messageType !== MESSAGE_TYPES.DOCUMENT) {
      toast({
        variant: "destructive",
        title: "No message to sign",
        description: "Please enter a message before signing.",
      });
      return;
    }

    if (messageType === MESSAGE_TYPES.DOCUMENT && !documentFile) {
      toast({
        variant: "destructive",
        title: "No document selected",
        description: "Please select a document to sign.",
      });
      return;
    }

    try {
      setIsSigningInProgress(true);
      setSigningError(null);
      let signatureResult = '';
      
      switch (messageType) {
        case MESSAGE_TYPES.TEXT:
          signatureResult = await signMessage(message);
          break;
        
        case MESSAGE_TYPES.STRUCTURED:
          signatureResult = await signTypedData(structuredData);
          break;
        
        case MESSAGE_TYPES.DOCUMENT:
          if (documentFile) {
            const result = await signDocument(documentFile);
            signatureResult = result.signature;
            setDocumentHash(result.hash);
          }
          break;
          
        case MESSAGE_TYPES.TRANSACTION:
          // Transaction signing would be implemented here
          // For now, we'll just sign a message describing the transaction
          signatureResult = await signMessage(`Transaction: ${message}`);
          break;
      }
      
      setSignature(signatureResult);
      
      // Save to history in localStorage
      saveToHistory(signatureResult);
      
      toast({
        title: "Signature successful",
        description: "Your message has been successfully signed.",
      });
    } catch (error) {
      console.error('Signing error:', error);
      setSigningError((error as Error).message);
      toast({
        variant: "destructive",
        title: "Signing failed",
        description: (error as Error).message,
      });
    } finally {
      setIsSigningInProgress(false);
    }
  };

  const saveToHistory = (sig: string) => {
    try {
      const historyItem = {
        id: Date.now().toString(),
        message: message.substring(0, 100) + (message.length > 100 ? '...' : ''),
        originalMessage: message,
        signature: sig,
        timestamp: Date.now(),
        valid: true,
        messageType: messageType,
        chainId: chainId || 1,
        documentHash: documentHash,
        documentName: documentFile?.name,
        signerEns: ensName,
        signerAddress: address || '',
      };
      
      // Get existing history or initialize
      const existingHistory = JSON.parse(localStorage.getItem('signatureHistory') || '[]');
      const updatedHistory = [historyItem, ...existingHistory.slice(0, 49)]; // Keep latest 50 items
      
      localStorage.setItem('signatureHistory', JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Failed to save to history:', error);
    }
  };

  return (
    <>
      {/* Connection Banner */}
      {!connected && (
        <div className="mb-6 p-4 border border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <AlertTriangle className="text-amber-500 mr-3" />
              <p className="text-sm text-amber-800 dark:text-amber-200">
                Connect your wallet to sign messages and documents.
              </p>
            </div>
            <Button 
              onClick={() => setIsWalletModalOpen(true)}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
            >
              Connect Wallet
            </Button>
          </div>
        </div>
      )}

      {/* Message Type Selector */}
      <div className="mb-6">
        <Label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
          Message Type
        </Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <RadioGroup 
            value={messageType} 
            onValueChange={setMessageType}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3"
          >
            <div className="relative flex">
              <RadioGroupItem value={MESSAGE_TYPES.TEXT} id="messageType-text" className="sr-only peer" />
              <Label 
                htmlFor="messageType-text"
                className="w-full p-3 border rounded-lg border-slate-300 dark:border-slate-600 cursor-pointer peer-data-[state=checked]:border-primary-500 peer-data-[state=checked]:ring-1 peer-data-[state=checked]:ring-primary-500 dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0 p-1 bg-primary-100 dark:bg-primary-900/50 rounded-md mr-3">
                    <FileText className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <h3 className="font-medium">Text Message</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Simple text message signing</p>
                  </div>
                </div>
              </Label>
            </div>
            
            <div className="relative flex">
              <RadioGroupItem value={MESSAGE_TYPES.STRUCTURED} id="messageType-structured" className="sr-only peer" />
              <Label 
                htmlFor="messageType-structured"
                className="w-full p-3 border rounded-lg border-slate-300 dark:border-slate-600 cursor-pointer peer-data-[state=checked]:border-primary-500 peer-data-[state=checked]:ring-1 peer-data-[state=checked]:ring-primary-500 dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0 p-1 bg-blue-100 dark:bg-blue-900/50 rounded-md mr-3">
                    <Code className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-medium">Structured Data</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">EIP-712 typed data</p>
                  </div>
                </div>
              </Label>
            </div>
            
            <div className="relative flex">
              <RadioGroupItem value={MESSAGE_TYPES.DOCUMENT} id="messageType-document" className="sr-only peer" />
              <Label 
                htmlFor="messageType-document"
                className="w-full p-3 border rounded-lg border-slate-300 dark:border-slate-600 cursor-pointer peer-data-[state=checked]:border-primary-500 peer-data-[state=checked]:ring-1 peer-data-[state=checked]:ring-primary-500 dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0 p-1 bg-emerald-100 dark:bg-emerald-900/50 rounded-md mr-3">
                    <FileText className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-medium">Document</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Document hash signing</p>
                  </div>
                </div>
              </Label>
            </div>
            
            <div className="relative flex">
              <RadioGroupItem value={MESSAGE_TYPES.TRANSACTION} id="messageType-transaction" className="sr-only peer" />
              <Label 
                htmlFor="messageType-transaction"
                className="w-full p-3 border rounded-lg border-slate-300 dark:border-slate-600 cursor-pointer peer-data-[state=checked]:border-primary-500 peer-data-[state=checked]:ring-1 peer-data-[state=checked]:ring-primary-500 dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0 p-1 bg-purple-100 dark:bg-purple-900/50 rounded-md mr-3">
                    <Repeat className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-medium">Transaction</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Transaction data signing</p>
                  </div>
                </div>
              </Label>
            </div>
          </RadioGroup>
        </div>
      </div>

      {/* Text Message Input */}
      {messageType === MESSAGE_TYPES.TEXT && (
        <div className="mb-6">
          <div className="mb-4">
            <div className="flex justify-between mb-2">
              <Label htmlFor="message" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Message Content
              </Label>
              <div className="flex items-center">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handlePaste}
                  className="text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 mr-3"
                >
                  <Clipboard className="h-3 w-3 mr-1" />Paste
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleClear}
                  className="text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />Clear
                </Button>
              </div>
            </div>
            <Textarea
              id="message"
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="block w-full rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-slate-800 dark:text-white placeholder-slate-400"
              placeholder="Enter the message you want to sign..."
            />
          </div>
          
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
            <Button 
              onClick={handleSign}
              disabled={isSigningInProgress || !message}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:ring-primary-300 dark:focus:ring-primary-800 rounded-lg transition-colors"
            >
              {isSigningInProgress ? 'Signing...' : 'Sign Message'}
            </Button>
            <div className="flex space-x-3">
              <Button 
                variant="outline" 
                onClick={() => handleCopy(message)}
                disabled={!message}
                className="px-4 py-2 text-sm font-medium"
              >
                <Copy className="h-4 w-4 mr-1" />Copy
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsQrModalOpen(true)}
                disabled={!signature}
                className="px-4 py-2 text-sm font-medium"
              >
                <QrCode className="h-4 w-4 mr-1" />QR Code
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Document Message UI */}
      {messageType === MESSAGE_TYPES.DOCUMENT && (
        <div className="mb-6">
          <div 
            className="p-4 border border-dashed border-slate-300 dark:border-slate-600 rounded-lg text-center mb-4"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {documentFile ? (
              <div className="space-y-2">
                <FileText className="h-8 w-8 mx-auto text-primary-500" />
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{documentFile.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {(documentFile.size / 1024).toFixed(2)} KB - {documentFile.type || 'Unknown type'}
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setDocumentFile(null)}
                  className="text-xs"
                >
                  Remove file
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="h-8 w-8 mx-auto text-slate-400 dark:text-slate-500" />
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Drag & drop file or
                  <Button 
                    variant="link" 
                    onClick={handleBrowseFiles}
                    className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium p-0 h-auto"
                  >
                    browse files
                  </Button>
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500">Supports PDF, DOC, DOCX, TXT up to 10MB</p>
              </div>
            )}
            <input 
              type="file" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept=".pdf,.doc,.docx,.txt" 
            />
          </div>
          
          <div className="mb-4">
            <Label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
              Document Template (Optional)
            </Label>
            <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a template" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No template</SelectItem>
                {DOCUMENT_TEMPLATES.map(template => (
                  <SelectItem key={template.id} value={template.id}>{template.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
            <Button 
              onClick={handleSign}
              disabled={isSigningInProgress || (!documentFile && !message)}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:ring-primary-300 dark:focus:ring-primary-800 rounded-lg transition-colors"
            >
              {isSigningInProgress ? 'Signing...' : 'Sign Document'}
            </Button>
            <div className="flex space-x-3">
              <Button 
                variant="outline" 
                onClick={() => {
                  // Either save the document or the template
                  if (message) {
                    const blob = new Blob([message], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'document.txt';
                    a.click();
                    URL.revokeObjectURL(url);
                  }
                }}
                disabled={!message}
                className="px-4 py-2 text-sm font-medium"
              >
                <Save className="h-4 w-4 mr-1" />Save
              </Button>
              <Button 
                variant="outline" 
                onClick={handleClear}
                className="px-4 py-2 text-sm font-medium"
              >
                <RefreshCw className="h-4 w-4 mr-1" />Reset
              </Button>
            </div>
          </div>
          
          {selectedTemplate && (
            <div className="mt-4 p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
              <h4 className="font-medium text-sm mb-2">Template Preview:</h4>
              <pre className="whitespace-pre-wrap text-xs font-mono bg-slate-50 dark:bg-slate-800 p-3 rounded">{message}</pre>
            </div>
          )}
        </div>
      )}
      
      {/* Structured Data UI */}
      {messageType === MESSAGE_TYPES.STRUCTURED && (
        <div className="mb-6">
          <div className="mb-4">
            <Label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
              Structured Data (EIP-712)
            </Label>
            <Textarea
              rows={10}
              value={JSON.stringify(structuredData, null, 2)}
              onChange={(e) => {
                try {
                  setStructuredData(JSON.parse(e.target.value));
                } catch (error) {
                  // Invalid JSON, just update the text
                }
              }}
              className="font-mono text-sm block w-full rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-slate-800 dark:text-white"
            />
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Advanced: Edit the structured data directly in JSON format
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
            <Button 
              onClick={handleSign}
              disabled={isSigningInProgress}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:ring-primary-300 dark:focus:ring-primary-800 rounded-lg transition-colors"
            >
              {isSigningInProgress ? 'Signing...' : 'Sign Structured Data'}
            </Button>
            <div className="flex space-x-3">
              <Button 
                variant="outline" 
                onClick={() => {
                  setStructuredData(EXAMPLE_TYPED_DATA);
                  toast({
                    title: "Reset to example",
                    description: "The structured data has been reset to the example.",
                  });
                }}
                className="px-4 py-2 text-sm font-medium"
              >
                <RefreshCw className="h-4 w-4 mr-1" />Reset
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Transaction UI */}
      {messageType === MESSAGE_TYPES.TRANSACTION && (
        <div className="mb-6">
          <div className="mb-4">
            <Label htmlFor="transaction-description" className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
              Transaction Description
            </Label>
            <Textarea
              id="transaction-description"
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="block w-full rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-slate-800 dark:text-white placeholder-slate-400"
              placeholder="Enter a description of the transaction (e.g., 'Transfer 0.5 ETH to 0x...')"
            />
          </div>
          
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
            <Button 
              onClick={handleSign}
              disabled={isSigningInProgress || !message}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:ring-primary-300 dark:focus:ring-primary-800 rounded-lg transition-colors"
            >
              {isSigningInProgress ? 'Signing...' : 'Sign Transaction'}
            </Button>
          </div>
          
          <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
            Note: This is a simplified transaction signing example. Actual blockchain transactions would use 
            specialized methods like eth_sendTransaction.
          </p>
        </div>
      )}
      
      {/* Signature Result Box */}
      <AnimatePresence>
        {signature && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mt-6 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden"
          >
            <div className="bg-slate-50 dark:bg-slate-800 px-4 py-3 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-slate-700 dark:text-slate-300">Signature Result</h3>
                <div className="flex items-center space-x-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1"></span>Verified
                  </span>
                  <button 
                    onClick={() => setSignature('')} 
                    className="p-1 text-slate-400 hover:text-slate-500 dark:hover:text-slate-300"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
            <div className="p-4 bg-white dark:bg-slate-900">
              <div className="space-y-4">
                {/* Signature */}
                <div>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1">Signature</span>
                  <div className="flex items-center">
                    <div className="flex-1 font-mono text-xs bg-slate-50 dark:bg-slate-800 p-2 rounded border border-slate-200 dark:border-slate-700 overflow-x-auto">
                      {signature}
                    </div>
                    <button 
                      onClick={() => handleCopy(signature)}
                      className="ml-2 p-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300" 
                      aria-label="Copy signature"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                {/* Signature Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Signer Information */}
                  <div>
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1">Signer</span>
                    <div className="flex items-center">
                      <div className="p-1.5 rounded-full bg-primary-100 dark:bg-primary-900/40 mr-2">
                        <svg viewBox="0 0 24 24" width="16" height="16" className="text-primary-600 dark:text-primary-400">
                          <path
                            fill="currentColor"
                            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"
                          />
                        </svg>
                      </div>
                      <div className="truncate">
                        <div className="font-medium text-sm">{ensName || 'Unknown'}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 truncate">{address}</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Timestamp */}
                  <div>
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1">Timestamp</span>
                    <div className="flex items-center">
                      <div className="p-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 mr-2">
                        <svg viewBox="0 0 24 24" width="16" height="16" className="text-emerald-600 dark:text-emerald-400">
                          <path
                            fill="currentColor"
                            d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"
                          />
                          <path
                            fill="currentColor"
                            d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z"
                          />
                        </svg>
                      </div>
                      <div>
                        <div className="font-medium text-sm">{formatDateTime(Date.now()).split(',')[0]}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">{new Date().toLocaleTimeString()} UTC</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Network Information */}
                {chainId && (
                  <div>
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1">Network</span>
                    <div className="flex items-center">
                      <div className="p-1.5 rounded-full bg-blue-100 dark:bg-blue-900/40 mr-2">
                        <svg viewBox="0 0 24 24" width="16" height="16" className="text-blue-600 dark:text-blue-400">
                          <path
                            fill="currentColor"
                            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"
                          />
                        </svg>
                      </div>
                      <NetworkBadge chainId={chainId} />
                    </div>
                  </div>
                )}
                
                {/* Visual Signature Representation */}
                <SignatureVisualization signature={signature} type="animated" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Modals */}
      <ConnectWalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
      />
      
      <QRCodeModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        data={signature}
        address={address || undefined}
      />
    </>
  );
};

export default SignPage;
