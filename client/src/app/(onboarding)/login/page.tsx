'use client';

import Button from '@/components/atoms/Button';
import Paragraph from '@/components/atoms/Paragraph';
import Title from '@/components/atoms/Title';
import WalletList from '@/components/wallet/WalletList';
import { useUtxoSync } from '@/hooks/useUtxoSync';
import { SignIn } from '@/lib/auth/login';
import { useWallet } from '@meshsdk/react';

const Login = () => {
  const { address } = useWallet();


  const handleSubmit = async () => {
    const formData = new FormData();
    formData.set('address', address);

    const result = await SignIn(formData);
    console.log(result);
  };


  return (
    <div className="flex h-full w-full flex-col gap-8 p-6 lg:p-24">
      <div className="flex flex-col items-center">
        <Title level="6">Connect Wallet</Title>
        <Paragraph size="sm">Use a supported Cardano wallet:</Paragraph>
      </div>


      <WalletList />

      <Button
        disabled={!address}
        variant="primary"
        className="w-full"
        onClick={handleSubmit}
      >
        Login
      </Button>
    </div>
  );
};

export default Login;
