import { useEffect } from "react";
import { applySeo, type SeoPayload } from "@/lib/seo";

export function useSeo(payload: SeoPayload): void {
  useEffect(() => {
    applySeo(payload);
  }, [payload]);
}
