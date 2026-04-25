import Link from 'next/link';
import Image from 'next/image';
import React from 'react';
import styles from '@/components/Header/Header.module.css';

type Props = {
  className?: string;
};

const Logo = (props: Props) => {
  const { className } = props;
  return (
    <Link href="/" className={`${styles.logo} !${className}`} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <Image src="/logo.png" alt="stacknodes logo" width={40} height={40} priority />
      stacknodes
    </Link>
  );
};

export default Logo;
