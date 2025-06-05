interface UnlockFormProps {
    masterPassword: string;
    setMasterPassword: (value: string) => void;
    handleLogin: () => void;
  }
  
  export default function UnlockForm({
    masterPassword,
    setMasterPassword,
    handleLogin,
  }: UnlockFormProps) {
    return (
      <div className="space-y-4">
        <h2 className="text-white text-xl font-semibold">Enter Master Password</h2>
        <input
          type="password"
          placeholder="Master Password"
          value={masterPassword}
          onChange={(e) => setMasterPassword(e.target.value)}
          className="w-full p-3 rounded-lg bg-gray-900 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleLogin}
          className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white p-3 rounded-lg hover:from-blue-600 hover:to-indigo-600 transition"
        >
          Unlock Vault
        </button>
      </div>
    );
  }
  