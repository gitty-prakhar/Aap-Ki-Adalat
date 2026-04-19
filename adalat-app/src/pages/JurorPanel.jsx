import React, { useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { ABIS, ADDRESSES } from '../config/contracts';
import { formatEther } from 'viem';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

const EvidenceView = ({ evidenceA, evidenceB }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
      <div className="p-4 border border-dark-700 bg-dark-900/50">
        <h5 className="text-xs font-mono text-gold-500 mb-2 uppercase">Party A Evidence</h5>
        {evidenceA && evidenceA.length > 0 ? (
          evidenceA.map((cid, idx) => (
            <a
              key={idx}
              href={`https://gateway.pinata.cloud/ipfs/${cid}`}
              target="_blank"
              rel="noreferrer"
              className="block text-[10px] text-blue-400 font-mono hover:underline truncate mb-1"
            >
              📎 {cid}
            </a>
          ))
        ) : (
          <p className="text-[10px] text-gray-500 font-mono italic">No evidence uploaded yet.</p>
        )}
      </div>
      <div className="p-4 border border-dark-700 bg-dark-900/50">
        <h5 className="text-xs font-mono text-gold-500 mb-2 uppercase">Party B Evidence</h5>
        {evidenceB && evidenceB.length > 0 ? (
          evidenceB.map((cid, idx) => (
            <a
              key={idx}
              href={`https://gateway.pinata.cloud/ipfs/${cid}`}
              target="_blank"
              rel="noreferrer"
              className="block text-[10px] text-blue-400 font-mono hover:underline truncate mb-1"
            >
              📎 {cid}
            </a>
          ))
        ) : (
          <p className="text-[10px] text-gray-500 font-mono italic">No evidence uploaded yet.</p>
        )}
      </div>
    </div>
  );
};

