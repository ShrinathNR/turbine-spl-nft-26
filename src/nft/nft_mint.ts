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
    const metadataUri =
      "https://gateway.irys.xyz/39v2ZUgSLLEgTGxEk2SVAfM3qhJH9FckHv6myqw55GPQ";
    const asset = generateSigner(umi);

    

    const tx = await create(umi, {
      asset,
      name: "Rug Day",
      uri: metadataUri,
      updateAuthority: signer.publicKey,
    }).sendAndConfirm(umi);

    const signature = base58.deserialize(tx.signature)[0];

    console.log(`Transaction signature: ${signature}`);
    console.log(`NFT asset address: ${asset.publicKey}`);
    console.log(`Update authority: ${signer.publicKey}`);
  } catch (e) {
    console.dir(e, { depth: null });
  }
})();
