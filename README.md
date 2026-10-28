
# Week 01 Assignment as SPL and NFT workflow

A collection of TypeScript scripts for creating SPL tokens and Metaplex Core NFTs on Solana devnet.

## What You Need

- Node.js 18 or newer
- npm
- A Solana wallet funded with devnet SOL
- An image in PNG format for the NFT workflow

All scripts use Solana devnet. They do not create mainnet assets unless you explicitly change the RPC endpoints in the source files.

## 1. Install the Project

Clone or open the project, then install its dependencies:

```bash
npm install
```

Confirm that TypeScript compiles before running a transaction:

```bash
npx tsc --noEmit
```

## 2. Configure Your Wallet

Place a Solana CLI-compatible secret key at the project root as `devnet-wallet.json`:

```text
[
	174,
	23,
	 ...
]
```

The file must contain the secret key as a JSON array of numbers. Never commit this file or share its contents.

Check the wallet address and devnet balance with the Solana CLI:

```bash
solana address
solana balance --url devnet
```

Request devnet SOL when necessary:

```bash
solana airdrop 2 --url devnet
```

## SPL Token Workflow

Run the following commands in order.

### 3. Create a Mint

```bash
npm run spl:init
```

Copy the printed `Mint Address`. This is the mint address for the remaining SPL scripts.

### 4. Add SPL Token Metadata

Open `src/spl/spl_metadata.ts` and update these values:

- `mint`: the address printed by `spl:init`
- `name`: your token name
- `symbol`: your token symbol
- `uri`: a metadata JSON URI

Run:

```bash
npm run spl:metadata
```

Copy the printed transaction signature if you need to inspect the transaction on Solana Explorer.

### 5. Mint Tokens

Open `src/spl/spl_mint.ts` and set `mint` to the address created in step 3. Then run:

```bash
npm run spl:mint
```

The script creates the wallet's associated token account and mints `1` token. The mint uses six decimals, so the script sends `1,000,000` base units.

### 6. Transfer Tokens

Open `src/spl/spl_transfer.ts` and update:

- `mint`: the SPL mint address
- `to`: the recipient wallet address
- `decimals`: the mint's decimal count
- `amount`: the amount in base units

The source wallet must own enough tokens, and the mint's decimals must match the transfer instruction. Run:

```bash
npm run spl:transfer
```

## NFT Workflow

NFT images and metadata are uploaded to Irys devnet. Run these commands in order.

### 7. Upload the Image

Place a PNG image at the project root with the name `mint-image.png`, then run:

```bash
npm run nft:image
```

Copy the printed image URI. For another file path, set `NFT_IMAGE_PATH`:

```bash
NFT_IMAGE_PATH=./assets/my-image.png npm run nft:image
```

### 8. Upload NFT Metadata

Pass the image URI from step 7 to the metadata script:

```bash
NFT_IMAGE_URI="your-image-uri" npm run nft:metadata
```

The script uploads JSON containing the NFT name, description, image URI, and file information. Optional variables are:

```bash
NFT_NAME="My NFT" \
NFT_DESCRIPTION="My first devnet NFT" \
NFT_IMAGE_URI="your-image-uri" \
npm run nft:metadata
```

Copy the printed metadata URI.

### 9. Mint the NFT

Pass the metadata URI to the mint script:

```bash
NFT_METADATA_URI="your-metadata-uri" npm run nft:mint
```

The script prints the transaction signature and the new Core asset address. You can also set `NFT_NAME` to use the same name stored in the metadata.

## Useful Links

- [Solana tokens](https://solana.com/docs/tokens)
- [Solana Kit](https://www.solanakit.com/)
- [Metaplex Token Metadata](https://www.metaplex.com/docs/smart-contracts/token-metadata)
- [Metaplex Core](https://www.metaplex.com/docs/smart-contracts/core)
- [Irys](https://docs.irys.xyz/)

## Troubleshooting

- `insufficient funds`: fund the wallet with devnet SOL.
- `mint account not found`: verify that the mint address is from the same devnet wallet and network.
- `file not found`: run the image command from the project root or set `NFT_IMAGE_PATH`.
- `already in use`: the recipient ATA may already exist. The transfer script can still be used after removing or conditionally handling the ATA creation instruction.
- `invalid decimals`: make sure `spl_transfer.ts` uses the same decimals configured when the mint was created.
