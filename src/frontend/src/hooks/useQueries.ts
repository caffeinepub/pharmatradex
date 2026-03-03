import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  Announcement,
  AnnouncementType,
  BuyerStats,
  CompanyStats,
  Order,
  OrderStatus,
  Product,
  UserProfile,
  UserRole,
} from "../backend.d";
import { useActor } from "./useActor";

// ---- User Queries ----

export function useCallerProfile() {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile | null>({
    queryKey: ["callerProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllCompanyProfiles() {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile[]>({
    queryKey: ["allCompanyProfiles"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllCompanyProfiles();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCompanyProfile(companyId: Principal | undefined) {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile | null>({
    queryKey: ["companyProfile", companyId?.toString()],
    queryFn: async () => {
      if (!actor || !companyId) return null;
      return actor.getCompanyProfile(companyId);
    },
    enabled: !!actor && !isFetching && !!companyId,
  });
}

// ---- Product Queries ----

export function useAllActiveProducts() {
  const { actor, isFetching } = useActor();
  return useQuery<Product[]>({
    queryKey: ["allActiveProducts"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllActiveProducts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useProductsByCompany(companyId: Principal | undefined) {
  const { actor, isFetching } = useActor();
  return useQuery<Product[]>({
    queryKey: ["productsByCompany", companyId?.toString()],
    queryFn: async () => {
      if (!actor || !companyId) return [];
      return actor.getProductsByCompany(companyId);
    },
    enabled: !!actor && !isFetching && !!companyId,
  });
}

export function useProduct(productId: bigint | undefined) {
  const { actor, isFetching } = useActor();
  return useQuery<Product | null>({
    queryKey: ["product", productId?.toString()],
    queryFn: async () => {
      if (!actor || productId === undefined) return null;
      return actor.getProduct(productId);
    },
    enabled: !!actor && !isFetching && productId !== undefined,
  });
}

export function useSearchProducts(searchTerm: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Product[]>({
    queryKey: ["searchProducts", searchTerm],
    queryFn: async () => {
      if (!actor) return [];
      if (!searchTerm.trim()) return actor.getAllActiveProducts();
      return actor.searchProductsByName(searchTerm);
    },
    enabled: !!actor && !isFetching,
  });
}

// ---- Order Queries ----

export function useMyOrders() {
  const { actor, isFetching } = useActor();
  return useQuery<Order[]>({
    queryKey: ["myOrders"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyOrders();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIncomingOrders() {
  const { actor, isFetching } = useActor();
  return useQuery<Order[]>({
    queryKey: ["incomingOrders"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getIncomingOrders();
    },
    enabled: !!actor && !isFetching,
  });
}

// ---- Announcement Queries ----

export function useAllActiveAnnouncements() {
  const { actor, isFetching } = useActor();
  return useQuery<Announcement[]>({
    queryKey: ["allActiveAnnouncements"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllActiveAnnouncements();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAnnouncementsByCompany(companyId: Principal | undefined) {
  const { actor, isFetching } = useActor();
  return useQuery<Announcement[]>({
    queryKey: ["announcementsByCompany", companyId?.toString()],
    queryFn: async () => {
      if (!actor || !companyId) return [];
      return actor.getAnnouncementsByCompany(companyId);
    },
    enabled: !!actor && !isFetching && !!companyId,
  });
}

// ---- Stats Queries ----

export function useCompanyStats() {
  const { actor, isFetching } = useActor();
  return useQuery<CompanyStats | null>({
    queryKey: ["companyStats"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCompanyStats();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useBuyerStats() {
  const { actor, isFetching } = useActor();
  return useQuery<BuyerStats | null>({
    queryKey: ["buyerStats"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getBuyerStats();
    },
    enabled: !!actor && !isFetching,
  });
}

// ---- Mutations ----

export function useRegisterUser() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      name: string;
      role: UserRole;
      companyName: string;
      contactEmail: string;
      phone: string;
      address: string;
      description: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.registerUser(
        data.name,
        data.role,
        data.companyName,
        data.contactEmail,
        data.phone,
        data.address,
        data.description,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["callerProfile"] });
    },
  });
}

export function useUpdateUserProfile() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      name: string;
      companyName: string;
      contactEmail: string;
      phone: string;
      address: string;
      description: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.updateUserProfile(
        data.name,
        data.companyName,
        data.contactEmail,
        data.phone,
        data.address,
        data.description,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["callerProfile"] });
    },
  });
}

export function useCreateProduct() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      name: string;
      description: string;
      category: string;
      unitPrice: number;
      minimumOrderQty: bigint;
      stockAvailable: bigint;
      imageUrl: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.createProduct(
        data.name,
        data.description,
        data.category,
        data.unitPrice,
        data.minimumOrderQty,
        data.stockAvailable,
        data.imageUrl,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allActiveProducts"] });
      qc.invalidateQueries({ queryKey: ["productsByCompany"] });
      qc.invalidateQueries({ queryKey: ["companyStats"] });
    },
  });
}

export function useUpdateProduct() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      productId: bigint;
      name: string;
      description: string;
      category: string;
      unitPrice: number;
      minimumOrderQty: bigint;
      stockAvailable: bigint;
      imageUrl: string;
      isActive: boolean;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.updateProduct(
        data.productId,
        data.name,
        data.description,
        data.category,
        data.unitPrice,
        data.minimumOrderQty,
        data.stockAvailable,
        data.imageUrl,
        data.isActive,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allActiveProducts"] });
      qc.invalidateQueries({ queryKey: ["productsByCompany"] });
      qc.invalidateQueries({ queryKey: ["product"] });
    },
  });
}

export function useDeleteProduct() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (productId: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteProduct(productId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allActiveProducts"] });
      qc.invalidateQueries({ queryKey: ["productsByCompany"] });
      qc.invalidateQueries({ queryKey: ["companyStats"] });
    },
  });
}

export function usePlaceOrder() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      productId: bigint;
      quantity: bigint;
      notes: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.placeOrder(data.productId, data.quantity, data.notes);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["myOrders"] });
      qc.invalidateQueries({ queryKey: ["buyerStats"] });
      qc.invalidateQueries({ queryKey: ["allActiveProducts"] });
    },
  });
}

