const CHEVRONS = [
  { points: '139,184 201,256 139,327', opacity: 0.4 },
  { points: '220,175 291,256 220,336', opacity: 0.7 },
  { points: '301,166 381,256 301,345', opacity: 1 },
];

function BrandChevrons({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="120 147 281 218"
      fill="none"
      stroke="currentColor"
      strokeWidth={36}
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
