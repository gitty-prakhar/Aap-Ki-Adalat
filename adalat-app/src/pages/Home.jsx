import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Home = () => {
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
        className="mt-32 grid grid-cols-2 md:grid-cols-4 gap-px bg-dark-800 border border-dark-800"
      >
        <div className="bg-dark-900 p-8 flex flex-col items-start justify-center">
          <span className="text-3xl font-serif text-white mb-2">3</span>
          <span className="text-[10px] text-gray-500 font-mono tracking-widest uppercase">Total<br />Disputes</span>
        </div>
        <div className="bg-dark-900 p-8 flex flex-col items-start justify-center">
          <span className="text-3xl font-serif text-white mb-2">12</span>
          <span className="text-[10px] text-gray-500 font-mono tracking-widest uppercase">Active Jurors</span>
        </div>
        <div className="bg-dark-900 p-8 flex flex-col items-start justify-center">
          <span className="text-3xl font-serif text-gold-500 mb-2">0.375 <span className="text-xl">ETH</span></span>
          <span className="text-[10px] text-gray-500 font-mono tracking-widest uppercase">In Escrow</span>
        </div>
        <div className="bg-dark-900 p-8 flex flex-col items-start justify-center">
          <span className="text-3xl font-serif text-white mb-2">1</span>
          <span className="text-[10px] text-gray-500 font-mono tracking-widest uppercase">Cases Resolved</span>
        </div>
      </motion.div>
    </div>
  );
};

export default Home;
