import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Fetch batch
    const { data: batch, error: batchError } = await supabase
      .from('batches')
      .select('*')
      .eq('id', id)
      .single();

    if (batchError || !batch) {
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
    }

    // Fetch screenshots if completed
    let screenshots: any[] = [];
    if (batch.status === 'completed') {
      const { data: ss, error: ssError } = await supabase
        .from('screenshots')
        .select('*')
        .eq('batch_id', id)
        .order('position', { ascending: true });
      
      if (!ssError) {
        screenshots = ss || [];
      }
    }

    return NextResponse.json({
      status: batch.status,
      errorMessage: batch.error_message,
      screenshots,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
