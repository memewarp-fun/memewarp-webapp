interface LivestreamCardProps {
  streamer: string;
  username: string;
  mcap: string;
  ath: string;
  thumbnail: string;
  avatar: string;
  isLive?: boolean;
  streamTitle?: string;
}

export function LivestreamCard({
  streamer,
  username,
  mcap,
  ath,
  thumbnail,
  avatar,
  isLive = true,
  streamTitle = "Battle Giveaway Farm in Description | 15 Discord Discord.gg/9m9J3Pkt76"
}: LivestreamCardProps) {
  return (
    <div className="group cursor-pointer transition-all duration-300 rounded-2xl hover:ring-2 hover:ring-green-500/50 hover:bg-zinc-900/50 p-2">
      {/* Thumbnail Container */}
      <div className="relative aspect-video rounded-xl overflow-hidden bg-zinc-900">
        <img
          src={thumbnail}
          alt={streamer}
          className="w-full h-full object-cover"
        />

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

        {/* LIVE Badge */}
        {isLive && (
          <div className="absolute top-3 right-3 bg-green-500 text-black text-sm font-bold px-3 py-1.5 rounded-md">
            LIVE
          </div>
        )}

        {/* Stream Title Overlay */}
        <div className="absolute bottom-3 right-3 left-3 text-white">
          <p className="text-sm truncate opacity-90">
            {streamTitle}
          </p>
        </div>
      </div>

      {/* Stream Info */}
      <div className="mt-2 flex items-start gap-3 px-1">
        <img
          src={avatar}
          alt={streamer}
          className="w-12 h-12 rounded-full bg-zinc-800 flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold text-base truncate">
            {streamer}
          </h3>
          <p className="text-gray-500 text-sm">{username}</p>

          <div className="flex items-center gap-5 mt-2">
            <div className="flex items-center gap-1.5">
              <span className="text-sm text-gray-400">mcap</span>
              <span className="text-sm text-green-500 font-bold">{mcap}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm text-gray-400">ATH</span>
              <span className="text-sm text-gray-300">{ath}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}