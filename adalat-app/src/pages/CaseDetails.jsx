import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { ABIS, ADDRESSES } from '../config/contracts';
import { formatEther } from 'viem';
import { toast } from 'react-hot-toast';
import { parseError } from '../utils/errors';
import { ArrowLeft, CheckCircle, Clock, ShieldAlert, Scale, UploadCloud, Users, Gavel } from 'lucide-react';
import { EscrowSkeleton } from '../components/Skeleton';
import { motion } from 'framer-motion';

const EscrowStatus = ['Active', 'Completed', 'Disputed', 'Expired'];

const CaseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { address } = useAccount();
  const escrowId = BigInt(id);

  const { data: escrow, refetch: refetchEscrow } = useReadContract({
    address: ADDRESSES.EscrowFactory,
    abi: ABIS.EscrowFactory,
    functionName: 'getEscrow',
    args: [escrowId],
  });

  const { data: linkedDisputeId, refetch: refetchDisputeId } = useReadContract({
    address: ADDRESSES.DisputeResolver,
    abi: ABIS.DisputeResolver,
    functionName: 'escrowToDispute',
    args: [escrowId],
  });
  
  const realDisputeId = linkedDisputeId ?? 0n;
  const disputeRegistered = realDisputeId > 0n;

  const { data: disputeJurors } = useReadContract({
    address: ADDRESSES.DisputeResolver,
    abi: ABIS.DisputeResolver,
    functionName: 'getDisputeJurors',
    args: [realDisputeId],
    query: { enabled: disputeRegistered },
  });

  const { data: disputeData, refetch: refetchDispute } = useReadContract({
    address: ADDRESSES.DisputeResolver,
    abi: ABIS.DisputeResolver,
    functionName: 'getDispute',
    args: [realDisputeId],
    query: { enabled: disputeRegistered },
  });

  const { writeContract, data: txHash, isPending } = useWriteContract();
  const { isSuccess: txConfirmed } = useWaitForTransactionReceipt({ hash: txHash });

  useEffect(() => {
    if (txConfirmed) {
      toast.success('Transaction confirmed!');
      refetchEscrow();
      refetchDisputeId();
      if (disputeRegistered) refetchDispute();
    }
  }, [txConfirmed, refetchEscrow, refetchDisputeId, refetchDispute, disputeRegistered]);

  if (!escrow) return (
    <div className="max-w-4xl mx-auto p-6">
      <button onClick={() => navigate(-1)} className="flex items-center space-x-2 text-xs font-mono text-gray-500 hover:text-gray-300 mb-6 transition-colors cursor-pointer">
        <ArrowLeft size={12} /><span>Back</span>
      </button>
      <EscrowSkeleton />
    </div>
  );

  const escrowData = {
    id: escrow.id,
    partyA: escrow.partyA,
    partyB: escrow.partyB,
    amount: escrow.amount,
    deadline: escrow.deadline,
    status: Number(escrow.status),
    partyAComplete: escrow.partyAComplete,
    partyBComplete: escrow.partyBComplete,
    evidenceHash: escrow.evidenceHash || '',
  };

  const isPartyA = address?.toLowerCase() === escrowData.partyA?.toLowerCase();
  const isPartyB = address?.toLowerCase() === escrowData.partyB?.toLowerCase();
  const statusStr = EscrowStatus[escrowData.status] || 'Unknown';
  
  // getDispute returns a tuple array. Index 8 is votingDeadline, Index 6 is state
  const votingDeadline = disputeData ? Number(disputeData[8]) : 0;
  const disputeState = disputeData ? Number(disputeData[6]) : 0;
  const canResolve = disputeRegistered && votingDeadline > 0 && Math.floor(Date.now() / 1000) > votingDeadline && disputeState === 1;

  const handleResolveRound = () => {
    writeContract(
      {
        address: ADDRESSES.DisputeResolver,
        abi: ABIS.DisputeResolver,
        functionName: 'resolveRound',
        args: [realDisputeId],
      },
      { onError: (err) => toast.error(parseError(err)) }
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center space-x-2 text-xs font-mono text-gray-500 hover:text-gold-500 mb-6 transition-colors cursor-pointer">
        <ArrowLeft size={12} /><span>Back to Escrows</span>
      </button>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-dark-800 border border-dark-700/60 p-8 shadow-2xl relative overflow-hidden">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pb-6 border-b border-dark-700">
          <div>
            <h2 className="text-3xl font-serif text-white flex items-center space-x-3">
              <Scale size={28} className="text-gold-500" />
              <span>Case #{escrowId.toString()}</span>
            </h2>
            <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mt-2">
              Created on {new Date(Number(escrow.createdAt) * 1000).toLocaleDateString()}
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex gap-2">
            <span className={`text-xs font-mono uppercase px-3 py-1.5 border ${
                statusStr === 'Active' ? 'text-green-400 border-green-400/30 bg-green-400/10'
                : statusStr === 'Disputed' ? 'text-red-400 border-red-400/30 bg-red-400/10'
                : 'text-gray-400 border-gray-400/30 bg-gray-400/10'
              }`}>
              {statusStr}
            </span>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="space-y-6">
            <div>
              <h4 className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-2 flex items-center"><Users size={12} className="mr-1"/> Party A (Creator)</h4>
              <p className="text-sm font-mono text-gray-300 break-all bg-dark-900 p-3 border border-dark-700/50">
                {escrowData.partyA}
                {isPartyA && <span className="ml-2 text-[9px] text-purple-400 border border-purple-400/30 px-1 py-0.5 uppercase tracking-widest">You</span>}
              </p>
            </div>
            <div>
              <h4 className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-2 flex items-center"><Users size={12} className="mr-1"/> Party B (Recipient)</h4>
              <p className="text-sm font-mono text-gray-300 break-all bg-dark-900 p-3 border border-dark-700/50">
                {escrowData.partyB}
                {isPartyB && <span className="ml-2 text-[9px] text-cyan-400 border border-cyan-400/30 px-1 py-0.5 uppercase tracking-widest">You</span>}
              </p>
            </div>
          </div>
          <div className="space-y-6">
            <div className="bg-dark-900 p-5 border border-dark-700/50 flex flex-col justify-center h-full">
              <h4 className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-1">Escrow Amount</h4>
              <p className="text-3xl font-serif text-gold-500 mb-4">{formatEther(escrowData.amount)} ETH</p>
              
              <h4 className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-1">Deadline</h4>
              <p className="text-sm font-mono text-gray-300">{new Date(Number(escrowData.deadline) * 1000).toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Dispute Section */}
        {statusStr === 'Disputed' && (
          <div className="mt-8 border-t border-dark-700 pt-8">
            <h3 className="text-xl font-serif text-white mb-6 flex items-center">
              <ShieldAlert size={20} className="text-red-400 mr-2" />
              Dispute Resolution Process
            </h3>

            {!disputeRegistered ? (
              <div className="p-4 bg-orange-400/10 border border-orange-400/30 text-orange-400 font-mono text-xs">
                A dispute has been filed but not yet registered with the arbitration system. Head back to the Disputes tab to register it.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-dark-900 p-4 border border-dark-700">
                  <h4 className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-2">Dispute ID</h4>
                  <p className="text-sm font-serif text-white">#{realDisputeId.toString()}</p>
                </div>
                <div className="bg-dark-900 p-4 border border-dark-700">
                  <h4 className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-2">Current Round</h4>
                  <p className="text-sm font-serif text-white">Round {disputeData ? disputeData[5]?.toString() : '1'}</p>
                </div>
                <div className="bg-dark-900 p-4 border border-dark-700">
                  <h4 className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-2">Jurors Assigned</h4>
                  <p className="text-sm font-serif text-white">{disputeJurors?.length || 0} / 5</p>
                </div>
                <div className="bg-dark-900 p-4 border border-dark-700">
                  <h4 className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-2">Voting Deadline</h4>
                  <p className="text-sm font-serif text-white">
                    {votingDeadline > 0 ? new Date(votingDeadline * 1000).toLocaleString() : 'N/A'}
                  </p>
                </div>
              </div>
            )}

            {/* RESOLVE ROUND BUTTON (Only for Party A & B) */}
            {(isPartyA || isPartyB) && disputeRegistered && (
              <div className="mt-8 bg-dark-900/50 p-6 border border-dark-700 text-center">
                <h4 className="text-sm font-serif text-white mb-2">Finalize Resolution</h4>
                <p className="text-[10px] font-mono text-gray-500 mb-6 max-w-md mx-auto">
                  Once the voting deadline has passed, either party can finalize the round to distribute the funds and juror rewards.
                </p>
                <button
                  onClick={handleResolveRound}
                  disabled={isPending || !canResolve}
                  className="px-8 py-3 bg-gold-500 text-dark-900 font-mono text-xs font-bold uppercase transition-colors hover:bg-gold-400 disabled:opacity-50 disabled:bg-dark-700 disabled:text-gray-500 cursor-pointer"
                >
                  {isPending ? 'Processing...' : canResolve ? 'Resolve Round' : 'Waiting for Deadline'}
                </button>
              </div>
            )}
          </div>
        )}

      </motion.div>
    </div>
  );
};

export default CaseDetails;
