import React, { useState } from 'react';
import { NavLink, Outlet, Link, useLocation } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import { useAccount, useConnect, useDisconnect, useBalance } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { Scale, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Ambient floating particles
const Particles = () => (
  <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
    {Array.from({ length: 12 }).map((_, i) => (
      <div
        key={i}
        className="particle"
        style={{
          left: `${8 + (i * 7.5) % 90}%`,
          animationDuration: `${14 + (i * 3.7) % 12}s`,
          animationDelay: `${(i * 2.1) % 8}s`,
          width: `${1.5 + (i % 3)}px`,
          height: `${1.5 + (i % 3)}px`,
          opacity: 0.2 + (i % 4) * 0.08,
        }}
      />
    ))}
  </div>
);

// Ambient background glow blobs
const AmbientGlow = () => (
  <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
    <div
      className="ambient-glow"
      style={{
        width: '600px', height: '600px',
        top: '-200px', right: '-200px',
        background: 'radial-gradient(circle, rgba(234,179,8,0.04) 0%, transparent 70%)',
      }}
    />
    <div
      className="ambient-glow"
      style={{
        width: '500px', height: '500px',
        bottom: '-150px', left: '-150px',
        background: 'radial-gradient(circle, rgba(234,179,8,0.03) 0%, transparent 70%)',
        animationDelay: '4s',
      }}
    />
  </div>
);

// Page transition wrapper
const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

const Layout = () => {
  const { address, isConnected, chain } = useAccount();
  const { connect, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const { data: balance } = useBalance({
    address,
    query: { enabled: !!address },
  });

  // Guard against NaN — only format when balance is a valid number
  const formattedBalance =
    balance && balance.formatted && !isNaN(parseFloat(balance.formatted))
      ? parseFloat(balance.formatted).toFixed(4)
      : null;

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
    `nav-link-animated ${isActive ? 'text-gold-500' : 'text-gray-400 hover:text-gold-500'} transition-colors`;

  const navItems = [
    { to: '/', label: 'HOME' },
    { to: '/disputes', label: 'DISPUTES' },
    { to: '/file-case', label: 'FILE CASE' },
    { to: '/juror-panel', label: 'JUROR PANEL' },
    { to: '/stake', label: 'STAKE' },
  ];

  return (
    <div className="min-h-screen bg-dark-900 text-gray-200 font-sans relative">
      <Particles />
      <AmbientGlow />

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#171717',
            color: '#e2e8f0',
            border: '1px solid #ca8a04',
            backdropFilter: 'blur(12px)',
          },
        }}
      />

      {/* Header */}
      <motion.header
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="glass-header border-b border-dark-800 sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 no-underline group">
              <motion.div
                className="p-2 border border-gold-500/30 rounded-full bg-gold-500/10 text-gold-500 scale-badge"
                whileHover={{ scale: 1.1, rotate: 15 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              >
                <Scale size={20} />
              </motion.div>
              <div>
                <h1 className="text-xl font-serif text-white font-semibold tracking-wide leading-none mb-0 group-hover:text-gold-gradient transition-all">
                  Aap Ki Adalat
                </h1>
                <p className="text-[10px] text-gray-400 font-mono tracking-[0.2em] uppercase">
                  Decentralized Court &middot; Sepolia
                </p>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex space-x-8 text-xs font-mono tracking-widest">
              {navItems.map((item, i) => (
                <motion.div
                  key={item.to}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.06, duration: 0.4 }}
                >
                  <NavLink to={item.to} className={navLinkClass} end={item.to === '/'}>
                    {item.label}
                  </NavLink>
                </motion.div>
              ))}
            </nav>

            {/* Wallet + Mobile Toggle */}
            <div className="flex items-center space-x-4">
              {/* Balance display — hidden when NaN or missing */}
              {isConnected && formattedBalance && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="hidden lg:block text-[10px] font-mono text-gray-500"
                >
                  {formattedBalance} {balance.symbol}
                </motion.span>
              )}

              {/* Network badge */}
              {isConnected && chain && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className={`hidden lg:block text-[10px] font-mono px-2 py-0.5 border ${
                    chain.id === 11155111
                      ? 'text-green-400 border-green-400/30 glow-dot'
                      : 'text-red-400 border-red-400/30'
                  }`}
                >
                  {chain.id === 11155111 ? 'Sepolia' : 'Wrong Network'}
                </motion.span>
              )}

              <motion.button
                onClick={handleWallet}
                disabled={isConnecting}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="px-5 py-2.5 border border-gold-500/50 text-gold-500 text-xs font-mono hover:bg-gold-500/10 transition-all rounded cursor-pointer disabled:opacity-50 btn-press"
              >
                {isConnecting
                  ? 'Connecting...'
                  : isConnected
                  ? `${address.slice(0, 6)}...${address.slice(-4)}`
                  : 'Connect Wallet'}
              </motion.button>

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
        <AnimatePresence>
          {mobileOpen && (
            <motion.nav
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="md:hidden border-t border-dark-800 bg-dark-900 px-4 overflow-hidden"
            >
              <div className="py-4 space-y-3">
                {navItems.map((item, i) => (
                  <motion.div
                    key={item.to}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <NavLink
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
                  </motion.div>
                ))}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Main Content — page transitions */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="border-t border-dark-800 py-8 text-center text-xs text-gray-600 font-mono mt-auto relative z-10"
      >
        &copy; {new Date().getFullYear()} Aap Ki Adalat. All rights reserved.
      </motion.footer>
    </div>
  );
};

export default Layout;
