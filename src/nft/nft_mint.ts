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
    const metadataUri = process.env.NFT_METADATA_URI ??
      "https://gateway.irys.xyz/BihKZnhMCvxN3i34cv25eEyFgUvBVGJQn1Gp11D4LxEi";
    const asset = generateSigner(umi);

    //add you nft name and metadata uri
    const tx = await create(umi, {
      asset,
      name: process.env.NFT_NAME ?? "Devnet NFT",
      uri: metadataUri,
    }).sendAndConfirm(umi);

    const signature = base58.deserialize(tx.signature)[0];

    console.log(`Signature: ${signature}, Asset: ${asset.publicKey}`);
  } catch (e) {
    console.error("NFT mint failed:", e);
    process.exitCode = 1;
  }
})();
