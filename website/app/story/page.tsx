import Link from 'next/link';
import Image from 'next/image';
import Header from '../components/Header';

export default function StoryPage() {
  const values = [
    { icon: '🥚', title: 'Fresh Every Day', desc: 'Every item on our menu is made fresh to order. No freezers, no shortcuts — just real food made with care.' },
    { icon: '🌍', title: 'Cultural Fusion', desc: 'Our menu blends American breakfast classics with Indonesian flavors, creating something truly unique in Philadelphia.' },
    { icon: '🤝', title: 'Community First', desc: 'We are proud to serve West Philadelphia. Every order supports our local team and the neighborhood we love.' },
    { icon: '♻️', title: 'Sustainable', desc: 'We source locally where possible and are committed to reducing our environmental footprint every day.' },
  ];

  const team = [
    { name: 'Berry', role: 'Co-Founder & Chef', initial: 'B' },
    { name: 'Steven', role: 'Co-Founder & Operations', initial: 'S' },
  ];

  const timeline = [
    { year: '2020', title: 'The Idea', desc: 'Berry and Steven dreamed of bringing bold, fresh breakfast to West Philadelphia.' },
    { year: '2021', title: 'First Kitchen', desc: 'Started as a pop-up at local markets — the response was overwhelming.' },
    { year: '2022', title: 'Brick & Mortar', desc: 'Opened our first location at 3517 Lancaster Ave, Philadelphia PA 19104.' },
    { year: '2023', title: 'Growing Menu', desc: 'Expanded to include Indonesian-inspired dishes and specialty drinks.' },
    { year: '2024', title: 'Delivery Launch', desc: 'Launched delivery service to bring Eggs Ok to more Philadelphia neighborhoods.' },
    { year: '2026', title: 'Online Ordering', desc: 'Launched our custom ordering platform for the best digital experience.' },
  ];

  return (
    <div style={{ background: '#000', minHeight: '100vh' }}>
      <Header />

      {/* Hero */}
      <section style={{
        padding: '100px 24px 80px',
        background: 'linear-gradient(180deg, #000 0%, #0A0A0A 100%)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, #FED80010 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', position: 'relative' }}>
          <p style={{ fontSize: '13px', color: '#FED800', fontWeight: '600', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '16px' }}>Our Story</p>
          <h1 style={{ fontSize: 'clamp(52px, 10vw, 120px)', color: '#FEFEFE', lineHeight: '0.9', marginBottom: '24px' }}>
            MADE WITH<br /><span style={{ color: '#FED800' }}>PURPOSE</span>
          </h1>
          <p style={{ fontSize: '18px', color: '#888888', lineHeight: '1.8', maxWidth: '580px', margin: '0 auto' }}>
            Eggs Ok was born from a simple belief — that everyone deserves a great breakfast. Fresh ingredients, bold flavors, and a whole lot of love from West Philadelphia.
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section style={{ padding: '80px 24px', background: '#0A0A0A' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center' }}>
            {/* Logo Visual */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: '360px', height: '360px', borderRadius: '50%', background: 'radial-gradient(circle, #FED80025 0%, #FED80005 60%, transparent 80%)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                <div style={{ position: 'absolute', inset: '20px', borderRadius: '50%', border: '2px dashed #FED80030', animation: 'spin 40s linear infinite' }} />
                <div style={{ width: '220px', height: '220px', borderRadius: '50%', background: '#FED800', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 60px #FED80030' }}>
                  <Image src="/logo.svg" alt="Eggs Ok" width={180} height={180} style={{ objectFit: 'contain' }} />
                </div>
              </div>
            </div>
            {/* Text */}
            <div>
              <p style={{ fontSize: '13px', color: '#FED800', fontWeight: '600', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '12px' }}>Who We Are</p>
              <h2 style={{ fontSize: 'clamp(36px, 5vw, 56px)', color: '#FEFEFE', marginBottom: '20px' }}>
                WEST PHILLY'S<br />BREAKFAST SPOT
              </h2>
              <p style={{ fontSize: '15px', color: '#888888', lineHeight: '1.8', marginBottom: '16px' }}>
                We are Berry and Steven — two friends who believed that Philadelphia deserved a breakfast spot that was bold, fresh, and unapologetically delicious.
              </p>
              <p style={{ fontSize: '15px', color: '#888888', lineHeight: '1.8', marginBottom: '16px' }}>
                Our menu is a love letter to two cultures — the classic American breakfast sandwich elevated with Indonesian spices, sauces, and techniques that make every bite memorable.
              </p>
              <p style={{ fontSize: '15px', color: '#888888', lineHeight: '1.8', marginBottom: '28px' }}>
                From our signature Bacon Egg & Cheese with housemade OK sauce to our Indonesian-inspired Telur Padang Omelette — every item tells a story.
              </p>
              <Link href="/order" className="btn-primary" style={{ fontSize: '15px', padding: '14px 32px' }}>
                Try Our Menu
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section style={{ padding: '80px 24px', background: '#000' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <p style={{ fontSize: '13px', color: '#FED800', fontWeight: '600', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '12px' }}>What We Stand For</p>
            <h2 style={{ fontSize: 'clamp(36px, 6vw, 64px)', color: '#FEFEFE' }}>
              OUR <span style={{ color: '#FED800' }}>VALUES</span>
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
            {values.map((val, i) => (
              <div key={i} style={{ padding: '28px 20px', background: '#111111', border: '1px solid #1A1A1A', borderRadius: '14px', textAlign: 'center' }}>
                <div style={{ fontSize: '36px', marginBottom: '14px' }}>{val.icon}</div>
                <h3 style={{ fontSize: '22px', color: '#FEFEFE', marginBottom: '10px' }}>{val.title.toUpperCase()}</h3>
                <p style={{ fontSize: '13px', color: '#888888', lineHeight: '1.6' }}>{val.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section style={{ padding: '80px 24px', background: '#0A0A0A' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <p style={{ fontSize: '13px', color: '#FED800', fontWeight: '600', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '12px' }}>Our Journey</p>
            <h2 style={{ fontSize: 'clamp(36px, 6vw, 64px)', color: '#FEFEFE' }}>
              HOW WE <span style={{ color: '#FED800' }}>GOT HERE</span>
            </h2>
          </div>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '2px', background: '#1A1A1A', transform: 'translateX(-50%)' }} />
            {timeline.map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '24px', marginBottom: '32px', flexDirection: i % 2 === 0 ? 'row' : 'row-reverse' }}>
                <div style={{ flex: 1, textAlign: i % 2 === 0 ? 'right' : 'left' }}>
                  <div style={{ padding: '20px', background: '#111111', border: '1px solid #1A1A1A', borderRadius: '12px', display: 'inline-block', maxWidth: '280px', textAlign: 'left' }}>
                    <p style={{ fontSize: '12px', color: '#FED800', fontWeight: '700', marginBottom: '4px' }}>{item.year}</p>
                    <p style={{ fontSize: '16px', fontWeight: '700', color: '#FEFEFE', marginBottom: '6px' }}>{item.title}</p>
                    <p style={{ fontSize: '13px', color: '#888888', lineHeight: '1.5' }}>{item.desc}</p>
                  </div>
                </div>
                <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#FED800', border: '3px solid #000', flexShrink: 0, marginTop: '20px', position: 'relative', zIndex: 1 }} />
                <div style={{ flex: 1 }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section style={{ padding: '80px 24px', background: '#000' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: '13px', color: '#FED800', fontWeight: '600', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '12px' }}>Meet The Founders</p>
          <h2 style={{ fontSize: 'clamp(36px, 6vw, 64px)', color: '#FEFEFE', marginBottom: '48px' }}>
            THE PEOPLE <span style={{ color: '#FED800' }}>BEHIND THE EGG</span>
          </h2>
          <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', flexWrap: 'wrap' as const }}>
            {team.map((member, i) => (
              <div key={i} style={{ padding: '32px', background: '#111111', border: '1px solid #1A1A1A', borderRadius: '16px', flex: 1, minWidth: '200px', maxWidth: '280px' }}>
                <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: '#FED800', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: '800', color: '#000', margin: '0 auto 16px', fontFamily: 'Bebas Neue, sans-serif' }}>
                  {member.initial}
                </div>
                <h3 style={{ fontSize: '28px', color: '#FEFEFE', marginBottom: '4px' }}>{member.name.toUpperCase()}</h3>
                <p style={{ fontSize: '13px', color: '#FED800', fontWeight: '600' }}>{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 24px', background: '#FED800', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(0,0,0,0.05)' }} />
        <div style={{ position: 'relative' }}>
          <h2 style={{ fontSize: 'clamp(40px, 8vw, 80px)', color: '#000', marginBottom: '16px' }}>
            COME TASTE THE STORY
          </h2>
          <p style={{ fontSize: '16px', color: '#00000070', marginBottom: '32px' }}>
            3517 Lancaster Ave, Philadelphia PA 19104
          </p>
          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' as const }}>
            <Link href="/order" style={{ padding: '15px 36px', background: '#000', color: '#FED800', borderRadius: '12px', fontSize: '16px', fontWeight: '700', display: 'inline-block' }}>
              Order Online
            </Link>
            <Link href="/catering" style={{ padding: '15px 36px', background: 'transparent', border: '2px solid #000', color: '#ffffffff', borderRadius: '12px', fontSize: '16px', fontWeight: '700', display: 'inline-block' }}>
              Catering
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}