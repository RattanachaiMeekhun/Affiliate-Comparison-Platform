'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchUserBuilds, deleteBuild, SavedBuild } from '@/services/api';
import { useCurrency } from '@/context/CurrencyContext';
import { formatPrice } from '@/services/formatters';
import { Button, List, Card, Spin, Typography, Popconfirm, message } from 'antd';
import { DeleteOutlined, RobotOutlined, PlusOutlined } from '@ant-design/icons';
import AnimatedPage from '@/components/AnimatedLayout/AnimatedLayout';

const { Title, Text } = Typography;

export default function MyBuildsPage() {
  const [builds, setBuilds] = useState<SavedBuild[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { selectedCurrency, rates } = useCurrency();

  const loadBuilds = async () => {
    setIsLoading(true);
    try {
      const userId = localStorage.getItem('guest_user_id');
      if (userId) {
        const data = await fetchUserBuilds(userId);
        setBuilds(data);
      }
    } catch (err) {
      console.error('Failed to load builds', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBuilds();
  }, []);

  const handleDelete = async (id: string) => {
    try {
       const success = await deleteBuild(id);
       if (success) {
         message.success('Build deleted successfully');
         setBuilds((prev) => prev.filter(b => b.id !== id));
       }
    } catch {
       message.error('Failed to delete build');
    }
  };

  return (
    <AnimatedPage>
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
            <Title level={2} style={{ margin: 0 }}>My PC Builds</Title>
            <Button type="primary" size="large" icon={<PlusOutlined />} onClick={() => router.push('/build')}>
                Create New Build
            </Button>
        </div>

        {isLoading ? (
            <div style={{ textAlign: 'center', padding: '100px 0' }}>
                <Spin size="large" />
                <div style={{ marginTop: 16, color: 'var(--text-secondary)' }}>Loading your saved builds...</div>
            </div>
        ) : builds.length === 0 ? (
           <Card style={{ textAlign: 'center', padding: '60px 20px', borderRadius: 16 }}>
               <RobotOutlined style={{ fontSize: 48, color: 'var(--border)', marginBottom: 20 }} />
               <Title level={4}>No Saved Builds Yet</Title>
               <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
                   Start configuring your dream PC setup and save it here to track prices.
               </Text>
               <Button type="primary" size="large" onClick={() => router.push('/build')}>
                   Start Building Now
               </Button>
           </Card>
        ) : (
           <List
             grid={{ gutter: 24, column: 1 }}
             dataSource={builds}
             renderItem={(build) => (
                 <List.Item>
                    <Card
                      hoverable
                      style={{ borderRadius: 16, border: '1px solid var(--border)' }}
                      actions={[
                          <Button key="edit" type="link" onClick={() => router.push(`/build`)}>Edit Build</Button>,
                          <Popconfirm
                             key="delete"
                             title="Delete this build?"
                             description="Are you sure you want to delete this saved build?"
                             onConfirm={() => handleDelete(build.id)}
                             okText="Yes"
                             cancelText="No"
                          >
                             <Button type="text" danger icon={<DeleteOutlined />}>Delete</Button>
                          </Popconfirm>
                      ]}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <div>
                                <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>{build.name}</h3>
                                <Text type="secondary">
                                   Saved on {new Date(build.created_at).toLocaleDateString()}
                                </Text>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Total Price</div>
                                <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)' }}>
                                    {formatPrice(build.total_price, build.currency, selectedCurrency, rates)}
                                </div>
                            </div>
                        </div>

                        <div style={{ marginTop: 24 }}>
                           <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: 'var(--text-secondary)' }}>Components:</h4>
                           <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                               {build.items.map((item, idx) => (
                                   <div key={idx} style={{ 
                                       background: 'var(--bg-secondary)', 
                                       padding: '6px 12px', 
                                       borderRadius: 8,
                                       fontSize: 13,
                                       fontWeight: 500,
                                       border: '1px solid var(--border)'
                                    }}>
                                       {item.label}: <span style={{ color: 'var(--text-primary)' }}>{item.name}</span>
                                   </div>
                               ))}
                           </div>
                        </div>
                    </Card>
                 </List.Item>
             )}
           />
        )}
      </div>
    </AnimatedPage>
  );
}
