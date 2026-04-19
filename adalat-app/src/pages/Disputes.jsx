import React, { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { ABIS, ADDRESSES } from '../config/contracts';
import { formatEther } from 'viem';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { uploadFileToIPFS } from '../utils/ipfs';
import { UploadCloud, CheckCircle, Clock, ShieldAlert } from 'lucide-react';

const EscrowStatus = ['Active', 'Completed', 'Disputed', 'Expired'];

const EvidenceModal = ({ isOpen, onClose, onSubmit, isUploading }) => {
  const [file, setFile] = useState(null);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-900/90 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="bg-dark-800 border border-dark-700 p-8 max-w-md w-full shimmer-border"
        >
          <h3 className="text-xl font-serif text-white mb-4">Upload Evidence (.zip)</h3>
          <input
            type="file"
            accept=".zip"
            onChange={(e) => setFile(e.target.files[0])}
            className="mb-6 block w-full text-sm text-gray-400 cursor-pointer"
          />
          <div className="flex justify-end space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="text-gray-400 text-xs font-mono uppercase hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSubmit(file)}
              disabled={!file || isUploading}
              className="px-4 py-2 bg-gold-500 text-dark-900 text-xs font-mono font-bold uppercase hover:bg-gold-400 disabled:opacity-50 cursor-pointer btn-press"
            >
              {isUploading ? 'Uploading...' : 'Submit Evidence'}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const EscrowItem = ({ escrowId }) => {
  const { address } = useAccount();
  const [isEvidenceModalOpen, setEvidenceModalOpen] = useState(false);
  const [evidenceAction, setEvidenceAction] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const { data: escrow, refetch } = useReadContract({
    address: ADDRESSES.EscrowFactory,
    abi: ABIS.EscrowFactory,
    functionName: 'getEscrow',
    args: [escrowId],
  });

  // The escrowId maps 1:1 to disputeId in this contract architecture
  const disputeId = escrowId;

  // Read dispute jurors to know if selectJurors was already called
  const { data: disputeJurors, refetch: refetchJurors } = useReadContract({
    address: ADDRESSES.DisputeResolver,
    abi: ABIS.DisputeResolver,
    functionName: 'getDisputeJurors',
    args: [disputeId],
  });

  const { writeContract, data: txHash, isPending } = useWriteContract();

  const { isSuccess: txConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  useEffect(() => {
    if (txConfirmed) {
      toast.success('Transaction confirmed!');
      refetch();
      refetchJurors();
    }
  }, [txConfirmed, refetch, refetchJurors]);

  if (!escrow)
    return <div className="p-4 border border-dark-800 skeleton h-32 rounded-sm"></div>;

  // getEscrow returns a named struct — Wagmi decodes it as an object with named keys,
  // NOT a numeric array. Accessing by name (escrow.partyA) instead of index (escrow[1]).
  const escrowData = {
    id: escrow.id,
    partyA: escrow.partyA,
    partyB: escrow.partyB,
    amount: escrow.amount,
    deadline: escrow.deadline,
    status: Number(escrow.status),
    partyAComplete: escrow.partyAComplete,
    partyBComplete: escrow.partyBComplete,
  };

  // Safety guard — if any critical field is missing/zero-address, show a graceful error
  if (
    !escrowData.partyA ||
    escrowData.partyA === '0x0000000000000000000000000000000000000000' ||
    escrowData.amount === undefined
  ) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-4 border border-red-900/40 bg-dark-800/50 h-16 text-red-400 font-mono text-xs flex items-center pl-4"
      >
        Could not load escrow #{escrowId?.toString()}
      </motion.div>
    );
  }

  const handleMarkComplete = () => {
    writeContract({
      address: ADDRESSES.EscrowFactory,
      abi: ABIS.EscrowFactory,
      functionName: 'markComplete',
      args: [escrowId],
    });
  };

  const handleExtend = () => {
    const newTimestamp = BigInt(Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60);
    writeContract({
      address: ADDRESSES.EscrowFactory,
      abi: ABIS.EscrowFactory,
      functionName: 'extendDeadline',
      args: [escrowId, newTimestamp],
    });
  };

  // THE MISSING STEP: This was the bug. selectJurors() must be called after
  // fileDispute() to lock eligible staked jurors onto the case for voting.
  // NOTE: We pass an explicit gas limit because the contract uses gasleft()/block.gaslimit
  // for pseudo-randomness — Wagmi's auto-estimation overshoots and triggers a revert.
  const handleSelectJurors = () => {
    writeContract(
      {
        address: ADDRESSES.DisputeResolver,
        abi: ABIS.DisputeResolver,
        functionName: 'selectJurors',
        args: [disputeId],
        gas: 300000n,
      },
      {
        onError: (err) => toast.error('Convene Jury failed: ' + (err.shortMessage || err.message)),
      }
    );
  };

  const handleEvidenceSubmit = async (file) => {
    try {
      setIsUploading(true);
      toast.loading('Uploading to IPFS...', { id: 'ipfs' });
      const cid = await uploadFileToIPFS(file);
      toast.success('Uploaded to IPFS!', { id: 'ipfs' });

      if (evidenceAction === 'fileDispute') {
        writeContract({
          address: ADDRESSES.EscrowFactory,
          abi: ABIS.EscrowFactory,
          functionName: 'fileDispute',
          args: [escrowId, cid],
        });
      } else if (evidenceAction === 'appendEvidenceA') {
        writeContract({
          address: ADDRESSES.DisputeResolver,
          abi: ABIS.DisputeResolver,
          functionName: 'appendEvidenceA',
          args: [escrowId, cid],
        });
      } else if (evidenceAction === 'appendEvidenceB') {
        writeContract({
          address: ADDRESSES.DisputeResolver,
          abi: ABIS.DisputeResolver,
          functionName: 'appendEvidenceB',
          args: [escrowId, cid],
        });
      }
      setEvidenceModalOpen(false);
    } catch (e) {
      toast.error('IPFS upload failed', { id: 'ipfs' });
    } finally {
      setIsUploading(false);
    }
  };

  const isPartyA = address?.toLowerCase() === escrowData.partyA?.toLowerCase();
  const isPartyB = address?.toLowerCase() === escrowData.partyB?.toLowerCase();
  const statusStr = EscrowStatus[escrowData.status] || 'Unknown';
  const jurorsSelected = disputeJurors && disputeJurors.length > 0;

  return (
    <>
      <motion.div
        layout
        className="bg-dark-900 border border-dark-800 p-6 flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 card-hover"
        whileHover={{ borderColor: 'rgba(234, 179, 8, 0.2)' }}
      >
        <div className="space-y-2">
          <div className="flex items-center space-x-3 flex-wrap gap-2">
            <motion.span
              className="text-gold-500 font-mono text-sm px-2 py-0.5 bg-gold-500/10 border border-gold-500/20"
              whileHover={{ scale: 1.05 }}
            >
              #{escrowId.toString()}
            </motion.span>
            <motion.span
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className={`text-[10px] font-mono tracking-widest uppercase px-2 py-0.5 border ${
                statusStr === 'Active'
                  ? 'text-green-400 border-green-400/30 bg-green-400/10'
                  : statusStr === 'Disputed'
                  ? 'text-red-400 border-red-400/30 bg-red-400/10'
                  : 'text-gray-400 border-gray-400/30 bg-gray-400/10'
              }`}
            >
              {statusStr}
            </motion.span>
            {statusStr === 'Disputed' && (
              <motion.span
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300, delay: 0.1 }}
                className={`text-[10px] font-mono tracking-widest uppercase px-2 py-0.5 border ${
                  jurorsSelected
                    ? 'text-purple-400 border-purple-400/30 bg-purple-400/10'
                    : 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10'
                }`}
              >
                {jurorsSelected ? `⚖ ${disputeJurors.length} Jurors Selected` : '⏳ Awaiting Jury'}
              </motion.span>
            )}
          </div>
          <div className="text-sm font-mono text-gray-400">
            <span className="text-gray-500 uppercase tracking-widest text-[10px]">Amount:</span>{' '}
            <span className="text-white">{formatEther(escrowData.amount)} ETH</span>
          </div>
          <div className="text-xs font-mono text-gray-500">
            Deadline: {new Date(Number(escrowData.deadline) * 1000).toLocaleString()}
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {statusStr === 'Active' && (
            <>
              {(!escrowData.partyAComplete && isPartyA) ||
              (!escrowData.partyBComplete && isPartyB) ? (
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleMarkComplete}
                  disabled={isPending}
                  className="px-4 py-2 border border-green-500/50 text-green-500 hover:bg-green-500/10 font-mono text-xs uppercase tracking-widest transition-colors flex items-center cursor-pointer disabled:opacity-50 btn-press"
                >
                  <CheckCircle size={14} className="mr-2" /> Agree Complete
                </motion.button>
              ) : (
                <span className="px-4 py-2 text-green-500/50 font-mono text-xs uppercase tracking-widest flex items-center">
                  <CheckCircle size={14} className="mr-2" /> Waiting for other party
                </span>
              )}
              {isPartyA && (
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleExtend}
                  disabled={isPending}
                  className="px-4 py-2 border border-gray-600 text-gray-400 hover:text-white hover:border-gray-400 font-mono text-xs uppercase tracking-widest transition-colors flex items-center cursor-pointer disabled:opacity-50 btn-press"
                >
                  <Clock size={14} className="mr-2" /> Extend
                </motion.button>
              )}
              {(isPartyA || isPartyB) && (
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    setEvidenceAction('fileDispute');
                    setEvidenceModalOpen(true);
                  }}
                  disabled={isPending}
                  className="px-4 py-2 border border-red-500/50 text-red-500 hover:bg-red-500/10 font-mono text-xs uppercase tracking-widest transition-colors flex items-center cursor-pointer disabled:opacity-50 btn-press"
                >
                  <ShieldAlert size={14} className="mr-2" /> File Dispute
                </motion.button>
              )}
            </>
          )}

          {statusStr === 'Disputed' && (
            <>
              {/* ⚖ THE MISSING STEP — now fixed! */}
              {!jurorsSelected && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  animate={{
                    boxShadow: [
                      '0 0 0px rgba(168,85,247,0)',
                      '0 0 12px rgba(168,85,247,0.3)',
                      '0 0 0px rgba(168,85,247,0)',
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  onClick={handleSelectJurors}
                  disabled={isPending}
                  className="px-4 py-2 border border-purple-500/70 text-purple-400 hover:bg-purple-500/10 font-mono text-xs uppercase tracking-widest transition-colors flex items-center cursor-pointer disabled:opacity-50"
                >
                  ⚖ Convene Jury
                </motion.button>
              )}

              {(isPartyA || isPartyB) && (
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    setEvidenceAction(isPartyA ? 'appendEvidenceA' : 'appendEvidenceB');
                    setEvidenceModalOpen(true);
                  }}
                  disabled={isPending}
                  className="px-4 py-2 border border-gold-500/50 text-gold-500 hover:bg-gold-500/10 font-mono text-xs uppercase tracking-widest transition-colors flex items-center cursor-pointer disabled:opacity-50 btn-press"
                >
                  <UploadCloud size={14} className="mr-2" /> Append Evidence
                </motion.button>
              )}
            </>
          )}
        </div>
      </motion.div>

      <EvidenceModal
        isOpen={isEvidenceModalOpen}
        onClose={() => setEvidenceModalOpen(false)}
        onSubmit={handleEvidenceSubmit}
        isUploading={isUploading}
      />
    </>
  );
};

