'use client';

import { useState } from 'react';
import { isAddress } from 'viem';
import { useManualAddress } from '../../providers/Web3Provider';
import { SearchIcon } from '../icons';
import styles from './AddressInput.module.css';

export default function AddressInput() {
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');
  const { manualAddress, setManualAddress } = useManualAddress();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const trimmed = inputValue.trim();
    
    if (!trimmed) {
      setError('');
      setManualAddress(null);
      return;
    }
    
    if (!isAddress(trimmed)) {
      setError('Invalid Ethereum address');
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
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.inputWrapper}>
          <SearchIcon size={20} className={styles.searchIcon} />
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter wallet address (0x...)"
            className={styles.input}
            spellCheck={false}
            autoComplete="off"
          />
          {(inputValue || manualAddress) && (
            <button 
              type="button" 
              onClick={handleClear}
              className={styles.clearButton}
            >
              Clear
            </button>
          )}
        </div>
        <button type="submit" className={styles.submitButton}>
          Analyze
        </button>
      </form>
      
      {error && (
        <p className={styles.error}>{error}</p>
      )}
      
      {manualAddress && !error && (
        <p className={styles.success}>
          Viewing positions for {manualAddress.slice(0, 10)}...{manualAddress.slice(-8)}
        </p>
      )}
    </div>
  );
}
