import React, { useState } from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import { useAccount, useConnect, useDisconnect, useBalance } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { Scale, Menu, X } from 'lucide-react';

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
    `${isActive ? 'text-gold-500' : 'text-gray-400 hover:text-gold-500'} transition-colors`;

  const navItems = [
    { to: '/', label: 'HOME' },
    { to: '/disputes', label: 'ESCROW PANEL' },
    { to: '/file-case', label: 'FILE CASE' },
    { to: '/juror-panel', label: 'JUROR PANEL' },
    { to: '/stake', label: 'STAKE' },
  ];

  return (
    <div className="min-h-screen bg-dark-900 text-gray-200 font-sans">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#171717',
            color: '#e2e8f0',
            border: '1px solid #ca8a04',
          },
        }}
      />

      {/* Header */}
      <header className="border-b border-dark-800 bg-dark-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 no-underline">
              <div className="p-2 border border-gold-500/30 rounded-full bg-gold-500/10 text-gold-500">
                <Scale size={20} />
              </div>
              <div>
                <h1 className="text-xl font-serif text-white font-semibold tracking-wide leading-none mb-0">
                  Aap Ki Adalat
                </h1>
                <p className="text-[10px] text-gray-400 font-mono tracking-[0.2em] uppercase">
                  Decentralized Court &middot; Sepolia
                </p>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex space-x-8 text-xs font-mono tracking-widest">
              {navItems.map((item) => (
                <NavLink key={item.to} to={item.to} className={navLinkClass} end={item.to === '/'}>
                  {item.label}
                </NavLink>
              ))}
            </nav>

            {/* Wallet + Mobile Toggle */}
            <div className="flex items-center space-x-4">
              {/* Balance display */}
              {isConnected && balance && !isNaN(parseFloat(balance?.formatted)) && (
                <span className="hidden lg:block text-[10px] font-mono text-gray-500">
                  {parseFloat(balance.formatted).toFixed(4)} {balance.symbol}
                </span>
              )}

              {/* Network badge */}
              {isConnected && chain && (
                <span className={`hidden lg:block text-[10px] font-mono px-2 py-0.5 border ${
                  chain.id === 11155111
                    ? 'text-green-400 border-green-400/30'
                    : 'text-red-400 border-red-400/30'
                }`}>
                  {chain.id === 11155111 ? 'Sepolia' : 'Wrong Network'}
                </span>
              )}

              <button
                onClick={handleWallet}
                disabled={isConnecting}
                className="px-5 py-2.5 border border-gold-500/50 text-gold-500 text-xs font-mono hover:bg-gold-500/10 transition-all rounded cursor-pointer disabled:opacity-50"
              >
                {isConnecting
                  ? 'Connecting...'
                  : isConnected
                  ? `${address.slice(0, 6)}...${address.slice(-4)}`
                  : 'Connect Wallet'}
              </button>

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden text-gray-400 hover:text-gold-500 cursor-pointer"
              >
                {mobileOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav Dropdown */}
        {mobileOpen && (
          <nav className="md:hidden border-t border-dark-800 bg-dark-900 px-4 py-4 space-y-3">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `block text-xs font-mono tracking-widest py-2 ${
                    isActive ? 'text-gold-500' : 'text-gray-400'
                  }`
                }
                end={item.to === '/'}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-dark-800 py-8 text-center text-xs text-gray-600 font-mono mt-auto">
        &copy; {new Date().getFullYear()} Aap Ki Adalat. All rights reserved.
      </footer>
    </div>
  );
};

export default Layout;
