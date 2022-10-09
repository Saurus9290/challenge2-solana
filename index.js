// Import Solana web3 functinalities
const {
    Connection,
    PublicKey,
    clusterApiUrl,
    Keypair,
    LAMPORTS_PER_SOL,
    Transaction,
    SystemProgram,
    sendAndConfirmTransaction,
  } = require('@solana/web3.js');
  
  const DEMO_FROM_SECRET_KEY = new Uint8Array([
    62, 212,  60, 249, 107, 209, 133, 127, 143, 130, 183,
    99,  80,  27, 241,  40, 247, 181,  64, 178,  45,  80,
    248, 134, 129, 136,  52,  73,  97, 177, 125, 231,  75,
     67, 147, 130,  20, 205, 244, 174,  13, 195, 154,  42,
    252,  14,  51,  30,  89,  58, 102, 149, 197, 101,  36,
    209, 175, 186,  12, 167, 118,  55, 216, 134
  ]);
  
  const getWalletBalanceInLamportsWithPublicKey = async (publicKey) => {
    try {
      const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
  
      const walletBalance = await connection.getBalance(new PublicKey(publicKey));
      return parseInt(walletBalance);
    } catch (err) {
      console.log(err);
    }
  };
  
  const displayWalletBalance = async (walletName, publicKey) => {
    const walletBalanceInLamports = await getWalletBalanceInLamportsWithPublicKey(
      publicKey
    );
    const walletBalanceInSol = walletBalanceInLamports / LAMPORTS_PER_SOL;
    console.log(`${walletName} Wallet Balance: ${walletBalanceInSol} SOL`);
  };
  
  const transferSol = async () => {
    const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
  
    const from = Keypair.fromSecretKey(DEMO_FROM_SECRET_KEY);
    const to = Keypair.generate();
  
    await displayWalletBalance('Sender', from.publicKey);
    await displayWalletBalance('Receiver', to.publicKey);
  
    console.log('Airdopping 2 SOL to Sender wallet');
    const fromAirDropSignature = await connection.requestAirdrop(
      new PublicKey(from.publicKey),
      2 * LAMPORTS_PER_SOL
    );
  
    const latestBlockHash = await connection.getLatestBlockhash();
  
    await connection.confirmTransaction({
      blockhash: latestBlockHash.blockhash,
      lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
      signature: fromAirDropSignature,
    });
  
    console.log('Airdrop successful');
  
    await displayWalletBalance('Sender', from.publicKey);
    await displayWalletBalance('Receiver', to.publicKey);
  
    console.log('Sending 50% of Sender wallet balance to Receiver wallet');
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: from.publicKey,
        toPubkey: to.publicKey,
        lamports:
          (await getWalletBalanceInLamportsWithPublicKey(from.publicKey)) / 2,
      })
    );
  
    const signature = await sendAndConfirmTransaction(connection, transaction, [
      from,
    ]);
    console.log('Transaction successful');
    console.log('Transaction signature is', signature);
  
    await displayWalletBalance('Sender', from.publicKey);
    await displayWalletBalance('Receiver', to.publicKey);
  };
  
  transferSol();