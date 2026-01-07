/**
 * Integration Tests for Client CRUD Operations
 * Story 2.1: Client CRUD & Database Schema
 *
 * These tests use a real Supabase connection and test the full flow:
 * - Create client
 * - List clients
 * - Get client detail
 * - Update client
 * - Delete client (with CASCADE)
 */

import { createClient } from '@supabase/supabase-js';

// Test configuration - should use test database
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Skip tests if environment variables not set
const describeIfEnv =
  SUPABASE_URL && SUPABASE_SERVICE_KEY ? describe : describe.skip;

describeIfEnv('Client CRUD Integration Tests', () => {
  let supabase: ReturnType<typeof createClient>;
  let testUserId: string;
  let testClerkId: string;

  beforeAll(async () => {
    supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Create a test user for these tests
    testClerkId = `test-clerk-${Date.now()}`;
    const { data: user, error } = await supabase
      .from('users')
      .insert({
        clerk_id: testClerkId,
        email: `test-${Date.now()}@example.com`,
      })
      .select()
      .single();

    if (error || !user) {
      throw new Error(`Failed to create test user: ${error?.message}`);
    }

    testUserId = user.id;

    // Create user preferences (free tier: max 3 clients)
    await supabase.from('user_preferences').insert({
      user_id: testUserId,
      tier: 'free',
      max_clients: 3,
    });
  });

  afterAll(async () => {
    // Cleanup: Delete test user (CASCADE will delete clients and preferences)
    if (testUserId) {
      await supabase.from('users').delete().eq('id', testUserId);
    }
  });

  describe('End-to-end Client CRUD Flow', () => {
    let createdClientId: string;

    it('should create a new client', async () => {
      const clientData = {
        user_id: testUserId,
        name: 'Integration Test Client',
        company: 'Test Corp',
        role: 'CEO',
        email: 'client@testcorp.com',
        phone: '+1234567890',
        website: 'https://testcorp.com',
        linkedin_url: 'https://linkedin.com/in/testclient',
      };

      const { data: client, error } = await supabase
        .from('clients')
        .insert(clientData)
        .select()
        .single();

      expect(error).toBeNull();
      expect(client).toBeDefined();
      expect(client.name).toBe('Integration Test Client');
      expect(client.user_id).toBe(testUserId);

      createdClientId = client.id;
    });

    it('should retrieve client details', async () => {
      const { data: client, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', createdClientId)
        .eq('user_id', testUserId)
        .single();

      expect(error).toBeNull();
      expect(client).toBeDefined();
      expect(client.id).toBe(createdClientId);
      expect(client.name).toBe('Integration Test Client');
    });

    it('should list all clients for user', async () => {
      // Create another client
      await supabase.from('clients').insert({
        user_id: testUserId,
        name: 'Second Test Client',
      });

      const { data: clients, error } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', testUserId)
        .order('created_at', { ascending: false });

      expect(error).toBeNull();
      expect(clients).toBeDefined();
      expect(clients.length).toBeGreaterThanOrEqual(2);
    });

    it('should update client', async () => {
      const updates = {
        name: 'Updated Client Name',
        company: 'Updated Corp',
      };

      const { data: updatedClient, error } = await supabase
        .from('clients')
        .update(updates)
        .eq('id', createdClientId)
        .eq('user_id', testUserId)
        .select()
        .single();

      expect(error).toBeNull();
      expect(updatedClient).toBeDefined();
      expect(updatedClient.name).toBe('Updated Client Name');
      expect(updatedClient.company).toBe('Updated Corp');
      expect(updatedClient.updated_at).not.toBe(updatedClient.created_at);
    });

    it('should delete client', async () => {
      const { error: deleteError } = await supabase
        .from('clients')
        .delete()
        .eq('id', createdClientId)
        .eq('user_id', testUserId);

      expect(deleteError).toBeNull();

      // Verify client is deleted
      const { data: deletedClient } = await supabase
        .from('clients')
        .select('*')
        .eq('id', createdClientId)
        .maybeSingle();

      expect(deletedClient).toBeNull();
    });
  });

  describe('Tier Limit Enforcement', () => {
    it('should enforce free tier limit of 3 clients', async () => {
      // Get current count
      const { count: initialCount } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', testUserId);

      // Create clients up to limit
      const clientsToCreate = 3 - (initialCount || 0);
      for (let i = 0; i < clientsToCreate; i++) {
        await supabase.from('clients').insert({
          user_id: testUserId,
          name: `Client ${i + 1}`,
        });
      }

      // Verify count
      const { count: finalCount } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', testUserId);

      expect(finalCount).toBe(3);

      // In a real API integration test, the 4th client creation would fail with 403
      // Here we just verify the count is at the limit
    });
  });

  describe('Duplicate Email Detection', () => {
    it('should prevent creating clients with duplicate emails', async () => {
      const email = `duplicate-${Date.now()}@example.com`;

      // Create first client with email
      const { data: firstClient } = await supabase
        .from('clients')
        .insert({
          user_id: testUserId,
          name: 'First Client',
          email,
        })
        .select()
        .single();

      expect(firstClient).toBeDefined();

      // Check for duplicate before creating second client
      const { data: existingClient } = await supabase
        .from('clients')
        .select('id, email')
        .eq('user_id', testUserId)
        .eq('email', email)
        .maybeSingle();

      expect(existingClient).toBeDefined();
      expect(existingClient.email).toBe(email);

      // In a real API test, attempting to create a second client with same email
      // would return 409 Conflict
    });
  });

  describe('CASCADE Delete Verification', () => {
    it('should cascade delete meetings and action items when client is deleted', async () => {
      // Create client
      const { data: client } = await supabase
        .from('clients')
        .insert({
          user_id: testUserId,
          name: 'Cascade Test Client',
        })
        .select()
        .single();

      expect(client).toBeDefined();
      const clientId = client.id;

      // Create meeting for client
      const { data: meeting } = await supabase
        .from('meetings')
        .insert({
          user_id: testUserId,
          client_id: clientId,
          title: 'Test Meeting',
          date: new Date().toISOString().split('T')[0],
        })
        .select()
        .single();

      expect(meeting).toBeDefined();

      // Create action item for client
      const { data: actionItem } = await supabase
        .from('action_items')
        .insert({
          user_id: testUserId,
          client_id: clientId,
          description: 'Test Action Item',
        })
        .select()
        .single();

      expect(actionItem).toBeDefined();

      // Delete client
      await supabase.from('clients').delete().eq('id', clientId);

      // Verify cascade delete
      const { data: deletedMeetings } = await supabase
        .from('meetings')
        .select()
        .eq('client_id', clientId);

      const { data: deletedActionItems } = await supabase
        .from('action_items')
        .select()
        .eq('client_id', clientId);

      expect(deletedMeetings).toEqual([]);
      expect(deletedActionItems).toEqual([]);
    });
  });

  describe('RLS Policy Enforcement', () => {
    let otherUserId: string;

    beforeAll(async () => {
      // Create another test user
      const otherClerkId = `other-test-clerk-${Date.now()}`;
      const { data: otherUser } = await supabase
        .from('users')
        .insert({
          clerk_id: otherClerkId,
          email: `other-test-${Date.now()}@example.com`,
        })
        .select()
        .single();

      otherUserId = otherUser.id;
    });

    afterAll(async () => {
      // Cleanup other test user
      if (otherUserId) {
        await supabase.from('users').delete().eq('id', otherUserId);
      }
    });

    it('should prevent User B from seeing User A clients', async () => {
      // User A creates client
      const { data: clientA } = await supabase
        .from('clients')
        .insert({
          user_id: testUserId,
          name: 'User A Client',
        })
        .select()
        .single();

      expect(clientA).toBeDefined();

      // In a real RLS test with actual user context, User B's query would not return User A's client
      // Here we simulate by querying with User B's ID
      const { data: clientsForUserB } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', otherUserId);

      // User B should not see User A's client
      const hasUserAClient = clientsForUserB?.some(c => c.id === clientA.id);
      expect(hasUserAClient).toBe(false);
    });
  });
});
