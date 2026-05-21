import useSWR from "swr";
import { fetchMetricSummary } from "@/services/api";

export function useMetricSummary() {
  const { data, error, isLoading, mutate } = useSWR(
    "metric-summary",
    fetchMetricSummary,
    {
      refreshInterval: 30000,
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
