"use client"
import type React from "react"
import { useState, useEffect } from "react"
import {
  Send,
  Copy,
  Scan,
  CheckCircle,
  ChevronDown,
  AlertCircle,
  X,
  WalletIcon,
  ArrowRight,
  Shield,
  ExternalLink,
  WifiOff,
  RefreshCw,
} from "lucide-react"
import { PublicKey, type TransactionInstruction } from "@solana/web3.js"
import type { TokenInfo } from "../services/solana"
import { fetchTokenList, buildTransferTransaction, fetchBalance } from "../services/solana"
import { useRef } from "react"

interface TransferProps {
  wallet: { address: string }
  onTransfer?: (transferDetails: { recipientAddress: string; tokenId: string; amount: number }) => void
  onWalletConnect: () => Promise<boolean>
  smartWalletPubkey: PublicKey | null
  signAndSendTransaction: (instruction: TransactionInstruction) => Promise<string | null | undefined>
  isReadyForTransaction: () => boolean
}

const Transfer: React.FC<TransferProps> = ({
  wallet,
  onWalletConnect,
  smartWalletPubkey,
  signAndSendTransaction,
  isReadyForTransaction,
}) => {
  const [recipientAddress, setRecipientAddress] = useState("")
  const [tokens, setTokens] = useState<TokenInfo[]>([])
  const [solBalance, setSolBalance] = useState<number>(0)
  const [selectedTokenMint, setSelectedTokenMint] = useState<string>("So11111111111111111111111111111111111111112")
  const [amount, setAmount] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [showTokenDropdown, setShowTokenDropdown] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [txSignature, setTxSignature] = useState<string>("")
  const [isConnecting, setIsConnecting] = useState(false)
  const autoConnectAttempted = useRef(false)

  // Auto-connect on mount if not connected
  useEffect(() => {
    if (!smartWalletPubkey && !autoConnectAttempted.current) {
      autoConnectAttempted.current = true
      ;(async () => {
        await onWalletConnect()
      })()
    }
  }, [smartWalletPubkey, onWalletConnect])

  // Log wallet state on every change
  useEffect(() => {
    // Đã xoá log, không cần error ở dependency
  }, [smartWalletPubkey, isReadyForTransaction])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [toks, bal] = await Promise.all([fetchTokenList(wallet.address), fetchBalance(wallet.address)])
        setTokens(toks)
        setSolBalance(bal)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        setTokens([])
        setSolBalance(0)
      }
    }

    if (wallet.address) {
      fetchData()
    }
  }, [wallet.address])

  const allTokens = [
    {
      mint: "So11111111111111111111111111111111111111112",
      amount: solBalance,
      decimals: 9,
      symbol: "SOL",
      name: "Solana",
    },
    ...tokens.map((token) => ({
      ...token,
      symbol: token.mint.slice(0, 4),
      name: token.mint.slice(0, 8),
    })),
  ]

  const selectedToken = allTokens.find((t) => t.mint === selectedTokenMint)

  // Only use handleConnect for error recovery, not primary connect flow
  const handleConnect = async () => {
    setIsConnecting(true)
    setError(null)
    try {
      // console.log("Manually connecting wallet (error recovery)...")
      const success = await onWalletConnect()
      if (success) {
        // console.log("Manual connection successful")
      } else {
        setError("Failed to connect wallet")
      }
    } catch (error) {
      // console.error("Manual connect failed:", error)
      setError(error instanceof Error ? error.message : "Failed to connect wallet")
    } finally {
      setIsConnecting(false)
    }
  }

  const handleTransfer = async () => {
    setError(null)

    // Kiểm tra trạng thái wallet
    // console.log("Transfer attempt - Wallet state:", {
    //   smartWalletPubkey: smartWalletPubkey?.toBase58(),
    //   hasSignFunction: !!signAndSendTransaction,
    //   isReadyForTransaction: isReadyForTransaction(),
    // })

    if (!smartWalletPubkey) {
      setError("Wallet is not connected. Please connect your wallet first.")
      return
    }

    if (!signAndSendTransaction) {
      setError("Sign function not available. Please reconnect your wallet.")
      return
    }

    if (!isReadyForTransaction()) {
      setError("Wallet is not ready for transactions. Please wait a moment and try again.")
      return
    }

    if (!recipientAddress.trim() || !selectedTokenMint || !amount || !selectedToken) {
      setError("Please fill in all required fields.")
      return
    }

    setIsLoading(true)

    try {
      // console.log("Building transfer transaction...")
      const transaction = await buildTransferTransaction({
        from: new PublicKey(wallet.address),
        to: recipientAddress.trim(),
        amount: Number.parseFloat(amount),
        mint: selectedTokenMint,
      })

      if (transaction.instructions.length === 0) {
        throw new Error("No instructions found in the transaction.")
      }

      const instructionToSign = transaction.instructions[0]
      // console.log("Signing and sending transaction...")

      const signature = await signAndSendTransaction(instructionToSign)

      if (!signature) {
        throw new Error("Failed to get transaction signature")
      }

      // console.log("Transaction successful:", signature)
      setTxSignature(signature)
      setShowSuccessDialog(true)
      setRecipientAddress("")
      setAmount("")

      // Refresh balances
      setTimeout(async () => {
        try {
          const [toks, bal] = await Promise.all([fetchTokenList(wallet.address), fetchBalance(wallet.address)])
          setTokens(toks)
          setSolBalance(bal)
        } catch {
          // ignore
        }
      }, 3000)
    } catch (e: unknown) {
      // console.error("Transfer failed:", e)
      let errMsg = "Transfer failed"

      if (e instanceof Error) {
        errMsg = e.message
        if (e.message.includes("insufficient funds")) {
          errMsg = "Insufficient funds for this transaction"
        } else if (e.message.includes("invalid address")) {
          errMsg = "Invalid recipient address"
        } else if (e.message.includes("not connected") || e.message.includes("wallet")) {
          errMsg = "Wallet connection issue. Please reconnect and try again."
        }
      }

      setError(errMsg)
    } finally {
      setIsLoading(false)
      setShowPreview(false)
    }
  }

  const handlePreview = () => {
    if (isValid && !hasInsufficientBalance && isReadyForTransaction()) {
      setShowPreview(true)
    }
  }

  const isValidAddress = (address: string) => {
    try {
      new PublicKey(address)
      return true
    } catch {
      return false
    }
  }

  const isValid =
    recipientAddress.trim() &&
    isValidAddress(recipientAddress.trim()) &&
    selectedTokenMint &&
    amount &&
    Number.parseFloat(amount) > 0

  const hasInsufficientBalance = selectedToken && Number.parseFloat(amount) > (selectedToken.amount || 0)

  const formatAddress = (address: string) => {
    if (!address) return ""
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const openInExplorer = (signature: string) => {
    window.open(`https://explorer.solana.com/tx/${signature}?cluster=devnet`, "_blank")
  }

  const isTransactionReady = isReadyForTransaction()

  return (
    <div className="w-full bg-black text-white">
      {/* Success Dialog */}
      {showSuccessDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-gray-900 border-2 border-[#9945FF] rounded-3xl p-8 max-w-sm w-full flex flex-col items-center shadow-2xl">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gray-800 mb-4">
              <CheckCircle className="w-10 h-10 text-[#4CAF50]" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Transfer Successful</h2>
            <p className="text-gray-400 mb-4 text-center">Your tokens have been sent successfully!</p>
            {txSignature && (
              <div className="w-full mb-4">
                <p className="text-sm text-gray-400 mb-2">Transaction Signature:</p>
                <div className="bg-gray-800 rounded-lg p-3 font-mono text-xs text-white break-all">{txSignature}</div>
                <button
                  onClick={() => openInExplorer(txSignature)}
                  className="mt-2 w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  View on Solana Explorer
                </button>
              </div>
            )}
            <button
              onClick={() => {
                setShowSuccessDialog(false)
                setTxSignature("")
              }}
              className="px-6 py-2 rounded-xl bg-[#9945FF] text-white font-semibold hover:bg-[#7b2cbf] transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 rounded-xl bg-gray-900 border border-gray-800">
            <Send className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">Send Tokens</h1>
            <p className="text-gray-400 text-sm">Transfer SOL or SPL tokens on Devnet</p>
          </div>
          {/* Enhanced Connection Status */}
          <div className="flex items-center gap-2">
            {isTransactionReady ? null : smartWalletPubkey ? (
              <div className="flex items-center gap-2 px-3 py-1 bg-yellow-900 border border-yellow-700 rounded-full">
                <RefreshCw className="w-4 h-4 text-yellow-400" />
                <span className="text-yellow-400 text-sm font-medium">Preparing...</span>
              </div>
            ) : (
              <button
                onClick={handleConnect}
                disabled={isConnecting || !!smartWalletPubkey}
                className="flex items-center gap-2 px-3 py-1 bg-red-900 border border-red-700 rounded-full hover:bg-red-800 transition-colors disabled:opacity-50"
              >
                {isConnecting ? (
                  <RefreshCw className="w-4 h-4 text-red-400 animate-spin" />
                ) : (
                  <WifiOff className="w-4 h-4 text-red-400" />
                )}
                <span className="text-red-400 text-sm font-medium">{isConnecting ? "Connecting..." : "Connect"}</span>
              </button>
            )}
          </div>
        </div>

        {/* Enhanced Connection Warning */}
        {!isTransactionReady && (
          <div className="bg-red-900 border border-red-700 rounded-2xl p-4 mb-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <div>
                <p className="text-red-400 font-medium">
                  {!smartWalletPubkey ? "Wallet Not Connected" : "Wallet Not Ready for Transactions"}
                </p>
                <p className="text-red-300 text-sm">
                  {!smartWalletPubkey
                    ? "Your wallet needs to be connected to sign transactions."
                    : "Please wait for the wallet to be fully ready, or try reconnecting."}
                </p>
              </div>
              <button
                onClick={handleConnect}
                disabled={isConnecting || !!smartWalletPubkey}
                className="ml-auto px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {isConnecting ? "Connecting..." : "Connect Now"}
              </button>
            </div>
          </div>
        )}

        {/* Main Transfer Card - Rest of the component remains the same */}
        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 space-y-6 hover:bg-gray-800 transition-all duration-200">
          {/* Recipient Address */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-white">Recipient Address</label>
            <div className="relative">
              <input
                type="text"
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
                placeholder="Enter Solana wallet address"
                className="w-full h-14 px-4 pr-24 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:border-[#9945FF] focus:outline-none focus:ring-2 focus:ring-[#9945FF] transition-all duration-200"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => navigator.clipboard.readText().then(setRecipientAddress)}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                  title="Paste"
                >
                  <Copy className="w-4 h-4 text-gray-400" />
                </button>
                <button type="button" className="p-2 hover:bg-gray-700 rounded-lg transition-colors" title="Scan QR">
                  <Scan className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>
            {recipientAddress && (
              <div className="flex items-center gap-2">
                {isValidAddress(recipientAddress) ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-[#4CAF50]" />
                    <span className="text-[#4CAF50] text-sm">Valid Solana address</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-red-400" />
                    <span className="text-red-400 text-sm">Invalid address format</span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Token Selection */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-white">Select Token</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowTokenDropdown(!showTokenDropdown)}
                className="w-full h-14 px-4 bg-gray-900 border border-gray-800 rounded-xl text-white focus:border-[#9945FF] focus:outline-none focus:ring-2 focus:ring-[#9945FF] transition-all duration-200 flex items-center justify-between"
              >
                {selectedToken ? (
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                        selectedToken.symbol === "SOL" ? "bg-gradient-to-r from-purple-500 to-pink-500" : "bg-gray-800"
                      }`}
                    >
                      {selectedToken.symbol}
                    </div>
                    <div className="text-left">
                      <div className="font-semibold">{selectedToken.name}</div>
                      <div className="text-sm text-gray-400">
                        Balance: {selectedToken.amount.toFixed(selectedToken.decimals)}
                      </div>
                    </div>
                  </div>
                ) : (
                  <span className="text-gray-400">Select a token</span>
                )}
                <ChevronDown className="w-5 h-5 text-gray-400" />
              </button>

              {showTokenDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900 border border-gray-800 rounded-xl shadow-xl z-50 max-h-64 overflow-y-auto">
                  {allTokens.map((token) => (
                    <button
                      key={token.mint}
                      type="button"
                      onClick={() => {
                        setSelectedTokenMint(token.mint)
                        setShowTokenDropdown(false)
                      }}
                      className="w-full p-4 hover:bg-gray-800 transition-colors flex items-center gap-3 border-b border-gray-800 last:border-b-0"
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                          token.symbol === "SOL" ? "bg-gradient-to-r from-purple-500 to-pink-500" : "bg-gray-800"
                        }`}
                      >
                        {token.symbol}
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-semibold">{token.name}</div>
                        <div className="text-sm text-gray-400">Balance: {token.amount.toFixed(token.decimals)}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Amount Input */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-white">Amount</label>
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full h-14 px-4 pr-32 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:border-[#9945FF] focus:outline-none focus:ring-2 focus:ring-[#9945FF] transition-all duration-200 text-right text-lg"
                step="0.000001"
                min="0"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-3">
                <span className="text-sm text-gray-400 font-medium min-w-[50px] text-left">
                  {selectedToken ? selectedToken.symbol : "TOKEN"}
                </span>
                <button
                  type="button"
                  onClick={() => selectedToken && setAmount(selectedToken.amount.toString())}
                  className="px-3 py-1 text-xs bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                >
                  MAX
                </button>
              </div>
            </div>

            {selectedToken && (
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">Available:</span>
                  <span className="text-white font-medium">
                    {selectedToken.amount.toFixed(selectedToken.decimals)} {selectedToken.symbol}
                  </span>
                </div>
              </div>
            )}

            {hasInsufficientBalance && (
              <div className="flex items-center gap-2 text-red-400">
                <AlertCircle className="w-4 h-4" />
                <span>Insufficient balance</span>
              </div>
            )}

            {!isTransactionReady && (
              <div className="flex items-center gap-2 text-red-400">
                <WifiOff className="w-4 h-4" />
                <span>
                  {!smartWalletPubkey
                    ? "Wallet not connected. Please connect first."
                    : "Wallet not ready. Please wait or reconnect."}
                </span>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 text-red-400">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Quick Amount Buttons */}
          <div className="grid grid-cols-4 gap-3">
            {[25, 50, 75, 100].map((percentage) => (
              <button
                key={percentage}
                type="button"
                onClick={() => {
                  if (selectedToken) {
                    const newAmount = ((selectedToken.amount * percentage) / 100).toFixed(selectedToken.decimals)
                    setAmount(newAmount)
                  }
                }}
                className="h-10 bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded-lg transition-all duration-200 text-sm font-medium text-white"
              >
                {percentage}%
              </button>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handlePreview}
              disabled={!isValid || hasInsufficientBalance || !isTransactionReady}
              className="flex-1 h-14 bg-gray-900 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-800 rounded-2xl transition-all duration-200 text-white font-semibold flex items-center justify-center px-3 shadow-md whitespace-nowrap"
            >
              Preview Transfer
            </button>
            <button
              type="button"
              onClick={handleTransfer}
              disabled={isLoading || !isValid || hasInsufficientBalance || !isTransactionReady}
              className="flex-1 h-14 bg-[#9945FF] hover:bg-[#7b2cbf] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl transition-all duration-200 text-white font-semibold flex items-center justify-center px-3 shadow-md whitespace-nowrap"
            >
              {isLoading ? <span>Processing...</span> : <span>Send Now</span>}
            </button>
          </div>
        </div>

        {/* Transfer Preview - giữ nguyên phần này */}
        {showPreview && isValid && selectedToken && (
          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 space-y-4 hover:bg-gray-800 transition-all duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#4CAF50] rounded-full">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white">Transfer Preview</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowPreview(false)}
                className="p-2 hover:bg-gray-700 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              {/* From Section */}
              <div className="flex items-center justify-between p-4 bg-gray-800 rounded-xl border border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-700 rounded-full">
                    <WalletIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">From</div>
                    <div className="font-mono text-white">{formatAddress(wallet.address)}</div>
                  </div>
                </div>
                <div className="text-sm text-gray-400">Your Wallet</div>
              </div>

              {/* Arrow */}
              <div className="flex items-center justify-center">
                <div className="p-3 bg-gray-800 rounded-full">
                  <ArrowRight className="w-6 h-6 text-white" />
                </div>
              </div>

              {/* To Section */}
              <div className="flex items-center justify-between p-4 bg-gray-800 rounded-xl border border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-700 rounded-full">
                    <Send className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">To</div>
                    <div className="font-mono text-white">{formatAddress(recipientAddress)}</div>
                  </div>
                </div>
                <div className="text-sm text-gray-400">Recipient</div>
              </div>

              {/* Transfer Details */}
              <div className="space-y-3 p-4 bg-gray-800 rounded-xl border border-gray-700">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Token</span>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs text-white ${
                        selectedToken.symbol === "SOL" ? "bg-gradient-to-r from-purple-500 to-pink-500" : "bg-gray-700"
                      }`}
                    >
                      {selectedToken.symbol}
                    </div>
                    <span className="text-white font-medium">{selectedToken.name}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Amount</span>
                  <span className="text-white font-bold text-lg">
                    {amount} {selectedToken.symbol}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Network</span>
                  <span className="text-white font-medium">Solana Devnet</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Network Fee</span>
                  <span className="text-white font-medium">~0.000005 SOL</span>
                </div>
              </div>
            </div>

            {/* Security Notice */}
            <div className="flex items-center gap-3 p-4 bg-gray-800 rounded-xl border border-gray-700">
              <Shield className="w-5 h-5 text-white flex-shrink-0" />
              <div>
                <div className="text-sm font-medium text-white">Transaction Ready</div>
                <div className="text-xs text-gray-400">Review details carefully before confirming</div>
              </div>
            </div>

            {/* Final Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowPreview(false)}
                className="flex-1 h-14 bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded-2xl transition-all duration-200 text-white font-semibold flex items-center justify-center px-3 shadow-md whitespace-nowrap"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleTransfer}
                disabled={isLoading || !isTransactionReady}
                className="flex-1 h-14 bg-[#9945FF] hover:bg-[#7b2cbf] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl transition-all duration-200 text-white font-semibold flex items-center justify-center px-3 shadow-md whitespace-nowrap"
              >
                {isLoading ? <span>Sending...</span> : <span>Confirm Transfer</span>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Transfer
