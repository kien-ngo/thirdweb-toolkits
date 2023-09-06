"use client";

import { useEffect, useState } from "react";

// export const dynamic = "force-dynamic";
// Due to Next's stupid caching strategy we need to move the fetch code to client side to avoid caching
export default function Page() {
  const packageNames = [
    "@thirdweb-dev/sdk",
    "@thirdweb-dev/auth",
    "@thirdweb-dev/storage",
    "@thirdweb-dev/wallets",
    "@thirdweb-dev/react",
    "@thirdweb-dev/chains",
    "@thirdweb-dev/react-core",
    "@thirdweb-dev/react-native",
    "@thirdweb-dev/react-native-compat",
    "@paperxyz/react-client-sdk",
  ];
  const [data, setData] = useState<Record<string, string>[]>([
    { isLoading: "true" },
  ]);

  useEffect(() => {
    const get = async () => {
      const requests = packageNames.map((pck) =>
        fetch(`https://registry.npmjs.org/${pck}/latest`).then((r) => r.json())
      );
      const responses = await Promise.all(requests);
      const _data = responses.map((item, index) => ({
        [packageNames[index]]: item.version ?? "n/a",
      }));
      setData(_data);
    };

    get();
  }, []);
  return (
    <>
      <div className="mx-auto text-center mt-8">
        Updated at: {new Date().toString()}
      </div>
      <pre className="mx-auto mt-8">{JSON.stringify(data, null, 2)}</pre>
    </>
  );
}
