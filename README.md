# spl-nft-q326

**Week 1 Assignment (SPL and NFT)** — Q3 2026 Builders Cohort. Everything below ran on Solana devnet from the scripts in this repo.

| | Task | Status |
|---|---|---|
| 1 | Mint and transfer your own SPL token | ✅ **Done** |
| 2 | Mint an NFT using MPL Core | ✅ **Done** |
| 3 | Update the NFT's name and metadata as the update authority | ✅ **Done** |
| 4 | *Extension* — transfer the NFT ownership between wallets | ✅ **Done** |
| 5 | *Extension* — permanently destroy the NFT and reclaim rent | ✅ **Done** |

Both optional extensions included. Built with **@solana/kit** + **@solana-program/token** for raw transactions, **Metaplex UMI** for metadata, and **Irys** for storage.

## Tests

```bash
npm test
```

15 assertions, one group per task, run against **live devnet state** — not mocks. Built on Node's `node:test`, no extra dependencies.

![all 15 tests passing](src/screenshots/test/assignment-test.png)

What each group proves — see [`src/test/assignment.test.ts`](src/test/assignment.test.ts):

| Task | Asserted |
|---|---|
| ① | 3 decimals · supply exactly 100.000 · metadata reads `mars`/`MARS` · uri serves JSON whose image resolves as `image/*` · recipient holds 1.000, sender 99.000 |
| ② | account exists · owned by the Core program, not the Token program · no on-chain `symbol` field |
| ③ | name is `DOOM` · uri resolves · update authority still my wallet |
| ④ | owner is the recipient · owner ≠ minter · owner changed while update authority didn't |
| ⑤ | `fetchAsset` rejects · account is 1 byte of value `0` · balance dropped but stays rent-exempt |

---

## Setup

```bash
npm install
```

Drop your devnet keypair at `devnet-wallet.json` (a JSON array of bytes) and your images in `src/images/`. Every script reads the wallet from there and defaults to `https://api.devnet.solana.com`.

---

## ① SPL token — "mars"

A fungible token with **3 decimals**, so the smallest holdable slice is `0.001 mars`. Minted exactly **100**, then sent **1** to another wallet.

| Step | Command | What it does |
|---|---|---|
| 1 | `npm run spl:upload` | Uploads `mars.jpg` to Irys, wraps it in a metadata JSON, uploads that too |
| 2 | `npm run spl:init` | Creates the mint account with `decimals: 3` |
| 3 | `npm run spl:metadata` | Attaches name `mars` / symbol `MARS` via Token Metadata |
| 4 | `npm run spl:mint` | Creates your ATA and mints 100.000 mars into it |
| 5 | `npm run spl:transfer` | `transferChecked` — 1.000 mars to the recipient |

Step 1 prints two URIs. The **second** one — the JSON — is what goes on-chain; the JSON is what points at the picture.

![spl:upload printing image and metadata URIs](src/screenshots/spl-upload-uris.png)

And there it is on Explorer — logo pulled from the metadata, supply `100`, decimals `3`:

![mars token on Solana Explorer](src/screenshots/spl-mars-token-explorer.png)

The transfer, ATA to ATA:

![spl:transfer output showing fromAta, toAta and txid](src/screenshots/spl-transfer-txid.png)

Balance after — `99` left of the original 100:

![wallet token holdings showing 99 mars](src/screenshots/spl-wallet-holdings.png)

---

## ② NFT via MPL Core

One `create()` call from `@metaplex-foundation/mpl-core`. A Core asset is a **single account** — no mint, no ATA, ownership is a field inside the asset itself.

| Step | Command | What it does |
|---|---|---|
| 1 | `npm run nft:image` | Uploads the artwork to Irys |
| 2 | `npm run nft:metadata` | Builds the Core JSON schema and uploads it |
| 3 | `npm run nft:mint` | `create()` — mints the asset to your wallet |

Minted as **VSHL01**:

![VSHL01 NFT on Solana Explorer](src/screenshots/nft-vshl01-minted.png)

> **Why "No Symbol was found"?** Core stores only `name` and `uri` on-chain — there is no `symbol` field in the standard. The symbol lives in the off-chain JSON. Nothing is broken.

---

## ③ Update the NFT

```bash
npm run nft:update
```

Set `NEW_NAME` and/or `NEW_URI` in [`src/nft/nft_update.ts`](src/nft/nft_update.ts) first. The script fetches the asset, **checks your wallet is the update authority**, sends `update()`, then re-fetches so you can see the before/after.

`VSHL01` → **`DOOM`**, signed by the update authority:

![DOOM NFT after update](src/screenshots/nft-doom-updated.png)

Only `name` and `uri` are updatable on-chain. To change the image or attributes you re-upload the JSON (Irys is immutable) and point `uri` at the new one.

---

## ④ Transfer ownership *(extension)*

```bash
npm run nft:transfer
```

Set `NEW_OWNER` in [`src/nft/nft_transfer.ts`](src/nft/nft_transfer.ts). The script verifies you're the current owner before sending — `transfer()` fails for anyone else.

