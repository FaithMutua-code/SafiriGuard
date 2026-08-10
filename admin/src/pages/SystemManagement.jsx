import React, { useState, useEffect, useCallback } from 'react';
import StatusBadge from '../components/StatusBadge';
import api from '../api/client';

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

const ROLE_LABELS = { vehicle_owner: 'Vehicle Owner', sacco_manager: 'SACCO Manager', driver: 'Driver' };
const ROLE_COLORS = { vehicle_owner: 'badge-primary', sacco_manager: 'badge-info', driver: 'badge-warning' };

const SystemManagement = () => {
  const [users, setUsers] = useState([]);
  const [meta, setMeta] = useState({});
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, search: search || undefined, role: roleFilter !== 'all' ? roleFilter : undefined };
      const res = await api.get('/users', { params });
      setUsers(res.data.data || []);
      setMeta(res.data.meta || res.data);
    } catch { setUsers([]); }
    setLoading(false);
  }, [page, search, roleFilter]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(); }, [load]);
  const handleSearch = (e) => { setSearch(e.target.value); setPage(1); };
  const totalPages = meta.last_page || 1;

  const handleToggle = async (user) => {
    setToggling(user.id);
    try {
      const res = await api.patch(`/users/${user.id}/toggle-active`);
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, is_active: res.data.is_active } : u));
    } catch {
      // ignore
    }
    setToggling(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Platform Info */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div className="card">
          <div className="card-header">
            <div className="card-title">🏢 Platform Information</div>
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                { label: 'Platform Name', value: 'SafariGuard' },
                { label: 'Version', value: '2.0.0' },
                { label: 'Backend', value: 'Laravel 12 + Sanctum' },
                { label: 'Database', value: 'SQLite / MySQL' },
                { label: 'Mobile App', value: 'Expo React Native' },
                { label: 'Admin Panel', value: 'React + Vite' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '14px', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '500' }}>{item.label}</span>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text)' }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">🔐 Security & Access</div>
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                { label: 'Authentication', value: 'Laravel Sanctum (Token)' },
                { label: 'Admin Access', value: 'Role-based (admin)' },
                { label: 'Owner Access', value: 'Role-based (vehicle_owner)' },
                { label: 'CORS', value: 'Configured for web + mobile' },
                { label: 'Password Hashing', value: 'Bcrypt' },
                { label: 'OTP Reset', value: 'Enabled' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '14px', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '500' }}>{item.label}</span>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text)' }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="card">
        <div className="card-header" style={{ marginBottom: '16px' }}>
          <div>
            <div className="card-title">👥 User Management</div>
            <div className="card-subtitle">All non-admin users on the platform</div>
          </div>
        </div>

        <div style={{ padding: '0 24px 16px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="search-box" style={{ width: '280px' }}>
            <span className="search-box-icon">🔍</span>
            <input className="search-input" placeholder="Search users…" value={search} onChange={handleSearch} />
          </div>
          <div className="chip-group">
            {[
              { id: 'all', label: 'All' },
              { id: 'vehicle_owner', label: 'Vehicle Owners' },
              { id: 'sacco_manager', label: 'SACCO Managers' },
              { id: 'driver', label: 'Drivers' },
            ].map(f => (
              <button key={f.id} className={`chip${roleFilter === f.id ? ' active' : ''}`} onClick={() => { setRoleFilter(f.id); setPage(1); }}>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="table-wrapper" style={{ borderRadius: '0', border: 'none', borderTop: '1px solid var(--border)', boxShadow: 'none' }}>
          <table className="table">
            <thead>
              <tr>
                <th>User</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '48px' }}>
                  <div className="spinner spinner-dark" style={{ margin: 'auto' }} />
                </td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={6}>
                  <div className="empty-state">
                    <span className="empty-icon">👥</span>
                    <div className="empty-title">No users found</div>
                  </div>
                </td></tr>
              ) : users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '34px', height: '34px', borderRadius: '9px',
                        background: 'var(--primary-soft)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: '700', fontSize: '13px', color: 'var(--primary)', flexShrink: 0,
                      }}>
                        {(u.name || '?')[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="table-cell-bold">{u.name}</div>
                        <div className="table-cell-muted" style={{ fontSize: '12px' }}>{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="table-cell-muted">{u.phone || '—'}</td>
                  <td>
                    <span className={`badge ${ROLE_COLORS[u.role] || 'badge-neutral'}`}>
                      {ROLE_LABELS[u.role] || u.role}
                    </span>
                  </td>
                  <td><StatusBadge status={u.is_active ? 'active' : 'inactive'} /></td>
                  <td className="table-cell-muted">{fmtDate(u.created_at)}</td>
                  <td>
                    <button
                      className={`btn btn-sm ${u.is_active ? 'btn-danger' : 'btn-success'}`}
                      onClick={() => handleToggle(u)}
                      disabled={toggling === u.id}
                    >
                      {toggling === u.id
                        ? <div className="spinner" style={{ width: '12px', height: '12px', borderWidth: '2px' }} />
                        : u.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="pagination">
              <span className="pagination-info">Page {page} of {totalPages}</span>
              <div className="pagination-controls">
                <button className="page-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>‹</button>
                <button className="page-btn" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>›</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SystemManagement;
