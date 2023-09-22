"use client";

import { useEffect, useState } from "react";

export default function Page() {
  const [data, setData] = useState<Item[]>([]);
  useEffect(() => {
    const _fetchGasInfo = async () => {
      const rawText = await fetch(
        "https://raw.githubusercontent.com/thirdweb-dev/contracts/main/gasreport.txt"
      ).then((r) => r.text());
      let _temp: Item[] = [];
      rawText.split("\n").forEach((line) => {
        const foundIndex = baseItems.findIndex((o) => line.includes(o.id));
        if (foundIndex < 0) return;
        const _gasStr = line.split(" ").at(-1)?.replace(")", "");
        if (!_gasStr) return;
        _temp.push({
          id: baseItems[foundIndex].id,
          label: baseItems[foundIndex].label,
          gas: Number(_gasStr),
        });
      });
      setData(_temp);
    };
    _fetchGasInfo();
  }, []);
  return (
    <>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </>
  );
}

type Item = { id: string; label: string; gas: number };
const baseItems: Array<Item> = [
  {
    id: "test_benchmark_editionStake_claimRewards",
    label: "",
    gas: -1,
  },
];
