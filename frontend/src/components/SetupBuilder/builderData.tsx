import {
  CheckCircleFilled,
  RocketOutlined,
  SettingOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import React from 'react';

export interface Option {
  id: string;
  label: string;
  icon: string;
}

export interface Section {
  id: string;
  label: string;
  options: Option[];
}

export interface Step {
  id: number;
  title: string;
  description: string;
  sections: Section[];
}

export const budgetLabels: Record<string, Record<string, string>> = {
  USD: {
    'budget-1': 'Under $1,000',
    'budget-2': '$1,000 - $2,500',
    'budget-3': '$2,500 - $5,000',
    'budget-4': '$5,000+',
  },
  THB: {
    'budget-1': 'Under ฿35,000',
    'budget-2': '฿35,000 - ฿85,000',
    'budget-3': '฿85,000 - ฿175,000',
    'budget-4': '฿175,000+',
  },
  EUR: {
    'budget-1': 'Under €920',
    'budget-2': '€920 - €2,300',
    'budget-3': '€2,300 - €4,600',
    'budget-4': '€4,600+',
  },
};

export const steps: Step[] = [
  {
    id: 1,
    title: 'Usage & Preferences',
    description:
      'Tell us your needs, and our AI will curate the perfect professional workstation for you in real-time.',
    sections: [
      {
        id: 'use-case',
        label: 'Primary Use Case',
        options: [
          { id: 'use-1', label: 'Data Science & ML', icon: '🧪' },
          { id: 'use-2', label: '4K Video Editing', icon: '🎬' },
          { id: 'use-3', label: '3D Rendering', icon: '🎨' },
          { id: 'use-4', label: 'Competitive Gaming', icon: '🎮' },
        ],
      },
      {
        id: 'budget',
        label: 'Budget Range',
        options: [
          { id: 'budget-1', label: 'Under $1,000', icon: '💰' },
          { id: 'budget-2', label: '$1,000 - $2,500', icon: '💵' },
          { id: 'budget-3', label: '$2,500 - $5,000', icon: '💎' },
          { id: 'budget-4', label: '$5,000+', icon: '🏆' },
        ],
      },
      {
        id: 'ecosystem',
        label: 'Ecosystem Preference',
        options: [
          { id: 'eco-1', label: 'Intel + NVIDIA', icon: '🔵' },
          { id: 'eco-2', label: 'AMD + NVIDIA', icon: '🔴' },
          { id: 'eco-3', label: 'Full AMD', icon: '🔥' },
          { id: 'eco-4', label: 'No Preference', icon: '🔄' },
        ],
      },
    ],
  },
];

import { SetBuilderRecommendation } from '@/services/setbuilderApi';

export const getRecommendations = (
  selections: Record<string, string>
): SetBuilderRecommendation => {
  const useCase = selections['use-case'];

  if (useCase === 'use-2') {
    // Video Editing
    return {
      title: 'The Cinema Engine',
      subtitle: 'Optimized for 8K Raw Workflows',
      components: [
        { label: 'Processor', name: 'Intel Core i9-14900K', price: 21500, icon_key: 'processor' },
        { label: 'Graphics Card', name: 'NVIDIA RTX 4080 Super', price: 42900, icon_key: 'gpu' },
        { label: 'Memory', name: '64GB DDR5-6000MHz', price: 7900, icon_key: 'memory' },
        { label: 'Storage', name: '2TB NVMe Gen5 SSD', price: 6500, icon_key: 'storage' },
      ],
      insight:
        'The RTX 4080 Super provides excellent AV1 encoding performance, perfect for your selected workflow. This setup ensures zero dropped frames during real-time playback.',
    };
  }

  // Default recommendation (Data Science/ML or others)
  return {
    title: 'Precision Workstation',
    subtitle: 'Balanced for Performance & Reliability',
    components: [
      { label: 'Processor', name: 'AMD Ryzen 9 7950X', price: 19500, icon_key: 'processor' },
      { label: 'Graphics Card', name: 'NVIDIA RTX 4070 Ti Super', price: 28900, icon_key: 'gpu' },
      { label: 'Memory', name: '32GB DDR5-6000MHz', price: 4500, icon_key: 'memory' },
      { label: 'Storage', name: '1TB NVMe Gen4 SSD', price: 3400, icon_key: 'storage' },
    ],
    insight:
      'This build offers a great balance of multicore performance and graphical efficiency for most professional tasks. It excels in heavy multi-tasking and parallel processing.',
  };
};
