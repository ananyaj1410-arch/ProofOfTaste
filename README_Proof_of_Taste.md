# Proof of Taste

> Social media rewards people for having the most followers. Proof of
> Taste is a game that rewards people for predicting who deserves
> attention next.

**Hackathon:** Monad Metropolis Hackathon 2026\
**Track:** Social, Attention & Culture\
**Network:** Monad Testnet\
**Chain ID:** `10143` (`0x279f`)\
**Contract:** `0xa34C3c87289007b897F46D74EA4A647De6b5cB05`

## Overview

Proof of Taste explores a different way to discover emerging artists:
instead of measuring attention only by follower counts, users make
timestamped predictions about which artists will break out. Predictions
are recorded on Monad, and users build a Scout Score as predictions are
resolved.

## How it works

1.  Connect a wallet on Monad Testnet.
2.  Browse the featured artists.
3.  Predict whether an artist will break out.
4.  Confirm the transaction in your wallet. The prediction is recorded
    by the smart contract.
5.  Review prediction history, Scout Score, and leaderboard.
6.  For this MVP, outcomes are resolved manually by the contract owner.
    Correct resolved predictions contribute to the Scout Score.

## Featured artists

-   The Last Dinner Party
-   Asha Banks
-   Good Neighbours

## Built with

-   React and Vite for the frontend
-   Solidity for the smart contract
-   ethers.js for wallet and contract interaction
-   Monad Testnet for on-chain prediction records

## Smart contract

The deployed contract supports: - Creating a prediction with an artist
ID and a breakout / no-breakout choice - Recording the predictor and
block timestamp - Tracking prediction counts by wallet - Owner-only
resolution of predictions - Recording whether each prediction was
correct

**Network:** Monad Testnet\
**Chain ID:** `10143`\
**Contract address:** `0xa34C3c87289007b897F46D74EA4A647De6b5cB05`

Before submitting, add a link to the contract on a Monad Testnet block
explorer and a successful prediction transaction hash if available.

## Run locally

Requirements: Node.js and npm.

``` bash
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite (commonly `http://localhost:5173`).

The app requires a browser wallet such as MetaMask configured for Monad
Testnet to submit on-chain predictions.

## Current scope and limitations

-   This is a hackathon MVP, not a production financial product.
-   Artist breakout outcomes are resolved manually by the contract
    owner.
-   The current version uses a small curated set of artists.
-   Predictions are not bets and do not require wagering tokens.
-   Scout Score is a product scoring mechanism, not a token or financial
    asset.

## Demo

**Demo video:** Add the final demo link here.\
**Repository:** Add or verify the public repository URL here.\
**Contract explorer:** Add the verified Monad Testnet explorer link
here.\
**Successful prediction transaction:** Add a transaction link here if
available.

## Before submission

-   [ ] Confirm the repository is public and opens in a signed-out
    browser.
-   [ ] Add the demo video link.
-   [ ] Add contract explorer and transaction links.
-   [ ] Confirm the track and project information in the official
    portal.
-   [ ] Check that no private keys, seed phrases, or secrets are
    committed.
-   [ ] Submit the project and save the confirmation.
