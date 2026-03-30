'use client';
import { useState } from 'react';

type ReviewStatus = 'Published' | 'Hidden' | 'Flagged';
type ReviewRating = 1 | 2 | 3 | 4 | 5;

type Review = {
  id: number;
  customer: string;
  email: string;
  rating: ReviewRating;
  title: string;
  body: string;
  date: string;
  orderType: 'Pickup' | 'Delivery';
  orderId: string;
  status: ReviewStatus;
  reply: string;
  repliedAt: string;
};

const initialReviews: Review[] = [
  { id: 1, customer: 'John Smith', email: 'john@gmail.com', rating: 5, title: 'Best breakfast in Philly!', body: 'The Signature Bacon Egg & Cheese is absolutely amazing. The bread is perfectly toasted and the OK sauce is incredible. Will definitely be back!', date: '2026-03-20', orderType: 'Pickup', orderId: 'EO-1001', status: 'Published', reply: '', repliedAt: '' },
  { id: 2, customer: 'Sarah Lee', email: 'sarah@gmail.com', rating: 4, title: 'Great food, fast delivery', body: 'Nashville Hot Chicken sandwich was delicious. Delivery was quick and food arrived hot. Only minor issue was the packaging could be better.', date: '2026-03-19', orderType: 'Delivery', orderId: 'EO-0997', status: 'Published', reply: 'Thank you Sarah! We appreciate your feedback on the packaging — we are always looking to improve!', repliedAt: '2026-03-19' },
  { id: 3, customer: 'Mike Johnson', email: 'mike@gmail.com', rating: 5, title: 'Absolutely love this place', body: 'I order from here at least twice a week. The breakfast burritos are incredible and the matcha drinks are the best I have had in the city.', date: '2026-03-18', orderType: 'Pickup', orderId: 'EO-0995', status: 'Published', reply: '', repliedAt: '' },
  { id: 4, customer: 'Emma Davis', email: 'emma@gmail.com', rating: 3, title: 'Good food but waited long', body: 'The food was tasty but my pickup order took 35 minutes when it said 15. Would appreciate more accurate timing.', date: '2026-03-17', orderType: 'Pickup', orderId: 'EO-0990', status: 'Published', reply: '', repliedAt: '' },
  { id: 5, customer: 'James Wilson', email: 'james@gmail.com', rating: 2, title: 'Order was missing items', body: 'My order was missing one of the drinks I paid for. I tried calling but no one answered. Hope this gets resolved.', date: '2026-03-16', orderType: 'Delivery', orderId: 'EO-0985', status: 'Flagged', reply: '', repliedAt: '' },
  { id: 6, customer: 'Olivia Brown', email: 'olivia@gmail.com', rating: 5, title: 'Hidden gem in West Philly', body: 'Just discovered this place and I am obsessed. The Truffle Avocado Toast is to die for. Super friendly staff too!', date: '2026-03-15', orderType: 'Pickup', orderId: 'EO-0980', status: 'Published', reply: 'Thank you so much Olivia! We love hearing this. See you again soon!', repliedAt: '2026-03-15' },
  { id: 7, customer: 'Liam Martinez', email: 'liam@gmail.com', rating: 1, title: 'Very disappointed', body: 'Food was cold when it arrived and the order was wrong. I ordered a veggie burrito and got a meat one. Very disappointing.', date: '2026-03-14', orderType: 'Delivery', orderId: 'EO-0975', status: 'Flagged', reply: '', repliedAt: '' },
];

const statusColor: Record<ReviewStatus, string> = {
  Published: '#22C55E',
  Hidden: '#888888',
  Flagged: '#FC0301',
};

const ratingColor = (r: number) => {
  if (r >= 4) return '#22C55E';
  if (r === 3) return '#F59E0B';
  return '#FC0301';
};

const Stars = ({ rating, size = 14 }: { rating: number; size?: number }) => (
  <div style={{ display: 'flex', gap: '2px' }}>
    {[1, 2, 3, 4, 5].map(i => (
      <span key={i} style={{ fontSize: `${size}px`, color: i <= rating ? '#FED800' : '#2A2A2A' }}>★</span>
    ))}
  </div>
);

