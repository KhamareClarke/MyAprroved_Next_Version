export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = 'https://jismdkfjkngwbpddhomx.supabase.co';
    const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imppc21ka2Zqa25nd2JwZGRob214Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5Mzc2MzksImV4cCI6MjA2ODUxMzYzOX0.1pK4G-Mu5v8lSdDJUAsPsoDAlK9d7ocFaUH9dd2vl3A';
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || anonKey;
    
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const body = await request.json();
    const { quoteId, action, clientId: clientIdFromBody } = body; // action: 'approve' or 'reject'

    if (!quoteId || !action) {
      return NextResponse.json(
        { success: false, error: 'Quote ID and action are required' },
        { status: 400 }
      );
    }

    // Fetch quote
    const { data: quote, error: quoteErr } = await supabase
      .from('quotes')
      .select('id, quote_request_id, tradesperson_id, quote_amount')
      .eq('id', quoteId)
      .single();

    if (quoteErr || !quote) {
      return NextResponse.json(
        { success: false, error: 'Quote not found', details: quoteErr?.message },
        { status: 404 }
      );
    }

    if (action === 'approve') {
      // Update quote and request
      const { error: updateQuoteErr } = await supabase
        .from('quotes')
        .update({ status: 'client_approved' })
        .eq('id', quoteId);
      if (updateQuoteErr) {
        return NextResponse.json({ success: false, error: 'Failed to approve quote', details: updateQuoteErr.message }, { status: 500 });
      }

      const { data: requestRow, error: updateReqErr } = await supabase
        .from('quote_requests')
        .update({ status: 'client_approved', client_approved: true, chat_enabled: true })
        .eq('id', quote.quote_request_id)
        .select('id, customer_email, tradesperson_id')
        .single();
      if (updateReqErr) {
        console.error('Failed to update quote_request:', updateReqErr);
      }

      // Create chat room if schema exists, using client UUID
      try {
        const clientId = clientIdFromBody || null;
        if (clientId) {
          await supabase
            .from('chat_rooms')
            .insert({
              client_id: clientId,
              tradesperson_id: quote.tradesperson_id,
              is_active: true
            });
        } else {
          console.warn('Client ID not provided for chat room creation');
        }
      } catch (roomErr) {
        console.error('Chat room creation failed:', roomErr);
      }

      // Email tradesperson best-effort
      try {
        const { data: tp } = await supabase
          .from('tradespeople')
          .select('first_name, last_name, email')
          .eq('id', quote.tradesperson_id)
          .single();
        if (tp?.email) {
          const nodemailer = require('nodemailer');
          const transporter = nodemailer.createTransport({ service: 'gmail', auth: { user: 'myapproved2024@gmail.com', pass: 'qjqj qjqj qjqj qjqj' } });
          await transporter.sendMail({
            from: '"My Approved" <myapproved2024@gmail.com>',
            to: tp.email,
            subject: 'Quote Approved - Chat Enabled!',
            html: `<p>Hello ${(tp.first_name || '') + ' ' + (tp.last_name || '')}, your quote (£${quote.quote_amount}) has been approved. Chat is now enabled.</p>`
          });
        }
      } catch {}

      return NextResponse.json({ success: true, status: 'client_approved', chatEnabled: true });
    }

    if (action === 'reject') {
      const { error: updateQuoteErr } = await supabase
        .from('quotes')
        .update({ status: 'client_rejected' })
        .eq('id', quoteId);
      if (updateQuoteErr) {
        return NextResponse.json({ success: false, error: 'Failed to reject quote', details: updateQuoteErr.message }, { status: 500 });
      }
      return NextResponse.json({ success: true, status: 'client_rejected' });
    }

    return NextResponse.json({ success: false, error: 'Invalid action. Use "approve" or "reject".' }, { status: 400 });

  } catch (error: any) {
    console.error('Error in client approve quote API:', error);
    return NextResponse.json({ success: false, error: `Internal server error: ${error.message}` }, { status: 500 });
  }
} 