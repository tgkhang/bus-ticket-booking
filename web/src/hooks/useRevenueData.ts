import useSWR from "swr";
import {
  fetchRevenueOverview,
  fetchRevenueByRoute,
  fetchRevenueByPaymentMethod,
} from "@/lib/api/revenue";

export function useRevenueData(from: string, to: string) {
  const { data: overview, error: overviewError, isLoading: overviewLoading } = useSWR(
    ["revenue-overview", from, to],
    () => fetchRevenueOverview(from, to)
  );
  const { data: byRoute, error: byRouteError, isLoading: byRouteLoading } = useSWR(
    ["revenue-by-route", from, to],
    () => fetchRevenueByRoute(from, to)
  );
  const { data: byPayment, error: byPaymentError, isLoading: byPaymentLoading } = useSWR(
    ["revenue-by-payment", from, to],
    () => fetchRevenueByPaymentMethod(from, to)
  );
  return {
    overview,
    byRoute,
    byPayment,
    loading: overviewLoading || byRouteLoading || byPaymentLoading,
    error: overviewError || byRouteError || byPaymentError,
  };
}
