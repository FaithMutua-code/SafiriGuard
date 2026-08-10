import React, { useState, useEffect } from 'react';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import api from '../api/client';

const fmt = (n) => (n ?? 0).toLocaleString();
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const res = await api.get('/stats');
      setData(res.data);
    } catch {
      setError('Failed to load dashboard stats.');
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(); }, []);

  if (loading) return (
    <div className="loading-center">
      <div className="spinner spinner-dark spinner-lg" />
      <span>Loading dashboard…</span>
    </div>
  );

  if (error) return (
    <div className="empty-state">
      <span className="empty-icon">⚠️</span>
      <div className="empty-title">Could not load data</div>
      <div className="empty-subtitle">{error}</div>
      <button className="btn btn-primary" style={{ marginTop: '16px' }} onClick={load}>Retry</button>
    </div>
  );

  const s = data?.stats || {};
  const owners = data?.recent_owners || [];
  const trips = data?.recent_trips || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Stat Cards */}
      <div className="stat-grid">
        <StatCard icon="👤" label="Vehicle Owners" value={fmt(s.total_owners)} color="var(--primary)" trend={{ value: 'Total', positive: null }} />
        <StatCard icon="🚗" label="Total Vehicles" value={fmt(s.total_vehicles)} color="var(--info)" />
        <StatCard icon="✅" label="Active Users" value={fmt(s.active_users)} color="var(--success)" trend={{ value: `${fmt(s.inactive_users)} inactive`, positive: null }} />
        <StatCard icon="📡" label="IoT Devices" value={fmt(s.total_devices)} color="var(--warning)" trend={{ value: `${fmt(s.online_devices)} online`, positive: s.online_devices > 0 }} />
        <StatCard icon="🗺️" label="Total Trips" value={fmt(s.total_trips)} color="var(--success)" />
      </div>

      {/* Two column grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
        {/* Recent Owners */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Recent Vehicle Owners</div>
              <div className="card-subtitle">Latest registrations on the platform</div>
            </div>
          </div>
          <div className="card-body" style={{ paddingTop: '16px' }}>
            {owners.length === 0 ? (
              <div className="empty-state" style={{ padding: '32px' }}>
                <span className="empty-icon">👤</span>
                <div className="empty-subtitle">No owners registered yet</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {owners.slice(0, 8).map((o) => (
                  <div key={o.id} style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '10px 12px', borderRadius: '10px',
                    background: 'var(--surface-2)', border: '1px solid var(--border)',
                  }}>
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '10px',
                      background: 'linear-gradient(135deg, var(--primary), var(--primary-light))',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white', fontWeight: '700', fontSize: '13px', flexShrink: 0,
                    }}>
                      {(o.name || '?')[0].toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: '600', fontSize: '14px', color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{o.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{o.email}</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', flexShrink: 0 }}>
                      <StatusBadge status={o.is_active ? 'active' : 'inactive'} />
                      <span style={{ fontSize: '11px', color: 'var(--text-light)' }}>{fmtDate(o.joined_at)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Trips */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Recent Trips</div>
              <div className="card-subtitle">Latest trips across the platform</div>
            </div>
          </div>
          <div className="card-body" style={{ paddingTop: '16px' }}>
            {trips.length === 0 ? (
              <div className="empty-state" style={{ padding: '32px' }}>
                <span className="empty-icon">🗺️</span>
                <div className="empty-subtitle">No trips recorded yet</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {trips.map((t) => (
                  <div key={t.id} style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '10px 12px', borderRadius: '10px',
                    background: 'var(--surface-2)', border: '1px solid var(--border)',
                  }}>
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '10px',
                      background: 'var(--success-soft)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '18px', flexShrink: 0,
                    }}>🗺️</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: '700', fontSize: '13px', fontFamily: 'monospace', color: 'var(--text)', letterSpacing: '0.3px' }}>{t.vehicle}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{fmtDate(t.started_at)}</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', flexShrink: 0 }}>
                      <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--info)', background: 'var(--info-soft)', padding: '3px 8px', borderRadius: '20px' }}>
                        {t.passenger_count} pax
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
