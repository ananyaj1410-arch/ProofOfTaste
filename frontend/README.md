# Proof of Taste 🎵

**Your taste. Your proof.**

Proof of Taste is an onchain artist-discovery game built for the **Monad Metropolis Hackathon 2026 — Social, Attention & Culture track**.

## 💡 The Idea

Social media rewards people for having the most followers. Proof of Taste rewards people for having the best predictions about what deserves attention next.

Discover emerging artists, predict whether they will break out, and build a public reputation for spotting talent early.

## 🎮 How It Works

1. **Discover:** Explore a curated catalogue of emerging artists from around the world.
2. **Predict:** Choose whether an artist will break out or not yet.
3. **Record:** Submit your prediction through MetaMask on Monad Testnet.
4. **Resolve:** The contract owner records the outcome of a prediction.
5. **Build reputation:** Correct, resolved predictions contribute to your Scout Score.

## ✨ Features

- Curated global artist catalogue
- Breakout prediction interface
- MetaMask wallet connection
- Onchain prediction transactions
- Onchain prediction history
- Scout Score and prediction statistics interface
- Dark interface with lime-green accents

## 🛠️ Tech Stack

- React
- Vite
- Solidity
- Ethers.js
- MetaMask
- Monad Testnet

## 🚀 Run Locally

Requirements: Node.js and npm.

```bash
cd frontend
npm install
npm run dev
```

Open the local URL shown in your terminal.

## 🔗 Blockchain

The application is configured for Monad Testnet, using chain ID `10143`.

Predictions are recorded onchain through the deployed ProofOfTaste contract.

## ⚠️ MVP Notes

The artist catalogue is curated for the launch demo. Prediction outcomes require resolution by the contract owner. This prototype does not use real-money betting or claim to have an automated external outcome oracle.

## 🎯 Vision

Build a reputation layer for cultural discovery—where being early, accurate, and consistently good at spotting talent matters more than follower count.
