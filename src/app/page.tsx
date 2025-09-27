import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { TokenLaunches } from "@/components/token-launches";
import { TrendingStreams } from "@/components/trending-streams";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex flex-col h-screen">
        <Header />
        <Hero />
      </div>
      <main>
        <TokenLaunches />
        <TrendingStreams />
      </main>
      <Footer />
    </div>
  );
}
