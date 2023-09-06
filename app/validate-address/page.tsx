"use client";

import { TW_PUBLIC_CLIENT_ID } from "@/const";
import { ThirdwebProvider, ThirdwebSDK, useSDK } from "@thirdweb-dev/react";
import { isAddress } from "ethers/lib/utils";
import { useRef } from "react";

export default function Page() {
  return (
    <ThirdwebProvider clientId={TW_PUBLIC_CLIENT_ID}>
      <Content />
    </ThirdwebProvider>
  );
}

const Content = () => {
  const ref = useRef<HTMLInputElement>(null);
  const sdk = useSDK();
  if (!sdk) return;
  const check = async () => {
    const address = ref.current?.value;
    if (!address) return alert("Please enter an Ethereum address");
    const res = _checkIsContractAddress(address, sdk);
    alert((await res).message);
  };

  return (
    <>
      <div className="text-center mx-auto">
        This tool uses Ethers.js to check whether a given address is a contract
        address or a wallet address
      </div>
      <input
        ref={ref}
        type="text"
        placeholder="0x..."
        className="w-fit px-4 mx-auto min-w-[320px] mt-3 text-black py-2"
      />
      <button className="border w-fit px-4 mx-auto mt-3" onClick={check}>
        Check
      </button>
    </>
  );
};

export async function _checkIsContractAddress(
  address: string,
  sdk: ThirdwebSDK
): Promise<{ passed: boolean; message: string }> {
  const isValid = isAddress(address);
  if (!isValid)
    return {
      passed: false,
      message: "This is NOT a valid EVM wallet/contract address",
    };
  const byteCode = await sdk?.getProvider().getCode(address);
  if (byteCode === "0x")
    return {
      passed: false,
      message: "This is a valid user wallet address & NOT a contract address",
    };
  return {
    passed: true,
    message: "This is a contract address & NOT a user wallet address",
  };
}
