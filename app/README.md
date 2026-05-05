# RateTap

Personal finance + SaaS lead tracker built with Expo / React Native.

Local-only state (AsyncStorage). No backend.

## Run

```bash
cd app
npm install
npx expo start
```

Then press `i` for iOS simulator, `a` for Android, or scan the QR with Expo Go.

## Features

- **Home dashboard** — net balance, per-account balances, open leads, won MRR, recent activity
- **Add transaction** — income/expense, account, amount, category, note (under 5 seconds)
- **Add SaaS lead** — name, contact, status, MRR estimate, note
- **Account separation** — Mercado Pago (personal), BBVA (business), Spin (ads), Credit

## Stack

- Expo SDK 51 + TypeScript
- React Navigation (bottom tabs + native stack)
- AsyncStorage for persistence
- React `useState` / Context for state

## Project layout

```
app/
├── App.tsx                   navigation shell
├── index.ts                  entry
└── src/
    ├── types.ts
    ├── constants/            accounts, theme tokens
    ├── storage/useStore.ts   in-memory + AsyncStorage hook
    ├── components/           shared UI (FAB, Field, AccountChip, …)
    ├── navigation/types.ts   typed param lists
    └── screens/              Dashboard, Transactions, Leads, AddX
```
