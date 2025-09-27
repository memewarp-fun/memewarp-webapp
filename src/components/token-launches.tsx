import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const mockTokens = [
  {
    id: 1,
    name: "PepeCoin",
    symbol: "PEPE",
    description: "The ultimate meme coin for the culture",
    mcap: "$2.4M",
    change24h: "+125%",
    launched: "2 hours ago",
    image: "🐸"
  },
  {
    id: 2,
    name: "DogeMax",
    symbol: "DMAX",
    description: "Much wow, very moon",
    mcap: "$1.8M",
    change24h: "+89%",
    launched: "4 hours ago",
    image: "🐕"
  },
  {
    id: 3,
    name: "CatCoin",
    symbol: "CAT",
    description: "Cats rule the internet, now they rule DeFi",
    mcap: "$950K",
    change24h: "+67%",
    launched: "6 hours ago",
    image: "🐱"
  },
  {
    id: 4,
    name: "RocketMeme",
    symbol: "ROCKET",
    description: "To the moon and beyond",
    mcap: "$750K",
    change24h: "+45%",
    launched: "8 hours ago",
    image: "🚀"
  }
];

export function TokenLaunches() {
  return (
    <section className="py-16 bg-secondary/20">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold font-space-grotesk">Latest Token Launches</h2>
          <Button variant="outline">View All</Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {mockTokens.map((token) => (
            <Card key={token.id} className="hover:shadow-lg transition-shadow cursor-pointer group">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-3xl">{token.image}</div>
                    <div>
                      <CardTitle className="text-lg group-hover:text-primary transition-colors">
                        {token.name}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">${token.symbol}</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-green-500">
                    {token.change24h}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {token.description}
                </p>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">MCap: {token.mcap}</span>
                  <span className="text-muted-foreground">{token.launched}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
