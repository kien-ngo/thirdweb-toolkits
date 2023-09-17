"use client";

import { NEXT_PUBLIC_TW_PUBLIC_CLIENT_ID } from "@/const";
import { _checkIsContractAddress } from "@/utils/checkIsContractAddress";
import { ThirdwebProvider, useSDK } from "@thirdweb-dev/react";
import { useRef } from "react";

export default function Page() {
  return (
    <ThirdwebProvider clientId={NEXT_PUBLIC_TW_PUBLIC_CLIENT_ID}>
      <Content />
    </ThirdwebProvider>
  );
}

const Content = () => {
  const ref = useRef<HTMLInputElement>(null);
  const sdk = useSDK();

  const check = async () => {
    if (!sdk) return;
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
