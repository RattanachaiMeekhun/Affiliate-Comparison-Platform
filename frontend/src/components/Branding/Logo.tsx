import Link from 'next/link'
import React from 'react'
import styles from '@/components/Header/Header.module.css'


type Props = {}

const Logo = (props: Props) => {
  return (
    <Link href="/" className={styles.logo}>
        <img src="/logo.png" alt="Logo" style={{ width: 80, height: 80  }} />
        stacknodes
    </Link>
  )
}

export default Logo