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
    // got this link from this command -> npm run nft:image
    const image =
      "https://gateway.irys.xyz/8U57szopPBqohgZxVmRi5XbEzb1C3ngGwp4BNWh9anRz";

    //json scheme : https://www.metaplex.com/docs/smart-contracts/core/json-schema
    //change the metadata
    const metadata = {
      name: "VSHL01",
      symbol: "V01",
      description: "A rug from the Turbin3 Q3 2026 cohort.",
      image,
      attributes: [
        { trait_type: "Cohort", value: "Q3 2026" },
        { trait_type: "Rarity", value: "Common" },
      ],
      properties: {
        files: [
          {
            type: "image/png",
            uri: image,
          },
        ],
        category: "image",
      },
    };

    const myUri = await umi.uploader.uploadJson(metadata);
    console.log(`metadata uri: ${myUri} `);
  } catch (error) {
    console.log("error", error);
  }
})();
