"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  loadFiles,
  revokeAll,
  type LoadedImage,
} from "@/lib/imagebox-utils";
import { useImgDict } from "./shared";

/** 子工具共用：图片列表状态（添加/移除/清空 + 对象 URL 回收 + 错误提示） */
export function useImageList() {
  const { t } = useImgDict();
  const [items, setItems] = useState<LoadedImage[]>([]);
  const [error, setError] = useState("");
  const itemsRef = useRef<LoadedImage[]>([]);
  itemsRef.current = items;

  useEffect(() => {
    return () => revokeAll(itemsRef.current);
  }, []);

  const addFiles = useCallback(
    async (files: File[]) => {
      setError("");
      let failed = 0;
      const loaded = await loadFiles(files, () => {
        failed++;
      });
      if (failed > 0) setError(t.errLoad);
      if (loaded.length > 0) setItems((prev) => [...prev, ...loaded]);
    },
    [t]
  );

  const setSingle = useCallback(
    async (files: File[]) => {
      setError("");
      const loaded = await loadFiles(files.slice(0, 1), () =>
        setError(t.errLoad)
      );
      if (loaded.length > 0) {
        setItems((prev) => {
          revokeAll(prev);
          return loaded;
        });
      }
    },
    [t]
  );

  const remove = useCallback((index: number) => {
    setItems((prev) => {
      const next = [...prev];
      const [gone] = next.splice(index, 1);
      if (gone) URL.revokeObjectURL(gone.url);
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    setItems((prev) => {
      revokeAll(prev);
      return [];
    });
  }, []);

  return { items, error, setError, addFiles, setSingle, remove, clearAll };
}
