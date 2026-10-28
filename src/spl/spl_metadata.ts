import {
  createSignerFromKeypair,
  publicKey,
  signerIdentity,
} from "@metaplex-foundation/umi";
import wallet from "../../devnet-wallet.json";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  createMetadataAccountV3,
  CreateMetadataAccountV3InstructionAccounts,
  CreateMetadataAccountV3InstructionArgs,
  DataV2Args,
} from "@metaplex-foundation/mpl-token-metadata";
import bs58 from "bs58";

//use the mint address got from spl initialization token creation
const mint = publicKey("Aiqd5GiotXTVnv4hu4c1xxusAt74F8X2ug4XZKZ9D6Xp");

const umi = createUmi("https://api.devnet.solana.com");

const keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const signer = createSignerFromKeypair(umi, keypair);

umi.use(signerIdentity(signer));

(async () => {
  try {
    const accounts: CreateMetadataAccountV3InstructionAccounts = {
      mint,
      mintAuthority: signer,
    };

    //change the metadata
    const data: DataV2Args = {
      name: "My Love of my Life",
      symbol: "LOVE",
      uri: "https://arweave.net/123456",
      sellerFeeBasisPoints: 1, // 1% royalty fee
      creators: null,
      collection: null,
      uses: null,
    }

    const args: CreateMetadataAccountV3InstructionArgs = {
      data,
      isMutable: true,
      collectionDetails: null,
    }

    const tx = createMetadataAccountV3(umi, {
      ...accounts,
      ...args,
    });

    const result = await tx.sendAndConfirm(umi);
    console.log("signature: ", bs58.encode(Buffer.from(result.signature)));

  } catch (error) {
    console.log("error", error);
  }
})();

//43ttSnN9qaVi8TDcWwBZo5mUbfKDXY8d1N7exdJojJxV7qjKuwXoEh7qASXbFU4QFrAEFzZvcmWpRch434hSVNLN