const Disputes = () => {
  const { address } = useAccount();

  const { data: userEscrows, isLoading } = useReadContract({
    address: ADDRESSES.EscrowFactory,
    abi: ABIS.EscrowFactory,
    functionName: 'getUserEscrows',
    args: [address],
    query: {
      enabled: !!address,
      // Refetch every 10 seconds so newly created escrows appear automatically
      refetchInterval: 10_000,
    },
  });

  return (
    <div className="max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-10"
      >
        <h2 className="text-3xl font-serif text-white mb-2">Your Escrows</h2>
        <p className="text-xs font-mono text-gray-400 tracking-wider">
          Manage your active agreements and coordinate dispute resolutions.
        </p>
      </motion.div>

      {!address ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center py-20 text-gray-500 font-mono text-sm border border-dark-800 bg-dark-900/50"
        >
          Please connect your wallet to view escrows.
        </motion.div>
      ) : isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 skeleton rounded-sm" style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      ) : userEscrows && userEscrows.length > 0 ? (
        <div className="space-y-4">
          {[...userEscrows].reverse().map((id, index) => (
            <motion.div
              key={id.toString()}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <EscrowItem escrowId={id} />
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center py-20 text-gray-500 font-mono text-sm border border-dark-800 bg-dark-900/50"
        >
          No escrows found associated with this wallet.
        </motion.div>
      )}
    </div>
  );
};

export default Disputes;
