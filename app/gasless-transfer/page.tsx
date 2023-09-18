"use client";
import { NEXT_PUBLIC_TW_PUBLIC_CLIENT_ID } from "@/const";
import { _checkIsContractAddress } from "@/utils/checkIsContractAddress";
import { allChains } from "@thirdweb-dev/chains";
import {
  ConnectWallet,
  SmartContract,
  ThirdwebNftMedia,
  ThirdwebProvider,
  isExtensionEnabled,
  useAddress,
  useContract,
  useOwnedNFTs,
  useSDK,
  useTokenBalance,
} from "@thirdweb-dev/react";
import { BaseContract, utils } from "ethers";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";

type TActiveChain = (typeof allChains)[number] | undefined;
export default function Page() {
  const [activeChain, setActiveChain] = useState<TActiveChain>();
  const [ozRelayUrl, setOzRelayUrl] = useState<string>("");
  const gasless = ozRelayUrl
    ? {
        openzeppelin: {
          relayerUrl: ozRelayUrl, // your OZ Defender relayer URL
        },
      }
    : undefined;
  return (
    <ThirdwebProvider
      clientId={NEXT_PUBLIC_TW_PUBLIC_CLIENT_ID}
      activeChain={activeChain}
      sdkOptions={{
        gasless,
      }}
    >
      <Content
        activeChain={activeChain}
        setActiveChain={setActiveChain}
        ozRelayUrl={ozRelayUrl}
        setOzRelayUrl={setOzRelayUrl}
      />
    </ThirdwebProvider>
  );
}
// https://api.defender.openzeppelin.com/autotasks/...

const transferContractAddresses: Array<{
  slug: (typeof allChains)[number]["slug"];
  contractAddress: string;
}> = [
  {
    slug: "avalanche-fuji",
    contractAddress: "0x0382D6D46e330eB6863071ceB35d7c5Cd178d89C",
  },
  {
    slug: "ethereum",
    contractAddress: "0x0382D6D46e330eB6863071ceB35d7c5Cd178d89C",
  },
  {
    slug: "polygon",
    contractAddress: "0x0382D6D46e330eB6863071ceB35d7c5Cd178d89C",
  },
];

const Content = ({
  activeChain,
  setActiveChain,
  ozRelayUrl,
  setOzRelayUrl,
}: {
  activeChain: TActiveChain;
  setActiveChain: Dispatch<SetStateAction<TActiveChain>>;
  ozRelayUrl: string;
  setOzRelayUrl: Dispatch<SetStateAction<string>>;
}) => {
  const [chainSearch, setChainSearch] = useState<string>("");
  const isChainSupported = transferContractAddresses.find(
    (item) => item.slug === activeChain?.slug
  );
  const _setChain = () => {
    const item = allChains.find((o) => o.slug === chainSearch);
    if (!item) return alert("Chain not supported: " + chainSearch);
    setActiveChain(item);
  };
  return (
    <>
      <div className="text-3xl font-bold w-[92vw] lg:w-[500px] mx-auto p-2">
        Gasless Token Transfer
      </div>
      <div className="mx-auto mt-4 p-2 w-[92vw] lg:w-[500px] border border-gray-400">
        Use this tool to transfer the NFTs & ERC20 tokens in your wallet in a
        gasless manner using OpenZeppelin Defender&apos;s relayer. Useful when
        your wallet is drained and the thieves took all the funds but leave some
        NFTs/tokens behind
        <details className="mt-6">
          <summary>Disclaimer</summary>
          <div>
            <div>
              - This tool is made possible thanks to thirdweb&apos;s gasless
              extension
            </div>
            <div>
              - This does NOT support every single EVM blockchain out there.
            </div>
          </div>
        </details>
      </div>
      <Separator />
      <div className="flex flex-col justify-center p-2 w-[92vw] lg:w-[500px] mx-auto border border-gray-400 gap-4">
        <span>
          <b className="text-warning">Step 1</b>: Connect the wallet which has
          the tokens that you want to transfer
        </span>
        <div className="mx-auto">
          <ConnectWallet />
        </div>
      </div>
      <Separator />
      <div className="flex flex-col gap-4 mx-auto w-[92vw] lg:w-[500px] border border-gray-400 p-2">
        <span>
          <b>Step 2:</b> Select network
        </span>
        <input
          type="text"
          list="network-list"
          placeholder="ex: ethereum"
          className="px-4 py-2 text-black"
          onChange={(e) => setChainSearch(e.target.value)}
        />
        <button
          className="border rounded-full px-4 py-1 w-fit mx-auto disabled:cursor-not-allowed disabled:text-gray-400"
          disabled={chainSearch === activeChain?.slug}
          onClick={_setChain}
        >
          {chainSearch === activeChain?.slug ? "Applied" : "Apply"}
        </button>
        <datalist id="network-list">
          {transferContractAddresses.map((item) => (
            <option key={item.slug} value={item.slug}>
              {item.slug}
            </option>
          ))}
        </datalist>
      </div>
      <Separator />
      {isChainSupported ? (
        <ComponentForSupportedChain
          transferContractAddress={isChainSupported.contractAddress}
          ozRelayUrl={ozRelayUrl}
          setOzRelayUrl={setOzRelayUrl}
        />
      ) : (
        <div className="mx-auto flex flex-col w-[92vw] lg:w-[500px] gap-4 border border-gray-400 p-2">
          {activeChain ? (
            "Sorry, this chain is not supported"
          ) : (
            <>
              <div>Please select a supported network from the list below</div>
              {transferContractAddresses.map((item) => (
                <div key={item.slug}>- {item.slug}</div>
              ))}
            </>
          )}
        </div>
      )}
    </>
  );
};

