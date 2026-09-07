// app/loading.tsx
import { Orbit } from "ldrs/react";
import "ldrs/react/BouncyArc.css";

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-linear-to-br from-blue-950/20 via-transparent to-blue-950/10">
      <Orbit size="50" speed="1.65" color="blue" />

      <p className="text-sm font-light text-blue-300/80 tracking-[0.2em] ">
        Patience...
      </p>
    </div>
  );
}
