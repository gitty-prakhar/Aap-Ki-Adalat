import React, { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { ABIS, ADDRESSES } from '../config/contracts';
import { formatEther } from 'viem';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

const Stake = () => {
  const { address } = useAccount();
  const [selectedCategory, setSelectedCategory] = useState(1);

  // Read min stake for selected category
  const { data: minStake } = useReadContract({
    address: ADDRESSES.JurorRegistry,
    abi: ABIS.JurorRegistry,
    functionName: 'categoryMinStake',
    args: [BigInt(selectedCategory)],
  });

  // Read juror status: returns [category, stake, lockedCase, isLocked, isActive]
  const { data: jurorStatusRaw, refetch } = useReadContract({
    address: ADDRESSES.JurorRegistry,
    abi: ABIS.JurorRegistry,
    functionName: 'getJurorStatus',
    args: [address],
    query: { enabled: !!address },
  });

  const jurorStatus = jurorStatusRaw
    ? {
        category: jurorStatusRaw[0],
        stake: jurorStatusRaw[1],
        lockedCase: jurorStatusRaw[2],
        isLocked: jurorStatusRaw[3],
        isActive: jurorStatusRaw[4],
      }
    : null;

  const { writeContract, data: hash, isPending } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (isSuccess) {
      toast.success('Transaction Successful!');
      refetch();
    }
  }, [isSuccess, refetch]);

  const handleStake = () => {
    if (!minStake) {
      toast.error('Could not read minimum stake for this category');
      return;
    }
    writeContract(
      {
        address: ADDRESSES.JurorRegistry,
        abi: ABIS.JurorRegistry,
        functionName: 'stakeAsJuror',
        args: [BigInt(selectedCategory)],
        value: minStake,
      },
      {
        onError: (err) =>
          toast.error('Staking failed: ' + (err.shortMessage || err.message)),
      }
    );
  };

  const handleUnstake = () => {
    writeContract(
      {
        address: ADDRESSES.JurorRegistry,
        abi: ABIS.JurorRegistry,
        functionName: 'unstake',
      },
      {
        onError: (err) =>
          toast.error('Unstaking failed: ' + (err.shortMessage || err.message)),
      }
    );
  };

  const categories = [
    { id: 1, name: 'Micro Disputes', desc: 'Fast, low stakes' },
    { id: 2, name: 'Standard Disputes', desc: 'Medium size' },
    { id: 3, name: 'Complex Disputes', desc: 'Requires careful evaluation' },
    { id: 4, name: 'High Value Disputes', desc: 'Significant assets at stake' },
    { id: 5, name: 'Enterprise Disputes', desc: 'Massive stakes, rigorous review' },
  ];

  return (
    <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-8">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="md:w-2/3"
      >
        <h2 className="text-3xl font-serif text-white mb-2">Stake as Juror</h2>
        <p className="text-xs font-mono text-gray-400 tracking-wider mb-8">
          Deposit ETH to join the active juror pool and earn rewards by resolving disputes honestly.
        </p>

        <div className="space-y-4 mb-8">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              onClick={() => setSelectedCategory(cat.id)}
              whileHover={{ scale: 1.015, x: 4 }}
              whileTap={{ scale: 0.99 }}
              className={`p-4 border font-mono cursor-pointer transition-colors card-hover ${
                selectedCategory === cat.id
                  ? 'border-gold-500 bg-gold-500/10 shimmer-border'
                  : 'border-dark-700 bg-dark-800 hover:border-gray-500'
              }`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h4
                    className={`text-sm tracking-widest uppercase ${
                      selectedCategory === cat.id ? 'text-gold-500' : 'text-gray-300'
                    }`}
                  >
                    Category {cat.id}: {cat.name}
                  </h4>
                  <p className="text-[10px] text-gray-500 mt-1 uppercase">{cat.desc}</p>
                </div>
                {selectedCategory === cat.id && minStake !== undefined && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                    className="text-right"
                  >
                    <span className="block text-xs text-gold-500 border border-gold-500/30 px-2 py-0.5 bg-dark-900">
                      Req: {formatEther(minStake)} ETH
                    </span>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            if (!address) {
              toast.error('Please connect your wallet first');
              return;
            }
            if (minStake === undefined) {
              toast.error('Cannot read contract data. The RPC may be slow or the contract may not be deployed at this address on Sepolia.');
              return;
            }
            handleStake();
          }}
          disabled={isPending || isConfirming}
          className="w-full py-4 bg-gold-500 text-dark-900 font-mono text-xs font-bold tracking-widest hover:bg-gold-400 transition-colors disabled:opacity-50 cursor-pointer btn-press"
        >
          {isPending ? 'REQUESTING...' : isConfirming ? 'CONFIRMING...' : !address ? 'CONNECT WALLET FIRST' : minStake === undefined ? '⚠ CONTRACT NOT REACHABLE' : 'STAKE ETH'}
        </motion.button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="md:w-1/3"
      >
        <div className="bg-dark-800 border border-dark-700 p-6 sticky top-28 shimmer-border">
          <h3 className="text-lg font-serif text-white mb-4">Your Juror Profile</h3>

          {jurorStatus ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="space-y-4 font-mono text-xs"
            >
              {[
                {
                  label: 'Status',
                  value: jurorStatus.isActive ? 'ACTIVE' : 'INACTIVE',
                  color: jurorStatus.isActive ? 'text-green-500' : 'text-red-500',
                },
                {
                  label: 'Staked Amount',
                  value: `${formatEther(jurorStatus.stake)} ETH`,
                  color: 'text-white',
                },
                {
                  label: 'Category',
                  value: jurorStatus.category.toString() === '0' ? 'None' : jurorStatus.category.toString(),
                  color: 'text-white',
                },
                {
                  label: 'Locked?',
                  value: jurorStatus.isLocked ? `YES (Case #${jurorStatus.lockedCase})` : 'NO',
                  color: jurorStatus.isLocked ? 'text-orange-500' : 'text-green-500',
                },
              ].map((row, i) => (
                <motion.div
                  key={row.label}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 + i * 0.06 }}
                  className="flex justify-between border-b border-dark-700 pb-2"
                >
                  <span className="text-gray-500 uppercase">{row.label}</span>
                  <span className={row.color}>{row.value}</span>
                </motion.div>
              ))}

              {jurorStatus.isActive && !jurorStatus.isLocked && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleUnstake}
                  disabled={isPending || isConfirming}
                  className="w-full py-3 mt-4 border border-red-500/50 text-red-500 hover:bg-red-500/10 transition-colors block text-center uppercase tracking-widest cursor-pointer disabled:opacity-50 btn-press"
                >
                  Unstake & Withdraw
                </motion.button>
              )}
            </motion.div>
          ) : (
            <div className="text-gray-500 text-xs font-mono">
              {address ? 'Loading juror data...' : 'Connect wallet to view profile.'}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Stake;
