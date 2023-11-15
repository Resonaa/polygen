import { createContext, startTransition, useCallback, useState } from "react";

export function useForceUpdate() {
  const [, setTick] = useState(0);
  return useCallback(() => {
    startTransition(() => setTick(tick => tick + 1));
  }, []);
}

export const ForceUpdateContext = createContext<
  ReturnType<typeof useForceUpdate>
>(() => undefined);
