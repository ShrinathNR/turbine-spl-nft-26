import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import wallet from "../../devnet-wallet.json";
import {
  createSignerFromKeypair,
  publicKey,
  signerIdentity,
} from "@metaplex-foundation/umi";
import { burn, fetchAsset, mplCore } from "@metaplex-foundation/mpl-core";
import { base58 } from "@metaplex-foundation/umi/serializers";

//paste the asset address you want to destroy -> this cannot be undone
const ASSET_ADDRESS: string = "9NkT2pj3ASEt9BaKtUGZbHCRVgmVBMC7jMCJiFUzKBsK";

const umi = createUmi(
  process.env.SOLANA_RPC_URL ?? "https://api.devnet.solana.com",
);

const keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const signer = createSignerFromKeypair(umi, keypair);

umi.use(signerIdentity(signer));

umi.use(mplCore());

const toSol = (lamports: bigint) => Number(lamports) / 1_000_000_000;

(async () => {
  try {
    if (ASSET_ADDRESS === "") {
      throw new Error("set ASSET_ADDRESS first -> the nft to burn");
    }

    const asset = await fetchAsset(umi, publicKey(ASSET_ADDRESS));
    console.log(`burning -> name: ${asset.name} , owner: ${asset.owner}`);

    //only the owner (or a delegate) can burn the asset
    if (asset.owner !== signer.publicKey) {
      throw new Error(`${signer.publicKey} is not the owner of this asset`);
    }

    //the rent sitting in the asset account is what comes back to you
    const account = await umi.rpc.getAccount(publicKey(ASSET_ADDRESS));
    const rent = account.exists ? account.lamports.basisPoints : 0n;

    const before = await umi.rpc.getBalance(signer.publicKey);
    console.log(`before  -> wallet: ${toSol(before.basisPoints)} SOL`);
    console.log(`rent held in the asset account: ${toSol(rent)} SOL`);

    const tx = await burn(umi, { asset }).sendAndConfirm(umi);

    const signature = base58.deserialize(tx.signature)[0];

    const after = await umi.rpc.getBalance(signer.publicKey);
    const delta = after.basisPoints - before.basisPoints;

    console.log(`after   -> wallet: ${toSol(after.basisPoints)} SOL`);
    console.log(`net change: ${toSol(delta)} SOL (rent back, minus the tx fee)`);

    const gone = await umi.rpc.getAccount(publicKey(ASSET_ADDRESS));
    console.log(`asset account still exists? ${gone.exists}`);
    console.log(`signature ${signature}`);
  } catch (e) {
    console.log(`error ${e}`);
  }
})();
