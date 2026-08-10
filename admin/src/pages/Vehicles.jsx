import React, { useState, useEffect, useCallback } from 'react';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import api from '../api/client';

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

const Vehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [meta, setMeta] = useState({});
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/vehicles', { params: { page, search: search || undefined } });
      setVehicles(res.data.data || []);
      setMeta(res.data.meta || res.data);
    } catch { setVehicles([]); }
    setLoading(false);
  }, [page, search]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(); }, [load]);
  const handleSearch = (e) => { setSearch(e.target.value); setPage(1); };
  const totalPages = meta.last_page || 1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="toolbar">
        <div className="search-box" style={{ width: '320px' }}>
          <span className="search-box-icon">🔍</span>
          <input className="search-input" placeholder="Search by plate, make or model…" value={search} onChange={handleSearch} />
        </div>
        <div className="toolbar-right">
          {meta.total !== undefined && (
            <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '500' }}>
              {(meta.total || 0).toLocaleString()} total vehicles
            </span>
          )}
        </div>
      </div>

      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>Number Plate</th>
              <th>Make / Model</th>
              <th>Owner</th>
              <th>IoT Device</th>
              <th>Device Status</th>
              <th>Trips</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '48px' }}>
                <div className="spinner spinner-dark" style={{ margin: 'auto' }} />
              </td></tr>
            ) : vehicles.length === 0 ? (
              <tr><td colSpan={7}>
                <div className="empty-state">
                  <span className="empty-icon">🚗</span>
                  <div className="empty-title">No vehicles found</div>
                  <div className="empty-subtitle">Try adjusting your search</div>
                </div>
              </td></tr>
            ) : vehicles.map((v) => (
              <tr key={v.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '34px', height: '34px', borderRadius: '9px',
                      background: 'var(--info-soft)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '18px', flexShrink: 0,
                    }}>🚗</div>
                    <span className="table-cell-mono">{v.number_plate}</span>
                  </div>
                </td>
                <td className="table-cell-muted">{[v.make, v.model, v.year].filter(Boolean).join(' · ') || '—'}</td>
                <td>
                  <div className="table-cell-bold">{v.owner?.user?.name || '—'}</div>
                  <div className="table-cell-muted" style={{ fontSize: '11px' }}>{v.owner?.user?.email || ''}</div>
                </td>
                <td className="table-cell-mono" style={{ fontSize: '12px' }}>
                  {v.iot_device?.device_identifier || <span style={{ color: 'var(--text-light)', fontFamily: 'inherit', fontWeight: '400' }}>Not assigned</span>}
                </td>
                <td>
                  {v.iot_device ? (
                    <StatusBadge status={v.iot_device.is_online ? 'online' : 'offline'} />
                  ) : (
                    <span className="badge badge-neutral">—</span>
                  )}
                </td>
                <td style={{ fontWeight: '700', color: 'var(--primary)' }}>{v.trips_count ?? 0}</td>
                <td>
                  <button className="btn btn-outline btn-sm" onClick={() => setSelected(v)}>View</button>
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

      {selected && (
        <Modal title={selected.number_plate} subtitle="Vehicle Details" onClose={() => setSelected(null)}>
          <div className="modal-detail-grid">
            <div className="modal-detail-item">
              <div className="modal-detail-label">Number Plate</div>
              <div className="modal-detail-value" style={{ fontFamily: 'monospace', fontSize: '16px' }}>{selected.number_plate}</div>
            </div>
            <div className="modal-detail-item">
              <div className="modal-detail-label">Make / Model</div>
              <div className="modal-detail-value">{[selected.make, selected.model].filter(Boolean).join(' ') || '—'}</div>
            </div>
            <div className="modal-detail-item">
              <div className="modal-detail-label">Year</div>
              <div className="modal-detail-value">{selected.year || '—'}</div>
            </div>
            <div className="modal-detail-item">
              <div className="modal-detail-label">Owner</div>
              <div className="modal-detail-value">{selected.owner?.user?.name || '—'}</div>
            </div>
            <div className="modal-detail-item">
              <div className="modal-detail-label">Owner Email</div>
              <div className="modal-detail-value">{selected.owner?.user?.email || '—'}</div>
            </div>

            <div className="modal-detail-item">
              <div className="modal-detail-label">IoT Device</div>
              <div className="modal-detail-value">{selected.iot_device?.device_identifier || 'Not assigned'}</div>
            </div>
            <div className="modal-detail-item">
              <div className="modal-detail-label">Device Status</div>
              <div className="modal-detail-value">
                {selected.iot_device ? <StatusBadge status={selected.iot_device.is_online ? 'online' : 'offline'} /> : '—'}
              </div>
            </div>
            <div className="modal-detail-item">
              <div className="modal-detail-label">Total Trips</div>
              <div className="modal-detail-value">{selected.trips_count ?? 0}</div>
            </div>
            <div className="modal-detail-item">
              <div className="modal-detail-label">Registered</div>
              <div className="modal-detail-value">{fmtDate(selected.created_at)}</div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Vehicles;
