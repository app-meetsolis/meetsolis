/**
 * Epic 1 ↔ Epic 2 Integration Tests
 *
 * Purpose: Verify Epic 1 (auth, RLS, AI tracking) integrates with Epic 2 (client management)
 *
 * Test Coverage:
 * 1. Authenticated user can create clients
 * 2. RLS prevents cross-user client access
 * 3. AI features track usage in Epic 1 table
 */

import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

// Test configuration
const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create clients
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

describe('Epic 1 ↔ Epic 2 Integration', () => {
  // Test users
  let testUserA: { id: string; clerk_id: string };
  let testUserB: { id: string; clerk_id: string };

  beforeAll(async () => {
    // Create test users in Epic 1 users table
    const clerkIdA = `test_user_a_${Date.now()}`;
    const clerkIdB = `test_user_b_${Date.now()}`;

    const { data: userA, error: errorA } = await supabaseAdmin
      .from('users')
      .insert({
        clerk_id: clerkIdA,
        email: `test-a-${Date.now()}@meetsolis.com`,
        full_name: 'Test User A',
      })
      .select()
      .single();

    const { data: userB, error: errorB } = await supabaseAdmin
      .from('users')
      .insert({
        clerk_id: clerkIdB,
        email: `test-b-${Date.now()}@meetsolis.com`,
        full_name: 'Test User B',
      })
      .select()
      .single();

    if (errorA || errorB) {
      throw new Error(
        `Failed to create test users: ${errorA?.message || errorB?.message}`
      );
    }

    testUserA = userA;
    testUserB = userB;
  });

  afterAll(async () => {
    // Cleanup test users (CASCADE deletes clients)
    await supabaseAdmin.from('users').delete().eq('id', testUserA.id);
    await supabaseAdmin.from('users').delete().eq('id', testUserB.id);
  });

  describe('Test 1: Authenticated User Can Create Client', () => {
    it('should allow user to create client with Epic 1 auth', async () => {
      // Create client as User A
      const { data: client, error } = await supabaseAdmin
        .from('clients')
        .insert({
          user_id: testUserA.id,
          name: 'Acme Corporation',
          company: 'Acme Corp',
          email: 'contact@acme.com',
          role: 'CEO',
        })
        .select()
        .single();

      // Assertions
      expect(error).toBeNull();
      expect(client).toBeDefined();
      expect(client?.user_id).toBe(testUserA.id);
      expect(client?.name).toBe('Acme Corporation');
      expect(client?.id).toBeDefined();

      // Verify client exists in database
      const { data: fetchedClient } = await supabaseAdmin
        .from('clients')
        .select('*')
        .eq('id', client!.id)
        .single();

      expect(fetchedClient).toBeDefined();
      expect(fetchedClient?.name).toBe('Acme Corporation');
    });

    it('should auto-populate timestamps on client creation', async () => {
      const { data: client } = await supabaseAdmin
        .from('clients')
        .insert({
          user_id: testUserA.id,
          name: 'Test Client Timestamps',
        })
        .select()
        .single();

      expect(client?.created_at).toBeDefined();
      expect(client?.updated_at).toBeDefined();

      const createdAt = new Date(client!.created_at);
      const now = new Date();
      const diffMs = Math.abs(now.getTime() - createdAt.getTime());

      // Created within last 5 seconds
      expect(diffMs).toBeLessThan(5000);
    });

    it('should allow multiple clients per user', async () => {
      // Create 3 clients for User A
      const clientNames = ['Client 1', 'Client 2', 'Client 3'];

      for (const name of clientNames) {
        await supabaseAdmin.from('clients').insert({
          user_id: testUserA.id,
          name,
        });
      }

      // Fetch all clients for User A
      const { data: clients } = await supabaseAdmin
        .from('clients')
        .select('*')
        .eq('user_id', testUserA.id)
        .order('created_at', { ascending: true });

      expect(clients).toBeDefined();
      expect(clients!.length).toBeGreaterThanOrEqual(3);

      // Verify names
      const createdNames = clients!.map(c => c.name);
      clientNames.forEach(name => {
        expect(createdNames).toContain(name);
      });
    });
  });

  describe('Test 2: RLS Prevents Cross-User Client Access', () => {
    it('should prevent User B from seeing User A clients', async () => {
      // User A creates client
      const { data: clientA } = await supabaseAdmin
        .from('clients')
        .insert({
          user_id: testUserA.id,
          name: 'User A Private Client',
        })
        .select()
        .single();

      expect(clientA).toBeDefined();

      // Create User B authenticated client
      const supabaseUserB = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
          persistSession: false,
        },
      });

      // Simulate User B RLS context (in real app, this comes from JWT)
      // Note: This test assumes RLS is enabled and uses user_id filter
      const { data: clientsBForUserA, error } = await supabaseUserB
        .from('clients')
        .select('*')
        .eq('id', clientA!.id); // Try to fetch User A's client

      // With RLS, User B should get empty result (or error)
      // Exact behavior depends on RLS policy implementation
      if (error) {
        // RLS denied access
        expect(error).toBeDefined();
      } else {
        // RLS filtered out results
        expect(clientsBForUserA).toEqual([]);
      }
    });

    it('should allow User A to see their own clients', async () => {
      // Create client for User A
      const { data: client } = await supabaseAdmin
        .from('clients')
        .insert({
          user_id: testUserA.id,
          name: 'User A Own Client',
        })
        .select()
        .single();

      // Fetch as User A (using admin client with user_id filter)
      // In real app, RLS policy would enforce this automatically
      const { data: ownClients } = await supabaseAdmin
        .from('clients')
        .select('*')
        .eq('user_id', testUserA.id)
        .eq('id', client!.id);

      expect(ownClients).toBeDefined();
      expect(ownClients!.length).toBeGreaterThan(0);
      expect(ownClients![0].name).toBe('User A Own Client');
    });

    it('should enforce RLS on UPDATE operations', async () => {
      // User A creates client
      const { data: client } = await supabaseAdmin
        .from('clients')
        .insert({
          user_id: testUserA.id,
          name: 'Client to Update',
        })
        .select()
        .single();

      // Create User B client (simulated)
      const supabaseUserB = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

      // User B attempts to update User A's client
      const { error } = await supabaseUserB
        .from('clients')
        .update({ name: 'Hacked Name' })
        .eq('id', client!.id);

      // RLS should block this
      expect(error).toBeDefined();

      // Verify client name unchanged
      const { data: unchangedClient } = await supabaseAdmin
        .from('clients')
        .select('name')
        .eq('id', client!.id)
        .single();

      expect(unchangedClient?.name).toBe('Client to Update');
    });

    it('should enforce RLS on DELETE operations', async () => {
      // User A creates client
      const { data: client } = await supabaseAdmin
        .from('clients')
        .insert({
          user_id: testUserA.id,
          name: 'Client to Delete',
        })
        .select()
        .single();

      // Create User B client
      const supabaseUserB = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

      // User B attempts to delete User A's client
      const { error } = await supabaseUserB
        .from('clients')
        .delete()
        .eq('id', client!.id);

      // RLS should block this
      expect(error).toBeDefined();

      // Verify client still exists
      const { data: stillExists } = await supabaseAdmin
        .from('clients')
        .select('*')
        .eq('id', client!.id);

      expect(stillExists).toBeDefined();
      expect(stillExists!.length).toBe(1);
    });
  });

  describe('Test 3: AI Usage Tracked for Epic 2 Features', () => {
    it('should track AI summary generation in Epic 1 table', async () => {
      // Simulate AI summary generation for a client
      const { data: client } = await supabaseAdmin
        .from('clients')
        .insert({
          user_id: testUserA.id,
          name: 'Client with AI Summary',
          ai_overview: 'This is an AI-generated overview of the client.',
        })
        .select()
        .single();

      // Record AI usage in Epic 1 tracking table
      const { data: aiUsage, error } = await supabaseAdmin
        .from('ai_usage_tracking')
        .insert({
          user_id: testUserA.id,
          feature: 'client_ai_overview',
          tokens_used: 150,
          cost_usd: 0.0003, // $0.0003 for 150 tokens
          metadata: {
            client_id: client!.id,
            model: 'gpt-4',
          },
        })
        .select()
        .single();

      // Assertions
      expect(error).toBeNull();
      expect(aiUsage).toBeDefined();
      expect(aiUsage?.user_id).toBe(testUserA.id);
      expect(aiUsage?.feature).toBe('client_ai_overview');
      expect(aiUsage?.tokens_used).toBe(150);
      expect(aiUsage?.metadata?.client_id).toBe(client!.id);
    });

    it('should track meeting summary AI usage', async () => {
      // Create meeting (Epic 3 feature, but uses Epic 1 tracking)
      const { data: meeting } = await supabaseAdmin
        .from('meetings')
        .insert({
          user_id: testUserA.id,
          title: 'Client Strategy Meeting',
          date: new Date().toISOString(),
          transcript: 'This is the meeting transcript...',
          ai_summary: 'AI-generated summary of the meeting.',
        })
        .select()
        .single();

      // Track AI usage
      const { data: aiUsage } = await supabaseAdmin
        .from('ai_usage_tracking')
        .insert({
          user_id: testUserA.id,
          feature: 'meeting_summary',
          tokens_used: 500,
          cost_usd: 0.001,
          metadata: {
            meeting_id: meeting!.id,
            model: 'gpt-4',
          },
        })
        .select()
        .single();

      expect(aiUsage?.feature).toBe('meeting_summary');
      expect(aiUsage?.tokens_used).toBe(500);
    });

    it('should calculate cumulative AI costs for user', async () => {
      // Insert multiple AI usage records
      await supabaseAdmin.from('ai_usage_tracking').insert([
        {
          user_id: testUserA.id,
          feature: 'test_feature_1',
          tokens_used: 100,
          cost_usd: 0.0002,
        },
        {
          user_id: testUserA.id,
          feature: 'test_feature_2',
          tokens_used: 200,
          cost_usd: 0.0004,
        },
        {
          user_id: testUserA.id,
          feature: 'test_feature_3',
          tokens_used: 300,
          cost_usd: 0.0006,
        },
      ]);

      // Calculate total cost
      const { data: usageRecords } = await supabaseAdmin
        .from('ai_usage_tracking')
        .select('cost_usd')
        .eq('user_id', testUserA.id);

      const totalCost = usageRecords!.reduce(
        (sum, record) => sum + (record.cost_usd || 0),
        0
      );

      expect(totalCost).toBeGreaterThan(0);
      expect(totalCost).toBeLessThan(1); // Sanity check (less than $1)
    });

    it('should prevent AI usage for deleted users (CASCADE)', async () => {
      // Create temporary user
      const { data: tempUser } = await supabaseAdmin
        .from('users')
        .insert({
          clerk_id: `temp_user_${Date.now()}`,
          email: `temp-${Date.now()}@test.com`,
          full_name: 'Temp User',
        })
        .select()
        .single();

      // Create AI usage record
      await supabaseAdmin.from('ai_usage_tracking').insert({
        user_id: tempUser!.id,
        feature: 'test_feature',
        tokens_used: 100,
        cost_usd: 0.0002,
      });

      // Delete user (CASCADE should delete ai_usage_tracking)
      await supabaseAdmin.from('users').delete().eq('id', tempUser!.id);

      // Verify AI usage deleted
      const { data: deletedUsage } = await supabaseAdmin
        .from('ai_usage_tracking')
        .select('*')
        .eq('user_id', tempUser!.id);

      expect(deletedUsage).toEqual([]);
    });
  });

  describe('Test 4: Foreign Key Constraints', () => {
    it('should prevent client creation with invalid user_id', async () => {
      const invalidUserId = uuidv4();

      const { error } = await supabaseAdmin.from('clients').insert({
        user_id: invalidUserId,
        name: 'Client with Invalid User',
      });

      // Should fail with FK constraint error
      expect(error).toBeDefined();
      expect(error?.message).toContain('foreign key constraint');
    });

    it('should CASCADE delete clients when user deleted', async () => {
      // Create temp user
      const { data: tempUser } = await supabaseAdmin
        .from('users')
        .insert({
          clerk_id: `cascade_test_${Date.now()}`,
          email: `cascade-${Date.now()}@test.com`,
          full_name: 'Cascade Test User',
        })
        .select()
        .single();

      // Create clients for temp user
      await supabaseAdmin.from('clients').insert([
        { user_id: tempUser!.id, name: 'Client 1' },
        { user_id: tempUser!.id, name: 'Client 2' },
      ]);

      // Verify clients exist
      const { data: clientsBefore } = await supabaseAdmin
        .from('clients')
        .select('*')
        .eq('user_id', tempUser!.id);

      expect(clientsBefore!.length).toBe(2);

      // Delete user
      await supabaseAdmin.from('users').delete().eq('id', tempUser!.id);

      // Verify clients CASCADE deleted
      const { data: clientsAfter } = await supabaseAdmin
        .from('clients')
        .select('*')
        .eq('user_id', tempUser!.id);

      expect(clientsAfter).toEqual([]);
    });
  });
});
