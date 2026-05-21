import useSWR from "swr";
import { fetchEnergyData } from "@/services/api";
import { TimeRange } from "@/types";

export function useEnergyData(range: TimeRange) {
  const { data, error, isLoading, mutate } = useSWR(
    ["energy-data", range],
    () => fetchEnergyData(range),
    {
      refreshInterval: 60000,
      revalidateOnFocus: true,
    }
  );

  return {
    data,
    isLoading,
    isError: !!error,
    error,
    refresh: mutate,
  };
}
