// Import React and CSS for styling
import React from 'react';
import './App.css';
// Import necessary classes from Solana's web3.js library
import {
  PublicKey,
  Transaction,
} from "@solana/web3.js";
// Import React hooks for state and lifecycle management
import {useEffect , useState } from "react";
import './App.css'

/**
 * TypeScript types for encoding options, Phantom wallet events, and request methods.
 */
type DisplayEncoding = "utf8" | "hex";

type PhantomEvent = "disconnect" | "connect" | "accountChanged";
type PhantomRequestMethod =
  | "connect"
  | "disconnect"
  | "signTransaction"
  | "signAllTransactions"
  | "signMessage";

/**
 * Interface for options used in the connect method.
 */
interface ConnectOpts {
  onlyIfTrusted: boolean;
}

/**
 * Interface representing the Phantom provider.
 * This includes all necessary methods and properties to interact with the Phantom wallet.
 */
interface PhantomProvider {
  publicKey: PublicKey | null;
  isConnected: boolean | null;
  signTransaction: (transaction: Transaction) => Promise<Transaction>;
  signAllTransactions: (transactions: Transaction[]) => Promise<Transaction[]>;
  signMessage: (
    message: Uint8Array | string,
    display?: DisplayEncoding
  ) => Promise<any>;
  connect: (opts?: Partial<ConnectOpts>) => Promise<{ publicKey: PublicKey }>;
  disconnect: () => Promise<void>;
  on: (event: PhantomEvent, handler: (args: any) => void) => void;
  request: (method: PhantomRequestMethod, params: any) => Promise<unknown>;
}

 /**
 * Function to retrieve the Phantom provider from the global window object.
 * Returns the provider if available, otherwise returns undefined.
 */
 const getProvider = (): PhantomProvider | undefined => {
  if ("solana" in window) {
    // @ts-ignore
    const provider = window.solana as any;
    if (provider.isPhantom) return provider as PhantomProvider;
  }
};

export default function App() {
  // State variable to store the Phantom provider
  const [provider, setProvider] = useState<PhantomProvider | undefined>(undefined);
  // State variable to store the wallet public key
  const [walletKey, setWalletKey] = useState<String | undefined>(undefined);

  // Effect hook to set the Phantom provider on component mount
  useEffect(() => {
	  const provider = getProvider();

		// if the phantom provider exists, set this as the provider
	  if (provider) setProvider(provider);
	  else setProvider(undefined);
  }, []);

  /**
   * @description prompts user to connect wallet if it exists.
	 * This function is called when the connect wallet button is clicked
   */
  const connectWallet = async () => {
    // @ts-ignore
    const { solana } = window;

		// checks if phantom wallet exists
    if (solana) {
      try {
				// connects wallet and returns response which includes the wallet public key
        const response = await solana.connect();
        console.log('wallet account ', response.publicKey.toString());
				// update walletKey to be the public key
        setWalletKey(response.publicKey.toString());
      } catch (err) {
          console.log(err);
      }
    }
  };

  /**
   * @description disconnects wallet if it exists.
	 * This function is called when the disconnect wallet button is clicked
   */
  const disconnectWallet = async () => {
    // @ts-ignore
    const { solana } = window;

		// checks if phantom wallet exists
    if (solana) {
      try {
				// ADD DISCONNECT LOGIC HERE
        await solana.disconnect();
        setWalletKey(undefined);
      } catch (err) {
          console.log(err);
      }
    }
  };

	// HTML code for the app
  return (
    <div className="App">
      <header className="App-header">
        <h2>Connect to Phantom Wallet</h2>
      {provider && !walletKey && (
      <button
        style={{
          fontSize: "16px",
          padding: "15px",
          fontWeight: "bold",
          borderRadius: "5px",
        }}
        onClick={connectWallet}
      >
        Connect Wallet
      </button>
        )}
        {provider && walletKey && (
            <div>
              <p>Wallet Address connected is: {walletKey}</p>
              <button
                style={{
                  fontSize: "16px",
                  padding: "15px",
                  fontWeight: "bold",
                  borderRadius: "5px",
                  position: "absolute",
                  top: "28px",
                  right: "28px"
                }}
                onClick={disconnectWallet}
              >
                Disconnect Wallet
              </button>
            </div>
        )}
        {!provider && (
          <p>
            No provider found. Install{" "}
            <a href="https://phantom.app/">Phantom Browser extension</a>
          </p>
        )}
        </header>
    </div>
  );
}