export function useCancelOrder() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (orderId: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.cancelOrder(orderId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["myOrders"] });
      qc.invalidateQueries({ queryKey: ["incomingOrders"] });
      qc.invalidateQueries({ queryKey: ["buyerStats"] });
      qc.invalidateQueries({ queryKey: ["companyStats"] });
    },
  });
}

export function useUpdateOrderStatus() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { orderId: bigint; newStatus: OrderStatus }) => {
      if (!actor) throw new Error("No actor");
      return actor.updateOrderStatus(data.orderId, data.newStatus);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["incomingOrders"] });
      qc.invalidateQueries({ queryKey: ["myOrders"] });
      qc.invalidateQueries({ queryKey: ["companyStats"] });
    },
  });
}

export function useCreateAnnouncement() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      title: string;
      content: string;
      announcementType: AnnouncementType;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.createAnnouncement(
        data.title,
        data.content,
        data.announcementType,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allActiveAnnouncements"] });
      qc.invalidateQueries({ queryKey: ["announcementsByCompany"] });
    },
  });
}

export function useUpdateAnnouncement() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      announcementId: bigint;
      title: string;
      content: string;
      announcementType: AnnouncementType;
      isActive: boolean;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.updateAnnouncement(
        data.announcementId,
        data.title,
        data.content,
        data.announcementType,
        data.isActive,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allActiveAnnouncements"] });
      qc.invalidateQueries({ queryKey: ["announcementsByCompany"] });
    },
  });
}

export function useDeactivateAnnouncement() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (announcementId: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.deactivateAnnouncement(announcementId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allActiveAnnouncements"] });
      qc.invalidateQueries({ queryKey: ["announcementsByCompany"] });
    },
  });
}

export function useSeedSampleData() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("No actor");
      return actor.seedSampleData();
    },
    onSuccess: () => {
      qc.invalidateQueries();
    },
  });
}
