// Types
export interface Network {
  name: string;
  color: string;
  iconName?: string;
  isTestnet?: boolean;
}

export interface WalletInfo {
  name: string;
  iconName: string;
  iconEmoji?: string;
  installUrl: string;
  supported: boolean;
  description: string;
}

export type MessageType = 'text' | 'transaction' | 'structured' | 'document';

export interface HistoryEntry {
  id: string;
  message: string;
  originalMessage: string;
  signature: string;
  timestamp: number;
  valid: boolean;
  messageType: MessageType;
  chainId: number;
  documentHash?: string;
  documentName?: string;
  signerEns?: string;
  signerAddress: string;
}

export interface VerificationResult {
  valid: boolean;
  messageHash?: string;
  recoveredAddress?: string;
  messageType?: MessageType;
  timestamp: number;
  error?: string;
  documentHash?: string;
}

export interface DocumentInfo {
  name: string;
  size: number;
  type: string;
  lastModified: number;
  hash?: string;
  content?: ArrayBuffer;
}

// Network information
export const NETWORKS: Record<number, Network> = {
  1: { name: 'Ethereum Mainnet', color: 'bg-blue-500', iconName: 'hexagon' },
  5: { name: 'Goerli Testnet', color: 'bg-purple-500', isTestnet: true },
  11155111: { name: 'Sepolia Testnet', color: 'bg-green-500', isTestnet: true },
  137: { name: 'Polygon Mainnet', color: 'bg-indigo-500', iconName: 'hexagon' },
  80001: { name: 'Mumbai Testnet', color: 'bg-pink-500', isTestnet: true },
  42161: { name: 'Arbitrum One', color: 'bg-yellow-500', iconName: 'hexagon' },
  10: { name: 'Optimism', color: 'bg-red-500', iconName: 'hexagon' },
  56: { name: 'BNB Smart Chain', color: 'bg-amber-500', iconName: 'hexagon' },
  43114: { name: 'Avalanche C-Chain', color: 'bg-red-600', iconName: 'hexagon' },
  250: { name: 'Fantom Opera', color: 'bg-blue-600', iconName: 'hexagon' },
};

// Supported wallet types
export const WALLET_TYPES: Record<string, WalletInfo> = {
  metamask: { 
    name: 'MetaMask', 
    iconName: 'wallet',
    iconEmoji: '🦊', 
    installUrl: 'https://metamask.io/download/',
    supported: true,
    description: 'The most popular Ethereum wallet'
  },
  walletconnect: { 
    name: 'WalletConnect', 
    iconName: 'link', 
    installUrl: 'https://walletconnect.com/',
    supported: true,
    description: 'Connect to mobile wallets'
  },
  coinbase: { 
    name: 'Coinbase Wallet', 
    iconName: 'hexagon', 
    installUrl: 'https://www.coinbase.com/wallet',
    supported: true,
    description: 'User-friendly wallet by Coinbase'
  },
  brave: { 
    name: 'Brave Wallet', 
    iconName: 'shield', 
    installUrl: 'https://brave.com/wallet/',
    supported: true,
    description: 'Built-in wallet in Brave browser'
  },
};

// Message types
export const MESSAGE_TYPES = {
  TEXT: 'text' as MessageType,
  TRANSACTION: 'transaction' as MessageType,
  STRUCTURED: 'structured' as MessageType,
  DOCUMENT: 'document' as MessageType
};

// Example EIP-712 typed data
export const EXAMPLE_TYPED_DATA = {
  types: {
    Person: [
      { name: 'name', type: 'string' },
      { name: 'wallet', type: 'address' }
    ],
    Mail: [
      { name: 'from', type: 'Person' },
      { name: 'to', type: 'Person' },
      { name: 'contents', type: 'string' }
    ]
  },
  primaryType: 'Mail',
  domain: {
    name: 'BlockSign',
    version: '2.0',
    chainId: 1,
    verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC'
  },
  message: {
    from: {
      name: 'Alice',
      wallet: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826'
    },
    to: {
      name: 'Bob',
      wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB'
    },
    contents: 'Hello, Bob!'
  }
};

