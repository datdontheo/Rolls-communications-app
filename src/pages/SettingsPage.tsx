import { useState } from 'react';
import { Save, Upload } from 'lucide-react';
import Layout from '../components/Layout';
import { useDataStore } from '../stores/dataStore';
import { useAuthStore } from '../stores/authStore';
import { useToast } from '../components/Toast';

export default function SettingsPage() {
  const { settings, updateSettings } = useDataStore();
  const { changePassword } = useAuthStore();
  const toast = useToast();

  const [tab, setTab] = useState<'company' | 'preferences' | 'security'>('company');
  const [companyData, setCompanyData] = useState(settings);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSaveCompany = () => {
    updateSettings(companyData);
    toast.success('Company settings saved');
  };

  const handleChangePassword = () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error('Fill all fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (changePassword(oldPassword, newPassword)) {
      toast.success('Password changed');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      toast.error('Old password is incorrect');
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setCompanyData({ ...companyData, logo: event.target?.result as string });
    };
    reader.readAsDataURL(file);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold font-display text-[color:var(--color-text-primary)]">Settings</h2>

        <div className="flex gap-2 border-b border-[color:var(--color-border)]">
          {['company', 'preferences', 'security'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t as any)}
              className={`px-4 py-3 font-medium capitalize border-b-2 transition-all ${
                tab === t ? 'border-[color:var(--color-primary)] text-[color:var(--color-primary)]' : 'border-transparent text-[color:var(--color-text-secondary)]'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === 'company' && (
          <div className="card space-y-6">
            <div>
              <h3 className="text-lg font-bold font-display mb-4">Company Profile</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Company Logo</label>
                  <div className="flex items-center gap-4">
                    {companyData.logo && (
                      <img src={companyData.logo} alt="Logo" className="w-24 h-24 object-contain rounded-lg border border-[color:var(--color-border)]" />
                    )}
                    <label className="flex items-center gap-2 btn-secondary cursor-pointer">
                      <Upload size={18} />
                      Upload Logo
                      <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Company Name</label>
                    <input
                      type="text"
                      value={companyData.companyName}
                      onChange={(e) => setCompanyData({ ...companyData, companyName: e.target.value })}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Website</label>
                    <input
                      type="text"
                      value={companyData.website}
                      onChange={(e) => setCompanyData({ ...companyData, website: e.target.value })}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">P.O. Box</label>
                    <input
                      type="text"
                      value={companyData.poBox}
                      onChange={(e) => setCompanyData({ ...companyData, poBox: e.target.value })}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Address</label>
                    <input
                      type="text"
                      value={companyData.address}
                      onChange={(e) => setCompanyData({ ...companyData, address: e.target.value })}
                      className="input-field"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Phone Numbers</label>
                  <div className="space-y-2">
                    {companyData.phone.map((phone, idx) => (
                      <input
                        key={idx}
                        type="text"
                        value={phone}
                        onChange={(e) => {
                          const newPhones = [...companyData.phone];
                          newPhones[idx] = e.target.value;
                          setCompanyData({ ...companyData, phone: newPhones });
                        }}
                        className="input-field"
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Emails</label>
                  <div className="space-y-2">
                    {companyData.emails.map((email, idx) => (
                      <input
                        key={idx}
                        type="email"
                        value={email}
                        onChange={(e) => {
                          const newEmails = [...companyData.emails];
                          newEmails[idx] = e.target.value;
                          setCompanyData({ ...companyData, emails: newEmails });
                        }}
                        className="input-field"
                      />
                    ))}
                  </div>
                </div>

                <button onClick={handleSaveCompany} className="btn-primary flex items-center gap-2 w-full justify-center">
                  <Save size={20} />
                  Save Company Settings
                </button>
              </div>
            </div>
          </div>
        )}

        {tab === 'preferences' && (
          <div className="card space-y-6">
            <div>
              <h3 className="text-lg font-bold font-display mb-4">Business Preferences</h3>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">VAT Rate (%)</label>
                    <input
                      type="number"
                      value={companyData.vatRate}
                      onChange={(e) => setCompanyData({ ...companyData, vatRate: parseFloat(e.target.value) })}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Invoice Prefix</label>
                    <input
                      type="text"
                      value={companyData.invoicePrefix}
                      onChange={(e) => setCompanyData({ ...companyData, invoicePrefix: e.target.value })}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Currency</label>
                    <select
                      value={companyData.currency}
                      onChange={(e) => setCompanyData({ ...companyData, currency: e.target.value })}
                      className="input-field"
                    >
                      <option value="GH₵">GH₵ (Ghana Cedis)</option>
                      <option value="$">$ (USD)</option>
                      <option value="€">€ (EUR)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Monthly Revenue Target</label>
                    <input
                      type="number"
                      value={companyData.monthlyRevenueTarget}
                      onChange={(e) => setCompanyData({ ...companyData, monthlyRevenueTarget: parseFloat(e.target.value) })}
                      className="input-field"
                    />
                  </div>
                </div>

                <button onClick={handleSaveCompany} className="btn-primary flex items-center gap-2 w-full justify-center">
                  <Save size={20} />
                  Save Preferences
                </button>
              </div>
            </div>
          </div>
        )}

        {tab === 'security' && (
          <div className="card space-y-6">
            <div>
              <h3 className="text-lg font-bold font-display mb-4">Security</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Old Password</label>
                  <input
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input-field"
                  />
                </div>

                <button onClick={handleChangePassword} className="btn-primary flex items-center gap-2 w-full justify-center">
                  <Save size={20} />
                  Change Password
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
