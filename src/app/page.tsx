'use client';
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import CheckoutModal from '@/components/CheckoutModal';
import AuthModal from '@/components/AuthModal';
import styles from './page.module.css';

export default function HomePage() {
  const [checkoutPlan, setCheckoutPlan] = useState<string | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'signup' | null>(null);
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <>
      <Navbar
        onSignup={() => setAuthMode('signup')}
        onLogin={() => setAuthMode('login')}
      />

      {/* HERO */}
      <section className={styles.hero} id="home">
        <div className={styles.heroInner}>
          <div className={styles.heroContent}>
            <div className={styles.badge}><span/>Cloud SaaS for Nigerian Schools</div>
            <h1 className={styles.heroH1}>Run Your School Smarter.<br/><span className={styles.highlight}>Everything in One Place.</span></h1>
            <p>TitbeatTechsolutions.app helps K-12 school admins and teachers manage students records,attendance, roll-call, result generation, track fees, send notifications and run timetables — all from one dashboard, on any device.</p>
            <div className={styles.heroBtns}>
              <button className={styles.btnPrimary} onClick={() => setAuthMode('signup')}>Start Free Trial</button>
              <a href="#how-it-works" className={styles.btnOutline}>See How It Works</a>
            </div>
            <div className={styles.heroStats}>
              {[['14','Day Free Trial'],['99.9%','Uptime SLA'],['K-12','Schools'],['NGN','Local Billing']].map(([v,l]) => (
                <div key={l} className={styles.stat}><div className={styles.val}>{v}</div><div className={styles.lbl}>{l}</div></div>
              ))}
            </div>
          </div>
          <div className={styles.heroVisual}>
            <div className={styles.floatBadgeTop}><span className={styles.dotGreen}/>System Online — 99.9% uptime</div>
            <div className={styles.mockupCard}>
              <div className={styles.mockupHeader}><h4>📊 Admin Dashboard</h4><div className={styles.dots}><span/><span/><span/></div></div>
              <div className={styles.mockupStats}>
                <div className={`${styles.mStat} ${styles.blue}`}><div className={styles.mVal}>1,247</div><div className={styles.mLbl}>Students</div></div>
                <div className={`${styles.mStat} ${styles.orange}`}><div className={styles.mVal}>₦4.2M</div><div className={styles.mLbl}>Fees Collected</div></div>
                <div className={`${styles.mStat} ${styles.green}`}><div className={styles.mVal}>94%</div><div className={styles.mLbl}>Attendance</div></div>
              </div>
            </div>
            <div className={styles.floatBadgeBottom}><span className={styles.dotBlue}/>Fee payment received — Adaeze O.</div>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div className={styles.marqueeSection}>
        <p className={styles.marqueeLabel}>Trusted by schools across Nigeria</p>
        <div className={styles.marqueeTrack}>
          {['🏫 Greenfield Academy','📚 Horizon Schools','🎓 Royal Crown College','🏫 Sunlight Preparatory','📚 Excel International','🎓 New Vista Schools',
            '🏫 Pinnacle Academy','📚 Bright Future College','🎓 Heritage Schools',
            '🏫 Greenfield Academy','📚 Horizon Schools','🎓 Royal Crown College'].map((s,i) => <span key={i}>{s}</span>)}
        </div>
      </div>

      {/* PROMO BANNER */}
      <section className={styles.promoBannerSection}>
        <div className={styles.promoBannerContainer}>
          <img src="/promo-banner.png" alt="Cloud SaaS App for Modern School Administration" className={styles.promoBannerImage} />
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className={styles.section}>
        <div className={styles.sectionHead}>
          <p className={styles.sectionLabel}>Key Features</p>
          <h2 className={styles.sectionTitle}>Everything Your School Needs</h2>
          <p className={styles.sectionSub}>Six powerful modules designed to eliminate paperwork and put data at your fingertips.</p>
        </div>
        <div className={styles.featGrid}>
          {[
            ['📊','Admin Dashboard','Real-time insights into attendance, performance & finance — all in one view.'],
            ['🎓','Student Management','Enrollment, profiles, grade tracking & automated report card generation.'],
            ['💳','Fee Management','Automated billing, payment tracking & instant digital receipts for parents.'],
            ['🔔','Smart Notifications','SMS/email alerts for parents, staff & all stakeholders — automatically sent.'],
            ['📅','Timetable Planner','Drag-and-drop scheduling for classes and exams with conflict detection.'],
            ['🔒','Role-Based Security','Fine-grained access control for every user type — principals, teachers & parents.'],
          ].map(([icon,title,desc]) => (
            <div key={title} className={styles.featCard}>
              <div className={styles.featIcon}>{icon}</div>
              <h3>{title}</h3>
              <p>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className={styles.section}>
        <div className={styles.sectionHead}>
          <p className={styles.sectionLabel}>How It Works</p>
          <h2 className={styles.sectionTitle}>Up and Running in Minutes</h2>
          <p className={styles.sectionSub}>No IT team needed. Set up your school and go live in three simple steps.</p>
        </div>
        <div className={styles.stepsGrid}>
          {[
            ['1','Sign Up & Set Up','Create your school account, set term dates and configure your profile in minutes.'],
            ['2','Add Students, Staff & Fees','Bulk upload students via CSV. Set fee structures per class, per term and invite staff.'],
            ['3','Run Your School','Collect fees, track attendance, send alerts and generate reports — all from one dashboard.'],
          ].map(([n,t,d]) => (
            <div key={n} className={styles.stepCard}>
              <div className={styles.stepNum}>{n}</div>
              <h3>{t}</h3><p>{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className={styles.section}>
        <div className={styles.sectionHead}>
          <p className={styles.sectionLabel}>Pricing</p>
          <h2 className={styles.sectionTitle}>Simple, Transparent Plans</h2>
          <p className={styles.sectionSub}>Termly plans aligned with Nigeria&apos;s school calendar. No hidden fees.</p>
          <p className={styles.sectionSub}>💡 All prices in Nigerian Naira (₦) | No credit card required for free trial.</p>
          <div className={styles.toggleWrap}>
            <span className={!isAnnual ? styles.activeToggle : ''}>Termly</span>
            <button className={`${styles.toggleBtn} ${isAnnual ? styles.toggled : ''}`} onClick={() => setIsAnnual(!isAnnual)}>
              <div className={styles.toggleKnob} />
            </button>
            <span className={isAnnual ? styles.activeToggle : ''}>Annually (3 Terms)</span>
          </div>
        </div>
        <div className={styles.pricingGrid}>
          {[
            { id:'starter', name:'Starter', desc:'< 300 students', basePrice:30000, features:['Up to 300 students','Admin + 2 staff accounts','Fee management','SMS notifications','Email support'], popular:false },
            { id:'growth',  name:'Growth',  desc:'300–1,000 students', basePrice:50000, features:['Up to 1,000 students','Unlimited staff accounts','Full feature access','Analytics dashboard','Priority support'], popular:true },
            { id:'enterprise', name:'Enterprise', desc:'Large / Multi-branch', basePrice:90000, features:['Unlimited students','Multi-branch support','API integrations','Dedicated account manager','SLA guarantee'], popular:false, plus: true },
          ].map(plan => {
            const currentPrice = isAnnual ? plan.basePrice * 3 : plan.basePrice;
            const priceStr = currentPrice.toLocaleString();
            return (
            <div key={plan.id} className={`${styles.priceCard} ${plan.popular ? styles.popular : ''}`}>
              {plan.popular && <div className={styles.popularBadge}>★ MOST POPULAR</div>}
              <div className={styles.priceTier}>{plan.name}</div>
              <div className={styles.priceDesc}>{plan.desc}</div>
              <div className={styles.priceAmount}><span className={styles.currency}>₦</span>{priceStr}{plan.plus ? '+' : ''}</div>
              <hr className={styles.priceDivider}/>
              <ul className={styles.priceFeatures}>
                {plan.features.map(f => <li key={f}>{f}</li>)}
              </ul>
              <button
                className={plan.popular ? styles.btnPrimary : styles.btnOutlinePlan}
                onClick={() => setCheckoutPlan(plan.id)}>
                Start Free Trial
              </button>
            </div>
          )})}
        </div>
      </section>

      {/* FEATURE COMPARISON */}
      <section className={styles.section} id="compare">
        <div className={styles.sectionHead}>
          <p className={styles.sectionLabel}>Compare</p>
          <h2 className={styles.sectionTitle}>Feature Comparison</h2>
        </div>
        <div className={styles.tableWrapper}>
          <table className={styles.compareTable}>
            <thead>
              <tr>
                <th>Feature</th>
                <th>Starter</th>
                <th>Growth</th>
                <th>Enterprise</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Student management</td><td>Up to 300</td><td>Up to 1,000</td><td>Unlimited</td></tr>
              <tr><td>Staff accounts</td><td>Admin + 2</td><td>Unlimited</td><td>Unlimited</td></tr>
              <tr><td>Fee management</td><td>✓</td><td>✓</td><td>✓</td></tr>
              <tr><td>SMS/email notifications</td><td>✓</td><td>✓</td><td>✓</td></tr>
              <tr><td>Analytics dashboard</td><td>✗</td><td>✓</td><td>✓</td></tr>
              <tr><td>Timetable planner</td><td>Basic</td><td>Full</td><td>Full</td></tr>
              <tr><td>Multi-branch support</td><td>✗</td><td>✗</td><td>✓</td></tr>
              <tr><td>API integrations</td><td>✗</td><td>✗</td><td>✓</td></tr>
              <tr><td>Dedicated account manager</td><td>✗</td><td>✗</td><td>✓</td></tr>
              <tr><td>Support</td><td>Email</td><td>Priority</td><td>Dedicated SLA</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* TRUST BADGES */}
      <section className={styles.trustSection}>
        <div className={styles.trustBadges}>
          {[
            ['🔒', '256-bit SSL Encryption'],
            ['⚡', '99.9% Uptime SLA'],
            ['💳', 'Paystack, Bank Transfer & Flutterwave'],
            ['🇳🇬', 'NDPR Compliant'],
            ['🔄', 'Cancel Anytime']
          ].map(([icon, label]) => (
            <div key={label} className={styles.trustBadge}>
              <span className={styles.trustIcon}>{icon}</span>
              <span className={styles.trustLabel}>{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className={styles.section} id="testimonials">
        <div className={styles.sectionHead}>
          <p className={styles.sectionLabel}>Social Proof</p>
          <h2 className={styles.sectionTitle}>Loved by School Admins</h2>
          <p className={styles.sectionSub}>Real feedback from proprietors across Nigeria.</p>
        </div>
        <div className={styles.testiGrid}>
          {[
            { q:'"We used to spend 3 days every term chasing fee payments. Now parents pay online and we get instant alerts."', name:'Adaeze Nwosu', role:'Proprietress, Greenfield Academy, Lagos', color:'#4472C4' },
            { q:'"The timetable planner alone saved us hours every term. And parents love the SMS updates."', name:'Emmanuel Okafor', role:'Head Teacher, Horizon Schools, Abuja', color:'#ED7D31' },
            { q:'"Setting up was so easy. Within one day our bursar was collecting fees on their phones. Incredible."', name:'Funke Adeyemi', role:'Principal, Royal Crown College, Ibadan', color:'#70AD47' },
          ].map(t => (
            <div key={t.name} className={styles.testiCard}>
              <div className={styles.stars}>★★★★★</div>
              <p className={styles.quote}>{t.q}</p>
              <div className={styles.author}>
                <div className={styles.avatar} style={{ background: `linear-gradient(135deg,${t.color},${t.color}99)` }}>{t.name[0]}</div>
                <div><div className={styles.authorName}>{t.name}</div><div className={styles.authorRole}>{t.role}</div></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className={styles.section}>
        <div className={styles.aboutGrid}>
          <div>
            <p className={styles.sectionLabel}>About Us</p>
            <h2 className={styles.sectionTitle}>Built for Nigerian Schools, by Nigerians.</h2>
            <p className={styles.sectionSub}>TitbeatTechsolutions was born out of a simple observation: Nigerian school administrators and teachers spend too much time on paperwork, and not enough time on what truly matters—shaping the future of our children. A cloud saas app was built to change that — giving every Nigerian school access to enterprise-grade management tools at an affordable subscription.</p>
            <button className={styles.btnPrimary} style={{ marginTop:'1.5rem' }} onClick={() => setAuthMode('signup')}>Join Our Growing Community</button>
          </div>
          <div className={styles.aboutCards}>
            {[['🎯','Mission','Empower Nigerian Schools'],['🌍','Market','Nigerian K-12 Private Schools'],['📋','Compliance','NDPR Compliant'],['📱','Access','Mobile-First Design']].map(([icon,h,v]) => (
              <div key={h} className={styles.ovCard}><div className={styles.ovIcon}>{icon}</div><h4>{h}</h4><div className={styles.ovVal}>{v}</div></div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className={styles.section} id="faq">
        <div className={styles.sectionHead}>
          <p className={styles.sectionLabel}>FAQ</p>
          <h2 className={styles.sectionTitle}>Frequently Asked Questions</h2>
        </div>
        <div className={styles.faqList}>
          <FaqItem q="Do I need a credit card to start the free trial?" a="No credit card required. Sign up and get full access for 14 days free. Your data is never deleted when the trial ends — just choose a plan to continue."/>
          <FaqItem q="What payment methods are supported?" a="We accept card payments (Visa, Mastercard, Verve), bank transfers and USSD payments via Paystack — the most popular payment methods for Nigerian schools."/>
          <FaqItem q="Can I switch plans later?" a="Yes. You can upgrade or downgrade your plan at any time. Upgrades take effect immediately; downgrades apply from the next billing term."/>
          <FaqItem q="Is my school's data safe?" a="Absolutely. All data is encrypted with 256-bit SSL, stored securely, and we are fully NDPR compliant. We never share your data with third parties without consent."/>
          <FaqItem q="Does it work on mobile phones?" a="Yes — TitbeatTech is designed mobile-first. It works perfectly on Android and iOS phones, tablets, and desktops. No app download required."/>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.ctaSection} id="contact">
        <p className={styles.sectionLabel}>Get Started Today</p>
        <h2>Let&apos;s Build the <span className={styles.ctaGradient}>Future of Education</span></h2>
        <p>TitbeatTechsolutions.app — Empowering schools, one subscription at a time.</p>
        <div className={styles.ctaBtns}>
          <button className={styles.btnPrimary} onClick={() => setAuthMode('signup')}>Start Free Trial — No Card Needed</button>
          <button className={styles.btnOutline} onClick={() => setCheckoutPlan('growth')}>View Pricing</button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className={styles.footer}>
        <div className={styles.footerMain}>
          <div className={styles.footerBrand}>
            <a href="#" className={styles.footerLogo} style={{ textDecoration: 'none', color: '#fff' }}>
              <img src="/tbt-logo.png" alt="TitbeatTech Solutions Logo" style={{ height: '40px', width: 'auto' }} />
              <span style={{ fontSize: '1.2rem', fontWeight: 900, letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>TITBEATTECH SOLUTIONS</span>
            </a>
            <p>Empowering Nigerian K-12 schools with a modern, cloud-based platform to streamline operations, fees, and communication.</p>
            <div className={styles.socials}>
              <a href="https://web.facebook.com/profile.php?id=61591661423267" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><svg viewBox="0 0 320 512" fill="currentColor" width="18" height="18"><path d="M279.1 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.4 0 225.4 0c-73.22 0-121.1 44.38-121.1 124.7v70.62H22.89V288h81.39v224h100.2V288z"/></svg></a>
              <a href="https://www.linkedin.com/company/titbeattechsolutions/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><svg viewBox="0 0 448 512" fill="currentColor" width="18" height="18"><path d="M100.3 448H7.4V148.9h92.9zM53.8 108.1C24.1 108.1 0 83.5 0 53.8a53.8 53.8 0 0 1 107.6 0c0 29.7-24.1 54.3-53.8 54.3zM447.9 448h-92.7V302.4c0-34.7-.7-79.2-48.3-79.2-48.3 0-55.7 37.7-55.7 76.7V448h-92.8V148.9h89.1v40.8h1.3c12.4-23.5 42.7-48.3 87.9-48.3 94 0 111.3 61.9 111.3 142.3V448z"/></svg></a>
              <a href="#" aria-label="Twitter"><svg viewBox="0 0 512 512" fill="currentColor" width="18" height="18"><path d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L273 181.1zM364.5 421.7h39.1L151.1 88h-42z"/></svg></a>
              <a href="https://www.tiktok.com/@titbeattechsolution" target="_blank" rel="noopener noreferrer" aria-label="TikTok"><svg viewBox="0 0 448 512" fill="currentColor" width="18" height="18"><path d="M448 209.9a210.1 210.1 0 0 1 -122.8-39.3V349.4A162.6 162.6 0 1 1 185 188.3V278.2a74.6 74.6 0 1 0 52.2 71.2V0l88 0a121.2 121.2 0 0 0 1.9 22.2h0A122.2 122.2 0 0 0 381 102.4a121.4 121.4 0 0 0 67 20.1z"/></svg></a>
              <a href="mailto:titbeattechsolutions@gmail.com" aria-label="Email"><svg viewBox="0 0 512 512" fill="currentColor" width="18" height="18"><path d="M48 64C21.5 64 0 85.5 0 112c0 15.1 7.1 29.3 19.2 38.4L236.8 313.6c11.4 8.5 27 8.5 38.4 0L492.8 150.4c12.1-9.1 19.2-23.3 19.2-38.4c0-26.5-21.5-48-48-48H48zM0 176V384c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V176L294.4 339.2c-22.8 17.1-54 17.1-76.8 0L0 176z"/></svg></a>
            </div>
          </div>
          <div className={styles.footerCol}><h4>Product</h4><a href="#features">Features</a><a href="#pricing">Pricing</a><a href="#how-it-works">How it Works</a></div>
          <div className={styles.footerCol}><h4>Company</h4><a href="#about">About Us</a><a href="#contact">Contact Sales</a><a href="#">Support</a></div>
          <div className={styles.footerCol}><h4>Legal</h4><a href="/privacy">Privacy Policy</a><a href="/terms">Terms of Service</a><a href="/ndpr-compliance">NDPR Compliance</a></div>
        </div>
        <div className={styles.footerBottom}>
          <p>© 2026 TitbeatTechsolutions.app — All rights reserved.</p>
          <div className={styles.footerBadges}><span>99.9% Uptime SLA</span><span>256-bit SSL Encrypted</span></div>
        </div>
      </footer>

      {/* WHATSAPP FLOAT */}
      <a className={styles.waFloat} href="https://wa.me/2349060446496" target="_blank" rel="noreferrer" title="Chat on WhatsApp" aria-label="Chat on WhatsApp">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="30" height="30" fill="#fff">
          <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zM223.9 414.7c-33 0-65.3-8.9-93.5-25.7l-6.7-4-69.5 18.2 18.6-67.8-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.4-186.6 184.4zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
        </svg>
      </a>

      <CheckoutModal plan={checkoutPlan} isAnnual={isAnnual} onClose={() => setCheckoutPlan(null)} />
      <AuthModal mode={authMode} onClose={() => setAuthMode(null)} onSwitchToCheckout={(p) => { setAuthMode(null); setCheckoutPlan(p); }} />
    </>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={styles.faqItem}>
      <button className={styles.faqQ} onClick={() => setOpen(o => !o)}>
        {q}<span>{open ? '−' : '+'}</span>
      </button>
      {open && <div className={styles.faqA}><p>{a}</p></div>}
    </div>
  );
}