const ComponentForSupportedChain = ({
  transferContractAddress,
  ozRelayUrl,
  setOzRelayUrl,
}: {
  transferContractAddress: string;
  ozRelayUrl: string;
  setOzRelayUrl: Dispatch<SetStateAction<string>>;
}) => {
  const address = useAddress();
  const sdk = useSDK();
  const contractAddressRef = useRef<HTMLInputElement>(null);
  const [loadedContract, setLoadedContract] =
    useState<SmartContract<BaseContract>>();
  const isERC20 = loadedContract
    ? isExtensionEnabled(loadedContract.abi, "ERC20")
    : false;
  const isERC721 = loadedContract
    ? isExtensionEnabled(loadedContract.abi, "ERC721")
    : false;
  const isERC1155 = loadedContract
    ? isExtensionEnabled(loadedContract.abi, "ERC1155")
    : false;
  const { contract: transferContract, isLoading } = useContract(
    transferContractAddress
  );
  const _loadContract = async () => {
    if (!sdk) return alert("missing sdk");
    const contractAddress = contractAddressRef.current?.value;
    if (!contractAddress) return alert("missing contractAddressRef");
    // const res = await _checkIsContractAddress(contractAddress, sdk);
    // if (!res.passed) return alert(res.message);
    const contract = await sdk.getContract(contractAddress);
    console.log(contract);
    if (!contract) return alert("Contract failed to load");
    setLoadedContract(contract);
  };
  return (
    <>
      <div className="mx-auto flex flex-col w-[92vw] lg:w-[500px] gap-4 border border-gray-400 p-2">
        <span>
          <b>Step 3:</b> Enter OZ Autotask URL
        </span>
        <span className="text-sm">
          Make sure the Autotask URL belong to the network that you are
          targeting. This is mandatory if you want to use the Gasless feature,
          otherwise optional. Also make sure the relayer has enough funds to
          cover the gas fees. Click{" "}
          <a
            className="underline"
            href="https://blog.thirdweb.com/guides/setup-gasless-transactions/"
          >
            here
          </a>{" "}
          to learn how to setup
        </span>
        <input
          type="text"
          placeholder="https://api.defender.openzeppelin.com/autotasks/..."
          className="px-4 py-2 text-black"
        />
      </div>
      <Separator />
      <div className="mx-auto flex flex-col w-[92vw] lg:w-[500px] gap-4 border border-gray-400 p-2">
        <span>
          <b>Step 4:</b> Enter the token contract address that you want to
          transfer
        </span>
        <input
          type="text"
          placeholder="0x..."
          className="px-4 py-2 text-black"
          ref={contractAddressRef}
        />
        <button
          className="border rounded-full px-4 py-1 w-fit mx-auto"
          onClick={_loadContract}
        >
          Search
        </button>
      </div>
      {loadedContract && transferContract && (
        <>
          <Separator />
          {address ? (
            <div className="mx-auto flex flex-col w-[92vw] lg:w-[500px] gap-4 border border-gray-400 p-2">
              {isERC721 && (
                <Erc721Container
                  address={address}
                  nftContract={loadedContract}
                  transferContract={transferContract}
                />
              )}
              {isERC1155 && <Erc1155Container />}
              {isERC20 && (
                <Erc20Container
                  address={address}
                  tokenContract={loadedContract}
                  transferContract={transferContract}
                />
              )}
            </div>
          ) : (
            <div className="mx-auto flex flex-col w-[92vw] lg:w-[500px] gap-4 border border-gray-400 p-2">
              Connect your wallet
            </div>
          )}
        </>
      )}
    </>
  );
};

