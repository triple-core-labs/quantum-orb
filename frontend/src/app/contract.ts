import { Store } from '@ngxs/store';
import {
  OpenDailyOrb,
  OpenGenesisOrb,
  OpenQuantumOrb,
  SetAddress,
  SetContract,
} from './store/app/app.actions';
import { Contract, ethers } from 'ethers';
import contractABI from '../abi.json';
declare global {
  interface Window {
    ethereum: any;
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
    .catch((err: any) => {
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
    .catch((err: any) => {
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

export async function setContract(store: Store) {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  store.dispatch(
    new SetContract(
      new Contract(
        '0x9c94e5D2F4024F74B591d806A7C7D64abB901f0c',
        contractABI.abi,
        signer
      )
    )
  );
}

export async function openDailyOrb(store: Store) {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  store.dispatch(new OpenDailyOrb(signer));
}

export async function openGenesisOrb(store: Store) {
  store.dispatch(new OpenGenesisOrb());
}

export async function openQuantumOrb(store: Store) {
  store.dispatch(new OpenQuantumOrb());
}
