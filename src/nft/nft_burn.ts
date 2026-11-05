import { burn, fetchAsset, mplCore } from "@metaplex-foundation/mpl-core";
import {
  createSignerFromKeypair,
  publicKey,
  signerIdentity,
} from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { base58 } from "@metaplex-foundation/umi/serializers";
import wallet from "../../devnet-wallet.json";

const assetAddress = "3CviPot3dqXuZNfqeyJuqrCenjK7NLR7ioAo3BQFywAi";

const umi = createUmi(
  process.env.SOLANA_RPC_URL ?? "https://api.devnet.solana.com",
);

const keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const signer = createSignerFromKeypair(umi, keypair);

umi.use(signerIdentity(signer));
umi.use(mplCore());

(async () => {
  try {
    const asset = await fetchAsset(umi, publicKey(assetAddress));

    if (asset.owner !== signer.publicKey) {
      throw new Error(
        `The configured wallet ${signer.publicKey} is not the current owner of NFT ${assetAddress}.`,
      );
    }

    const tx = await burn(umi, {
      asset,
      authority: signer,
    }).sendAndConfirm(umi);

    const signature = base58.deserialize(tx.signature)[0];
    console.log(`NFT permanently burned. Transaction signature: ${signature}`);
    console.log(`Reclaimed rent was returned to owner: ${signer.publicKey}`);
    console.log(`Burned NFT asset address: ${asset.publicKey}`);
  } catch (error) {
    console.dir(error, { depth: null });
    process.exitCode = 1;
  }
})();
