import React, { useState, useEffect } from 'react';

export default function RequirementsScreen() {
  const [requirements, setRequirements] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ code: '', statement: '', priority: 'medium', note: '' });

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch('/api/requirements?projectId=demo');
      const data = await res.json();
      setRequirements(data);
    } catch {
      setRequirements([]);
    } finally {
      setLoading(false);
    }
  }

  async function createReq(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/requirements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId: 'demo', ...form }),
    });
    if (res.ok) {
      const created = await res.json();
      setRequirements([created, ...requirements]);
      setForm({ code: '', statement: '', priority: 'medium', note: '' });
    }
  }

  async function archive(id: string) {
    await fetch(`/api/requirements/${id}`, { method: 'DELETE' });
    load();
  }

  if (loading) return <div className="loading">Chargement…</div>;

  return (
    <div className="card">
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <form onSubmit={createReq} style={{ display: 'flex', gap: '0.5rem', flex: 1, minWidth: '200px' }}>
          <input
            className="form-group"
            placeholder="ID (ex: REQ-01)"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
          />
          <input
            className="form-group"
            placeholder="Énoncé"
            value={form.statement}
            onChange={(e) => setForm({ ...form, statement: e.target.value })}
          />
          <select
            className="form-group"
            value={form.priority}
            onChange={(e) => setForm({ ...form, priority: e.target.value })}
          >
            <option value="high">Haute</option>
            <option value="medium">Moyenne</option>
            <option value="low">Basse</option>
          </select>
          <button className="btn" type="submit">Ajouter</button>
        </form>
        <span className="hint">3 exigences ciblées pour la démo — pas de quota arbitraire</span>
      </div>

      {requirements.length === 0 ? (
        <div className="empty-state">
          <h3>Aucune exigence</h3>
          <p>Ajoutez votre première exigence pour commencer.</p>
        </div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Énoncé</th>
              <th>Priorité</th>
              <th>Dernière exécution</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {requirements.map((r) => (
              <tr key={r.id}>
                <td>{r.code}</td>
                <td>{r.statement}</td>
                <td>{r.priority}</td>
                <td>—</td>
                <td>
                  <button className="btn btn-danger" onClick={() => archive(r.id)}>Archiver</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}