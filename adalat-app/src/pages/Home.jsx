import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useReadContract } from 'wagmi';
import { ABIS, ADDRESSES } from '../config/contracts';
import { FileText, Users, Scale, ShieldCheck, Zap, Globe, ArrowRight, Lock } from 'lucide-react';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay, ease: 'easeOut' },
});

const StatCard = ({ value, label, accent }) => (
  <div className="bg-dark-800 border border-dark-700/60 p-6 flex flex-col items-center text-center hover:border-gold-500/30 transition-all duration-300">
    <span className={`text-3xl font-serif mb-2 ${accent ? 'text-gradient' : 'text-white'}`}>
      {value}
    </span>
    <span className="text-[10px] text-gray-600 font-mono tracking-widest uppercase leading-tight">
      {label}
    </span>
  </div>
);

const StepCard = ({ number, icon: Icon, title, desc, delay }) => (
  <motion.div {...fadeUp(delay)} className="flex flex-col items-center text-center group">
    <div className="relative mb-6">
      <div className="w-16 h-16 border border-gold-500/30 bg-gold-500/5 flex items-center justify-center group-hover:border-gold-500/70 group-hover:bg-gold-500/10 transition-all duration-300">
        <Icon size={24} className="text-gold-500" />
      </div>
      <span className="absolute -top-2 -right-2 w-5 h-5 bg-gold-500 text-dark-900 text-[9px] font-mono font-bold flex items-center justify-center">
        {number}
      </span>
    </div>
    <h3 className="text-sm font-serif text-white mb-2">{title}</h3>
    <p className="text-[11px] font-mono text-gray-500 leading-relaxed max-w-[200px]">{desc}</p>
  </motion.div>
);

const FeatureCard = ({ icon: Icon, title, desc, delay }) => (
  <motion.div
    {...fadeUp(delay)}
    className="p-6 border border-dark-700/60 bg-dark-800/50 hover:border-gold-500/30 hover:bg-dark-800 transition-all duration-300 group"
  >
    <div className="flex items-start space-x-4">
      <div className="p-2 border border-dark-600 bg-dark-700 text-gold-500 group-hover:border-gold-500/40 transition-colors flex-shrink-0">
        <Icon size={16} />
      </div>
      <div>
        <h4 className="text-sm font-serif text-white mb-1">{title}</h4>
        <p className="text-[11px] font-mono text-gray-500 leading-relaxed">{desc}</p>
      </div>
    </div>
  </motion.div>
);

