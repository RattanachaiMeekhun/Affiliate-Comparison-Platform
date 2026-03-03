'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/util/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './LoginModal.module.css';

interface LoginModalProps {
  open: boolean;
  onCancel: () => void;
}

type ViewState = 'signIn' | 'signUp' | 'disclosure' | 'features' | 'privacy';

export default function LoginModal({ open, onCancel }: LoginModalProps) {
  const [view, setView] = useState<ViewState>('signIn');
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  // Reset view when modal closes
  useEffect(() => {
    if (!open) {
      setTimeout(() => setView('signIn'), 300);
      setAgreed(false);
      setLoading(false);
    }
  }, [open]);

  if (!open) return null;

  const handleGoogleLogin = async () => {
    if (view === 'signUp' && !agreed) return;
    setLoading(true);
    
    const redirectUrl = typeof window !== 'undefined' 
      ? `${window.location.origin}/auth/callback` 
      : 'http://localhost:3000/auth/callback';

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
      },
    });

    if (error) {
      console.error('Error logging in with Google:', error);
      setLoading(false);
    }
  };

  const renderGoogleButton = (label: string) => (
    <button 
      className={styles.socialBtn}
      onClick={handleGoogleLogin}
      disabled={loading || (view === 'signUp' && !agreed)}
      style={{ opacity: loading || (view === 'signUp' && !agreed) ? 0.6 : 1 }}
    >
      <div className={styles.googleIconWhiteBg}>
        <svg className={styles.googleIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" fill="#EA4335"></path>
        </svg>
      </div>
      <span>{loading ? 'Connecting...' : label}</span>
    </button>
  );

  const renderTrustIndicators = () => (
    <div className={styles.trustIndicators}>
      <div className={styles.trustBadge}>
        <span className="material-symbols-outlined" style={{ fontSize: '1.125rem' }}>verified_user</span>
        <span className={styles.trustText}>Secure SSL</span>
      </div>
      <div className={styles.trustBadge}>
        <span className="material-symbols-outlined" style={{ fontSize: '1.125rem' }}>encrypted</span>
        <span className={styles.trustText}>256-bit AES</span>
      </div>
    </div>
  );

  const renderDocsContent = () => {
    let title = '';
    let content = null;
    
    if (view === 'disclosure') {
      title = 'Affiliate Disclosure';
      content = (
        <>
          <p>Transparency is core to the stacknodes.net experience. We believe in providing data-driven, unbiased insights to help you choose the best tech, games, and services.</p>
          <h3>How We Make Money</h3>
          <p>stacknodes.net is an affiliate-supported platform. When you click on a product comparison link—such as those pointing to Shopee, Lazada, or other marketplaces—and complete a purchase, we may receive a small commission from the merchant.</p>
          <h3>Our Promise to You</h3>
          <ul>
            <li><strong>Objectivity:</strong> Our AI-driven comparison engine prioritizes value and specifications, not commission rates.</li>
            <li><strong>Transparency:</strong> We clearly identify affiliate links and provide accurate pricing and specification data wherever possible.</li>
            <li><strong>Independence:</strong> Our recommendations are based on our proprietary matching engine, which aims to find the best match for your needs based on the latest market data.</li>
          </ul>
          <p><em>Thank you for supporting stacknodes.net, which allows us to continue building and refining the tools that help you shop smarter.</em></p>
        </>
      );
    } else if (view === 'features') {
      title = 'Platform Features';
      content = (
        <>
          <p>stacknodes.net serves as a high-performance, data-driven hub that bridges the gap between raw e-commerce data and informed purchasing decisions.</p>
          <ul>
            <li><strong>Smart Aggregator:</strong> Centralizes data from Shopee, Lazada, and partner programs.</li>
            <li><strong>Semantic Matching:</strong> AI-driven product normalization (e.g., "iPhone 15" vs "iP 15").</li>
            <li><strong>Interactive Tables:</strong> Filterable, sortable, and responsive comparison grids.</li>
            <li><strong>Price History API:</strong> Tracks price fluctuations for historical value analysis.</li>
            <li><strong>AI Insights Panel:</strong> Automated Pros/Cons and value scores for each product.</li>
            <li><strong>Setup Builder:</strong> User-input tool to generate hardware recommendations.</li>
          </ul>
        </>
      );
    } else if (view === 'privacy') {
      title = 'Privacy Policy';
      content = (
        <>
          <h3>1. Information We Collect</h3>
          <ul>
            <li><strong>Google Authentication Data:</strong> When you sign in via Google, we collect your name and email address to manage your user profile.</li>
            <li><strong>Usage Data:</strong> We collect information on how you interact with our platform to personalize your experience.</li>
          </ul>
          <h3>2. How We Use Your Information</h3>
          <ul>
            <li>To maintain and operate our platform.</li>
            <li>To provide personalized features such as price alerts, watchlists, and setup configurations.</li>
          </ul>
          <h3>3. Affiliate Disclosure</h3>
          <p>stacknodes.net participates in various affiliate programs. We may earn a commission if you click on a link and make a purchase.</p>
          <h3>4. Security</h3>
          <p>Your data is securely managed through Supabase and Google Authentication. We do not store your passwords on our servers.</p>
        </>
      );
    }

    return (
      <motion.div 
        className={styles.docsModal}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.2 }}
      >
        <div className={styles.docsHeader}>
          <button className={styles.backBtn} onClick={() => setView('signUp')}>
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h2 className={styles.docsTitle}>{title}</h2>
        </div>
        <div className={styles.docsBody}>
          {content}
        </div>
      </motion.div>
    );
  };

  return (
    <div className={styles.overlay}>
      <motion.div 
        className={styles.modal}
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.3, type: "spring", bounce: 0.25 }}
      >
        <button className={styles.closeOverlay} onClick={onCancel} aria-label="Close">
          <span className="material-symbols-outlined">close</span>
        </button>

        <div className={styles.bgElements}>
          <div className={styles.blob1}></div>
          <div className={styles.blob2}></div>
        </div>

        <AnimatePresence mode="wait">
          {view === 'signIn' && (
            <motion.div 
              key="signIn"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              <div className={styles.header}>
                <div className={styles.brand}>
                  <div className={styles.brandIcon}>P</div>
                  <span className={styles.brandText}>stacknodes</span>
                </div>
                <h1 className={styles.title}>Welcome back</h1>
                <p className={styles.subtitle}>Enter your credentials to access your dashboard.</p>
              </div>
              <div className={styles.content}>
                {renderGoogleButton('Continue with Google')}
                
                <p className={styles.toggleText}>
                  Don't have an account yet? 
                  <button className={styles.toggleLink} onClick={() => setView('signUp')}>
                    Create an account
                  </button>
                </p>
              </div>
              {renderTrustIndicators()}
            </motion.div>
          )}

          {view === 'signUp' && (
            <motion.div 
              key="signUp"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <div className={styles.header}>
                <h1 className={styles.title}>Create Account</h1>
                <p className={styles.subtitle}>Join our tech community today and start building.</p>
              </div>
              
              <div className={styles.content}>
                <div className={styles.termsWrapper}>
                  <input 
                    type="checkbox" 
                    id="terms" 
                    className={styles.checkbox}
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                  />
                  <label htmlFor="terms" className={styles.termsText}>
                    I agree to the <button className={styles.toggleLink} onClick={(e) => { e.preventDefault(); setView('disclosure'); }}>Disclosure</button>, 
                    <button className={styles.toggleLink} onClick={(e) => { e.preventDefault(); setView('features'); }}>Features</button>, 
                    and <button className={styles.toggleLink} onClick={(e) => { e.preventDefault(); setView('privacy'); }}>Privacy Policy</button>
                  </label>
                </div>

                {renderGoogleButton('Continue with Google')}
                
                <p className={styles.toggleText}>
                  Already have an account? 
                  <button className={styles.toggleLink} onClick={() => setView('signIn')}>
                    Sign In
                  </button>
                </p>
              </div>
              <div style={{ height: '4px', width: '100%', backgroundColor: 'var(--border, #e2e8f0)', marginTop: '1rem' }}>
                <div style={{ height: '100%', backgroundColor: 'var(--primary, #136dec)', width: '25%' }}></div>
              </div>
            </motion.div>
          )}

          {(view === 'disclosure' || view === 'features' || view === 'privacy') && renderDocsContent()}
        </AnimatePresence>

      </motion.div>
    </div>
  );
}
