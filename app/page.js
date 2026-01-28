'use client';

import Header from './components/Header';
import PositionList from './components/PositionList';
import styles from './page.module.css';

export default function Home() {
  return (
    <div className={styles.page}>
      <Header />
      
      <main className={styles.main}>
        <PositionList />
      </main>
    </div>
  );
}
