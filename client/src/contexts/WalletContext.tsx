import React, { createContext, useReducer, useEffect, useContext } from 'react';
import { ethers } from 'ethers';

// Types
interface WalletState {
  address: string | null;
  chainId: number | null;
  connected: boolean;
  provider: ethers.providers.Web3Provider | null;
  ensName: string | null;
  connecting: boolean;
  error: string | null;
}

interface WalletContextType extends WalletState {
  connectWallet: (walletType: string) => Promise<void>;
  disconnectWallet: () => void;
  switchNetwork: (chainId: number) => Promise<void>;
}

type WalletAction =
  | { type: 'CONNECT_REQUEST' }
  | { type: 'CONNECT_SUCCESS'; payload: { address: string; chainId: number; provider: ethers.providers.Web3Provider; ensName: string | null } }
  | { type: 'CONNECT_FAILURE'; payload: string }
  | { type: 'DISCONNECT' }
  | { type: 'CHAIN_CHANGED'; payload: number }
  | { type: 'ACCOUNT_CHANGED'; payload: string }
  | { type: 'SET_ENS_NAME'; payload: string | null };

// Initial state
const initialState: WalletState = {
  address: null,
  chainId: null,
  connected: false,
  provider: null,
  ensName: null,
  connecting: false,
  error: null,
};

// Context
export const WalletContext = createContext<WalletContextType>({
  ...initialState,
  connectWallet: async () => {},
  disconnectWallet: () => {},
  switchNetwork: async () => {},
});

// Reducer
const walletReducer = (state: WalletState, action: WalletAction): WalletState => {
  switch (action.type) {
    case 'CONNECT_REQUEST':
      return { ...state, connecting: true, error: null };
    
    case 'CONNECT_SUCCESS':
      return {
        ...state,
        connected: true,
        connecting: false,
        address: action.payload.address,
        chainId: action.payload.chainId,
        provider: action.payload.provider,
        ensName: action.payload.ensName,
        error: null,
      };
    
    case 'CONNECT_FAILURE':
      return {
        ...state,
        connecting: false,
        error: action.payload,
      };
    
    case 'DISCONNECT':
      return {
        ...initialState,
      };
    
    case 'CHAIN_CHANGED':
      return {
        ...state,
        chainId: action.payload,
      };
    
    case 'ACCOUNT_CHANGED':
      return {
        ...state,
        address: action.payload,
      };
    
    case 'SET_ENS_NAME':
      return {
        ...state,
        ensName: action.payload,
      };
    
    default:
      return state;
  }
};

// Provider
export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(walletReducer, initialState);

  // Check if previously connected
  useEffect(() => {
    const checkConnection = async () => {
      // Check if wallet was previously connected
      if (window.ethereum && localStorage.getItem('walletConnected') === 'true') {
        try {
          await connectWallet('metamask');
        } catch (error) {
          console.error('Failed to reconnect wallet:', error);
        }
      }
    };

    checkConnection();
  }, []);

  // Setup event listeners
  useEffect(() => {
    if (window.ethereum) {
      const handleChainChanged = (chainId: string) => {
        dispatch({
          type: 'CHAIN_CHANGED',
          payload: parseInt(chainId, 16),
        });
      };

      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          // User disconnected their wallet
          disconnectWallet();
        } else {
          dispatch({
            type: 'ACCOUNT_CHANGED',
            payload: accounts[0],
          });
          
          // Update ENS name when account changes
          if (state.provider) {
            lookupENSName(accounts[0], state.provider);
          }
        }
      };

      window.ethereum.on('chainChanged', handleChainChanged);
      window.ethereum.on('accountsChanged', handleAccountsChanged);

      return () => {
        window.ethereum.removeListener('chainChanged', handleChainChanged);
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      };
    }
  }, [state.provider]);

  // Helper function to lookup ENS name
  const lookupENSName = async (address: string, provider: ethers.providers.Web3Provider) => {
    try {
      // Only lookup ENS on mainnet
      const mainnetProvider = new ethers.providers.JsonRpcProvider(
        'https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'
      );
      const ensName = await mainnetProvider.lookupAddress(address);
      
      dispatch({
        type: 'SET_ENS_NAME',
        payload: ensName,
      });
    } catch (error) {
      console.error('Failed to lookup ENS name:', error);
    }
  };

  // Connect wallet
  const connectWallet = async (walletType: string) => {
    dispatch({ type: 'CONNECT_REQUEST' });

    try {
      // For now only support MetaMask/injected provider
      if (!window.ethereum) {
        throw new Error('No Ethereum provider found. Please install MetaMask.');
      }

      // Request accounts
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found. Please unlock your wallet.');
      }

      const address = accounts[0];
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const network = await provider.getNetwork();

      // Lookup ENS name on mainnet regardless of connected network
      let ensName = null;
      try {
        const mainnetProvider = new ethers.providers.JsonRpcProvider(
          'https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'
        );
        ensName = await mainnetProvider.lookupAddress(address);
      } catch (error) {
        console.error('Failed to lookup ENS name:', error);
      }

      dispatch({
        type: 'CONNECT_SUCCESS',
        payload: {
          address,
          chainId: network.chainId,
          provider,
          ensName,
        },
      });

      // Save connection state
      localStorage.setItem('walletConnected', 'true');
      localStorage.setItem('walletType', walletType);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      dispatch({
        type: 'CONNECT_FAILURE',
        payload: (error as Error).message,
      });
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    dispatch({ type: 'DISCONNECT' });
    localStorage.removeItem('walletConnected');
    localStorage.removeItem('walletType');
  };

  // Switch network
  const switchNetwork = async (chainId: number) => {
    if (!window.ethereum || !state.connected) {
      throw new Error('No Ethereum provider found or not connected.');
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });
    } catch (error: any) {
      // This error code indicates that the chain has not been added to MetaMask.
      if (error.code === 4902) {
        // Add the network - this would be expanded for real implementation
        throw new Error('Network not added to wallet. Please add it manually.');
      }
      throw error;
    }
  };

  return (
    <WalletContext.Provider
      value={{
        ...state,
        connectWallet,
        disconnectWallet,
        switchNetwork,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

// Hook
export const useWallet = () => useContext(WalletContext);
