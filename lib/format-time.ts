/**
 * Formate un nombre de secondes en "MM:SS". Pure, sans dépendance à React,
 * donc pas besoin de useCallback côté appelant.
 */
export function formatTime(totalSeconds: number): string {
  const safeSeconds = Number.isFinite(totalSeconds) ? Math.max(0, totalSeconds) : 0;
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = Math.floor(safeSeconds % 60);
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}
