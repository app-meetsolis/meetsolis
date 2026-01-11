import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { ClientCreateSchema } from '@meetsolis/shared/schemas/client';

export async function GET() {
  const results: any[] = [];

  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user_id
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', clerkUserId)
      .single();

    const userId = user?.id;
    results.push({ step: 'User lookup', userId, success: !!userId });

    if (!userId) {
      return NextResponse.json({ results, error: 'User not found' });
    }

    // Test 1: Create client
    const clientData = {
      name: 'Test Client API',
      email: 'testapi@example.com',
      company: 'Test Co',
    };

    const validated = ClientCreateSchema.parse(clientData);
    results.push({ step: 'Validation', success: true });

    const { data: newClient, error: createError } = await supabase
      .from('clients')
      .insert({
        ...validated,
        user_id: userId,
      })
      .select()
      .single();

    if (createError) {
      results.push({
        step: 'Create client',
        success: false,
        error: createError.message,
      });
      return NextResponse.json({ results, error: createError.message });
    }

    results.push({
      step: 'Create client',
      success: true,
      clientId: newClient.id,
    });

    // Test 2: List clients
    const { data: clients, error: listError } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', userId);

    if (listError) {
      results.push({
        step: 'List clients',
        success: false,
        error: listError.message,
      });
    } else {
      results.push({
        step: 'List clients',
        success: true,
        count: clients.length,
      });
    }

    // Test 3: Update client
    const { error: updateError } = await supabase
      .from('clients')
      .update({ name: 'Test Client UPDATED' })
      .eq('id', newClient.id)
      .eq('user_id', userId);

    if (updateError) {
      results.push({
        step: 'Update client',
        success: false,
        error: updateError.message,
      });
    } else {
      results.push({ step: 'Update client', success: true });
    }

    // Test 4: Delete client
    const { error: deleteError } = await supabase
      .from('clients')
      .delete()
      .eq('id', newClient.id)
      .eq('user_id', userId);

    if (deleteError) {
      results.push({
        step: 'Delete client',
        success: false,
        error: deleteError.message,
      });
    } else {
      results.push({ step: 'Delete client', success: true });
    }

    const allPassed = results.every(r => r.success);
    return NextResponse.json({
      status: allPassed ? 'ALL_PASSED' : 'SOME_FAILED',
      results,
    });
  } catch (error: any) {
    results.push({
      step: 'Unexpected error',
      success: false,
      error: error.message,
    });
    return NextResponse.json({
      status: 'ERROR',
      results,
      error: error.message,
    });
  }
}
