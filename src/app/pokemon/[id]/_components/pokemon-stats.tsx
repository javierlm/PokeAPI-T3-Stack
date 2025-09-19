import { statColor } from "@/lib/constants";

export function PokemonStats({
  stats,
}: {
  stats: {
    stat: { originalName: string; translatedName: string };
    value: number;
  }[];
}) {
  const maxStatValue = 255;
  return (
    <>
      <div className="mt-8 w-full max-w-md rounded-lg bg-white p-4 shadow-md">
        <h2 className="mb-2 text-xl font-bold text-gray-800">Stats</h2>
        <div className="space-y-3">
          {stats.map((stat) => (
            <div key={stat.stat.originalName}>
              <div className="mb-1 flex items-baseline justify-between text-sm">
                <span className="font-semibold text-gray-600">
                  {stat.stat.translatedName}
                </span>
                <span className="font-bold text-gray-800">{stat.value}</span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-gray-200">
                <div
                  className={`h-2.5 rounded-full ${statColor[stat.stat.originalName] ?? "bg-gray-400"} stat-bar-animation`}
                  style={{ width: `${(stat.value / maxStatValue) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <style>{`
      .stat-bar-animation {
        animation: fill-bar 0.5s ease-out forwards;
      }

      @keyframes fill-bar {
        from {
          width: 0%;
        }
        to {
          
        }
      }
    `}</style>
    </>
  );
}
