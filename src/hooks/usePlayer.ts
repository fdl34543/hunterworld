import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useWalletSession } from "@/hooks/useWalletSession";
import {
  claimReward,
  buyItem,
  buySpell,
  completeStudy,
  consumeEnergy,
  createMyPlayer,
  defeatBoss,
  discardItem,
  placeItem,
  useItem,
  sellItem,
  useFountain,
  useFarm,
  useBeer,
  getMyInventory,
  getMyPlayer,
  updateMyPlayer,
  setMyHp,
  type DbPlayer,
  type DbPlayerItem,
} from "@/lib/players.functions";

export function usePlayer() {
  const { token, userId } = useWalletSession();
  const qc = useQueryClient();
  const signedIn = !!token;

  const query = useQuery<DbPlayer | null>({
    queryKey: ["player", userId],
    enabled: signedIn && !!userId,
    queryFn: async () => {
      return await getMyPlayer();
    },
    staleTime: 30_000,
    refetchOnWindowFocus: false,
    refetchInterval: 60_000,
  });

  const setPlayer = (p: DbPlayer) =>
    qc.setQueryData<DbPlayer | null>(["player", userId], p);
  const invalidateInventory = () =>
    qc.invalidateQueries({ queryKey: ["inventory", userId] });

  const create = useMutation({
    mutationFn: async (input: {
      name: string;
      job: string;
      color: string;
      avatar: string;
      character_sprite?: string;
    }) => {
      return await createMyPlayer({ data: input });
    },
    onSuccess: setPlayer,
  });

  const update = useMutation({
    mutationFn: async (
      patch: Partial<
        Pick<
          DbPlayer,
          "name" | "job" | "color" | "avatar" | "custom_avatar_url" | "character_sprite"
        >
      >,
    ) => {
      return await updateMyPlayer({ data: { patch } });
    },
    onSuccess: setPlayer,
  });

  const syncHp = useMutation({
    mutationFn: async (hp: number) => {
      return await setMyHp({ data: { hp } });
    },
    onSuccess: setPlayer,
  });

  const spendEnergy = useMutation({
    mutationFn: async (amount: number = 1) => {
      return await consumeEnergy({ data: { amount } });
    },
    onSuccess: setPlayer,
  });

  const study = useMutation({
    mutationFn: async () => {
      return await completeStudy();
    },
    onSuccess: setPlayer,
  });

  const reward = useMutation({
    mutationFn: async (input: { event: string; scale?: number }) => {
      return await claimReward({
        data: { event: input.event, scale: input.scale ?? 1 },
      });
    },
    onSuccess: setPlayer,
  });

  const inventory = useQuery<DbPlayerItem[]>({
    queryKey: ["inventory", userId],
    enabled: signedIn && !!userId,
    queryFn: async () => {
      return await getMyInventory();
    },
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });

  const buyItemM = useMutation({
    mutationFn: async (input: { defId: string; rarity: any }) => {
      return await buyItem({ data: input });
    },
    onSuccess: (res) => {
      setPlayer(res.player);
      invalidateInventory();
    },
  });

  const placeItemM = useMutation({
    mutationFn: async (input: {
      itemId: string;
      slotKind: "inventory" | "wear";
      slotIndex: number;
    }) => {
      return await placeItem({ data: input });
    },
    onSuccess: () => invalidateInventory(),
  });

  const discardItemM = useMutation({
    mutationFn: async (itemId: string) => {
      return await discardItem({ data: { itemId } });
    },
    onSuccess: () => invalidateInventory(),
  });

  const useItemM = useMutation({
    mutationFn: async (itemId: string) => {
      return await useItem({ data: { itemId } });
    },
    onSuccess: (res) => {
      setPlayer(res.player);
      invalidateInventory();
    },
  });

  const sellItemM = useMutation({
    mutationFn: async (itemId: string) => {
      return await sellItem({ data: { itemId } });
    },
    onSuccess: (res) => {
      setPlayer(res.player);
      invalidateInventory();
    },
  });

  const buySpellM = useMutation({
    mutationFn: async (input: { defId: string; rarity: any }) => {
      return await buySpell({ data: input });
    },
    onSuccess: (res) => {
      setPlayer(res.player);
      invalidateInventory();
    },
  });

  const defeatBossM = useMutation({
    mutationFn: async (input: { mapId: any }) => {
      return await defeatBoss({ data: input });
    },
    onSuccess: (res) => {
      setPlayer(res.player);
      invalidateInventory();
    },
  });

  const fountainM = useMutation({
    mutationFn: async () => {
      return await useFountain();
    },
    onSuccess: (res) => setPlayer(res.player),
  });

  const farmM = useMutation({
    mutationFn: async () => {
      return await useFarm();
    },
    onSuccess: (res) => setPlayer(res.player),
  });

  const beerM = useMutation({
    mutationFn: async (beerId: string) => {
      return await useBeer({ data: { beerId } });
    },
    onSuccess: setPlayer,
  });

  return {
    ...query,
    create,
    update,
    syncHp,
    spendEnergy,
    study,
    reward,
    inventory,
    buyItem: buyItemM,
    placeItem: placeItemM,
    discardItem: discardItemM,
    useItem: useItemM,
    sellItem: sellItemM,
    buySpell: buySpellM,
    defeatBoss: defeatBossM,
    fountain: fountainM,
    farm: farmM,
    beer: beerM,
  };
}
