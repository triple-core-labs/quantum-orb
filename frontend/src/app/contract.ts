import { Store } from '@ngxs/store';
import { SetAddress } from './store/app/app.actions';
import { MetaMaskInpageProvider } from '@metamask/providers';

declare global {
  interface Window {
    ethereum: MetaMaskInpageProvider;
  }
}

export async function setAddress(store: Store) {
  await window.ethereum
    .request({ method: 'eth_accounts' })
    .then((address: any) => {
      if (address.length == 0) return;
      store.dispatch(new SetAddress(address.at(0)));
    });
}

export async function getAccount(store: Store) {
  return await window.ethereum
    .request({ method: 'eth_requestAccounts' })
    .then((accounts: any) => {
      store.dispatch(new SetAddress(accounts.at(0)));
      switchChain();
    })
    .catch((err) => {
      if (err.code === 4001) {
        console.log('Please connect to MetaMask.');
      } else if (err.code == 4902) {
        return;
      } else {
        console.log(err);
      }
    });
}

export async function switchChain() {
  return await window.ethereum
    .request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0xa0c71fd' }],
    })
    .catch((err) => {
      if (err.code == 4902) {
        addChain();
      }
    });
}

export async function addChain() {
  await window.ethereum
    .request({
      method: 'wallet_addEthereumChain',
      params: [
        {
          chainId: '0xa0c71fd',
          blockExplorerUrls: ['https://routescan.io'],
          rpcUrls: ['https://sepolia.blast.io'],
          chainName: 'Blast Sepolia',
          nativeCurrency: {
            decimals: 18,
            name: 'ETH',
            symbol: 'ETH',
          },
        },
      ],
    })
    .then(() => switchChain());
}
