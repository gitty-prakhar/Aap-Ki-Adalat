import { createPublicClient, http } from 'viem';
import { sepolia } from 'viem/chains';
import fs from 'fs';

const EscrowFactoryABI = JSON.parse(fs.readFileSync('./src/config/abis/EscrowFactory.json', 'utf-8'));

const client = createPublicClient({
  chain: sepolia,
  transport: http(),
});

const ADDRESSES = {
  EscrowFactory: '0x95d543180a952919B2c92521718b44D1B4aBb7BC',
};

async function main() {
  try {
    const escrow = await client.readContract({
      address: ADDRESSES.EscrowFactory,
      abi: EscrowFactoryABI,
      functionName: 'getEscrow',
      args: [11n],
    });
    console.log('Escrow #11 Status:', escrow.status);
    
    // Check if the balance of EscrowFactory decreased, or if Party A balance increased.
  } catch (err) {
    console.error(err);
  }
}

main();
