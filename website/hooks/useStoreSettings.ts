'use client';
import { useState, useEffect } from 'react';
import { getStoreSettings, getStoreStatus, StoreSettings } from '../lib/api';

export function useStoreSettings() {
    const [settings, setSettings] = useState<StoreSettings | null>(null);
    const [status, setStatus] = useState<{ isOpen: boolean; message: string; hours: any } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
                const [settingsData, statusData] = await Promise.all([
                    getStoreSettings(),
                    getStoreStatus()
                ]);
                setSettings(settingsData);
                setStatus(statusData);
            } catch (err) {
                console.error('Failed to fetch store settings:', err);
                setError('Failed to load store settings');
            } finally {
                setLoading(false);
            }
        }

        fetchData();

        // Refresh status every 5 minutes
        const interval = setInterval(async () => {
            try {
                const statusData = await getStoreStatus();
                setStatus(statusData);
            } catch (err) {
                console.error('Failed to refresh store status:', err);
            }
        }, 5 * 60 * 1000);

        return () => clearInterval(interval);
    }, []);

    return {
        settings,
        status,
        loading,
        error,
        isOpen: status?.isOpen ?? false,
        statusMessage: status?.message ?? 'Loading...',
        isDeliveryEnabled: settings?.deliveryEnabled ?? true,
        isPickupEnabled: settings?.pickupEnabled ?? true,
        closedMessage: settings?.closedMessage ?? 'Closed',
        pickupWait: settings?.pickupWait ?? 15,
        deliveryFee: settings?.deliveryFee ?? 0,
        minOrder: settings?.minOrder ?? 10,
        taxRate: settings?.taxRate ?? 0.08,
        storeName: settings?.storeName ?? 'Eggs Ok',
        storeAddress: settings?.storeAddress ?? '3517 Lancaster Ave, Philadelphia, PA 19104, United States',
        storeTimezone: settings?.storeTimezone ?? 'America/New_York',
    };
}
