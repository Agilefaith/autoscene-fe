'use client';

interface WaveformProps {
  heights: number[];
  playing: boolean;
  color?: string;
}

export function Waveform({ heights, playing, color = '#7C3AED' }: WaveformProps) {
  return (
    <div className="flex items-end gap-[3px] h-8">
      {heights.map((h, i) => (
        <div
          key={i}
          className="w-[3px] rounded-full transition-colors duration-300"
          style={{
            height: `${h * 3}px`,
            background: playing
              ? `linear-gradient(to top, #7C3AED, ${color})`
              : `${color}4D`,
            ...(playing
              ? { animation: `waveAnim 0.7s ease-in-out ${i * 0.055}s infinite alternate` }
              : {}),
          }}
        />
      ))}
      <style>{`@keyframes waveAnim { from { transform: scaleY(0.35); } to { transform: scaleY(1); } }`}</style>
    </div>
  );
}
