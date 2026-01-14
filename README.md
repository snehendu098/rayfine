# Rayfine

DeFi in your command bar. A Raycast extension for Mantle blockchain.

## Overview

Rayfine brings Mantle DeFi to Raycast - swap, lend, stake, and manage wallets without leaving your keyboard.

## Structure

```
rayfine/
├── raycast/    # Raycast extension
└── landing/    # Marketing site (Next.js)
```

## Features

### Wallet
- Create/import wallets
- View token balances
- Send tokens
- Sign messages

### Trading (4 DEXs)
- OpenOcean (aggregator)
- Merchant Moe
- Uniswap V3
- Agni Finance

### Lending (Lendle)
- Supply/withdraw collateral
- Borrow/repay assets
- View positions

### Staking (mETH)
- Stake/unstake MNT
- View staking position

### Oracles
- Pyth price feeds

## Tech Stack

- **Extension:** TypeScript, React, Raycast API, viem
- **SDK:** mantle-agent-kit-sdk
- **Landing:** Next.js 16, Framer Motion, Three.js, Tailwind

## Commands

| Command | Description |
|---------|-------------|
| `wallet` | Manage wallet |
| `send` | Send tokens |
| `token-balances` | View balances |
| `sign-message` | Sign messages |
| `openocean` | OpenOcean swap |
| `merchantmoe` | Merchant Moe swap |
| `uniswap-swap` | Uniswap swap |
| `agni-swap` | Agni swap |
| `lendle-supply` | Supply to Lendle |
| `lendle-withdraw` | Withdraw from Lendle |
| `lendle-borrow` | Borrow from Lendle |
| `lendle-repay` | Repay Lendle loan |
| `lendle-positions` | View Lendle positions |
| `meth-swap-to` | Stake MNT → mETH |
| `meth-swap-from` | Unstake mETH → MNT |
| `meth-position` | View mETH position |
| `pyth-price` | Get Pyth prices |

## Networks

- Mantle Mainnet (5000)
- Mantle Sepolia Testnet (5003)

## Development

```bash
# Raycast extension
cd raycast
bun install
bun run dev

# Landing page
cd landing
bun install
bun run dev
```

## License

MIT
