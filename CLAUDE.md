# Rayfine - Raycast Extension for Mantle

## Commands

- `/add-protocol` - Generate actions + views for new protocol from SDK docs

## Architecture

- `src/actions/kit/<protocol>/` - SDK wrapper functions
- `src/<protocol>-<action>.tsx` - View components (Form/List)
- `src/context/WalletContext.tsx` - Global wallet state
- `src/hooks/useWallet.ts` - Wallet hook
- `src/utils/agentKit.ts` - Agent initialization

## Conventions

- All views use `WalletProvider` + `RequireWallet` wrapper
- Token lists from `getTokens` (OpenOcean)
- Balances from `getTokenBalance` (OpenOcean)
- Mainnet only for most protocols
- Explorer: `https://mantlescan.xyz`

## SDK

Using `mantle-agent-kit-sdk` for all protocol interactions.
