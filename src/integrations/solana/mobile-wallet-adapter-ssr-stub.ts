import { WalletReadyState } from "@solana/wallet-adapter-base";

export const SolanaMobileWalletAdapterWalletName = "Mobile Wallet Adapter" as const;
export const SolanaMobileWalletAdapterRemoteWalletName = "Mobile Wallet Adapter Remote" as const;

export function createDefaultAddressSelector() {
  return {
    async select(addresses: string[]) {
      return addresses[0] ?? "";
    },
  };
}

export function createDefaultAuthorizationResultCache() {
  return {
    async clear() {},
    async get() {
      return undefined;
    },
    async set() {},
  };
}

export function createDefaultWalletNotFoundHandler() {
  return async () => {};
}

export class SolanaMobileWalletAdapter {
  readonly name = SolanaMobileWalletAdapterWalletName;
  readonly icon = "data:image/svg+xml;base64,";
  readonly url = "";
  readonly supportedTransactionVersions = new Set(["legacy", 0]);

  get publicKey() {
    return null;
  }

  get connected() {
    return false;
  }

  get connecting() {
    return false;
  }

  get readyState() {
    return WalletReadyState.Unsupported;
  }

  async autoConnect_DO_NOT_USE_OR_YOU_WILL_BE_FIRED() {}
  async autoConnect() {}
  async connect() {}
  async performAuthorization() {
    throw new Error("Mobile wallet adapter is unavailable during SSR.");
  }
  async disconnect() {}
  async signIn() {
    throw new Error("Mobile wallet adapter is unavailable during SSR.");
  }
  async signMessage() {
    throw new Error("Mobile wallet adapter is unavailable during SSR.");
  }
  async sendTransaction() {
    throw new Error("Mobile wallet adapter is unavailable during SSR.");
  }
  async signTransaction<T>(transaction: T) {
    return transaction;
  }
  async signAllTransactions<T>(transactions: T[]) {
    return transactions;
  }
}

export class LocalSolanaMobileWalletAdapter extends SolanaMobileWalletAdapter {}
export class RemoteSolanaMobileWalletAdapter extends SolanaMobileWalletAdapter {}