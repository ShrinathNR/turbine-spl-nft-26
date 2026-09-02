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

//chanege image path to your image path (relative to the project root)
const IMAGE_FILE = "src/images/doc.webp";

//change the mime type to match your image
const IMAGE_CONTENT_TYPE = "image/png";

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

    const [myUri] = await umi.uploader.upload([file]);
    console.log("Your image URI: ", myUri);
    //  npm run nft:image             
    // https://gateway.irys.xyz/8U57szopPBqohgZxVmRi5XbEzb1C3ngGwp4BNWh9anRz
  } catch (error) {
    console.log(error);
  }
})();
