import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import type { ShipId } from "@shared/ships";
import { useToast } from "@/hooks/use-toast";
import { apiUrl } from "@/lib/apiBase";

export function useProgression() {
  return useQuery({
    queryKey: [api.progression.get.path],
    queryFn: async () => {
      const res = await fetch(apiUrl(api.progression.get.path), {
        credentials: "include",
      });
      if (res.status === 401) return null;
      if (!res.ok) throw new Error("Failed to load hangar systems");
      return api.progression.get.responses[200].parse(await res.json());
    },
  });
}

function useProgressionMutation(
  path: string,
  method: "purchase" | "equip",
) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ shipId }: { shipId: ShipId }) => {
      const contract = api.progression[method];
      const res = await fetch(apiUrl(path), {
        method: contract.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shipId }),
        credentials: "include",
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.message || "Hangar command rejected");
      return contract.responses[200].parse(body);
    },
    onSuccess: (progression) => {
      queryClient.setQueryData([api.progression.get.path], progression);
      queryClient.setQueryData(["/api/user"], (user: any) =>
        user ? { ...user, ...progression } : user,
      );
      toast({
        title: method === "purchase" ? "SHIP UNLOCKED" : "SHIP EQUIPPED",
        description: method === "purchase"
          ? "New technology added to your fleet."
          : "Launch systems calibrated to the selected ship.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "HANGAR COMMAND REJECTED",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function usePurchaseShip() {
  return useProgressionMutation(api.progression.purchase.path, "purchase");
}

export function useEquipShip() {
  return useProgressionMutation(api.progression.equip.path, "equip");
}