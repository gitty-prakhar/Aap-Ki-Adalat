import React, { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { ABIS, ADDRESSES } from '../config/contracts';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

const FileCase = () => {
  const { address, isConnected } = useAccount();
  const [partyB, setPartyB] = useState('');
  const [amountEth, setAmountEth] = useState('');
  const [deadlineDays, setDeadlineDays] = useState('');

  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }
    if (!partyB || !amountEth || !deadlineDays) {
      toast.error('Please fill all fields');
      return;
    }

    try {
      const baseValue = parseEther(amountEth);
      const totalValue = baseValue + (baseValue * 250n) / 10000n;

      writeContract(
        {
          address: ADDRESSES.EscrowFactory,
          abi: ABIS.EscrowFactory,
          functionName: 'createEscrow',
          args: [partyB, baseValue, BigInt(deadlineDays)],
          value: totalValue,
        },
        {
          onError: (err) => {
            toast.error('Transaction Failed: ' + (err.shortMessage || err.message));
          },
        }
      );
    } catch (err) {
      toast.error('Invalid input: ' + err.message);
    }
  };

  useEffect(() => {
    if (isConfirming) {
      toast.loading('Confirming transaction...', { id: 'tx-confirm' });
    }
  }, [isConfirming]);

  useEffect(() => {
    if (isConfirmed) {
      toast.success('Escrow Created Successfully!', { id: 'tx-confirm' });
      setPartyB('');
      setAmountEth('');
      setDeadlineDays('');
    }
  }, [isConfirmed]);

  useEffect(() => {
    if (error) {
      toast.error('Error: ' + (error.shortMessage || error.message));
    }
  }, [error]);

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-dark-800 border border-dark-700 p-8 rounded-sm shadow-2xl"
      >
        <h2 className="text-3xl font-serif text-white mb-6">
          File a Case <span className="text-gold-500 italic">(New Escrow)</span>
        </h2>
        <p className="text-xs font-mono text-gray-400 mb-8 leading-relaxed">
          Create a trustless escrow agreement. You serve as Party A. Enter the respondent's address
          (Party B), the escrow amount in ETH, and the duration in days. A 2.5% platform fee will be
          added to your transaction value.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[10px] font-mono text-gray-400 tracking-wider uppercase mb-2">
              Respondent (Party B) Address
            </label>
            <input
              type="text"
              value={partyB}
              onChange={(e) => setPartyB(e.target.value)}
              placeholder="0x..."
              className="w-full bg-dark-900 border border-dark-700 text-gray-200 p-3 font-mono text-sm focus:outline-none focus:border-gold-500 transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-mono text-gray-400 tracking-wider uppercase mb-2">
                Amount (ETH)
              </label>
              <input
                type="number"
                step="0.0001"
                min="0"
                value={amountEth}
                onChange={(e) => setAmountEth(e.target.value)}
                placeholder="0.1"
                className="w-full bg-dark-900 border border-dark-700 text-gray-200 p-3 font-mono text-sm focus:outline-none focus:border-gold-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono text-gray-400 tracking-wider uppercase mb-2">
                Deadline (Days)
              </label>
              <input
                type="number"
                min="1"
                step="1"
                value={deadlineDays}
                onChange={(e) => setDeadlineDays(e.target.value)}
                placeholder="7"
                className="w-full bg-dark-900 border border-dark-700 text-gray-200 p-3 font-mono text-sm focus:outline-none focus:border-gold-500 transition-colors"
              />
            </div>
          </div>

          <div className="bg-dark-900/50 p-4 border border-dark-700/50 flex justify-between items-center">
            <span className="text-xs font-mono text-gray-500 uppercase">
              Total required (Amount + 2.5% fee)
            </span>
            <span className="text-gold-500 font-mono font-medium">
              {amountEth ? (parseFloat(amountEth) * 1.025).toFixed(4) : '0.0000'} ETH
            </span>
          </div>

          <button
            type="submit"
            disabled={isPending || isConfirming || !isConnected}
            className="w-full py-4 bg-gold-500 text-dark-900 font-mono text-xs font-bold tracking-widest hover:bg-gold-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4 cursor-pointer"
          >
            {!isConnected
              ? 'CONNECT WALLET FIRST'
              : isPending
              ? 'REQUESTING SIGNATURE...'
              : isConfirming
              ? 'CONFIRMING TX...'
              : 'CREATE ESCROW'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default FileCase;
