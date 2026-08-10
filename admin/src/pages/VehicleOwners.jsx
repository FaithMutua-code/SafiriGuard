import React, { useState, useEffect, useCallback } from 'react';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import api from '../api/client';

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

const VehicleOwners = () => {
  const [owners, setOwners] = useState([]);
  const [meta, setMeta] = useState({});
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [toggling, setToggling] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/vehicle-owners', { params: { page, search: search || undefined } });
      setOwners(res.data.data || []);
      setMeta(res.data.meta || res.data);
    } catch { setOwners([]); }
    setLoading(false);
  }, [page, search]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(); }, [load]);

  const handleSearch = (e) => { setSearch(e.target.value); setPage(1); };

  const handleToggle = async (owner) => {
    setToggling(owner.id);
    try {
      const res = await api.patch(`/vehicle-owners/${owner.id}/toggle-active`);
      setOwners(prev => prev.map(o =>
        o.id === owner.id ? { ...o, user: { ...o.user, is_active: res.data.is_active } } : o
      ));
      if (selected?.id === owner.id) {
        setSelected(s => ({ ...s, user: { ...s.user, is_active: res.data.is_active } }));
      }
    } catch {}
    setToggling(null);
  };

  const totalPages = meta.last_page || 1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Toolbar */}
      <div className="toolbar">
        <div className="search-box" style={{ width: '320px' }}>
          <span className="search-box-icon">🔍</span>
          <input
            className="search-input"
            placeholder="Search by name or email…"
            value={search}
            onChange={handleSearch}
          />
        </div>
        <div className="toolbar-right">
          {meta.total !== undefined && (
            <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '500' }}>
              {(meta.total || 0).toLocaleString()} total owners
            </span>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>Owner</th>
              <th>Phone</th>
              <th>Vehicles</th>
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
            ) : owners.length === 0 ? (
              <tr><td colSpan={6}>
                <div className="empty-state">
                  <span className="empty-icon">👤</span>
                  <div className="empty-title">No vehicle owners found</div>
                  <div className="empty-subtitle">Try adjusting your search</div>
                </div>
              </td></tr>
            ) : owners.map((o) => (
              <tr key={o.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '10px',
                      background: 'linear-gradient(135deg, var(--primary), var(--primary-light))',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white', fontWeight: '700', fontSize: '13px', flexShrink: 0,
                    }}>
                      {(o.user?.name || '?')[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="table-cell-bold">{o.user?.name || '—'}</div>
                      <div className="table-cell-muted" style={{ fontSize: '12px' }}>{o.user?.email || '—'}</div>
                    </div>
                  </div>
                </td>
                <td className="table-cell-muted">{o.user?.phone || '—'}</td>
                <td>
                  <span style={{ fontWeight: '700', color: 'var(--primary)' }}>{o.vehicles_count ?? 0}</span>
                  <span className="table-cell-muted"> vehicles</span>
                </td>
                <td><StatusBadge status={o.user?.is_active ? 'active' : 'inactive'} /></td>
                <td className="table-cell-muted">{fmtDate(o.created_at)}</td>
                <td>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn btn-outline btn-sm" onClick={() => setSelected(o)}>View</button>
                    <button
                      className={`btn btn-sm ${o.user?.is_active ? 'btn-danger' : 'btn-success'}`}
                      onClick={() => handleToggle(o)}
                      disabled={toggling === o.id}
                    >
                      {toggling === o.id ? <div className="spinner" style={{ width: '12px', height: '12px', borderWidth: '2px' }} /> : o.user?.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <span className="pagination-info">Page {page} of {totalPages}</span>
            <div className="pagination-controls">
              <button className="page-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>‹</button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const p = page <= 3 ? i + 1 : page + i - 2;
                return p <= totalPages ? (
                  <button key={p} className={`page-btn${p === page ? ' active' : ''}`} onClick={() => setPage(p)}>{p}</button>
                ) : null;
              })}
              <button className="page-btn" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>›</button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selected && (
        <Modal
          title={selected.user?.name || 'Owner Detail'}
          subtitle={`ID: ${selected.id} · ${selected.user?.email}`}
          onClose={() => setSelected(null)}
          actions={
            <>
              <button className="btn btn-outline" onClick={() => setSelected(null)}>Close</button>
              <button
                className={`btn ${selected.user?.is_active ? 'btn-danger' : 'btn-success'}`}
                onClick={() => handleToggle(selected)}
                disabled={toggling === selected.id}
              >
                {selected.user?.is_active ? 'Deactivate Account' : 'Activate Account'}
              </button>
            </>
          }
        >
          <div className="modal-detail-grid">
            <div className="modal-detail-item">
              <div className="modal-detail-label">Full Name</div>
              <div className="modal-detail-value">{selected.user?.name || '—'}</div>
            </div>
            <div className="modal-detail-item">
              <div className="modal-detail-label">Email</div>
              <div className="modal-detail-value">{selected.user?.email || '—'}</div>
            </div>
            <div className="modal-detail-item">
              <div className="modal-detail-label">Phone</div>
              <div className="modal-detail-value">{selected.user?.phone || '—'}</div>
            </div>

            <div className="modal-detail-item">
              <div className="modal-detail-label">ID Number</div>
              <div className="modal-detail-value">{selected.id_number || '—'}</div>
            </div>
            <div className="modal-detail-item">
              <div className="modal-detail-label">Status</div>
              <div className="modal-detail-value"><StatusBadge status={selected.user?.is_active ? 'active' : 'inactive'} /></div>
            </div>
            <div className="modal-detail-item">
              <div className="modal-detail-label">Total Vehicles</div>
              <div className="modal-detail-value">{selected.vehicles_count ?? selected.vehicles?.length ?? 0}</div>
            </div>
            <div className="modal-detail-item">
              <div className="modal-detail-label">Joined</div>
              <div className="modal-detail-value">{fmtDate(selected.created_at)}</div>
            </div>
          </div>

          {selected.vehicles?.length > 0 && (
            <>
              <div className="modal-divider" />
              <div style={{ fontWeight: '700', fontSize: '13px', marginBottom: '10px' }}>Vehicles</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {selected.vehicles.map(v => (
                  <div key={v.id} style={{
                    padding: '10px 14px', borderRadius: '10px',
                    background: 'var(--surface-2)', border: '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  }}>
                    <span style={{ fontFamily: 'monospace', fontWeight: '700', letterSpacing: '0.3px' }}>{v.number_plate}</span>
                    <span className="table-cell-muted">{[v.make, v.model, v.year].filter(Boolean).join(' · ')}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </Modal>
      )}
    </div>
  );
};

export default VehicleOwners;
