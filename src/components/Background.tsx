export function Background() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 grid-bg" />
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[520px] w-[900px] rounded-full bg-[radial-gradient(closest-side,rgba(124,108,255,0.28),transparent)] blur-3xl animate-float" />
      <div className="absolute top-1/3 -left-40 h-[460px] w-[460px] rounded-full bg-[radial-gradient(closest-side,rgba(34,211,238,0.16),transparent)] blur-3xl animate-float [animation-delay:-3s]" />
      <div className="absolute bottom-0 -right-32 h-[520px] w-[520px] rounded-full bg-[radial-gradient(closest-side,rgba(255,0,122,0.12),transparent)] blur-3xl animate-float [animation-delay:-6s]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,transparent_0%,#070812_75%)]" />
    </div>
  );
}
