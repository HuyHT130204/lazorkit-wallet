import type React from "react"
import { Link, useLocation } from "react-router-dom"
import { Wallet, Smartphone, Send, Settings } from 'lucide-react'
import { cn } from "../lib/utils"

const navItems = [
  { path: "/balance", icon: Wallet, label: "Balance" },
  { path: "/devices", icon: Smartphone, label: "Devices" },
  { path: "/transfer", icon: Send, label: "Transfer" },
  { path: "/settings", icon: Settings, label: "Settings" },
]

export const MainNav: React.FC = () => {
  const location = useLocation()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-black border-t border-gray-800 px-4 py-3">
      <div className="flex justify-around">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center space-y-1 px-4 py-2 rounded-xl transition-all duration-200",
                isActive ? "bg-[#9945FF] text-white" : "text-gray-400 hover:text-white hover:bg-gray-900",
              )}
            >
              <Icon className="h-6 w-6" />
              <span className="text-xs font-semibold tracking-wide">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
