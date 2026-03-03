import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Product {
    id: bigint;
    name: string;
    createdAt: bigint;
    description: string;
    minimumOrderQty: bigint;
    isActive: boolean;
    imageUrl: string;
    currency: string;
    companyName: string;
    category: string;
    unitPrice: number;
    stockAvailable: bigint;
    companyId: Principal;
}
export interface BuyerStats {
    totalOrders: bigint;
    pendingOrders: bigint;
    deliveredOrders: bigint;
}
export interface Announcement {
    id: bigint;
    title: string;
    content: string;
    announcementType: AnnouncementType;
    createdAt: bigint;
    isActive: boolean;
    companyName: string;
    companyId: Principal;
}
export interface Order {
    id: bigint;
    status: OrderStatus;
    supplierName: string;
    createdAt: bigint;
    productId: bigint;
    productName: string;
    updatedAt: bigint;
    totalAmount: number;
    notes: string;
    buyerId: Principal;
    quantity: bigint;
    buyerName: string;
    unitPrice: number;
    buyerRole: UserRole;
    supplierId: Principal;
}
export interface UserProfile {
    userId: Principal;
    name: string;
    createdAt: bigint;
    role: UserRole;
    description: string;
    address: string;
    contactEmail: string;
    companyName: string;
    phone: string;
}
export interface CompanyStats {
    totalProducts: bigint;
    totalOrders: bigint;
    pendingOrders: bigint;
    totalRevenue: number;
}
export enum AnnouncementType {
    TradeOffer = "TradeOffer",
    NewProduct = "NewProduct",
    Promotion = "Promotion",
    General = "General"
}
export enum OrderStatus {
    Delivered = "Delivered",
    Confirmed = "Confirmed",
    Cancelled = "Cancelled",
    Shipped = "Shipped",
    Pending = "Pending"
}
export enum UserRole {
    Distributor = "Distributor",
    Retailer = "Retailer",
    Company = "Company"
}
export enum UserRole__1 {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole__1): Promise<void>;
    cancelOrder(orderId: bigint): Promise<void>;
    createAnnouncement(title: string, content: string, announcementType: AnnouncementType): Promise<bigint>;
    createProduct(name: string, description: string, category: string, unitPrice: number, minimumOrderQty: bigint, stockAvailable: bigint, imageUrl: string): Promise<bigint>;
    deactivateAnnouncement(announcementId: bigint): Promise<void>;
    deleteProduct(productId: bigint): Promise<void>;
    getAllActiveAnnouncements(): Promise<Array<Announcement>>;
    getAllActiveProducts(): Promise<Array<Product>>;
    getAllCompanyProfiles(): Promise<Array<UserProfile>>;
    getAnnouncementsByCompany(companyId: Principal): Promise<Array<Announcement>>;
    getAnnouncementsByType(announcementType: AnnouncementType): Promise<Array<Announcement>>;
    getBuyerStats(): Promise<BuyerStats>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole__1>;
    getCompanyProfile(companyId: Principal): Promise<UserProfile | null>;
    getCompanyStats(): Promise<CompanyStats>;
    getIncomingOrders(): Promise<Array<Order>>;
    getMyOrders(): Promise<Array<Order>>;
    getOrder(orderId: bigint): Promise<Order | null>;
    getProduct(productId: bigint): Promise<Product | null>;
    getProductsByCategory(category: string): Promise<Array<Product>>;
    getProductsByCompany(companyId: Principal): Promise<Array<Product>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    placeOrder(productId: bigint, quantity: bigint, notes: string): Promise<bigint>;
    registerUser(name: string, role: UserRole, companyName: string, contactEmail: string, phone: string, address: string, description: string): Promise<UserProfile>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchProductsByName(searchTerm: string): Promise<Array<Product>>;
    seedSampleData(): Promise<void>;
    updateAnnouncement(announcementId: bigint, title: string, content: string, announcementType: AnnouncementType, isActive: boolean): Promise<void>;
    updateOrderStatus(orderId: bigint, newStatus: OrderStatus): Promise<void>;
    updateProduct(productId: bigint, name: string, description: string, category: string, unitPrice: number, minimumOrderQty: bigint, stockAvailable: bigint, imageUrl: string, isActive: boolean): Promise<void>;
    updateUserProfile(name: string, companyName: string, contactEmail: string, phone: string, address: string, description: string): Promise<UserProfile>;
}
