import { useEffect, useState } from "react";
import type { FeatureCollection, MultiPolygon, Polygon } from "geojson";

interface GeoProps {
  adcode: number;
  name: string;
}

export type JiangsuGeoJSON = FeatureCollection<MultiPolygon | Polygon, GeoProps>;

let cached: JiangsuGeoJSON | null = null;
let pending: Promise<JiangsuGeoJSON> | null = null;

/**
 * Fetch Jiangsu GeoJSON once, share across all consumers.
 * Module-level cache ensures only one network request + one parse.
 */
export function useGeoJSON(): JiangsuGeoJSON | null {
  const [data, setData] = useState<JiangsuGeoJSON | null>(cached);

  useEffect(() => {
    if (cached) return;
    if (pending) {
      let cancelled = false;
      pending.then((result) => {
        if (!cancelled) setData(result);
      });
      return () => { cancelled = true; };
    }

    let cancelled = false;
    pending = fetch("/jiangsu-geo.json")
      .then((r) => r.json())
      .then((json: JiangsuGeoJSON) => {
        cached = json;
        pending = null;
        return json;
      });

    pending.then((result) => {
      if (!cancelled) setData(result);
    });

    return () => { cancelled = true; };
  }, []);

  return data;
}