```
before -> owner: vZS43eQouRHvdP7giineKUo9ePX1Emvv7vP9E4TkXCf
after  -> owner: DRt3A3LgVzrTdC1ZrvL1ZotbfhaEKtM6yQFVvrtG5tuH
signature 2YrvgxrJN9u9Nq79YgwvEq4axww9B1XjDHsDWoouoAWa3demM2EZRGvri8aMwGFYxvXDcuqFtAfXCYQAQ6goM6FE
```

> **Owner changed, update authority didn't.** After the transfer, `DRt3A3Lg…` owns DOOM but `vZS43eQo…` can still rename it. Core keeps the two roles separate — owning an asset doesn't mean controlling its metadata.

---

## ⑤ Burn and reclaim rent *(extension)*

```bash
npm run nft:burn
```

Set `ASSET_ADDRESS` in [`src/nft/nft_burn.ts`](src/nft/nft_burn.ts)

A throwaway asset was minted for this so DOOM stayed intact as evidence for tasks ②–④:

```
burning -> name: VSHL01 , owner: vZS43eQouRHvdP7giineKUo9ePX1Emvv7vP9E4TkXCf
before  -> wallet: 8.479267404 SOL
rent held in the asset account: 0.003125769 SOL
after   -> wallet: 8.480206021 SOL
net change: 0.000938617 SOL (rent back, minus the tx fee)
asset account still exists? true
signature xN5H4cs2QafpZTzFBX3iQkc2bx1Kw2nPELf6vpEb91R6tUyWiowXsJgMazAxcQVQi82Qcf2UHbboGs9M3kbui8L
```

**The NFT is destroyed.** `fetchAsset` on that address now throws `UnexpectedAccountError` — no name, no uri, no owner.

| | Before burn | After burn |
|---|---|---|
| Data | full asset record (~150 bytes) | **1 byte, value `0`** (`Uninitialized`) |
| Lamports held | 0.003125769 | 0.002182152 |
| Readable as an asset | ✅ | ❌ `UnexpectedAccountError` |

---

## Receipts

**SPL token — mars**

| | |
|---|---|
| Mint | `H7JaSY4pYAP62B7CUYXK32iLVyVV8r7i8fRrGNxmvn4Z` |
| Decimals / supply | `3` / `100.000` |
| Metadata JSON | [`2SbuG5yD…`](https://gateway.irys.xyz/2SbuG5yD4Vh5yx3C2b4gb3h3XgciGerJzCTWUi73FYQA) |
| Mint tx | `xNcxCb3BGoEnZXzeoZb7Y8WKiTwZQm296WwsLBjkD55wX8cSt947Nr8LtiJe7vdN7nNXEDEaUPZbiZ8yb249JEa` |
| Transfer tx | `4RHffa2kzrHy78zKo9n9hjNs5VYxbUwQDfDUmvvppJgGhRF7Hj9BHSSB55DeXn6KVFN67RdezfZMgR91Gbt42qvF` |

**NFT — Core asset (tasks ②③④)**

| | |
|---|---|
| Asset | `DMw4uFZ8HEfdKgAHGzo3hr3JS9fXDW6NV1MmA6N3Cokn` |
| Mint tx | `4hvfwd1pV13Xc33L58E64MbuwjGBMcXWtTDa8cotLeWgHjNQh8h875U29Wd1MGo8CzdyDEq2DPyFv7ztuwfU6S4a` |
| Name | `VSHL01` → `DOOM` |
| Update tx | `4hvfwd1p…` → renamed, uri replaced |
| Transfer tx | `2YrvgxrJN9u9Nq79YgwvEq4axww9B1XjDHsDWoouoAWa3demM2EZRGvri8aMwGFYxvXDcuqFtAfXCYQAQ6goM6FE` |
| Owner (after ④) | `DRt3A3LgVzrTdC1ZrvL1ZotbfhaEKtM6yQFVvrtG5tuH` |
| Update authority | `vZS43eQouRHvdP7giineKUo9ePX1Emvv7vP9E4TkXCf` |

**Burned asset (task ⑤)**

| | |
|---|---|
| Asset | `9NkT2pj3ASEt9BaKtUGZbHCRVgmVBMC7jMCJiFUzKBsK` |
| Mint tx | `5wHZp3sN4otzBEhgUiE3PsQCwKvgCujdhg1oyUNJR5xDr8RWATU6GrGgVsUoaKLEWUcdJRhPkfwBME7J2bN565Un` |
| Burn tx | `xN5H4cs2QafpZTzFBX3iQkc2bx1Kw2nPELf6vpEb91R6tUyWiowXsJgMazAxcQVQi82Qcf2UHbboGs9M3kbui8L` |
| Rent returned | `0.000938617 SOL` |

---

## Scripts

```
spl:upload    spl:init    spl:metadata    spl:mint    spl:transfer
nft:image     nft:metadata    nft:mint    nft:update    nft:transfer    nft:burn
```

Run each in order; paste the address or URI it logs into the next script.

**Docs:** [Solana tokens](https://solana.com/docs/tokens) · [Solana Kit](https://www.solanakit.com/) · [Token Metadata](https://www.metaplex.com/docs/smart-contracts/token-metadata) · [Metaplex Core](https://www.metaplex.com/docs/smart-contracts/core)
