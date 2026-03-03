import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy - stacknodes',
  description: 'Privacy Policy and data collection guidelines for stacknodes.',
};

export default function PrivacyPage() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>Privacy Policy for stacknodes.net</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}><strong>Last Updated: March 1, 2026</strong></p>

      <div style={{ lineHeight: '1.8' }}>
        <p style={{ marginBottom: '20px' }}>
          At stacknodes.net, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by stacknodes.net and how we use it.
        </p>

        <h2 style={{ fontSize: '1.5rem', marginTop: '30px', marginBottom: '15px' }}>1. Information We Collect</h2>
        <ul style={{ listStyleType: 'disc', paddingLeft: '20px', marginBottom: '20px' }}>
          <li><strong>Usage Data:</strong> We collect information on how you interact with our platform, such as product categories viewed, and comparison history, to personalize your experience.</li>
        </ul>

        <h2 style={{ fontSize: '1.5rem', marginTop: '30px', marginBottom: '15px' }}>2. How We Use Your Information</h2>
        <ul style={{ listStyleType: 'disc', paddingLeft: '20px', marginBottom: '20px' }}>
          <li>To maintain and operate our platform.</li>
          <li>To provide personalized features such as setup configurations.</li>
          <li>To improve our website through analytics and user behavior insights.</li>
        </ul>

        <h2 style={{ fontSize: '1.5rem', marginTop: '30px', marginBottom: '15px' }}>3. Affiliate Disclosure</h2>
        <p style={{ marginBottom: '20px' }}>
          stacknodes.net participates in various affiliate programs, including Admitad. This means we may earn a commission if you click on a link and make a purchase, at no additional cost to you. We are committed to transparency and provide these links to help you make informed decisions.
        </p>

        <h2 style={{ fontSize: '1.5rem', marginTop: '30px', marginBottom: '15px' }}>4. Security</h2>
        <p style={{ marginBottom: '20px' }}>
          Your data is securely managed. We do not store sensitive information like passwords on our servers.
        </p>

        <h2 style={{ fontSize: '1.5rem', marginTop: '30px', marginBottom: '15px' }}>5. Your Rights</h2>
        <p style={{ marginBottom: '20px' }}>
          You have the right to request access to your data or ask us to delete your information at any time.
        </p>

        <hr style={{ margin: '40px 0', borderTop: '1px solid var(--border)' }} />
        <p style={{ fontStyle: 'italic', color: 'var(--text-secondary)' }}>
          For questions regarding this policy, please contact us at support@stacknodes.net.
        </p>
      </div>
    </div>
  );
}
