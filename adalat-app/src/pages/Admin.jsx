import React, { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { ABIS, ADDRESSES } from '../config/contracts';
import { formatEther } from 'viem';
import { toast } from 'react-hot-toast';

const Admin = () => {
  const { address } = useAccount();
  const [unlockJurorAddr, setUnlockJurorAddr] = useState('');
  const [unlockCaseId, setUnlockCaseId] = useState('');
  const [selectJurorCaseId, setSelectJurorCaseId] = useState('');

  const { data: owner } = useReadContract({
    address: ADDRESSES.RewardDistributor,
    abi: ABIS.RewardDistributor,
    functionName: 'owner',
  });

  const { data: platformFunds, refetch } = useReadContract({
    address: ADDRESSES.RewardDistributor,
    abi: ABIS.RewardDistributor,
    functionName: 'platformFunds',
  });

  const { writeContract, data: hash, isPending } = useWriteContract();

  const { isSuccess: txConfirmed } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (txConfirmed) {
      toast.success('Admin transaction confirmed!');
      refetch();
    }
  }, [txConfirmed, refetch]);

  const handleWithdrawFunds = () => {
    writeContract(
      {
        address: ADDRESSES.RewardDistributor,
        abi: ABIS.RewardDistributor,
        functionName: 'withdrawPlatformFunds',
      },
      { onError: (err) => toast.error(err.shortMessage || err.message) }
    );
  };

  const handleUnlock = () => {
    if (!unlockJurorAddr || !unlockCaseId) {
      toast.error('Fill in juror address and case ID');
      return;
    }
    writeContract(
      {
        address: ADDRESSES.JurorRegistry,
        abi: ABIS.JurorRegistry,
        functionName: 'unlockJuror',
        args: [unlockJurorAddr, BigInt(unlockCaseId)],
      },
      { onError: (err) => toast.error(err.shortMessage || err.message) }
    );
  };

  const handleSelectJurors = () => {
    if (!selectJurorCaseId) {
      toast.error('Enter a dispute ID');
      return;
    }
    writeContract(
      {
        address: ADDRESSES.DisputeResolver,
        abi: ABIS.DisputeResolver,
        functionName: 'selectJurors',
        args: [BigInt(selectJurorCaseId)],
      },
      { onError: (err) => toast.error(err.shortMessage || err.message) }
    );
  };

  // Show access denied if not owner
  if (!address) {
    return (
      <div className="text-center py-20 text-gray-500 font-mono text-sm">
        Connect your wallet to access admin panel.
      </div>
    );
  }

  if (owner && owner.toLowerCase() !== address.toLowerCase()) {
    return (
      <div className="text-center py-20 text-red-500 font-mono text-sm">
        Access Denied. You are not the contract owner.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h2 className="text-3xl font-serif text-gold-500 border-b border-dark-700 pb-4">
        Admin Operations
      </h2>

      <div className="p-6 bg-dark-800 border border-dark-700 space-y-4">
        <h3 className="font-mono text-gray-300 uppercase tracking-widest text-xs">
          Platform Funds
        </h3>
        <p className="text-2xl font-serif text-white">
          {platformFunds ? formatEther(platformFunds) : '0'} ETH
        </p>
        <button
          onClick={handleWithdrawFunds}
          disabled={isPending || !platformFunds || platformFunds === 0n}
          className="px-6 py-2 bg-gold-500 text-dark-900 font-bold font-mono text-xs uppercase hover:bg-gold-400 disabled:opacity-50 cursor-pointer"
        >
          Withdraw Funds
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-6 bg-dark-800 border border-dark-700 space-y-4">
          <h3 className="font-mono text-gray-300 uppercase tracking-widest text-xs">
            Emergency Unlock Juror
          </h3>
          <input
            type="text"
            placeholder="Juror Address"
            value={unlockJurorAddr}
            onChange={(e) => setUnlockJurorAddr(e.target.value)}
            className="w-full bg-dark-900 border border-dark-700 p-2 text-white font-mono text-xs"
          />
          <input
            type="number"
            placeholder="Case ID"
            value={unlockCaseId}
            onChange={(e) => setUnlockCaseId(e.target.value)}
            className="w-full bg-dark-900 border border-dark-700 p-2 text-white font-mono text-xs"
          />
          <button
            onClick={handleUnlock}
            disabled={isPending}
            className="w-full py-2 bg-red-500/20 border border-red-500 text-red-500 font-bold font-mono text-xs uppercase hover:bg-red-500/40 disabled:opacity-50 cursor-pointer"
          >
            Unlock Juror
          </button>
        </div>

        <div className="p-6 bg-dark-800 border border-dark-700 space-y-4">
          <h3 className="font-mono text-gray-300 uppercase tracking-widest text-xs">
            Manually Trigger Select Jurors
          </h3>
          <input
            type="number"
            placeholder="Dispute ID"
            value={selectJurorCaseId}
            onChange={(e) => setSelectJurorCaseId(e.target.value)}
            className="w-full bg-dark-900 border border-dark-700 p-2 text-white font-mono text-xs"
          />
          <button
            onClick={handleSelectJurors}
            disabled={isPending}
            className="w-full py-2 bg-blue-500/20 border border-blue-500 text-blue-500 font-bold font-mono text-xs uppercase hover:bg-blue-500/40 disabled:opacity-50 cursor-pointer"
          >
            Select Jurors
          </button>
        </div>
      </div>
    </div>
  );
};

export default Admin;
