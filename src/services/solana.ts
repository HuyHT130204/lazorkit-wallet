/* eslint-disable @typescript-eslint/no-unused-vars */
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js"
import {
  getAssociatedTokenAddress,
  createTransferInstruction,
  createAssociatedTokenAccountInstruction,
  getAccount,
} from "@solana/spl-token"

export type TokenInfo = {
  mint: string
  amount: number
  decimals: number
}

const SOL_MINT = "So11111111111111111111111111111111111111112"
const SOLANA_RPC = "https://api.devnet.solana.com"
const connection = new Connection(SOLANA_RPC, "confirmed")

/**
 * Fetch SOL balance for a public key
 */
export async function fetchBalance(publicKey: string): Promise<number> {
  try {
    const pubkey = new PublicKey(publicKey)
    const balanceLamports = await connection.getBalance(pubkey)
    const balance = balanceLamports / LAMPORTS_PER_SOL
    return balance
  } catch (e) {
    console.error("fetchBalance error:", e)
    return 0
  }
}

/**
 * Fetch SPL token list for a public key
 */
export async function fetchTokenList(publicKey: string): Promise<TokenInfo[]> {
  try {
    const pubkey = new PublicKey(publicKey)
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(pubkey, {
      programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
    })

    const tokens = tokenAccounts.value
      .map(({ account }) => {
        const info = account.data.parsed.info
        return {
          mint: info.mint,
          amount: Number(info.tokenAmount.uiAmount) || 0,
          decimals: info.tokenAmount.decimals,
        }
      })
      .filter((token) => token.amount > 0) // Only return tokens with balance

    return tokens
  } catch (e) {
    console.error("fetchTokenList error:", e)
    return []
  }
}

/**
 * Fetch transaction history for a public key
 */
export async function fetchTransactionHistory(publicKey: string, limit = 10) {
  try {
    const pubkey = new PublicKey(publicKey)
    // Lấy danh sách chữ ký giao dịch gần nhất
    const signatures = await connection.getSignaturesForAddress(pubkey, { limit })
    // Lấy chi tiết giao dịch cho mỗi chữ ký
    const transactions = await Promise.all(
      signatures.map(async (sig) => {
        const tx = await connection.getTransaction(sig.signature, { commitment: "confirmed" })
        return {
          signature: sig.signature,
          slot: sig.slot,
          err: sig.err,
          blockTime: sig.blockTime,
          memo: sig.memo,
          tx,
        }
      })
    )
    return transactions
  } catch (e) {
    console.error("fetchTransactionHistory error:", e)
    return []
  }
}

export interface BuildTransferParams {
  from: PublicKey
  to: string
  amount: number
  mint: string
}

/**
 * Build complete transfer transaction (ready to sign)
 */
export async function buildTransferTransaction({ from, to, amount, mint }: BuildTransferParams): Promise<Transaction> {
  const transaction = new Transaction()
  const toPubkey = new PublicKey(to)

  if (mint === SOL_MINT) {
    // Native SOL transfer
    transaction.add(
      SystemProgram.transfer({
        fromPubkey: from,
        toPubkey,
        lamports: Math.round(amount * LAMPORTS_PER_SOL),
      }),
    )
  } else {
    // SPL Token transfer
    const mintPubkey = new PublicKey(mint)

    // Get mint info to determine decimals
    const mintInfo = await connection.getParsedAccountInfo(mintPubkey)
    let decimals = 0
    if (mintInfo.value && "data" in mintInfo.value) {
      const parsed = (mintInfo.value.data as unknown as { parsed?: { info?: { decimals?: number } } }).parsed
      decimals = parsed?.info?.decimals ?? 0
    }

    // Get associated token accounts
    const fromTokenAccount = await getAssociatedTokenAddress(mintPubkey, from)
    const toTokenAccount = await getAssociatedTokenAddress(mintPubkey, toPubkey)

    // Check if recipient's token account exists
    try {
      await getAccount(connection, toTokenAccount)
    } catch (error) {
      // Create associated token account for recipient
      transaction.add(
        createAssociatedTokenAccountInstruction(
          from, // payer
          toTokenAccount, // associated token account
          toPubkey, // owner
          mintPubkey, // mint
        ),
      )
    }

    // Add transfer instruction
    const transferAmount = BigInt(Math.round(amount * Math.pow(10, decimals)))

    transaction.add(createTransferInstruction(fromTokenAccount, toTokenAccount, from, transferAmount))
  }

  // Set recent blockhash and fee payer (IMPORTANT for LazorKit)
  const { blockhash } = await connection.getLatestBlockhash()
  transaction.recentBlockhash = blockhash
  transaction.feePayer = from

  return transaction
}

/**
 * Request SOL airdrop from Devnet faucet
 */
export async function requestAirdrop(publicKey: string, amount = 1): Promise<string> {
  try {
    console.log("Requesting airdrop for:", publicKey, "Amount:", amount, "SOL")
    const pubkey = new PublicKey(publicKey)
    const signature = await connection.requestAirdrop(pubkey, amount * LAMPORTS_PER_SOL)
    console.log("Airdrop signature:", signature)

    // Wait for confirmation
    await connection.confirmTransaction(signature)
    return signature
  } catch (e) {
    console.error("Airdrop failed:", e)
    throw e
  }
<<<<<<< Updated upstream
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
<<<<<<< Updated upstream
=======
=======
}
>>>>>>> Stashed changes
>>>>>>> Stashed changes
