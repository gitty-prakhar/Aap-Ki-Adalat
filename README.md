# ⚖️ Aap Ki Adalat - Decentralized Arbitration & Escrow Platform

Aap Ki Adalat is a trustless, Web3-based escrow and dispute resolution platform. It allows users to securely lock funds in an escrow for services or agreements, and relies on a decentralized, Kleros-style jury system to resolve any disputes that may arise.

## 🌟 Key Features

- **🔒 Secure Escrow System:** Two parties (Party A and Party B) can lock ETH in a smart contract with predefined deadlines and conditions.
- **🏛️ Decentralized Arbitration:** If a dispute arises, the funds remain locked, and the case is escalated to a decentralized pool of jurors.
- **⚖️ Juror Staking & Incentives:** Users can stake ETH to become jurors. Honest jurors (those who vote with the majority consensus) are rewarded, while malicious or inactive jurors are slashed.
- **📁 IPFS Evidence Upload:** Parties can upload evidence (documents, chat logs) securely to IPFS, ensuring immutable context is available for jurors.
- **📊 Real-time On-chain Tracking:** Full transparency into escrow states, juror votes, and transaction history using the Etherscan API.

## 🛠️ Tech Stack

### Frontend
- **React.js** (Vite)
- **Tailwind CSS** (Styling & responsive design)
- **Framer Motion** (Micro-animations and dynamic UI)
- **Wagmi & Viem** (Ethereum interactions, hooks, and wallet connections)
- **React Router** (Navigation)

### Web3 & Backend
- **Solidity** (Smart contracts deployed on Sepolia Testnet)
- **IPFS / Pinata** (Decentralized evidence storage)
- **Etherscan API** (Fetching user transaction histories)
- **EmailJS** (Off-chain notifications and alerts)

## 🏗️ Smart Contracts Architecture

The platform is powered by modular smart contracts to ensure security and separation of concerns:
1. `EscrowFactory.sol`: Handles the creation of isolated escrow instances, securely locking ETH and enforcing time-bound payouts.
2. `DisputeResolver.sol`: Orchestrates the arbitration logic, tracking dispute states, managing voting deadlines, and executing automated resolutions based on consensus.
3. `JurorRegistry.sol`: Manages the decentralized juror pool by implementing staking requirements and automated slash/reward mechanisms.

## 🚀 Getting Started

Follow these steps to run the frontend locally:

### Prerequisites
- Node.js (v18+)
- npm or yarn
- MetaMask or any Web3 wallet (connected to Sepolia Testnet)
- Testnet ETH (Sepolia)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/himanshu12006/Aap-Ki-Adalat.git
   cd Aap-Ki-Adalat/adalat-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   Rename `.env.example` to `.env` and fill in your keys:
   ```env
   VITE_PINATA_API_KEY=your_pinata_api_key
   VITE_PINATA_SECRET_API_KEY=your_pinata_secret_key
   VITE_EMAILJS_SERVICE_ID=your_emailjs_service_id
   VITE_EMAILJS_TEMPLATE_ID=your_emailjs_template_id
   VITE_EMAILJS_PUBLIC_KEY=your_emailjs_public_key
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to `http://localhost:5173`

## 👥 Team
- **Himanshu Prajapati** - Developer
- Developed during **Hackofiesta** (4-member team project).

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
