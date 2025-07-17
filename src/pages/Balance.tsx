"use client"

import { useState, useEffect, useCallback } from "react"
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
  DollarSign,
  Coins,
  RefreshCw,
  ExternalLink,
} from "lucide-react"
import type { Wallet } from "../lib/types"
import type { TokenInfo } from "../services/solana"
import { fetchBalance, fetchTokenList, fetchTransactionHistory } from "../services/solana"

type TransactionHistory = {
  signature: string;
  slot: number;
  err: unknown;
  blockTime: number | null | undefined;
  memo: string | null;
  tx: unknown | null;
};

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
  const [refreshing, setRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState("tokens")
  const [balance, setBalance] = useState<number>(0)
  const [tokens, setTokens] = useState<TokenInfo[]>([])
  const [transactions, setTransactions] = useState<TransactionHistory[]>([])
  const [loadingTx, setLoadingTx] = useState(false)

  // Copy address to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(wallet.address)
    setCopied(true)
    setTimeout(() => setCopied(false), 1200)
  }

  // Fetch real balance and tokens
  const fetchData = useCallback(
    async (showRefreshIndicator = false) => {
      if (showRefreshIndicator) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      try {
        console.log("Fetching balance and tokens for:", wallet.address)
        const [bal, toks] = await Promise.all([fetchBalance(wallet.address), fetchTokenList(wallet.address)])

        console.log("Fetched balance:", bal, "SOL")
        console.log("Fetched tokens:", toks)

        setBalance(bal)
        setTokens(toks)
      } catch (error) {
        console.error("Error fetching wallet data:", error)
        setBalance(0)
        setTokens([])
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    },
    [wallet.address, setBalance, setTokens, setLoading, setRefreshing],
  )

  useEffect(() => {
    if (wallet.address) {
      fetchData()
    }
  }, [wallet.address, fetchData])

  // Fetch transaction history when tab changes to activity
  useEffect(() => {
    if (activeTab === "activity" && wallet.address) {
      setLoadingTx(true)
      fetchTransactionHistory(wallet.address, 10)
        .then((txs) => setTransactions(txs as TransactionHistory[]))
        .finally(() => setLoadingTx(false))
    }
  }, [activeTab, wallet.address])

  const handleRefresh = () => {
    fetchData(true)
  }

  // Mock USD values (in real app, you'd fetch from price API)
  const solPrice = 20 // Mock SOL price in USD
  const totalUSD = balance * solPrice + tokens.reduce((sum, token) => sum + token.amount * 1, 0)

  // Helper function to get token icon
  const getTokenIcon = (mint: string) => {
    return mint.slice(0, 2).toUpperCase()
  }

  // Open Solana Explorer
  const openInExplorer = (address: string) => {
    window.open(`https://explorer.solana.com/address/${address}?cluster=devnet`, "_blank")
  }

  // Thêm hàm helper để phân tích giao dịch gửi/nhận và số lượng
  function parseTransfer(tx: TransactionHistory, userAddress: string) {
    // Nếu không có tx hoặc meta, trả về null
    if (!tx.tx || typeof tx.tx !== 'object' || !('transaction' in tx.tx) || !('meta' in tx.tx)) return null;
    // Định nghĩa type rõ ràng cho meta và transaction
    interface MetaType { preBalances: number[]; postBalances: number[] }
    interface TransactionType { message: { accountKeys: Array<string | { pubkey: string }> } }
    const meta = (tx.tx as { meta?: MetaType }).meta;
    const transaction = (tx.tx as { transaction?: TransactionType }).transaction;
    if (!meta || !transaction) return null;
    // Tìm các instruction chuyển token hoặc SOL
    const preBalances = meta.preBalances || [];
    const postBalances = meta.postBalances || [];
    const accountKeys = transaction.message.accountKeys || [];
    // Nếu không đủ dữ liệu, bỏ qua
    if (!Array.isArray(preBalances) || !Array.isArray(postBalances) || preBalances.length !== postBalances.length) return null;
    // Tìm index của user
    const userIndex = accountKeys.findIndex((k: string | { pubkey: string }) => (typeof k === 'string' ? k : k.pubkey) === userAddress);
    if (userIndex === -1) return null;
    const delta = (postBalances[userIndex] - preBalances[userIndex]) / 1e9; // SOL
    // Nhận: delta > 0, Gửi: delta < 0
    let direction = '';
    if (delta > 0) direction = 'Received';
    else if (delta < 0) direction = 'Sent';
    else direction = 'Other';
    // Tìm đối tác (người gửi/nhận còn lại)
    let partner = '';
    if (direction !== 'Other') {
      for (let i = 0; i < accountKeys.length; i++) {
        if (i !== userIndex && preBalances[i] !== postBalances[i]) {
          const key = accountKeys[i];
          if (typeof key === 'string') {
            partner = key;
          } else if (typeof key === 'object' && key && 'pubkey' in key) {
            partner = key.pubkey;
          }
          break;
        }
      }
    }
    return { direction, amount: Math.abs(delta), partner };
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
                <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">Solana Devnet Wallet</p>
                <span className="font-mono text-sm text-white select-all">
                  {wallet.address.slice(0, 10)}...{wallet.address.slice(-8)}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Bỏ nút dẫn đến explorer */}
              {/* <button
                onClick={() => openInExplorer(wallet.address)}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors duration-200"
                title="View in Solana Explorer"
              >
                <ExternalLink className="w-4 h-4 text-gray-400" />
              </button> */}
              <button onClick={handleCopy} className="p-2 hover:bg-gray-700 rounded-lg transition-colors duration-200">
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-gray-400" />}
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
                <p className="text-gray-400 text-sm">Devnet portfolio value</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-2 text-sm bg-gray-800 text-white px-3 py-1 rounded-full hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
                {/* Bỏ chữ Refresh */}
              </button>
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
          {/* Thay đổi nút Faucet để mở trang faucet bên ngoài */}
          <button
            onClick={() => window.open("https://faucet.solana.com", "_blank")}
            className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col items-center gap-3 transition-all duration-200 hover:bg-gray-800 hover:border-[#9945FF]"
          >
            <div className="p-3 rounded-full bg-[#4CAF50]">
              <ArrowDownLeft className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm font-medium text-white">Faucet</span>
          </button>

          {[
            { icon: ArrowUpRight, label: "Send", iconColor: "text-white", bgColor: "bg-[#9945FF]" },
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

        {/* Content */}
        {activeTab === "tokens" && (
          <>
            {loading ? (
              <div className="space-y-3 pb-28">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-20 bg-gray-900 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid gap-3 pb-28">
                {/* SOL Token */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 hover:bg-gray-800 transition-all duration-200 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center font-bold text-white text-lg border-2 border-gray-700">
                          SOL
                        </div>
                      </div>
                      <div>
                        <div className="font-semibold text-white text-lg">Solana</div>
                        <div className="text-sm text-gray-400 uppercase tracking-wider font-medium">
                          SOL • Native Token
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-white text-lg">{formatBalance(balance, 9)}</div>
                      <div className="text-sm text-gray-400">{formatUSD(balance * solPrice)}</div>
                    </div>
                  </div>
                </div>

                {/* SPL Tokens */}
                {tokens.map((token) => (
                  <div
                    key={token.mint}
                    className="bg-gray-900 border border-gray-800 rounded-2xl p-4 hover:bg-gray-800 transition-all duration-200 cursor-pointer"
                    onClick={() => openInExplorer(token.mint)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center font-bold text-white text-lg border-2 border-gray-700">
                            {getTokenIcon(token.mint)}
                          </div>
                        </div>
                        <div>
                          <div className="font-semibold text-white text-lg">{token.mint.slice(0, 8)}...</div>
                          <div className="text-sm text-gray-400 uppercase tracking-wider font-medium">
                            SPL Token • {token.decimals} decimals
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

                {(balance === 0 && tokens.length === 0 && !loading) && (
                  <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 min-h-[200px] flex flex-col justify-center">
                    <div className="text-center text-gray-400">
                      <Coins className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                      <p className="text-lg font-medium mb-2">No SPL tokens found</p>
                      <p className="text-sm">Your SPL tokens will appear here once you have some</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {activeTab === "activity" && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 min-h-[200px] flex flex-col justify-center">
            {loadingTx ? (
              <div className="text-center text-gray-400">Loading transactions...</div>
            ) : transactions.length === 0 ? (
              <div className="text-center text-gray-400">
                <Repeat className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                <p className="text-lg font-medium mb-2">Transaction History</p>
                <p className="text-sm">Your transaction history will appear here</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-lg font-semibold text-white mb-2">Recent Transactions</div>
                <ul className="divide-y divide-gray-800">
                  {transactions.map((tx) => {
                    const parsed = parseTransfer(tx, wallet.address);
                    return (
                      <li key={String(tx.signature)} className="py-3 flex flex-row items-center justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="font-mono text-sm text-[#9945FF]">{String(tx.signature).slice(0, 12)}...{String(tx.signature).slice(-8)}</div>
                          <div className="text-xs text-gray-400">Slot: {String(tx.slot)} {tx.blockTime ? `| ${new Date(Number(tx.blockTime) * 1000).toLocaleString()}` : ""}</div>
                          {parsed && (
                            <div className="text-sm mt-1">
                              <span className={parsed.direction === 'Received' ? 'text-green-400' : parsed.direction === 'Sent' ? 'text-red-400' : 'text-gray-400'}>
                                {parsed.direction === 'Received' ? 'Received' : parsed.direction === 'Sent' ? 'Sent' : 'Other'}
                              </span>
                              {parsed.amount > 0 && (
                                <span> {parsed.amount.toFixed(6)} SOL</span>
                              )}
                              {parsed.partner && (
                                <span> {parsed.direction === 'Received' ? 'from' : 'to'} <span className="font-mono">{parsed.partner.slice(0, 6)}...{parsed.partner.slice(-4)}</span></span>
                              )}
                            </div>
                          )}
                          {typeof tx.err === "string" || typeof tx.err === "number" ? (
                            <div className="text-xs text-red-400">Error: {tx.err}</div>
                          ) : typeof tx.err === "object" && tx.err !== null ? (
                            <div className="text-xs text-red-400">Error: {JSON.stringify(tx.err)}</div>
                          ) : null}
                          {typeof tx.memo === "string" && tx.memo && (
                            <div className="text-xs text-gray-400">Memo: {tx.memo}</div>
                          )}
                        </div>
                        <a
                          href={`https://explorer.solana.com/tx/${String(tx.signature)}?cluster=devnet`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center text-[#9945FF] hover:text-[#7b2cbf] transition-colors flex-shrink-0"
                        >
                          <ExternalLink className="w-5 h-5" />
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Balance
