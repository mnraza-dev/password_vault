"use client";

import { useState } from 'react';
import { LockClosedIcon, PlusIcon } from '@heroicons/react/24/solid';

import PasswordList from './PasswordList';
import PasswordModal from './PasswordModal';
import UnlockForm from './UnlockForm';
import ErrorMessage from './ErrorMessage';
import CryptoJS from 'crypto-js';
import VaultHeader from './VaultHeader';

export interface PasswordEntry {
  service: string;
  username: string;
  encryptedPassword: string;
}

export default function Vault() {
  const [masterPassword, setMasterPassword] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [passwords, setPasswords] = useState<PasswordEntry[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('passwordVault');
      return stored ? JSON.parse(stored) : [];
    }
    return [];
  });
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const deriveKey = (password: string): string => {
    return CryptoJS.PBKDF2(password, 'salt', {
      keySize: 256 / 32,
      iterations: 1000
    }).toString();
  };

  const handleLogin = () => {
    if (!masterPassword) {
      setError('Please enter a master password.');
      return;
    }
    setIsUnlocked(true);
    setError('');
  };

  const addPassword = (service: string, username: string, password: string) => {
    if (!service || !username || !password) {
      setError('Please fill in all fields.');
      return;
    }
    const key = deriveKey(masterPassword);
    const encryptedPassword = CryptoJS.AES.encrypt(password, key).toString();
    const newPasswords: PasswordEntry[] = [...passwords, { service, username, encryptedPassword }];
    setPasswords(newPasswords);
    localStorage.setItem('passwordVault', JSON.stringify(newPasswords));
    setError('');
    setIsModalOpen(false);
  };

  const deletePassword = (index: number) => {
    if (confirm('Are you sure you want to delete this password?')) {
      const newPasswords = passwords.filter((_, i) => i !== index);
      setPasswords(newPasswords);
      localStorage.setItem('passwordVault', JSON.stringify(newPasswords));
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => alert('Copied to clipboard!'));
  };

  const filteredPasswords = passwords.filter((entry) =>
    entry.service.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8">
      <VaultHeader error={error} />
      {!isUnlocked ? (
        <UnlockForm
          masterPassword={masterPassword}
          setMasterPassword={setMasterPassword}
          handleLogin={handleLogin}
        />
      ) : (
        <>
          <input
            type="text"
            placeholder="Search by service..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full p-3 mb-4 bg-gray-900/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
          <button
            onClick={() => setIsModalOpen(true)}
            className="absolute bottom-8 right-8 bg-gradient-to-r from-green-500 to-teal-500 text-white p-4 rounded-full shadow-lg hover:from-green-600 hover:to-teal-600 transition"
          >
            <PlusIcon className="w-6 h-6" />
          </button>
          <div className="max-h-80 overflow-y-auto">
            <PasswordList
              entries={filteredPasswords}
              masterPassword={masterPassword}
              copyToClipboard={copyToClipboard}
              deletePassword={deletePassword}
              setError={setError}
              setIsUnlocked={setIsUnlocked}
            />
          </div>
          <button
            onClick={() => {
              setIsUnlocked(false);
              setMasterPassword('');
            }}
            className=" flex gap-2 items-center w-fit bg-gradient-to-r from-purple-900 to-red-700 text-white p-3 rounded-lg hover:from-red-600 hover:to-pink-600 transition mt-4"
          >
            <LockClosedIcon className="cursor-pointer text-white w-4 h-4" />
           <span>
           Lock Vault
           </span>
          </button>
        </>
      )}
      {error && <ErrorMessage message={error} />}
      {isModalOpen && (
        <PasswordModal
          addPassword={addPassword}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}
