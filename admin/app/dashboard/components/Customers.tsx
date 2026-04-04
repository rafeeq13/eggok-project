'use client';
import { useState, useEffect } from 'react';

type Customer = {
  id: number;
  name: string;
  email: string;
  phone: string;
  totalOrders: number;
  totalSpent: number;
  lastOrder: string;
  joinDate: string;
};

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api';

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/customers`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setCustomers(data);
      } else {
        setCustomers([]);
      }
    } catch (err) {
      console.error('Failed to fetch customers:', err);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);



  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

  const totalRevenue = customers.reduce((a, c) => a + Number(c.totalSpent), 0);
  const totalOrders = customers.reduce((a, c) => a + Number(c.totalOrders), 0);

  return (
    <div style={{ maxWidth: '900px' }}>

      {/* Customer Detail Modal */}
      {selectedCustomer && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '480px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#FEFEFE' }}>Customer Details</h2>
              <button onClick={() => setSelectedCustomer(null)} style={{ background: 'transparent', color: '#888888', fontSize: '20px', border: 'none', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#FED800', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', fontWeight: '800', color: '#000' }}>
                {selectedCustomer.name.charAt(0)}
              </div>
              <div>
                <p style={{ fontSize: '16px', fontWeight: '700', color: '#FEFEFE' }}>{selectedCustomer.name}</p>
                <p style={{ fontSize: '12px', color: '#888888', marginTop: '2px' }}>Customer since {selectedCustomer.joinDate}</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              {[
                { label: 'Email', value: selectedCustomer.email },
                { label: 'Phone', value: selectedCustomer.phone },
                { label: 'Last Order', value: selectedCustomer.lastOrder },
              ].map((item) => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#111111', borderRadius: '8px' }}>
                  <span style={{ fontSize: '12px', color: '#888888' }}>{item.label}</span>
                  <span style={{ fontSize: '12px', color: '#FEFEFE', fontWeight: '500' }}>{item.value}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div style={{ background: '#111111', borderRadius: '10px', padding: '14px', textAlign: 'center' }}>
                <p style={{ fontSize: '11px', color: '#888888', marginBottom: '6px' }}>Total Orders</p>
                <p style={{ fontSize: '24px', fontWeight: '700', color: '#FED800' }}>{selectedCustomer.totalOrders}</p>
              </div>
              <div style={{ background: '#111111', borderRadius: '10px', padding: '14px', textAlign: 'center' }}>
                <p style={{ fontSize: '11px', color: '#888888', marginBottom: '6px' }}>Total Spent</p>
                <p style={{ fontSize: '24px', fontWeight: '700', color: '#22C55E' }}>${Number(selectedCustomer.totalSpent).toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
        {[
          { label: 'Total Customers', value: String(customers.length), color: '#FED800' },
          { label: 'Total Orders', value: String(totalOrders), color: '#22C55E' },
          { label: 'Total Revenue', value: `$${totalRevenue.toFixed(2)}`, color: '#FECE86' },
        ].map((s, i) => (
          <div key={i} style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '12px', padding: '16px 20px' }}>
            <p style={{ fontSize: '12px', color: '#888888', marginBottom: '6px' }}>{s.label}</p>
            <p style={{ fontSize: '24px', fontWeight: '700', color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div style={{ marginBottom: '16px' }}>
        <input
          placeholder="Search by name, email or phone..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: '100%', padding: '11px 16px', background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '10px', color: '#FEFEFE', fontSize: '13px' }}
          onFocus={e => e.target.style.borderColor = '#FED800'}
          onBlur={e => e.target.style.borderColor = '#2A2A2A'}
        />
      </div>

      {/* Customer Table */}
      <div style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #2A2A2A' }}>
                {['Customer', 'Email', 'Phone', 'Orders', 'Spent', 'Last Order', ''].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#888888', letterSpacing: '0.5px', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#888888', fontSize: '13px' }}>
                    No customers found
                  </td>
                </tr>
              ) : (
                filtered.map((c, i) => (
                  <tr key={c.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid #2A2A2A' : 'none' }}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#FED800', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '700', color: '#000', flexShrink: 0 }}>
                          {c.name.charAt(0)}
                        </div>
                        <span style={{ fontSize: '13px', fontWeight: '600', color: '#FEFEFE' }}>{c.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '12px', color: '#888888' }}>{c.email}</td>
                    <td style={{ padding: '14px 16px', fontSize: '12px', color: '#888888' }}>{c.phone}</td>
                    <td style={{ padding: '14px 16px', fontSize: '13px', fontWeight: '600', color: '#FED800' }}>{c.totalOrders}</td>
                    <td style={{ padding: '14px 16px', fontSize: '13px', fontWeight: '600', color: '#22C55E' }}>${Number(c.totalSpent).toFixed(2)}</td>
                    <td style={{ padding: '14px 16px', fontSize: '12px', color: '#888888' }}>{c.lastOrder}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <button onClick={() => setSelectedCustomer(c)} style={{ padding: '5px 12px', background: 'transparent', border: '1px solid #2A2A2A', borderRadius: '6px', color: '#888888', fontSize: '11px', cursor: 'pointer' }}>View</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}