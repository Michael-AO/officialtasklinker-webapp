/**
 * Jest tests: user flows (post job, apply, escrow/payment) without verification gate.
 * Mocks ServerSessionManager, Supabase, and Paystack so APIs can be tested in isolation.
 */

import { NextRequest } from 'next/server';

// Chainable supabase mock builder
function chainableMock(result: { data?: unknown; error?: unknown }) {
  const chain = {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue(result),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    then: (resolve: (r: { data: unknown; error: null }) => void) =>
      resolve({ data: result.data, error: null }),
  };
  return chain;
}

const mockSupabaseFrom = jest.fn();

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: (...args: unknown[]) => mockSupabaseFrom(...args),
  },
}));

jest.mock('@/lib/server-session-manager', () => ({
  ServerSessionManager: {
    getCurrentUser: jest.fn(),
  },
}));

jest.mock('@/lib/paystack', () => ({
  paystackService: {
    verifyTransaction: jest.fn().mockResolvedValue({ status: true, data: { status: 'success' } }),
  },
}));

describe('User flows: post job, apply, get paid', () => {
  const clientId = '11111111-1111-1111-1111-111111111111';
  const freelancerId = '22222222-2222-2222-2222-222222222222';
  const taskId = '33333333-3333-3333-3333-333333333333';

  beforeEach(() => {
    jest.clearAllMocks();
    mockSupabaseFrom.mockImplementation((table: string) => {
      const chain = chainableMock({ data: null, error: null });
      if (table === 'users') {
        chain.single.mockImplementation(() => Promise.resolve({ data: { user_type: 'client' }, error: null }));
        chain.select.mockReturnValue(chain);
        chain.eq.mockReturnValue(chain);
      }
      if (table === 'tasks') {
        chain.single.mockImplementation((() => {
          let callCount = 0;
          return () => {
            callCount++;
            return Promise.resolve({
              data: callCount === 1 ? { id: taskId, client_id: clientId, questions: [] } : { id: taskId, client_id: clientId },
              error: null,
            });
          };
        })());
      }
      return chain;
    });
  });

  describe('POST /api/tasks/create (client posts job)', () => {
    it('returns 401 when user is not authenticated', async () => {
      const { ServerSessionManager } = await import('@/lib/server-session-manager');
      (ServerSessionManager.getCurrentUser as jest.Mock).mockResolvedValue(null);

      const { POST } = await import('@/app/api/tasks/create/route');
      const req = new NextRequest('http://localhost/api/tasks/create', {
        method: 'POST',
        body: JSON.stringify({
          title: 'Test Task',
          description: 'Description',
          category: 'writing',
          budget_amount: 50000,
          duration: '1-2 weeks',
          currency: 'NGN',
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      const res = await POST(req);
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error).toMatch(/auth|login|required/i);
    });

    it('returns 400 when required fields are missing', async () => {
      const { ServerSessionManager } = await import('@/lib/server-session-manager');
      (ServerSessionManager.getCurrentUser as jest.Mock).mockResolvedValue({ id: clientId });

      const { POST } = await import('@/app/api/tasks/create/route');
      const req = new NextRequest('http://localhost/api/tasks/create', {
        method: 'POST',
        body: JSON.stringify({ title: 'Only title', category: 'writing' }),
        headers: { 'Content-Type': 'application/json' },
      });

      const res = await POST(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.success).toBe(false);
    });

    it('accepts valid task creation (client, no verification required)', async () => {
      const { ServerSessionManager } = await import('@/lib/server-session-manager');
      (ServerSessionManager.getCurrentUser as jest.Mock).mockResolvedValue({ id: clientId });

      mockSupabaseFrom.mockImplementation((table: string) => {
        const c = chainableMock({ data: null, error: null });
        c.select.mockReturnValue(c);
        c.eq.mockReturnValue(c);
        c.single.mockResolvedValue({ data: { user_type: 'client' }, error: null });
        if (table === 'tasks') {
          c.insert.mockResolvedValue({
            data: [{ id: taskId, title: 'Test Task', client_id: clientId }],
            error: null,
          });
        }
        return c;
      });

      const { POST } = await import('@/app/api/tasks/create/route');
      const req = new NextRequest('http://localhost/api/tasks/create', {
        method: 'POST',
        body: JSON.stringify({
          title: 'Test Task',
          description: 'Full description here',
          category: 'writing',
          budget_amount: 50000,
          duration: '1-2 weeks',
          currency: 'NGN',
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      const res = await POST(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.task).toBeDefined();
    });
  });

  describe('POST /api/tasks/[id]/apply (freelancer applies)', () => {
    it('returns 401 when user is not authenticated', async () => {
      const { ServerSessionManager } = await import('@/lib/server-session-manager');
      (ServerSessionManager.getCurrentUser as jest.Mock).mockResolvedValue(null);

      const { POST } = await import('@/app/api/tasks/[id]/apply/route');
      const req = new NextRequest('http://localhost/api/tasks/123/apply', {
        method: 'POST',
        body: JSON.stringify({}),
        headers: { 'Content-Type': 'application/json' },
      });

      const res = await POST(req, { params: Promise.resolve({ id: taskId }) });
      expect(res.status).toBe(401);
    });

    it('returns 403 when user is not a freelancer', async () => {
      const { ServerSessionManager } = await import('@/lib/server-session-manager');
      (ServerSessionManager.getCurrentUser as jest.Mock).mockResolvedValue({ id: clientId });

      mockSupabaseFrom.mockImplementation((table: string) => {
        const c = chainableMock({ data: null, error: null });
        c.select.mockReturnValue(c);
        c.eq.mockReturnValue(c);
        c.single.mockResolvedValue(
          table === 'users'
            ? { data: { user_type: 'client' }, error: null }
            : { data: null, error: null },
        );
        return c;
      });

      const { POST } = await import('@/app/api/tasks/[id]/apply/route');
      const req = new NextRequest('http://localhost/api/tasks/123/apply', {
        method: 'POST',
        body: JSON.stringify({}),
        headers: { 'Content-Type': 'application/json' },
      });

      const res = await POST(req, { params: Promise.resolve({ id: taskId }) });
      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.error).toMatch(/freelancer/i);
    });

    it('accepts application from freelancer (no verification required)', async () => {
      const { ServerSessionManager } = await import('@/lib/server-session-manager');
      (ServerSessionManager.getCurrentUser as jest.Mock).mockResolvedValue({ id: freelancerId });

      let fromCalls = 0;
      mockSupabaseFrom.mockImplementation((table: string) => {
        const c = chainableMock({ data: null, error: null });
        c.select.mockReturnValue(c);
        c.eq.mockReturnValue(c);
        c.single.mockImplementation(() => {
          fromCalls++;
          if (table === 'users') return Promise.resolve({ data: { user_type: 'freelancer' }, error: null });
          if (table === 'applications') return Promise.resolve({ data: null, error: { code: 'PGRST116' } });
          if (table === 'tasks') return Promise.resolve({ data: { id: taskId, questions: [] }, error: null });
          return Promise.resolve({ data: null, error: null });
        });
        c.insert.mockResolvedValue({ data: [{ id: 'app-1' }], error: null });
        return c;
      });

      const { POST } = await import('@/app/api/tasks/[id]/apply/route');
      const req = new NextRequest('http://localhost/api/tasks/123/apply', {
        method: 'POST',
        body: JSON.stringify({}),
        headers: { 'Content-Type': 'application/json' },
      });

      const res = await POST(req, { params: Promise.resolve({ id: taskId }) });
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
    });
  });

  describe('POST /api/escrow/create (client adds payment – no verification check)', () => {
    it('returns 401 when not authenticated', async () => {
      const { ServerSessionManager } = await import('@/lib/server-session-manager');
      (ServerSessionManager.getCurrentUser as jest.Mock).mockResolvedValue(null);

      const { POST } = await import('@/app/api/escrow/create/route');
      const req = new NextRequest('http://localhost/api/escrow/create', {
        method: 'POST',
        body: JSON.stringify({
          taskId,
          reference: 'TEST_xxx',
          freelancerId,
          amount: 50000,
          paymentType: 'full',
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      const res = await POST(req);
      expect(res.status).toBe(401);
    });

    it('allows escrow create for authenticated client (no is_verified gate)', async () => {
      const { ServerSessionManager } = await import('@/lib/server-session-manager');
      (ServerSessionManager.getCurrentUser as jest.Mock).mockResolvedValue({ id: clientId });

      mockSupabaseFrom.mockImplementation((table: string) => {
        const c = chainableMock({ data: null, error: null });
        c.select.mockReturnValue(c);
        c.eq.mockReturnValue(c);
        c.single.mockImplementation(() => {
          if (table === 'tasks') return Promise.resolve({ data: { client_id: clientId }, error: null });
          return Promise.resolve({ data: null, error: null });
        });
        if (table === 'escrow_transactions' || table === 'task_milestones') {
          c.insert.mockResolvedValue({ data: [{ id: 'esc-1' }], error: null });
        }
        return c;
      });

      const { POST } = await import('@/app/api/escrow/create/route');
      const req = new NextRequest('http://localhost/api/escrow/create', {
        method: 'POST',
        body: JSON.stringify({
          taskId,
          reference: 'TEST_escrow_ref',
          freelancerId,
          amount: 50000,
          paymentType: 'full',
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      const res = await POST(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
    });
  });

  describe('POST /api/escrow/milestone/fund/verify (fund milestone – no verification check)', () => {
    it('returns 401 when not authenticated', async () => {
      const { ServerSessionManager } = await import('@/lib/server-session-manager');
      (ServerSessionManager.getCurrentUser as jest.Mock).mockResolvedValue(null);

      const { POST } = await import('@/app/api/escrow/milestone/fund/verify/route');
      const req = new NextRequest('http://localhost/api/escrow/milestone/fund/verify', {
        method: 'POST',
        body: JSON.stringify({ reference: 'TEST_mil', milestone_id: 'mil-1' }),
        headers: { 'Content-Type': 'application/json' },
      });

      const res = await POST(req);
      expect(res.status).toBe(401);
    });

    it('accepts milestone fund request from task client (no is_verified gate)', async () => {
      const { ServerSessionManager } = await import('@/lib/server-session-manager');
      (ServerSessionManager.getCurrentUser as jest.Mock).mockResolvedValue({ id: clientId });

      mockSupabaseFrom.mockImplementation((table: string) => {
        const c = chainableMock({ data: null, error: null });
        c.select.mockReturnValue(c);
        c.eq.mockReturnValue(c);
        c.single.mockImplementation(() => {
          if (table === 'task_milestones')
            return Promise.resolve({ data: { id: 'mil-1', task_id: taskId, amount: 25000, status: 'PENDING' }, error: null });
          if (table === 'tasks') return Promise.resolve({ data: { id: taskId, client_id: clientId }, error: null });
          return Promise.resolve({ data: null, error: null });
        });
        c.update.mockReturnValue(c);
        return c;
      });

      const { POST } = await import('@/app/api/escrow/milestone/fund/verify/route');
      const req = new NextRequest('http://localhost/api/escrow/milestone/fund/verify', {
        method: 'POST',
        body: JSON.stringify({ reference: 'TEST_mil_123', milestone_id: 'mil-1' }),
        headers: { 'Content-Type': 'application/json' },
      });

      const res = await POST(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
    });
  });
});
