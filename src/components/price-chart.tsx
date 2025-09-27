"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown } from "lucide-react";

interface ChartData {
  time: number;
  price: number;
  volume: number;
}

interface PriceChartProps {
  tokenSymbol?: string;
  currentPrice?: number;
  change24h?: number;
}

export function PriceChart({
  tokenSymbol = "TOKEN",
  currentPrice = 0.00045,
  change24h = 24.5
}: PriceChartProps) {
  const [timeframe, setTimeframe] = useState("24h");
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Generate mock data based on timeframe
  const generateMockData = () => {
    const dataPoints = timeframe === "1h" ? 60 :
                      timeframe === "4h" ? 48 :
                      timeframe === "24h" ? 96 : 144;

    const basePrice = currentPrice;
    const volatility = 0.15; // 15% volatility
    const trend = change24h > 0 ? 0.0001 : -0.0001;

    const data: ChartData[] = [];
    let lastPrice = basePrice * (1 - Math.abs(change24h) / 100);

    for (let i = 0; i < dataPoints; i++) {
      const random = (Math.random() - 0.5) * volatility;
      const trendEffect = trend * (i / dataPoints);
      lastPrice = lastPrice * (1 + random * 0.1) + trendEffect;

      data.push({
        time: i,
        price: Math.max(0.000001, lastPrice),
        volume: Math.random() * 10000 + 1000
      });
    }

    // Ensure last price matches current
    data[data.length - 1].price = currentPrice;

    return data;
  };

  useEffect(() => {
    setIsLoading(true);
    // Simulate API call delay
    setTimeout(() => {
      setChartData(generateMockData());
      setIsLoading(false);
    }, 300);
  }, [timeframe]);

  const maxPrice = Math.max(...chartData.map(d => d.price));
  const minPrice = Math.min(...chartData.map(d => d.price));
  const priceRange = maxPrice - minPrice;

  // Calculate chart path
  const chartPath = chartData.map((point, index) => {
    const x = (index / (chartData.length - 1)) * 100;
    const y = 100 - ((point.price - minPrice) / priceRange) * 100;
    return `${x},${y}`;
  }).join(' ');

  const volumeBars = chartData.map((point, index) => {
    const x = (index / (chartData.length - 1)) * 100;
    const height = (point.volume / Math.max(...chartData.map(d => d.volume))) * 30;
    return { x, height };
  });

  return (
    <Card className="p-6 bg-zinc-900">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold">{tokenSymbol}/USD</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-2xl font-bold">
              ${currentPrice.toFixed(6)}
            </span>
            <div className={`flex items-center gap-1 px-2 py-1 rounded text-sm font-medium ${
              change24h >= 0 ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
            }`}>
              {change24h >= 0 ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              {Math.abs(change24h).toFixed(2)}%
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          {["1h", "4h", "24h", "7d"].map(tf => (
            <Button
              key={tf}
              size="sm"
              variant={timeframe === tf ? "default" : "outline"}
              onClick={() => setTimeframe(tf)}
              className={timeframe === tf ? "bg-green-500 hover:bg-green-600 text-black" : ""}
            >
              {tf}
            </Button>
          ))}
        </div>
      </div>

      <div className="relative h-64">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Loading chart...</div>
          </div>
        ) : (
          <>
            {/* Volume bars */}
            <svg className="absolute inset-0 w-full h-full">
              {volumeBars.map((bar, i) => (
                <rect
                  key={i}
                  x={`${bar.x}%`}
                  y={`${100 - bar.height}%`}
                  width={`${100 / volumeBars.length}%`}
                  height={`${bar.height}%`}
                  fill="rgba(34, 197, 94, 0.1)"
                />
              ))}
            </svg>

            {/* Price line */}
            <svg className="absolute inset-0 w-full h-full">
              {/* Gradient fill */}
              <defs>
                <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor={change24h >= 0 ? "rgb(34, 197, 94)" : "rgb(239, 68, 68)"} stopOpacity="0.3" />
                  <stop offset="100%" stopColor={change24h >= 0 ? "rgb(34, 197, 94)" : "rgb(239, 68, 68)"} stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Fill area */}
              <polygon
                points={`0,100 ${chartPath} 100,100`}
                fill="url(#chartGradient)"
              />

              {/* Price line */}
              <polyline
                points={chartPath}
                fill="none"
                stroke={change24h >= 0 ? "rgb(34, 197, 94)" : "rgb(239, 68, 68)"}
                strokeWidth="2"
              />

              {/* Hover dots (just the last point for simplicity) */}
              <circle
                cx="100%"
                cy={`${100 - ((currentPrice - minPrice) / priceRange) * 100}%`}
                r="4"
                fill={change24h >= 0 ? "rgb(34, 197, 94)" : "rgb(239, 68, 68)"}
                stroke="black"
                strokeWidth="2"
              />
            </svg>
          </>
        )}
      </div>

      <div className="flex justify-between mt-4 text-xs text-muted-foreground">
        <div>
          <span className="text-gray-500">Low: </span>
          <span>${minPrice.toFixed(6)}</span>
        </div>
        <div>
          <span className="text-gray-500">High: </span>
          <span>${maxPrice.toFixed(6)}</span>
        </div>
        <div>
          <span className="text-gray-500">Vol: </span>
          <span>${(chartData.reduce((acc, d) => acc + d.volume, 0) / 1000).toFixed(1)}K</span>
        </div>
      </div>
    </Card>
  );
}