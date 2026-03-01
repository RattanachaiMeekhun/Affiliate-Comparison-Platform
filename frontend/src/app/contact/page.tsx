import { Metadata } from 'next';
import { MailOutlined } from '@ant-design/icons';

export const metadata: Metadata = {
  title: 'Contact Us - PixelStack',
  description: 'Get in touch with the PixelStack team.',
};

export default function ContactPage() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px', textAlign: 'center' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '20px' }}>Contact Us</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '40px', fontSize: '1.1rem' }}>
        We are here to help. If you have any questions, feedback, or business inquiries, feel free to reach out to us.
      </p>

      <div style={{ padding: '40px', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border)', display: 'inline-block' }}>
        <MailOutlined style={{ fontSize: '3rem', color: 'var(--primary)', marginBottom: '20px' }} />
        <h2 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>Email Support</h2>
        <p style={{ marginBottom: '20px' }}>
          Drop us a message and we will get back to you as soon as possible.
        </p>
        <a 
          href="mailto:support@pixelstack.io" 
          style={{ 
            display: 'inline-block', 
            padding: '12px 24px', 
            background: 'var(--primary)', 
            color: 'white', 
            textDecoration: 'none', 
            borderRadius: '6px', 
            fontWeight: 600,
            fontSize: '1.1rem'
          }}
        >
          support@pixelstack.io
        </a>
      </div>
    </div>
  );
}
