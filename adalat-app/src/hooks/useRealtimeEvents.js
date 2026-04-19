import { useWatchContractEvent, useAccount } from 'wagmi';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { ABIS, ADDRESSES } from '../config/contracts';

export const useRealtimeEvents = () => {
  const queryClient = useQueryClient();
  const { isConnected } = useAccount();

  const handleEvent = (message) => {
    toast(message, {
      icon: '⚡',
      style: {
        background: '#171717',
        color: '#e2e8f0',
        border: '1px solid #ca8a04',
      },
    });
    queryClient.invalidateQueries();
  };

  // JurorRegistry Events
  useWatchContractEvent({
    address: ADDRESSES.JurorRegistry,
    abi: ABIS.JurorRegistry,
    eventName: 'JurorStaked',
    onLogs: () => handleEvent('New Juror Staked'),
    enabled: isConnected,
  });
  useWatchContractEvent({
    address: ADDRESSES.JurorRegistry,
    abi: ABIS.JurorRegistry,
    eventName: 'JurorUnstaked',
    onLogs: () => handleEvent('A juror has unstaked'),
    enabled: isConnected,
  });
  useWatchContractEvent({
    address: ADDRESSES.JurorRegistry,
    abi: ABIS.JurorRegistry,
    eventName: 'JurorLocked',
    onLogs: () => handleEvent('Juror assigned to a case!'),
    enabled: isConnected,
  });

  // EscrowFactory Events
  useWatchContractEvent({
    address: ADDRESSES.EscrowFactory,
    abi: ABIS.EscrowFactory,
    eventName: 'EscrowCreated',
    onLogs: () => handleEvent('New Escrow created!'),
    enabled: isConnected,
  });
  useWatchContractEvent({
    address: ADDRESSES.EscrowFactory,
    abi: ABIS.EscrowFactory,
    eventName: 'DisputeFiled',
    onLogs: () => handleEvent('A dispute was filed!'),
    enabled: isConnected,
  });
  useWatchContractEvent({
    address: ADDRESSES.EscrowFactory,
    abi: ABIS.EscrowFactory,
    eventName: 'EscrowCompleted',
    onLogs: () => handleEvent('Escrow marked complete!'),
    enabled: isConnected,
  });

  // DisputeResolver Events
  useWatchContractEvent({
    address: ADDRESSES.DisputeResolver,
    abi: ABIS.DisputeResolver,
    eventName: 'DisputeCreated',
    onLogs: () => handleEvent('Dispute activated for arbitration!'),
    enabled: isConnected,
  });
  useWatchContractEvent({
    address: ADDRESSES.DisputeResolver,
    abi: ABIS.DisputeResolver,
    eventName: 'JurorsSelected',
    onLogs: () => handleEvent('Jurors have been selected for a case.'),
    enabled: isConnected,
  });
  useWatchContractEvent({
    address: ADDRESSES.DisputeResolver,
    abi: ABIS.DisputeResolver,
    eventName: 'VoteCast',
    onLogs: () => handleEvent('A juror cast their vote.'),
    enabled: isConnected,
  });
  useWatchContractEvent({
    address: ADDRESSES.DisputeResolver,
    abi: ABIS.DisputeResolver,
    eventName: 'RoundResolved',
    onLogs: () => handleEvent('Voting round resolved!'),
    enabled: isConnected,
  });
};
