export function waveHeights(seed: string): number[] {
  return Array.from({ length: 12 }, (_, i) => {
    let h = 0;
    for (let j = 0; j < seed.length; j++) h += seed.charCodeAt(j) * (i + j + 1);
    return (h % 7) + 3;
  });
}
