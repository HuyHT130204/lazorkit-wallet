import type React from "react"
import { Outlet } from "react-router-dom"
import { WalletSelector } from "../components/wallet/WalletSelector"
import { MainNav } from "./MainNav"
import type { Wallet as WalletType } from "../lib/types"
import { AlertTriangle } from "lucide-react"

interface AppLayoutProps {
  wallets: WalletType[]
  selectedWallet: WalletType
  onWalletChange: (wallet: WalletType) => void
  isWalletConnected: boolean
  connectionError?: string | null
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  wallets,
  selectedWallet,
  onWalletChange,
  connectionError,
}) => {
  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="fixed top-0 left-0 w-full z-40 bg-black border-b border-gray-800 px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-[#9945FF]">
                LazorKit
              </span>
            </div>
          </div>

          <WalletSelector
            wallets={wallets}
            selectedWallet={selectedWallet}
            onWalletChange={onWalletChange}
            dropdownClassName="right-0 left-auto mt-2 w-80 max-w-xs bg-gray-800 border border-gray-600 rounded-2xl shadow-2xl z-50 overflow-hidden"
            iconOnly
          />
        </div>
      </header>

      {/* Connection Error Banner */}
      {connectionError && (
        <div className="fixed top-20 left-0 right-0 z-30 bg-red-900 border-b border-red-700 px-4 py-2">
          <div className="flex items-center justify-center gap-2 text-red-400 text-sm">
            <AlertTriangle className="w-4 h-4" />
            <span>Connection Error: {connectionError}</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className={`pb-20 pt-24 px-4 py-6 ${connectionError ? "pt-32" : ""}`}>
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <MainNav />
    </div>
  )
}