export default function Reviews() {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [replyText, setReplyText] = useState('');
  const [filterStatus, setFilterStatus] = useState<ReviewStatus | 'all'>('all');
  const [filterRating, setFilterRating] = useState<number | 'all'>('all');
  const [search, setSearch] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleReply = () => {
    if (!selectedReview || !replyText.trim()) return;
    setReviews(prev => prev.map(r => r.id === selectedReview.id ? {
      ...r, reply: replyText,
      repliedAt: new Date().toISOString().split('T')[0],
    } : r));
    setSelectedReview(prev => prev ? { ...prev, reply: replyText, repliedAt: new Date().toISOString().split('T')[0] } : null);
    showSuccess('Reply posted successfully');
    setReplyText('');
  };

  const updateStatus = (id: number, status: ReviewStatus) => {
    setReviews(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    if (selectedReview?.id === id) setSelectedReview(prev => prev ? { ...prev, status } : null);
    showSuccess(`Review ${status.toLowerCase()}`);
  };

  const filtered = reviews.filter(r => {
    const matchStatus = filterStatus === 'all' || r.status === filterStatus;
    const matchRating = filterRating === 'all' || r.rating === filterRating;
    const matchSearch = !search ||
      r.customer.toLowerCase().includes(search.toLowerCase()) ||
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.body.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchRating && matchSearch;
  });

  const avgRating = reviews.length > 0
    ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1)
    : '0';

  const ratingCounts = [5, 4, 3, 2, 1].map(r => ({
    rating: r,
    count: reviews.filter(rev => rev.rating === r).length,
    pct: reviews.length > 0 ? (reviews.filter(rev => rev.rating === r).length / reviews.length) * 100 : 0,
  }));

  const inputStyle = {
    width: '100%', padding: '10px 14px',
    background: '#111111', border: '1px solid #2A2A2A',
    borderRadius: '8px', color: '#FEFEFE', fontSize: '13px',
  };

  return (
    <div style={{ maxWidth: '900px' }}>

      {successMsg && (
        <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 9999, background: '#22C55E', color: '#000', padding: '12px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: '600' }}>
          {successMsg}
        </div>
      )}

      {/* Review Detail Modal */}
      {selectedReview && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '16px', width: '100%', maxWidth: '560px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>

            <div style={{ padding: '18px 24px', borderBottom: '1px solid #2A2A2A', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#FEFEFE' }}>Review Detail</h2>
              <button onClick={() => { setSelectedReview(null); setReplyText(''); }} style={{ background: 'transparent', color: '#888888', fontSize: '20px', border: 'none', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ overflow: 'auto', padding: '20px 24px', flex: 1 }}>

              {/* Customer + Rating */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#FED80020', border: '1px solid #FED80040', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: '700', color: '#FED800', flexShrink: 0 }}>
                    {selectedReview.customer.charAt(0)}
                  </div>
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: '700', color: '#FEFEFE' }}>{selectedReview.customer}</p>
                    <p style={{ fontSize: '11px', color: '#888888', marginTop: '2px' }}>{selectedReview.email}</p>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <Stars rating={selectedReview.rating} size={16} />
                  <p style={{ fontSize: '11px', color: '#888888', marginTop: '4px' }}>{selectedReview.date}</p>
                </div>
              </div>

              {/* Order info */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
                <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '20px', fontWeight: '600', background: selectedReview.orderType === 'Delivery' ? '#0A1628' : '#1A1A00', color: selectedReview.orderType === 'Delivery' ? '#60A5FA' : '#FED800', border: `1px solid ${selectedReview.orderType === 'Delivery' ? '#1E3A5F' : '#3A3A00'}` }}>
                  {selectedReview.orderType}
                </span>
                <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '20px', fontWeight: '600', background: '#2A2A2A', color: '#888888' }}>
                  {selectedReview.orderId}
                </span>
                <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '20px', fontWeight: '600', background: `${statusColor[selectedReview.status]}20`, color: statusColor[selectedReview.status], border: `1px solid ${statusColor[selectedReview.status]}40` }}>
                  {selectedReview.status}
                </span>
              </div>

              {/* Review content */}
              <div style={{ background: '#111111', borderRadius: '10px', padding: '14px 16px', marginBottom: '14px' }}>
                <p style={{ fontSize: '14px', fontWeight: '700', color: '#FEFEFE', marginBottom: '6px' }}>{selectedReview.title}</p>
                <p style={{ fontSize: '13px', color: '#CACACA', lineHeight: '1.6' }}>{selectedReview.body}</p>
              </div>

              {/* Existing reply */}
              {selectedReview.reply && (
                <div style={{ background: '#0A1A0A', border: '1px solid #22C55E30', borderRadius: '10px', padding: '14px 16px', marginBottom: '14px' }}>
                  <p style={{ fontSize: '11px', color: '#22C55E', fontWeight: '600', marginBottom: '6px' }}>Your Reply — {selectedReview.repliedAt}</p>
                  <p style={{ fontSize: '13px', color: '#CACACA', lineHeight: '1.6' }}>{selectedReview.reply}</p>
                </div>
              )}

              {/* Reply form */}
              <div>
                <p style={{ fontSize: '12px', fontWeight: '600', color: '#FEFEFE', marginBottom: '8px' }}>
                  {selectedReview.reply ? 'Update Reply' : 'Write a Reply'}
                </p>
                <textarea
                  style={{ ...inputStyle, height: '100px', resize: 'none' as const }}
                  placeholder="Write a professional, friendly response..."
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  onFocus={e => e.target.style.borderColor = '#FED800'}
                  onBlur={e => e.target.style.borderColor = '#2A2A2A'}
                />
                <p style={{ fontSize: '11px', color: '#888888', marginTop: '4px' }}>
                  Your reply will be visible to the customer and anyone viewing this review.
                </p>
              </div>

              {/* Status Actions */}
              <div style={{ marginTop: '14px' }}>
                <p style={{ fontSize: '12px', fontWeight: '600', color: '#888888', marginBottom: '8px' }}>Change Status</p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {(['Published', 'Hidden', 'Flagged'] as ReviewStatus[]).map(s => (
                    <button key={s} onClick={() => updateStatus(selectedReview.id, s)} style={{
                      padding: '7px 14px', border: `1px solid ${statusColor[s]}40`,
                      borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '600',
                      background: selectedReview.status === s ? `${statusColor[s]}20` : 'transparent',
                      color: statusColor[s],
                    }}>{s}</button>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ padding: '16px 24px', borderTop: '1px solid #2A2A2A', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', flexShrink: 0 }}>
              <button onClick={() => { setSelectedReview(null); setReplyText(''); }} style={{ padding: '11px', background: 'transparent', border: '1px solid #2A2A2A', borderRadius: '8px', color: '#888888', fontSize: '13px', cursor: 'pointer' }}>Close</button>
              <button onClick={handleReply} disabled={!replyText.trim()} style={{ padding: '11px', background: replyText.trim() ? '#FED800' : '#2A2A2A', border: 'none', borderRadius: '8px', color: replyText.trim() ? '#000' : '#888888', fontSize: '13px', fontWeight: '700', cursor: replyText.trim() ? 'pointer' : 'not-allowed' }}>
                {selectedReview.reply ? 'Update Reply' : 'Post Reply'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px', marginBottom: '20px' }}>

        {/* Average Rating */}
        <div style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
          <p style={{ fontSize: '11px', color: '#888888', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Average Rating</p>
          <p style={{ fontSize: '52px', fontWeight: '900', color: '#FED800', lineHeight: '1' }}>{avgRating}</p>
          <Stars rating={Math.round(Number(avgRating))} size={18} />
          <p style={{ fontSize: '11px', color: '#888888', marginTop: '8px' }}>{reviews.length} total reviews</p>
        </div>

        {/* Rating Breakdown */}
        <div style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '12px', padding: '20px' }}>
          <p style={{ fontSize: '11px', color: '#888888', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Rating Breakdown</p>
          {ratingCounts.map(({ rating, count, pct }) => (
            <div key={rating} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', color: '#888888', width: '12px', textAlign: 'right', flexShrink: 0 }}>{rating}</span>
              <span style={{ fontSize: '12px', color: '#FED800', flexShrink: 0 }}>★</span>
              <div style={{ flex: 1, height: '8px', background: '#2A2A2A', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${pct}%`, height: '100%', background: ratingColor(rating), borderRadius: '4px', transition: 'width 0.3s' }} />
              </div>
              <span style={{ fontSize: '11px', color: '#888888', width: '16px', textAlign: 'right', flexShrink: 0 }}>{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Status Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
        {[
          { label: 'Published', count: reviews.filter(r => r.status === 'Published').length, color: '#22C55E' },
          { label: 'Needs Reply', count: reviews.filter(r => r.status === 'Published' && !r.reply).length, color: '#F59E0B' },
          { label: 'Flagged', count: reviews.filter(r => r.status === 'Flagged').length, color: '#FC0301' },
        ].map((s, i) => (
          <div key={i} style={{ background: '#1A1A1A', border: `1px solid ${s.color}30`, borderRadius: '12px', padding: '16px 20px' }}>
            <p style={{ fontSize: '12px', color: '#888888', marginBottom: '6px' }}>{s.label}</p>
            <p style={{ fontSize: '24px', fontWeight: '700', color: s.color }}>{s.count}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' as const }}>
        <input
          placeholder="Search reviews..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ ...inputStyle, flex: 1, minWidth: '200px' }}
          onFocus={e => e.target.style.borderColor = '#FED800'}
          onBlur={e => e.target.style.borderColor = '#2A2A2A'}
        />
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as typeof filterStatus)}
          style={{ ...inputStyle, width: 'auto', cursor: 'pointer' }}>
          <option value="all">All Statuses</option>
          <option value="Published">Published</option>
          <option value="Hidden">Hidden</option>
          <option value="Flagged">Flagged</option>
        </select>
        <select value={filterRating} onChange={e => setFilterRating(e.target.value === 'all' ? 'all' : Number(e.target.value))}
          style={{ ...inputStyle, width: 'auto', cursor: 'pointer' }}>
          <option value="all">All Ratings</option>
          {[5, 4, 3, 2, 1].map(r => <option key={r} value={r}>{r} Stars</option>)}
        </select>
      </div>

      <p style={{ fontSize: '12px', color: '#888888', marginBottom: '12px' }}>
        Showing {filtered.length} of {reviews.length} reviews
      </p>

      {/* Reviews List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filtered.map(review => (
          <div key={review.id} style={{
            background: '#1A1A1A',
            border: `1px solid ${review.status === 'Flagged' ? '#FC030130' : '#2A2A2A'}`,
            borderRadius: '12px', padding: '16px 20px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#FED80015', border: '1px solid #FED80030', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '700', color: '#FED800', flexShrink: 0 }}>
                  {review.customer.charAt(0)}
                </div>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: '700', color: '#FEFEFE' }}>{review.customer}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                    <Stars rating={review.rating} size={12} />
                    <span style={{ fontSize: '11px', color: '#888888' }}>{review.date}</span>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '20px', fontWeight: '600', background: `${statusColor[review.status]}20`, color: statusColor[review.status], border: `1px solid ${statusColor[review.status]}40` }}>
                  {review.status}
                </span>
                {!review.reply && review.status === 'Published' && (
                  <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '20px', fontWeight: '600', background: '#F59E0B20', color: '#F59E0B', border: '1px solid #F59E0B40' }}>
                    Needs Reply
                  </span>
                )}
                <button onClick={() => { setSelectedReview(review); setReplyText(review.reply || ''); }} style={{ padding: '6px 12px', background: 'transparent', border: '1px solid #2A2A2A', borderRadius: '6px', color: '#888888', fontSize: '11px', cursor: 'pointer' }}>
                  {review.reply ? 'View' : 'Reply'}
                </button>
              </div>
            </div>

            <p style={{ fontSize: '13px', fontWeight: '600', color: '#FEFEFE', marginBottom: '4px' }}>{review.title}</p>
            <p style={{ fontSize: '12px', color: '#888888', lineHeight: '1.5', marginBottom: review.reply ? '10px' : '0' }}>
              {review.body.length > 150 ? review.body.substring(0, 150) + '...' : review.body}
            </p>

            {review.reply && (
              <div style={{ background: '#0A1A0A', border: '1px solid #22C55E20', borderRadius: '8px', padding: '10px 14px', marginTop: '10px' }}>
                <p style={{ fontSize: '10px', color: '#22C55E', fontWeight: '600', marginBottom: '4px' }}>Your Reply</p>
                <p style={{ fontSize: '12px', color: '#CACACA' }}>
                  {review.reply.length > 100 ? review.reply.substring(0, 100) + '...' : review.reply}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}