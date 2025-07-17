import { BrowserWallet, Wallet } from '@meshsdk/core';


export async function getAvailableWallets(): Promise<Wallet[]>{

    return await BrowserWallet.getAvailableWallets();
    
}


export async function enable(wallet: string): Promise<BrowserWallet>{

    return BrowserWallet.enable(wallet);

}
