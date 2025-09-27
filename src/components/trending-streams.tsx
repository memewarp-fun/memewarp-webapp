import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const mockStreams = [
  {
    id: 1,
    streamer: "Clash",
    username: "5pY8pTko",
    mcap: "$10.8M",
    ath: "$18.3M",
    thumbnail: "https://picsum.photos/seed/clash/640/360",
    avatar: "https://api.dicebear.com/7.x/personas/svg?seed=clash",
    isLive: true,
    isNsfw: false
  },
  {
    id: 2,
    streamer: "San",
    username: "E2TRt6M7",
    mcap: "$9.3M",
    ath: "$10.3M",
    thumbnail: "https://picsum.photos/seed/san/640/360",
    avatar: "https://api.dicebear.com/7.x/personas/svg?seed=san",
    isLive: true,
    isNsfw: false
  },
  {
    id: 3,
    streamer: "Butthole",
    username: "AuyuBlkf",
    mcap: "$3.4M",
    ath: "$3.7M",
    thumbnail: "https://picsum.photos/seed/butthole/640/360",
    avatar: "https://api.dicebear.com/7.x/personas/svg?seed=butthole",
    isLive: true,
    isNsfw: false
  },
  {
    id: 4,
    streamer: "MoonShot",
    username: "K9PL44XX",
    mcap: "$5.2M",
    ath: "$7.8M",
    thumbnail: "https://picsum.photos/seed/moonshot/640/360",
    avatar: "https://api.dicebear.com/7.x/personas/svg?seed=moonshot",
    isLive: true,
    isNsfw: false
  },
  {
    id: 5,
    streamer: "DiamondHands",
    username: "B5TY23QW",
    mcap: "$2.1M",
    ath: "$4.5M",
    thumbnail: "https://picsum.photos/seed/diamond/640/360",
    avatar: "https://api.dicebear.com/7.x/personas/svg?seed=diamond",
    isLive: true,
    isNsfw: true
  },
  {
    id: 6,
    streamer: "PepeLord",
    username: "M2QW87ZX",
    mcap: "$8.7M",
    ath: "$12.4M",
    thumbnail: "https://picsum.photos/seed/pepelord/640/360",
    avatar: "https://api.dicebear.com/7.x/personas/svg?seed=pepelord",
    isLive: true,
    isNsfw: false
  }
];

export function TrendingStreams() {
  return (
    <section className="py-20 bg-zinc-950">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold font-space-grotesk text-white">Livestreams</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockStreams.map((stream) => (
            <div
              key={stream.id}
              className="group cursor-pointer transition-all duration-300 rounded-2xl hover:ring-2 hover:ring-green-500/50 hover:bg-zinc-900/50 p-2"
            >
              {/* Thumbnail Container */}
              <div className="relative aspect-video rounded-xl overflow-hidden bg-zinc-900">
                <img
                  src={stream.thumbnail}
                  alt={stream.streamer}
                  className="w-full h-full object-cover"
                />

                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                {/* LIVE Badge */}
                {stream.isLive && (
                  <div className="absolute bottom-3 left-3 bg-green-500 text-black text-sm font-bold px-3 py-1.5 rounded-md">
                    LIVE
                  </div>
                )}

                {/* Stream Title Overlay */}
                <div className="absolute bottom-3 right-3 left-16 text-white">
                  <p className="text-sm truncate opacity-90">
                    Battle Giveaway Farm in Description | 15 Discord Discord.gg/9m9J3Pkt76
                  </p>
                </div>
              </div>

              {/* Stream Info */}
              <div className="mt-2 flex items-start gap-3 px-1">
                <img
                  src={stream.avatar}
                  alt={stream.streamer}
                  className="w-12 h-12 rounded-full bg-zinc-800 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold text-base truncate">
                    {stream.streamer}
                  </h3>
                  <p className="text-gray-500 text-sm">{stream.username}</p>

                  <div className="flex items-center gap-5 mt-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm text-gray-400">mcap</span>
                      <span className="text-sm text-green-500 font-bold">{stream.mcap}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm text-gray-400">ATH</span>
                      <span className="text-sm text-gray-300">{stream.ath}</span>
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
