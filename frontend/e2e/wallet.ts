import { Page } from "@playwright/test";
import { RPC_URL } from "./rpc";

export async function injectWallet(
  page: Page,
  address: string,
  rpcUrl = RPC_URL,
): Promise<void> {
  await page.addInitScript(
    ({ address, rpcUrl }) => {
      let id = 0;
      const listeners = new Map<string, Set<(payload: unknown) => void>>();

      const forward = async (method: string, params: unknown[]) => {
        const response = await fetch(rpcUrl, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ jsonrpc: "2.0", id: ++id, method, params }),
        });
        const body = await response.json();
        if (body.error)
          throw Object.assign(new Error(body.error.message), body.error);
        return body.result;
      };

      const provider = {
        isMetaMask: true,
        request: async ({
          method,
          params = [],
        }: {
          method: string;
          params?: unknown[];
        }) => {
          switch (method) {
            case "eth_requestAccounts":
              sessionStorage.setItem("e2e-wallet-connected", "yes");
              return [address];
            case "eth_accounts":
              return sessionStorage.getItem("e2e-wallet-connected")
                ? [address]
                : [];
            case "wallet_switchEthereumChain":
            case "wallet_addEthereumChain":
            case "wallet_revokePermissions":
              return null;
            default:
              return forward(method, params);
          }
        },
        on(event: string, handler: (payload: unknown) => void) {
          if (!listeners.has(event)) listeners.set(event, new Set());
          listeners.get(event)!.add(handler);
          return this;
        },
        removeListener(event: string, handler: (payload: unknown) => void) {
          listeners.get(event)?.delete(handler);
          return this;
        },
      };

      Object.defineProperty(window, "ethereum", {
        value: provider,
        configurable: true,
      });
    },
    { address, rpcUrl },
  );
}
