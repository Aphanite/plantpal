// Geometric plant illustrations using overlapping circles/arcs,
// inspired by the Bauhaus/constructivist aesthetic of the palette reference.

interface Props {
  variant: number;
  bg: string;
  fg: string;
}

const shapes = [
  // Leaf — two arcs intersecting
  ({ fg }: { fg: string }) => (
    <>
      <circle cx="50" cy="130" r="90" fill={fg} opacity="0.35" />
      <circle cx="150" cy="130" r="90" fill={fg} opacity="0.35" />
      <circle cx="170" cy="40"  r="50" fill={fg} opacity="0.55" />
      <circle cx="30"  cy="170" r="30" fill={fg} opacity="0.45" />
    </>
  ),
  // Quarter arcs from corners
  ({ fg }: { fg: string }) => (
    <>
      <circle cx="0"   cy="0"   r="130" fill={fg} opacity="0.3" />
      <circle cx="200" cy="200" r="100" fill={fg} opacity="0.35" />
      <circle cx="160" cy="60"  r="40"  fill={fg} opacity="0.6" />
      <circle cx="60"  cy="160" r="25"  fill={fg} opacity="0.5" />
    </>
  ),
  // Stacked rings / bull's-eye
  ({ fg }: { fg: string }) => (
    <>
      <circle cx="100" cy="85"  r="110" fill={fg} opacity="0.22" />
      <circle cx="100" cy="85"  r="70"  fill={fg} opacity="0.3" />
      <circle cx="100" cy="85"  r="35"  fill={fg} opacity="0.55" />
      <circle cx="165" cy="165" r="28"  fill={fg} opacity="0.45" />
    </>
  ),
  // Crescent + dot
  ({ fg }: { fg: string }) => (
    <>
      <circle cx="110" cy="100" r="110" fill={fg} opacity="0.3" />
      <circle cx="70"  cy="80"  r="90"  fill={fg} opacity="0.3" />
      <circle cx="155" cy="155" r="35"  fill={fg} opacity="0.6" />
      <circle cx="40"  cy="40"  r="18"  fill={fg} opacity="0.5" />
    </>
  ),
];

export default function PlantGeometric({ variant, bg, fg }: Props) {
  const Shape = shapes[variant % shapes.length];
  return (
    <svg
      viewBox="0 0 200 200"
      className="w-full h-full"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="200" height="200" fill={bg} />
      <Shape fg={fg} />
    </svg>
  );
}
