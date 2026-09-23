const CHEVRONS = [
  { points: '138,185 200,255 138,325', opacity: 0.4 },
  { points: '222,172 294,255 222,338', opacity: 0.7 },
  { points: '304,160 386,255 304,350', opacity: 1 },
];

function BrandChevrons({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="112 136 300 238"
      fill="none"
      stroke="currentColor"
      strokeWidth={34}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {CHEVRONS.map(({ points, opacity }) => (
        <polyline key={points} points={points} strokeOpacity={opacity} />
      ))}
    </svg>
  );
}

export default BrandChevrons;
