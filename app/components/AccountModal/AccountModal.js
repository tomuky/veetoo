'use client';

import { useEffect } from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import { formatAddress } from '../../lib/formatting';
import { CopyIcon, ExternalLinkIcon, DisconnectIcon } from '../icons';
import styles from './AccountModal.module.css';

export default function AccountModal({ isOpen, onClose }) {
  const { address } = useAccount();
  const { disconnect } = useDisconnect();

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  const handleCopy = async () => {
    if (address) {
      await navigator.clipboard.writeText(address);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3 className={styles.title}>Account</h3>
          <button className={styles.closeBtn} onClick={onClose}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 1L13 13M1 13L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
        
        <div className={styles.content}>
          <div className={styles.addressSection}>
            <div className={styles.addressLabel}>Connected with MetaMask</div>
            <div className={styles.addressValue}>{formatAddress(address, 8, 6)}</div>
          </div>
          
          <div className={styles.actions}>
            <button className={styles.actionBtn} onClick={handleCopy}>
              <CopyIcon size={16} />
              <span>Copy Address</span>
            </button>
            <a 
              href={`https://basescan.org/address/${address}`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.actionBtn}
            >
              <ExternalLinkIcon size={16} />
              <span>View on Explorer</span>
            </a>
          </div>
        </div>
        
        <div className={styles.footer}>
          <button className={styles.disconnectBtn} onClick={handleDisconnect}>
            <DisconnectIcon size={16} />
            <span>Disconnect</span>
          </button>
        </div>
      </div>
    </div>
  );
}