// Document templates
export const DOCUMENT_TEMPLATES = [
  {
    id: 'consent',
    name: 'Consent Form',
    content: `# Consent Agreement

I, [SIGNER NAME], hereby consent to the terms and conditions outlined in this document.

Date: [DATE]
Time: [TIME]

## Terms and Conditions
1. This is a sample consent form template
2. By signing this document, you acknowledge you have read and understood the terms
3. This signature is cryptographically verifiable on the blockchain

Signature: [SIGNATURE]`
  },
  {
    id: 'certificate',
    name: 'Certificate of Completion',
    content: `# CERTIFICATE OF COMPLETION

This certifies that **[SIGNER NAME]** has successfully completed the requirements for:

## Blockchain Fundamentals 

Issued on: [DATE]

This certificate is cryptographically signed and verifiable on the blockchain.
Certificate ID: [RANDOM_ID]

Issued by: BlockSign Certification Authority
Signature: [SIGNATURE]`
  },
  {
    id: 'contract',
    name: 'Simple Contract',
    content: `# SIMPLE CONTRACT AGREEMENT

## BETWEEN:
[SIGNER NAME] ("Party A")
AND
[COUNTER_PARTY] ("Party B")

## TERMS:
1. This is a sample contract template
2. Both parties agree to the terms contained herein
3. This document is legally binding when signed
4. This signature is cryptographically verified on the blockchain

Signed on: [DATE]

Party A Signature: [SIGNATURE]

Party B Signature: _______________________`
  }
];

// Define tabs
export const TABS = {
  SIGN: 'sign',
  VERIFY: 'verify',
  HISTORY: 'history',
  DASHBOARD: 'dashboard',
  LEARN: 'learn',
  SETTINGS: 'settings'
};

// Blockchain signature education content
export const EDUCATION_CONTENT = {
  basics: {
    title: "What are Blockchain Signatures?",
    content: [
      "In blockchain, digital signatures are a fundamental cryptographic primitive that enables authentication, non-repudiation, and integrity of messages.",
      "When you sign a message with your private key, anyone with your public address can verify that you indeed signed that specific message.",
      "Unlike traditional signatures, blockchain signatures are mathematically proven and cannot be forged if the private key remains secure."
    ]
  },
  methods: {
    title: "Signature Methods",
    content: [
      "personal_sign: The simplest form of signing that hashes your message with a prefix.",
      "eth_sign: More direct signing method that allows signing hash of any data.",
      "EIP-712 (Typed Data): Structured signing that makes it clearer what you're signing.",
      "Document signing: Hash a document and sign the hash to verify document authenticity."
    ]
  },
  security: {
    title: "Security Best Practices",
    content: [
      "Never sign messages that you don't understand or that come from untrusted sources.",
      "Be cautious when an app asks you to sign a message - verify what you're signing.",
      "Your signature can authorize transactions, so treat signing requests with the same caution as transactions.",
      "Consider using a hardware wallet for better security of your private keys.",
      "Set up expiration dates for time-sensitive signatures to minimize security risks."
    ]
  },
  usage: {
    title: "Common Use Cases",
    content: [
      "Authentication: Proving ownership of an address without sending transactions.",
      "Off-chain authorization: Granting permissions without on-chain transactions.",
      "NFT Minting: Some platforms use signatures for gasless minting.",
      "Document verification: Signing document hashes to verify their authenticity.",
      "Multi-signature schemes: Requiring multiple parties to sign for enhanced security."
    ]
  },
  advanced: {
    title: "Advanced Concepts",
    content: [
      "Threshold signatures: Requiring signatures from M of N possible signers.",
      "Signature aggregation: Combining multiple signatures into one for efficiency.",
      "Zero-knowledge proofs: Proving you signed something without revealing the signature.",
      "Selective disclosure: Signing only specific parts of a message or document.",
      "Time-bound signatures: Creating signatures that are only valid within a time window."
    ]
  }
};

// Status Icons - these will be used with the lucide-react icons
export const STATUS_ICONS = {
  VALID: { name: 'check', color: 'text-green-500' },
  INVALID: { name: 'x', color: 'text-red-500' },
  PENDING: { name: 'loader', color: 'text-blue-500' }
};
