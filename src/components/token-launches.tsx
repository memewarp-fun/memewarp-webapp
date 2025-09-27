import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Clock, DollarSign } from "lucide-react";

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
          <Button variant="outline" className="border-green-500 text-green-500 hover:bg-green-500 hover:text-black">
            View All
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockTokens.map((token) => (
            <div
              key={token.id}
              className="bg-zinc-900 rounded-xl p-4 hover:bg-zinc-800/50 transition-all duration-300 cursor-pointer border border-zinc-800 hover:border-green-500/50 hover:shadow-lg hover:shadow-green-500/10 group"
            >
              <div className="flex gap-4">
                {/* Image on Left */}
                <div className="relative flex-shrink-0">
                  <img
                    src={token.image}
                    alt={token.name}
                    className="w-20 h-20 rounded-lg object-cover bg-zinc-800"
                  />
                  {/* Live Badge */}
                  <div className="absolute top-1 left-1 bg-green-500 text-black text-[10px] font-bold px-1.5 py-0.5 rounded">
                    LIVE
                  </div>
                </div>

                {/* Info on Right */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-1">
                    <div>
                      <h3 className="text-sm font-bold text-white group-hover:text-green-500 transition-colors">
                        {token.name}
                      </h3>
                      <p className="text-xs text-gray-500">{token.symbol}</p>
                    </div>
                    <Badge className="bg-green-500/20 text-green-500 border-green-500/50 h-5 px-1.5 text-[10px]">
                      <TrendingUp className="w-2 h-2 mr-0.5" />
                      {token.change24h}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-gray-400 mb-1.5">
                    <span className="flex items-center gap-0.5">
                      <Clock className="w-2.5 h-2.5" />
                      {token.creator} · {token.launched}
                    </span>
                  </div>

                  <p className="text-gray-300 text-xs mb-2 line-clamp-1">
                    {token.description}
                  </p>

                  <div className="flex items-center gap-3">
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase">MCap</p>
                      <p className="text-sm font-bold text-green-500">{token.mcap}</p>
                    </div>
                    <div className="h-4 w-[1px] bg-zinc-700" />
                    <div className="flex-1">
                      <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full"
                          style={{ width: `${Math.min(parseFloat(token.change24h) / 2, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
