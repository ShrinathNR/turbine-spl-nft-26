import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import wallet from "../../devnet-wallet.json";
import {
  createSignerFromKeypair,
  publicKey,
  signerIdentity,
} from "@metaplex-foundation/umi";
import { fetchAsset, mplCore, update } from "@metaplex-foundation/mpl-core";
import { base58 } from "@metaplex-foundation/umi/serializers";

//paste the asset address got from nft_mint.ts
const ASSET_ADDRESS = "DMw4uFZ8HEfdKgAHGzo3hr3JS9fXDW6NV1MmA6N3Cokn";

//set the new on-chain name, or leave undefined to keep the current one
const NEW_NAME: string = "DOOM";

//set the new metadata uri got from nft_metadata.ts, or leave undefined to keep the current one
const NEW_URI: string =
  "https://gateway.irys.xyz/H28GuD8SQMcAjnLKgfjaKEMNTrjYg5JLtZjvp4ibdxFU";

const umi = createUmi(
  process.env.SOLANA_RPC_URL ?? "https://api.devnet.solana.com",
);

const keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const signer = createSignerFromKeypair(umi, keypair);

umi.use(signerIdentity(signer));

umi.use(mplCore());

(async () => {
  try {
    if (NEW_NAME === undefined && NEW_URI === undefined) {
      throw new Error("nothing to update: set NEW_NAME and/or NEW_URI first");
    }

    const asset = await fetchAsset(umi, publicKey(ASSET_ADDRESS));
    console.log(`before -> name: ${asset.name} , uri: ${asset.uri}`);

    //only the update authority is allowed to change the asset
    if (
      asset.updateAuthority.type !== "Address" ||
      asset.updateAuthority.address !== signer.publicKey
    ) {
      throw new Error(
        `${signer.publicKey} is not the update authority of this asset`,
      );
    }

    const tx = await update(umi, {
      asset,
      name: NEW_NAME,
      uri: NEW_URI,
    }).sendAndConfirm(umi);

    const signature = base58.deserialize(tx.signature)[0];

    const updated = await fetchAsset(umi, publicKey(ASSET_ADDRESS));
    console.log(`after  -> name: ${updated.name} , uri: ${updated.uri}`);
    console.log(`signature ${signature} , asset : ${updated.publicKey}`);
  } catch (e) {
    console.log(`error ${e}`);
  }
})();
