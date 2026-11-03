import { Router, Request, Response } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { db, generateRequestId, resetDatabase } from './db';
import { seedInitialData } from './seed';

export const router = Router();

const VALID_CATEGORIES = [
  'Maintenance & Repairs',
  'Plumbing',
  'Electrical',
  'HVAC & Air Conditioning',
  'Cleaning & Housekeeping',
  'Security & Access',
  'Pest Control',
  'Landscaping & Grounds',
  'Parking & Vehicles',
  'Lease & Tenancy',
  'Move In / Move Out',
  'Common Areas & Amenities',
];
const VALID_PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];
const VALID_STATUSES = ['Open', 'In Progress', 'Completed', 'Closed'];

export interface ServiceRequestRecord {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  created_at: string;
  updated_at: string;
}

// GET /api/requests/stats - Dashboard metrics
router.get('/requests/stats', (req: Request, res: Response) => {
  try {
    const totalRow = db.prepare('SELECT COUNT(*) as count FROM requests').get() as { count: number };
    const total = totalRow.count;

    const statusRows = db.prepare(`
      SELECT status, COUNT(*) as count 
      FROM requests 
      GROUP BY status
    `).all() as Array<{ status: string; count: number }>;

    const priorityRows = db.prepare(`
      SELECT priority, COUNT(*) as count 
      FROM requests 
      GROUP BY priority
    `).all() as Array<{ priority: string; count: number }>;

    const categoryRows = db.prepare(`
      SELECT category, COUNT(*) as count 
      FROM requests 
      GROUP BY category
    `).all() as Array<{ category: string; count: number }>;

    const recent = (db.prepare(`
      SELECT * FROM requests 
      ORDER BY created_at DESC 
      LIMIT 5
    `).all() as unknown) as ServiceRequestRecord[];

    const byStatus: Record<string, number> = {
      'Open': 0,
      'In Progress': 0,
      'Completed': 0,
      'Closed': 0,
    };
    for (const r of statusRows) {
      byStatus[r.status] = r.count;
    }

    const byPriority: Record<string, number> = {
      'Low': 0,
      'Medium': 0,
      'High': 0,
      'Urgent': 0,
    };
    for (const r of priorityRows) {
      byPriority[r.priority] = r.count;
    }

    const byCategory: Record<string, number> = {};
    for (const c of VALID_CATEGORIES) {
      byCategory[c] = 0;
    }
    for (const r of categoryRows) {
      byCategory[r.category] = r.count;
    }

    res.json({
      success: true,
      data: {
        total,
        byStatus,
        byPriority,
        byCategory,
        recent,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Internal server error' });
  }
});

// GET /api/requests - List with search, filters, and pagination
router.get('/requests', (req: Request, res: Response) => {
  try {
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
    const status = typeof req.query.status === 'string' ? req.query.status.trim() : '';
    const priority = typeof req.query.priority === 'string' ? req.query.priority.trim() : '';
    const category = typeof req.query.category === 'string' ? req.query.category.trim() : '';
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string, 10) || 10));
    const offset = (page - 1) * limit;

    const whereClauses: string[] = [];
    const params: any[] = [];

    if (search) {
      whereClauses.push('(id LIKE ? OR title LIKE ? OR description LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (status && status !== 'All') {
      whereClauses.push('status = ?');
      params.push(status);
    }

    if (priority && priority !== 'All') {
      whereClauses.push('priority = ?');
      params.push(priority);
    }

    if (category && category !== 'All') {
      whereClauses.push('category = ?');
      params.push(category);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    // Count total matching
    const countQuery = `SELECT COUNT(*) as total FROM requests ${whereSql}`;
    const totalRow = db.prepare(countQuery).get(...params) as { total: number };
    const total = totalRow.total;

    // Get paginated results
    const selectQuery = `
      SELECT * FROM requests 
      ${whereSql} 
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `;
    const requests = (db.prepare(selectQuery).all(...params, limit, offset) as unknown) as ServiceRequestRecord[];

    res.json({
      success: true,
      data: requests,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Internal server error' });
  }
});

// GET /api/requests/:id - Single request details
router.get('/requests/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const request = (db.prepare('SELECT * FROM requests WHERE id = ?').get(id) as unknown) as ServiceRequestRecord | undefined;

    if (!request) {
      return res.status(404).json({ success: false, error: `Service Request '${id}' not found` });
    }

    res.json({ success: true, data: request });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Internal server error' });
  }
});

// POST /api/requests - Create request (with Idempotency-Key support)
router.post('/requests', (req: Request, res: Response) => {
  try {
    const idempotencyKey = (req.header('Idempotency-Key') || req.body.idempotencyKey || '').trim();

    // Check if idempotency key was already processed
    if (idempotencyKey) {
      const existing = db.prepare('SELECT * FROM idempotency_keys WHERE key = ?').get(idempotencyKey) as any;
      if (existing) {
        const cachedBody = JSON.parse(existing.response_body);
        return res.status(existing.status_code).json({
          ...cachedBody,
          idempotentReplay: true,
        });
      }
    }

    const { title, description, category, priority, status } = req.body;

    // Validation
    const errors: Record<string, string> = {};

    if (!title || typeof title !== 'string' || title.trim().length < 3) {
      errors.title = 'Title must be at least 3 characters long.';
    }

    if (!description || typeof description !== 'string' || description.trim().length < 5) {
      errors.description = 'Description must be at least 5 characters long.';
    }

    if (!category || !VALID_CATEGORIES.includes(category)) {
      errors.category = `Category must be one of: ${VALID_CATEGORIES.join(', ')}`;
    }

    if (!priority || !VALID_PRIORITIES.includes(priority)) {
      errors.priority = `Priority must be one of: ${VALID_PRIORITIES.join(', ')}`;
    }

    const initialStatus = status && VALID_STATUSES.includes(status) ? status : 'Open';

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        validationErrors: errors,
      });
    }

    const id = generateRequestId();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO requests (id, title, description, category, priority, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, title.trim(), description.trim(), category, priority, initialStatus, now, now);

    const createdRecord = (db.prepare('SELECT * FROM requests WHERE id = ?').get(id) as unknown) as ServiceRequestRecord;

    const responsePayload = {
      success: true,
      message: 'Service request created successfully',
      data: createdRecord,
    };

    // Save idempotency key if provided
    if (idempotencyKey) {
      db.prepare(`
        INSERT INTO idempotency_keys (key, request_id, response_body, status_code, created_at)
        VALUES (?, ?, ?, ?, ?)
      `).run(idempotencyKey, id, JSON.stringify(responsePayload), 201, now);
    }

    res.status(201).json(responsePayload);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Internal server error' });
  }
});

