import JurorRegistryABI from './abis/JurorRegistry.json';
import EscrowFactoryABI from './abis/EscrowFactory.json';
import DisputeResolverABI from './abis/DisputeResolver.json';
import RewardDistributorABI from './abis/RewardDistributor.json';

export const ADDRESSES = {
  JurorRegistry: '0x3ef115f220A019Ce1FD3545891b06CE6EE5867a6',
  EscrowFactory: '0x95d543180a952919B2c92521718b44D1B4aBb7BC',
  DisputeResolver: '0x76328Df58748a9908aa2be49E3eF59E5f1E0161C',
  RewardDistributor: '0xc3846C4eCaae1cB6bb80149B498aF0a2c74185Ae',
};

export const ABIS = {
  JurorRegistry: JurorRegistryABI,
  EscrowFactory: EscrowFactoryABI,
  DisputeResolver: DisputeResolverABI,
  RewardDistributor: RewardDistributorABI,
};
