import { useRevalidator } from "@remix-run/react";
import { useEffect } from "react";

export function useRevalidationInterval(ms?: number) {
  const { revalidate } = useRevalidator();

  useEffect(() => {
    const interval = setInterval(revalidate, ms);
    return () => clearInterval(interval);
  }, [ms, revalidate]);
}
