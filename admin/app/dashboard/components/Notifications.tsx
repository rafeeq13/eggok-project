'use client';
import { useState } from 'react';

type NotifTab = 'templates' | 'push' | 'history';

type EmailTemplate = {
  id: string;
  name: string;
  subject: string;
  trigger: string;
  body: string;
  active: boolean;
};

type PushTemplate = {
  id: string;
  name: string;
  title: string;
  body: string;
  trigger: string;
  active: boolean;
};

type NotifHistory = {
  id: number;
  type: 'Email' | 'Push';
  recipient: string;
  subject: string;
  status: 'Sent' | 'Failed' | 'Pending';
  time: string;
};

const initialEmailTemplates: EmailTemplate[] = [
  {
    id: 'order_confirmed',
    name: 'Order Confirmation',
    subject: 'Your Eggs Ok order #{{order_id}} is confirmed!',
    trigger: 'When customer places an order',
    body: `Hi {{customer_name}},\n\nThank you for your order! Here are your order details:\n\nOrder #{{order_id}}\n{{order_items}}\n\nSubtotal: {{subtotal}}\nDelivery Fee: {{delivery_fee}}\nTotal: {{total}}\n\nEstimated time: {{estimated_time}}\n\nThank you for choosing Eggs Ok!\n3517 Lancaster Ave, Philadelphia PA 19104`,
    active: true,
  },
  {
    id: 'order_ready',
    name: 'Order Ready for Pickup',
    subject: 'Your Eggs Ok order is ready!',
    trigger: 'When order status changes to Ready',
    body: `Hi {{customer_name}},\n\nGreat news! Your order #{{order_id}} is ready for pickup.\n\nPlease come to:\n3517 Lancaster Ave, Philadelphia PA 19104\n\nShow your order number at the counter.\n\nSee you soon!`,
    active: true,
  },
  {
    id: 'order_delivered',
    name: 'Order Delivered',
    subject: 'Your Eggs Ok order has been delivered!',
    trigger: 'When DoorDash marks order as delivered',
    body: `Hi {{customer_name}},\n\nYour order #{{order_id}} has been delivered.\n\nWe hope you enjoy your meal! If you have any issues, please contact us at orders@eggsokphilly.com.\n\nThank you for choosing Eggs Ok!`,
    active: true,
  },
  {
    id: 'order_cancelled',
    name: 'Order Cancelled',
    subject: 'Your Eggs Ok order has been cancelled',
    trigger: 'When order is cancelled',
    body: `Hi {{customer_name}},\n\nYour order #{{order_id}} has been cancelled.\n\nIf you were charged, a full refund will be processed within 3-5 business days.\n\nWe apologize for any inconvenience. Please don't hesitate to place a new order.\n\nEggs Ok Team`,
    active: true,
  },
  {
    id: 'welcome',
    name: 'Welcome Email',
    subject: 'Welcome to Eggs Ok!',
    trigger: 'When customer creates an account',
    body: `Hi {{customer_name}},\n\nWelcome to Eggs Ok! We're so glad you joined us.\n\nOrder online at eggsokphilly.com or download our app for exclusive deals.\n\nAs a welcome gift, use code WELCOME10 for 10% off your first order!\n\nSee you soon,\nThe Eggs Ok Team`,
    active: true,
  },
];

const initialPushTemplates: PushTemplate[] = [
  { id: 'order_confirmed_push', name: 'Order Confirmed', title: 'Order Confirmed! 🎉', body: 'Your order #{{order_id}} has been received. Estimated time: {{estimated_time}}', trigger: 'When order is placed', active: true },
  { id: 'order_preparing_push', name: 'Order Preparing', title: 'We\'re cooking! 👨‍🍳', body: 'Your order #{{order_id}} is being prepared right now.', trigger: 'When status changes to Preparing', active: true },
  { id: 'order_ready_push', name: 'Order Ready', title: 'Your order is ready! ✅', body: 'Come pick up your order #{{order_id}} at Eggs Ok — 3517 Lancaster Ave', trigger: 'When status changes to Ready', active: true },
  { id: 'driver_assigned_push', name: 'Driver Assigned', title: 'Driver on the way! 🚗', body: 'Your Dasher has been assigned and is heading to pick up your order.', trigger: 'When DoorDash assigns a driver', active: true },
  { id: 'order_delivered_push', name: 'Order Delivered', title: 'Delivered! 🎊', body: 'Your Eggs Ok order has been delivered. Enjoy your meal!', trigger: 'When order is delivered', active: true },
  { id: 'promo_push', name: 'Promotional', title: '{{promo_title}}', body: '{{promo_body}}', trigger: 'Manual — sent from promotions', active: false },
];

