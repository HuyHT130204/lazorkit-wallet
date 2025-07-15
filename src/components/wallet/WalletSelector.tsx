"use client"

import type React from "react"
import { useState } from "react"
import { ChevronDown, Wallet, Check, Copy } from 'lucide-react'
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
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const handleCopy = (address: string, walletId: string) => {
    navigator.clipboard.writeText(address)
    setCopiedId(walletId)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="relative">
      {iconOnly ? (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 transition-all duration-200 flex items-center justify-center"
          aria-label="Select wallet"
        >
          <Wallet className="h-6 w-6 text-white" />
        </button>
      ) : (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-3 px-4 py-3 text-sm bg-gray-800 hover:bg-gray-700 rounded-xl transition-all duration-200 border border-gray-700 min-w-[200px]"
        >
          <div className="p-2 rounded-lg bg-gray-900">
            <Wallet className="h-4 w-4 text-white" />
          </div>
          <div className="flex-1 text-left">
            <div className="font-medium text-white">{selectedWallet.name}</div>
            <div className="text-xs text-gray-400 font-mono">{formatAddress(selectedWallet.address)}</div>
          </div>
          <ChevronDown
            className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          />
        </button>
      )}

      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          {/* Dropdown */}
          <div
            className={`absolute top-full right-0 mt-2 w-80 max-w-xs bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl z-50 overflow-hidden ${dropdownClassName}`}
            style={{ minWidth: "240px" }}
          >
            <div className="p-2">
              <div className="text-xs font-medium text-gray-400 px-3 py-2 border-b border-gray-800 mb-2">
                Select Wallet
              </div>
              {wallets.map((wallet) => (
                <div
                  key={wallet.id}
                  className={`relative overflow-hidden rounded-xl transition-all duration-200 ${
                    wallet.id === selectedWallet.id ? "bg-gray-800 border border-[#9945FF]" : "hover:bg-gray-800"
                  }`}
                >
                  <button
                    onClick={() => {
                      onWalletChange(wallet)
                      setIsOpen(false)
                    }}
                    className="w-full text-left p-4 transition-all duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`p-2 rounded-lg transition-all duration-200 ${
                            wallet.id === selectedWallet.id ? "bg-[#9945FF] text-white" : "bg-gray-800 text-gray-400"
                          }`}
                        >
                          <Wallet className="h-4 w-4" />
                        </div>
                        <div>
                          <div
                            className={`font-medium transition-colors duration-200 ${
                              wallet.id === selectedWallet.id ? "text-white" : "text-white"
                            }`}
                          >
                            {wallet.name}
                          </div>
                          <div className="text-xs text-gray-400 font-mono mt-1">{formatAddress(wallet.address)}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span
                          role="button"
                          tabIndex={0}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleCopy(wallet.address, wallet.id)
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.stopPropagation()
                              handleCopy(wallet.address, wallet.id)
                            }
                          }}
                          className="p-2 rounded-lg hover:bg-gray-700 hover:text-white transition-all duration-200 cursor-pointer"
                        >
                          {copiedId === wallet.id ? (
                            <Check className="h-3 w-3 text-white" />
                          ) : (
                            <Copy className="h-3 w-3 text-gray-400" />
                          )}
                        </span>
                        {wallet.id === selectedWallet.id && <div className="w-2 h-2 bg-[#9945FF] rounded-full" />}
                      </div>
                    </div>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
