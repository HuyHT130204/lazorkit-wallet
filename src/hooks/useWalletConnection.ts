"use client"
import { useCallback } from "react"
import { useWallet } from "@lazorkit/wallet"
import type { PublicKey as SolanaPublicKey } from "@solana/web3.js"

export interface WalletConnectionState {
  isConnected: boolean
  isConnecting: boolean
  address: string | null
  error: string | null
  canSign: boolean
  smartWalletPublicKey: SolanaPublicKey | null
  isReady: boolean
}

export const useWalletConnection = () => {
  // Trực tiếp lấy các trạng thái từ useWallet() của SDK
  const wallet = useWallet();
  console.log("[DEBUG] SDK wallet state:", wallet);
  const {
    smartWalletPubkey,
    isConnected, // Trạng thái kết nối từ SDK
    isLoading, // Trạng thái loading từ SDK (bao gồm connecting, signing)
    error, // Lỗi từ SDK
    connect, // Hàm connect full-flow từ SDK
    disconnect, // Hàm disconnect từ SDK
    signAndSendTransaction,
  } = wallet;

  const address = smartWalletPubkey?.toBase58() || null
  // isReady khi đã kết nối, có smartWalletPubkey và không trong trạng thái loading
  const isReady = isConnected && !!smartWalletPubkey && !isLoading
  const isWalletConnected = !!smartWalletPubkey

  // Hàm connectWallet sẽ gọi hàm connect full-flow của SDK
  const connectWallet = useCallback(async (): Promise<boolean> => {
    try {
      console.log("Manual connect requested (via SDK's connect method)...")
      await connect()
      console.log("Manual connect successful")
      return true
    } catch (e) {
      console.error("Manual connect failed:", e)
      return false
    }
  }, [connect])

  // Hàm disconnectWallet sẽ gọi hàm disconnect của SDK
  const disconnectWallet = useCallback(async () => {
    try {
      console.log("Disconnecting wallet (via SDK's disconnect method)...")
      await disconnect()
      console.log("Wallet disconnected successfully")
    } catch (e) {
      console.error("Disconnect failed:", e)
    }
  }, [disconnect])

  // Hàm kiểm tra xem wallet có sẵn sàng cho giao dịch không
  const isReadyForTransaction = useCallback((): boolean => {
    return isReady && typeof signAndSendTransaction === "function"
  }, [isReady, signAndSendTransaction])

  return {
    isConnected,
    isConnecting: isLoading, // Map SDK's isLoading to our isConnecting
    address,
    error: error?.message || null, // Lấy message từ đối tượng Error của SDK
    canSign: isReady,
    smartWalletPublicKey: smartWalletPubkey || null,
    isReady,
    connectWallet,
    disconnectWallet,
    isReadyForTransaction,
    signAndSendTransaction,
    isWalletConnected,
    // reconnectWallet: reconnect, // Đã loại bỏ reconnect
  }
}
