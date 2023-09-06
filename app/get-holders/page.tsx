"use client";

import { TW_PUBLIC_CLIENT_ID } from "@/const";
import { type Chain, allChains } from "@thirdweb-dev/chains";
import { ThirdwebProvider, useSDK } from "@thirdweb-dev/react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Dispatch, SetStateAction, useRef, useState } from "react";
import { _checkIsContractAddress } from "../validate-address/page";
import Link from "next/link";

export default function Page() {
  const searchParams = useSearchParams();
  const chainSlug = searchParams.get("chainSlug") ?? undefined;
  return (
    <ThirdwebProvider clientId={TW_PUBLIC_CLIENT_ID} activeChain={chainSlug}>
      <Content />
    </ThirdwebProvider>
  );
}

const Content = () => {
  const searchParams = useSearchParams();
  const _chainSlug = searchParams.get("chainSlug") ?? undefined;
  const _contractAddress = searchParams.get("contract") ?? undefined;
  const [chainSlug, setChainSlug] = useState<string | undefined>(_chainSlug);
  const [contractAddress, setContractAddress] = useState<string | undefined>(
    _contractAddress
  );
  const chainSlugRef = useRef<HTMLInputElement>(null);
  const contractRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const sdk = useSDK();
  async function load() {
    if (!sdk) return;
    const address = contractRef.current?.value;
    if (!address) return alert("Please enter an Ethereum address");
    const res = await _checkIsContractAddress(address, sdk);
    if (!res.passed) return alert(res.message);
    const chainSlugT = chainSlugRef.current?.value;
    if (!chainSlugT) return alert("Please enter the deploy network");
    if (!allChains.find((o) => o.slug === chainSlugT))
      return alert(
        `Invalid chain slug: [${chainSlugT}] OR chain slug not supported`
      );
    if (address === _contractAddress && chainSlugT === _chainSlug) {
      router.refresh();
    } else {
      router.push(`/get-holders?chainSlug=${chainSlug}&contract=${address}`);
    }
  }
  return (
    <>
      <div className="mx-auto text-center mb-4">
        Enter your NFT contract address and the network is was deployed on to
        get a list of all current holders
      </div>
      <div className="flex flex-row justify-center gap-4 mx-auto">
        <span className="my-auto">NFT Contract</span>
        <input
          type="text"
          placeholder="0x..."
          ref={contractRef}
          className="w-fit px-4 mx-auto min-w-[310px] text-black py-2"
          defaultValue={contractAddress ?? ""}
          disabled={Boolean(contractAddress)}
        />
      </div>
      <div className="flex flex-row justify-center gap-4 mx-auto mt-3">
        <span className="my-auto">Chain slug</span>
        <input
          type="text"
          list="network-list"
          ref={chainSlugRef}
          placeholder="ex: ethereum"
          className="px-4 py-2 text-black w-fit min-w-[310px]"
          defaultValue={chainSlug ?? ""}
          disabled={Boolean(chainSlug)}
        />
        <datalist id="network-list">
          {allChains.map((item) => (
            <option key={item.chainId} value={item.slug}>
              {item.name}
            </option>
          ))}
        </datalist>
      </div>
      {chainSlug && contractAddress ? (
        <div className="mx-auto flex flex-row gap-4 justify-center">
          <button className="border w-fit px-4 py-2 mx-auto mt-3">
            Get holders
          </button>
          <Link
            className="border border-red-500 w-fit px-4 py-2 mx-auto mt-3"
            href="/get-holders"
            onClick={() => router.refresh()}
          >
            Reset
          </Link>
        </div>
      ) : (
        <button className="border w-fit px-4 py-2 mx-auto mt-3" onClick={load}>
          Find contract
        </button>
      )}
    </>
  );
};
