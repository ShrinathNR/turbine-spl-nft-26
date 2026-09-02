import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  createGenericFile,
  createSignerFromKeypair,
  signerIdentity,
} from "@metaplex-foundation/umi";
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys";
import { readFile } from "fs/promises";
import path from "path";

import wallet from "../../devnet-wallet.json";

//change the image path to your mars image (relative to the project root)
const IMAGE_FILE = "src/images/mars.jpg";

//change the mime type to match your image
const IMAGE_CONTENT_TYPE = "image/jpeg";

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
    const imagePath = path.join(__dirname, "../..", IMAGE_FILE);
    const image = await readFile(imagePath);

    const file = createGenericFile(
      new Uint8Array(image),
      path.basename(IMAGE_FILE),
      {
        contentType: IMAGE_CONTENT_TYPE,
      },
    );

    const [imageUri] = await umi.uploader.upload([file]);
    console.log("mars image uri   : ", imageUri);

    //change the token metadata
    const metadata = {
      name: "mars",
      symbol: "MARS",
      description: "The mars token.",
      image: imageUri,
    };

    const metadataUri = await umi.uploader.uploadJson(metadata);
    console.log("mars metadata uri: ", metadataUri);
  } catch (error) {
    console.log(error);
  }
})();
