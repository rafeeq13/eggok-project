'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';

type ModifierOption = { id: number; name: string; price: number };
type ModifierGroup = { id: number; name: string; required: boolean; minSelections: number; maxSelections: number; options: ModifierOption[] };
type MenuItem = { id: number; categoryId: number; name: string; description: string; pickupPrice: number; deliveryPrice: number; image: string; popular?: boolean; modifiers?: ModifierGroup[] };

type CartItem = {
  id: number;
  item: MenuItem;
  quantity: number;
  selectedModifiers: Record<number, number[]>;
  specialInstructions: string;
};

type CartContextType = {
  cart: CartItem[];
  orderType: 'pickup' | 'delivery';
  setOrderType: (type: 'pickup' | 'delivery') => void;
  deliveryAddress: string;
  setDeliveryAddress: (address: string) => void;
  deliveryApt: string;
  setDeliveryApt: (apt: string) => void;
  deliveryInstructions: string;
  setDeliveryInstructions: (instructions: string) => void;
  scheduleType: 'asap' | 'scheduled';
  setScheduleType: (type: 'asap' | 'scheduled') => void;
  scheduleDate: string;
  setScheduleDate: (date: string) => void;
  scheduleTime: string;
  setScheduleTime: (time: string) => void;
  deliveryFee: number;
  setDeliveryFee: (fee: number) => void;
  deliveryZone: string;
  setDeliveryZone: (zone: string) => void;
  deliveryMinOrder: number;
  setDeliveryMinOrder: (min: number) => void;
  addToCart: (item: MenuItem, quantity: number, selectedModifiers: Record<number, number[]>, specialInstructions: string) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
  getPrice: (item: MenuItem) => number;
};

const CartContext = createContext<CartContextType | null>(null);

