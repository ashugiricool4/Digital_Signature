import { ethers } from 'ethers';
import { calculateDocumentHash } from './utils';
import { VerificationResult, MessageType, DocumentInfo } from './constants';

// Helper function to detect if window.ethereum is available
export const isEthereumAvailable = (): boolean => {
  return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
};

// Get ethers provider based on window.ethereum
export const getProvider = (): ethers.providers.Web3Provider | null => {
  if (!isEthereumAvailable()) return null;
  return new ethers.providers.Web3Provider(window.ethereum);
};

// Sign a text message
export const signMessage = async (message: string): Promise<string> => {
  const provider = getProvider();
  if (!provider) throw new Error('No Ethereum provider found');
  
  const signer = provider.getSigner();
  return await signer.signMessage(message);
};

// Sign structured data (EIP-712)
export const signTypedData = async (typedData: any): Promise<string> => {
  const provider = getProvider();
  if (!provider) throw new Error('No Ethereum provider found');
  
  const signer = provider.getSigner();
  // For MetaMask
  if (window.ethereum.isMetaMask) {
    return await window.ethereum.request({
      method: 'eth_signTypedData_v4',
      params: [await signer.getAddress(), JSON.stringify(typedData)],
    });
  }
  
  // Fallback to ethers implementation
  return await signer._signTypedData(
    typedData.domain,
    typedData.types,
    typedData.message
  );
};

// Sign a document (actually signs the hash of the document)
export const signDocument = async (file: File): Promise<{ signature: string; hash: string }> => {
  const provider = getProvider();
  if (!provider) throw new Error('No Ethereum provider found');
  
  // Calculate hash of the document
  const hash = await calculateDocumentHash(file);
  
  // Sign the hash
  const signer = provider.getSigner();
  const signature = await signer.signMessage(ethers.utils.arrayify(hash));
  
  return { signature, hash };
};

// Verify a text message signature
export const verifyMessage = async (message: string, signature: string): Promise<VerificationResult> => {
  try {
    const recoveredAddress = ethers.utils.verifyMessage(message, signature);
    return {
      valid: true,
      messageHash: ethers.utils.hashMessage(message),
      recoveredAddress,
      messageType: 'text',
      timestamp: Date.now(),
    };
  } catch (error) {
    return {
      valid: false,
      error: (error as Error).message,
      timestamp: Date.now(),
    };
  }
};

// Verify a typed data signature
export const verifyTypedData = async (
  typedData: any,
  signature: string
): Promise<VerificationResult> => {
  try {
    const messageHash = ethers.utils._TypedDataEncoder.hash(
      typedData.domain,
      typedData.types,
      typedData.message
    );
    
    const messageHashBytes = ethers.utils.arrayify(messageHash);
    const recoveredAddress = ethers.utils.recoverAddress(messageHashBytes, signature);
    
    return {
      valid: true,
      messageHash,
      recoveredAddress,
      messageType: 'structured',
      timestamp: Date.now(),
    };
  } catch (error) {
    return {
      valid: false,
      error: (error as Error).message,
      timestamp: Date.now(),
    };
  }
};

// Verify a document signature
export const verifyDocumentSignature = async (
  documentHash: string,
  signature: string
): Promise<VerificationResult> => {
  try {
    const recoveredAddress = ethers.utils.verifyMessage(
      ethers.utils.arrayify(documentHash),
      signature
    );
    
    return {
      valid: true,
      messageHash: documentHash,
      recoveredAddress,
      messageType: 'document',
      timestamp: Date.now(),
      documentHash,
    };
  } catch (error) {
    return {
      valid: false,
      error: (error as Error).message,
      timestamp: Date.now(),
    };
  }
};

// Resolve ENS name to address
export const resolveENSName = async (ensName: string): Promise<string | null> => {
  try {
    const provider = new ethers.providers.JsonRpcProvider('https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161');
    return await provider.resolveName(ensName);
  } catch (error) {
    console.error('Error resolving ENS name:', error);
    return null;
  }
};

// Lookup ENS name for address
export const lookupENSName = async (address: string): Promise<string | null> => {
  try {
    const provider = new ethers.providers.JsonRpcProvider('https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161');
    return await provider.lookupAddress(address);
  } catch (error) {
    console.error('Error looking up ENS name:', error);
    return null;
  }
};

// Get document info
export const getDocumentInfo = async (file: File): Promise<DocumentInfo> => {
  const hash = await calculateDocumentHash(file);
  
  return {
    name: file.name,
    size: file.size,
    type: file.type,
    lastModified: file.lastModified,
    hash,
  };
};
