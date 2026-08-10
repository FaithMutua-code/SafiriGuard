import React, { useState, useEffect, useCallback } from 'react';
import StatusBadge from '../components/StatusBadge';
import api from '../api/client';

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

const IoTDevices = () => {
  const [devices, setDevices] = useState([]);
  const [meta, setMeta] = useState({});
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, search: search || undefined };
      if (filter === 'online') params.is_online = true;
      if (filter === 'offline') params.is_online = false;
      const res = await api.get('/iot-devices', { params });
      setDevices(res.data.data || []);
      setMeta(res.data.meta || res.data);
    } catch { setDevices([]); }
    setLoading(false);
  }, [page, search, filter]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(); }, [load]);
  const handleSearch = (e) => { setSearch(e.target.value); setPage(1); };
  const totalPages = meta.last_page || 1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="toolbar">
        <div className="search-box" style={{ width: '300px' }}>
          <span className="search-box-icon">🔍</span>
          <input className="search-input" placeholder="Search by device ID or type…" value={search} onChange={handleSearch} />
        </div>
        <div className="chip-group">
          {['all', 'online', 'offline'].map(f => (
            <button key={f} className={`chip${filter === f ? ' active' : ''}`} onClick={() => { setFilter(f); setPage(1); }}>
              {f === 'all' ? 'All Devices' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <div className="toolbar-right">
          {meta.total !== undefined && (
            <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '500' }}>
              {(meta.total || 0).toLocaleString()} devices
            </span>
          )}
        </div>
      </div>

      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>Device ID</th>
              <th>Type</th>
              <th>Vehicle</th>
              <th>Owner</th>
              <th>Status</th>
              <th>Connection</th>
              <th>Last Seen</th>
              <th>Firmware</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: '48px' }}>
                <div className="spinner spinner-dark" style={{ margin: 'auto' }} />
              </td></tr>
            ) : devices.length === 0 ? (
              <tr><td colSpan={8}>
                <div className="empty-state">
                  <span className="empty-icon">📡</span>
                  <div className="empty-title">No IoT devices found</div>
                  <div className="empty-subtitle">Devices will appear here once registered</div>
                </div>
              </td></tr>
            ) : devices.map((d) => (
              <tr key={d.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '34px', height: '34px', borderRadius: '9px',
                      background: d.is_online ? 'var(--success-soft)' : 'var(--border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '18px', flexShrink: 0,
                    }}>📡</div>
                    <span className="table-cell-mono">{d.device_identifier}</span>
                  </div>
                </td>
                <td>
                  <span className="badge badge-primary">{(d.device_type || 'gps_tracker').replace(/_/g, ' ')}</span>
                </td>
                <td className="table-cell-mono" style={{ fontSize: '13px' }}>{d.vehicle?.number_plate || <span className="table-cell-muted">Unassigned</span>}</td>
                <td className="table-cell-muted">{d.vehicle?.owner?.user?.name || '—'}</td>
                <td><StatusBadge status={d.status || 'active'} /></td>
                <td><StatusBadge status={d.is_online ? 'online' : 'offline'} /></td>
                <td className="table-cell-muted">{fmtDate(d.last_seen_at)}</td>
                <td>
                  {d.firmware_version ? (
                    <span className="badge badge-neutral">v{d.firmware_version}</span>
                  ) : <span className="table-cell-muted">—</span>}
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
  );
};

export default IoTDevices;
