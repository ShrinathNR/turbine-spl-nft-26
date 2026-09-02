import test from "node:test";
import assert from "node:assert/strict";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { publicKey } from "@metaplex-foundation/umi";
import { fetchAsset, mplCore } from "@metaplex-foundation/mpl-core";
import { fetchDigitalAsset } from "@metaplex-foundation/mpl-token-metadata";
import {
  findAssociatedTokenPda,
  TOKEN_PROGRAM_ADDRESS,
} from "@solana-program/token";
import { address } from "@solana/kit";

const RPC = process.env.SOLANA_RPC_URL ?? "https://api.devnet.solana.com";

//task 1 -> the mars spl token
const MARS_MINT = "H7JaSY4pYAP62B7CUYXK32iLVyVV8r7i8fRrGNxmvn4Z";

//task 2/3/4 -> the core nft
const NFT_ASSET = "DMw4uFZ8HEfdKgAHGzo3hr3JS9fXDW6NV1MmA6N3Cokn";

//task 5 -> the asset that was burned
const BURNED_ASSET = "9NkT2pj3ASEt9BaKtUGZbHCRVgmVBMC7jMCJiFUzKBsK";

const MY_WALLET = "vZS43eQouRHvdP7giineKUo9ePX1Emvv7vP9E4TkXCf";

//who received the mars tokens in task 1
const TOKEN_RECIPIENT = "9EUd4VNcjMAysd7zQk3Q1a4tb28BYndLNBAQDiYnHJ64";

//who received the nft in task 4 -> keypair in recipient-wallet.json
const NFT_RECIPIENT = "DRt3A3LgVzrTdC1ZrvL1ZotbfhaEKtM6yQFVvrtG5tuH";

const CORE_PROGRAM = "CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d";

const umi = createUmi(RPC).use(mplCore());

const ata = async (owner: string) => {
  const [pda] = await findAssociatedTokenPda({
    mint: address(MARS_MINT),
    owner: address(owner),
    tokenProgram: TOKEN_PROGRAM_ADDRESS,
  });
  return pda as string;
};

const balanceOf = async (owner: string) => {
  const res = await fetch(RPC, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "getTokenAccountBalance",
      params: [await ata(owner)],
    }),
  });
  const json = (await res.json()) as any;
  return json.result?.value?.uiAmountString ?? "0";
};

// ---------------------------------------------------------------- task 1

test("task 1 - mars mint exists with 3 decimals", async () => {
  const asset = await fetchDigitalAsset(umi, publicKey(MARS_MINT));
  assert.equal(asset.mint.decimals, 3, "smallest holdable unit is 0.001");
});

test("task 1 - total supply is exactly 100 mars", async () => {
  const asset = await fetchDigitalAsset(umi, publicKey(MARS_MINT));
  assert.equal(asset.mint.supply.toString(), "100000", "100 * 10^3 base units");
});

test("task 1 - on-chain metadata reads mars / MARS", async () => {
  const asset = await fetchDigitalAsset(umi, publicKey(MARS_MINT));
  assert.equal(asset.metadata.name.replace(/\0/g, "").trim(), "mars");
  assert.equal(asset.metadata.symbol.replace(/\0/g, "").trim(), "MARS");
});

test("task 1 - metadata uri serves json that points at an image", async () => {
  const asset = await fetchDigitalAsset(umi, publicKey(MARS_MINT));
  const uri = asset.metadata.uri.trim();
  assert.ok(uri.startsWith("https://"), "uri is set");

  const json = (await (await fetch(uri)).json()) as any;
  assert.equal(json.name, "mars");
  assert.equal(json.symbol, "MARS");
  assert.ok(json.image?.startsWith("https://"), "json carries an image uri");

  const img = await fetch(json.image, { method: "HEAD" });
  assert.equal(img.status, 200, "image resolves");
  assert.match(
    img.headers.get("content-type") ?? "",
    /^image\//,
    "image is served as an image",
  );
});

