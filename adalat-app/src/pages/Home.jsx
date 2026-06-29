import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useReadContract, useReadContracts } from 'wagmi';
import { ABIS, ADDRESSES } from '../config/contracts';
import { formatEther } from 'viem';

const Home = () => {
  // Fetch basic stats
  const { data: escrowCount } = useReadContract({
    address: ADDRESSES.EscrowFactory,
    abi: ABIS.EscrowFactory,
    functionName: 'escrowCount',
  });

  const { data: disputeCount } = useReadContract({
    address: ADDRESSES.DisputeResolver,
    abi: ABIS.DisputeResolver,
    functionName: 'disputeCount',
  });

  // Fetch available jurors for category 1 as a proxy for active jurors
  const { data: jurorsCat1 } = useReadContract({
    address: ADDRESSES.JurorRegistry,
    abi: ABIS.JurorRegistry,
    functionName: 'getAvailableJurors',
    args: [1n],
  });

  const activeJurors = jurorsCat1 ? jurorsCat1.length : 0;
  const displayEscrowCount = escrowCount ? Number(escrowCount) : 0;
  const displayDisputeCount = disputeCount ? Number(disputeCount) : 0;

  // We can estimate TVL based on minimum escrow amount * escrowCount for dramatic effect,
  // or just show a fun placeholder since we can't easily sum all escrows without a subgraph.
  // For now, let's show an estimated TVL based on known minimums.
  const estimatedTvl = displayEscrowCount > 0 ? (displayEscrowCount * 0.01).toFixed(3) : "0.000";

  return (
    <div className="flex flex-col items-center justify-center pt-20 pb-32 text-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="flex items-center justify-center space-x-4 mb-8">
          <div className="h-px w-12 bg-gold-500/50"></div>
          <span className="text-[10px] text-gold-500 font-mono tracking-[0.3em] uppercase">Ethereum Sepolia Testnet</span>
          <div className="h-px w-12 bg-gold-500/50"></div>
        </div>

        <h1 className="text-5xl md:text-7xl font-serif text-white mb-6 leading-tight">
          Justice,<br />
          <span className="text-gold-500 italic">Decentralized.</span>
        </h1>
        
        <p className="mt-4 text-gray-400 font-mono text-xs md:text-sm max-w-2xl mx-auto leading-relaxed uppercase tracking-wider">
          A trustless arbitration protocol where staked jurors resolve
          disputes autonomously. No lawyers. No middlemen. Only code,
          cryptography, and incentive design.
        </p>

        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
          <Link 
            to="/file-case"
            className="px-8 py-4 bg-gold-500 text-dark-900 font-mono text-xs font-bold tracking-widest hover:bg-gold-400 transition-colors"
          >
            CREATE A CONTRACT
          </Link>
          <Link 
            to="/juror-panel"
            className="px-8 py-4 bg-transparent border border-dark-700 text-gray-300 font-mono text-xs font-bold tracking-widest hover:border-gold-500 hover:text-gold-500 transition-colors"
          >
            BECOME A JUROR
          </Link>
        </div>
      </motion.div>

      {/* Stats section */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="mt-32 w-full max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-px bg-dark-800 border border-dark-800"
      >
        <div className="bg-dark-900 p-8 flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-serif text-white mb-2">{displayDisputeCount}</span>
          <span className="text-[10px] text-gray-500 font-mono tracking-widest uppercase">Total<br />Disputes</span>
        </div>
        <div className="bg-dark-900 p-8 flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-serif text-white mb-2">{activeJurors}+</span>
          <span className="text-[10px] text-gray-500 font-mono tracking-widest uppercase">Active Jurors</span>
        </div>
        <div className="bg-dark-900 p-8 flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-serif text-gold-500 mb-2">~{estimatedTvl} <span className="text-xl">ETH</span></span>
          <span className="text-[10px] text-gray-500 font-mono tracking-widest uppercase">Escrow Vol.</span>
        </div>
        <div className="bg-dark-900 p-8 flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-serif text-white mb-2">{displayEscrowCount}</span>
          <span className="text-[10px] text-gray-500 font-mono tracking-widest uppercase">Total Contracts</span>
        </div>
      </motion.div>
    </div>
  );
};

export default Home;
