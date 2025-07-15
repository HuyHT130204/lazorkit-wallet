"use client"

import type React from "react"

import { useState } from "react"
import { Fingerprint, Shield, Sparkles, Lock, Zap, Check, X } from "lucide-react"
import { useWallet } from "@lazorkit/wallet"

interface LoginProps {
  onLogin: (walletData?: { smartWalletAddress: string; account: unknown }) => void
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [authStep, setAuthStep] = useState(0)
  const { createPasskeyOnly, createSmartWalletOnly } = useWallet()

  const fakeLogin = async () => {
    setIsDialogOpen(true)
    setIsAuthenticating(true)
    setAuthStep(0)

    try {
      // Step 1: Create passkey only
      setTimeout(() => setAuthStep(1), 600)
      const passkeyResponse = await createPasskeyOnly()
      console.log("Passkey created:", passkeyResponse)

      // Step 2: Create smart wallet using passkey data
      setTimeout(() => setAuthStep(2), 1200)
      const smartWalletResult = await createSmartWalletOnly(passkeyResponse)
      console.log("Smart wallet result:", smartWalletResult)

      // Step 3: Success
      setTimeout(() => {
        setIsAuthenticating(false)
        setAuthStep(3)
        setTimeout(() => {
          setIsDialogOpen(false)
          onLogin(smartWalletResult)
        }, 800)
      }, 1800)
    } catch (error) {
      console.error("Login failed:", error)
      setIsAuthenticating(false)
      setIsDialogOpen(false)
    }
  }

  const getAuthMessage = () => {
    switch (authStep) {
      case 0:
        return "Initializing secure connection..."
      case 1:
        return "Verifying biometric data..."
      case 2:
        return "Authenticating with passkey..."
      case 3:
        return "Authentication successful!"
      default:
        return "Please authenticate using your device"
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
              <div className="space-y-3">
                <h1 className="text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-[#9945FF]">LazorKit</h1>
                <div className="text-xl font-semibold text-gray-400">Crypto Wallet</div>
                <p className="text-gray-400 text-base font-medium">Secure • Fast • Private</p>
              </div>

              {/* Feature cards */}
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
            <div className="space-y-6 mt-8">
              <button
                onClick={fakeLogin}
                className="w-full h-16 text-lg font-semibold bg-[#9945FF] hover:bg-[#7b2cbf] text-white hover:text-white border border-[#9945FF] transition-all duration-200 hover:scale-105 rounded-2xl"
              >
                <div className="flex items-center justify-center space-x-3">
                  <Fingerprint className="w-6 h-6" />
                  <span>Login with Passkey</span>
                </div>
              </button>

              <div className="text-center space-y-3">
                <p className="text-sm text-gray-400">Use your device's biometric authentication or PIN</p>
                <div className="flex items-center justify-center space-x-2 text-xs text-gray-400">
                  <Lock className="w-3 h-3" />
                  <span>End-to-end encrypted</span>
                </div>
              </div>
            </div>

            {/* Trust indicators */}
            <div className="flex items-center justify-center space-x-8 text-xs text-gray-400 mt-6">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-white rounded-full" />
                <span>Secure</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-white rounded-full" />
                <span>Private</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-white rounded-full" />
                <span>Trusted</span>
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
                onClick={() => setIsDialogOpen(false)}
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
                <p className="text-gray-400 text-sm">Please authenticate using your device's security method</p>
              </div>

              <div className="flex flex-col items-center space-y-6">
                {isAuthenticating ? (
                  <>
                    {/* Animated authentication icon */}
                    <div className="relative">
                      <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center relative border-2 border-[#9945FF]">
                        <Fingerprint className="w-12 h-12 text-white" />
                      </div>
                    </div>

                    {/* Progress steps */}
                    <div className="flex items-center space-x-3">
                      {[0, 1, 2].map((step) => (
                        <div key={step} className="flex items-center">
                          <div
                            className={`w-3 h-3 rounded-full transition-all duration-500 ${
                              step <= authStep ? "bg-[#9945FF]" : "bg-gray-700"
                            }`}
                          />
                          {step < 2 && (
                            <div
                              className={`w-8 h-0.5 mx-1 transition-all duration-500 ${
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
                      <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center border-2 border-[#9945FF]">
                        <Check className="w-12 h-12 text-white" />
                      </div>
                    </div>
                    <div className="text-center space-y-2">
                      <p className="text-sm font-medium text-white">Authentication successful!</p>
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
