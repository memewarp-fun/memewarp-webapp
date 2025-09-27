import { LivestreamCard } from "@/components/livestream-card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

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
          <Link href="/livestreams">
            <Button variant="outline" className="border-green-500 text-green-500 hover:bg-green-500 hover:text-black">
              Browse All Streams
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockStreams.map((stream) => (
            <LivestreamCard
              key={stream.id}
              streamer={stream.streamer}
              username={stream.username}
              mcap={stream.mcap}
              ath={stream.ath}
              thumbnail={stream.thumbnail}
              avatar={stream.avatar}
              isLive={stream.isLive}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
