import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  createGenericFile,
  createSignerFromKeypair,
  signerIdentity,
} from "@metaplex-foundation/umi";
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys";
import { readFile } from "fs/promises";

import wallet from "../../devnet-wallet.json";

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
    //chanege image path to your image path
    const imagePath = process.env.NFT_IMAGE_PATH ?? "mint-image.png";
    const image = await readFile(imagePath);

    //change the image name and mime type
    const file = createGenericFile(image, "mint-image.png", {
      contentType: "image/png",
    });

    const [imageUri] = await umi.uploader.upload([file]);
    console.log("Your image URI:", imageUri);
  } catch (error) {
    console.error("Image upload failed:", error);
    process.exitCode = 1;
  }
})();