test("task 1 - transfer moved 1 mars to the recipient", async () => {
  assert.equal(
    await balanceOf(TOKEN_RECIPIENT),
    "1",
    "recipient holds 1.000 mars",
  );
  assert.equal(await balanceOf(MY_WALLET), "99", "sender holds 99.000 mars");
});

// ---------------------------------------------------------------- task 2

test("task 2 - nft exists and is an mpl core asset", async () => {
  const account = await umi.rpc.getAccount(publicKey(NFT_ASSET));
  assert.ok(account.exists, "asset account exists");
  assert.equal(
    account.exists && account.owner,
    CORE_PROGRAM,
    "owned by the core program, not the token program",
  );
});

test("task 2 - nft has no on-chain symbol field (core standard)", async () => {
  const asset = await fetchAsset(umi, publicKey(NFT_ASSET));
  assert.ok(!("symbol" in asset), "core stores only name and uri on-chain");
});

// ---------------------------------------------------------------- task 3

test("task 3 - name was updated to DOOM", async () => {
  const asset = await fetchAsset(umi, publicKey(NFT_ASSET));
  assert.equal(asset.name, "DOOM", "renamed from VSHL01");
});

test("task 3 - uri was updated and still resolves", async () => {
  const asset = await fetchAsset(umi, publicKey(NFT_ASSET));
  assert.ok(asset.uri.startsWith("https://"), "uri is set");
  const res = await fetch(asset.uri, { method: "HEAD" });
  assert.equal(res.status, 200, "uri resolves");
});

test("task 3 - my wallet is still the update authority", async () => {
  const asset = await fetchAsset(umi, publicKey(NFT_ASSET));
  assert.equal(asset.updateAuthority.type, "Address");
  assert.equal(
    asset.updateAuthority.type === "Address" &&
      asset.updateAuthority.address,
    MY_WALLET,
  );
});

// ---------------------------------------------------------------- task 4

test("task 4 - ownership moved to the recipient wallet", async () => {
  const asset = await fetchAsset(umi, publicKey(NFT_ASSET));
  assert.equal(asset.owner, NFT_RECIPIENT, "recipient now owns the nft");
  assert.notEqual(asset.owner, MY_WALLET, "no longer owned by the minter");
});

test("task 4 - owner changed but update authority did not", async () => {
  const asset = await fetchAsset(umi, publicKey(NFT_ASSET));
  const authority =
    asset.updateAuthority.type === "Address"
      ? asset.updateAuthority.address
      : null;
  assert.equal(asset.owner, NFT_RECIPIENT);
  assert.equal(authority, MY_WALLET, "the two roles are separate in core");
});

// ---------------------------------------------------------------- task 5

test("task 5 - burned asset is no longer readable as an nft", async () => {
  await assert.rejects(
    () => fetchAsset(umi, publicKey(BURNED_ASSET)),
    "fetchAsset must fail after a burn",
  );
});

test("task 5 - burned account is a 1-byte uninitialized tombstone", async () => {
  const account = await umi.rpc.getAccount(publicKey(BURNED_ASSET));
  assert.ok(account.exists, "the account address is retired, not deleted");
  if (!account.exists) return;
  assert.equal(account.data.length, 1, "data shrank to a single byte");
  assert.equal(account.data[0], 0, "discriminator is Uninitialized");
});

test("task 5 - rent was reclaimed down toward the 1-byte minimum", async () => {
  const account = await umi.rpc.getAccount(publicKey(BURNED_ASSET));
  assert.ok(account.exists);
  if (!account.exists) return;

  const lamports = Number(account.lamports.basisPoints);
  const beforeBurn = 3_125_769;

  assert.ok(lamports < beforeBurn, "account holds less than before the burn");
  assert.ok(lamports >= 816_957, "still rent-exempt for its 1 byte");
});
