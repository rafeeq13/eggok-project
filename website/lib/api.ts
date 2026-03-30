 const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api';

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