const notifHistory: NotifHistory[] = [
  { id: 1, type: 'Email', recipient: 'john@gmail.com', subject: 'Your Eggs Ok order #EO-1001 is confirmed!', status: 'Sent', time: '2026-03-20 09:12 AM' },
  { id: 2, type: 'Push', recipient: 'John Smith', subject: 'Order Confirmed! 🎉', status: 'Sent', time: '2026-03-20 09:12 AM' },
  { id: 3, type: 'Email', recipient: 'sarah@gmail.com', subject: 'Your Eggs Ok order #EO-1002 is confirmed!', status: 'Sent', time: '2026-03-20 09:05 AM' },
  { id: 4, type: 'Push', recipient: 'Sarah Lee', subject: 'Driver on the way! 🚗', status: 'Sent', time: '2026-03-20 09:35 AM' },
  { id: 5, type: 'Email', recipient: 'mike@gmail.com', subject: 'Your Eggs Ok order is ready!', status: 'Sent', time: '2026-03-20 09:15 AM' },
  { id: 6, type: 'Push', recipient: 'Mike Johnson', subject: 'Your order is ready! ✅', status: 'Failed', time: '2026-03-20 09:15 AM' },
  { id: 7, type: 'Email', recipient: 'emma@gmail.com', subject: 'Welcome to Eggs Ok!', status: 'Sent', time: '2026-03-19 02:30 PM' },
];

const variables = [
  { var: '{{customer_name}}', desc: 'Customer full name' },
  { var: '{{order_id}}', desc: 'Order number' },
  { var: '{{order_items}}', desc: 'List of ordered items' },
  { var: '{{subtotal}}', desc: 'Order subtotal' },
  { var: '{{delivery_fee}}', desc: 'Delivery fee' },
  { var: '{{total}}', desc: 'Order total' },
  { var: '{{estimated_time}}', desc: 'Estimated pickup/delivery time' },
  { var: '{{promo_title}}', desc: 'Promotion title' },
  { var: '{{promo_body}}', desc: 'Promotion message body' },
];

