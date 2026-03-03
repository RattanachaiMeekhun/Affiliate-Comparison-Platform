import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service - stacknodes',
  description: 'Terms of Service for using stacknodes.',
};

export default function TermsPage() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>Terms of Service for stacknodes.net</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}><strong>Last Updated: March 1, 2026</strong></p>

      <div style={{ lineHeight: '1.8' }}>
        <p style={{ marginBottom: '20px' }}>
          Welcome to stacknodes.net. By using our website, you agree to comply with and be bound by the following terms of service.
        </p>

        <h2 style={{ fontSize: '1.5rem', marginTop: '30px', marginBottom: '15px' }}>1. Use of Service</h2>
        <p style={{ marginBottom: '20px' }}>
          stacknodes.net provides a platform for comparing technology, gaming, and financial products. You agree to use this platform for personal, non-commercial purposes only.
        </p>

        <h2 style={{ fontSize: '1.5rem', marginTop: '30px', marginBottom: '15px' }}>2. Accuracy of Information</h2>
        <p style={{ marginBottom: '20px' }}>
          While we strive to provide accurate data, prices, specifications, and availability of products are subject to change by third-party merchants. stacknodes.net is not responsible for discrepancies in information provided by our partners.
        </p>

        <h2 style={{ fontSize: '1.5rem', marginTop: '30px', marginBottom: '15px' }}>3. Intellectual Property</h2>
        <p style={{ marginBottom: '20px' }}>
          All content, branding, and proprietary algorithms on stacknodes.net are the property of the site owner unless stated otherwise.
        </p>

        <h2 style={{ fontSize: '1.5rem', marginTop: '30px', marginBottom: '15px' }}>4. Limitation of Liability</h2>
        <p style={{ marginBottom: '20px' }}>
          In no event shall stacknodes.net be liable for any damages arising out of the use or inability to use our services, including purchasing decisions made based on our data.
        </p>

        <h2 style={{ fontSize: '1.5rem', marginTop: '30px', marginBottom: '15px' }}>5. Changes to Terms</h2>
        <p style={{ marginBottom: '20px' }}>
          We reserve the right to update these terms at any time. Continued use of the platform constitutes acceptance of the updated terms.
        </p>
      </div>
    </div>
  );
}
