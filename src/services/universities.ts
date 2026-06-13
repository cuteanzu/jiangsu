import { useEffect, useState } from "react";
import { UNIVERSITIES, type Tier, type University } from "../data/jiangsu-universities";
import { citiesApi, schoolsApi } from "./api";
import type { CityProfileDTO, SchoolDTO, UniversityDTO } from "./types";

const VALID_TIERS = new Set<Tier>(["985", "211", "dual", "provincial"]);

export type UniversityDataSource = "api" | "static";

function normalizeTier(tier: string | undefined): Tier {
  return tier && VALID_TIERS.has(tier as Tier) ? (tier as Tier) : "provincial";
}

function toUniversity(dto: UniversityDTO): University | null {
  if (!dto.id || !dto.name || !dto.city) return null;
  if (typeof dto.lat !== "number" || typeof dto.lng !== "number") return null;

  return {
    id: dto.id,
    name: dto.name,
    city: dto.city,
    lat: dto.lat,
    lng: dto.lng,
    tier: normalizeTier(dto.tier),
    founded: dto.founded,
    website: dto.website,
  };
}

export function useUniversitiesData() {
  const [universities, setUniversities] = useState<University[]>(UNIVERSITIES);
  const [source, setSource] = useState<UniversityDataSource>("static");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    schoolsApi.listUniversities()
      .then((items) => {
        if (cancelled) return;
        const next = items.map(toUniversity).filter((item): item is University => Boolean(item));
        if (next.length === 0) {
          setUniversities(UNIVERSITIES);
          setSource("static");
          setError("高校接口返回为空，已使用本地兜底数据");
          return;
        }
        setUniversities(next);
        setSource("api");
        setError(null);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setUniversities(UNIVERSITIES);
        setSource("static");
        setError(err instanceof Error ? err.message : "高校接口加载失败，已使用本地兜底数据");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { universities, source, loading, error };
}

interface MapInsightsState {
  schools: SchoolDTO[];
  hotSchools: SchoolDTO[];
  cityProfiles: CityProfileDTO[];
  loading: boolean;
  error: string | null;
}

export function useMapInsightsData() {
  const [state, setState] = useState<MapInsightsState>({
    schools: [],
    hotSchools: [],
    cityProfiles: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      schoolsApi.search({ size: 200 }),
      schoolsApi.hot(8),
      citiesApi.list(),
    ])
      .then(([schools, hotSchools, cityProfiles]) => {
        if (cancelled) return;
        setState({
          schools,
          hotSchools,
          cityProfiles,
          loading: false,
          error: null,
        });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setState({
          schools: [],
          hotSchools: [],
          cityProfiles: [],
          loading: false,
          error: err instanceof Error ? err.message : "后端数据加载失败",
        });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
