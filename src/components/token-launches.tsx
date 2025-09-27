import { Button } from "@/components/ui/button";
import { TokenCard } from "@/components/token-card";
import Link from "next/link";

const mockTokens = [
  {
    id: 1,
    name: "Kuda Slime",
    symbol: "KUDA",
    description: "Kuda slime the biggest",
    mcap: "$16.0K",
    change24h: "+19.92%",
    launched: "9m ago",
    creator: "73PXvV",
    image: "https://api.dicebear.com/7.x/shapes/svg?seed=kuda&backgroundColor=1f1f1f"
  },
  {
    id: 2,
    name: "Top Blast",
    symbol: "TopBlast",
    description: "PVP Nah PVE Nah This is PVD I'll be your exit liquidity. 50% To just Top Blast Lock or burn y...",
    mcap: "$17.4K",
    change24h: "+27.54%",
    launched: "5m ago",
    creator: "C3UW51",
    image: "https://api.dicebear.com/7.x/initials/svg?seed=T&backgroundColor=22c55e"
  },
  {
    id: 3,
    name: "DogeMoon",
    symbol: "DMOON",
    description: "Much wow, very moon. The ultimate doge derivative that will take us beyond the stars",
    mcap: "$945K",
    change24h: "+89.32%",
    launched: "2h ago",
    creator: "A8KL92",
    image: "https://api.dicebear.com/7.x/fun-emoji/svg?seed=doge"
  },
  {
    id: 4,
    name: "CatVibes",
    symbol: "VIBES",
    description: "Cats rule the internet, now they rule DeFi. Join the feline revolution",
    mcap: "$2.1M",
    change24h: "+156.78%",
    launched: "4h ago",
    creator: "B5TY23",
    image: "https://api.dicebear.com/7.x/fun-emoji/svg?seed=cat"
  },
  {
    id: 5,
    name: "RocketPepe",
    symbol: "RPEPE",
    description: "Pepe going to Mars before Elon. Strap in for the most based journey in crypto",
    mcap: "$750K",
    change24h: "+45.21%",
    launched: "6h ago",
    creator: "K9PL44",
    image: "https://api.dicebear.com/7.x/shapes/svg?seed=rocket&backgroundColor=6366f1"
  },
  {
    id: 6,
    name: "WojakCry",
    symbol: "WOJAK",
    description: "It's over... or is it just beginning? The most emotional token in the space",
    mcap: "$320K",
    change24h: "+67.89%",
    launched: "8h ago",
    creator: "M2QW87",
    image: "https://api.dicebear.com/7.x/personas/svg?seed=wojak"
  }
];

export function TokenLaunches() {
  return (
    <section className="py-16 bg-black">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-4xl font-bold font-space-grotesk text-white">Latest Token Launches</h2>
          <Link href="/tokens">
            <Button variant="outline" className="border-green-500 text-green-500 hover:bg-green-500 hover:text-black">
              View All
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockTokens.map((token) => (
            <TokenCard
              key={token.id}
              id={token.id}
              name={token.name}
              symbol={token.symbol}
              description={token.description}
              mcap={token.mcap}
              change24h={token.change24h}
              launched={token.launched}
              creator={token.creator}
              image={token.image}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