export default function Notifications() {
  const [activeTab, setActiveTab] = useState<NotifTab>('templates');
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>(initialEmailTemplates);
  const [pushTemplates, setPushTemplates] = useState<PushTemplate[]>(initialPushTemplates);
  const [editingEmail, setEditingEmail] = useState<EmailTemplate | null>(null);
  const [editingPush, setEditingPush] = useState<PushTemplate | null>(null);
  const [showVariables, setShowVariables] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [pushTitle, setPushTitle] = useState('');
  const [pushBody, setPushBody] = useState('');
  const [pushTarget, setPushTarget] = useState('all');
  const [sending, setSending] = useState(false);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const saveEmailTemplate = () => {
    if (!editingEmail) return;
    setEmailTemplates(prev => prev.map(t => t.id === editingEmail.id ? editingEmail : t));
    showSuccess('Email template saved');
    setEditingEmail(null);
  };

  const savePushTemplate = () => {
    if (!editingPush) return;
    setPushTemplates(prev => prev.map(t => t.id === editingPush.id ? editingPush : t));
    showSuccess('Push template saved');
    setEditingPush(null);
  };

  const sendManualPush = async () => {
    if (!pushTitle || !pushBody) return;
    setSending(true);
    await new Promise(r => setTimeout(r, 1500));
    setSending(false);
    setPushTitle('');
    setPushBody('');
    showSuccess(`Push notification sent to ${pushTarget === 'all' ? 'all customers' : pushTarget}`);
  };

  const inputStyle = {
    width: '100%', padding: '10px 14px',
    background: '#111111', border: '1px solid #2A2A2A',
    borderRadius: '8px', color: '#FEFEFE', fontSize: '13px',
  };

  const labelStyle = {
    fontSize: '12px', fontWeight: '500' as const,
    color: '#888888', display: 'block' as const, marginBottom: '6px',
  };

  const statusColor: Record<string, string> = {
    Sent: '#22C55E',
    Failed: '#FC0301',
    Pending: '#F59E0B',
  };

  return (
    <div style={{ maxWidth: '900px' }}>

      {successMsg && (
        <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 9999, background: '#22C55E', color: '#000', padding: '12px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: '600' }}>
          {successMsg}
        </div>
      )}

      {/* Edit Email Modal */}
      {editingEmail && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '16px', width: '100%', maxWidth: '600px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #2A2A2A', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#FEFEFE' }}>Edit Email Template</h2>
              <button onClick={() => setEditingEmail(null)} style={{ background: 'transparent', color: '#888888', fontSize: '20px', border: 'none', cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ overflow: 'auto', padding: '20px 24px', flex: 1 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={labelStyle}>Template Name</label>
                  <input style={{ ...inputStyle, opacity: 0.6 }} value={editingEmail.name} readOnly />
                </div>
                <div>
                  <label style={labelStyle}>Subject Line</label>
                  <input style={inputStyle} value={editingEmail.subject}
                    onChange={e => setEditingEmail({ ...editingEmail, subject: e.target.value })}
                    onFocus={e => e.target.style.borderColor = '#FED800'}
                    onBlur={e => e.target.style.borderColor = '#2A2A2A'}
                  />
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label style={{ ...labelStyle, marginBottom: 0 }}>Email Body</label>
                    <button onClick={() => setShowVariables(!showVariables)} style={{ fontSize: '11px', color: '#FED800', background: 'transparent', border: 'none', cursor: 'pointer' }}>
                      {showVariables ? 'Hide variables' : 'Show variables'}
                    </button>
                  </div>
                  {showVariables && (
                    <div style={{ background: '#111111', borderRadius: '8px', padding: '12px', marginBottom: '8px', border: '1px solid #2A2A2A' }}>
                      <p style={{ fontSize: '11px', color: '#FED800', fontWeight: '600', marginBottom: '8px' }}>Available variables — click to copy</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '6px' }}>
                        {variables.map(v => (
                          <button key={v.var} onClick={() => { navigator.clipboard.writeText(v.var); showSuccess(`Copied ${v.var}`); }}
                            style={{ fontSize: '11px', padding: '3px 8px', background: '#2A2A2A', border: '1px solid #3A3A3A', borderRadius: '6px', color: '#FED800', cursor: 'pointer' }}
                            title={v.desc}
                          >{v.var}</button>
                        ))}
                      </div>
                    </div>
                  )}
                  <textarea
                    style={{ ...inputStyle, height: '200px', resize: 'vertical' as const, fontFamily: 'monospace', lineHeight: '1.6' }}
                    value={editingEmail.body}
                    onChange={e => setEditingEmail({ ...editingEmail, body: e.target.value })}
                    onFocus={e => e.target.style.borderColor = '#FED800'}
                    onBlur={e => e.target.style.borderColor = '#2A2A2A'}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: '#111111', borderRadius: '8px', border: '1px solid #2A2A2A' }}>
                  <span style={{ fontSize: '13px', color: '#FEFEFE' }}>Template Active</span>
                  <div onClick={() => setEditingEmail({ ...editingEmail, active: !editingEmail.active })} style={{ width: '42px', height: '24px', background: editingEmail.active ? '#FED800' : '#2A2A2A', borderRadius: '12px', position: 'relative', cursor: 'pointer' }}>
                    <div style={{ position: 'absolute', top: '3px', left: editingEmail.active ? '21px' : '3px', width: '18px', height: '18px', background: '#FEFEFE', borderRadius: '50%', transition: 'left 0.2s' }} />
                  </div>
                </div>
              </div>
            </div>
            <div style={{ padding: '16px 24px', borderTop: '1px solid #2A2A2A', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', flexShrink: 0 }}>
              <button onClick={() => setEditingEmail(null)} style={{ padding: '11px', background: 'transparent', border: '1px solid #2A2A2A', borderRadius: '8px', color: '#888888', fontSize: '13px', cursor: 'pointer' }}>Cancel</button>
              <button onClick={saveEmailTemplate} style={{ padding: '11px', background: '#FED800', border: 'none', borderRadius: '8px', color: '#000', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>Save Template</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Push Modal */}
      {editingPush && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '16px', width: '100%', maxWidth: '500px' }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #2A2A2A', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#FEFEFE' }}>Edit Push Template</h2>
              <button onClick={() => setEditingPush(null)} style={{ background: 'transparent', color: '#888888', fontSize: '20px', border: 'none', cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ padding: '20px 24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={labelStyle}>Notification Title</label>
                  <input style={inputStyle} value={editingPush.title}
                    onChange={e => setEditingPush({ ...editingPush, title: e.target.value })}
                    onFocus={e => e.target.style.borderColor = '#FED800'}
                    onBlur={e => e.target.style.borderColor = '#2A2A2A'}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Notification Body</label>
                  <textarea style={{ ...inputStyle, height: '80px', resize: 'none' as const }}
                    value={editingPush.body}
                    onChange={e => setEditingPush({ ...editingPush, body: e.target.value })}
                    onFocus={e => e.target.style.borderColor = '#FED800'}
                    onBlur={e => e.target.style.borderColor = '#2A2A2A'}
                  />
                  <p style={{ fontSize: '11px', color: '#888888', marginTop: '4px' }}>Max 100 characters recommended</p>
                </div>

                {/* Phone Preview */}
                <div style={{ background: '#111111', borderRadius: '10px', padding: '14px' }}>
                  <p style={{ fontSize: '11px', color: '#888888', marginBottom: '10px', fontWeight: '600' }}>Preview</p>
                  <div style={{ background: '#2A2A2A', borderRadius: '12px', padding: '12px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <div style={{ width: '20px', height: '20px', background: '#FED800', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>🍳</div>
                      <span style={{ fontSize: '11px', color: '#888888' }}>Eggs Ok · now</span>
                    </div>
                    <p style={{ fontSize: '13px', fontWeight: '700', color: '#FEFEFE', marginBottom: '3px' }}>{editingPush.title || 'Notification title'}</p>
                    <p style={{ fontSize: '12px', color: '#CACACA' }}>{editingPush.body || 'Notification body text'}</p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: '#111111', borderRadius: '8px', border: '1px solid #2A2A2A' }}>
                  <span style={{ fontSize: '13px', color: '#FEFEFE' }}>Template Active</span>
                  <div onClick={() => setEditingPush({ ...editingPush, active: !editingPush.active })} style={{ width: '42px', height: '24px', background: editingPush.active ? '#FED800' : '#2A2A2A', borderRadius: '12px', position: 'relative', cursor: 'pointer' }}>
                    <div style={{ position: 'absolute', top: '3px', left: editingPush.active ? '21px' : '3px', width: '18px', height: '18px', background: '#FEFEFE', borderRadius: '50%', transition: 'left 0.2s' }} />
                  </div>
                </div>
              </div>
            </div>
            <div style={{ padding: '16px 24px', borderTop: '1px solid #2A2A2A', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <button onClick={() => setEditingPush(null)} style={{ padding: '11px', background: 'transparent', border: '1px solid #2A2A2A', borderRadius: '8px', color: '#888888', fontSize: '13px', cursor: 'pointer' }}>Cancel</button>
              <button onClick={savePushTemplate} style={{ padding: '11px', background: '#FED800', border: 'none', borderRadius: '8px', color: '#000', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>Save Template</button>
            </div>
          </div>
        </div>
      )}

      {/* Tab Bar */}
      <div style={{ display: 'flex', gap: '4px', background: '#111111', padding: '4px', borderRadius: '10px', marginBottom: '20px', border: '1px solid #2A2A2A' }}>
        {[
          { id: 'templates', label: 'Email Templates' },
          { id: 'push', label: 'Push Notifications' },
          { id: 'history', label: 'Send History' },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as NotifTab)} style={{
            flex: 1, padding: '10px', background: activeTab === tab.id ? '#FED800' : 'transparent',
            color: activeTab === tab.id ? '#000' : '#888888',
            border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer',
          }}>{tab.label}</button>
        ))}
      </div>

      {/* EMAIL TEMPLATES */}
      {activeTab === 'templates' && (
        <div>
          <p style={{ fontSize: '13px', color: '#888888', marginBottom: '16px' }}>
            Customize the emails sent to customers automatically. Use variables like {`{{customer_name}}`} to personalize each email.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {emailTemplates.map(template => (
              <div key={template.id} style={{ background: '#1A1A1A', border: `1px solid ${template.active ? '#2A2A2A' : '#FC030120'}`, borderRadius: '12px', padding: '16px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1, marginRight: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                      <p style={{ fontSize: '14px', fontWeight: '700', color: template.active ? '#FEFEFE' : '#888888' }}>{template.name}</p>
                      <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '20px', fontWeight: '600', background: template.active ? '#22C55E20' : '#FC030120', color: template.active ? '#22C55E' : '#FC0301', border: `1px solid ${template.active ? '#22C55E40' : '#FC030140'}` }}>
                        {template.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p style={{ fontSize: '12px', color: '#888888', marginBottom: '4px' }}>Trigger: {template.trigger}</p>
                    <p style={{ fontSize: '12px', color: '#CACACA' }}>Subject: {template.subject}</p>
                  </div>
                  <button onClick={() => setEditingEmail(template)} style={{ padding: '7px 14px', background: 'transparent', border: '1px solid #2A2A2A', borderRadius: '8px', color: '#888888', fontSize: '12px', cursor: 'pointer', flexShrink: 0 }}>
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PUSH NOTIFICATIONS */}
      {activeTab === 'push' && (
        <div>
          {/* Auto Push Templates */}
          <div style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
            <p style={{ fontSize: '14px', fontWeight: '700', color: '#FEFEFE', marginBottom: '4px' }}>Automatic Push Notifications</p>
            <p style={{ fontSize: '12px', color: '#888888', marginBottom: '16px' }}>Sent automatically when order status changes</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {pushTemplates.map(template => (
                <div key={template.id} style={{ background: '#111111', border: `1px solid ${template.active ? '#2A2A2A' : '#FC030120'}`, borderRadius: '10px', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                      <p style={{ fontSize: '13px', fontWeight: '600', color: template.active ? '#FEFEFE' : '#888888' }}>{template.name}</p>
                      <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '20px', fontWeight: '600', background: template.active ? '#22C55E20' : '#FC030120', color: template.active ? '#22C55E' : '#FC0301', border: `1px solid ${template.active ? '#22C55E40' : '#FC030140'}` }}>
                        {template.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p style={{ fontSize: '11px', color: '#888888' }}>{template.trigger}</p>
                    <p style={{ fontSize: '12px', color: '#CACACA', marginTop: '3px' }}>{template.title}</p>
                  </div>
                  <button onClick={() => setEditingPush(template)} style={{ padding: '6px 12px', background: 'transparent', border: '1px solid #2A2A2A', borderRadius: '6px', color: '#888888', fontSize: '11px', cursor: 'pointer', flexShrink: 0, marginLeft: '12px' }}>
                    Edit
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Manual Push */}
          <div style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '12px', padding: '20px' }}>
            <p style={{ fontSize: '14px', fontWeight: '700', color: '#FEFEFE', marginBottom: '4px' }}>Send Manual Push Notification</p>
            <p style={{ fontSize: '12px', color: '#888888', marginBottom: '16px' }}>Send a custom push notification to customers right now</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={labelStyle}>Send To</label>
                <select style={{ ...inputStyle, cursor: 'pointer' }} value={pushTarget} onChange={e => setPushTarget(e.target.value)}>
                  <option value="all">All Customers</option>
                  <option value="recent">Customers with orders in last 30 days</option>
                  <option value="inactive">Inactive customers (no order in 30+ days)</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Notification Title *</label>
                <input style={inputStyle} value={pushTitle}
                  onChange={e => setPushTitle(e.target.value)}
                  placeholder="e.g. Special Weekend Deal! 🎉"
                  onFocus={e => e.target.style.borderColor = '#FED800'}
                  onBlur={e => e.target.style.borderColor = '#2A2A2A'}
                />
              </div>
              <div>
                <label style={labelStyle}>Message *</label>
                <textarea style={{ ...inputStyle, height: '80px', resize: 'none' as const }}
                  value={pushBody}
                  onChange={e => setPushBody(e.target.value)}
                  placeholder="e.g. Get 20% off all orders this weekend! Use code WEEKEND20 at checkout."
                  onFocus={e => e.target.style.borderColor = '#FED800'}
                  onBlur={e => e.target.style.borderColor = '#2A2A2A'}
                />
              </div>

              {/* Preview */}
              {(pushTitle || pushBody) && (
                <div style={{ background: '#111111', borderRadius: '10px', padding: '14px' }}>
                  <p style={{ fontSize: '11px', color: '#888888', marginBottom: '10px' }}>Preview</p>
                  <div style={{ background: '#2A2A2A', borderRadius: '12px', padding: '12px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <div style={{ width: '20px', height: '20px', background: '#FED800', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>🍳</div>
                      <span style={{ fontSize: '11px', color: '#888888' }}>Eggs Ok · now</span>
                    </div>
                    <p style={{ fontSize: '13px', fontWeight: '700', color: '#FEFEFE', marginBottom: '3px' }}>{pushTitle}</p>
                    <p style={{ fontSize: '12px', color: '#CACACA' }}>{pushBody}</p>
                  </div>
                </div>
              )}

              <button onClick={sendManualPush} disabled={sending || !pushTitle || !pushBody} style={{
                padding: '12px', background: sending || !pushTitle || !pushBody ? '#2A2A2A' : '#FED800',
                border: 'none', borderRadius: '8px',
                color: sending || !pushTitle || !pushBody ? '#888888' : '#000',
                fontSize: '13px', fontWeight: '700', cursor: sending ? 'not-allowed' : 'pointer',
              }}>
                {sending ? 'Sending...' : 'Send Push Notification'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HISTORY */}
      {activeTab === 'history' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
            {[
              { label: 'Total Sent Today', value: String(notifHistory.filter(n => n.status === 'Sent').length), color: '#22C55E' },
              { label: 'Failed', value: String(notifHistory.filter(n => n.status === 'Failed').length), color: '#FC0301' },
              { label: 'Total This Month', value: '1,247', color: '#FED800' },
            ].map((s, i) => (
              <div key={i} style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '12px', padding: '16px 20px' }}>
                <p style={{ fontSize: '12px', color: '#888888', marginBottom: '6px' }}>{s.label}</p>
                <p style={{ fontSize: '24px', fontWeight: '700', color: s.color }}>{s.value}</p>
              </div>
            ))}
          </div>

          <div style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '12px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #2A2A2A' }}>
                  {['Type', 'Recipient', 'Message', 'Status', 'Time'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '10px', fontWeight: '600', color: '#888888', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {notifHistory.map((n, i) => (
                  <tr key={n.id} style={{ borderBottom: i < notifHistory.length - 1 ? '1px solid #2A2A2A' : 'none' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '20px', fontWeight: '600', background: n.type === 'Email' ? '#FED80020' : '#60A5FA20', color: n.type === 'Email' ? '#FED800' : '#60A5FA', border: `1px solid ${n.type === 'Email' ? '#FED80040' : '#60A5FA40'}` }}>
                        {n.type}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '12px', color: '#FEFEFE' }}>{n.recipient}</td>
                    <td style={{ padding: '12px 16px', fontSize: '12px', color: '#888888', maxWidth: '260px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.subject}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '20px', fontWeight: '600', background: `${statusColor[n.status]}20`, color: statusColor[n.status], border: `1px solid ${statusColor[n.status]}40` }}>
                        {n.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '11px', color: '#888888' }}>{n.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}