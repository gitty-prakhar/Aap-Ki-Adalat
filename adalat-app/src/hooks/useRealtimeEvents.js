import { useWatchContractEvent, useAccount } from 'wagmi';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { ABIS, ADDRESSES } from '../config/contracts';
import {
  notifyEscrowCreated,
  notifyDisputeFiled,
  notifyJurorSelected,
  notifyDisputeResolved,
  notifyEscrowCompleted,
} from '../utils/emailNotifications';

// ── Read user's saved email & notification preference ──────────────────────
const getUserEmail = () => {
  const enabled = localStorage.getItem('adalat_notifs') !== 'false';
  const email = localStorage.getItem('adalat_email');
  return enabled && email ? email : null;
};

export const useRealtimeEvents = () => {
  const queryClient = useQueryClient();
  const { isConnected, address } = useAccount();

  const handleEvent = (message, icon = '⚡') => {
    toast(message, {
      icon,
      style: {
        background: '#111111',
        color: '#e2e8f0',
        border: '1px solid rgba(234,179,8,0.3)',
        fontSize: '11px',
        fontFamily: 'var(--font-mono)',
      },
    });
    queryClient.invalidateQueries();
  };

  // ── JurorRegistry Events ────────────────────────────────────────────────
  useWatchContractEvent({
    address: ADDRESSES.JurorRegistry,
    abi: ABIS.JurorRegistry,
    eventName: 'JurorStaked',
    onLogs: (logs) => {
      handleEvent('New juror staked to the pool', '🔒');
    },
    enabled: isConnected,
  });

  useWatchContractEvent({
    address: ADDRESSES.JurorRegistry,
    abi: ABIS.JurorRegistry,
    eventName: 'JurorUnstaked',
    onLogs: () => handleEvent('A juror has unstaked', '🔓'),
    enabled: isConnected,
  });

  useWatchContractEvent({
    address: ADDRESSES.JurorRegistry,
    abi: ABIS.JurorRegistry,
    eventName: 'JurorLocked',
    onLogs: (logs) => {
      handleEvent('A juror has been assigned to a case!', '⚖️');
      // If the locked juror is the current user, send email
      const email = getUserEmail();
      if (email && logs?.length > 0) {
        const jurorArg = logs[0]?.args?.juror;
        if (jurorArg && jurorArg.toLowerCase() === address?.toLowerCase()) {
          const caseId = logs[0]?.args?.caseId?.toString() || '?';
          notifyJurorSelected({
            toEmail: email,
            disputeId: caseId,
            votingDeadline: 'Check the Juror Panel for the exact deadline.',
          });
        }
      }
    },
    enabled: isConnected,
  });

  // ── EscrowFactory Events ────────────────────────────────────────────────
  useWatchContractEvent({
    address: ADDRESSES.EscrowFactory,
    abi: ABIS.EscrowFactory,
    eventName: 'EscrowCreated',
    onLogs: (logs) => {
      handleEvent('New escrow contract created!', '📋');
      const email = getUserEmail();
      if (email && logs?.length > 0) {
        const { escrowId, partyA, partyB, amount } = logs[0]?.args || {};
        // Only notify if the creator is the current user
        if (partyA?.toLowerCase() === address?.toLowerCase()) {
          notifyEscrowCreated({
            toEmail: email,
            escrowId: escrowId?.toString() || '?',
            partyB: partyB || 'Unknown',
            amount: amount ? (Number(amount) / 1e18).toFixed(4) : '?',
          });
        }
      }
    },
    enabled: isConnected,
  });

  useWatchContractEvent({
    address: ADDRESSES.EscrowFactory,
    abi: ABIS.EscrowFactory,
    eventName: 'DisputeFiled',
    onLogs: (logs) => {
      handleEvent('A dispute has been filed on an escrow!', '⚠️');
      const email = getUserEmail();
      if (email && logs?.length > 0) {
        const { escrowId, filedBy } = logs[0]?.args || {};
        // Notify the OTHER party (not the one who filed)
        if (filedBy?.toLowerCase() !== address?.toLowerCase()) {
          notifyDisputeFiled({
            toEmail: email,
            escrowId: escrowId?.toString() || '?',
            filedBy: filedBy || 'Unknown',
          });
        }
      }
    },
    enabled: isConnected,
  });

  useWatchContractEvent({
    address: ADDRESSES.EscrowFactory,
    abi: ABIS.EscrowFactory,
    eventName: 'EscrowCompleted',
    onLogs: (logs) => {
      handleEvent('Escrow successfully completed! 🎉', '✅');
      const email = getUserEmail();
      if (email && logs?.length > 0) {
        const { escrowId } = logs[0]?.args || {};
        notifyEscrowCompleted({
          toEmail: email,
          escrowId: escrowId?.toString() || '?',
        });
      }
    },
    enabled: isConnected,
  });

  // ── DisputeResolver Events ──────────────────────────────────────────────
  useWatchContractEvent({
    address: ADDRESSES.DisputeResolver,
    abi: ABIS.DisputeResolver,
    eventName: 'DisputeCreated',
    onLogs: () => handleEvent('Dispute submitted for on-chain arbitration', '🏛️'),
    enabled: isConnected,
  });

  useWatchContractEvent({
    address: ADDRESSES.DisputeResolver,
    abi: ABIS.DisputeResolver,
    eventName: 'JurorsSelected',
    onLogs: () => handleEvent('Jury has been convened for a dispute', '⚖️'),
    enabled: isConnected,
  });

  useWatchContractEvent({
    address: ADDRESSES.DisputeResolver,
    abi: ABIS.DisputeResolver,
    eventName: 'VoteCast',
    onLogs: () => handleEvent('A juror has cast their vote', '🗳️'),
    enabled: isConnected,
  });

  useWatchContractEvent({
    address: ADDRESSES.DisputeResolver,
    abi: ABIS.DisputeResolver,
    eventName: 'WinnerDeclared',
    onLogs: (logs) => {
      handleEvent('Verdict reached! A winner has been declared.', '🏆');
      const email = getUserEmail();
      if (email && logs?.length > 0) {
        const { disputeId, winner } = logs[0]?.args || {};
        const isWinner = winner?.toLowerCase() === address?.toLowerCase();
        notifyDisputeResolved({
          toEmail: email,
          disputeId: disputeId?.toString() || '?',
          outcome: isWinner ? '🏆 You WON — funds are being released to you.' : 'The opposing party won this dispute.',
        });
      }
    },
    enabled: isConnected,
  });

  useWatchContractEvent({
    address: ADDRESSES.DisputeResolver,
    abi: ABIS.DisputeResolver,
    eventName: 'RoundResolved',
    onLogs: () => handleEvent('Voting round has been resolved', '📊'),
    enabled: isConnected,
  });
};
