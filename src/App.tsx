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
import { useWalletConnection } from "./hooks/useWalletConnection"
import { fetchBalance } from "./services/solana"

if (typeof window !== "undefined") {
  window.Buffer = Buffer
}

function AppContent() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isDarkMode] = useState(true)
  const [walletAddress, setWalletAddress] = useState<string>("")
  const [walletName, setWalletName] = useState("Main Wallet")
  const [walletBalance, setWalletBalance] = useState<number>(0)

  const {
    isConnected,
    address,
    error,
    smartWalletPublicKey,
    isReadyForTransaction,
    signAndSendTransaction,
    connectWallet,
    disconnectWallet,
  } = useWalletConnection()

  // Apply dark mode class to body
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add("dark")
    } else {
      document.body.classList.remove("dark")
    }
  }, [isDarkMode])

  // Sync wallet address with connection state
  useEffect(() => {
    if (address && address !== walletAddress) {
      setWalletAddress(address)
    }
  }, [address, walletAddress])

  // Auto-login nếu wallet đã có smartWalletPubkey và isConnected từ SDK
  useEffect(() => {
    if (isConnected && address && !isLoggedIn) {
      setWalletAddress(address)
      setIsLoggedIn(true)
    }
  }, [isConnected, address, isLoggedIn])

  // Fetch wallet balance when walletAddress changes
  useEffect(() => {
    const fetchWalletBalance = async () => {
      if (walletAddress) {
        const bal = await fetchBalance(walletAddress)
        setWalletBalance(bal)
      } else {
        setWalletBalance(0)
      }
    }
    fetchWalletBalance()
  }, [walletAddress])

  const handleLogin = async (walletData: { smartWalletAddress: string; account: unknown }) => {
    setWalletAddress(walletData.smartWalletAddress)
    setIsLoggedIn(true)
  }

  const handleLogout = async () => {
    await disconnectWallet()
    setIsLoggedIn(false)
    setWalletAddress("")
    setWalletName("Main Wallet")
  }

  const handleWalletConnect = async (): Promise<boolean> => {
    return await connectWallet()
  }

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />
  }

  // Create wallet object for components
  const currentWallet: Wallet = {
    id: "1",
    address: walletAddress,
    name: walletName,
    balance: walletBalance,
    tokens: [],
  }

  const handleWalletChange = () => {
  }

  const handleUpdateWalletName = (name: string) => {
    setWalletName(name)
  }

  const handleTransfer = () => {
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <AppLayout
              wallets={[currentWallet]}
              selectedWallet={currentWallet}
              onWalletChange={handleWalletChange}
              isWalletConnected={!!smartWalletPublicKey}
              connectionError={error}
            />
          }
        >
          <Route index element={<Navigate to="/balance" replace />} />
          <Route path="/balance" element={<Balance wallet={currentWallet} />} />
          <Route path="/devices" element={<Devices />} />
          <Route
            path="/transfer"
            element={
              <Transfer
                wallet={currentWallet}
                onTransfer={handleTransfer}
                onWalletConnect={handleWalletConnect}
                smartWalletPubkey={smartWalletPublicKey}
                signAndSendTransaction={signAndSendTransaction}
                isReadyForTransaction={isReadyForTransaction}
              />
            }
          />
          <Route
            path="/settings"
            element={
              <Settings
                walletName={currentWallet.name}
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
      rpcUrl="https://api.devnet.solana.com"
      ipfsUrl="https://portal.lazor.sh"
      paymasterUrl="https://lazorkit-paymaster.onrender.com"
    >
      <AppContent />
    </LazorkitProvider>
  )
}

export default App
