"use client"

import type React from "react"
import { useState } from "react"
import { ChevronDown, Wallet, Copy, Check } from "lucide-react"
import type { Wallet as WalletType } from "../../lib/types"
import { formatAddress } from "../../lib/utils"

interface WalletSelectorProps {
  wallets: WalletType[]
  selectedWallet: WalletType
  onWalletChange: (wallet: WalletType) => void
  dropdownClassName?: string
  iconOnly?: boolean
}

export const WalletSelector: React.FC<WalletSelectorProps> = ({
  wallets,
  selectedWallet,
  onWalletChange,
  dropdownClassName = "",
  iconOnly = false,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCopy = (address: string, e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 1200)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-2 bg-gray-900 border border-gray-800 rounded-xl hover:bg-gray-800 transition-all duration-200"
      >
        <div className="p-2 bg-gray-800 rounded-lg">
          <Wallet className="w-5 h-5 text-white" />
        </div>
        {!iconOnly && (
          <>
            <div className="text-left">
              <div className="text-sm font-medium text-white">{selectedWallet.name}</div>
              <div className="text-xs text-gray-400 font-mono">{formatAddress(selectedWallet.address)}</div>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div
            className={`absolute top-full right-0 mt-2 w-80 max-w-xs bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl z-50 overflow-hidden ${dropdownClassName || "left-auto"}`}
          >
            <div className="p-4 space-y-4">
              <div className="text-sm font-medium text-gray-400 uppercase tracking-wider">Your Wallets</div>
              {wallets.map((wallet) => (
                <div
                  key={wallet.id}
                  className={`p-4 rounded-xl cursor-pointer transition-all duration-200 flex items-center gap-3 shadow-md
                    ${wallet.id === selectedWallet.id
                      ? "bg-black border-2 border-[#9945FF] scale-105"
                      : "bg-black border border-gray-700 hover:bg-gray-800 hover:scale-105"}
                  `}
                  onClick={() => {
                    onWalletChange(wallet)
                    setIsOpen(false)
                  }}
                >
                  <div className="p-2 bg-gray-900 rounded-lg flex items-center justify-center">
                    <Wallet className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="text-base font-semibold text-white truncate">{wallet.name}</div>
                      <button
                        onClick={(e) => handleCopy(wallet.address, e)}
                        className="p-2 hover:bg-gray-800 rounded-lg transition-colors ml-2"
                      >
                        {copied ? (
                          <Check className="w-4 h-4 text-green-400" />
                        ) : (
                          <Copy className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                    <div className="text-xs text-white font-mono truncate">{formatAddress(wallet.address)}</div>
                    <div className="text-sm font-bold text-white mt-1">{wallet.balance.toFixed(4)} <span className="text-xs font-medium text-white">SOL</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
