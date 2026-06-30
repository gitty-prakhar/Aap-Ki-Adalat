import React, { useState, useEffect } from 'react';
import { useAccount, useReadContract, useBalance } from 'wagmi';
import { ABIS, ADDRESSES } from '../config/contracts';
import { formatEther } from 'viem';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  User, Copy, ExternalLink, Bell, BellOff, Mail, Shield,
  CheckCircle, XCircle, Clock, AlertTriangle, Gavel,
  TrendingUp, Scale, Lock, Award
} from 'lucide-react';

// ── Wallet Avatar (gradient based on address) ──────────────────────────
const WalletAvatar = ({ address, size = 64 }) => {
  if (!address) return null;
  const hue = parseInt(address.slice(2, 8), 16) % 360;
  const hue2 = (hue + 120) % 360;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className="avatar-ring rounded-full">
      <defs>
        <radialGradient id={`grad-${address.slice(2, 8)}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={`hsl(${hue}, 70%, 60%)`} />
          <stop offset="100%" stopColor={`hsl(${hue2}, 60%, 30%)`} />
        </radialGradient>
      </defs>
      <circle cx="32" cy="32" r="32" fill={`url(#grad-${address.slice(2, 8)})`} />
      <text x="32" y="38" textAnchor="middle" fill="white" fontSize="18" fontWeight="bold" fontFamily="monospace">
        {address.slice(2, 4).toUpperCase()}
      </text>
    </svg>
  );
};

// ── Status badge ──────────────────────────────────────────────────────
const EscrowStatusBadge = ({ status }) => {
  const map = {
    0: { label: 'Active', color: 'text-green-400 border-green-400/30 bg-green-400/5' },
    1: { label: 'Completed', color: 'text-blue-400 border-blue-400/30 bg-blue-400/5' },
    2: { label: 'Disputed', color: 'text-red-400 border-red-400/30 bg-red-400/5' },
    3: { label: 'Expired', color: 'text-gray-500 border-gray-500/30 bg-gray-500/5' },
  };
  const s = map[status] || map[3];
  return (
    <span className={`text-[9px] font-mono tracking-widest uppercase px-2 py-0.5 border ${s.color}`}>
      {s.label}
    </span>
  );
};

// ── Single escrow row (loaded individually) ──────────────────────────
const EscrowRow = ({ escrowId, userAddress }) => {
  const { data: escrow } = useReadContract({
    address: ADDRESSES.EscrowFactory,
    abi: ABIS.EscrowFactory,
    functionName: 'getEscrow',
    args: [escrowId],
  });
  const { data: linkedDisputeId } = useReadContract({
    address: ADDRESSES.DisputeResolver,
    abi: ABIS.DisputeResolver,
    functionName: 'escrowToDispute',
    args: [escrowId],
  });

  if (!escrow) {
    return (
      <tr>
        <td colSpan={5} className="px-4 py-3">
          <div className="h-3 bg-dark-700 rounded animate-pulse w-full" />
        </td>
      </tr>
    );
  }

  const isPartyA = escrow.partyA?.toLowerCase() === userAddress?.toLowerCase();
  const role = isPartyA ? 'Party A' : 'Party B';
  const amount = escrow.amount ? formatEther(escrow.amount) : '0';
  const deadline = escrow.deadline ? new Date(Number(escrow.deadline) * 1000) : null;
  const isExpired = deadline && deadline < new Date();
  const hasDispute = linkedDisputeId !== undefined && linkedDisputeId !== null && Number(linkedDisputeId) > 0;

  return (
    <tr className="border-b border-dark-700/40 hover:bg-dark-700/20 transition-colors">
      <td className="px-4 py-3 font-mono text-xs text-gold-500">#{escrowId.toString()}</td>
      <td className="px-4 py-3">
        <span className={`text-[9px] font-mono uppercase px-1.5 py-0.5 border ${isPartyA ? 'text-purple-400 border-purple-400/30' : 'text-cyan-400 border-cyan-400/30'}`}>
          {role}
        </span>
      </td>
      <td className="px-4 py-3 font-mono text-xs text-gray-300">{parseFloat(amount).toFixed(4)} ETH</td>
      <td className="px-4 py-3">
        <EscrowStatusBadge status={Number(escrow.status)} />
      </td>
      <td className="px-4 py-3 font-mono text-[10px] text-gray-600">
        {deadline ? (isExpired ? 'Expired' : deadline.toLocaleDateString()) : '—'}
      </td>
    </tr>
  );
};

// ── Email settings panel ──────────────────────────────────────────────
const EmailSettingsPanel = () => {
  const [email, setEmail] = useState(() => localStorage.getItem('adalat_email') || '');
  const [saved, setSaved] = useState(!!localStorage.getItem('adalat_email'));
  const [enabled, setEnabled] = useState(() => localStorage.getItem('adalat_notifs') !== 'false');
  const [input, setInput] = useState(email);

  const handleSave = () => {
    if (!input || !input.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    localStorage.setItem('adalat_email', input);
    localStorage.setItem('adalat_notifs', 'true');
    setEmail(input);
    setSaved(true);
    setEnabled(true);
    toast.success('Email saved! You will receive notifications for on-chain events.');
  };

  const handleToggle = () => {
    const next = !enabled;
    setEnabled(next);
    localStorage.setItem('adalat_notifs', next.toString());
    toast(next ? 'Notifications enabled' : 'Notifications paused', { icon: next ? '🔔' : '🔕' });
  };

  const handleClear = () => {
    localStorage.removeItem('adalat_email');
    localStorage.removeItem('adalat_notifs');
    setEmail('');
    setInput('');
    setSaved(false);
    setEnabled(false);
    toast('Email removed. You will no longer receive notifications.');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-2 border border-dark-600 bg-dark-700 text-gold-500">
          <Bell size={14} />
        </div>
        <div>
          <h4 className="text-sm font-serif text-white">Email Notifications</h4>
          <p className="text-[10px] font-mono text-gray-600 mt-0.5">
            Get alerted when disputes are filed, jurors selected, and cases resolved.
          </p>
        </div>
      </div>

      {saved ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 border border-dark-600 bg-dark-700/50">
            <div className="flex items-center space-x-2">
              <Mail size={12} className="text-gold-500" />
              <span className="font-mono text-xs text-gray-300">{email}</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleToggle}
                className={`flex items-center space-x-1 text-[10px] font-mono px-2 py-1 border transition-colors cursor-pointer ${
                  enabled
                    ? 'border-green-500/40 text-green-400 hover:bg-green-500/10'
                    : 'border-gray-600 text-gray-500 hover:bg-dark-600'
                }`}
              >
                {enabled ? <Bell size={10} /> : <BellOff size={10} />}
                <span>{enabled ? 'On' : 'Paused'}</span>
              </button>
              <button
                onClick={handleClear}
                className="text-[10px] font-mono text-red-500/60 hover:text-red-400 transition-colors cursor-pointer"
              >
                Remove
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-1.5 text-[10px] font-mono text-gray-600">
            {[
              'Escrow created / completed',
              'Dispute filed against you',
              'Selected as juror for a case',
              'Dispute verdict announced',
            ].map((item) => (
              <div key={item} className="flex items-center space-x-2">
                <CheckCircle size={9} className="text-green-500/60" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="email"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              placeholder="your@email.com"
              className="flex-1 bg-dark-700 border border-dark-600 text-gray-200 px-3 py-2 font-mono text-xs focus:border-gold-500 transition-colors"
            />
            <button
              onClick={handleSave}
              className="px-4 py-2 btn-gold text-[10px]"
            >
              Save
            </button>
          </div>
          <p className="text-[10px] font-mono text-gray-600">
            ℹ Your email is stored locally in your browser. It is never sent to any server.
          </p>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PROFILE PAGE
// ─────────────────────────────────────────────────────────────────────────────
const Profile = () => {
  const { address, isConnected, chain } = useAccount();
  const [copied, setCopied] = useState(false);

  const { data: balance } = useBalance({
    address,
    query: { enabled: !!address },
  });

  const { data: userEscrows, isLoading: escrowsLoading } = useReadContract({
    address: ADDRESSES.EscrowFactory,
    abi: ABIS.EscrowFactory,
    functionName: 'getUserEscrows',
    args: [address],
    query: { enabled: !!address },
  });

  const { data: jurorStatusRaw } = useReadContract({
    address: ADDRESSES.JurorRegistry,
    abi: ABIS.JurorRegistry,
    functionName: 'getJurorStatus',
    args: [address],
    query: { enabled: !!address },
  });

  const { data: pendingRewards } = useReadContract({
    address: ADDRESSES.RewardDistributor,
    abi: ABIS.RewardDistributor,
    functionName: 'pendingWithdrawals',
    args: [address],
    query: { enabled: !!address },
  });

  const jurorStatus = jurorStatusRaw
    ? {
        category: Number(jurorStatusRaw[0]),
        stake: jurorStatusRaw[1],
        lockedCase: jurorStatusRaw[2],
        isLocked: jurorStatusRaw[3],
        isActive: jurorStatusRaw[4],
      }
    : null;

  const handleCopy = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Address copied!');
  };

  if (!isConnected || !address) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <div className="p-4 border border-dark-600 bg-dark-800 mb-6">
          <User size={32} className="text-gray-600" />
        </div>
        <h2 className="text-2xl font-serif text-white mb-2">Connect Your Wallet</h2>
        <p className="text-xs font-mono text-gray-500 max-w-xs leading-relaxed">
          Connect your wallet to view your full arbitration profile, escrow history, and notification settings.
        </p>
      </div>
    );
  }

  const escrowList = userEscrows ? [...userEscrows].reverse() : [];

  return (
    <div className="max-w-5xl mx-auto space-y-8">

      {/* ── Identity Card ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-dark-800 border border-dark-700/60 p-8"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <WalletAvatar address={address} size={72} />

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h2 className="text-2xl font-serif text-white">
                {address.slice(0, 6)}···{address.slice(-4)}
              </h2>
              {jurorStatus?.isActive && (
                <span className="text-[9px] font-mono px-2 py-0.5 border border-gold-500/40 text-gold-500 bg-gold-500/5">
                  ⚖ JUROR
                </span>
              )}
              {chain?.id === 11155111 && (
                <span className="text-[9px] font-mono px-2 py-0.5 border border-green-400/30 text-green-400 bg-green-400/5">
                  ● Sepolia
                </span>
              )}
            </div>

            <div className="flex items-center space-x-2 mb-4">
              <span className="text-xs font-mono text-gray-600 truncate max-w-[260px] sm:max-w-none">
                {address}
              </span>
              <button onClick={handleCopy} className="text-gray-600 hover:text-gold-500 transition-colors cursor-pointer flex-shrink-0">
                <Copy size={12} />
              </button>
              <a
                href={`https://sepolia.etherscan.io/address/${address}`}
                target="_blank"
                rel="noreferrer"
                className="text-gray-600 hover:text-gold-500 transition-colors flex-shrink-0"
              >
                <ExternalLink size={12} />
              </a>
            </div>

            <div className="flex flex-wrap gap-6">
              <div>
                <p className="text-[9px] font-mono text-gray-600 uppercase tracking-widest mb-0.5">ETH Balance</p>
                <p className="text-lg font-serif text-white">{balance?.value !== undefined ? parseFloat(formatEther(balance.value)).toFixed(4) : '—'} ETH</p>
              </div>
              <div>
                <p className="text-[9px] font-mono text-gray-600 uppercase tracking-widest mb-0.5">Total Escrows</p>
                <p className="text-lg font-serif text-white">{escrowList.length}</p>
              </div>
              <div>
                <p className="text-[9px] font-mono text-gray-600 uppercase tracking-widest mb-0.5">Pending Rewards</p>
                <p className="text-lg font-serif text-gold-500">
                  {pendingRewards ? parseFloat(formatEther(pendingRewards)).toFixed(4) : '0.0000'} ETH
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            icon: Scale,
            label: 'Escrows',
            value: escrowList.length,
            color: 'text-gold-500',
          },
          {
            icon: AlertTriangle,
            label: 'Juror Status',
            value: jurorStatus?.isActive ? (jurorStatus.isLocked ? 'Locked' : 'Active') : 'Inactive',
            color: jurorStatus?.isActive ? 'text-green-400' : 'text-gray-500',
          },
          {
            icon: Lock,
            label: 'Staked',
            value: jurorStatus?.isActive ? `${parseFloat(formatEther(jurorStatus.stake)).toFixed(3)} ETH` : '—',
            color: 'text-purple-400',
          },
          {
            icon: Award,
            label: 'Juror Category',
            value: jurorStatus?.isActive ? `Cat. ${jurorStatus.category}` : '—',
            color: 'text-cyan-400',
          },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-dark-800 border border-dark-700/60 p-5 hover:border-dark-600 transition-colors"
          >
            <stat.icon size={16} className={`${stat.color} mb-3`} />
            <p className="text-[9px] font-mono text-gray-600 uppercase tracking-widest mb-1">{stat.label}</p>
            <p className={`text-base font-serif ${stat.color}`}>{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* ── Escrow History ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-dark-800 border border-dark-700/60"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-dark-700/60">
          <div className="flex items-center space-x-3">
            <Scale size={14} className="text-gold-500" />
            <h3 className="text-sm font-serif text-white">Escrow History</h3>
          </div>
          <span className="text-[10px] font-mono text-gray-600">{escrowList.length} total</span>
        </div>

        {escrowsLoading ? (
          <div className="p-6 space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-8 bg-dark-700 rounded animate-pulse" />
            ))}
          </div>
        ) : escrowList.length === 0 ? (
          <div className="py-16 text-center">
            <Scale size={24} className="text-gray-700 mx-auto mb-3" />
            <p className="text-xs font-mono text-gray-600">No escrows found for this wallet.</p>
            <a href="/file-case" className="text-[11px] font-mono text-gold-500 hover:text-gold-400 mt-2 inline-block">
              Create your first escrow →
            </a>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-dark-700/40">
                  {['ID', 'Role', 'Amount', 'Status', 'Deadline'].map((col) => (
                    <th key={col} className="px-4 py-3 text-[9px] font-mono text-gray-600 uppercase tracking-widest">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {escrowList.map((id) => (
                  <EscrowRow key={id.toString()} escrowId={id} userAddress={address} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* ── Email Notifications ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-dark-800 border border-dark-700/60 p-6"
      >
        <EmailSettingsPanel />
      </motion.div>

      {/* ── Quick Links ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        {[
          { to: '/disputes', icon: Scale, label: 'Escrow Panel', desc: 'Manage your active agreements' },
          { to: '/juror-panel', icon: Gavel, label: 'Juror Panel', desc: 'Vote on your assigned cases' },
          { to: '/stake', icon: Shield, label: 'Stake ETH', desc: 'Join the juror pool' },
        ].map((item) => (
          <a
            key={item.to}
            href={item.to}
            className="flex items-start space-x-3 p-4 border border-dark-700/60 bg-dark-800/50 hover:border-gold-500/30 hover:bg-dark-800 transition-all duration-200 group"
          >
            <div className="p-2 border border-dark-600 bg-dark-700 text-gold-500 group-hover:border-gold-500/40 transition-colors flex-shrink-0">
              <item.icon size={14} />
            </div>
            <div>
              <p className="text-xs font-serif text-white group-hover:text-gold-500 transition-colors">{item.label}</p>
              <p className="text-[10px] font-mono text-gray-600 mt-0.5">{item.desc}</p>
            </div>
          </a>
        ))}
      </motion.div>

    </div>
  );
};

export default Profile;
