'use client';
import React, { useState, useEffect } from 'react';
import { Camera, User } from 'lucide-react';

type Section = 'brand' | 'contact' | 'location' | 'social' | 'seo' | 'owner';

import { API, adminFetch } from '../../../lib/api';

export default function BusinessProfile() {
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<Section>('brand');
  const [successMsg, setSuccessMsg] = useState('');
  const [logoPreview, setLogoPreview] = useState('');
  const [coverPreview, setCoverPreview] = useState('');
  const [ownerPhotoPreview, setOwnerPhotoPreview] = useState('');

  // Brand
  const [restaurantName, setRestaurantName] = useState('Eggs Ok');
  const [tagline, setTagline] = useState('Breakfast & Lunch  Philadelphia');
  const [description, setDescription] = useState('Eggs Ok is a modern breakfast and lunch restaurant located in Philadelphia, PA. We serve fresh, made-to-order sandwiches, burritos, omelettes, and specialty drinks.');
  const [cuisine, setCuisine] = useState('American, Indonesian, Fusion');
  const [priceRange, setPriceRange] = useState('$$');

  // Contact
  const [phone, setPhone] = useState('215-948-9902');
  const [cateringPhone, setCateringPhone] = useState('267-370-7993');
  const [email, setEmail] = useState('orders@eggsokphilly.com');
  const [website, setWebsite] = useState('https://eggsokphilly.com');

  // Location
  const [address, setAddress] = useState('3517 Lancaster Ave');
  const [city, setCity] = useState('Philadelphia');
  const [state, setState] = useState('PA');
  const [zip, setZip] = useState('19104');
  const [country, setCountry] = useState('United States');
  const [googleMapsLink, setGoogleMapsLink] = useState('');
  const [parkingInfo, setParkingInfo] = useState('Street parking available on Lancaster Ave');

  // Social
  const [instagram, setInstagram] = useState('@eggsok');
  const [facebook, setFacebook] = useState('');
  const [tiktok, setTiktok] = useState('');
  const [twitter, setTwitter] = useState('');
  const [yelp, setYelp] = useState('');
  const [googleBusiness, setGoogleBusiness] = useState('');

  // SEO
  const [seoTitle, setSeoTitle] = useState('Eggs Ok  Best Breakfast & Lunch in Philadelphia');
  const [seoDescription, setSeoDescription] = useState('Order online from Eggs Ok in Philadelphia. Fresh breakfast sandwiches, burritos, omelettes, and specialty drinks. Pickup and delivery available.');
  const [seoKeywords, setSeoKeywords] = useState('breakfast philadelphia, eggs ok, breakfast sandwiches, lunch philadelphia, burritos, online ordering');

  // Owner
  const [ownerName, setOwnerName] = useState('Berry & Steven');
  const [ownerEmail, setOwnerEmail] = useState('berry@eggok.com');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [ownerBio, setOwnerBio] = useState('');

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await adminFetch(`${API}/settings/business_profile`);
      if (res.ok) {
        const text = await res.text();
        const data = text ? JSON.parse(text) : null;
        if (data) {
          const v = data;
          if (v.restaurantName) setRestaurantName(v.restaurantName);
          if (v.tagline) setTagline(v.tagline);
          if (v.description) setDescription(v.description);
          if (v.cuisine) setCuisine(v.cuisine);
          if (v.priceRange) setPriceRange(v.priceRange);
          if (v.logoPreview) setLogoPreview(v.logoPreview);
          if (v.coverPreview) setCoverPreview(v.coverPreview);
          if (v.phone) setPhone(v.phone);
          if (v.cateringPhone) setCateringPhone(v.cateringPhone);
          if (v.email) setEmail(v.email);
          if (v.website) setWebsite(v.website);
          if (v.address) setAddress(v.address);
          if (v.city) setCity(v.city);
          if (v.state) setState(v.state);
          if (v.zip) setZip(v.zip);
          if (v.country) setCountry(v.country);
          if (v.googleMapsLink) setGoogleMapsLink(v.googleMapsLink);
          if (v.parkingInfo) setParkingInfo(v.parkingInfo);
          if (v.instagram) setInstagram(v.instagram);
          if (v.facebook) setFacebook(v.facebook);
          if (v.tiktok) setTiktok(v.tiktok);
          if (v.twitter) setTwitter(v.twitter);
          if (v.yelp) setYelp(v.yelp);
          if (v.googleBusiness) setGoogleBusiness(v.googleBusiness);
          if (v.seoTitle) setSeoTitle(v.seoTitle);
          if (v.seoDescription) setSeoDescription(v.seoDescription);
          if (v.seoKeywords) setSeoKeywords(v.seoKeywords);
          if (v.ownerName) setOwnerName(v.ownerName);
          if (v.ownerEmail) setOwnerEmail(v.ownerEmail);
          if (v.ownerPhone) setOwnerPhone(v.ownerPhone);
          if (v.ownerBio) setOwnerBio(v.ownerBio);
          if (v.ownerPhotoPreview) setOwnerPhotoPreview(v.ownerPhotoPreview);
        }
      }
    } catch (err) {
      console.error('Fetch failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (sectionLabel: string) => {
    const payload = {
      restaurantName, tagline, description, cuisine, priceRange, logoPreview, coverPreview,
      phone, cateringPhone, email, website,
      address, city, state, zip, country, googleMapsLink, parkingInfo,
      instagram, facebook, tiktok, twitter, yelp, googleBusiness,
      seoTitle, seoDescription, seoKeywords,
      ownerName, ownerEmail, ownerPhone, ownerBio, ownerPhotoPreview
    };

    try {
      const res = await adminFetch(`${API}/settings/business_profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        showSuccess(`${sectionLabel} saved`);
      }
    } catch (err) {
      console.error('Save failed:', err);
    }
  };

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };


  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setPreview: (v: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
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

  const cardStyle = {
    background: '#1A1A1A', border: '1px solid #2A2A2A',
    borderRadius: '12px', padding: '20px 24px', marginBottom: '16px',
  };

  const sectionTitle = {
    fontSize: '14px', fontWeight: '700' as const,
    color: '#FEFEFE', marginBottom: '16px',
    paddingBottom: '12px', borderBottom: '1px solid #2A2A2A',
  };

  const sectionIcons: Record<string, React.ReactElement> = {
    brand: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>,
    contact: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" /></svg>,
    location: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>,
    social: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></svg>,
    seo: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>,
    owner: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>,
  };

  const sections = [
    { id: 'brand', label: 'Brand Identity' },
    { id: 'contact', label: 'Contact Info' },
    { id: 'location', label: 'Location' },
    { id: 'social', label: 'Social Media' },
    { id: 'seo', label: 'SEO Settings' },
    { id: 'owner', label: 'Owner Profile' },
  ] as const;

  const ImageUploadBox = ({
    label, preview, onUpload, hint, square = false,
  }: {
    label: string;
    preview: string;
    onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    hint: string;
    square?: boolean;
  }) => (
    <div>
      <label style={labelStyle}>{label}</label>
      <div style={{
        border: '2px dashed #2A2A2A', borderRadius: '10px',
        background: '#111111', position: 'relative', cursor: 'pointer',
        overflow: 'hidden', transition: 'border-color 0.2s',
        height: square ? '160px' : '120px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
        onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.borderColor = '#E5B800'}
        onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.borderColor = '#2A2A2A'}
      >
        {preview ? (
          <img src={preview} alt={label} style={{
            width: '100%', height: '100%', objectFit: square ? 'contain' : 'cover',
          }} />
        ) : (
          <div style={{ textAlign: 'center', padding: '16px' }}>
            <div style={{ marginBottom: '6px', display: 'flex', justifyContent: 'center', color: '#FEFEFE' }}><Camera size={28} /></div>
            <p style={{ fontSize: '12px', fontWeight: '600', color: '#FEFEFE', marginBottom: '3px' }}>
              Upload {label}
            </p>
            <p style={{ fontSize: '11px', color: '#888888' }}>{hint}</p>
          </div>
        )}
        <input
          type="file" accept="image/jpeg,image/png,image/svg+xml,image/webp"
          onChange={onUpload}
          style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
        />
      </div>
      {preview && (
        <button onClick={() => onUpload({ target: { files: null } } as any)} style={{
          marginTop: '6px', fontSize: '11px', color: '#888888',
          background: 'transparent', border: 'none', cursor: 'pointer', padding: '0',
        }}>Click image to replace</button>
      )}
    </div>
  );

  return (
    <div style={{ display: 'flex', gap: '20px', maxWidth: '960px' }}>

      {/* Success Toast */}
      {successMsg && (
        <div style={{
          position: 'fixed', top: '20px', right: '20px', zIndex: 9999,
          background: '#22C55E', color: '#000', padding: '12px 20px',
          borderRadius: '10px', fontSize: '13px', fontWeight: '600',
        }}>{successMsg}</div>
      )}

      {/* Left Sidebar Nav */}
      <div style={{
        width: '200px', flexShrink: 0,
        background: '#111111', border: '1px solid #2A2A2A',
        borderRadius: '12px', padding: '8px',
        height: 'fit-content', position: 'sticky', top: '20px',
      }}>
        {sections.map(sec => (
          <button key={sec.id} onClick={() => setActiveSection(sec.id)} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer',
            background: activeSection === sec.id ? '#E5B800' : 'transparent',
            color: activeSection === sec.id ? '#000000' : '#FEFEFE',
            fontSize: '12px', fontWeight: activeSection === sec.id ? '700' : '400',
            marginBottom: '2px', textAlign: 'left',
          }}>
            <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
              {sectionIcons[sec.id]}
            </span>
            {sec.label}
          </button>
        ))}
      </div>

      {/* Right Content */}
      <div style={{ flex: 1 }}>

        {/* ── BRAND IDENTITY ── */}
        {activeSection === 'brand' && (
          <div>
            <div style={cardStyle}>
              <p style={sectionTitle}>Brand Identity</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px', marginBottom: '16px' }}>
                <ImageUploadBox
                  label="Restaurant Logo"
                  preview={logoPreview}
                  onUpload={e => handleImageUpload(e, setLogoPreview)}
                  hint="SVG or PNG recommended 400x400px"
                  square
                />
                <ImageUploadBox
                  label="Cover Photo"
                  preview={coverPreview}
                  onUpload={e => handleImageUpload(e, setCoverPreview)}
                  hint="JPG recommended 1440x500px"
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={labelStyle}>Restaurant Name</label>
                  <input style={inputStyle} value={restaurantName}
                    onChange={e => setRestaurantName(e.target.value)}
                    onFocus={e => e.target.style.borderColor = '#E5B800'}
                    onBlur={e => e.target.style.borderColor = '#2A2A2A'}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Tagline</label>
                  <input style={inputStyle} value={tagline}
                    onChange={e => setTagline(e.target.value)}
                    placeholder="e.g. Fresh breakfast made with love"
                    onFocus={e => e.target.style.borderColor = '#E5B800'}
                    onBlur={e => e.target.style.borderColor = '#2A2A2A'}
                  />
                </div>
                <div>
                  <label style={labelStyle}>About / Description</label>
                  <textarea style={{ ...inputStyle, height: '90px', resize: 'none' as const }}
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    onFocus={e => e.target.style.borderColor = '#E5B800'}
                    onBlur={e => e.target.style.borderColor = '#2A2A2A'}
                  />
                  <p style={{ fontSize: '11px', color: '#888888', marginTop: '4px' }}>
                    Shown on the website about section and app profile
                  </p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={labelStyle}>Cuisine Type</label>
                    <input style={inputStyle} value={cuisine}
                      onChange={e => setCuisine(e.target.value)}
                      onFocus={e => e.target.style.borderColor = '#E5B800'}
                      onBlur={e => e.target.style.borderColor = '#2A2A2A'}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Price Range</label>
                    <select style={{ ...inputStyle, cursor: 'pointer' }} value={priceRange} onChange={e => setPriceRange(e.target.value)}>
                      <option value="$">$ — Budget friendly</option>
                      <option value="$$">$$ — Moderate</option>
                      <option value="$$$">$$$ — Upscale</option>
                      <option value="$$$$">$$$$ — Fine dining</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            <button onClick={() => handleSave('Brand identity')} style={{ width: '100%', padding: '13px', background: '#E5B800', border: 'none', borderRadius: '10px', color: '#000', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}>
              Save Brand Identity
            </button>
          </div>
        )}

        {/* ── CONTACT INFO ── */}
        {activeSection === 'contact' && (
          <div>
            <div style={cardStyle}>
              <p style={sectionTitle}>Contact Information</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={labelStyle}>Main Phone Number</label>
                    <input style={inputStyle} value={phone}
                      onChange={e => setPhone(e.target.value)}
                      onFocus={e => e.target.style.borderColor = '#E5B800'}
                      onBlur={e => e.target.style.borderColor = '#2A2A2A'}
                    />
                    <p style={{ fontSize: '11px', color: '#888888', marginTop: '4px' }}>
                      Shown for pickup/call orders
                    </p>
                  </div>
                  <div>
                    <label style={labelStyle}>Catering Phone</label>
                    <input style={inputStyle} value={cateringPhone}
                      onChange={e => setCateringPhone(e.target.value)}
                      onFocus={e => e.target.style.borderColor = '#E5B800'}
                      onBlur={e => e.target.style.borderColor = '#2A2A2A'}
                    />
                    <p style={{ fontSize: '11px', color: '#888888', marginTop: '4px' }}>
                      Shown for catering inquiries
                    </p>
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Public Email Address</label>
                  <input type="email" style={inputStyle} value={email}
                    onChange={e => setEmail(e.target.value)}
                    onFocus={e => e.target.style.borderColor = '#E5B800'}
                    onBlur={e => e.target.style.borderColor = '#2A2A2A'}
                  />
                  <p style={{ fontSize: '11px', color: '#888888', marginTop: '4px' }}>
                    Used for order confirmation emails and customer contact
                  </p>
                </div>
                <div>
                  <label style={labelStyle}>Website URL</label>
                  <input style={inputStyle} value={website}
                    onChange={e => setWebsite(e.target.value)}
                    placeholder="https://eggsokphilly.com"
                    onFocus={e => e.target.style.borderColor = '#E5B800'}
                    onBlur={e => e.target.style.borderColor = '#2A2A2A'}
                  />
                </div>
              </div>
            </div>
            <button onClick={() => handleSave('Contact info')} style={{ width: '100%', padding: '13px', background: '#E5B800', border: 'none', borderRadius: '10px', color: '#000', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}>
              Save Contact Info
            </button>
          </div>
        )}

        {/* ── LOCATION ── */}
        {activeSection === 'location' && (
          <div>
            <div style={cardStyle}>
              <p style={sectionTitle}>Location Details</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={labelStyle}>Street Address</label>
                  <input style={inputStyle} value={address}
                    onChange={e => setAddress(e.target.value)}
                    onFocus={e => e.target.style.borderColor = '#E5B800'}
                    onBlur={e => e.target.style.borderColor = '#2A2A2A'}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={labelStyle}>City</label>
                    <input style={inputStyle} value={city}
                      onChange={e => setCity(e.target.value)}
                      onFocus={e => e.target.style.borderColor = '#E5B800'}
                      onBlur={e => e.target.style.borderColor = '#2A2A2A'}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>State</label>
                    <input style={inputStyle} value={state}
                      onChange={e => setState(e.target.value)}
                      onFocus={e => e.target.style.borderColor = '#E5B800'}
                      onBlur={e => e.target.style.borderColor = '#2A2A2A'}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>ZIP Code</label>
                    <input style={inputStyle} value={zip}
                      onChange={e => setZip(e.target.value)}
                      onFocus={e => e.target.style.borderColor = '#E5B800'}
                      onBlur={e => e.target.style.borderColor = '#2A2A2A'}
                    />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Country</label>
                  <input style={inputStyle} value={country}
                    onChange={e => setCountry(e.target.value)}
                    onFocus={e => e.target.style.borderColor = '#E5B800'}
                    onBlur={e => e.target.style.borderColor = '#2A2A2A'}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Google Maps Link</label>
                  <input style={inputStyle} value={googleMapsLink}
                    onChange={e => setGoogleMapsLink(e.target.value)}
                    placeholder="https://maps.google.com/..."
                    onFocus={e => e.target.style.borderColor = '#E5B800'}
                    onBlur={e => e.target.style.borderColor = '#2A2A2A'}
                  />
                  <p style={{ fontSize: '11px', color: '#888888', marginTop: '4px' }}>
                    Paste your Google Maps share link shown on website contact section
                  </p>
                </div>
                <div>
                  <label style={labelStyle}>Parking Information</label>
                  <input style={inputStyle} value={parkingInfo}
                    onChange={e => setParkingInfo(e.target.value)}
                    onFocus={e => e.target.style.borderColor = '#E5B800'}
                    onBlur={e => e.target.style.borderColor = '#2A2A2A'}
                  />
                </div>
                <div style={{ padding: '12px 14px', background: '#111111', borderRadius: '8px', border: '1px solid #2A2A2A' }}>
                  <p style={{ fontSize: '12px', fontWeight: '600', color: '#FEFEFE', marginBottom: '4px' }}>Full Address Preview</p>
                  <p style={{ fontSize: '13px', color: '#E5B800' }}>
                    {address}, {city}, {state} {zip}, {country}
                  </p>
                </div>
              </div>
            </div>
            <button onClick={() => handleSave('Location')} style={{ width: '100%', padding: '13px', background: '#E5B800', border: 'none', borderRadius: '10px', color: '#000', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}>
              Save Location
            </button>
          </div>
        )}

        {/* ── SOCIAL MEDIA ── */}
        {activeSection === 'social' && (
          <div>
            <div style={cardStyle}>
              <p style={sectionTitle}>Social Media Links</p>
              <p style={{ fontSize: '12px', color: '#888888', marginBottom: '16px' }}>
                These links appear in the website footer and app profile. Leave blank to hide.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {[
                  { label: 'Instagram', color: '#E1306C', value: instagram, set: setInstagram, placeholder: '@eggsok', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" /></svg> },
                  { label: 'Facebook', color: '#1877F2', value: facebook, set: setFacebook, placeholder: 'facebook.com/eggsok', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" /></svg> },
                  { label: 'TikTok', color: '#FEFEFE', value: tiktok, set: setTiktok, placeholder: '@eggsok', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 104 4V4a5 5 0 005 5" /></svg> },
                  { label: 'Twitter / X', color: '#FEFEFE', value: twitter, set: setTwitter, placeholder: '@eggsok', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4l16 16M4 20L20 4" /></svg> },
                  { label: 'Yelp', color: '#FF1A1A', value: yelp, set: setYelp, placeholder: 'yelp.com/biz/eggs-ok', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" /></svg> },
                  { label: 'Google Business', color: '#E5B800', value: googleBusiness, set: setGoogleBusiness, placeholder: 'Google Business profile link', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 100 20A10 10 0 0012 2zm0 3a7 7 0 110 14A7 7 0 0112 5zm1 3h-2v5l4.25 2.52.75-1.23-3-1.79V8z" /></svg> },
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '8px',
                      background: '#111111', border: '1px solid #2A2A2A',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0, color: item.color,
                    }}>{item.icon}</div>
                    <div style={{ flex: 1 }}>
                      <label style={labelStyle}>{item.label}</label>
                      <input style={inputStyle} value={item.value}
                        onChange={e => item.set(e.target.value)}
                        placeholder={item.placeholder}
                        onFocus={e => e.target.style.borderColor = '#E5B800'}
                        onBlur={e => e.target.style.borderColor = '#2A2A2A'}
                      />
                    </div>
                    {item.value && (
                      <div style={{
                        width: '24px', height: '24px', borderRadius: '6px',
                        background: '#22C55E', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        marginTop: '16px', flexShrink: 0,
                      }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#E5B800" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <button onClick={() => handleSave('Social media')} style={{ width: '100%', padding: '13px', background: '#E5B800', border: 'none', borderRadius: '10px', color: '#000', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}>
              Save Social Media
            </button>
          </div>
        )}

        {/* ── SEO ── */}
        {activeSection === 'seo' && (
          <div>
            <div style={cardStyle}>
              <p style={sectionTitle}>SEO Settings</p>
              <div style={{ padding: '12px 14px', background: '#111111', borderRadius: '8px', border: '1px solid #E5B80030', marginBottom: '16px' }}>
                <p style={{ fontSize: '12px', color: '#E5B800', marginBottom: '4px', fontWeight: '600' }}>Why SEO matters</p>
                <p style={{ fontSize: '11px', color: '#888888', lineHeight: '1.6' }}>
                  Good SEO settings help your restaurant appear higher in Google search results, bringing more organic (free) traffic to your ordering website. Set these once and Google will do the rest.
                </p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={labelStyle}>Page Title (shown in Google results)</label>
                  <input style={inputStyle} value={seoTitle}
                    onChange={e => setSeoTitle(e.target.value)}
                    onFocus={e => e.target.style.borderColor = '#E5B800'}
                    onBlur={e => e.target.style.borderColor = '#2A2A2A'}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                    <p style={{ fontSize: '11px', color: '#888888' }}>Recommended: 50–60 characters</p>
                    <p style={{ fontSize: '11px', color: seoTitle.length > 60 ? '#FC0301' : '#22C55E' }}>
                      {seoTitle.length}/60
                    </p>
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Meta Description (shown below title in Google)</label>
                  <textarea style={{ ...inputStyle, height: '80px', resize: 'none' as const }}
                    value={seoDescription}
                    onChange={e => setSeoDescription(e.target.value)}
                    onFocus={e => e.target.style.borderColor = '#E5B800'}
                    onBlur={e => e.target.style.borderColor = '#2A2A2A'}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                    <p style={{ fontSize: '11px', color: '#888888' }}>Recommended: 150–160 characters</p>
                    <p style={{ fontSize: '11px', color: seoDescription.length > 160 ? '#FC0301' : '#22C55E' }}>
                      {seoDescription.length}/160
                    </p>
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Keywords (comma separated)</label>
                  <textarea style={{ ...inputStyle, height: '70px', resize: 'none' as const }}
                    value={seoKeywords}
                    onChange={e => setSeoKeywords(e.target.value)}
                    onFocus={e => e.target.style.borderColor = '#E5B800'}
                    onBlur={e => e.target.style.borderColor = '#2A2A2A'}
                  />
                </div>

                {/* Google Preview */}
                <div style={{ padding: '14px 16px', background: '#FEFEFE', borderRadius: '8px', border: '1px solid #2A2A2A' }}>
                  <p style={{ fontSize: '11px', color: '#888888', marginBottom: '8px', fontWeight: '600' }}>Google Search Preview</p>
                  <p style={{ fontSize: '14px', color: '#1a0dab', marginBottom: '2px' }}>{seoTitle}</p>
                  <p style={{ fontSize: '12px', color: '#006621', marginBottom: '4px' }}>eggsokphilly.com</p>
                  <p style={{ fontSize: '12px', color: '#545454', lineHeight: '1.5' }}>{seoDescription.substring(0, 160)}</p>
                </div>
              </div>
            </div>
            <button onClick={() => handleSave('SEO settings')} style={{ width: '100%', padding: '13px', background: '#E5B800', border: 'none', borderRadius: '10px', color: '#000', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}>
              Save SEO Settings
            </button>
          </div>
        )}

        {/* ── OWNER PROFILE ── */}
        {activeSection === 'owner' && (
          <div>
            <div style={cardStyle}>
              <p style={sectionTitle}>Owner / Admin Profile</p>
              <div style={{ display: 'flex', gap: '20px', marginBottom: '16px' }}>
                <div style={{ flexShrink: 0 }}>
                  <label style={labelStyle}>Profile Photo</label>
                  <div style={{
                    width: '100px', height: '100px', borderRadius: '50%',
                    background: '#111111', border: '2px dashed #2A2A2A',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    overflow: 'hidden', cursor: 'pointer', position: 'relative',
                    transition: 'border-color 0.2s',
                  }}
                    onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.borderColor = '#E5B800'}
                    onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.borderColor = '#2A2A2A'}
                  >
                    {ownerPhotoPreview ? (
                      <img src={ownerPhotoPreview} alt="Owner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <User size={36} color="#FEFEFE" />
                    )}
                    <input type="file" accept="image/*"
                      onChange={e => handleImageUpload(e, setOwnerPhotoPreview)}
                      style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                    />
                  </div>
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={labelStyle}>Full Name</label>
                    <input style={inputStyle} value={ownerName}
                      onChange={e => setOwnerName(e.target.value)}
                      onFocus={e => e.target.style.borderColor = '#E5B800'}
                      onBlur={e => e.target.style.borderColor = '#2A2A2A'}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Admin Email</label>
                    <input type="email" style={inputStyle} value={ownerEmail}
                      onChange={e => setOwnerEmail(e.target.value)}
                      onFocus={e => e.target.style.borderColor = '#E5B800'}
                      onBlur={e => e.target.style.borderColor = '#2A2A2A'}
                    />
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={labelStyle}>Contact Phone</label>
                  <input style={inputStyle} value={ownerPhone}
                    onChange={e => setOwnerPhone(e.target.value)}
                    placeholder="Private not shown publicly"
                    onFocus={e => e.target.style.borderColor = '#E5B800'}
                    onBlur={e => e.target.style.borderColor = '#2A2A2A'}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Owner Bio (optional shown on website)</label>
                  <textarea style={{ ...inputStyle, height: '80px', resize: 'none' as const }}
                    value={ownerBio}
                    onChange={e => setOwnerBio(e.target.value)}
                    placeholder="A short note from the owner..."
                    onFocus={e => e.target.style.borderColor = '#E5B800'}
                    onBlur={e => e.target.style.borderColor = '#2A2A2A'}
                  />
                </div>
                <div style={{ padding: '12px 14px', background: '#111111', borderRadius: '8px', border: '1px solid #2A2A2A' }}>
                  <p style={{ fontSize: '12px', color: '#888888', lineHeight: '1.6' }}>
                    Admin email and phone are private and never shown publicly. Owner name and bio (if provided) may appear on the About section of the website.
                  </p>
                </div>
              </div>
            </div>
            <button onClick={() => handleSave('Owner profile')} style={{ width: '100%', padding: '13px', background: '#E5B800', border: 'none', borderRadius: '10px', color: '#000', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}>
              Save Owner Profile
            </button>
          </div>
        )}
      </div>
    </div>
  );
}