"use client";

import { useEffect } from "react";
import { useDexStore } from "@/store/useDexStore";

export function StoreHydrator() {
  useEffect(() => {
    useDexStore.persist.rehydrate();
  }, []);
  return null;
}
