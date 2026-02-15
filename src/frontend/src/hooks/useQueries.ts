import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { UserProfile, Product, Order, Commission, PayoutRequest, ReferralBonus, FixedReferralBonusSummary } from '../backend';
import type { Principal } from '@dfinity/principal';

// ============ USER PROFILE ============

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useGetUserProfile(user: Principal | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<UserProfile | null>({
    queryKey: ['userProfile', user?.toString()],
    queryFn: async () => {
      if (!actor || !user) return null;
      return actor.getUserProfile(user);
    },
    enabled: !!actor && !actorFetching && !!user,
  });
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useRegisterWithReferral() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ profile, referrerCode }: { profile: UserProfile; referrerCode: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.registerWithReferral(profile, referrerCode);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// ============ ADMIN & ROLES ============

export function useIsCallerAdmin() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<boolean>({
    queryKey: ['isAdmin', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) return false;
      try {
        return await actor.isCallerAdmin();
      } catch {
        return false;
      }
    },
    enabled: !!actor && !actorFetching && !!identity,
  });
}

// ============ REFERRALS ============

export function useGetDirectReferrals() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Principal[]>({
    queryKey: ['directReferrals'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getDirectReferrals();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetDownlineStructure() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<{
    level1: Principal[];
    level2: Principal[];
    level1Count: bigint;
    level2Count: bigint;
  }>({
    queryKey: ['downlineStructure'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getDownlineStructure();
    },
    enabled: !!actor && !actorFetching,
  });
}

// ============ CATALOG ============

export function useGetAllProducts() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllProducts();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetProduct(productId: bigint | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Product | null>({
    queryKey: ['product', productId?.toString()],
    queryFn: async () => {
      if (!actor || productId === null) return null;
      return actor.getProduct(productId);
    },
    enabled: !!actor && !actorFetching && productId !== null,
  });
}

export function useCreateProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      name,
      description,
      price,
      category,
    }: {
      name: string;
      description: string;
      price: bigint;
      category: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createProduct(name, description, price, category);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useUpdateProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      productId,
      name,
      description,
      price,
      category,
    }: {
      productId: bigint;
      name: string;
      description: string;
      price: bigint;
      category: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateProduct(productId, name, description, price, category);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product', variables.productId.toString()] });
    },
  });
}

// ============ ID PRODUCT MANAGEMENT ============

export function useGetIdProducts() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<bigint[]>({
    queryKey: ['idProducts'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getIdProducts();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useDesignateIdProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.designateIdProduct(productId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['idProducts'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useRemoveIdProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.removeIdProduct(productId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['idProducts'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

// ============ ORDERS ============

export function usePlaceOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productId, quantity }: { productId: bigint; quantity: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.placeOrder(productId, quantity);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

export function useGetOrderHistory() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<Order[]>({
    queryKey: ['orders', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return [];
      return actor.getOrderHistory(identity.getPrincipal());
    },
    enabled: !!actor && !actorFetching && !!identity,
  });
}

// ============ EARNINGS ============

export function useGetEarningsDashboard() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<{
    balance: bigint;
    totalEarned: bigint;
    totalWithdrawn: bigint;
    commissionHistory: Commission[];
  }>({
    queryKey: ['earnings'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getEarningsDashboard();
    },
    enabled: !!actor && !actorFetching,
  });
}

// ============ REFERRAL BONUS (7-LEVEL) ============

export function useGetFixedReferralBonusSummary() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<FixedReferralBonusSummary>({
    queryKey: ['referralBonusSummary'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getFixedReferralBonusSummary();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetReferralBonusHistory() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<ReferralBonus[]>({
    queryKey: ['referralBonusHistory'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getReferralBonusHistory();
    },
    enabled: !!actor && !actorFetching,
  });
}

// ============ PAYOUTS ============

export function useRequestPayout() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (amount: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.requestPayout(amount);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payouts'] });
      queryClient.invalidateQueries({ queryKey: ['earnings'] });
    },
  });
}

export function useGetMyPayoutRequests() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<PayoutRequest[]>({
    queryKey: ['payouts'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyPayoutRequests();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetAllPayoutRequests() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<PayoutRequest[]>({
    queryKey: ['allPayouts'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllPayoutRequests();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useProcessPayoutRequest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ requestId, approved }: { requestId: bigint; approved: boolean }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.processPayoutRequest(requestId, approved);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allPayouts'] });
      queryClient.invalidateQueries({ queryKey: ['earnings'] });
    },
  });
}
