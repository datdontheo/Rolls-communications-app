import { useState } from 'react';
import { Save, Upload, Building2, Sliders, Lock, Check } from 'lucide-react';
import Layout from '../components/Layout';
import { useDataStore } from '../stores/dataStore';
import { useAuthStore } from '../stores/authStore';
import { useToast } from '../components/Toast';

export default function SettingsPage() {
  const { settings, updateSettings } = useDataStore();
  const { changePassword } = useAuthStore();
  const toast = useToast();
  const [tab, setTab] = useState<'company' | 'preferences' | 'security'>('company');
  const [form, setForm] = useState(settings);
  const [pwForm, setPwForm] = useState({ old: '', new: '', confirm: '' });

  const handleSave = () => { updateSettings(form); toast.success('Settings saved'); };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setForm(f => ({ ...f, logo: ev.target?.result as string }));
    reader.readAsDataURL(file);
  };

  const handleChangePassword = () => {
    if (!pwForm.old || !pwForm.new || !pwForm.confirm) { toast.error('Fill in all fields'); return; }
    if (pwForm.new !== pwForm.confirm) { toast.error('Passwords do not match'); return; }
    if (pwForm.new.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    if (changePassword(pwForm.old, pwForm.new)) { toast.success('Password changed'); setPwForm({ old: '', new: '', confirm: '' }); }
    else { toast.error('Current password is incorrect'); }
  };

  return (
    <Layout>
      <div style={{ maxWidth: 760 }}>
        <div className="page-header"><h2 className="page-title">Settings</h2></div>

        {/* Tab bar */}
        <div className="tabs">
          {[
            { key: 'company', label: 'Company Profile', icon: Building2 },
            { key: 'preferences', label: 'Preferences', icon: Sliders },
            { key: 'security', label: 'Security', icon: Lock },
          ].map(({ key, label, icon: Icon }) => (
            <button key={key} className={`tab-btn ${tab === key ? 'active' : ''}`} onClick={() => setTab(key as any)}>
              <Icon size={15} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
              {label}
            </button>
          ))}
        </div>

        {tab === 'company' && (
          <div className="card">
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 20 }}>Company Profile</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Logo */}
              <div>
                <label className="form-label" style={{ marginBottom: 10, display: 'block' }}>Company Logo</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{
                    width: 72, height: 72, borderRadius: 14, border: '2px dashed var(--border)',
                    background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0,
                  }}>
                    {form.logo
                      ? <img src={form.logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                      : <Building2 size={28} style={{ color: 'var(--text-muted)' }} />
                    }
                  </div>
                  <label className="btn btn-outline" style={{ cursor: 'pointer' }}>
                    <Upload size={16} /> Upload Logo
                    <input type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: 'none' }} />
                  </label>
                  {form.logo && (
                    <button onClick={() => setForm(f => ({ ...f, logo: '' }))} className="btn btn-ghost btn-sm" style={{ color: '#dc2626' }}>Remove</button>
                  )}
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Company Name</label>
                  <input type="text" className="input-field" value={form.companyName} onChange={e => setForm(f => ({ ...f, companyName: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Website</label>
                  <input type="text" className="input-field" value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">P.O. Box</label>
                  <input type="text" className="input-field" value={form.poBox} onChange={e => setForm(f => ({ ...f, poBox: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Physical Address</label>
                  <input type="text" className="input-field" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Phone Numbers</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {form.phone.map((p, i) => (
                    <input key={i} type="text" className="input-field" value={p}
                      onChange={e => { const arr = [...form.phone]; arr[i] = e.target.value; setForm(f => ({ ...f, phone: arr })); }} />
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Email Addresses</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {form.emails.map((em, i) => (
                    <input key={i} type="email" className="input-field" value={em}
                      onChange={e => { const arr = [...form.emails]; arr[i] = e.target.value; setForm(f => ({ ...f, emails: arr })); }} />
                  ))}
                </div>
              </div>

              <button onClick={handleSave} className="btn btn-primary btn-full">
                <Save size={16} /> Save Company Settings
              </button>
            </div>
          </div>
        )}

        {tab === 'preferences' && (
          <div className="card">
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 20 }}>Business Preferences</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Default VAT Rate (%)</label>
                  <input type="number" className="input-field" value={form.vatRate}
                    onChange={e => setForm(f => ({ ...f, vatRate: parseFloat(e.target.value) || 0 }))} />
                  <p className="form-hint">Applied to all invoices and quotes by default</p>
                </div>
                <div className="form-group">
                  <label className="form-label">Invoice Number Prefix</label>
                  <input type="text" className="input-field" value={form.invoicePrefix}
                    onChange={e => setForm(f => ({ ...f, invoicePrefix: e.target.value }))} />
                  <p className="form-hint">e.g. RC → RC-2025-0001</p>
                </div>
                <div className="form-group">
                  <label className="form-label">Currency Symbol</label>
                  <select className="input-field" value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}>
                    <option value="GH₵">GH₵ — Ghana Cedi</option>
                    <option value="$">$ — US Dollar</option>
                    <option value="€">€ — Euro</option>
                    <option value="£">£ — British Pound</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Monthly Revenue Target ({form.currency})</label>
                  <input type="number" className="input-field" value={form.monthlyRevenueTarget}
                    onChange={e => setForm(f => ({ ...f, monthlyRevenueTarget: parseFloat(e.target.value) || 0 }))} />
                  <p className="form-hint">Used for dashboard progress tracking</p>
                </div>
              </div>
              <button onClick={handleSave} className="btn btn-primary btn-full">
                <Save size={16} /> Save Preferences
              </button>
            </div>
          </div>
        )}

        {tab === 'security' && (
          <div className="card">
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Change Password</h3>
            <p style={{ fontSize: 13.5, color: 'var(--text-muted)', marginBottom: 24 }}>Update your admin login credentials</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 400 }}>
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <input type="password" className="input-field" placeholder="••••••••" value={pwForm.old}
                  onChange={e => setPwForm(f => ({ ...f, old: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input type="password" className="input-field" placeholder="••••••••" value={pwForm.new}
                  onChange={e => setPwForm(f => ({ ...f, new: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input type="password" className="input-field" placeholder="••••••••" value={pwForm.confirm}
                  onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))} />
              </div>
              <button onClick={handleChangePassword} className="btn btn-primary">
                <Check size={16} /> Update Password
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
