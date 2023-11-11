import { startTransition, useCallback, useState } from "react";

export function useForceUpdate() {
  const [, setTick] = useState(0);
  return useCallback(() => {
    startTransition(() => setTick(tick => tick + 1));
  }, []);
}
