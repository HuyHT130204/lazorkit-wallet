interface Wallet {
  id: string
  address: string
  name: string
  balance: number
  tokens: Token[]
}

interface Token {
  id: string
  name: string
  symbol: string
  amount: number
  usdValue: number
  decimals: number
}

interface Device {
  id: string
  name: string
  type: "phone" | "laptop" | "tablet" | "desktop"
  lastActive: string
  isActive: boolean
}

interface TransferData {
  recipientAddress: string
  tokenId: string
  amount: number
}

export type { Wallet, Token, Device, TransferData }
