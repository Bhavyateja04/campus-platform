import { useMemo } from "react";
import { normalizeNotifications } from "./normalize";

export function useFilteredData(items, search, keys) {
  return useMemo(() => {
    const text = search.trim().toLowerCase();
    if (!text) return items;
    return items.filter((item) =>
      keys.some((key) => String(item[key]).toLowerCase().includes(text)),
    );
  }, [items, keys, search]);
}

export { normalizeNotifications };