const ls = {
  get: (key: string, fallback: string = '') => {
    if (typeof window === 'undefined') return fallback;
    try { return localStorage.getItem(key) || fallback; } catch { return fallback; }
  },
  set: (key: string, value: string) => {
    if (typeof window === 'undefined') return;
    try { localStorage.setItem(key, value); } catch {}
  },
  getJSON: <T,>(key: string, fallback: T): T => {
    if (typeof window === 'undefined') return fallback;
    try {
      const val = localStorage.getItem(key);
      return val ? JSON.parse(val) : fallback;
    } catch { return fallback; }
  },
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api';

export function CartProvider({ children }: { children: React.ReactNode }) {

  const [cart, setCart] = useState<CartItem[]>(() => ls.getJSON('eggok_cart', []));
  const [orderType, setOrderTypeState] = useState<'pickup' | 'delivery'>(() => ls.get('eggok_ordertype', 'pickup') as 'pickup' | 'delivery');
  const [deliveryAddress, setDeliveryAddressState] = useState(() => ls.get('eggok_address'));
  const [deliveryApt, setDeliveryAptState] = useState(() => ls.get('eggok_apt'));
  const [deliveryInstructions, setDeliveryInstructionsState] = useState(() => ls.get('eggok_instructions'));
  const [scheduleType, setScheduleTypeState] = useState<'asap' | 'scheduled'>(() => ls.get('eggok_scheduletype', 'asap') as 'asap' | 'scheduled');
  const [scheduleDate, setScheduleDateState] = useState(() => ls.get('eggok_scheduledate'));
  const [scheduleTime, setScheduleTimeState] = useState(() => ls.get('eggok_scheduletime'));
  const [deliveryFee, setDeliveryFeeState] = useState(() => parseFloat(ls.get('eggok_deliveryfee', '0')));
  const [deliveryZone, setDeliveryZoneState] = useState(() => ls.get('eggok_deliveryzone'));
  const [deliveryMinOrder, setDeliveryMinOrderState] = useState(() => parseFloat(ls.get('eggok_deliveryminorder', '0')));

  // Fetch default delivery fee from backend delivery zones
  useEffect(() => {
    const savedZone = ls.get('eggok_deliveryzone');
    if (savedZone) return; // Already set by zone validation
    fetch(`${API_URL}/settings/delivery_settings`)
      .then(r => r.ok ? r.text() : '')
      .then(text => {
        if (!text) return;
        const data = JSON.parse(text);
        const zones = data?.zones?.filter((z: any) => z.active) || [];
        if (zones.length > 0) {
          // Use the cheapest zone's fee as default
          const cheapest = zones.reduce((min: any, z: any) => z.deliveryFee < min.deliveryFee ? z : min, zones[0]);
          setDeliveryFeeState(Number(cheapest.deliveryFee));
          ls.set('eggok_deliveryfee', String(cheapest.deliveryFee));
        } else {
          // Fallback to store settings base fee
          fetch(`${API_URL}/settings/store`)
            .then(r => r.ok ? r.text() : '')
            .then(t => {
              if (!t) return;
              const store = JSON.parse(t);
              if (store?.deliveryFee) {
                setDeliveryFeeState(Number(store.deliveryFee));
                ls.set('eggok_deliveryfee', String(store.deliveryFee));
              }
            })
            .catch(() => {});
        }
      })
      .catch(() => {});
  }, []);

  // Persist cart
  useEffect(() => { ls.set('eggok_cart', JSON.stringify(cart)); }, [cart]);

  // Persist orderType
  useEffect(() => { ls.set('eggok_ordertype', orderType); }, [orderType]);

  // Persist schedule
  useEffect(() => {
    ls.set('eggok_scheduletype', scheduleType);
    ls.set('eggok_scheduledate', scheduleDate);
    ls.set('eggok_scheduletime', scheduleTime);
  }, [scheduleType, scheduleDate, scheduleTime]);

  // Setters with localStorage sync
  const setOrderType = (type: 'pickup' | 'delivery') => { setOrderTypeState(type); ls.set('eggok_ordertype', type); };
  const setDeliveryAddress = (val: string) => { setDeliveryAddressState(val); ls.set('eggok_address', val); };
  const setDeliveryApt = (val: string) => { setDeliveryAptState(val); ls.set('eggok_apt', val); };
  const setDeliveryInstructions = (val: string) => { setDeliveryInstructionsState(val); ls.set('eggok_instructions', val); };
  const setScheduleType = (val: 'asap' | 'scheduled') => { setScheduleTypeState(val); ls.set('eggok_scheduletype', val); };
  const setScheduleDate = (val: string) => { setScheduleDateState(val); ls.set('eggok_scheduledate', val); };
  const setScheduleTime = (val: string) => { setScheduleTimeState(val); ls.set('eggok_scheduletime', val); };
  const setDeliveryFee = (val: number) => { setDeliveryFeeState(val); ls.set('eggok_deliveryfee', String(val)); };
  const setDeliveryZone = (val: string) => { setDeliveryZoneState(val); ls.set('eggok_deliveryzone', val); };
  const setDeliveryMinOrder = (val: number) => { setDeliveryMinOrderState(val); ls.set('eggok_deliveryminorder', String(val)); };

  const getPrice = (item: MenuItem) => orderType === 'pickup' ? item.pickupPrice : item.deliveryPrice;

  const addToCart = (item: MenuItem, quantity: number, selectedModifiers: Record<number, number[]>, specialInstructions: string) => {
    setCart(prev => {
      const existing = prev.find(c =>
        c.item.id === item.id &&
        JSON.stringify(c.selectedModifiers) === JSON.stringify(selectedModifiers)
      );
      if (existing) {
        return prev.map(c => c.item.id === item.id && JSON.stringify(c.selectedModifiers) === JSON.stringify(selectedModifiers)
          ? { ...c, quantity: c.quantity + quantity }
          : c
        );
      }
      return [...prev, { id: Date.now(), item, quantity, selectedModifiers, specialInstructions }];
    });
  };

  const removeFromCart = (id: number) => setCart(prev => prev.filter(c => c.id !== id));

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity <= 0) { removeFromCart(id); return; }
    setCart(prev => prev.map(c => c.id === id ? { ...c, quantity } : c));
  };

  const clearCart = () => {
    setCart([]);
    ls.set('eggok_cart', '[]');
  };

  const cartCount = cart.reduce((a, c) => a + c.quantity, 0);

  const cartTotal = cart.reduce((total, cartItem) => {
    let itemTotal = getPrice(cartItem.item) * cartItem.quantity;
    if (cartItem.item.modifiers) {
      cartItem.item.modifiers.forEach(group => {
        const selected = cartItem.selectedModifiers[group.id] || [];
        selected.forEach(optId => {
          const opt = group.options.find(o => o.id === optId);
          if (opt) itemTotal += opt.price * cartItem.quantity;
        });
      });
    }
    return total + itemTotal;
  }, 0);

  return (
    <CartContext.Provider value={{
      cart, orderType, setOrderType,
      deliveryAddress, setDeliveryAddress,
      deliveryApt, setDeliveryApt,
      deliveryInstructions, setDeliveryInstructions,
      scheduleType, setScheduleType,
      scheduleDate, setScheduleDate,
      scheduleTime, setScheduleTime,
      deliveryFee, setDeliveryFee,
      deliveryZone, setDeliveryZone,
      deliveryMinOrder, setDeliveryMinOrder,
      addToCart, removeFromCart, updateQuantity, clearCart,
      cartCount, cartTotal, getPrice,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}