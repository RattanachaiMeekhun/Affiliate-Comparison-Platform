import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Affiliate Disclosure - stacknodes',
  description: 'Affiliate Disclosure for stacknodes.net.',
};

export default function DisclosurePage() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '30px' }}>Affiliate Disclosure</h1>

      <div style={{ lineHeight: '1.8' }}>
        <p style={{ marginBottom: '20px', fontSize: '1.1rem' }}>
          Transparency is core to the stacknodes.net experience. We believe in providing data-driven, unbiased insights to help you choose the best tech, games, and services.
        </p>

        <h2 style={{ fontSize: '1.5rem', marginTop: '30px', marginBottom: '15px' }}>How We Make Money</h2>
        <p style={{ marginBottom: '20px' }}>
          stacknodes.net is an affiliate-supported platform. When you click on a product comparison link—such as those pointing to Shopee, Lazada, Admitad, or other marketplaces—and complete a purchase, we may receive a small commission from the merchant.
        </p>

        <h2 style={{ fontSize: '1.5rem', marginTop: '30px', marginBottom: '15px' }}>Our Promise to You</h2>
        <ul style={{ listStyleType: 'disc', paddingLeft: '20px', marginBottom: '30px' }}>
          <li style={{ marginBottom: '10px' }}><strong>Objectivity:</strong> Our AI-driven comparison engine prioritizes value and specifications, not commission rates.</li>
          <li style={{ marginBottom: '10px' }}><strong>Transparency:</strong> We clearly identify affiliate links and provide accurate pricing and specification data wherever possible.</li>
          <li style={{ marginBottom: '10px' }}><strong>Independence:</strong> Our recommendations are based on our proprietary matching engine, which aims to find the best match for your needs based on the latest market data.</li>
        </ul>

        <div style={{ padding: '20px', background: 'var(--bg-secondary)', borderRadius: '8px', borderLeft: '4px solid var(--primary)' }}>
          <p style={{ fontStyle: 'italic', margin: 0 }}>
            Thank you for supporting stacknodes.net, which allows us to continue building and refining the tools that help you shop smarter.
          </p>
        </div>
      </div>
    </div>
  );
}
