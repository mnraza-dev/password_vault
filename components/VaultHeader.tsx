
import React from 'react';

interface VaultHeaderProps {
  error?: string;
}

export default function VaultHeader({ error }: VaultHeaderProps) {
  return (
    <header className="mb-6">
      <h1 className="text-3xl font-bold text-white mb-2">🔐 Password Vault</h1>
      {error && (
        <p className="text-red-500 text-sm font-medium bg-red-900/30 p-2 rounded">
          {error}
        </p>
      )}
    </header>
  );
}
