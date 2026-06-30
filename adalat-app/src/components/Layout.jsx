import React, { useState } from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import { useAccount, useConnect, useDisconnect, useBalance } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { formatEther } from 'viem';
import { Scale, Menu, X, User, ExternalLink } from 'lucide-react';

const ADDRESSES = {
  EscrowFactory: '0x95d543180a952919B2c92521718b44D1B4aBb7BC',
  DisputeResolver: '0x76328Df58748a9908aa2be49E3eF59E5f1E0161C',
  JurorRegistry: '0x3ef115f220A019Ce1FD3545891b06CE6EE5867a6',
};

const Layout = () => {
  const { address, isConnected, chain } = useAccount();
  const { connect, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();
  const [mobileOpen, setMobileOpen] = useState(false);

  const { data: balance } = useBalance({
    address,
    query: { enabled: !!address },
  });

  const handleWallet = () => {
    if (isConnected) {
      disconnect();
      toast.success('Wallet disconnected');
    } else {
      connect(
        { connector: injected() },
        {
          onSuccess: () => toast.success('Wallet connected!'),
          onError: (err) => toast.error(err.shortMessage || err.message || 'Connection failed'),
        }
      );
    }
  };

  const navLinkClass = ({ isActive }) =>
    `${isActive ? 'text-gold-500' : 'text-gray-500 hover:text-gray-200'} transition-colors duration-200 text-xs font-mono tracking-widest uppercase`;

  const navItems = [
    { to: '/', label: 'Home' },
    { to: '/disputes', label: 'Escrow' },
    { to: '/file-case', label: 'File Case' },
    { to: '/juror-panel', label: 'Juror' },
    { to: '/stake', label: 'Stake' },
  ];

  return (
    <div className="min-h-screen bg-dark-900 text-gray-300 font-sans flex flex-col">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#111111',
            color: '#e2e8f0',
            border: '1px solid rgba(234,179,8,0.3)',
            borderRadius: '2px',
            fontSize: '12px',
            fontFamily: 'var(--font-mono)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.6)',
          },
        }}
      />

      {/* Announcement bar */}
      <div className="bg-gold-500/10 border-b border-gold-500/20 py-1.5 px-4 text-center">
        <span className="text-[10px] font-mono text-gold-500/80 tracking-widest uppercase">
          ⚡ Live on Ethereum Sepolia Testnet · Smart contracts deployed & verified
        </span>
      </div>

      {/* Header */}
      <header className="border-b border-dark-700/60 bg-dark-900/95 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">

            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 no-underline group">
              <div className="p-1.5 border border-gold-500/40 bg-gold-500/10 text-gold-500 group-hover:border-gold-500/80 group-hover:bg-gold-500/20 transition-all duration-300">
                <Scale size={18} />
              </div>
              <div>
                <h1 className="text-base font-serif text-white font-semibold tracking-wide leading-none">
                  Aap Ki Adalat
                </h1>
                <p className="text-[9px] text-gray-600 font-mono tracking-[0.25em] uppercase mt-0.5">
                  Decentralized Arbitration
                </p>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center space-x-7">
              {navItems.map((item) => (
                <NavLink key={item.to} to={item.to} className={navLinkClass} end={item.to === '/'}>
                  {item.label}
                </NavLink>
              ))}
            </nav>

            {/* Right section */}
            <div className="flex items-center space-x-3">
              {/* Balance */}
              {isConnected && balance?.value !== undefined && (
                <span className="hidden lg:block text-[10px] font-mono text-gray-600">
                  {parseFloat(formatEther(balance.value)).toFixed(4)} ETH
                </span>
              )}

              {/* Network badge */}
              {isConnected && chain && (
                <span className={`hidden lg:block text-[9px] font-mono px-2 py-0.5 border ${
                  chain.id === 11155111
                    ? 'text-green-400 border-green-400/30 bg-green-400/5'
                    : 'text-red-400 border-red-400/30 bg-red-400/5 animate-pulse'
                }`}>
                  {chain.id === 11155111 ? '● Sepolia' : '⚠ Wrong Network'}
                </span>
              )}

              {/* Profile link */}
              {isConnected && (
                <Link
                  to="/profile"
                  className="p-1.5 border border-dark-600 text-gray-500 hover:text-gold-500 hover:border-gold-500/40 transition-all duration-200"
                  title="Your Profile"
                >
                  <User size={15} />
                </Link>
              )}

              {/* Connect Wallet */}
              <button
                onClick={handleWallet}
                disabled={isConnecting}
                className="px-4 py-2 border border-gold-500/40 text-gold-500 text-[11px] font-mono tracking-wider hover:bg-gold-500/10 hover:border-gold-500 transition-all duration-200 cursor-pointer disabled:opacity-50"
              >
                {isConnecting
                  ? 'Connecting...'
                  : isConnected
                  ? `${address.slice(0, 6)}···${address.slice(-4)}`
                  : 'Connect Wallet'}
              </button>

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden text-gray-500 hover:text-gold-500 cursor-pointer transition-colors"
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <nav className="md:hidden border-t border-dark-700/60 bg-dark-800/95 backdrop-blur-xl px-4 py-4 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `block text-xs font-mono tracking-widest py-2.5 px-3 border-l-2 transition-all ${
                    isActive
                      ? 'text-gold-500 border-gold-500 bg-gold-500/5'
                      : 'text-gray-500 border-transparent hover:text-gray-200 hover:border-gray-600'
                  }`
                }
                end={item.to === '/'}
              >
                {item.label.toUpperCase()}
              </NavLink>
            ))}
            {isConnected && (
              <NavLink
                to="/profile"
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center space-x-2 text-xs font-mono tracking-widest py-2.5 px-3 border-l-2 transition-all ${
                    isActive
                      ? 'text-gold-500 border-gold-500 bg-gold-500/5'
                      : 'text-gray-500 border-transparent hover:text-gray-200'
                  }`
                }
              >
                <User size={12} /><span>PROFILE</span>
              </NavLink>
            )}
          </nav>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-dark-700/50 bg-dark-800/30 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Brand */}
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <Scale size={16} className="text-gold-500" />
                <span className="font-serif text-white text-sm">Aap Ki Adalat</span>
              </div>
              <p className="text-[11px] font-mono text-gray-600 leading-relaxed">
                A trustless arbitration protocol. No lawyers. No middlemen.<br />
                Only code, cryptography, and incentive design.
              </p>
            </div>

            {/* Contract Addresses */}
            <div>
              <h4 className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-3">Deployed Contracts</h4>
              <div className="space-y-2">
                {Object.entries(ADDRESSES).map(([name, addr]) => (
                  <a
                    key={name}
                    href={`https://sepolia.etherscan.io/address/${addr}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between group"
                  >
                    <span className="text-[10px] font-mono text-gray-600 group-hover:text-gold-500 transition-colors">{name}</span>
                    <span className="text-[10px] font-mono text-gray-700 group-hover:text-gray-400 transition-colors flex items-center gap-1">
                      {addr.slice(0, 8)}…{addr.slice(-6)}
                      <ExternalLink size={9} />
                    </span>
                  </a>
                ))}
              </div>
            </div>

            {/* Links */}
            <div>
              <h4 className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-3">Protocol</h4>
              <div className="space-y-2">
                <Link to="/file-case" className="block text-[11px] font-mono text-gray-600 hover:text-gold-500 transition-colors">
                  → Create Escrow
                </Link>
                <Link to="/stake" className="block text-[11px] font-mono text-gray-600 hover:text-gold-500 transition-colors">
                  → Stake as Juror
                </Link>
                <Link to="/juror-panel" className="block text-[11px] font-mono text-gray-600 hover:text-gold-500 transition-colors">
                  → Juror Panel
                </Link>
                <a
                  href="https://sepolia.etherscan.io"
                  target="_blank"
                  rel="noreferrer"
                  className="block text-[11px] font-mono text-gray-600 hover:text-gold-500 transition-colors"
                >
                  → Sepolia Explorer ↗
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-dark-700/40 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2">
            <p className="text-[10px] font-mono text-gray-700">
              © {new Date().getFullYear()} Aap Ki Adalat. All rights reserved.
            </p>
            <p className="text-[10px] font-mono text-gray-700">
              Built on Ethereum · Secured by cryptography
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
