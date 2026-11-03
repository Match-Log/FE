export default function GridBackground() {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundImage: 'radial-gradient(rgba(0, 245, 255, 0.03) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}
    />
  );
}
