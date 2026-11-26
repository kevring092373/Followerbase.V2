"use client";

import { useEffect } from "react";
import { captureFirstTouchAttribution } from "@/lib/attribution";

/** Merkt First-Touch (Referrer/UTM) einmalig im localStorage. Rendert nichts. */
export function AttributionCapture() {
  useEffect(() => {
    captureFirstTouchAttribution();
  }, []);
  return null;
}
