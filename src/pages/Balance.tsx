"use client"

import { useState, useEffect } from "react"
import { Copy, Eye, EyeOff, ArrowDownLeft, ArrowUpRight, Plus, Repeat, Check, WalletIcon, TrendingUp, DollarSign, Coins, ExternalLink, Clock, CheckCircle, AlertCircle, XCircle } from 'lucide-react'
import type { Wallet, Token } from "../lib/types"

// Mock recent transactions with more realistic data
const mockTxs = [
  {
    id: "1",
    type: "send",
    token: "SOL",
    amount: -0.5,
    to: "9xabc1234567890abcdef1234567890abcdef12",
    date: "2025-07-12",
    time: "14:23:45",
    status: "success",
    usdValue: -50.2,
    txHash: "abc123def456ghi789jkl012mno345pqr678stu901vwx234yz567",
    fee: 0.000005,
  },
  {
    id: "2",
    type: "receive",
    token: "USDC",
    amount: 100,
    from: "5xdef5678901234567890abcdef1234567890ab",
    date: "2025-07-11",
    time: "09:15:22",
    status: "success",
    usdValue: 100.0,
    txHash: "def456ghi789jkl012mno345pqr678stu901vwx234yz567abc123",
    fee: 0.000001,
  },
  {
    id: "3",
    type: "swap",
    token: "BONK",
    amount: 50000,
    swapFrom: "SOL",
    swapFromAmount: 0.0125,
    date: "2025-07-10",
    time: "16:45:12",
    status: "pending",
    usdValue: 1.25,
    txHash: "ghi789jkl012mno345pqr678stu901vwx234yz567abc123def456",
    fee: 0.000003,
  },
  {
    id: "4",
    type: "buy",
    token: "BTC",
    amount: 0.001,
    date: "2025-07-09",
    time: "11:30:08",
    status: "success",
    usdValue: 66.85,
    txHash: "jkl012mno345pqr678stu901vwx234yz567abc123def456ghi789",
    fee: 0.5,
  },
  {
    id: "5",
    type: "send",
    token: "ETH",
    amount: -0.05,
    to: "0x123456789abcdef0123456789abcdef012345678",
    date: "2025-07-08",
    time: "20:12:33",
    status: "failed",
    usdValue: -175.0,
    txHash: "mno345pqr678stu901vwx234yz567abc123def456ghi789jkl012",
    fee: 0.002,
  },
]

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
  const [selectedTx, setSelectedTx] = useState<string | null>(null)

  // Copy address to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(wallet.address)
    setCopied(true)
    setTimeout(() => setCopied(false), 1200)
  }

  // Simulate loading
  useEffect(() => {
    setLoading(true)
    const timer = setTimeout(() => setLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [wallet.id])

  const totalUSD = wallet.tokens.reduce((sum: number, token: Token) => sum + token.usdValue, 0)

  // Helper function to get token icon
  const getTokenIcon = (symbol: string) => {
    const icons: { [key: string]: string } = {
      SOL: "S",
      USDC: "U",
      BONK: "B",
      BTC: "₿",
      ETH: "Ξ",
      DOGE: "D",
      ADA: "A",
      MATIC: "M",
      LINK: "L",
      AVAX: "AV",
      DOT: "P",
      SHIB: "S",
    }
    return icons[symbol] || symbol.charAt(0)
  }

  // Get status icon and color
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "success":
        return { icon: CheckCircle, color: "text-white", bg: "bg-[#4CAF50]" }
      case "pending":
        return { icon: Clock, color: "text-white", bg: "bg-[#FFC107]" }
      case "failed":
        return { icon: XCircle, color: "text-white", bg: "bg-[#9945FF]" }
      default:
        return { icon: AlertCircle, color: "text-white", bg: "bg-[#FFC107]" }
    }
  }

  // Get transaction type config
  const getTransactionTypeConfig = (type: string) => {
    switch (type) {
      case "send":
        return { icon: ArrowUpRight, color: "text-white", bg: "bg-[#9945FF]", label: "Sent" }
      case "receive":
        return { icon: ArrowDownLeft, color: "text-white", bg: "bg-[#4CAF50]", label: "Received" }
      case "swap":
        return { icon: Repeat, color: "text-white", bg: "bg-[#FFC107]", label: "Swapped" }
      case "buy":
        return { icon: Plus, color: "text-white", bg: "bg-[#4CAF50]", label: "Purchased" }
      default:
        return { icon: AlertCircle, color: "text-white", bg: "bg-[#FFC107]", label: "Unknown" }
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto p-4 pb-28 space-y-6">
        {/* Wallet Address */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 hover:bg-gray-800 transition-all duration-200">
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
        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8">
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
                <div className="text-xl text-gray-400 mt-2">{formatBalance(wallet.balance)} SOL</div>
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
        <div className="grid grid-cols-4 gap-4">
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
        <div className="flex space-x-1 bg-gray-900 border border-gray-800 rounded-2xl p-1">
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

        {/* Content */}
        {activeTab === "tokens" && (
          <div className="space-y-4">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-20 bg-gray-900 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid gap-3">
                {wallet.tokens.map((token) => (
                  <div
                    key={token.id}
                    className="bg-gray-900 border border-gray-800 rounded-2xl p-4 hover:bg-gray-800 transition-all duration-200 cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center font-bold text-white text-lg border-2 border-gray-700">
                            {getTokenIcon(token.symbol)}
                          </div>
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#4CAF50] rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full" />
                          </div>
                        </div>
                        <div>
                          <div className="font-semibold text-white text-lg">{token.name}</div>
                          <div className="text-sm text-gray-400 uppercase tracking-wider font-medium">
                            {token.symbol}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-white text-lg">
                          {formatBalance(token.amount, token.decimals)}
                        </div>
                        <div className="text-sm text-gray-400">{formatUSD(token.usdValue)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "activity" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
              <button className="text-sm text-gray-400 hover:text-white transition-colors">View All</button>
            </div>

            {mockTxs.map((tx) => {
              const typeConfig = getTransactionTypeConfig(tx.type)
              const statusConfig = getStatusConfig(tx.status)

              return (
                <div
                  key={tx.id}
                  className="bg-gray-900 border border-gray-800 rounded-2xl p-5 hover:bg-gray-800 transition-all duration-200 cursor-pointer"
                  onClick={() => setSelectedTx(selectedTx === tx.id ? null : tx.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <div className={`p-3 rounded-full ${typeConfig.bg}`}>
                          <typeConfig.icon className={`w-5 h-5 ${typeConfig.color}`} />
                        </div>
                        <div
                          className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full ${statusConfig.bg} flex items-center justify-center`}
                        >
                          <statusConfig.icon className={`w-3 h-3 ${statusConfig.color}`} />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-white text-lg">{typeConfig.label}</span>
                          <span className="text-sm text-gray-400">{tx.token}</span>
                        </div>
                        <div className="text-sm text-gray-400">
                          {tx.type === "send" && tx.to && `To ${tx.to.slice(0, 8)}...${tx.to.slice(-6)}`}
                          {tx.type === "receive" && tx.from && `From ${tx.from.slice(0, 8)}...${tx.from.slice(-6)}`}
                          {tx.type === "swap" && `${tx.swapFrom} → ${tx.token}`}
                          {tx.type === "buy" && `Market purchase`}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                          <span>{tx.date}</span>
                          <span>•</span>
                          <span>{tx.time}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-bold text-lg ${tx.amount > 0 ? "text-white" : "text-gray-400"}`}>
                        {tx.amount > 0 ? "+" : ""}
                        {formatBalance(Math.abs(tx.amount))} {tx.token}
                      </div>
                      <div className="text-sm text-gray-400">{formatUSD(Math.abs(tx.usdValue))}</div>
                      <div
                        className={`inline-block text-[10px] font-medium mt-1 px-1.5 py-0.5 rounded-full ${statusConfig.bg} ${statusConfig.color} capitalize`}
                      >
                        {tx.status}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {selectedTx === tx.id && (
                    <div className="mt-4 pt-4 border-t border-gray-700 space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-1">
                            Transaction Hash
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm text-white">
                              {tx.txHash.slice(0, 12)}...{tx.txHash.slice(-8)}
                            </span>
                            <button className="p-1 hover:bg-gray-700 rounded transition-colors">
                              <ExternalLink className="w-3 h-3 text-gray-400" />
                            </button>
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-1">
                            Network Fee
                          </div>
                          <div className="text-sm text-white">
                            {tx.type === "buy" ? formatUSD(tx.fee) : `${tx.fee} SOL`}
                          </div>
                        </div>
                      </div>

                      {tx.type === "swap" && (
                        <div className="bg-gray-800 rounded-xl p-3 border border-gray-700">
                          <div className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-2">
                            Swap Details
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-gray-400">
                                -{tx.swapFromAmount} {tx.swapFrom}
                              </span>
                            </div>
                            <Repeat className="w-4 h-4 text-gray-400" />
                            <div className="flex items-center gap-2">
                              <span className="text-white">
                                +{formatBalance(tx.amount)} {tx.token}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2">
                        <button className="text-sm text-gray-400 hover:text-white transition-colors">
                          View on Explorer
                        </button>
                        <button className="text-sm text-gray-400 hover:text-white transition-colors">
                          Copy Details
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default Balance
