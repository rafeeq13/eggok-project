export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api';

export interface Category {
  id: number;
  name: string;
  description?: string;
  sortOrder: number;
  isActive: boolean;
}

export interface MenuItem {
  id: number;
  name: string;
  description: string;
  pickupPrice: string;
  deliveryPrice: string;
  image?: string;
  isAvailable: boolean;
  isPopular: boolean;
  categoryId: number;
  category: Category;
}

export async function getCategories(): Promise<Category[]> {
  const res = await fetch(`${API_URL}/menu/categories`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error('Failed to fetch categories');
  return res.json();
}

export async function getMenuItems(): Promise<MenuItem[]> {
  const res = await fetch(`${API_URL}/menu/items`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error('Failed to fetch items');
  return res.json();
}

export async function getFullMenu(): Promise<{ categories: Category[]; items: MenuItem[] }> {
  const [categories, items] = await Promise.all([
    getCategories(),
    getMenuItems(),
  ]);
  return { categories, items };
}

export interface StoreSettings {
  storeOpen: boolean;
  deliveryEnabled: boolean;
  pickupEnabled: boolean;
  pickupWait: number;
  minOrder: number;
  deliveryRadius: number;
  deliveryFee: number;
  closedMessage: string;
  storePhone: string;
  storeEmail: string;
}

export async function getStoreSettings(): Promise<StoreSettings> {
  const res = await fetch(`${API_URL}/settings/store`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error('Failed to fetch store settings');
  const text = await res.text();
  if (!text) return {} as StoreSettings;
  return JSON.parse(text);
}

export async function getBusinessHours(): Promise<any> {
  const res = await fetch(`${API_URL}/settings/hours`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error('Failed to fetch business hours');
  return res.json();
}

export async function getStoreStatus(): Promise<{ isOpen: boolean; message: string; hours: any }> {
  const res = await fetch(`${API_URL}/settings/status`, {
    cache: 'no-store', // Status should always be fresh
  });
  if (!res.ok) throw new Error('Failed to fetch store status');
  return res.json();
}

