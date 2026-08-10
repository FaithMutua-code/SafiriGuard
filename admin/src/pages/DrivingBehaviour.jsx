import React, { useState, useEffect, useCallback } from 'react';
import StatusBadge from '../components/StatusBadge';
import api from '../api/client';

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

const EVENT_TYPES = [
  { id: 'all',             label: 'All Events' },
  { id: 'harsh_braking',  label: '🛑 Harsh Braking' },
  { id: 'overspeeding',   label: '💨 Overspeeding' },
  { id: 'harsh_cornering',label: '↩️ Sharp Cornering' },
  { id: 'phone_usage',    label: '📱 Phone Usage' },
];

const EVENT_META = {
  harsh_braking:   { icon: '🛑', color: 'var(--danger)'  },
  overspeeding:    { icon: '💨', color: 'var(--warning)' },
  harsh_cornering: { icon: '↩️', color: '#EA580C'        },
  phone_usage:     { icon: '📱', color: '#7C3AED'        },
};

const DrivingBehaviour = () => {
  const [records, setRecords] = useState([]);
  const [meta, setMeta] = useState({});
  const [summary, setSummary] = useState([]);
  const [page, setPage] = useState(1);
  const [eventType, setEventType] = useState('all');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, event_type: eventType !== 'all' ? eventType : undefined };
      const [listRes, sumRes] = await Promise.all([
        api.get('/driving-behaviour', { params }),
        api.get('/driving-behaviour/summary'),
      ]);
      setRecords(listRes.data.data || []);
      setMeta(listRes.data.meta || listRes.data);
      setSummary(sumRes.data.summary || []);
    } catch { setRecords([]); }
    setLoading(false);
  }, [page, eventType]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(); }, [load]);
  const totalPages = meta.last_page || 1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Summary Cards */}
      {summary.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
          {summary.map((s) => {
            const meta = EVENT_META[s.event_type] || { icon: '⚠️', color: 'var(--danger)' };
            return (
              <div key={s.event_type} style={{
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)', padding: '18px',
                borderLeft: `3px solid ${meta.color}`,
                boxShadow: 'var(--shadow-sm)',
              }}>
                <div style={{ fontSize: '22px', marginBottom: '8px' }}>{meta.icon}</div>
                <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text)', lineHeight: 1 }}>{s.total}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', fontWeight: '500' }}>
                  {(s.event_type || '').replace(/_/g, ' ')}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Filters */}
      <div className="toolbar">
        <div className="chip-group">
          {EVENT_TYPES.map(t => (
            <button key={t.id} className={`chip${eventType === t.id ? ' active' : ''}`} onClick={() => { setEventType(t.id); setPage(1); }}>
              {t.label}
            </button>
          ))}
        </div>
        <div className="toolbar-right">
          {meta.total !== undefined && (
            <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '500' }}>
              {(meta.total || 0).toLocaleString()} events
            </span>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>Event Type</th>
              <th>Vehicle</th>
              <th>Owner</th>
              <th>Severity</th>
              <th>Recorded At</th>
              <th>Trip ID</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '48px' }}>
                <div className="spinner spinner-dark" style={{ margin: 'auto' }} />
              </td></tr>
            ) : records.length === 0 ? (
              <tr><td colSpan={6}>
                <div className="empty-state">
                  <span className="empty-icon">✅</span>
                  <div className="empty-title">No unsafe driving events</div>
                  <div className="empty-subtitle">Events are recorded when unsafe driving behaviour is detected</div>
                </div>
              </td></tr>
            ) : records.map((r) => {
              const em = EVENT_META[r.event_type] || { icon: '⚠️', color: 'var(--danger)' };
              return (
                <tr key={r.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '34px', height: '34px', borderRadius: '9px',
                        background: `${em.color}15`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '18px', flexShrink: 0,
                      }}>{em.icon}</div>
                      <StatusBadge status={r.event_type} />
                    </div>
                  </td>
                  <td className="table-cell-mono">{r.trip?.vehicle?.number_plate || '—'}</td>
                  <td className="table-cell-muted">{r.trip?.vehicle?.owner?.user?.name || '—'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '2px' }}>
                      {Array.from({ length: 5 }, (_, i) => (
                        <div key={i} style={{
                          width: '6px', height: '6px', borderRadius: '2px',
                          background: i < (r.severity || 1) ? em.color : 'var(--border)',
                        }} />
                      ))}
                    </div>
                  </td>
                  <td className="table-cell-muted">{fmtDate(r.recorded_at)}</td>
                  <td>
                    {r.trip_id ? (
                      <span style={{ fontFamily: 'monospace', fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>#{r.trip_id}</span>
                    ) : '—'}
                  </td>
                </tr>
              );
            })}
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

export default DrivingBehaviour;