const ActiveCaseView = ({ caseId }) => {
  const { address } = useAccount();

  // getDispute returns tuple:
  // [id, escrowId, category, partyA, partyB, currentRound, status, winner, votingDeadline, evidenceSubmissionDeadline, escrowAmount]
  const { data: disputeRaw, refetch: refetchDispute } = useReadContract({
    address: ADDRESSES.DisputeResolver,
    abi: ABIS.DisputeResolver,
    functionName: 'getDispute',
    args: [caseId],
  });

  const { data: evA } = useReadContract({
    address: ADDRESSES.DisputeResolver,
    abi: ABIS.DisputeResolver,
    functionName: 'getEvidenceA',
    args: [caseId],
  });
  const { data: evB } = useReadContract({
    address: ADDRESSES.DisputeResolver,
    abi: ABIS.DisputeResolver,
    functionName: 'getEvidenceB',
    args: [caseId],
  });

  const dispute = disputeRaw
    ? {
        id: disputeRaw[0],
        escrowId: disputeRaw[1],
        category: disputeRaw[2],
        partyA: disputeRaw[3],
        partyB: disputeRaw[4],
        currentRound: disputeRaw[5],
        status: Number(disputeRaw[6]),
        winner: disputeRaw[7],
        votingDeadline: disputeRaw[8],
        evidenceSubmissionDeadline: disputeRaw[9],
        escrowAmount: disputeRaw[10],
      }
    : null;

  const { data: hasVoted, refetch: refetchVote } = useReadContract({
    address: ADDRESSES.DisputeResolver,
    abi: ABIS.DisputeResolver,
    functionName: 'hasJurorVoted',
    args: [caseId, dispute ? dispute.currentRound : 0n, address],
    query: {
      enabled: !!dispute && !!address,
    },
  });

  const { writeContract, data: hash, isPending } = useWriteContract();

  const { isSuccess: txConfirmed } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (txConfirmed) {
      toast.success('Transaction confirmed!');
      refetchDispute();
      refetchVote();
    }
  }, [txConfirmed, refetchDispute, refetchVote]);

  const handleVote = (voteNum) => {
    writeContract(
      {
        address: ADDRESSES.DisputeResolver,
        abi: ABIS.DisputeResolver,
        functionName: 'submitVote',
        args: [caseId, voteNum],
      },
      {
        onError: (err) => toast.error(err.shortMessage || err.message),
      }
    );
  };

  const handleResolve = () => {
    writeContract(
      {
        address: ADDRESSES.DisputeResolver,
        abi: ABIS.DisputeResolver,
        functionName: 'resolveRound',
        args: [caseId],
      },
      {
        onError: (err) => toast.error(err.shortMessage || err.message),
      }
    );
  };

  if (!dispute)
    return <div className="text-gray-500 font-mono p-4">Loading active case details...</div>;

  return (
    <div className="bg-dark-800 border-2 border-gold-500/50 p-6 mt-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-serif text-white">Active Case Assignment</h3>
        <span className="px-3 py-1 bg-red-500/20 text-red-400 font-mono text-[10px] tracking-widest uppercase border border-red-500/40">
          You are Locked
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 text-xs font-mono mb-4 text-gray-400">
        <div>
          <span className="text-gray-500 uppercase">Dispute ID:</span> #{caseId.toString()}
        </div>
        <div>
          <span className="text-gray-500 uppercase">Category:</span>{' '}
          {dispute.category.toString()}
        </div>
        <div>
          <span className="text-gray-500 uppercase">Round:</span>{' '}
          {dispute.currentRound.toString()}
        </div>
        <div>
          <span className="text-gray-500 uppercase">Voting Deadline:</span>{' '}
          {new Date(Number(dispute.votingDeadline) * 1000).toLocaleString()}
        </div>
      </div>

      <EvidenceView evidenceA={evA} evidenceB={evB} />

      <div className="mt-8 border-t border-dark-700 pt-6">
        {hasVoted ? (
          <div className="text-center p-4 border border-green-500/30 bg-green-500/10 text-green-400 font-mono text-xs uppercase">
            You have already voted for this round! Wait for round resolution.
          </div>
        ) : (
          <div>
            <h4 className="text-sm font-mono text-white mb-4 text-center uppercase tracking-widest">
              Cast Your Vote
            </h4>
            <div className="flex space-x-6 justify-center">
              <button
                onClick={() => handleVote(0)}
                disabled={isPending}
                className="px-8 py-3 bg-dark-900 border border-gold-500 text-gold-500 hover:bg-gold-500 hover:text-dark-900 font-mono text-xs uppercase transition-colors cursor-pointer disabled:opacity-50"
              >
                In Favor of Party A
              </button>
              <button
                onClick={() => handleVote(1)}
                disabled={isPending}
                className="px-8 py-3 bg-dark-900 border border-gold-500 text-gold-500 hover:bg-gold-500 hover:text-dark-900 font-mono text-xs uppercase transition-colors cursor-pointer disabled:opacity-50"
              >
                In Favor of Party B
              </button>
            </div>
            <div className="text-center mt-6">
              <button
                onClick={handleResolve}
                className="text-[10px] text-gray-600 underline font-mono hover:text-gray-400 cursor-pointer"
              >
                Resolve Round (if deadline passed)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const JurorPanel = () => {
  const { address } = useAccount();

  // getJurorStatus returns tuple: [category, stake, lockedCase, isLocked, isActive]
  const { data: statusRaw } = useReadContract({
    address: ADDRESSES.JurorRegistry,
    abi: ABIS.JurorRegistry,
    functionName: 'getJurorStatus',
    args: [address],
    query: { enabled: !!address },
  });

  const status = statusRaw
    ? {
        category: statusRaw[0],
        stake: statusRaw[1],
        lockedCase: statusRaw[2],
        isLocked: statusRaw[3],
        isActive: statusRaw[4],
      }
    : null;

  const { data: pendingRewards, refetch: refetchRewards } = useReadContract({
    address: ADDRESSES.RewardDistributor,
    abi: ABIS.RewardDistributor,
    functionName: 'pendingWithdrawals',
    args: [address],
    query: { enabled: !!address },
  });

  const { writeContract, data: hash, isPending } = useWriteContract();

  const { isSuccess: txConfirmed } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (txConfirmed) {
      toast.success('Withdrawal confirmed!');
      refetchRewards();
    }
  }, [txConfirmed, refetchRewards]);

  const handleWithdraw = () => {
    writeContract(
      {
        address: ADDRESSES.RewardDistributor,
        abi: ABIS.RewardDistributor,
        functionName: 'withdraw',
      },
      {
        onError: (err) => toast.error(err.shortMessage || err.message),
      }
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-10">
        <h2 className="text-3xl font-serif text-white mb-2">Juror Panel</h2>
        <p className="text-xs font-mono text-gray-400 tracking-wider">
          Review evidence and vote on assigned cases. Claim your rewards for honest participation.
        </p>
      </div>

      {!address ? (
        <div className="text-center py-20 text-gray-500 font-mono text-sm border border-dark-800 bg-dark-900/50">
          Please connect your wallet to access the Juror Panel.
        </div>
      ) : (
        <>
          {/* Rewards Section */}
          <div className="bg-dark-800 border border-dark-700 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <p className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-1">
                Pending Rewards
              </p>
              <p className="text-2xl font-serif text-gold-500">
                {pendingRewards ? formatEther(pendingRewards) : '0'}{' '}
                <span className="text-[10px] uppercase">ETH</span>
              </p>
            </div>
            <button
              onClick={handleWithdraw}
              disabled={isPending || !pendingRewards || pendingRewards === 0n}
              className="px-6 py-3 bg-gold-500 text-dark-900 font-mono text-xs font-bold uppercase transition-colors hover:bg-gold-400 disabled:opacity-50 cursor-pointer"
            >
              Withdraw Rewards
            </button>
          </div>

          {/* Active Cases Section */}
          {status && status.isLocked ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <ActiveCaseView caseId={status.lockedCase} />
            </motion.div>
          ) : (
            <div className="text-center py-20 text-gray-500 font-mono text-sm border border-dark-800 bg-dark-900/50 shadow-inner">
              {status && status.isActive
                ? 'You are an active juror. No cases assigned to you currently. Keep an eye out!'
                : 'You are not an active juror. Head to the STAKE tab to become one.'}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default JurorPanel;
