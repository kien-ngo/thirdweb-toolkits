import { type ThirdwebSDK } from "@thirdweb-dev/sdk";
import { isAddress } from "ethers/lib/utils";

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
