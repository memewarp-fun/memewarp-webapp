import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Users, Eye } from "lucide-react";

const mockStreams = [
  {
    id: 1,
    title: "🚀 LAUNCHING MOONDOG TOKEN LIVE!",
    streamer: "CryptoMemer",
    viewers: 1248,
    thumbnail: "🌙🐕",
    category: "Token Launch",
    isLive: true
  },
  {
    id: 2,
    title: "Meme Review & Market Analysis 📈",
    streamer: "DeFiDegen",
    viewers: 892,
    thumbnail: "📊💎",
    category: "Analysis",
    isLive: true
  },
  {
    id: 3,
    title: "Building the Next Viral Meme Project",
    streamer: "MemeBuilder",
    viewers: 654,
    thumbnail: "🔨✨",
    category: "Development",
    isLive: true
  },
  {
    id: 4,
    title: "Community AMA - PepeCoin Updates",
    streamer: "PepeTeam",
    viewers: 543,
    thumbnail: "🐸💬",
    category: "AMA",
    isLive: true
  },
  {
    id: 5,
    title: "NFT Meme Collection Reveal",
    streamer: "NFTArtist",
    viewers: 432,
    thumbnail: "🎨🖼️",
    category: "NFT",
    isLive: true
  },
  {
    id: 6,
    title: "Trading Meme Coins Like a Pro",
    streamer: "TradeGuru",
    viewers: 321,
    thumbnail: "💰📈",
    category: "Trading",
    isLive: true
  }
];

export function TrendingStreams() {
  return (
    <section className="py-16">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold font-space-grotesk">Trending Livestreams</h2>
          <Button variant="outline">Browse All Streams</Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockStreams.map((stream) => (
            <Card key={stream.id} className="group cursor-pointer hover:shadow-lg transition-all duration-300 overflow-hidden">
              <div className="relative">
                {/* Thumbnail */}
                <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-6xl relative overflow-hidden">
                  {stream.thumbnail}
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                  <div className="absolute top-3 left-3">
                    {stream.isLive && (
                      <Badge className="bg-red-500 hover:bg-red-500 text-white">
                        <div className="w-2 h-2 bg-white rounded-full mr-1 animate-pulse" />
                        LIVE
                      </Badge>
                    )}
                  </div>
                  <div className="absolute top-3 right-3 bg-black/60 rounded-full px-2 py-1 flex items-center space-x-1 text-white text-sm">
                    <Eye className="w-3 h-3" />
                    <span>{stream.viewers.toLocaleString()}</span>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                      <Play className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </div>
              </div>
              
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="secondary" className="text-xs">
                    {stream.category}
                  </Badge>
                </div>
                <h3 className="font-semibold text-sm mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                  {stream.title}
                </h3>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span>{stream.streamer}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
