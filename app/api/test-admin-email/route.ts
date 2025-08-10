import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    console.log('Testing admin email sending...');

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'sajidasaif93@gmail.com',
        pass: 'idsp lvmm vmcp iynp'
      }
    });

    const mailOptions = {
      from: 'My Approved <noreply@myapproved.co.uk>',
      to: 'fizasaif0233@gmail.com',
      subject: 'Test Email - Admin Notification',
      html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:20px;border:1px solid #eee;border-radius:8px;">
        <h2 style="color:#2d3748;">Test Email</h2>
        <p>This is a test email to verify that admin notifications are working.</p>
        <p>Time sent: ${new Date().toLocaleString()}</p>
        <p style="color:#888;font-size:0.9em;">&copy; My Approved</p>
      </div>`
    };

    console.log('Sending test email...');
    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result);

    return NextResponse.json({
      message: 'Test email sent successfully',
      messageId: result.messageId
    });

  } catch (error) {
    console.error('Error sending test email:', error);
    return NextResponse.json(
      { error: 'Failed to send test email', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 