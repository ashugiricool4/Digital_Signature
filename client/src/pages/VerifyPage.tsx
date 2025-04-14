import { useState } from 'react';
import { 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  Copy, 
  Upload, 
  ExternalLink 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  verifyMessage, 
  verifyTypedData, 
  verifyDocumentSignature, 
  lookupENSName 
} from '@/lib/blocksign';
import { calculateDocumentHash } from '@/lib/utils';
import { VerificationResult, EXAMPLE_TYPED_DATA, MESSAGE_TYPES } from '@/lib/constants';
import { truncateAddress } from '@/lib/utils';

const VerifyPage = () => {
  const [signature, setSignature] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [messageType, setMessageType] = useState<string>(MESSAGE_TYPES.TEXT);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [documentHash, setDocumentHash] = useState<string | null>(null);
  const [typedData, setTypedData] = useState<any>(EXAMPLE_TYPED_DATA);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [ensName, setEnsName] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const fileInputRef = useState<HTMLInputElement | null>(null);
  const { toast } = useToast();

  const handleVerify = async () => {
    if (!signature) {
      toast({
        variant: "destructive",
        title: "Missing signature",
        description: "Please provide a signature to verify.",
      });
      return;
    }

    if (messageType === MESSAGE_TYPES.TEXT && !message) {
      toast({
        variant: "destructive",
        title: "Missing message",
        description: "Please provide the original message that was signed.",
      });
      return;
    }

    if (messageType === MESSAGE_TYPES.DOCUMENT && !documentHash) {
      toast({
        variant: "destructive",
        title: "Missing document",
        description: "Please upload the document to verify its signature.",
      });
      return;
    }

    try {
      setIsVerifying(true);
      let result: VerificationResult;

      switch (messageType) {
        case MESSAGE_TYPES.TEXT:
          result = await verifyMessage(message, signature);
          break;
        
        case MESSAGE_TYPES.STRUCTURED:
          result = await verifyTypedData(typedData, signature);
          break;
        
        case MESSAGE_TYPES.DOCUMENT:
          if (!documentHash) {
            throw new Error('Document hash is required');
          }
          result = await verifyDocumentSignature(documentHash, signature);
          break;
        
        default:
          // For now just use text verification for transaction type
          result = await verifyMessage(message, signature);
      }

      setVerificationResult(result);

      // Look up ENS name if verification is successful
      if (result.valid && result.recoveredAddress) {
        const name = await lookupENSName(result.recoveredAddress);
        setEnsName(name);
      } else {
        setEnsName(null);
      }

      if (result.valid) {
        toast({
          title: "Verification successful",
          description: "The signature is valid.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Verification failed",
          description: result.error || "The signature is invalid.",
        });
      }
    } catch (error) {
      console.error('Verification error:', error);
      setVerificationResult({
        valid: false,
        error: (error as Error).message,
        timestamp: Date.now(),
      });
      
      toast({
        variant: "destructive",
        title: "Verification error",
        description: (error as Error).message,
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setDocumentFile(file);
      
      try {
        const hash = await calculateDocumentHash(file);
        setDocumentHash(hash);
        toast({
          title: "Document loaded",
          description: `Document hash: ${hash.substring(0, 10)}...`,
        });
      } catch (error) {
        console.error('Error calculating document hash:', error);
        toast({
          variant: "destructive",
          title: "Error processing document",
          description: (error as Error).message,
        });
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setDocumentFile(file);
      
      try {
        const hash = await calculateDocumentHash(file);
        setDocumentHash(hash);
        toast({
          title: "Document loaded",
          description: `Document hash: ${hash.substring(0, 10)}...`,
        });
      } catch (error) {
        console.error('Error calculating document hash:', error);
        toast({
          variant: "destructive",
          title: "Error processing document",
          description: (error as Error).message,
        });
      }
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-medium text-slate-900 dark:text-white mb-1">Verify Blockchain Signature</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Paste the signature and message to verify authenticity.
        </p>
      </div>

      {/* Verification Form */}
      <div className="space-y-6">
        {/* Signature Input */}
        <div>
          <Label htmlFor="verify-signature" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Signature <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="verify-signature"
            rows={3}
            value={signature}
            onChange={(e) => setSignature(e.target.value)}
            className="block w-full rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-slate-800 dark:text-white placeholder-slate-400 font-mono text-sm"
            placeholder="0x..."
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Enter the cryptographic signature starting with 0x
          </p>
        </div>
        
        {/* Message Input */}
        <div>
          <Label htmlFor="verify-message" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Message <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="verify-message"
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="block w-full rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-slate-800 dark:text-white placeholder-slate-400"
            placeholder="Enter the original message that was signed..."
          />
        </div>
        
        {/* Message Type */}
        <div>
          <Label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Message Type
          </Label>
          <RadioGroup 
            value={messageType} 
            onValueChange={(value) => {
              setMessageType(value);
              setVerificationResult(null);
            }}
            className="flex space-x-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value={MESSAGE_TYPES.TEXT} id="verify-type-text" />
              <Label htmlFor="verify-type-text">Text</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value={MESSAGE_TYPES.STRUCTURED} id="verify-type-structured" />
              <Label htmlFor="verify-type-structured">Structured</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value={MESSAGE_TYPES.DOCUMENT} id="verify-type-document" />
              <Label htmlFor="verify-type-document">Document</Label>
            </div>
          </RadioGroup>
        </div>
        
        {/* Document Upload (Conditionally Shown) */}
        {messageType === MESSAGE_TYPES.DOCUMENT && (
          <div>
            <Label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Upload Document
            </Label>
            <div 
              className="p-4 border border-dashed border-slate-300 dark:border-slate-600 rounded-lg text-center"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              {documentFile ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-center">
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full">
                      <svg viewBox="0 0 24 24" width="24" height="24" className="text-blue-600 dark:text-blue-400">
                        <path
                          fill="currentColor"
                          d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"
                        />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{documentFile.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {(documentFile.size / 1024).toFixed(2)} KB • Hash: {documentHash ? `${documentHash.substring(0, 10)}...` : 'Calculating...'}
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      setDocumentFile(null);
                      setDocumentHash(null);
                    }}
                  >
                    Choose different file
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="h-6 w-6 mx-auto text-slate-400 dark:text-slate-500" />
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Upload document to verify against signature
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">The document hash will be generated and compared</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      if (fileInputRef) {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = '.pdf,.doc,.docx,.txt';
                        input.onchange = (e) => handleFileChange(e as React.ChangeEvent<HTMLInputElement>);
                        input.click();
                      }
                    }}
                  >
                    Select file
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Structured Data Input (Conditionally Shown) */}
        {messageType === MESSAGE_TYPES.STRUCTURED && (
          <div>
            <Label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Structured Data (EIP-712)
            </Label>
            <Textarea
              rows={6}
              value={JSON.stringify(typedData, null, 2)}
              onChange={(e) => {
                try {
                  setTypedData(JSON.parse(e.target.value));
                } catch (error) {
                  // Invalid JSON, just update the text
                }
              }}
              className="font-mono text-sm block w-full rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-slate-800 dark:text-white"
            />
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Enter the original typed data used for signing in JSON format
            </p>
          </div>
        )}
        
        {/* Submit Button */}
        <div>
          <Button 
            onClick={handleVerify}
            disabled={isVerifying || !signature || (messageType === MESSAGE_TYPES.DOCUMENT && !documentHash)}
            className="w-full px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:ring-primary-300 dark:focus:ring-primary-800 rounded-lg transition-colors"
          >
            {isVerifying ? 'Verifying...' : 'Verify Signature'}
          </Button>
        </div>
      </div>
      
      {/* Verification Results */}
      {verificationResult && (
        <div className="mt-8">
          <h3 className="text-md font-medium text-slate-900 dark:text-white mb-4">Verification Results</h3>
          
          {verificationResult.valid ? (
            /* Success Result */
            <div className="border border-green-200 dark:border-green-800 rounded-lg bg-green-50 dark:bg-green-900/20 overflow-hidden">
              <div className="p-4 flex items-start">
                <div className="flex-shrink-0 mr-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-800/40 flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-green-800 dark:text-green-400">Valid Signature</h4>
                  <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                    This signature is cryptographically valid and was signed by the claimed address.
                  </p>
                  
                  <div className="mt-3 bg-white dark:bg-slate-800 rounded-md p-3 border border-green-200 dark:border-green-800">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Signer Address */}
                      <div>
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1">Signer</span>
                        <div className="flex items-center">
                          <div className="truncate font-mono text-xs">
                            {verificationResult.recoveredAddress}
                          </div>
                          <button 
                            onClick={() => {
                              if (verificationResult.recoveredAddress) {
                                navigator.clipboard.writeText(verificationResult.recoveredAddress);
                                toast({
                                  title: "Copied to clipboard",
                                  description: "The address has been copied to your clipboard.",
                                });
                              }
                            }} 
                            className="ml-2 p-1 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300" 
                            aria-label="Copy address"
                          >
                            <Copy className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                      
                      {/* ENS Name (if available) */}
                      {ensName && (
                        <div>
                          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1">ENS Name</span>
                          <div className="flex items-center">
                            <span className="text-sm font-medium">{ensName}</span>
                            <a 
                              href={`https://etherscan.io/address/${verificationResult.recoveredAddress}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ml-2 text-primary-600 hover:text-primary-700 dark:text-primary-400 text-xs"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        </div>
                      )}

                      {/* Message Hash */}
                      {verificationResult.messageHash && (
                        <div className="md:col-span-2">
                          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1">Message Hash</span>
                          <div className="flex items-center">
                            <div className="truncate font-mono text-xs">
                              {verificationResult.messageHash}
                            </div>
                            <button 
                              onClick={() => {
                                if (verificationResult.messageHash) {
                                  navigator.clipboard.writeText(verificationResult.messageHash);
                                  toast({
                                    title: "Copied to clipboard",
                                    description: "The message hash has been copied to your clipboard.",
                                  });
                                }
                              }} 
                              className="ml-2 p-1 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300" 
                              aria-label="Copy message hash"
                            >
                              <Copy className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Error Result */
            <div className="border border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-900/20 overflow-hidden">
              <div className="p-4 flex items-start">
                <div className="flex-shrink-0 mr-3">
                  <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-800/40 flex items-center justify-center">
                    <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-red-800 dark:text-red-400">Invalid Signature</h4>
                  <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                    This signature couldn't be verified against the provided message. It may have been altered or signed by a different address.
                  </p>
                  
                  {verificationResult.error && (
                    <div className="mt-3 bg-white dark:bg-slate-800 rounded-md p-3 border border-red-200 dark:border-red-800">
                      <div className="text-xs text-red-600 dark:text-red-400 font-mono">
                        <span className="font-semibold text-xs text-red-700 dark:text-red-300 block mb-1">Error details:</span>
                        {verificationResult.error}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VerifyPage;
