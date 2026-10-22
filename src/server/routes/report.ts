import { Router } from 'express';
import { db } from '../repository/index';

const router = Router();

router.get('/report', (_req, res) => {
  const rows = db.prepare(
    `SELECT r.id, r.code, r.statement, r.priority,
            MAX(run.state) as last_state,
            MAX(res.status) as last_status
     FROM requirements r
     LEFT JOIN runs run ON run.requirement_id = r.id
     LEFT JOIN results res ON res.run_id = run.id
     WHERE r.archived_at IS NULL
     GROUP BY r.id
     ORDER BY r.created_at DESC`
  ).all();
  res.json(rows);
});

export default router;