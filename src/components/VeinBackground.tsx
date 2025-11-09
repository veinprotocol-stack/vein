"use client";

export default function VeinBackground() {
  // Put your image in /public and change the filename if needed
  const url = "/bg.jpg";

  return (
    <div className="pointer-events-none fixed inset-0 -z-10">
      {/* soft grid */}
      <div className="absolute inset-0 vein-grid opacity-[0.15]" />

      {/* image layer with safe bleed + slow pan */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="
            absolute
            -inset-[12vh]                /* bleed so edges never show */
            bg-center bg-cover
            opacity-[0.32]
            will-change-transform
            animate-slow-pan
          "
          style={{ backgroundImage: `url(${url})` }}
          aria-hidden
        />

        {/* bottom gradient 'floor' (transparent -> dark) */}
        <div className="absolute inset-x-0 bottom-0 h-[50vh] bg-gradient-to-b from-transparent to-[#0b0b0d]" />
      </div>

      {/* bio-plasma blobs */}
      <div className="vein-blob blob-a" />
      <div className="vein-blob blob-b" />
      <div className="vein-blob blob-c" />

      {/* floating dots */}
      <div className="vein-dot dot-1" />
      <div className="vein-dot dot-2" />
      <div className="vein-dot dot-3" />
      <div className="vein-dot dot-4" />
      <div className="vein-dot dot-5" />
      <div className="vein-dot dot-6" />

      {/* subtle vignette */}
      <div className="absolute inset-0 vein-vignette" />
    </div>
  );
}
