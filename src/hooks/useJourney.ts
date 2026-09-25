import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  addFlight,
  getMyJourney,
  markMilestone,
  simulateFlightEvent,
  startDemoJourney,
  type JourneyPayload,
} from "@/lib/journey.functions";
import type { FlightDraft } from "@/components/AddFlightForm";
import { useAuth } from "@/hooks/useAuth";

/** Shared journey state: one server-owned payload, used by every page. */
export function useJourney() {
  const { user, loading, signIn } = useAuth();
  const queryClient = useQueryClient();
  const fetchJourney = useServerFn(getMyJourney);
  const createFlight = useServerFn(addFlight);
  const milestone = useServerFn(markMilestone);
  const simulate = useServerFn(simulateFlightEvent);
  const startDemo = useServerFn(startDemoJourney);

  const query = useQuery({
    queryKey: ["journey"],
    queryFn: () => fetchJourney({ data: {} }),
    enabled: !!user,
    refetchInterval: 60_000,
  });

  const setData = (data: JourneyPayload) => queryClient.setQueryData(["journey"], data);
  const data = query.data as JourneyPayload | undefined;
  const passengerId = data?.passenger?.id;

  return {
    user,
    authLoading: loading,
    signIn,
    query,
    data,
    passengerId,
    create: useMutation({
      mutationFn: (draft: FlightDraft) => createFlight({ data: draft }),
      onSuccess: setData,
    }),
    demo: useMutation({ mutationFn: () => startDemo({ data: {} }), onSuccess: setData }),
    advance: useMutation({
      mutationFn: (key: string) =>
        milestone({ data: { passengerId: passengerId!, milestone: key as never } }),
      onSuccess: setData,
    }),
    disrupt: useMutation({
      mutationFn: (input: { event_type: string; new_value?: string; delay_minutes?: number }) =>
        simulate({ data: { passengerId: passengerId!, ...input } as never }),
      onSuccess: setData,
    }),
  };
}