// PUT /api/requests/:id - Edit request
router.put('/requests/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const existing = (db.prepare('SELECT * FROM requests WHERE id = ?').get(id) as unknown) as ServiceRequestRecord | undefined;

    if (!existing) {
      return res.status(404).json({ success: false, error: `Service Request '${id}' not found` });
    }

    const { title, description, category, priority, status } = req.body;
    const errors: Record<string, string> = {};

    if (!title || typeof title !== 'string' || title.trim().length < 3) {
      errors.title = 'Title must be at least 3 characters long.';
    }

    if (!description || typeof description !== 'string' || description.trim().length < 5) {
      errors.description = 'Description must be at least 5 characters long.';
    }

    if (!category || !VALID_CATEGORIES.includes(category)) {
      errors.category = `Category must be one of: ${VALID_CATEGORIES.join(', ')}`;
    }

    if (!priority || !VALID_PRIORITIES.includes(priority)) {
      errors.priority = `Priority must be one of: ${VALID_PRIORITIES.join(', ')}`;
    }

    if (!status || !VALID_STATUSES.includes(status)) {
      errors.status = `Status must be one of: ${VALID_STATUSES.join(', ')}`;
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        validationErrors: errors,
      });
    }

    const now = new Date().toISOString();

    db.prepare(`
      UPDATE requests 
      SET title = ?, description = ?, category = ?, priority = ?, status = ?, updated_at = ?
      WHERE id = ?
    `).run(title.trim(), description.trim(), category, priority, status, now, id);

    const updated = (db.prepare('SELECT * FROM requests WHERE id = ?').get(id) as unknown) as ServiceRequestRecord;

    res.json({
      success: true,
      message: 'Service request updated successfully',
      data: updated,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Internal server error' });
  }
});

