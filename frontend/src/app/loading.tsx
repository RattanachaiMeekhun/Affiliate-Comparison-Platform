'use client';

import React from 'react';
import { Skeleton, Card, Row, Col } from 'antd';

export default function RootLoading() {
  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 40, minHeight: '80vh' }}>
      {/* Hero / Header Skeleton */}
      <div style={{ marginBottom: 48 }}>
        <Skeleton active title={{ width: '40%' }} paragraph={{ rows: 2, width: ['90%', '70%'] }} />
      </div>

      {/* Category Tabs Skeleton */}
      <div style={{ marginBottom: 32 }}>
        <Row gutter={[16, 16]}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Col key={i} xs={12} sm={8} md={4}>
              <Skeleton.Button active block shape="round" style={{ height: 40 }} />
            </Col>
          ))}
        </Row>
      </div>

      {/* Product Grid Skeleton */}
      <Row gutter={[24, 24]}>
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <Col key={i} xs={24} sm={12} md={8} lg={6}>
            <Card
              cover={<Skeleton.Image active style={{ width: '100%', height: 200 }} />}
              style={{ borderRadius: 12, overflow: 'hidden' }}
            >
              <Skeleton active paragraph={{ rows: 2 }} />
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}
