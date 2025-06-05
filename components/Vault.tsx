'use client'
import { useState } from 'react';
import CryptoJS from 'crypto-js';
import { motion, AnimatePresence } from 'framer-motion';

interface PasswordEntry {
  service: string;
  username: string;
  encryptedPassword: string;
}

export default function Vault() {
  const [masterPassword, setMasterPassword] = useState<string>('');
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [passwords, setPasswords] = useState<PasswordEntry[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('passwordVault');
      return stored ? JSON.parse(stored) : [];
    }
    return [];
  });
  const [service, setService] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [search, setSearch] = useState<string>('');
  const [showGenerator, setShowGenerator] = useState<boolean>(false);
  const [generatedPassword, setGeneratedPassword] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Derive encryption key using PBKDF2
  const deriveKey = (password: string): string => {
    return CryptoJS.PBKDF2(password, 'salt', { keySize: 256 / 32, iterations: 1000 }).toString();
  };

  // Generate a random password
  const generatePassword = (length: number = 12): void => {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setGeneratedPassword(result);
    setPassword(result);
  };

  // Handle login
  const handleLogin = (): void => {
    if (!masterPassword) {
      setError('Please enter a master password.');
      return;
    }
    setIsUnlocked(true);
    setError('');
  };
  const addPassword = (): void => {
    if (!service || !username || !password) {
      setError('Please fill in all fields.');
      return;
    }
    const key = deriveKey(masterPassword);
    const encryptedPassword = CryptoJS.AES.encrypt(password, key).toString();
    const newPasswords: PasswordEntry[] = [...passwords, { service, username, encryptedPassword }];
    setPasswords(newPasswords);
    localStorage.setItem('passwordVault', JSON.stringify(newPasswords));
    setService('');
    setUsername('');
    setPassword('');
    setError('');
  };


  const deletePassword = (index: number): void => {
    if (confirm('Are you sure you want to delete this password?')) {
      const newPasswords = passwords.filter((_, i) => i !== index);
      setPasswords(newPasswords);
      localStorage.setItem('passwordVault', JSON.stringify(newPasswords));
    }
  };

  const copyToClipboard = (text: string): void => {
    navigator.clipboard.writeText(text).then(() => alert('Copied to clipboard!'));
  };

  const filteredPasswords = passwords.filter((entry) =>
    entry.service.toLowerCase().includes(search.toLowerCase())
  );
  const loadPasswords = (): JSX.Element[] => {
    return filteredPasswords.map((entry, index) => {
      try {
        const key = deriveKey(masterPassword);
        const decryptedPassword = CryptoJS.AES.decrypt(entry.encryptedPassword, key).toString(CryptoJS.enc.Utf8);
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="border border-gray-700 p-4 mb-4 rounded-lg bg-gray-800/50 backdrop-blur-md flex justify-between items-center"
          >
            <div>
              <strong className="text-xl font-semibold text-white">{entry.service}</strong>
              <p className="text-gray-300">
                Username: {entry.username}{' '}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => copyToClipboard(entry.username)}
                  className="ml-2 text-blue-400 hover:text-blue-300"
                >
                  Copy
                </motion.button>
              </p>
              <p className="text-gray-300">
                Password:{' '}
                <span
                  className="password-text cursor-pointer"
                  onClick={(e) => {
                    const span = e.target as HTMLSpanElement;
                    span.textContent = span.textContent === '••••••••' ? decryptedPassword : '••••••••';
                  }}
                >
                  ••••••••
                </span>{' '}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => copyToClipboard(decryptedPassword)}
                  className="ml-2 text-blue-400 hover:text-blue-300"
                >
                  Copy
                </motion.button>
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => deletePassword(index)}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              Delete
            </motion.button>
          </motion.div>
        );
      } catch (e) {
        setError('Invalid master password or corrupted data.');
        setIsUnlocked(false);
        return <></>;
      }
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-800/30 backdrop-blur-lg p-8 rounded-xl shadow-2xl w-full max-w-md border border-gray-700/50"
    >
      <h1 className="text-4xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
        Password Vault
      </h1>
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-red-400 mb-4 text-center"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
      {!isUnlocked ? (
        <div>
          <motion.input
            type="password"
            placeholder="Enter Master Password"
            value={masterPassword}
            onChange={(e) => setMasterPassword(e.target.value)}
            className="w-full p-3 mb-4 bg-gray-900/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            whileFocus={{ scale: 1.02 }}
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogin}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white p-3 rounded-lg hover:from-blue-600 hover:to-purple-600 transition"
          >
            Unlock Vault
          </motion.button>
        </div>
      ) : (
        <div>
          <motion.input
            type="text"
            placeholder="Search by service..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full p-3 mb-4 bg-gray-900/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            whileFocus={{ scale: 1.02 }}
          />
          <div className="mb-6">
            <motion.input
              type="text"
              placeholder="Service (e.g., Gmail)"
              value={service}
              onChange={(e) => setService(e.target.value)}
              className="w-full p-3 mb-2 bg-gray-900/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              whileFocus={{ scale: 1.02 }}
            />
            <motion.input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 mb-2 bg-gray-900/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              whileFocus={{ scale: 1.02 }}
            />
            <motion.input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 mb-2 bg-gray-900/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              whileFocus={{ scale: 1.02 }}
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowGenerator(!showGenerator)}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white p-3 rounded-lg hover:from-purple-600 hover:to-pink-600 transition mb-2"
            >
              {showGenerator ? 'Hide Generator' : 'Generate Password'}
            </motion.button>
            <AnimatePresence>
              {showGenerator && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 p-4 bg-gray-900/50 rounded-lg border border-gray-700"
                >
                  <p className="text-gray-300">Generated Password: {generatedPassword || 'Click to generate'}</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => generatePassword(12)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 mt-2"
                  >
                    Generate
                  </motion.button>
                  {generatedPassword && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => copyToClipboard(generatedPassword)}
                      className="ml-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                      Copy
                    </motion.button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={addPassword}
              className="w-full bg-gradient-to-r from-green-500 to-teal-500 text-white p-3 rounded-lg hover:from-green-600 hover:to-teal-600 transition"
            >
              Add Password
            </motion.button>
          </div>
          <div className="max-h-96 overflow-y-auto">{loadPasswords()}</div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setIsUnlocked(false);
              setMasterPassword('');
            }}
            className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white p-3 rounded-lg hover:from-red-600 hover:to-pink-600 transition mt-4"
          >
            Lock Vault
          </motion.button>
        </div>
      )}
    </motion.div>
  );
}