const Separator = () => {
  return (
    <div className="flex">
      <svg
        viewBox="0 0 50 50"
        enableBackground="new 0 0 50 50"
        className="mx-auto h-[25px] w-auto"
      >
        <path
          d="m33.707 39.707-1.414-1.414L26 44.586V1h-2v43.586l-6.293-6.293-1.414 1.414L25 48.414z"
          fill="#ffffff"
        ></path>
      </svg>
    </div>
  );
};

const nftTransferModes = ["Transfer ALL", "Select token to send"];

const Erc721Container = ({
  address,
  nftContract,
  transferContract,
}: {
  address: string;
  nftContract: SmartContract<BaseContract>;
  transferContract: SmartContract<BaseContract>;
}) => {
  const { data: nfts, isLoading } = useOwnedNFTs(nftContract, address);
  const [transferMode, setTransferMode] =
    useState<(typeof nftTransferModes)[number]>("Transfer ALL");
  const [qtyToSend, setQtyToSend] = useState<number>(50);
  const recipientRef = useRef<HTMLInputElement>(null);

  const [selectedTokenIds, setSelectedTokenIds] = useState<number[]>([]);
  if (isLoading) return <div>Loading NFTs ...</div>;
  const transferContractAddress = transferContract.getAddress();
  const _transferERC721 = async (_tokenIds: number[]) => {
    const _recipient = recipientRef.current?.value;
    if (!_recipient) return alert("Please enter recipient");
    // const res = _checkIsContractAddress(recipient, sdk);
    try {
      const isApproved = await nftContract.erc721.isApproved(
        address,
        transferContract.getAddress()
      );
      if (!isApproved) {
        await nftContract.erc721.setApprovalForAll(
          transferContractAddress,
          true
        );
      } else console.log("contract is approved to send nfts");
      const tx = await transferContract.call("transferERC721", [
        nftContract.getAddress(),
        address,
        _recipient,
        _tokenIds,
      ]);
      console.log(tx);
    } catch (err) {
      const reason = (err as any).reason;
      console.log(reason);
      alert(reason);
    }
  };
  const toggleSelectedTokenIds = (_id: number) => {
    let _arr = selectedTokenIds;
    if (_arr.includes(_id)) _arr = _arr.filter((o) => o !== _id);
    else {
      if (_arr.length === qtyToSend)
        return alert("Number of token to send exceeded " + qtyToSend);
      _arr.push(_id);
    }
    setSelectedTokenIds([..._arr]);
  };

  const tokenSelected = (_id: number) => {
    return selectedTokenIds.includes(_id);
  };
  return (
    <>
      {nfts && nfts.length ? (
        <>
          <div className="text-center">
            <span className="font-bold">
              ERC721 contract found! You own {nfts.length} items in this
              collection
            </span>
            <div className="text-xs text-center">
              Keep in mind that due to block space limit of the selected chain,
              the amount of NFT you can send in one transaction may vary. Tweak
              the number below to set the quantity you wanna transfer in 1 go
            </div>
          </div>
          <div className="flex flex-row justify-center gap-3">
            Max quantity to send:{" "}
            <input
              type="number"
              min={0}
              className="max-w-[70px] text-black px-2"
              defaultValue={qtyToSend}
              onChange={(e) => setQtyToSend(Number(e.target.value))}
            />
          </div>
          <div className="flex flex-row justify-center gap-3">
            {nftTransferModes.map((item) => (
              <button
                key={item}
                onClick={() => {
                  setTransferMode(item);
                  setSelectedTokenIds([]);
                }}
                className={`border px-4 py-1 ${
                  item === transferMode ? "text-black bg-white font-bold" : ""
                }`}
              >
                {item}
              </button>
            ))}
          </div>
          <div className="flex flex-col">
            <span>Enter recipient address</span>
            <input
              type="text"
              placeholder="0x..."
              className="px-4 py-2 text-black"
              ref={recipientRef}
            />
          </div>
          {transferMode === "Transfer ALL" ? (
            <button
              className="border-2 border-green-500 w-[150px] mx-auto mt-3 rounded-full py-2 hover:bg-green-500 hover:text-black hover:font-bold"
              onClick={async () => {
                const nftsToSend =
                  nfts.length <= qtyToSend ? nfts : nfts.slice(0, qtyToSend);
                const _tokenIds = nftsToSend.map((item) =>
                  Number(item.metadata.id)
                );
                _transferERC721(_tokenIds);
              }}
            >
              Transfer (
              {nfts.length <= qtyToSend
                ? nfts.length
                : nfts.slice(0, qtyToSend).length}
              )
            </button>
          ) : (
            <>
              <div className="flex flex-row flex-wrap gap-2 justify-center">
                {nfts.map((item) => {
                  const _id = Number(item.metadata.id);
                  return (
                    <div
                      key={_id}
                      onClick={() => toggleSelectedTokenIds(_id)}
                      style={{
                        borderColor: tokenSelected(_id) ? "orange" : "",
                      }}
                      className="p-1 w-[100px] cursor-pointer border-2 border-transparent hover:border-orange-500 flex flex-col gap-1"
                    >
                      <ThirdwebNftMedia
                        metadata={item.metadata}
                        width="90"
                        height="90"
                        requireInteraction={true}
                      />
                      <div>ID: {_id}</div>
                    </div>
                  );
                })}
              </div>
              {selectedTokenIds.length > 0 ? (
                <button
                  className="border-2 border-green-500 w-[150px] mx-auto mt-3 rounded-full py-2 hover:bg-green-500 hover:text-black hover:font-bold"
                  onClick={async () => _transferERC721(selectedTokenIds)}
                >
                  Transfer ({selectedTokenIds.length})
                </button>
              ) : (
                <div className="text-center">
                  Select at least a token to transfer
                </div>
              )}
            </>
          )}
        </>
      ) : (
        <>You do not own any NFTs in this collection</>
      )}
    </>
  );
};

