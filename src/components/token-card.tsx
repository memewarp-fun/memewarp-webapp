import { Badge } from "@/components/ui/badge";
import { TrendingUp, Clock } from "lucide-react";

interface TokenCardProps {
  name: string;
  symbol: string;
  description: string;
  mcap: string;
  change24h: string;
  launched: string;
  creator: string;
  image: string;
}

export function TokenCard({
  name,
  symbol,
  description,
  mcap,
  change24h,
  launched,
  creator,
  image
}: TokenCardProps) {
  return (
    <div className="bg-zinc-900 rounded-xl p-4 hover:bg-zinc-800/50 transition-all duration-300 cursor-pointer border border-zinc-800 hover:border-green-500/50 hover:shadow-lg hover:shadow-green-500/10 group">
      <div className="flex gap-4">
        {/* Image on Left */}
        <div className="relative flex-shrink-0">
          <img
            src={image}
            alt={name}
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
                {name}
              </h3>
              <p className="text-xs text-gray-500">{symbol}</p>
            </div>
            <Badge className="bg-green-500/20 text-green-500 border-green-500/50 h-5 px-1.5 text-[10px]">
              <TrendingUp className="w-2 h-2 mr-0.5" />
              {change24h}
            </Badge>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-400 mb-1.5">
            <span className="flex items-center gap-0.5">
              <Clock className="w-2.5 h-2.5" />
              {creator} · {launched}
            </span>
          </div>

          <p className="text-gray-300 text-xs mb-2 line-clamp-1">
            {description}
          </p>

          <div className="flex items-center gap-3">
            <div>
              <p className="text-[10px] text-gray-500 uppercase">MCap</p>
              <p className="text-sm font-bold text-green-500">{mcap}</p>
            </div>
            <div className="h-4 w-[1px] bg-zinc-700" />
            <div className="flex-1">
              <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full"
                  style={{ width: `${Math.min(parseFloat(change24h) / 2, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}