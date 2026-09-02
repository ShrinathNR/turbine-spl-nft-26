import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import wallet from "../../devnet-wallet.json";
import {
  createSignerFromKeypair,
  publicKey,
  signerIdentity,
} from "@metaplex-foundation/umi";
import { fetchAsset, mplCore, transfer } from "@metaplex-foundation/mpl-core";
import { base58 } from "@metaplex-foundation/umi/serializers";

//paste the asset address got from nft_mint.ts
const ASSET_ADDRESS = "DMw4uFZ8HEfdKgAHGzo3hr3JS9fXDW6NV1MmA6N3Cokn";

//paste the wallet that should receive the nft -> keypair in recipient-wallet.json
const NEW_OWNER: string = "DRt3A3LgVzrTdC1ZrvL1ZotbfhaEKtM6yQFVvrtG5tuH";

const umi = createUmi(
  process.env.SOLANA_RPC_URL ?? "https://api.devnet.solana.com",
);

const keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const signer = createSignerFromKeypair(umi, keypair);

umi.use(signerIdentity(signer));

umi.use(mplCore());

(async () => {
  try {
    if (NEW_OWNER === "") {
      throw new Error("set NEW_OWNER first -> the wallet receiving the nft");
    }

    const asset = await fetchAsset(umi, publicKey(ASSET_ADDRESS));
    console.log(`before -> owner: ${asset.owner}`);

    //only the current owner (or a delegate) can transfer the asset
    if (asset.owner !== signer.publicKey) {
      throw new Error(`${signer.publicKey} is not the owner of this asset`);
    }

    const tx = await transfer(umi, {
      asset,
      newOwner: publicKey(NEW_OWNER),
    }).sendAndConfirm(umi);

    const signature = base58.deserialize(tx.signature)[0];

    const updated = await fetchAsset(umi, publicKey(ASSET_ADDRESS));
    console.log(`after  -> owner: ${updated.owner}`);
    console.log(`signature ${signature} , asset : ${updated.publicKey}`);
  } catch (e) {
    console.log(`error ${e}`);
  }
})();
