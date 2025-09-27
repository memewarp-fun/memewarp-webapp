import { Github, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-secondary/20 border-t border-border mt-20">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="col-span-1">
            <h3 className="text-2xl font-bold font-space-grotesk mb-4">MemeWarp</h3>
            <p className="text-muted-foreground mb-4">
              The ultimate platform where memes meet DeFi. Launch tokens, stream live, and build communities.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="w-5 h-5" />
              </a>

            </div>
          </div>

          {/* Platform */}
          <div>
            <h4 className="font-semibold mb-4">Platform</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Launch Token</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Start Streaming</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Browse Tokens</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Watch Streams</a></li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h4 className="font-semibold mb-4">Community</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Discord</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Telegram</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Twitter</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Reddit</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row items-center justify-between">
          <p className="text-muted-foreground text-sm">
            © 2025 MemeWarp. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground mt-4 md:mt-0">
            Built for{" "}
            <a
              href="https://ethglobal.com/events/newdelhi"
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-500 font-semibold hover:text-green-400 transition-colors"
            >
              ETHGlobal New Delhi 2025
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
