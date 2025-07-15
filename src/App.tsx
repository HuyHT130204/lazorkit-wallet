"use client"

import { useState, useEffect } from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import Login from "./pages/Login"
import { AppLayout } from "./layout/AppLayout"
import Balance from "./pages/Balance"
import Devices from "./pages/Devices"
import Transfer from "./pages/Transfer"
import Settings from "./pages/Settings"
import type { Wallet } from "./lib/types"
import { Buffer } from "buffer"
import { LazorkitProvider } from "@lazorkit/wallet"

if (typeof window !== "undefined") {
  window.Buffer = Buffer
}

const mockWallets: Wallet[] = [
  {
    id: "1",
    address: "0x1234567890abcdef1234567890abcdef12345678", // This will be replaced
    name: "Main Wallet",
    balance: 1.25,
    tokens: [
      { id: "1", name: "Ethereum", symbol: "ETH", amount: 10, usdValue: 30000, decimals: 18 },
      { id: "2", name: "Tether", symbol: "USDT", amount: 1000, usdValue: 1000, decimals: 6 },
      { id: "3", name: "Binance Coin", symbol: "BNB", amount: 25, usdValue: 15000, decimals: 18 },
      { id: "4", name: "Cardano", symbol: "ADA", amount: 500, usdValue: 200, decimals: 6 },
    ],
  },
  // ...other mock wallets...
]

function AppContent() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isDarkMode] = useState(true)
  const [selectedWallet, setSelectedWallet] = useState(mockWallets[0])
  const [wallets, setWallets] = useState(mockWallets)
  const [realWalletAddress, setRealWalletAddress] = useState<string | null>(null)

  // Apply dark mode class to body
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add("dark")
    } else {
      document.body.classList.remove("dark")
    }
  }, [isDarkMode])

  const handleLogin = (walletData?: { smartWalletAddress: string; account: unknown }) => {
    if (walletData) {
      // Update the wallet with real address
      setRealWalletAddress(walletData.smartWalletAddress)
      // Update the selected wallet with real address
      const updatedWallet = {
        ...selectedWallet,
        address: walletData.smartWalletAddress,
      }
      setSelectedWallet(updatedWallet)
      // Update wallets array
      setWallets((prev) =>
        prev.map((wallet) =>
          wallet.id === selectedWallet.id ? { ...wallet, address: walletData.smartWalletAddress } : wallet,
        ),
      )
      console.log("Wallet updated with real address:", walletData.smartWalletAddress)
    }
    setIsLoggedIn(true)
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setRealWalletAddress(null)
    // Reset to mock address
    setSelectedWallet(mockWallets[0])
    setWallets(mockWallets)
  }

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />
  }

  const handleWalletChange = (wallet: Wallet) => {
    setSelectedWallet(wallet)
  }

  const handleUpdateWalletName = (name: string) => {
    setWallets((prev) => prev.map((wallet) => (wallet.id === selectedWallet.id ? { ...wallet, name } : wallet)))
    setSelectedWallet((prev) => ({ ...prev, name }))
  }

  const handleTransfer = (data: { recipientAddress: string; tokenId: string; amount: number }) => {
    console.log("Transfer from real wallet:", {
      from: realWalletAddress || selectedWallet.address,
      ...data,
    })
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={<AppLayout wallets={wallets} selectedWallet={selectedWallet} onWalletChange={handleWalletChange} />}
        >
          <Route index element={<Navigate to="/balance" replace />} />
          <Route path="/balance" element={<Balance wallet={selectedWallet} />} />
          <Route path="/devices" element={<Devices />} />
          <Route path="/transfer" element={<Transfer wallet={selectedWallet} onTransfer={handleTransfer} />} />
          <Route
            path="/settings"
            element={
              <Settings
                walletName={selectedWallet.name}
                onUpdateWalletName={handleUpdateWalletName}
                onLogout={handleLogout}
              />
            }
          />
        </Route>
      </Routes>
    </Router>
  )
}

function App() {
  return (
    <LazorkitProvider
      rpcUrl={import.meta.env.VITE_LAZORKIT_RPC_URL || "https://api.devnet.solana.com"}
      ipfsUrl={import.meta.env.VITE_LAZORKIT_PORTAL_URL || "https://portal.lazor.sh"}
      paymasterUrl={import.meta.env.VITE_LAZORKIT_PAYMASTER_URL || "https://lazorkit-paymaster.onrender.com"}
    >
      <AppContent />
    </LazorkitProvider>
  )
}

export default App
