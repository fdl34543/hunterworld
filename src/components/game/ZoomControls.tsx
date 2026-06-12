export function ZoomControls({
  zoom,
  onZoomIn,
  onZoomOut,
  onRecenter,
}: {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onRecenter: () => void;
}) {
  return (
    <div className="absolute right-4 top-4 flex flex-col gap-1 rounded-xl bg-black/60 p-1 text-white shadow-lg backdrop-blur">
      <button onClick={onZoomIn} className="h-8 w-8 rounded-md text-lg font-bold hover:bg-white/10" aria-label="Zoom in">
        +
      </button>
      <div className="text-center text-[10px] text-white/70">{Math.round(zoom * 100)}%</div>
      <button onClick={onZoomOut} className="h-8 w-8 rounded-md text-lg font-bold hover:bg-white/10" aria-label="Zoom out">
        −
      </button>
      <button onClick={onRecenter} className="h-8 w-8 rounded-md text-sm hover:bg-white/10" aria-label="Recenter" title="Recenter on player">
        🎯
      </button>
    </div>
  );
}