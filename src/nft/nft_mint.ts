import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import wallet from "../../devnet-wallet.json";
import {
  createSignerFromKeypair,
  generateSigner,
  signerIdentity,
} from "@metaplex-foundation/umi";
import { create, mplCore } from "@metaplex-foundation/mpl-core";
import { base58 } from "@metaplex-foundation/umi/serializers";

const umi = createUmi(
  process.env.SOLANA_RPC_URL ?? "https://api.devnet.solana.com",
);

const keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const signer = createSignerFromKeypair(umi, keypair);

umi.use(signerIdentity(signer));

umi.use(mplCore());

(async () => {
  try {
    //change the metadata uri to the one obtained from nft_metadata.ts
    // got this from metadata file
    // metadata uri: https://gateway.irys.xyz/G9niwzguiKqoPNiiLL6Ak38XqjSVeaFEJWczHzQXZpAf
    const metadataUri =
      "https://gateway.irys.xyz/G9niwzguiKqoPNiiLL6Ak38XqjSVeaFEJWczHzQXZpAf";
    const asset = generateSigner(umi);

    //add you nft name and metadata uri
    const tx = await create(umi, {
      asset,
      name: "VSHL01",
      uri: metadataUri,
    }).sendAndConfirm(umi);

    const signature = base58.deserialize(tx.signature)[0];

    console.log(`signature ${signature} , asset : ${asset.publicKey}`);
  } catch (e) {
    console.log(`errior ${e}`);
  }
})();


// got this after mint 
// signature 4hvfwd1pV13Xc33L58E64MbuwjGBMcXWtTDa8cotLeWgHjNQh8h875U29Wd1MGo8CzdyDEq2DPyFv7ztuwfU6S4a , 
// asset : DMw4uFZ8HEfdKgAHGzo3hr3JS9fXDW6NV1MmA6N3Cokn