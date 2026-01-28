'use client';

import { useState } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { isAddress } from 'viem';
import { useManualAddress } from '../../providers/Web3Provider';
import { formatAddress } from '../../lib/formatting';
import { SearchIcon, ExpandIcon, LogoIcon } from '../icons';
import AccountModal from '../AccountModal';
import styles from './Header.module.css';

export default function Header() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { manualAddress, setManualAddress } = useManualAddress();
  
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);

  const handleConnect = () => {
    const injected = connectors.find(c => c.id === 'injected');
    if (injected) {
      connect({ connector: injected });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = inputValue.trim();
    
    if (!trimmed) {
      setError('');
      setManualAddress(null);
      return;
    }
    
    if (!isAddress(trimmed)) {
      setError('Invalid address');
      return;
    }
    
    setError('');
    setManualAddress(trimmed);
  };

  const handleClear = () => {
    setInputValue('');
    setError('');
    setManualAddress(null);
  };

  return (
    <>
      <header className={styles.header}>
        <div className={styles.container}>
          <div className={styles.logo}>
            <LogoIcon size={28} />
            <span className={styles.logoText}>veetoo</span>
          </div>
          
          <form onSubmit={handleSubmit} className={styles.searchForm}>
            <div className={styles.searchWrapper}>
              <SearchIcon size={16} className={styles.searchIcon} />
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Enter wallet address (0x...)"
                className={styles.searchInput}
                spellCheck={false}
              />
              {(inputValue || manualAddress) && (
                <button type="button" onClick={handleClear} className={styles.clearBtn}>
                  Clear
                </button>
              )}
            </div>
            {error && <span className={styles.error}>{error}</span>}
          </form>
          
          <div className={styles.wallet}>
            {isConnected ? (
              <button className={styles.walletButton} onClick={() => setShowModal(true)}>
                <span className={styles.walletAddress}>{formatAddress(address)}</span>
                <span className={styles.walletBalance}>$0.00</span>
                <ExpandIcon size={14} className={styles.walletChevron} />
              </button>
            ) : (
              <button onClick={handleConnect} disabled={isPending} className={styles.connectBtn}>
                {isPending ? 'Connecting...' : 'Connect Wallet'}
              </button>
            )}
          </div>
        </div>
      </header>
      
      <AccountModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </>
  );
}
