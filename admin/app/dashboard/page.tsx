'use client';
import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import StoreSettings from './components/StoreSettings';
import Promotions from './components/Promotions';
import Customers from './components/Customers';
import ItemForm from './components/ItemForm';
import MenuManagement from './components/MenuManagement';
import TeamManagement from './components/TeamManagement';
import Analytics from './components/Analytics';
import OrdersManagement from './components/OrdersManagement';
import DeliverySettings from './components/DeliverySettings';
import Payments from './components/Payments';
import BusinessProfile from './components/BusinessProfile';
import Integrations from './components/Integrations';
import Notifications from './components/Notifications';
import Reviews from './components/Reviews';
import Loyalty from './components/Loyalty';
import Submissions from './components/Submissions';
import KitchenDisplay from './components/KitchenDisplay';
import { API, adminFetch, adminLogout } from '../../lib/api';

const statusColor: Record<string, string> = {
  pending_payment: '#9CA3AF',
  paid: '#10B981',
  sent_to_kitchen: '#F59E0B',
  pending: '#F59E0B',
  confirmed: '#60A5FA',
  Preparing: '#F59E0B',
  preparing: '#F59E0B',
  Ready: '#22C55E',
  ready: '#22C55E',
  out_for_delivery: '#A78BFA',
  Delivered: '#FEFEFE',
  delivered: '#FEFEFE',
  picked_up: '#FEFEFE',
  cancelled: '#FC0301',
};

