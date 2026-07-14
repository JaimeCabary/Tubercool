// Web Vibration API wrapper — zero deps
// Falls back silently on iOS or unsupported browsers

type HapticStyle = "light" | "medium" | "heavy" | "success" | "error" | "selection";

const PATTERNS: Record<HapticStyle, number | number[]> = {
  selection: 10,
  light:     15,
  medium:    25,
  heavy:     50,
  success:   [15, 50, 15],
  error:     [50, 30, 50, 30, 80],
};

export function haptic(style: HapticStyle = "light") {
  if (typeof window === "undefined") return;
  if (!("vibrate" in navigator)) return;
  try {
    navigator.vibrate(PATTERNS[style]);
  } catch {
    // silently fail — Safari, desktop browsers
  }
}

export function useHaptic() {
  return haptic;
}