const Home = () => {
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
  const { data: jurorsCat1 } = useReadContract({
    address: ADDRESSES.JurorRegistry,
    abi: ABIS.JurorRegistry,
    functionName: 'getAvailableJurors',
    args: [1n],
  });

  const totalEscrows = escrowCount ? Number(escrowCount) : 0;
  const totalDisputes = disputeCount ? Number(disputeCount) : 0;
  const activeJurors = jurorsCat1 ? jurorsCat1.length : 0;
  const estimatedTvl = totalEscrows > 0 ? (totalEscrows * 0.01).toFixed(3) : '0.010';

  return (
    <div className="space-y-28">

      {/* ─── HERO ─── */}
      <section className="flex flex-col items-center justify-center pt-10 pb-4 text-center">
        <motion.div {...fadeUp(0)}>
          <div className="flex items-center justify-center space-x-3 mb-8">
            <div className="h-px w-10 bg-gradient-to-r from-transparent to-gold-500/50" />
            <span className="text-[10px] text-gold-500/70 font-mono tracking-[0.4em] uppercase">
              Ethereum · Sepolia Testnet
            </span>
            <div className="h-px w-10 bg-gradient-to-l from-transparent to-gold-500/50" />
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif text-white mb-6 leading-[1.05] tracking-tight">
            Justice,{' '}
            <span className="text-gradient italic">Decentralized.</span>
          </h1>

          <p className="mt-4 text-gray-500 font-mono text-xs md:text-sm max-w-xl mx-auto leading-relaxed tracking-wide">
            A trustless arbitration protocol where staked jurors resolve disputes
            autonomously. No lawyers. No middlemen. Only code, cryptography, and
            incentive design.
          </p>

          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/file-case"
              className="px-8 py-4 btn-gold inline-flex items-center gap-2 group"
            >
              Create a Contract
              <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/stake"
              className="px-8 py-4 border border-dark-600 text-gray-400 font-mono text-xs tracking-widest uppercase hover:border-gold-500/50 hover:text-gold-500 transition-all duration-200"
            >
              Become a Juror
            </Link>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          {...fadeUp(0.3)}
          className="mt-20 w-full max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-px bg-dark-700/30"
        >
          <StatCard value={totalDisputes} label="Total Disputes" />
          <StatCard value={`${activeJurors}+`} label="Active Jurors" />
          <StatCard value={`~${estimatedTvl} ETH`} label="Escrow Volume" accent />
          <StatCard value={totalEscrows} label="Total Contracts" />
        </motion.div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section>
        <motion.div {...fadeUp(0)} className="text-center mb-14">
          <span className="text-[10px] font-mono text-gold-500/60 tracking-[0.4em] uppercase">Protocol</span>
          <h2 className="text-3xl md:text-4xl font-serif text-white mt-2">How It Works</h2>
          <p className="text-gray-500 font-mono text-xs mt-3 max-w-md mx-auto leading-relaxed">
            Three simple steps. Fully on-chain. Completely trustless.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-4 max-w-3xl mx-auto">
          <StepCard number="1" icon={FileText} title="Create Escrow" desc="Party A deposits ETH into a tamper-proof smart contract with terms and a deadline." delay={0.1} />
          <StepCard number="2" icon={ShieldCheck} title="File Dispute" desc="If a disagreement arises, either party files a dispute and uploads cryptographic evidence to IPFS." delay={0.2} />
          <StepCard number="3" icon={Scale} title="Jury Decides" desc="Randomly selected, staked jurors vote independently. The majority wins. Funds auto-release." delay={0.3} />
        </div>

        {/* Connector line (desktop only) */}
        <div className="hidden md:block max-w-3xl mx-auto mt-0 -mt-[calc(50%-2rem)]" />
      </section>

      {/* ─── FEATURES ─── */}
      <section>
        <motion.div {...fadeUp(0)} className="text-center mb-12">
          <span className="text-[10px] font-mono text-gold-500/60 tracking-[0.4em] uppercase">Why Aap Ki Adalat</span>
          <h2 className="text-3xl md:text-4xl font-serif text-white mt-2">Built for the Real World</h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
          <FeatureCard
            icon={Lock}
            title="Trustless by Design"
            desc="Smart contracts hold and release funds automatically. No human administrator can interfere or steal."
            delay={0.1}
          />
          <FeatureCard
            icon={Users}
            title="Skin-in-the-Game Jurors"
            desc="Jurors stake real ETH as collateral. Dishonest voting gets slashed. Honest participation earns rewards."
            delay={0.15}
          />
          <FeatureCard
            icon={Zap}
            title="IPFS Evidence Storage"
            desc="All evidence is stored on IPFS — decentralized, permanent, and tamper-proof. No single party can delete it."
            delay={0.2}
          />
          <FeatureCard
            icon={Globe}
            title="Permissionless Access"
            desc="Anyone with an Ethereum wallet can create a contract or become a juror. No KYC. No accounts. Just connect."
            delay={0.25}
          />
        </div>
      </section>

      {/* ─── USE CASES ─── */}
      <section className="max-w-4xl mx-auto">
        <motion.div {...fadeUp(0)} className="text-center mb-12">
          <span className="text-[10px] font-mono text-gold-500/60 tracking-[0.4em] uppercase">Use Cases</span>
          <h2 className="text-3xl md:text-4xl font-serif text-white mt-2">What Gets Resolved Here</h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { label: 'Freelance Contracts', emoji: '💼' },
            { label: 'NFT Sales & Trades', emoji: '🖼️' },
            { label: 'DAO Grant Disputes', emoji: '🏛️' },
            { label: 'Service Agreements', emoji: '🤝' },
            { label: 'Token Vesting', emoji: '🔒' },
            { label: 'Marketplace Escrows', emoji: '🛒' },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              {...fadeUp(i * 0.05)}
              className="border border-dark-700/60 bg-dark-800/30 p-5 text-center hover:border-gold-500/30 hover:bg-dark-800/60 transition-all duration-300 cursor-default"
            >
              <span className="text-2xl block mb-2">{item.emoji}</span>
              <span className="text-xs font-mono text-gray-400">{item.label}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── BOTTOM CTA ─── */}
      <motion.section
        {...fadeUp(0)}
        className="max-w-3xl mx-auto text-center border border-gold-500/20 bg-gold-500/5 p-12"
      >
        <h2 className="text-3xl font-serif text-white mb-4">Ready to Get Started?</h2>
        <p className="text-gray-500 font-mono text-xs leading-relaxed mb-8 max-w-md mx-auto">
          Create your first escrow agreement in under two minutes. No gas needed to browse.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/file-case" className="px-8 py-4 btn-gold inline-flex items-center gap-2 group">
            Create Contract <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link to="/disputes" className="text-xs font-mono text-gray-500 hover:text-gold-500 transition-colors tracking-widest uppercase">
            View Active Escrows →
          </Link>
        </div>
      </motion.section>

    </div>
  );
};

export default Home;
