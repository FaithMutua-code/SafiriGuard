import React, { useState, useEffect, useCallback } from 'react';
import StatusBadge from '../components/StatusBadge';
import api from '../api/client';

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';
const fmtDuration = (mins) => {
  if (!mins && mins !== 0) return '—';
  if (mins < 60) return `${mins}m`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
};

const Trips = () => {
  const [trips, setTrips] = useState([]);
  const [meta, setMeta] = useState({});
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page };
      if (filter !== 'all') params.status = filter;
      const res = await api.get('/trips', { params });
      setTrips(res.data.data || []);
      setMeta(res.data.meta || res.data);
    } catch { setTrips([]); }
    setLoading(false);
  }, [page, filter]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(); }, [load]);
  const totalPages = meta.last_page || 1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="toolbar">
        <div className="chip-group">
          {[
            { id: 'all', label: 'All Trips' },
            { id: 'completed', label: 'Completed' },
            { id: 'in_progress', label: 'In Progress' },
            { id: 'cancelled', label: 'Cancelled' },
          ].map(f => (
            <button key={f.id} className={`chip${filter === f.id ? ' active' : ''}`} onClick={() => { setFilter(f.id); setPage(1); }}>
              {f.label}
            </button>
          ))}
        </div>
        <div className="toolbar-right">
          {meta.total !== undefined && (
            <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '500' }}>
              {(meta.total || 0).toLocaleString()} trips
            </span>
          )}
        </div>
      </div>

      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>Trip ID</th>
              <th>Vehicle</th>
              <th>Owner</th>
              <th>Started</th>
              <th>Ended</th>
              <th>Duration</th>
              <th>Distance</th>
              <th>Passengers</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={9} style={{ textAlign: 'center', padding: '48px' }}>
                <div className="spinner spinner-dark" style={{ margin: 'auto' }} />
              </td></tr>
            ) : trips.length === 0 ? (
              <tr><td colSpan={9}>
                <div className="empty-state">
                  <span className="empty-icon">🗺️</span>
                  <div className="empty-title">No trips recorded</div>
                  <div className="empty-subtitle">Trips will appear here once vehicles start moving</div>
                </div>
              </td></tr>
            ) : trips.map((t) => (
              <tr key={t.id}>
                <td>
                  <span style={{ fontFamily: 'monospace', fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>#{t.id}</span>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '16px' }}>🚗</span>
                    <span className="table-cell-mono">{t.vehicle?.number_plate || '—'}</span>
                  </div>
                </td>
                <td className="table-cell-muted">{t.vehicle?.owner?.user?.name || '—'}</td>
                <td className="table-cell-muted">{fmtDate(t.start_time)}</td>
                <td className="table-cell-muted">{fmtDate(t.end_time)}</td>
                <td>
                  <span style={{ fontWeight: '600', color: 'var(--info)' }}>{fmtDuration(t.duration_minutes)}</span>
                </td>
                <td>
                  {t.distance_km ? (
                    <span style={{ fontWeight: '600', color: 'var(--success)' }}>{Number(t.distance_km).toFixed(1)} km</span>
                  ) : <span className="table-cell-muted">—</span>}
                </td>
                <td>
                  <span style={{ fontWeight: '700', color: 'var(--primary)' }}>{t.passenger_count ?? 0}</span>
                </td>
                <td><StatusBadge status={t.status || 'completed'} /></td>
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

export default Trips;
