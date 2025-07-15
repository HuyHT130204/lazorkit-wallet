"use client"

import { useState, useEffect } from "react"
import {
  Copy,
  Eye,
  EyeOff,
  ArrowDownLeft,
  ArrowUpRight,
  Plus,
  Repeat,
  Check,
  WalletIcon,
  TrendingUp,
  DollarSign,
  Coins,
} from "lucide-react"
import type { Wallet } from "../lib/types"
import type { TokenInfo } from "../services/solana"
import { fetchBalance, fetchTokenList } from "../services/solana"

const formatBalance = (amount: number, decimals = 9) => {
  if (amount >= 1000000) {
    return (amount / 1000000).toFixed(2) + "M"
  } else if (amount >= 1000) {
    return (amount / 1000).toFixed(2) + "K"
  } else if (amount < 0.01) {
    return amount.toFixed(8)
  } else {
    return amount.toFixed(decimals > 4 ? 4 : decimals)
  }
}

const formatUSD = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount)
}

interface BalanceProps {
  wallet: Wallet
}

const Balance = ({ wallet }: BalanceProps) => {
  const [showBalance, setShowBalance] = useState(true)
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("tokens")
  const [balance, setBalance] = useState<number>(0)
  const [tokens, setTokens] = useState<TokenInfo[]>([])

  // Copy address to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(wallet.address)
    setCopied(true)
    setTimeout(() => setCopied(false), 1200)
  }

  // Fetch real balance and tokens
  useEffect(() => {
    let ignore = false
    const fetchData = async () => {
      setLoading(true)
      try {
        const [bal, toks] = await Promise.all([fetchBalance(wallet.address), fetchTokenList(wallet.address)])
        if (!ignore) {
          setBalance(bal)
          setTokens(toks)
        }
      } catch {
        if (!ignore) {
          setBalance(0)
          setTokens([])
        }
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    if (wallet.address) fetchData()
    return () => {
      ignore = true
    }
  }, [wallet.address])

  // USD value mock (có thể fetch giá thực tế sau)
  const totalUSD = tokens.reduce((sum, token) => sum + token.amount * 1, 0) // TODO: fetch giá thực tế

  // Helper function to get token icon
  const getTokenIcon = (mint: string) => {
    // Hiện tại chỉ có thể lấy ký tự đầu của mint
    return mint.slice(0, 2)
  }

  return (
    <div className="bg-black text-white">
      <div className="max-w-6xl mx-auto p-4">
        {/* Wallet Address */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 hover:bg-gray-800 transition-all duration-200 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gray-800 flex items-center justify-center">
                <WalletIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">Wallet Address</p>
                <span className="font-mono text-sm text-white select-all">
                  {wallet.address.slice(0, 10)}...{wallet.address.slice(-8)}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleCopy} className="p-2 hover:bg-gray-700 rounded-lg transition-colors duration-200">
                {copied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4 text-gray-400" />}
              </button>
              <button
                onClick={() => setShowBalance(!showBalance)}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors duration-200"
              >
                {showBalance ? <Eye className="w-4 h-4 text-gray-400" /> : <EyeOff className="w-4 h-4 text-gray-400" />}
              </button>
            </div>
          </div>
        </div>

        {/* Total Balance Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gray-800 rounded-full">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">Total Balance</h2>
                <p className="text-gray-400 text-sm">Portfolio value</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm bg-gray-800 text-white px-3 py-1 rounded-full">
              <TrendingUp className="w-4 h-4" />
              <span>+5.2%</span>
            </div>
          </div>
          <div className="space-y-2">
            {loading ? (
              <div className="space-y-2">
                <div className="h-12 w-48 bg-gray-800 rounded-lg animate-pulse" />
                <div className="h-6 w-32 bg-gray-800 rounded-lg animate-pulse" />
              </div>
            ) : showBalance ? (
              <div>
                <div className="text-5xl font-bold text-white tracking-tight">{formatUSD(totalUSD)}</div>
                <div className="text-xl text-gray-400 mt-2">{formatBalance(balance)} SOL</div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="h-12 w-48 bg-gray-800 rounded-lg" />
                <div className="h-6 w-32 bg-gray-800 rounded-lg" />
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { icon: ArrowUpRight, label: "Send", iconColor: "text-white", bgColor: "bg-[#9945FF]" },
            { icon: ArrowDownLeft, label: "Receive", iconColor: "text-white", bgColor: "bg-[#4CAF50]" },
            { icon: Plus, label: "Buy", iconColor: "text-white", bgColor: "bg-[#4CAF50]" },
            { icon: Repeat, label: "Swap", iconColor: "text-white", bgColor: "bg-[#FFC107]" },
          ].map(({ icon: Icon, label, iconColor, bgColor }) => (
            <button
              key={label}
              className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col items-center gap-3 transition-all duration-200 hover:bg-gray-800 hover:border-[#9945FF]"
            >
              <div className={`p-3 rounded-full ${bgColor}`}>
                <Icon className={`w-6 h-6 ${iconColor}`} />
              </div>
              <span className="text-sm font-medium text-white">{label}</span>
            </button>
          ))}
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-900 border border-gray-800 rounded-2xl p-1 mb-6">
          {[
            { id: "tokens", label: "Tokens", icon: Coins, iconColor: "text-white" },
            { id: "activity", label: "Activity", icon: Repeat, iconColor: "text-white" },
          ].map(({ id, label, icon: Icon, iconColor }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                activeTab === id
                  ? "bg-[#9945FF] text-white border border-[#9945FF]"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              }`}
            >
              <Icon className={`w-4 h-4 ${iconColor}`} />
              {label}
            </button>
          ))}
        </div>

        {/* Content - No extra spacing when empty */}
        {activeTab === "tokens" && (
          <>
            {loading ? (
              <div className="space-y-3 pb-28">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-20 bg-gray-900 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : tokens.length === 0 ? (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
                <div className="text-center text-gray-400">
                  <Coins className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                  <p className="text-lg font-medium mb-2">No tokens found</p>
                  <p className="text-sm">Your tokens will appear here once you have some</p>
                </div>
              </div>
            ) : (
              <div className="grid gap-3 pb-28">
                {tokens.map((token) => (
                  <div
                    key={token.mint}
                    className="bg-gray-900 border border-gray-800 rounded-2xl p-4 hover:bg-gray-800 transition-all duration-200 cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center font-bold text-white text-lg border-2 border-gray-700">
                            {getTokenIcon(token.mint)}
                          </div>
                        </div>
                        <div>
                          <div className="font-semibold text-white text-lg">{token.mint.slice(0, 8)}</div>
                          <div className="text-sm text-gray-400 uppercase tracking-wider font-medium">
                            {token.mint.slice(-4)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-white text-lg">
                          {formatBalance(token.amount, token.decimals)}
                        </div>
                        <div className="text-sm text-gray-400">{formatUSD(token.amount * 1)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === "activity" && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
            <div className="text-center text-gray-400">
              <Repeat className="w-12 h-12 mx-auto mb-4 text-gray-600" />
              <p className="text-lg font-medium mb-2">Activity History</p>
              <p className="text-sm">Transaction history will be updated later</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Balance