// PATCH /api/requests/:id/status - Quick status update
router.patch('/requests/:id/status', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`,
      });
    }

    const existing = (db.prepare('SELECT * FROM requests WHERE id = ?').get(id) as unknown) as ServiceRequestRecord | undefined;
    if (!existing) {
      return res.status(404).json({ success: false, error: `Service Request '${id}' not found` });
    }

    const now = new Date().toISOString();
    db.prepare('UPDATE requests SET status = ?, updated_at = ? WHERE id = ?').run(status, now, id);

    const updated = (db.prepare('SELECT * FROM requests WHERE id = ?').get(id) as unknown) as ServiceRequestRecord;

    res.json({
      success: true,
      message: `Status updated to ${status}`,
      data: updated,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Internal server error' });
  }
});

// DELETE /api/requests/:id - Delete request
router.delete('/requests/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const existing = (db.prepare('SELECT * FROM requests WHERE id = ?').get(id) as unknown) as ServiceRequestRecord | undefined;

    if (!existing) {
      return res.status(404).json({ success: false, error: `Service Request '${id}' not found` });
    }

    db.prepare('DELETE FROM requests WHERE id = ?').run(id);

    res.json({
      success: true,
      message: `Service Request ${id} deleted successfully`,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Internal server error' });
  }
});

// GET /api/reports - List archived reports
router.get('/reports', (req: Request, res: Response) => {
  try {
    const reportsDir = path.resolve(process.cwd(), 'reports');
    if (!fs.existsSync(reportsDir)) {
      return res.json({ success: true, data: [] });
    }

    const files = fs.readdirSync(reportsDir);
    const jsonFiles = files.filter((f) => f.startsWith('daily-report-') && f.endsWith('.json') && !f.includes('latest'));

    const items: any[] = [];
    for (const f of jsonFiles) {
      try {
        const content = JSON.parse(fs.readFileSync(path.join(reportsDir, f), 'utf8'));
        items.push({
          reportId: content.reportId,
          generatedAt: content.generatedAt,
          environment: content.environment?.environment || 'Local',
          overallStatus: content.kpis?.overallStatus || 'PASS',
          totalTests: content.kpis?.totalTests || 0,
          passed: content.kpis?.passed || 0,
          failed: content.kpis?.failed || 0,
          durationMs: content.kpis?.durationMs || 0,
          htmlFile: f.replace('.json', '.html'),
          jsonFile: f,
        });
      } catch {
        // ignore malformed
      }
    }

    // Sort newest first
    items.sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime());

    res.json({ success: true, data: items });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to list reports' });
  }
});

// GET /api/reports/latest - Get latest consolidated report JSON
router.get('/reports/latest', (req: Request, res: Response) => {
  try {
    const latestPath = path.resolve(process.cwd(), 'reports', 'daily-report-latest.json');
    const rootPath = path.resolve(process.cwd(), 'daily-report.json');
    const targetPath = fs.existsSync(latestPath) ? latestPath : fs.existsSync(rootPath) ? rootPath : null;

    if (!targetPath) {
      return res.status(404).json({ success: false, error: 'No daily report generated yet' });
    }

    const report = JSON.parse(fs.readFileSync(targetPath, 'utf8'));
    res.json({ success: true, data: report });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to load latest report' });
  }
});

// GET /api/reports/:filename - Download HTML or JSON report artifact
router.get('/reports/artifact/:filename', (req: Request, res: Response) => {
  try {
    const { filename } = req.params;
    // Basic sanitization
    const safeName = path.basename(filename);
    let filePath = path.resolve(process.cwd(), 'reports', safeName);
    if (!fs.existsSync(filePath)) {
      filePath = path.resolve(process.cwd(), safeName);
    }

    if (!fs.existsSync(filePath)) {
      return res.status(404).send('Artifact not found');
    }

    if (safeName.endsWith('.html')) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.sendFile(filePath);
    } else if (safeName.endsWith('.json')) {
      res.setHeader('Content-Type', 'application/json');
      return res.sendFile(filePath);
    }

    res.sendFile(filePath);
  } catch (error: any) {
    res.status(500).send('Error reading report artifact');
  }
});

// POST /api/reset - Reset database to clean demo state
router.post('/reset', (req: Request, res: Response) => {
  try {
    resetDatabase();
    seedInitialData();
    res.json({
      success: true,
      message: 'Database reset and seeded with initial demo data successfully',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Internal server error' });
  }
});
