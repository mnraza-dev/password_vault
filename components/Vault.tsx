import { useState, useEffect } from 'react';
import CryptoJS from 'crypto-js';

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

  // Handle adding a password
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

  // Handle deleting a password
  const deletePassword = (index: number): void => {
    if (confirm('Are you sure you want to delete this password?')) {
      const newPasswords = passwords.filter((_, i) => i !== index);
      setPasswords(newPasswords);
      localStorage.setItem('passwordVault', JSON.stringify(newPasswords));
    }
  };

  // Copy to clipboard
  const copyToClipboard = (text: string): void => {
    navigator.clipboard.writeText(text).then(() => alert('Copied to clipboard!'));
  };

  // Filter passwords by search
  const filteredPasswords = passwords.filter((entry) =>
    entry.service.toLowerCase().includes(search.toLowerCase())
  );

  // Load passwords and verify master password
  const loadPasswords = (): React.ReactNode => {
    return filteredPasswords.map((entry, index) => {
      try {
        const key = deriveKey(masterPassword);
        const decryptedPassword = CryptoJS.AES.decrypt(entry.encryptedPassword, key).toString(CryptoJS.enc.Utf8);
        return (
          <div key={index} className="border p-4 mb-2 rounded-lg bg-gray-800 flex justify-between items-center">
            <div>
              <strong className="text-lg">{entry.service}</strong>
              <p>Username: {entry.username} <button onClick={() => copyToClipboard(entry.username)} className="ml-2 text-blue-400 hover:text-blue-300">Copy</button></p>
              <p>
                Password: <span className="password-text cursor-pointer" onClick={(e) => {
                  const span = e.target as HTMLSpanElement;
                  span.textContent = span.textContent === '••••••••' ? decryptedPassword : '••••••••';
                }}>••••••••</span>
                <button onClick={() => copyToClipboard(decryptedPassword)} className="ml-2 text-blue-400 hover:text-blue-300">Copy</button>
              </p>
            </div>
            <button onClick={() => deletePassword(index)} className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700">Delete</button>
          </div>
        );
      } catch (e) {
        setError('Invalid master password or corrupted data.');
        setIsUnlocked(false);
        return <></>;
      }
    });
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-lg">
      <h1 className="text-3xl font-bold mb-6 text-center">Advanced Password Vault</h1>
      {error && <p className="text-red-400 mb-4">{error}</p>}
      {!isUnlocked ? (
        <div>
          <input
            type="password"
            placeholder="Enter Master Password"
            value={masterPassword}
            onChange={(e) => setMasterPassword(e.target.value)}
            className="w-full p-3 mb-4 bg-gray-700 border border-gray-600 rounded text-white"
          />
          <button onClick={handleLogin} className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700">
            Unlock Vault
          </button>
        </div>
      ) : (
        <div>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search by service..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full p-3 mb-4 bg-gray-700 border border-gray-600 rounded text-white"
            />
          </div>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Service (e.g., Gmail)"
              value={service}
              onChange={(e) => setService(e.target.value)}
              className="w-full p-3 mb-2 bg-gray-700 border border-gray-600 rounded text-white"
            />
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 mb-2 bg-gray-700 border border-gray-600 rounded text-white"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 mb-2 bg-gray-700 border border-gray-600 rounded text-white"
            />
            <button onClick={() => setShowGenerator(!showGenerator)} className="w-full bg-purple-600 text-white p-3 rounded hover:bg-purple-700 mb-2">
              {showGenerator ? 'Hide Generator' : 'Generate Password'}
            </button>
            {showGenerator && (
              <div className="mb-4 p-4 bg-gray-700 rounded">
                <p>Generated Password: {generatedPassword || 'Click to generate'}</p>
                <button onClick={() => generatePassword(12)} className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 mt-2">
                  Generate
                </button>
                {generatedPassword && (
                  <button onClick={() => copyToClipboard(generatedPassword)} className="ml-2 bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">
                    Copy
                  </button>
                )}
              </div>
            )}
            <button onClick={addPassword} className="w-full bg-green-600 text-white p-3 rounded hover:bg-green-700">
              Add Password
            </button>
          </div>
          <div>{loadPasswords()}</div>
          <button onClick={() => { setIsUnlocked(false); setMasterPassword(''); }} className="w-full bg-red-600 text-white p-3 rounded hover:bg-red-700 mt-4">
            Lock Vault
          </button>
        </div>
      )}
    </div>
  );
}