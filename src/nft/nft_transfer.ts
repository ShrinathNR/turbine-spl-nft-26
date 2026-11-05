import { mplCore, fetchAsset, transfer } from "@metaplex-foundation/mpl-core";
import {
  createSignerFromKeypair,
  publicKey,
  signerIdentity,
} from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { base58 } from "@metaplex-foundation/umi/serializers";
import wallet from "../../devnet-wallet.json";

const assetAddress = "3CviPot3dqXuZNfqeyJuqrCenjK7NLR7ioAo3BQFywAi";
const recipientAddress = "J2Rnp3AkbHWzXnGC9rnYnnKesA4ft63xXZKSmnURypoH";

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
    const recipient = publicKey(recipientAddress);

    if (asset.owner !== signer.publicKey) {
      throw new Error(
        `The configured wallet ${signer.publicKey} is not the current owner of NFT ${assetAddress}.`,
      );
    }

    const tx = await transfer(umi, {
      asset,
      authority: signer,
      newOwner: recipient,
    }).sendAndConfirm(umi);

    const signature = base58.deserialize(tx.signature)[0];
    console.log(`NFT transferred. Transaction signature: ${signature}`);
    console.log(`NFT asset address: ${asset.publicKey}`);
    console.log(`New owner: ${recipient}`);
  } catch (error) {
    console.dir(error, { depth: null });
    process.exitCode = 1;
  }
})();
