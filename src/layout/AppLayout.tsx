import type React from "react"
import { Outlet } from "react-router-dom"
import { WalletSelector } from "../components/wallet/WalletSelector"
import { MainNav } from "./MainNav"
import type { Wallet as WalletType } from "../lib/types"

interface AppLayoutProps {
  wallets: WalletType[]
  selectedWallet: WalletType
  onWalletChange: (wallet: WalletType) => void
}

export const AppLayout: React.FC<AppLayoutProps> = ({ wallets, selectedWallet, onWalletChange }) => {
  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="fixed top-0 left-0 w-full z-40 bg-black border-b border-gray-800 px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <span className="text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-[#9945FF]">LazorKit</span>
          <WalletSelector
            wallets={wallets}
            selectedWallet={selectedWallet}
            onWalletChange={onWalletChange}
            dropdownClassName="right-0 left-auto mt-2 w-80 max-w-xs bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl z-50 overflow-hidden"
            iconOnly
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-20 pt-24 px-4 py-6">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <MainNav />
    </div>
  )
}
