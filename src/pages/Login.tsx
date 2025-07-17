"use client"
import type React from "react"
import { useState, useEffect } from "react"
import { Fingerprint, Shield, Sparkles, Zap, Check, X, AlertCircle } from "lucide-react"
import { useWallet } from "@lazorkit/wallet"

interface LoginProps {
  onLogin: (walletData: { smartWalletAddress: string; account: unknown }) => void
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [authStep, setAuthStep] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [isSdkReady, setIsSdkReady] = useState(false)

  // Đã thêm 'reconnect' vào destructuring
  const { connect, isConnected, smartWalletPubkey } = useWallet()

  // Kiểm tra SDK sẵn sàng
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSdkReady(true)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  // Kiểm tra nếu đã có smartWalletPubkey từ trước
  useEffect(() => {
    if (smartWalletPubkey) {
      onLogin({
        smartWalletAddress: smartWalletPubkey.toBase58(),
        account: { smartWallet: smartWalletPubkey },
      })
    }
  }, [smartWalletPubkey, onLogin])

  const handleConnect = async () => {
    if (!isSdkReady) {
      setError("LazorKit SDK is not ready. Please wait a moment and try again.")
      return
    }
    setIsDialogOpen(true)
    setIsAuthenticating(true)
    setAuthStep(0)
    setError(null)
    try {
      setTimeout(() => setAuthStep(1), 600)
      await connect();
      setTimeout(() => setAuthStep(2), 1200)
      // Đợi SDK cập nhật state
      const checkConnected = () => {
        if (isConnected && smartWalletPubkey) {
          setIsAuthenticating(false)
          setAuthStep(3)
          setTimeout(() => {
            setIsDialogOpen(false)
            onLogin({ smartWalletAddress: smartWalletPubkey.toBase58(), account: { smartWallet: smartWalletPubkey } })
          }, 1000)
        } else {
          setTimeout(checkConnected, 200)
        }
      }
      checkConnected();
    } catch (error) {
      console.error("Login failed:", error)
      setError(error instanceof Error ? error.message : "Authentication failed")
      setIsAuthenticating(false)
      setAuthStep(0)
    }
  }

  const getAuthMessage = () => {
    switch (authStep) {
      case 0:
        return "Initializing secure connection..."
      case 1:
        return "Creating passkey authentication..."
      case 2:
        return "Setting up your Solana smart wallet..."
      case 3:
        return "Syncing wallet state..."
      case 4:
        return "Authentication successful!"
      default:
        return "Please authenticate with your device"
    }
  }

