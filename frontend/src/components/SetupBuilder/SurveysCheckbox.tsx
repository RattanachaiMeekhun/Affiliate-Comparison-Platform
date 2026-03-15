import { CheckCircleFilled } from '@ant-design/icons';
import { motion } from 'framer-motion';

type Props = {
  opt: any;
  handleSelect: (sectionId: string, optionId: string) => void;
  isSelected: boolean;
  section: any;
};

const SurveysCheckbox = ({ opt, handleSelect, isSelected, section }: Props) => {
  return (
    <motion.button
      key={opt.id}
      onClick={() => handleSelect(section.id, opt.label)}
      whileHover={{ y: -4, borderColor: 'var(--primary)', boxShadow: 'var(--shadow-lg)' }}
      whileTap={{ scale: 0.98 }}
      style={{
        padding: '24px',
        border: `2px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
        borderRadius: 'var(--radius-lg)',
        background: isSelected ? 'rgba(37, 99, 235, 0.04)' : 'white',
        cursor: 'pointer',
        textAlign: 'left',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        transition: 'all 0.4s var(--ease-out)',
        boxShadow: isSelected ? 'var(--shadow-md)' : 'none',
      }}
    >
      <span style={{ fontSize: 32 }}>{opt.icon}</span>
      <div style={{ flexGrow: 1 }}>
        <div
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: isSelected ? 'var(--primary)' : 'var(--text-primary)',
          }}
        >
          {opt.label}
        </div>
      </div>
      {isSelected && <CheckCircleFilled style={{ color: 'var(--primary)', fontSize: 20 }} />}
    </motion.button>
  );
};

export default SurveysCheckbox;
