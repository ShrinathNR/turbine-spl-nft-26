import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  createSignerFromKeypair,
  publicKey,
  signerIdentity,
} from "@metaplex-foundation/umi";
import { updateV1, mplCore } from "@metaplex-foundation/mpl-core";
import { base58 } from "@metaplex-foundation/umi/serializers";
import wallet from "../../devnet-wallet.json";

const umi = createUmi(
  process.env.SOLANA_RPC_URL ?? "https://api.devnet.solana.com",
);

const keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const signer = createSignerFromKeypair(umi, keypair);

umi.use(signerIdentity(signer));
umi.use(mplCore());

(async () => {
  try {
    const assetAddress = "3CviPot3dqXuZNfqeyJuqrCenjK7NLR7ioAo3BQFywAi";
    const metadataUri = "https://gateway.irys.xyz/9LN8grqptu4khizRWm4kkPeFtVfNECfZEuHUASHbrGNF";

    if (!assetAddress || !metadataUri) {
      throw new Error(
        "Set assetAddress to the NFT asset address and metadataUri to the new metadata JSON URI.",
      );
    }

    const asset = publicKey(assetAddress);

    const tx = await updateV1(umi, {
      asset,
      authority: signer,
      newName: "Rug Day",
      newUri: metadataUri,
    }).sendAndConfirm(umi);

    const signature = base58.deserialize(tx.signature)[0];
    console.log(`NFT updated. Transaction signature: ${signature}`);
    console.log(`NFT asset address: ${asset}`);
  } catch (error) {
    console.dir(error, { depth: null });
    process.exitCode = 1;
  }
})();
