import { db, initDb, resetDatabase } from './db';

export function seedInitialData() {
  initDb();

  const countRow = db.prepare('SELECT COUNT(*) as count FROM requests').get() as { count: number };
  if (countRow.count > 0) {
    return; // Already seeded
  }

  const sampleRequests = [
    {
      id: 'REQ-2026-001',
      title: 'Burst Pipe in Unit 204 Bathroom — Water Leaking',
      description: 'Tenant reports a burst pipe under the bathroom sink causing water to leak onto the floor and seep into the unit below (Unit 104). Immediate inspection and repair required to prevent further water damage.',
      category: 'Plumbing',
      priority: 'Urgent',
      status: 'In Progress',
      created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 4 * 3600000).toISOString(),
    },
    {
      id: 'REQ-2026-002',
      title: 'Air Conditioning Not Cooling — Block A, Unit 312',
      description: 'AC unit running continuously but room temperature not dropping below 30°C. Tenant has checked filters and thermostat settings — issue appears to be refrigerant or compressor related. Affecting elderly occupant.',
      category: 'HVAC & Air Conditioning',
      priority: 'High',
      status: 'Open',
      created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
    {
      id: 'REQ-2026-003',
      title: 'Electrical Short Circuit Tripping Main Breaker — Unit 510',
      description: 'Main circuit breaker trips every time the kitchen appliances (microwave + oven) are used simultaneously. Possible overloaded circuit or faulty wiring in the kitchen panel. Electrician inspection required.',
      category: 'Electrical',
      priority: 'Urgent',
      status: 'Open',
      created_at: new Date(Date.now() - 6 * 3600000).toISOString(),
      updated_at: new Date(Date.now() - 6 * 3600000).toISOString(),
    },
    {
      id: 'REQ-2026-004',
      title: 'Main Lobby Cleaning — Daily Schedule Missed for 3 Days',
      description: 'The main entrance lobby and elevator foyer have not been cleaned for the past 3 days. Floors are visibly dirty, waste bins are overflowing, and the glass doors have handprints. Escalation from residents committee.',
      category: 'Cleaning & Housekeeping',
      priority: 'Medium',
      status: 'Completed',
      created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    },
    {
      id: 'REQ-2026-005',
      title: 'Broken Gate Lock on Basement Parking — Security Risk',
      description: 'The motorized gate at the basement parking entrance B2 is not locking after closure. Any vehicle can enter without scanning the access card. Poses a significant security risk for residents.',
      category: 'Security & Access',
      priority: 'High',
      status: 'In Progress',
      created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    },
    {
      id: 'REQ-2026-006',
      title: 'Cockroach Infestation Reported in Block C Stairwell',
      description: 'Multiple residents on floors 2–5 of Block C have reported cockroaches in the stairwell and common corridor. Professional pest control treatment required for all affected floors and common areas.',
      category: 'Pest Control',
      priority: 'High',
      status: 'Open',
      created_at: new Date(Date.now() - 4 * 3600000).toISOString(),
      updated_at: new Date(Date.now() - 4 * 3600000).toISOString(),
    },
    {
      id: 'REQ-2026-007',
      title: 'Swimming Pool Pump Motor Replacement',
      description: 'The pool circulation pump has failed completely. Water is not being filtered and is turning cloudy. Pool must be closed until repair is completed. Motor model: Hayward Super Pump SP2615X20.',
      category: 'Common Areas & Amenities',
      priority: 'High',
      status: 'Completed',
      created_at: new Date(Date.now() - 8 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    },
    {
      id: 'REQ-2026-008',
      title: 'Move-Out Inspection and Key Handover — Unit 118',
      description: 'Tenant vacating Unit 118 on 30 November. Final inspection of walls, fixtures, and appliances required. Security deposit refund to be processed post-inspection. Tenant requests inspection at 10:00 AM.',
      category: 'Move In / Move Out',
      priority: 'Medium',
      status: 'Open',
      created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
    {
      id: 'REQ-2026-009',
      title: 'Garden and Pathway Lighting Not Working — West Wing',
      description: 'Pathway lights along the west garden walkway have been out for 4 nights. This is a safety hazard for pedestrians after dark. 12 out of 18 bollard lights are non-functional.',
      category: 'Landscaping & Grounds',
      priority: 'Medium',
      status: 'Completed',
      created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    },
    {
      id: 'REQ-2026-010',
      title: 'Lease Renewal Agreement for Unit 305 — Due Dec 1',
      description: 'Tenant at Unit 305 has confirmed intent to renew for another 12-month term. New lease agreement to be prepared with 5% rent revision. Tenant requests one copy via email and one physical copy.',
      category: 'Lease & Tenancy',
      priority: 'Medium',
      status: 'Open',
      created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    },
    {
      id: 'REQ-2026-011',
      title: 'Parking Slot Reallocation Request — Unit 420',
      description: 'Tenant in Unit 420 has purchased a second vehicle and is requesting an additional parking bay. Currently assigned Bay P2-14. Requesting allocation of any available bay in Zone P2.',
      category: 'Parking & Vehicles',
      priority: 'Low',
      status: 'Closed',
      created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 12 * 86400000).toISOString(),
    },
    {
      id: 'REQ-2026-012',
      title: 'Bathroom Wall Tiles Cracking and Grouting Damaged — Unit 207',
      description: 'Several wall tiles in the master bathroom have cracked and the grouting between floor tiles is eroding, causing water seepage to the walls. Repair required before further structural damage occurs.',
      category: 'Maintenance & Repairs',
      priority: 'Medium',
      status: 'Open',
      created_at: new Date(Date.now() - 4 * 3600000).toISOString(),
      updated_at: new Date(Date.now() - 4 * 3600000).toISOString(),
    },
  ];

  const insert = db.prepare(`
    INSERT INTO requests (id, title, description, category, priority, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const req of sampleRequests) {
    insert.run(
      req.id,
      req.title,
      req.description,
      req.category,
      req.priority,
      req.status,
      req.created_at,
      req.updated_at
    );
  }
}

// Allow running standalone `npm run seed`
if (process.argv[1] && process.argv[1].endsWith('seed.ts')) {
  initDb();         // Ensure schema (tables + indexes) exists before reset
  resetDatabase();  // Now safe: tables exist
  seedInitialData();
  console.log('Database successfully seeded with property management sample requests!');
}