const Erc20Container = ({
  address,
  tokenContract,
  transferContract,
}: {
  address: string;
  tokenContract: SmartContract<BaseContract>;
  transferContract: SmartContract<BaseContract>;
}) => {
  const tokenContractAddress = tokenContract.getAddress();
  const transferContractAddress = transferContract.getAddress();
  const { data: availableBalance, isLoading } = useTokenBalance(
    tokenContract,
    address
  );
  const [qtyToSend, setQtyToSend] = useState<string>("0");
  const recipientRef = useRef<HTMLInputElement>(null);
  const qtyToSendRef = useRef<HTMLInputElement>(null);
  if (isLoading) return <div>Loading data ...</div>;

  const _transferTokens = async () => {
    if (!availableBalance) return alert("missing availableBalance");
    const _recipient = recipientRef.current?.value;
    if (!_recipient) return alert("Please enter recipient");
    const _amount = qtyToSendRef.current?.value;
    if (!_amount || _amount === "0")
      return alert("Please enter an amount to send");
    // const res = _checkIsContractAddress(recipient, sdk);
    const _amountToSend = Number(_amount);
    try {
      const allowance = await tokenContract.erc20.allowanceOf(
        address,
        transferContractAddress
      );
      console.log({ allowance });
      if (Number(allowance.displayValue) < _amountToSend) {
        await tokenContract.erc20.setAllowance(
          transferContractAddress,
          _amountToSend
        );
      } else {
        console.log("allowance suffices");
      }
      const tx = await transferContract.call("transferFromERC20", [
        tokenContractAddress,
        address,
        _recipient,
        utils.parseUnits(_amountToSend.toString(), availableBalance.decimals),
      ]);
      console.log(tx);
    } catch (err) {
      const reason = (err as any).reason;
      console.log(reason);
      alert(reason);
    }
  };
  return (
    <>
      <div className="text-center">
        <span className="font-bold">
          ERC20 contract found! You own {availableBalance?.displayValue} tokens.
        </span>
      </div>

      <div className="flex flex-col">
        <span>Enter recipient address</span>
        <input
          type="text"
          placeholder="0x..."
          className="px-4 py-2 text-black"
          ref={recipientRef}
        />
      </div>

      <div className="flex flex-col">
        <div className="flex flex-row justify-between px-2">
          <span>Amount to send</span>
          <button
            className="font-bold"
            onClick={() => {
              if (!availableBalance) return alert("missing availableBalance");
              setQtyToSend(availableBalance?.value.toString());
              const input = document.getElementById(
                "__qtyToSend"
              ) as HTMLInputElement;
              if (input) input.value = availableBalance.displayValue;
            }}
          >
            Max
          </button>
        </div>
        <input
          id="__qtyToSend"
          type="text"
          placeholder="100"
          className="px-4 py-2 text-black"
          ref={qtyToSendRef}
          defaultValue={qtyToSend}
        />
      </div>

      <button
        onClick={_transferTokens}
        className="border-2 border-green-500 w-[150px] mx-auto mt-3 rounded-full py-2 hover:bg-green-500 hover:text-black hover:font-bold"
      >
        Transfer
      </button>
    </>
  );
};

const Erc1155Container = () => {
  return <>This contract is ERC1155. This feature is in the work</>;
};
