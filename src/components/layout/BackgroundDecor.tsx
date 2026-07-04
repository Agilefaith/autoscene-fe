/**
 * Landing background decoration (fixed, behind all content).
 * - Soft violet glow hints in the bottom-left & bottom-right corners
 * - Concentric "half-spiral" rings emanating from the bottom-left corner
 * - White dotted grid in the bottom-right corner
 * See docs/AUTOSCENE_DESIGN_SYSTEM.md.
 */
export default function BackgroundDecor() {
  return (
    <div aria-hidden className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* base + corner glows */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(58% 48% at 2% 100%, rgba(124,58,237,0.20) 0%, transparent 60%),' +
            'radial-gradient(52% 48% at 100% 100%, rgba(139,92,246,0.22) 0%, transparent 60%),' +
            'radial-gradient(120% 90% at 50% 0%, #FBFAFF 0%, #F2EDFB 100%)',
        }}
      />

      {/* bottom-left concentric rings (half-spiral) */}
      <svg
        className="absolute left-0 bottom-0 w-[36rem] h-[36rem] max-w-[55vw] max-h-[55vh]"
        viewBox="0 0 480 480"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {[60, 120, 180, 240, 300, 360, 420].map((r) => (
          <circle
            key={r}
            cx="0"
            cy="480"
            r={r}
            stroke="rgba(124,58,237,0.16)"
            strokeWidth="1.5"
            fill="none"
          />
        ))}
      </svg>

      {/* bottom-right dotted grid */}
      <div
        className="absolute right-0 bottom-0 w-[28rem] h-[24rem] max-w-[45vw]"
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.95) 1.7px, transparent 2px)',
          backgroundSize: '20px 20px',
          WebkitMaskImage:
            'radial-gradient(85% 85% at 100% 100%, #000 10%, transparent 75%)',
          maskImage: 'radial-gradient(85% 85% at 100% 100%, #000 10%, transparent 75%)',
        }}
      />
    </div>
  );
}
