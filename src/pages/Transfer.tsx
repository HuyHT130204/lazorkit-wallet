"use client"

import React, { useState, useEffect } from "react"
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
} from "lucide-react"
import { PublicKey } from "@solana/web3.js"
import type { TokenInfo } from "../services/solana"
import { fetchTokenList, buildTransferTransaction } from "../services/solana"
import { useWallet } from "@lazorkit/wallet"

function useLazorkit() {
  const wallet = useWallet() as unknown
  // Ép kiểu rõ ràng để lấy signAndSendTransaction nếu có
  if (wallet && typeof (wallet as { signAndSendTransaction?: unknown }).signAndSendTransaction === 'function') {
    return {
      signAndSendTransaction: (wallet as { signAndSendTransaction: (tx: unknown) => Promise<unknown> }).signAndSendTransaction,
    }
  }
  return { signAndSendTransaction: async () => { throw new Error('signAndSendTransaction not available') } }
}

interface TransferProps {
  wallet: { address: string }
  onTransfer?: (transferDetails: { recipientAddress: string; tokenId: string; amount: number }) => void
}

const Transfer: React.FC<TransferProps> = ({ wallet }) => {
  const [recipientAddress, setRecipientAddress] = useState("")
  const [tokens, setTokens] = useState<TokenInfo[]>([])
  const [selectedTokenMint, setSelectedTokenMint] = useState<string>("")
  const [amount, setAmount] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [showTokenDropdown, setShowTokenDropdown] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { signAndSendTransaction } = useLazorkit()

  useEffect(() => {
    let ignore = false
    const fetchTokens = async () => {
      try {
        const toks = await fetchTokenList(wallet.address)
        if (!ignore) {
          setTokens(toks)
          if (toks.length > 0) setSelectedTokenMint(toks[0].mint)
        }
      } catch {
        if (!ignore) setTokens([])
      }
    }
    if (wallet.address) fetchTokens()
    return () => { ignore = true }
  }, [wallet.address])

  const selectedToken = tokens.find((t) => t.mint === selectedTokenMint)

  const handleTransfer = async () => {
    setError(null)
    if (!recipientAddress.trim() || !selectedTokenMint || !amount || !selectedToken) return
    setIsLoading(true)
    try {
      const tx = await buildTransferTransaction({
        from: new PublicKey(wallet.address),
        to: recipientAddress.trim(),
        amount: Number.parseFloat(amount),
        mint: selectedTokenMint,
      })
      await signAndSendTransaction(tx)
      setShowSuccessDialog(true)
      setRecipientAddress("")
      setAmount("")
    } catch (e: unknown) {
      const errMsg = e instanceof Error ? e.message : "Transfer failed"
      setError(errMsg)
    } finally {
      setIsLoading(false)
      setShowPreview(false)
    }
  }

  const handlePreview = () => {
    if (isValid && !hasInsufficientBalance) {
      setShowPreview(true)
    }
  }

  const isValid = recipientAddress.trim() && selectedTokenMint && amount && Number.parseFloat(amount) > 0
  const hasInsufficientBalance = selectedToken && Number.parseFloat(amount) > (selectedToken.amount || 0)

  const formatAddress = (address: string) => {
    if (!address) return ""
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const setPercentage = (percentage: number) => {
    if (selectedToken) {
      const newAmount = ((selectedToken.amount * percentage) / 100).toFixed(selectedToken.decimals)
      setAmount(newAmount)
    }
  }

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
            <p className="text-gray-400 mb-6 text-center">Your tokens have been sent successfully!</p>
            <button
              onClick={() => setShowSuccessDialog(false)}
              className="mt-2 px-6 py-2 rounded-xl bg-[#9945FF] text-white font-semibold hover:bg-[#7b2cbf] transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 rounded-xl bg-gray-900 border border-gray-800">
            <Send className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Send Tokens</h1>
            <p className="text-gray-400 text-sm">Transfer tokens securely to any wallet</p>
          </div>
        </div>

        {/* Main Transfer Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 space-y-6 hover:bg-gray-800 transition-all duration-200">
          {/* Recipient Address */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-white">Recipient Address</label>
            <div className="relative">
              <input
                type="text"
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
                placeholder="Enter wallet address (0x...)"
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
              <div className="flex items-center gap-2 text-white">
                <CheckCircle className="w-4 h-4 text-[#4CAF50]" />
                <span>Valid address format</span>
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
                    <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center font-bold text-white">
                      {selectedToken.mint.slice(0, 4)}
                    </div>
                    <div className="text-left">
                      <div className="font-semibold">{selectedToken.mint.slice(0, 8)}</div>
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
                  {tokens.map((token) => (
                    <button
                      key={token.mint}
                      type="button"
                      onClick={() => {
                        setSelectedTokenMint(token.mint)
                        setShowTokenDropdown(false)
                      }}
                      className="w-full p-4 hover:bg-gray-800 transition-colors flex items-center gap-3 border-b border-gray-800 last:border-b-0"
                    >
                      <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center font-bold text-white">
                        {token.mint.slice(0, 4)}
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-semibold">{token.mint.slice(0, 8)}</div>
                        <div className="text-sm text-gray-400">
                          Balance: {token.amount.toFixed(token.decimals)}
                        </div>
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
                  {selectedToken ? selectedToken.mint.slice(0, 4) : "TOKEN"}
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
            {/* Amount Info */}
            {selectedToken && (
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">Available:</span>
                  <span className="text-white font-medium">
                    {selectedToken.amount.toFixed(selectedToken.decimals)}
                  </span>
                </div>
              </div>
            )}
            {hasInsufficientBalance && (
              <div className="flex items-center gap-2 text-gray-400">
                <AlertCircle className="w-4 h-4 text-[#9945FF]" />
                <span>Insufficient balance</span>
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
                onClick={() => setPercentage(percentage)}
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
              disabled={!isValid || hasInsufficientBalance}
              className="flex-1 h-14 bg-gray-900 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-800 rounded-2xl transition-all duration-200 text-white font-semibold flex items-center justify-center px-3 shadow-md whitespace-nowrap"
            >
              Preview Transfer
            </button>
            <button
              type="button"
              onClick={handleTransfer}
              disabled={isLoading}
              className="flex-1 h-14 bg-[#9945FF] hover:bg-[#7b2cbf] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl transition-all duration-200 text-white font-semibold flex items-center justify-center px-3 shadow-md whitespace-nowrap"
            >
              {isLoading ? <span>Processing...</span> : <span>Send Now</span>}
            </button>
          </div>
        </div>

        {/* Transfer Preview */}
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
                    <div className="w-6 h-6 bg-gray-700 rounded-full flex items-center justify-center font-bold text-xs text-white">
                      {selectedToken.mint.slice(0, 4)}
                    </div>
                    <span className="text-white font-medium">{selectedToken.mint.slice(0, 8)}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Amount</span>
                  <span className="text-white font-bold text-lg">
                    {amount} {selectedToken.mint.slice(0, 4)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Network Fee</span>
                  <span className="text-white font-medium">~$0.01</span>
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
                disabled={isLoading}
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
