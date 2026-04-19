import { http, createConfig, fallback } from 'wagmi'
import { sepolia } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'

export const config = createConfig({
  chains: [sepolia],
  connectors: [
    injected(),
  ],
  transports: {
    [sepolia.id]: fallback([
      http('https://rpc2.sepolia.org'),
      http('https://ethereum-sepolia-rpc.publicnode.com'),
      http('https://sepolia.gateway.tenderly.co'),
      http('https://rpc.sepolia.org'),
    ]),
  },
})
