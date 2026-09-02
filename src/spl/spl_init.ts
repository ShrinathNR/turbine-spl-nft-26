import {
  appendTransactionMessageInstructions,
  assertIsTransactionMessageWithBlockhashLifetime,
  assertIsTransactionWithBlockhashLifetime,
  createKeyPairSignerFromBytes,
  createSolanaRpc,
  createSolanaRpcSubscriptions,
  createTransactionMessage,
  generateKeyPairSigner,
  getSignatureFromTransaction,
  sendAndConfirmTransactionFactory,
  setTransactionMessageFeePayerSigner,
  setTransactionMessageLifetimeUsingBlockhash,
  signTransactionMessageWithSigners,
} from "@solana/kit";
import {
  getInitializeMintInstruction,
  getMintSize,
  TOKEN_PROGRAM_ADDRESS,
} from "@solana-program/token";
import { getCreateAccountInstruction } from "@solana-program/system";

//import your wallet
import wallet from "../../devnet-wallet.json";

const rpc = createSolanaRpc("https://api.devnet.solana.com");

const rpcSubscriptions = createSolanaRpcSubscriptions(
  "wss://api.devnet.solana.com",
);

(async () => {
  try {
    // Load your wallet
    const signer = await createKeyPairSignerFromBytes(new Uint8Array(wallet));

    // Create a new mint wallet -> Creates a brand-new keypair for the token mint
    const mint = await generateKeyPairSigner();
    // H7JaSY4pYAP62B7CUYXK32iLVyVV8r7i8fRrGNxmvn4Z got this after running this file

    // Find how much space the mint needs
    const space = BigInt(getMintSize());

    // Calculate rent
    const rent = await rpc.getMinimumBalanceForRentExemption(space).send();

    const { value: latestBlockHash } = await rpc.getLatestBlockhash().send();

    // Creates a helper that will:  send transaction & wait for confirmation
    const sendAndConfirm = sendAndConfirmTransactionFactory({
      rpc,
      rpcSubscriptions,
    });

    // Create an empty transaction message
    const msg = createTransactionMessage({ version: 0 });

    // Set who pays the transaction fee
    const msgWithPayer = setTransactionMessageFeePayerSigner(signer, msg);

    // Give the transaction a lifetime
    const messageWithLifetime = setTransactionMessageLifetimeUsingBlockhash(
      latestBlockHash,
      msgWithPayer,
    );

    const txMessage = appendTransactionMessageInstructions(
      [
        // Add instructions to create the mint account 
        // This tells Solana: Create an account for my new mint.
        getCreateAccountInstruction({
          payer: signer,
          newAccount: mint,
          lamports: rent,
          space,
          programAddress: TOKEN_PROGRAM_ADDRESS,
        }),

        // Add instruction to initialize the mint
        // we tell the Token Program what this mint should look like
        // decimals 3 -> smallest holdable amount is 0.001 mars
        getInitializeMintInstruction({
          mint: mint.address,
          decimals: 3,
          mintAuthority: signer.address,
        }),
      ],
      messageWithLifetime,
    );

    // Sign the transaction -> I approve this transaction.
    const signedTx = await signTransactionMessageWithSigners(txMessage);

    // Get the transaction signature
    assertIsTransactionWithBlockhashLifetime(signedTx);

    const signature = getSignatureFromTransaction(signedTx);

    // send and confirm the transaction
    await sendAndConfirm(signedTx, { commitment: "confirmed" });

    console.log(`mint address -> ${mint.address} signature -> ${signature}`);
  } catch (error) {
    console.log(error);
  }
})();

// mars image uri   :  https://gateway.irys.xyz/75AecdWyeD8T5Tt1KSV4awSd5HEHFapb2fehVtYpnbv3
// mars metadata uri:  https://gateway.irys.xyz/2SbuG5yD4Vh5yx3C2b4gb3h3XgciGerJzCTWUi73FYQA