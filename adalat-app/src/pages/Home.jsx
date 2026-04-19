import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const stagger = {
  animate: { transition: { staggerChildren: 0.12 } },
};

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

const Home = () => {
  return (
    <div className="flex flex-col items-center justify-center pt-20 pb-32 text-center">
      <motion.div
        variants={stagger}
        initial="initial"
        animate="animate"
      >
        {/* Tagline ribbon */}
        <motion.div variants={fadeUp} className="flex items-center justify-center space-x-4 mb-8">
          <motion.div
            className="h-px w-12 bg-gold-500/50"
            initial={{ width: 0 }}
            animate={{ width: 48 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          />
          <span className="text-[10px] text-gold-500 font-mono tracking-[0.3em] uppercase">Ethereum Sepolia Testnet</span>
          <motion.div
            className="h-px w-12 bg-gold-500/50"
            initial={{ width: 0 }}
            animate={{ width: 48 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          />
        </motion.div>

        {/* Hero headline */}
        <motion.h1
          variants={fadeUp}
          className="text-5xl md:text-7xl font-serif text-white mb-6 leading-tight"
        >
          Justice,<br />
          <motion.span
            className="text-gold-gradient italic inline-block"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            Decentralized.
          </motion.span>
        </motion.h1>

        {/* Description */}
        <motion.p
          variants={fadeUp}
          className="mt-4 text-gray-400 font-mono text-xs md:text-sm max-w-2xl mx-auto leading-relaxed uppercase tracking-wider"
        >
          A trustless arbitration protocol where staked jurors resolve
          disputes autonomously. No lawyers. No middlemen. Only code,
          cryptography, and incentive design.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          variants={fadeUp}
          className="mt-12 flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6"
        >
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
            <Link
              to="/file-case"
              className="px-8 py-4 bg-gold-500 text-dark-900 font-mono text-xs font-bold tracking-widest hover:bg-gold-400 transition-colors inline-block btn-press"
            >
              FILE A DISPUTE
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
            <Link
              to="/juror-panel"
              className="px-8 py-4 bg-transparent border border-dark-700 text-gray-300 font-mono text-xs font-bold tracking-widest hover:border-gold-500 hover:text-gold-500 transition-colors inline-block btn-press"
            >
              BECOME A JUROR
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Stats section */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="mt-32 grid grid-cols-2 md:grid-cols-4 gap-px bg-dark-800 border border-dark-800 shimmer-border"
      >
        {[
          { value: '3', label: 'Total\nDisputes', color: 'text-white' },
          { value: '12', label: 'Active Jurors', color: 'text-white' },
          { value: '3.75', label: 'In Escrow', color: 'text-gold-500', suffix: <span className="text-xl"> ETH</span> },
          { value: '1', label: 'Cases Resolved', color: 'text-white' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            className="bg-dark-900 p-8 flex flex-col items-start justify-center card-hover"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 + i * 0.1, duration: 0.5 }}
            whileHover={{ scale: 1.02 }}
          >
            <motion.span
              className={`text-3xl font-serif ${stat.color} mb-2`}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 1 + i * 0.1, type: 'spring', stiffness: 200 }}
            >
              {stat.value}{stat.suffix}
            </motion.span>
            <span
              className="text-[10px] text-gray-500 font-mono tracking-widest uppercase"
              dangerouslySetInnerHTML={{ __html: stat.label.replace('\n', '<br />') }}
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default Home;
