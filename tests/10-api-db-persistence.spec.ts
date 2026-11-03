import { test, expect } from '@playwright/test';

test.describe('Scenario 10: API Response & Database Persistence', () => {
  const API_URL = 'http://localhost:5000/api';

  test.beforeEach(async ({ request }) => {
    await request.post(`${API_URL}/reset`);
  });

  test('should verify full backend REST lifecycle and SQLite persistence', async ({ request }) => {
    // 1. POST /api/requests
    const postRes = await request.post(`${API_URL}/requests`, {
      data: {
        title: 'Direct API Persistence Verification Ticket',
        description: 'Testing SQLite ACID transaction and record retrieval.',
        category: 'Plumbing',
        priority: 'High',
        status: 'Open',
      },
    });
    expect(postRes.status()).toBe(201);
    const postBody = await postRes.json();
    expect(postBody.success).toBe(true);
    expect(postBody.data.id).toMatch(/^REQ-\d{4}-\d{3}$/);
    const newId = postBody.data.id;

    // 2. GET /api/requests/:id
    const getRes = await request.get(`${API_URL}/requests/${newId}`);
    expect(getRes.status()).toBe(200);
    const getBody = await getRes.json();
    expect(getBody.data.title).toBe('Direct API Persistence Verification Ticket');

    // 3. PATCH /api/requests/:id/status
    const patchRes = await request.patch(`${API_URL}/requests/${newId}/status`, {
      data: { status: 'Completed' },
    });
    expect(patchRes.status()).toBe(200);
    const patchBody = await patchRes.json();
    expect(patchBody.data.status).toBe('Completed');

    // 4. PUT /api/requests/:id
    const putRes = await request.put(`${API_URL}/requests/${newId}`, {
      data: {
        title: 'Updated Direct API Persistence Ticket',
        description: 'Updated payload via PUT method.',
        category: 'Electrical',
        priority: 'Urgent',
        status: 'Closed',
      },
    });
    expect(putRes.status()).toBe(200);
    const putBody = await putRes.json();
    expect(putBody.data.title).toBe('Updated Direct API Persistence Ticket');
    expect(putBody.data.status).toBe('Closed');

    // 5. DELETE /api/requests/:id
    const delRes = await request.delete(`${API_URL}/requests/${newId}`);
    expect(delRes.status()).toBe(200);

    // Verify 404 after deletion
    const verifyDel = await request.get(`${API_URL}/requests/${newId}`);
    expect(verifyDel.status()).toBe(404);
  });
});

