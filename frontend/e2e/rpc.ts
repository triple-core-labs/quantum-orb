export const RPC_URL = process.env.E2E_RPC_URL ?? "http://127.0.0.1:8545";

let id = 0;

export async function rpc<T>(
  method: string,
  params: unknown[] = [],
): Promise<T> {
  const response = await fetch(RPC_URL, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: ++id, method, params }),
  });
  const body = await response.json();
  if (body.error) {
    throw new Error(`${method}: ${body.error.message}`);
  }
  return body.result as T;
}

export async function freshFundedAccount(): Promise<string> {
  const [funder] = await rpc<string[]>("eth_accounts");
  const address =
    "0x" +
    Array.from({ length: 40 }, () =>
      Math.floor(Math.random() * 16).toString(16),
    ).join("");

  await rpc("eth_sendTransaction", [
    { from: funder, to: address, value: "0xde0b6b3a7640000" },
  ]);
  await rpc("hardhat_impersonateAccount", [address]);

  return address;
}
