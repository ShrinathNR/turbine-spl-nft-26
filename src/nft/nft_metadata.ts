import {
  createSignerFromKeypair,
  signerIdentity,
} from "@metaplex-foundation/umi";
import wallet from "../../devnet-wallet.json";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys";

const umi = createUmi(
  process.env.SOLANA_RPC_URL ?? "https://api.devnet.solana.com",
);

const keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const signer = createSignerFromKeypair(umi, keypair);

umi.use(
  irysUploader({
    address: "https://devnet.irys.xyz/",
  }),
);

umi.use(signerIdentity(signer));

(async () => {
  try {
    //change the image uri to your image uri obtained from nft_image.ts
    const image = process.env.NFT_IMAGE_URI ??
      "https://gateway.irys.xyz/5EDyiNrMWfhjdsEwXLrwkHPwZoZB2m1A2Kudrfxo1tpr";

    //json scheme : https://www.metaplex.com/docs/smart-contracts/core/json-schema
    //change the metadata
    const metadata = {
      name: process.env.NFT_NAME ?? "Devnet NFT",
      description: process.env.NFT_DESCRIPTION ?? "An NFT minted on Solana devnet.",
      image,
      properties: {
        files: [{ uri: image, type: "image/png" }],
      },
    };

    const metadataUri = await umi.uploader.uploadJson(metadata);
    console.log("Metadata URI:", metadataUri);
  } catch (error) {
    console.error("Metadata upload failed:", error);
    process.exitCode = 1;
  }
})();
