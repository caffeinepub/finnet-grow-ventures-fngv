import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface ReferralBonus {
    id: bigint;
    level: bigint;
    referralBy: Principal;
    timestamp: Time;
    amount: bigint;
    associate: Principal;
}
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
export interface FixedReferralBonusSummary {
    level6Count: bigint;
    level1Count: bigint;
    totalLevel3Amount: bigint;
    level4Count: bigint;
    totalLevel4Amount: bigint;
    lastUpdated: Time;
    totalLevel5Amount: bigint;
    level7Count: bigint;
    level2Count: bigint;
    totalLevel6Amount: bigint;
    totalBonuses: bigint;
    totalAmount: bigint;
    level5Count: bigint;
    totalLevel7Amount: bigint;
    totalLevel1Amount: bigint;
    level3Count: bigint;
    totalLevel2Amount: bigint;
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
export interface Product {
    id: bigint;
    name: string;
    createdAt: Time;
    description: string;
    updatedAt: Time;
    category: string;
    price: bigint;
}
export interface UserProfile {
    status: string;
    referralCode: string;
    joinDate: Time;
    name: string;
    email: string;
    referredBy?: Principal;
    referredByAssociateId?: string;
    phone: string;
    associateId: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createProduct(name: string, desc: string, price: bigint, category: string): Promise<Product>;
    designateIdProduct(productId: bigint): Promise<void>;
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
    getFixedReferralBonusSummary(): Promise<FixedReferralBonusSummary>;
    getIdProducts(): Promise<Array<bigint>>;
    getMyPayoutRequests(): Promise<Array<PayoutRequest>>;
    getOrderHistory(user: Principal): Promise<Array<Order>>;
    getProduct(productId: bigint): Promise<Product>;
    getProductsByCategory(category: string): Promise<Array<Product>>;
    getReferralBonusHistory(): Promise<Array<ReferralBonus>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getWalletBalance(): Promise<bigint>;
    isCallerAdmin(): Promise<boolean>;
    markOrderDelivered(orderId: bigint): Promise<void>;
    placeOrder(productId: bigint, quantity: bigint): Promise<Order>;
    processPayoutRequest(requestId: bigint, approved: boolean): Promise<void>;
    registerWithReferral(profile: UserProfile, referrerCode: string): Promise<void>;
    registerWithUplineId(profile: UserProfile, uplineAssociateId: string): Promise<void>;
    removeIdProduct(productId: bigint): Promise<void>;
    requestPayout(amount: bigint): Promise<PayoutRequest>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateProduct(productId: bigint, name: string, desc: string, price: bigint, category: string): Promise<Product>;
    updateWalletBalance(associate: Principal, amount: bigint): Promise<void>;
}
