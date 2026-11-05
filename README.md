# Solana Token and NFT Scripts

A collection of TypeScript scripts for creating and managing SPL tokens and
Metaplex Core NFTs on Solana devnet. The project includes the required token
and NFT workflows, plus optional NFT transfer and burn exercises.

## Project write-up

[What building Solana token and NFT scripts taught me about ownership](https://lnkd.in/p/eXDMxWbt) — LinkedIn article about the project, what I learned, and how the lessons apply to on-chain asset workflows.

## Features

### Required

1. **Create and transfer an SPL token** — create a token mint, attach metadata,
   mint tokens to your associated token account, and transfer tokens to another
   wallet.
2. **Mint an NFT with Metaplex Core** — upload an image and JSON metadata to
   Irys, then create a Core NFT using the metadata URI.
3. **Update NFT metadata** — change the NFT name and metadata URI using its
   update authority.

### Optional extension

4. **Transfer NFT ownership** — send a Core NFT to another wallet.
5. **Burn an NFT and reclaim rent** — permanently destroy a Core NFT. This is
   irreversible; reclaimed rent is returned to the NFT owner.

## Requirements and setup

- Node.js and npm
- A Solana devnet wallet with SOL for transaction fees and account rent
- An image file for the NFT, if you plan to mint one

Install dependencies:

```bash
npm install
```

Place the wallet keypair JSON at the project root as `devnet-wallet.json`.
It must be a JSON array containing the wallet's secret key bytes. **Never
commit this file, paste its contents into chat, or share it.** It is already
listed in `.gitignore`.

The scripts use devnet. Most scripts connect directly to the devnet RPC; the
Metaplex Core and Irys scripts also accept `SOLANA_RPC_URL` to override their
RPC endpoint. Use a devnet-compatible endpoint for this project.

## SPL token workflow

Run these scripts in order:

| Step | Command | Purpose |
|---|---|---|
| 1 | `npm run spl:init` | Creates a six-decimal SPL token mint and prints its address. |
| 2 | `npm run spl:metadata` | Creates token metadata for the mint. |
| 3 | `npm run spl:mint` | Creates your associated token account (ATA) and mints tokens to it. |
| 4 | `npm run spl:transfer` | Creates the recipient ATA if needed and transfers tokens. |

After `spl:init`, copy the printed mint address into the `mint` constant in
`src/spl/spl_metadata.ts`, `src/spl/spl_mint.ts`, and
`src/spl/spl_transfer.ts` before running those scripts. Customize the token
name, symbol, URI, and amount in the relevant scripts as needed. Set the
recipient wallet address in `src/spl/spl_transfer.ts` before running the
transfer. The sample transfer amount is one token (the mint has six decimals).

## Metaplex Core NFT workflow

Run the image and metadata scripts before minting:

| Step | Command | Purpose |
|---|---|---|
| 1 | `npm run nft:image` | Uploads `rug-pulled.png` to Irys and prints its URI. |
| 2 | `npm run nft:metadata` | Uploads a metadata JSON document to Irys and prints its URI. |
| 3 | `npm run nft:mint` | Creates a Metaplex Core NFT and prints its asset address and update authority. |
| 4 | `npm run nft:update` | Updates the configured NFT's name and metadata URI. |

To use a different image, change the file path and content type in
`src/nft/nft_image.ts`. In `src/nft/nft_metadata.ts`, replace the image URI
with the URI printed in step 1 and customize the metadata fields. Then copy the
metadata URI printed in step 2 into `src/nft/nft_mint.ts` before minting.

The update script uses the asset address and new metadata URI configured in
`src/nft/nft_update.ts`. Its signer must be the NFT's update authority.

## Optional NFT ownership transfer

Run:

```bash
npm run nft:transfer
```

Before running it, verify the asset and recipient addresses in
`src/nft/nft_transfer.ts`. The wallet in `devnet-wallet.json` must be the
NFT's current owner and must sign the transaction. After a successful
transfer, the recipient becomes the owner; the previous owner's keypair can
no longer authorize owner-only actions such as burning the NFT.

## Optional NFT burn and rent recovery

Run:

```bash
npm run nft:burn
```

Burning permanently destroys the configured NFT and cannot be undone. Verify
the asset address in `src/nft/nft_burn.ts` and confirm which wallet currently
owns that asset before submitting. The current owner's keypair must be
available to sign; update `devnet-wallet.json` to that owner's keypair if
needed. The NFT's reclaimed rent is returned to its owner.

For example, if you transferred the NFT to another wallet, the original
`devnet-wallet.json` wallet is no longer its owner. You need access to the
recipient wallet's keypair to burn it. Do not put secret keys in source code,
commit them, or send them to anyone.

## Commands

```text
npm run spl:init
npm run spl:metadata
npm run spl:mint
npm run spl:transfer
npm run nft:image
npm run nft:metadata
npm run nft:mint
npm run nft:update
npm run nft:transfer
npm run nft:burn
```
