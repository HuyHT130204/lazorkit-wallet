"use client"

import type React from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  LogOut,
  User,
  Shield,
  Edit3,
  Check,
  X,
  Bell,
  Lock,
  Smartphone,
  Info,
  ChevronRight,
  Trash2,
  AlertTriangle,
} from "lucide-react"

interface SettingsProps {
  walletName: string
  onUpdateWalletName: (name: string) => void
  onLogout: () => void
}

const Settings: React.FC<SettingsProps> = ({ walletName, onUpdateWalletName, onLogout }) => {
  const navigate = useNavigate()
  const [isEditingName, setIsEditingName] = useState(false)
  const [newWalletName, setNewWalletName] = useState(walletName)

  const handleSaveName = () => {
    if (newWalletName.trim()) {
      onUpdateWalletName(newWalletName.trim())
      setIsEditingName(false)
    }
  }

  const handleCancel = () => {
    setNewWalletName(walletName)
    setIsEditingName(false)
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:bg-gray-800 transition-all duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="p-3 bg-gray-800 rounded-2xl flex items-center justify-center">
                  <Shield className="w-7 h-7 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#9945FF] rounded-full flex items-center justify-center border-2 border-black">
                  <div className="w-2 h-2 bg-white rounded-full" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white">Settings</h1>
                <p className="text-gray-400 text-sm mt-1 block">
                  Manage wallet
                  <br />
                  preferences & security
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm bg-gray-800 text-white px-3 py-2 rounded-full">
              <div className="w-2 h-2 bg-[#9945FF] rounded-full" />
              <span className="font-medium">Secure</span>
            </div>
          </div>
        </div>

        {/* Profile Section */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:bg-gray-800 transition-all duration-200">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center justify-center p-3 bg-gray-800 rounded-2xl">
              <User className="w-7 h-7 text-white" />
            </div>
            <div className="flex flex-col">
              <h2 className="text-xl font-semibold leading-tight text-white">Profile Settings</h2>
              <p className="text-gray-400 text-sm leading-snug">Customize your wallet identity</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-3">Wallet Name</label>
              {isEditingName ? (
                <div className="flex gap-3 w-full items-center">
                  <input
                    value={newWalletName}
                    onChange={(e) => setNewWalletName(e.target.value)}
                    className="flex-1 h-12 px-4 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#9945FF] focus:border-[#9945FF] transition-all duration-200 min-w-0"
                    placeholder="Enter wallet name"
                  />
                  <button
                    onClick={handleSaveName}
                    className="w-12 h-12 flex items-center justify-center rounded-xl bg-[#4CAF50] hover:bg-green-700 hover:text-white text-white transition-all duration-200 text-lg shadow-md focus:outline-none focus:ring-2 focus:ring-[#9945FF]"
                    title="Save"
                  >
                    <Check className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleCancel}
                    className="w-12 h-12 flex items-center justify-center rounded-xl bg-gray-800 hover:bg-gray-700 transition-all duration-200 text-white text-lg shadow-md focus:outline-none focus:ring-2 focus:ring-[#9945FF]"
                    title="Cancel"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between p-4 bg-gray-900 rounded-xl border border-gray-800 hover:border-[#9945FF] transition-all duration-200">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center font-bold text-xl text-white">
                      {walletName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <span className="font-semibold text-lg text-white">{walletName}</span>
                      <p className="text-gray-400 text-sm">Main wallet</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="opacity-80 hover:opacity-100 transition-opacity duration-200 p-2 hover:bg-gray-700 rounded-lg"
                  >
                    <Edit3 className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Security Section */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:bg-gray-800 transition-all duration-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gray-800 rounded-2xl">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Security & Privacy</h2>
              <p className="text-gray-400 text-sm">Protect your wallet and funds</p>
            </div>
          </div>
          <div className="space-y-4">
            {/* Passkey */}
            <div className="flex items-center gap-4 p-4 bg-gray-900 rounded-xl border border-gray-800 hover:border-[#9945FF] transition-all duration-200">
              <div className="relative p-3 bg-gray-800 rounded-xl flex items-center justify-center w-12 h-12">
                <Lock className="w-5 h-5 text-white" />
                <span className="absolute bottom-1 right-1 w-4 h-4 bg-[#4CAF50] rounded-full flex items-center justify-center shadow-md">
                  <Check className="w-3 h-3 text-white" />
                </span>
              </div>
              <div className="flex flex-col justify-center">
                <span className="font-semibold text-base text-white">Passkey Authentication</span>
                <span className="flex items-center gap-2 text-gray-400 text-sm mt-0.5">
                  <span className="w-2 h-2 bg-[#4CAF50] rounded-full mr-1" />
                  Biometric security enabled
                </span>
              </div>
            </div>

            {/* Device Management */}
            <div
              className="flex items-center gap-4 p-4 bg-gray-900 rounded-xl border border-gray-800 hover:border-[#9945FF] transition-all duration-200 cursor-pointer"
              onClick={() => navigate("/devices")}
            >
              <div className="p-3 bg-gray-800 rounded-xl flex items-center justify-center w-12 h-12">
                <Smartphone className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col justify-center">
                <span className="font-semibold text-base text-white">Device Management</span>
                <span className="text-gray-400 text-sm mt-0.5">Manage connected devices</span>
              </div>
            </div>

            {/* Notifications */}
            <div className="flex items-center gap-4 p-4 bg-gray-900 rounded-xl border border-gray-800 hover:border-[#9945FF] transition-all duration-200">
              <div className="p-3 bg-gray-800 rounded-xl flex items-center justify-center">
                <Bell className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col w-full min-w-0">
                <span className="font-semibold text-base text-white">Notifications</span>
                <span className="text-gray-400 text-sm break-words">Transaction alerts & security updates</span>
              </div>
            </div>

            {/* About */}
            <div className="flex items-center gap-4 p-4 bg-gray-900 rounded-xl border border-gray-800 hover:border-[#9945FF] transition-all duration-200">
              <div className="p-3 bg-gray-800 rounded-xl flex items-center justify-center">
                <Info className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2 w-full min-w-0">
                <span className="font-semibold text-base text-white whitespace-nowrap">About</span>
                <span className="text-gray-400 text-sm truncate sm:whitespace-normal">
                  Version 1.0.0 • Build 2025.07.13
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:bg-gray-800 transition-all duration-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gray-800 rounded-2xl">
              <AlertTriangle className="w-6 h-6 text-[#9945FF]" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Danger Zone</h2>
              <p className="text-gray-400 text-sm">Irreversible actions</p>
            </div>
          </div>
          <div className="space-y-4">
            <div
              className="flex items-center gap-4 p-4 bg-gray-900 rounded-xl border border-gray-800 hover:border-[#9945FF] transition-all duration-200 cursor-pointer"
              onClick={onLogout}
            >
              <div className="p-3 bg-gray-800 rounded-xl flex items-center justify-center">
                <LogOut className="w-5 h-5 text-[#9945FF]" />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2 w-full min-w-0">
                <span className="font-semibold text-white whitespace-nowrap">Sign Out</span>
                <span className="text-gray-400 text-sm truncate sm:whitespace-normal">
                  You'll need to authenticate again
                </span>
              </div>
            </div>

            {/* Delete Wallet */}
            <div className="flex items-center gap-4 p-4 bg-gray-900 rounded-xl border border-gray-800 hover:border-[#9945FF] transition-all duration-200 group/delete">
              <div className="p-3 bg-gray-800 rounded-xl flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-[#9945FF]" />
              </div>
              <div className="flex flex-col w-full min-w-0">
                <span className="font-semibold text-white">Delete Wallet</span>
                <span className="text-gray-400 text-sm break-words">Permanently remove this wallet</span>
              </div>
              <button className="opacity-0 group-hover/delete:opacity-100 transition-opacity duration-200 p-2 hover:bg-gray-700 rounded-lg">
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings
