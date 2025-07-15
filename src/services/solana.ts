import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
  createTransferInstruction,
} from "@solana/spl-token";

export type TokenInfo = {
  mint: string;
  amount: number;
  decimals: number;
};

const SOL_MINT = "So11111111111111111111111111111111111111112";
const SOLANA_RPC = import.meta.env.VITE_LAZORKIT_RPC_URL || "https://api.devnet.solana.com";

const connection = new Connection(SOLANA_RPC, "confirmed");

/**
 * Lấy số dư SOL của một publicKey
 */
export async function fetchBalance(publicKey: string): Promise<number> {
  try {
    const pubkey = new PublicKey(publicKey);
    const balanceLamports = await connection.getBalance(pubkey);
    return balanceLamports / LAMPORTS_PER_SOL;
  } catch (e) {
    console.error("fetchBalance error", e);
    return 0;
  }
}

/**
 * Lấy danh sách SPL token của một publicKey
 */
export async function fetchTokenList(publicKey: string): Promise<TokenInfo[]> {
  try {
    const pubkey = new PublicKey(publicKey);
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(pubkey, {
      programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA")
    });
    return tokenAccounts.value.map(({ account }) => {
      const info = account.data.parsed.info;
      return {
        mint: info.mint,
        amount: Number(info.tokenAmount.uiAmount),
        decimals: info.tokenAmount.decimals,
      };
    });
  } catch (e) {
    console.error("fetchTokenList error", e);
    return [];
  }
}

export interface BuildTransferParams {
  from: PublicKey;
  to: string;
  amount: number;
  mint: string;
}

/**
 * Build transaction chuyển SOL hoặc SPL token (chưa ký, chưa gửi)
 */
export async function buildTransferTransaction({ from, to, amount, mint }: BuildTransferParams): Promise<Transaction> {
  const transaction = new Transaction();
  const toPubkey = new PublicKey(to);

  if (mint === SOL_MINT) {
    // Native SOL transfer
    transaction.add(
      SystemProgram.transfer({
        fromPubkey: from,
        toPubkey,
        lamports: Math.round(amount * LAMPORTS_PER_SOL),
      })
    );
    return transaction;
  }

  // SPL Token transfer
  const mintPubkey = new PublicKey(mint);
  // Lấy decimals từ mint info
  const mintInfo = await connection.getParsedAccountInfo(mintPubkey);
  let decimals = 0;
  if (mintInfo.value && "data" in mintInfo.value) {
    const parsed = (mintInfo.value.data as unknown as { parsed?: { info?: { decimals?: number } } }).parsed;
    decimals = parsed?.info?.decimals ?? 0;
  }
  // Lấy associated token accounts
  const fromTokenAccount = await getAssociatedTokenAddress(mintPubkey, from);
  const toTokenAccount = await getAssociatedTokenAddress(mintPubkey, toPubkey);
  // Build transfer instruction
  transaction.add(
    createTransferInstruction(
      fromTokenAccount,
      toTokenAccount,
      from,
      BigInt(Math.round(amount * Math.pow(10, decimals)))
    )
  );
  return transaction;
} 
