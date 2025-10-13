import { TextCard } from "./TextCard";
import { textSeeds } from "@/data/sampleSeeds";

// Demo component to showcase text seeds
export const TextSeedDemo = () => {
  return (
    <div className="p-8 bg-background min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-display font-bold mb-8 text-center">
          Text Seeds Demo
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {textSeeds.map((seed) => (
            <TextCard
              key={seed.id}
              seed={seed}
              onFork={(seedId) => console.log('Fork:', seedId)}
              onView={(seedId) => console.log('View:', seedId)}
              onSpark={(seedId) => console.log('Spark:', seedId)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
