import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

const supabaseAdmin = createClient(
  'https://jismdkfjkngwbpddhomx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imppc21ka2Zqa25nd2JwZGRob214Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5Mzc2MzksImV4cCI6MjA2ODUxMzYzOX0.1pK4G-Mu5v8lSdDJUAsPsoDAlK9d7ocFaUH9dd2vl3A'
);

// GET messages for a chat room
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const chatRoomId = searchParams.get('chatRoomId');

    if (!chatRoomId) {
      return NextResponse.json({ error: 'Missing chatRoomId' }, { status: 400 });
    }

    const { data: messages, error } = await supabaseAdmin
      .from('chat_messages')
      .select('*')
      .eq('chat_room_id', chatRoomId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
    }

    return NextResponse.json({ messages: messages || [] });

  } catch (error) {
    console.error('Error in chat messages GET API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST new message
export async function POST(request: NextRequest) {
  try {
    const { chatRoomId, senderId, senderType, messageText } = await request.json();

    if (!chatRoomId || !senderId || !senderType || !messageText) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Insert the message
    const { data: message, error: insertError } = await supabaseAdmin
      .from('chat_messages')
      .insert({
        chat_room_id: chatRoomId,
        sender_id: senderId,
        sender_type: senderType,
        message_text: messageText
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting message:', insertError);
      return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
    }

    // Update chat room's updated_at timestamp
    await supabaseAdmin
      .from('chat_rooms')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', chatRoomId);

    // Get chat room details and recipient information
    const { data: chatRoom } = await supabaseAdmin
      .from('chat_rooms')
      .select(`
        *,
        jobs (
          trade,
          job_description,
          postcode
        ),
        clients (
          first_name,
          last_name,
          email
        ),
        tradespeople (
          first_name,
          last_name,
          email
        )
      `)
      .eq('id', chatRoomId)
      .single();

    if (chatRoom) {
      // Determine recipient information
      const recipientEmail = senderType === 'client' 
        ? chatRoom.tradespeople?.email 
        : chatRoom.clients?.email;
      
      const recipientName = senderType === 'client'
        ? `${chatRoom.tradespeople?.first_name} ${chatRoom.tradespeople?.last_name}`
        : `${chatRoom.clients?.first_name} ${chatRoom.clients?.last_name}`;
      
      const senderName = senderType === 'client'
        ? `${chatRoom.clients?.first_name} ${chatRoom.clients?.last_name}`
        : `${chatRoom.tradespeople?.first_name} ${chatRoom.tradespeople?.last_name}`;

      // Send email notification to recipient (non-blocking)
      setTimeout(async () => {
        try {
          const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: 'sajidasaif93@gmail.com',
              pass: 'idsp lvmm vmcp iynp'
            }
          });

          const mailOptions = {
            from: 'My Approved <noreply@myapproved.co.uk>',
            to: recipientEmail,
            subject: `New Message from ${senderName} - My Approved`,
            html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:20px;border:1px solid #eee;border-radius:8px;">
              <div style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:white;padding:20px;border-radius:8px 8px 0 0;text-align:center;">
                <h1 style="margin:0;font-size:24px;">My Approved</h1>
                <p style="margin:5px 0 0 0;opacity:0.9;">Professional Communication Platform</p>
              </div>
              
              <div style="padding:20px;">
                <h2 style="color:#2d3748;margin-top:0;">New Message Received</h2>
                <p>Hello ${recipientName},</p>
                <p>You have received a new message from <strong>${senderName}</strong> regarding your job.</p>
                
                <div style="background-color:#f7fafc;padding:16px;border-radius:8px;margin:16px 0;border-left:4px solid #4299e1;">
                  <h3 style="margin-top:0;color:#2d3748;">Job Details:</h3>
                  <p><strong>Trade:</strong> ${chatRoom.jobs?.trade}</p>
                  <p><strong>Description:</strong> ${chatRoom.jobs?.job_description}</p>
                  <p><strong>Location:</strong> ${chatRoom.jobs?.postcode}</p>
                </div>
                
                <div style="background-color:#fff5f5;padding:16px;border-radius:8px;margin:16px 0;border-left:4px solid #f56565;">
                  <h4 style="margin-top:0;color:#c53030;">🔒 Security Notice</h4>
                  <p style="margin:0;font-size:14px;color:#c53030;">
                    Please do not share personal information, contact details, or financial information in chat messages. 
                    Use the platform's secure contact methods instead.
                  </p>
                </div>
                
                <div style="text-align:center;margin:20px 0;">
                  <a href="http://localhost:3000/dashboard/${senderType === 'client' ? 'tradesperson' : 'client'}" 
                     style="background-color:#4299e1;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block;">
                    📬 Check Your Messages
                  </a>
                </div>
                
                <p style="color:#666;font-size:14px;margin-top:20px;">
                  This is an automated notification from My Approved. Please log in to your dashboard to view and respond to the message.
                </p>
              </div>
              
              <div style="background-color:#f7fafc;padding:16px;border-radius:0 0 8px 8px;text-align:center;border-top:1px solid #e2e8f0;">
                <p style="margin:0;color:#666;font-size:12px;">
                  © 2024 My Approved. All rights reserved.
                </p>
              </div>
            </div>`
          };

          await transporter.sendMail(mailOptions);
          console.log(`Email notification sent to ${recipientEmail}`);
        } catch (emailError) {
          console.error('Failed to send email notification:', emailError);
        }
      }, 100);
    }

    return NextResponse.json({ message });

  } catch (error) {
    console.error('Error in chat messages POST API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 