function DashboardContent() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const [adminUser, setAdminUser] = useState<{ name: string; role: string } | null>(null);
  const [storeOpen, setStoreOpen] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    setHasMounted(true);
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);

    // Load admin user from localStorage - redirect if not logged in
    try {
      const saved = localStorage.getItem('admin_user');
      if (saved) {
        setAdminUser(JSON.parse(saved));
      } else {
        router.push('/');
        return;
      }
    } catch {
      router.push('/');
      return;
    }

    // Fetch store status
    adminFetch(`${API}/settings/status`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setStoreOpen(data.isOpen); })
      .catch(() => {});

    return () => window.removeEventListener('resize', check);
  }, []);

  // Role-based access: Staff=orders only, Manager=most tabs, Super Admin=everything
  const allSidebarItems = [
    { id: 'overview', label: 'Overview', icon: '📊', roles: ['Staff', 'Manager', 'Super Admin'] },
    { id: 'orders', label: 'Orders', icon: '🧾', roles: ['Staff', 'Manager', 'Super Admin'] },
    { id: 'kitchen', label: 'Kitchen Display', icon: '🖨️', roles: ['Staff', 'Manager', 'Super Admin'] },
    { id: 'menu', label: 'Menu Management', icon: '🍽️', roles: ['Manager', 'Super Admin'] },
    { id: 'customers', label: 'Customers', icon: '👥', roles: ['Manager', 'Super Admin'] },
    { id: 'promotions', label: 'Promotions', icon: '🎟️', roles: ['Manager', 'Super Admin'] },
    { id: 'analytics', label: 'Analytics', icon: '📈', roles: ['Manager', 'Super Admin'] },
    { id: 'payments', label: 'Payments', icon: '💳', roles: ['Super Admin'] },
    { id: 'delivery', label: 'Delivery Settings', icon: '🚗', roles: ['Manager', 'Super Admin'] },
    { id: 'team', label: 'Team', icon: '👤', roles: ['Super Admin'] },
    { id: 'business', label: 'Business Profile', icon: '🏪', roles: ['Super Admin'] },
    { id: 'integrations', label: 'Integrations', icon: '🔌', roles: ['Super Admin'] },
    { id: 'submissions', label: 'Submissions', icon: '📬', roles: ['Manager', 'Super Admin'] },
    { id: 'notifications', label: 'Notifications', icon: '🔔', roles: ['Manager', 'Super Admin'] },
    { id: 'reviews', label: 'Reviews', icon: '⭐', roles: ['Manager', 'Super Admin'] },
    { id: 'loyalty', label: 'Loyalty Program', icon: '🎁', roles: ['Manager', 'Super Admin'] },
    { id: 'settings', label: 'Store Settings', icon: '⚙️', roles: ['Super Admin'] },
  ];
  const userRole = adminUser?.role || 'Staff';
  const sidebarItems = allSidebarItems.filter(item => item.roles.includes(userRole));

  const handleTabChange = (id: string) => {
    setActiveTab(id);
    router.replace(`/dashboard?tab=${id}`, { scroll: false });
    if (isMobile) setSidebarOpen(false);
  };

  const sidebarIcons: Record<string, React.ReactElement> = {
    overview: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>,
    orders: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" /><rect x="9" y="3" width="6" height="4" rx="2" /><path d="M9 12h6M9 16h4" /></svg>,
    kitchen: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9V2h12v7" /><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" /><rect x="6" y="14" width="12" height="8" /></svg>,
    menu: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M3 12h18M3 18h18" /></svg>,
    customers: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /></svg>,
    promotions: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></svg>,
    analytics: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>,
    payments: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>,
    delivery: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="1" /><path d="M16 8h4l3 3v5h-7V8z" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>,
    team: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /></svg>,
    business: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>,
    integrations: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.07 4.93a10 10 0 010 14.14M4.93 4.93a10 10 0 000 14.14" /><path d="M14.83 9.17a4 4 0 010 5.66M9.17 9.17a4 4 0 000 5.66" /></svg>,
    notifications: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" /></svg>,
    reviews: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>,
    loyalty: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" /></svg>,
    settings: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" /></svg>,
  };

  const SidebarContent = () => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Brand / Logo */}
      <div style={{ padding: '2px', borderBottom: '1px solid #2A2A2A', display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ borderRadius: '10px', overflow: 'hidden', flexShrink: 0, background: '#000' }}>
            <Image src="/logo.webp" alt="Eggs Ok" width={60} height={60} unoptimized style={{ objectFit: 'contain' }} />
          </div>
          {/* <div>
            <div style={{ fontSize: '12px', fontWeight: '800', color: '#E5B800', letterSpacing: '1px' }}>EGGS OK</div>
            <div style={{ fontSize: '10px', color: '#FEFEFE', marginTop: '1px' }}>Admin Panel</div>
          </div> */}
        </div>
        {isMobile && (
          <button onClick={() => setSidebarOpen(false)} aria-label="Close navigation" style={{ background: 'transparent', border: 'none', color: '#FEFEFE', fontSize: '20px', cursor: 'pointer', padding: '8px', minWidth: '44px', minHeight: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        )}
      </div>

      {/* Nav */}
      <nav role="navigation" aria-label="Dashboard navigation" style={{ padding: '12px 10px', flex: 1, overflowY: 'auto' }}>
        {sidebarItems.map(item => (
          <button key={item.id} onClick={() => handleTabChange(item.id)} aria-current={activeTab === item.id ? 'page' : undefined} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
            padding: '10px 12px', borderRadius: '8px',
            background: activeTab === item.id ? '#E5B800' : 'transparent',
            color: activeTab === item.id ? '#000000' : '#c8c8c8ff',
            fontSize: '12px', fontWeight: activeTab === item.id ? '700' : '400',
            marginBottom: '1px', textAlign: 'left', border: 'none', cursor: 'pointer',
          }}>
            <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
              {sidebarIcons[item.id] || sidebarIcons.settings}
            </span>
            {item.label}
          </button>
        ))}
      </nav>

      {/* Logout */}
      <div style={{ padding: '12px 10px', borderTop: '1px solid #2A2A2A' }}>
        <button onClick={() => adminLogout()} style={{
          width: '100%', padding: '10px 12px',
          background: 'transparent',
          color: '#ffffffff', borderRadius: '8px', fontSize: '12px',
          display: 'flex', alignItems: 'center', gap: '10px',
          border: '1px solid #2A2A2A', cursor: 'pointer',
          transition: 'all 0.15s',
        }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.background = '#1A1A1A';
            (e.currentTarget as HTMLButtonElement).style.color = '#FC0301';
            (e.currentTarget as HTMLButtonElement).style.borderColor = '#FC030140';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
            (e.currentTarget as HTMLButtonElement).style.color = '#ffffffff';
            (e.currentTarget as HTMLButtonElement).style.borderColor = '#2A2A2A';
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Sign Out
        </button>
      </div>
    </div>
  );

  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [todayStats, setTodayStats] = useState<any>(null);
  const [overviewLoading, setOverviewLoading] = useState(true);

  const fetchOverview = async () => {
    try {
      setOverviewLoading(true);
      const [statsRes, ordersRes] = await Promise.all([
        adminFetch(`${API}/orders/stats/today`),
        adminFetch(`${API}/orders`)
      ]);
      const stats = await statsRes.json();
      const orders = await ordersRes.json();
      setTodayStats(stats);
      const ordersList = Array.isArray(orders) ? orders : (orders.data || []);
      setRecentOrders(ordersList.slice(0, 5));
    } catch (err) {
      console.error('Failed to fetch overview:', err);
    } finally {
      setOverviewLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'overview') {
      fetchOverview();
    }
  }, [activeTab]);

  const stats = [
    { label: "Today's Orders", value: todayStats?.totalOrders || '0', sub: 'Total since midnight', color: '#E5B800' },
    { label: "Today's Revenue", value: `$${todayStats?.totalRevenue || '0'}`, sub: 'Gross sales today', color: '#22C55E' },
    { label: 'Pending Orders', value: todayStats?.pendingOrders || '0', sub: 'Awaiting preparation', color: '#F59E0B' },
    { label: 'Avg Order Value', value: `$${todayStats?.avgOrderValue || '0'}`, sub: 'Per transaction', color: '#FECE86' },
  ];

  // Don't render until auth is checked
  if (!hasMounted || !adminUser) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#000' }}><p style={{ color: '#888', fontSize: '14px' }}>Loading...</p></div>;
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#000000' }}>

      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 40 }}
        />
      )}

      {/* Sidebar — Desktop always visible, Mobile drawer */}
      <div style={{
        width: '220px',
        background: '#111111',
        borderRight: '1px solid #2A2A2A',
        flexShrink: 0,
        ...(isMobile && hasMounted ? {
          position: 'fixed', top: 0, left: 0, bottom: 0,
          zIndex: 50, width: '260px',
          transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.25s ease',
        } : {}),
      }}>
        <SidebarContent />
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

        {/* Top Bar */}
        <div style={{
          padding: isMobile ? '12px 16px' : '14px 24px',
          borderBottom: '1px solid #2A2A2A',
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          background: '#111111', flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {isMobile && (
              <button onClick={() => setSidebarOpen(true)} aria-label="Open navigation menu" style={{
                background: 'transparent', border: 'none',
                color: '#FEFEFE', fontSize: '22px', cursor: 'pointer', padding: '2px',
                display: 'flex', alignItems: 'center', minWidth: '44px', minHeight: '44px', justifyContent: 'center',
              }}>☰</button>
            )}
            <div>
              <h1 style={{ fontSize: isMobile ? '15px' : '17px', fontWeight: '700', color: '#FEFEFE' }}>
                {sidebarItems.find(i => i.id === activeTab)?.label}
              </h1>
              {!isMobile && (
                <p style={{ fontSize: '11px', color: '#FEFEFE', marginTop: '1px' }}>
                  3517 Lancaster Ave, Philadelphia PA 19104
                </p>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '8px', height: '8px', background: storeOpen === false ? '#FC0301' : '#22C55E', borderRadius: '50%', flexShrink: 0 }} />
            {!isMobile && <span style={{ fontSize: '11px', color: storeOpen === false ? '#FC0301' : '#22C55E' }}>{storeOpen === false ? 'Store Closed' : 'Store Open'}</span>}
            <div style={{
              padding: '5px 10px', background: '#1A1A1A',
              border: '1px solid #2A2A2A', borderRadius: '8px',
              fontSize: '11px', color: '#CACACA',
            }}>
              {adminUser ? (isMobile ? adminUser.name.split(' ').map(w => w[0]).join('') : adminUser.name) : '...'}
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div style={{ flex: 1, overflow: 'auto', padding: isMobile ? '12px' : '24px', minWidth: 0 }}>
          {/* OVERVIEW */}
          {activeTab === 'overview' && (
            <div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
                gap: '12px', marginBottom: '20px',
              }}>
                {stats.map((stat, i) => (
                  <div key={i} style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '12px', padding: isMobile ? '14px' : '18px' }}>
                    <p style={{ fontSize: '11px', color: '#FEFEFE', marginBottom: '6px' }}>{stat.label}</p>
                    <p style={{ fontSize: isMobile ? '22px' : '26px', fontWeight: '700', color: stat.color }}>{stat.value}</p>
                    <p style={{ fontSize: '10px', color: '#FEFEFE', marginTop: '3px' }}>{stat.sub}</p>
                  </div>
                ))}
              </div>

              <div style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '12px', overflow: 'hidden' }}>
                <div style={{ padding: '14px 16px', borderBottom: '1px solid #2A2A2A', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '13px', fontWeight: '600', color: '#FEFEFE' }}>Recent Orders</h3>
                  <button onClick={() => setActiveTab('orders')} style={{ fontSize: '12px', color: '#E5B800', background: 'transparent', border: 'none', cursor: 'pointer' }}>View All →</button>
                </div>
                {isMobile ? (
                  <div>
                    {recentOrders.map((order, i) => (
                      <div key={i} style={{ padding: '14px 16px', borderBottom: i < recentOrders.length - 1 ? '1px solid #2A2A2A' : 'none' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <span style={{ fontSize: '13px', fontWeight: '700', color: '#E5B800' }}>#{order.orderNumber?.split('-').pop()}</span>
                          <span style={{ fontSize: '13px', fontWeight: '700', color: '#FEFEFE' }}>${order.total}</span>
                        </div>
                        <p style={{ fontSize: '12px', color: '#FEFEFE', marginBottom: '4px' }}>{order.customerName}</p>
                        <p style={{ fontSize: '11px', color: '#FEFEFE', marginBottom: '6px' }}>{Array.isArray(order.items) ? order.items.map((it: any) => it.name).join(', ') : 'No items'}</p>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '20px', fontWeight: '600', background: order.orderType === 'Delivery' ? '#0A1628' : '#1A1A00', color: order.orderType === 'Delivery' ? '#60A5FA' : '#E5B800', border: `1px solid ${order.orderType === 'Delivery' ? '#1E3A5F' : '#3A3A00'}` }}>{order.orderType}</span>
                          <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '20px', fontWeight: '600', color: statusColor[order.status] || '#FEFEFE', background: `${statusColor[order.status] || '#FEFEFE'}18`, border: `1px solid ${statusColor[order.status] || '#FEFEFE'}40` }}>{order.status}</span>
                          <span style={{ fontSize: '10px', color: '#FEFEFE', marginLeft: 'auto' }}>
                            {hasMounted ? new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table role="table" style={{ width: '100%', borderCollapse: 'collapse', minWidth: '520px' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid #2A2A2A' }}>
                          {['Order', 'Customer', 'Items', 'Type', 'Total', 'Status', 'Time'].map(h => (
                            <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '10px', fontWeight: '600', color: '#FEFEFE', letterSpacing: '0.5px', textTransform: 'uppercase' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {recentOrders.map((order, i) => (
                          <tr key={i} style={{ borderBottom: i < recentOrders.length - 1 ? '1px solid #2A2A2A' : 'none' }}>
                            <td style={{ padding: '12px 16px', fontSize: '12px', fontWeight: '600', color: '#E5B800' }}>#{order.orderNumber?.split('-').pop()}</td>
                            <td style={{ padding: '12px 16px', fontSize: '12px', color: '#FEFEFE' }}>{order.customerName}</td>
                            <td style={{ padding: '12px 16px', fontSize: '11px', color: '#FEFEFE' }}>{Array.isArray(order.items) ? order.items.map((it: any) => it.name).join(', ') : 'No items'}</td>
                            <td style={{ padding: '12px 16px' }}>
                              <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '20px', fontWeight: '600', background: order.orderType === 'Delivery' ? '#0A1628' : '#1A1A00', color: order.orderType === 'Delivery' ? '#60A5FA' : '#E5B800', border: `1px solid ${order.orderType === 'Delivery' ? '#1E3A5F' : '#3A3A00'}` }}>{order.orderType}</span>
                            </td>
                            <td style={{ padding: '12px 16px', fontSize: '12px', fontWeight: '600', color: '#FEFEFE' }}>${order.total}</td>
                            <td style={{ padding: '12px 16px' }}>
                              <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '20px', fontWeight: '600', color: statusColor[order.status] || '#FEFEFE', background: `${statusColor[order.status] || '#FEFEFE'}18`, border: `1px solid ${statusColor[order.status] || '#FEFEFE'}40` }}>{order.status}</span>
                            </td>
                            <td style={{ padding: '12px 16px', fontSize: '11px', color: '#FEFEFE' }}>
                              {hasMounted ? new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'orders' && <OrdersManagement />}
          {activeTab === 'kitchen' && <KitchenDisplay />}
          {activeTab === 'menu' && <MenuManagement />}
          {activeTab === 'customers' && <Customers />}
          {activeTab === 'promotions' && <Promotions />}
          {activeTab === 'analytics' && <Analytics />}
          {activeTab === 'payments' && <Payments />}
          {activeTab === 'delivery' && <DeliverySettings />}
          {activeTab === 'team' && <TeamManagement />}
          {activeTab === 'business' && <BusinessProfile />}
          {activeTab === 'integrations' && <Integrations />}
          {activeTab === 'submissions' && <Submissions />}
          {activeTab === 'notifications' && <Notifications />}
          {activeTab === 'reviews' && <Reviews />}
          {activeTab === 'loyalty' && <Loyalty />}
          {activeTab === 'settings' && <StoreSettings />}

        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <Suspense fallback={<div style={{ background: '#000', minHeight: '100vh' }} />}>
      <DashboardContent />
    </Suspense>
  );
}