import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col m-auto text-2xl">
      {list.map((item) => (
        <Link
          key={item.url}
          href={item.url}
          className="mx-auto hover:text-indigo-500"
        >
          {item.title}
        </Link>
      ))}
    </div>
  );
}

const list = [
  {
    title: "Check for latest package versions",
    url: "/versions",
    tags: [],
    description: ''
  },
  {
    title: "Validate Ethereum address",
    url: "/validate-address",
    tags: [],
    description: ''
  },
  // {
  //   title: "Get all holders of your NFT collection",
  //   url: "/get-holders",
  //   tags: [],
  //   description: ''
  // },
  {
    title: 'Gasless Token Transfer',
    url: '/gasless-transfer',
    tags: [],
    description: ''
  }
];
