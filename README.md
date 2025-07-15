# LazorKit Wallet - Mobile Web App

A modern, mobile-first cryptocurrency wallet web application built with React, TypeScript, and TailwindCSS.

## 🚀 Features

- **Mobile-First Design**: Optimized for mobile devices with responsive UI
- **Dark Mode**: Beautiful dark theme by default with toggle support
- **Multi-Wallet Support**: Manage multiple wallets with easy switching
- **Token Management**: View balances and transfer tokens
- **Device Management**: Control which devices can access your wallet
- **Passkey Authentication**: Secure biometric/PIN authentication (mock)
- **Modern UI**: Built with shadcn/ui components and TailwindCSS

## 📱 Pages

1. **Login Page**: Secure passkey authentication
2. **Balance Page**: View total balance and token list
3. **Devices Page**: Manage connected devices
4. **Transfer Page**: Send tokens to other addresses
5. **Settings Page**: Wallet configuration and preferences

## 🛠 Tech Stack

- **React 18** + **TypeScript**
- **Vite** for fast development
- **TailwindCSS** for styling
- **shadcn/ui** for UI components
- **React Router** for navigation
- **Lucide React** for icons
- **clsx** for conditional classes

## 🏗 Project Structure

```
src/
├── components/
│   ├── ui/          # shadcn/ui components
│   ├── wallet/      # Wallet-specific components
│   └── shared/      # Shared components
├── pages/           # Page components
├── layout/          # Layout components
├── lib/             # Utilities and types
└── App.tsx          # Main app component
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- Yarn or npm

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   yarn install
   ```

3. Start development server:
   ```bash
   yarn dev
   ```

4. Open [http://localhost:5173](http://localhost:5173) in your browser

## 🎨 Design System

- **Colors**: CSS variables for easy theming
- **Typography**: Consistent font scales
- **Spacing**: TailwindCSS spacing system
- **Components**: Reusable shadcn/ui components

## 📱 Mobile Features

- Bottom tab navigation
- Touch-friendly buttons and inputs
- Responsive layouts
- Mobile-optimized forms

## 🔧 Development Notes

This is a **mock UI application** designed for integration with LazorKit SDK. All functionality is simulated:

- Authentication is mocked with a 2-second delay
- Transfers show alerts instead of real blockchain transactions
- Device management is local state only
- No real wallet connections or blockchain interactions

## 🎯 Integration Ready

The application is structured to easily integrate with:

- LazorKit SDK for wallet operations
- Real passkey authentication
- Blockchain transactions
- Device management APIs
- Real-time balance updates

## 📄 License

MIT License
