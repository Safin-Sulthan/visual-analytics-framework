import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import Card from '../components/common/Card';
import Button from '../components/common/Button';

const Settings = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState({ name: user?.name || '', email: user?.email || '' });
  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });
  const [savedProfile, setSavedProfile] = useState(false);
  const [savedPass, setSavedPass] = useState(false);

  const handleProfileSave = (e) => {
    e.preventDefault();
    // TODO: call API to update profile
    setSavedProfile(true);
    setTimeout(() => setSavedProfile(false), 2000);
  };

  const handlePasswordSave = (e) => {
    e.preventDefault();
    // TODO: call API to change password
    setSavedPass(true);
    setTimeout(() => setSavedPass(false), 2000);
  };

  return (
    <div className="space-y-6 fade-in max-w-2xl">
      <h2 className="text-xl font-bold text-gray-900">Settings</h2>

      {/* Profile */}
      <Card title="Profile" subtitle="Update your name and email address">
        <form onSubmit={handleProfileSave} className="space-y-4">
          {[
            { label: 'Full Name', key: 'name', type: 'text' },
            { label: 'Email',     key: 'email', type: 'email' },
          ].map(({ label, key, type }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <input
                type={type}
                value={profile[key]}
                onChange={(e) => setProfile((p) => ({ ...p, [key]: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>
          ))}
          <Button type="submit" size="sm">
            {savedProfile ? '✓ Saved' : 'Save Profile'}
          </Button>
        </form>
      </Card>

      {/* Password */}
      <Card title="Change Password" subtitle="Use a strong, unique password">
        <form onSubmit={handlePasswordSave} className="space-y-4">
          {[
            { label: 'Current Password', key: 'current' },
            { label: 'New Password',     key: 'newPass' },
            { label: 'Confirm Password', key: 'confirm' },
          ].map(({ label, key }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <input
                type="password"
                value={passwords[key]}
                onChange={(e) => setPasswords((p) => ({ ...p, [key]: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                placeholder="••••••••"
              />
            </div>
          ))}
          <Button type="submit" size="sm">
            {savedPass ? '✓ Password Updated' : 'Update Password'}
          </Button>
        </form>
      </Card>

      {/* API Settings */}
      <Card title="API Configuration" subtitle="Configure external service endpoints">
        <div className="space-y-3">
          {[
            { label: 'API URL',         value: process.env.REACT_APP_API_URL || 'http://localhost:5000/api' },
            { label: 'AI Engine URL',   value: process.env.REACT_APP_AI_ENGINE_URL || 'http://localhost:8000' },
          ].map(({ label, value }) => (
            <div key={label}>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{label}</label>
              <input
                type="text"
                defaultValue={value}
                readOnly
                className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-600 cursor-not-allowed"
              />
            </div>
          ))}
          <p className="text-xs text-gray-400">Set these via environment variables (.env file).</p>
        </div>
      </Card>
    </div>
  );
};

export default Settings;
