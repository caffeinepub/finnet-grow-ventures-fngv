import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Time = bigint;
export interface Commission {
    id: bigint;
    level: bigint;
    orderId: bigint;
    timestamp: Time;
    amount: bigint;
    associate: Principal;
}
export interface PayoutRequest {
    id: bigint;
    status: string;
    processedBy?: Principal;
    processedDate?: Time;
    amount: bigint;
    requestDate: Time;
    associate: Principal;
}
export interface Order {
    id: bigint;
    status: string;
    orderDate: Time;
    productId: bigint;
    totalAmount: bigint;
    quantity: bigint;
    associate: Principal;
}
export interface UserProfile {
    status: string;
    referralCode: string;
    joinDate: Time;
    name: string;
    email: string;
    referredBy?: Principal;
    phone: string;
}
export interface Product {
    id: bigint;
    name: string;
    createdAt: Time;
    description: string;
    updatedAt: Time;
    category: string;
    price: bigint;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createProduct(name: string, desc: string, price: bigint, category: string): Promise<Product>;
    getAllPayoutRequests(): Promise<Array<PayoutRequest>>;
    getAllProducts(): Promise<Array<Product>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getDirectReferrals(): Promise<Array<Principal>>;
    getDownlineStructure(): Promise<{
        level1Count: bigint;
        level2Count: bigint;
        level1: Array<Principal>;
        level2: Array<Principal>;
    }>;
    getEarningsDashboard(): Promise<{
        balance: bigint;
        totalEarned: bigint;
        commissionHistory: Array<Commission>;
        totalWithdrawn: bigint;
    }>;
    getMyPayoutRequests(): Promise<Array<PayoutRequest>>;
    getOrderHistory(user: Principal): Promise<Array<Order>>;
    getProduct(productId: bigint): Promise<Product>;
    getProductsByCategory(category: string): Promise<Array<Product>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getWalletBalance(): Promise<bigint>;
    isCallerAdmin(): Promise<boolean>;
    markOrderDelivered(orderId: bigint): Promise<void>;
    placeOrder(productId: bigint, quantity: bigint): Promise<Order>;
    processPayoutRequest(requestId: bigint, approved: boolean): Promise<void>;
    registerWithReferral(profile: UserProfile, referrerCode: string): Promise<void>;
    requestPayout(amount: bigint): Promise<PayoutRequest>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateProduct(productId: bigint, name: string, desc: string, price: bigint, category: string): Promise<Product>;
    updateWalletBalance(associate: Principal, amount: bigint): Promise<void>;
}