  return (
    <div className="min-h-screen w-full bg-black relative overflow-hidden">
      {/* Main content - perfectly centered */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="relative z-10 w-full max-w-md">
          {/* Container */}
          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 shadow-2xl">
            {/* Header Section */}
            <div className="flex flex-col items-center space-y-6 text-center">
              {/* Logo */}
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gray-800 flex items-center justify-center shadow-2xl border border-gray-700 hover:border-[#9945FF] transition-all duration-200">
                  <Shield className="w-12 h-12 text-white" />
                </div>
              </div>
              {/* Title */}
              <h1 className="text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-[#9945FF]">
                LazorKit
              </h1>
              <div className="text-xl font-semibold text-gray-400">Solana Wallet</div>
              <p className="text-gray-400 text-base font-medium">Devnet • Secure • Fast</p>
            </div>
            {/* Feature cards - Updated layout */}
            <div className="flex justify-center items-center mt-8 mb-8">
              <div className="grid grid-cols-3 gap-4 w-full max-w-xs">
                {[
                  { icon: Shield, label: "Secure", iconColor: "text-white" },
                  { icon: Zap, label: "Fast", iconColor: "text-white" },
                  { icon: Sparkles, label: "Easy", iconColor: "text-white" },
                ].map(({ icon: Icon, label, iconColor }) => (
                  <div
                    key={label}
                    className="p-4 rounded-xl bg-gray-800 border border-gray-700 hover:border-[#9945FF] transition-all duration-200 hover:bg-gray-700"
                  >
                    <div className="flex flex-col items-center space-y-2">
                      <Icon className={`w-6 h-6 ${iconColor}`} />
                      <span className="text-sm font-medium text-white">{label}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Login Button */}
            <div className="space-y-6">
              <button
                onClick={handleConnect}
                disabled={isAuthenticating || !isSdkReady}
                className="w-full h-16 text-lg font-semibold bg-[#9945FF] hover:bg-[#7b2cbf] text-white hover:text-white border border-[#9945FF] transition-all duration-200 hover:scale-105 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center justify-center space-x-3">
                  <Fingerprint className="w-6 h-6" />
                  <span>
                    {isAuthenticating ? "Authenticating..." : isSdkReady ? "Login with Passkey" : "Loading SDK..."}
                  </span>
                </div>
              </button>
              <div className="text-center space-y-3">
                <p className="text-sm text-gray-400">Use biometric authentication or device PIN</p>
              </div>
            </div>
            {/* Trust indicators */}
            <div className="flex items-center justify-center space-x-8 text-xs text-gray-400 mt-6">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span>Devnet</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-white rounded-full" />
                <span>Secure</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-white rounded-full" />
                <span>Private</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Authentication Dialog */}
      {isDialogOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="relative w-full max-w-md">
            <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 shadow-2xl">
              {/* Close button */}
              <button
                onClick={() => {
                  setIsDialogOpen(false)
                  setIsAuthenticating(false)
                  setError(null)
                }}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-800 hover:bg-gray-700 border border-gray-700 flex items-center justify-center transition-all duration-200"
              >
                <X className="w-4 h-4 text-white" />
              </button>
              {/* Header */}
              <div className="text-center space-y-2 mb-8">
                <div className="flex items-center justify-center space-x-3">
                  <div className="p-2 bg-gray-800 rounded-full">
                    <Fingerprint className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-white">Authenticate with Passkey</h2>
                </div>
                <p className="text-gray-400 text-sm">Creating and connecting your Solana wallet on Devnet</p>
              </div>
              <div className="flex flex-col items-center space-y-6">
                {error ? (
                  <>
                    {/* Error state */}
                    <div className="relative">
                      <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center border-2 border-red-500">
                        <AlertCircle className="w-12 h-12 text-red-500" />
                      </div>
                    </div>
                    <div className="text-center space-y-2">
                      <p className="text-sm font-medium text-red-400">Authentication failed</p>
                      <p className="text-xs text-gray-400">{error}</p>
                      <button
                        onClick={() => {
                          setError(null)
                          handleConnect()
                        }}
                        className="mt-4 px-4 py-2 bg-[#9945FF] text-white rounded-lg hover:bg-[#7b2cbf] transition-colors"
                      >
                        Try Again
                      </button>
                    </div>
                  </>
                ) : isAuthenticating ? (
                  <>
                    {/* Animated authentication icon */}
                    <div className="relative">
                      <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center relative border-2 border-[#9945FF]">
                        <Fingerprint className="w-12 h-12 text-white animate-pulse" />
                      </div>
                    </div>
                    {/* Progress steps */}
                    <div className="flex items-center space-x-2">
                      {[0, 1, 2, 3].map((step) => (
                        <div key={step} className="flex items-center">
                          <div
                            className={`w-2 h-2 rounded-full transition-all duration-500 ${
                              step <= authStep ? "bg-[#9945FF]" : "bg-gray-700"
                            }`}
                          />
                          {step < 3 && (
                            <div
                              className={`w-6 h-0.5 mx-1 transition-all duration-500 ${
                                step < authStep ? "bg-[#9945FF]" : "bg-gray-700"
                              }`}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="text-center space-y-3">
                      <p className="text-sm font-medium text-white">{getAuthMessage()}</p>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Success state */}
                    <div className="relative">
                      <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center border-2 border-green-500">
                        <Check className="w-12 h-12 text-green-500" />
                      </div>
                    </div>
                    <div className="text-center space-y-2">
                      <p className="text-sm font-medium text-white">Wallet is ready to use!</p>
                      <p className="text-xs text-gray-400">Redirecting to your wallet...</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Login