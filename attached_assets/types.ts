// This file contains type definitions and utility functions
// for the BlockSign application.

import { ethers } from 'ethers';

// Types
export interface Network {
  name: string;
  color: string;
  icon?: React.ReactNode;
  isTestnet?: boolean;
}

export interface WalletInfo {
  name: string;
  icon: React.ReactNode;
  installUrl: string;
  supported: boolean;
  description: string;
}

export type MessageType = 'text' | 'transaction' | 'structured' | 'document';

export interface HistoryEntry {
  message: string;
  originalMessage: string;
  signature: string;
  timestamp: string;
  valid: boolean;
  messageType: MessageType;
  chainId: number;
  documentHash?: string;
  documentName?: string;
  signerEns?: string;
}

export interface VerificationResult {
  valid: boolean;
  messageHash?: string;
  recoveredAddress?: string;
  messageType?: MessageType;
  timestamp: string;
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