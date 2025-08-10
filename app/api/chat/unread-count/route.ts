import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const userType = searchParams.get('userType');

    if (!userId || !userType) {
      return NextResponse.json({ error: 'Missing userId or userType' }, { status: 400 });
    }

    const supabase = createClient();

    // Check if chat_rooms table exists first
    const { data: tableCheck, error: tableError } = await supabase
      .from('chat_rooms')
      .select('id')
      .limit(1);

    if (tableError) {
      console.log('Chat rooms table not found, returning 0 unread count');
      return NextResponse.json({ unreadCount: 0 });
    }

    // Get chat rooms for this user
    const { data: chatRooms, error: roomsError } = await supabase
      .from('chat_rooms')
      .select('id')
      .or(`client_id.eq.${userId},tradesperson_id.eq.${userId}`);

    if (roomsError) {
      console.error('Error fetching chat rooms:', roomsError);
      return NextResponse.json({ error: 'Failed to fetch chat rooms' }, { status: 500 });
    }

    if (!chatRooms || chatRooms.length === 0) {
      return NextResponse.json({ unreadCount: 0 });
    }

    const roomIds = chatRooms.map(room => room.id);

    // Get unread messages count
    const { count, error: countError } = await supabase
      .from('chat_messages')
      .select('*', { count: 'exact', head: true })
      .in('chat_room_id', roomIds)
      .neq('sender_id', userId)
      .eq('is_read', false);

    if (countError) {
      console.error('Error fetching unread count:', countError);
      return NextResponse.json({ error: 'Failed to fetch unread count' }, { status: 500 });
    }

    return NextResponse.json({ unreadCount: count || 0 });

  } catch (error) {
    console.error('Error in unread count API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 