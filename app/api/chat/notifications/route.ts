import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  'https://jismdkfjkngwbpddhomx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imppc21ka2Zqa25nd2JwZGRob214Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5Mzc2MzksImV4cCI6MjA2ODUxMzYzOX0.1pK4G-Mu5v8lSdDJUAsPsoDAlK9d7ocFaUH9dd2vl3A'
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const userType = searchParams.get('userType');

    if (!userId || !userType) {
      return NextResponse.json({ error: 'Missing userId or userType' }, { status: 400 });
    }

    // Set up Server-Sent Events
    const stream = new ReadableStream({
      start(controller) {
        const sendEvent = (data: any) => {
          controller.enqueue(`data: ${JSON.stringify(data)}\n\n`);
        };

        // Send initial connection message
        sendEvent({ type: 'connected', message: 'Connected to chat notifications' });

        // Set up real-time subscription to chat notifications
        const subscription = supabaseAdmin
          .channel('chat_notifications')
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'chat_notifications',
              filter: `user_id=eq.${userId}`
            },
            (payload) => {
              sendEvent({
                type: 'new_message',
                data: payload.new
              });
            }
          )
          .subscribe();

        // Keep connection alive
        const keepAlive = setInterval(() => {
          sendEvent({ type: 'ping' });
        }, 30000);

        // Cleanup on disconnect
        request.signal.addEventListener('abort', () => {
          clearInterval(keepAlive);
          subscription.unsubscribe();
          controller.close();
        });
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control'
      }
    });

  } catch (error) {
    console.error('Error in chat notifications API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Mark notifications as read
export async function POST(request: NextRequest) {
  try {
    const { notificationIds } = await request.json();

    if (!notificationIds || !Array.isArray(notificationIds)) {
      return NextResponse.json({ error: 'Missing notificationIds array' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('chat_notifications')
      .update({ is_read: true })
      .in('id', notificationIds);

    if (error) {
      console.error('Error marking notifications as read:', error);
      return NextResponse.json({ error: 'Failed to mark notifications as read' }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error in chat notifications POST API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 