import { useState } from 'react';
import CryptoJS from 'crypto-js';
import { PasswordEntry } from './Vault';
import { LockClosedIcon, TrashIcon } from '@heroicons/react/24/solid';

interface PasswordListProps {
  entries?: PasswordEntry[]; 
  masterPassword: string;
  copyToClipboard: (text: string) => void;
  deletePassword: (index: number) => void;
  setError: (msg: string) => void;
  setIsUnlocked: (flag: boolean) => void;
}

export default function PasswordList({
  entries = [],
  masterPassword,
  copyToClipboard,
  deletePassword,
  setError,
}: PasswordListProps) {
  const [visibleIndex, setVisibleIndex] = useState<number | null>(null);

  const decryptPassword = (encrypted: string): string => {
    try {
      const key = CryptoJS.PBKDF2(masterPassword, 'salt', {
        keySize: 256 / 32,
        iterations: 1000,
      }).toString();
      const decrypted = CryptoJS.AES.decrypt(encrypted, key);
      const result = decrypted.toString(CryptoJS.enc.Utf8);
      if (!result) throw new Error('Empty decryption result');
      return result;
    } catch {
      setError('Failed to decrypt password. Possibly incorrect master password.');
      return '';
    }
  };

  if (!entries.length) {
    return <p className="text-gray-400 text-sm text-center">No saved passwords found.</p>;
  }

  return (
    <div className="flex justify-between gap-2 flex-wrap p-2">
      {entries.map((entry, index) => (
        <div
          key={index}
          className="w-[250px] py-4 px-8 rounded-2xl shadow border border-gray-600"
        >
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <LockClosedIcon className="cursor-pointer text-purple-500 w-4 h-4" />
              <span className="text-white font-semibold">{entry.service}</span>
            </div>
            <button
              onClick={() => deletePassword(index)}
              className="text-red-500 hover:text-red-700 text-sm"
            >
              <TrashIcon className="cursor-pointer w-4 h-4" />
            </button>
          </div>
          <p className="text-gray-400 text-sm">Username: {entry.username}</p>
          <div className="mt-2 flex items-center gap-2">
            {visibleIndex === index ? (
              <span className="text-green-400 font-mono">
                {decryptPassword(entry.encryptedPassword)}
              </span>
            ) : (
              <span className="text-gray-600 font-mono">••••••••</span>
            )}
            <button
              onClick={() =>
                visibleIndex === index
                  ? setVisibleIndex(null)
                  : setVisibleIndex(index)
              }
              className="text-blue-400 hover:underline text-xs"
            >
              {visibleIndex === index ? 'Hide' : 'Show'}
            </button>
            <button
              onClick={() =>
                copyToClipboard(decryptPassword(entry.encryptedPassword))
              }
              className="text-yellow-400 hover:underline text-xs"
            >
              Copy
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
