import React, { useState, useEffect } from 'react';
import { User, Language, DICTIONARY, Role } from '../types';
import { authService } from '../services/authService';

interface AdminPanelProps {
  user: User;
  lang: Language;
  onClose: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ user, lang, onClose }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [expiry, setExpiry] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    setUsers(authService.getAllUsers());
  }, []);

  const t = DICTIONARY[lang];

  const handleAddUser = () => {
    try {
      authService.addUser(newUsername, newPassword, expiry ? new Date(expiry).toISOString() : undefined);
      setUsers(authService.getAllUsers());
      setMsg('User added successfully');
      setNewUsername('');
      setNewPassword('');
    } catch (e: any) {
      setMsg(e.message);
    }
  };

  const handleChangePassword = (username: string) => {
    const newPass = prompt(`Enter new password for ${username}:`);
    if (newPass) {
      authService.updatePassword(username, newPass);
      setMsg(`Password updated for ${username}`);
    }
  };

  const handleToggleStatus = (id: string) => {
    const updated = authService.toggleStatus(id);
    setUsers(updated);
  };

  const handleShare = (u: User) => {
      // Create a dummy shareable link or text
      const shareText = `Professional AI ACCESS\nID: ${u.username}\nValid until: ${u.expiryDate ? new Date(u.expiryDate).toLocaleDateString() : 'Forever'}`;
      navigator.clipboard.writeText(shareText);
      alert("Account details copied to clipboard!");
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-brand-panel w-full max-w-4xl rounded-xl p-6 shadow-2xl border border-gray-700 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl text-brand-blue font-bold">{t.adminPanel}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
        </div>

        {/* Create User */}
        <div className="bg-black/20 p-4 rounded mb-6 border border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-white">{t.addUser}</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input 
              placeholder={t.username}
              value={newUsername}
              onChange={e => setNewUsername(e.target.value)}
              className="p-2 bg-brand-dark border border-gray-600 rounded text-white"
            />
            <input 
              type="password"
              placeholder={t.password}
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className="p-2 bg-brand-dark border border-gray-600 rounded text-white"
            />
            <input 
              type="date"
              placeholder={t.expiry}
              value={expiry}
              onChange={e => setExpiry(e.target.value)}
              className="p-2 bg-brand-dark border border-gray-600 rounded text-white"
            />
            <button onClick={handleAddUser} className="bg-green-600 hover:bg-green-500 text-white rounded font-bold">
              Add
            </button>
          </div>
          {msg && <p className="mt-2 text-brand-blue">{msg}</p>}
        </div>

        {/* List Users */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-gray-400 border-b border-gray-700">
                <th className="p-2">Username</th>
                <th className="p-2">Role</th>
                <th className="p-2">Expiry</th>
                <th className="p-2">Status</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-b border-gray-800 hover:bg-white/5">
                  <td className="p-2 text-white">{u.username}</td>
                  <td className="p-2 text-sm text-gray-300">{u.role}</td>
                  <td className="p-2 text-sm text-gray-300">
                    {u.expiryDate ? new Date(u.expiryDate).toLocaleDateString() : 'Lifetime'}
                  </td>
                  <td className="p-2">
                    <span className={`text-xs px-2 py-1 rounded ${u.isActive ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-2 flex gap-2">
                    {u.role !== Role.ADMIN && (
                      <>
                        <button onClick={() => handleChangePassword(u.username)} className="text-xs bg-blue-900 text-blue-200 px-2 py-1 rounded hover:bg-blue-800">Pass</button>
                        <button onClick={() => handleToggleStatus(u.id)} className="text-xs bg-yellow-900 text-yellow-200 px-2 py-1 rounded hover:bg-yellow-800">Ban</button>
                        <button onClick={() => handleShare(u)} className="text-xs bg-purple-900 text-purple-200 px-2 py-1 rounded hover:bg-purple-800">{t.shareId}</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;