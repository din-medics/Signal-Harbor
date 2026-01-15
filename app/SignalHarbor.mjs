import CoinbaseWalletSDK from "@coinbase/wallet-sdk";
import { createPublicClient, createWalletClient, custom, http } from "viem";
import { baseSepolia } from "viem/chains";
import axios from "axios";

const NETWORK = {
  name: "Base Sepolia",
  chainId: 84532,
  rpcUrl: "https://sepolia.base.org",
  explorer: "https://sepolia.basescan.org",
};

const addressUrl = (a) => `${NETWORK.explorer}/address/${a}`;
const blockUrl = (b) => `${NETWORK.explorer}/block/${b}`;

async function rpcIdentity() {
  const payload = { jsonrpc: "2.0", id: 1, method: "eth_chainId", params: [] };
  const res = await axios.post(NETWORK.rpcUrl, payload, { timeout: 8000 });
  return res?.data?.result ?? null;
}

export async function run() {
  console.log("Built for Base");
  console.log(`network: ${NETWORK.name}`);
  console.log(`chainId (decimal): ${NETWORK.chainId}`);
  console.log(`explorer: ${NETWORK.explorer}`);
  console.log("");

  console.log("rpc identity:");
  try {
    console.log(`- eth_chainId: ${await rpcIdentity()}`);
  } catch {
    console.log("- rpc unreachable");
  }
  console.log("");

  const sdk = new CoinbaseWalletSDK({ appName: "Signal Harbor" });
  const provider = sdk.makeWeb3Provider(NETWORK.rpcUrl, NETWORK.chainId);

  const walletClient = createWalletClient({
    chain: baseSepolia,
    transport: custom(provider),
  });

  const publicClient = createPublicClient({
    chain: baseSepolia,
    transport: http(NETWORK.rpcUrl),
  });

  let addresses = [];
  try {
    addresses = await walletClient.getAddresses();
  } catch {}

  if (addresses.length) {
    console.log("wallet visibility:");
    for (const a of addresses) {
      const bal = await publicClient.getBalance({ address: a });
      console.log(`- ${a}`);
      console.log(`  ${addressUrl(a)}`);
      console.log(`  balance: ${bal.toString()}`);
    }
    console.log("");
  }

  const latest = await publicClient.getBlockNumber();
  const block = await publicClient.getBlock({ blockNumber: latest });
  const gas = await publicClient.getGasPrice();

  console.log("chain snapshot:");
  console.log(`- latest block: ${latest.toString()}`);
  console.log(`  ${blockUrl(latest.toString())}`);
  console.log(`- timestamp: ${new Date(Number(block.timestamp) * 1000).toISOString()}`);
  console.log(`- gas price: ${gas.toString()}`);
}

run().catch(console.error);
