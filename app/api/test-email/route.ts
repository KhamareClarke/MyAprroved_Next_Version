import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json();

    console.log('Attempting to send email to:', email);

    // Create transporter with Gmail
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'sajidasaif93@gmail.com',
        pass: 'tsus gznu cyya xnna'
      }
    });

    // Simple email content
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #2563eb; color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0;">My Approved</h1>
          <p>Email Verification</p>
        </div>
        
        <div style="background: #f8fafc; padding: 30px;">
          <h2>Your Verification Code:</h2>
          <div style="background: #e0e7ff; border: 2px solid #3b82f6; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
            <div style="font-size: 32px; font-weight: bold; color: #1e40af;">${code}</div>
          </div>
          <p>Enter this code on the verification page to complete your registration.</p>
        </div>
      </div>
    `;

    // Email options
    const mailOptions = {
      from: '"My Approved" <sajidasaif93@gmail.com>',
      to: email,
      subject: 'Test Email - My Approved',
      html: emailContent
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    
    return NextResponse.json({
      success: true,
      message: 'Test email sent successfully',
      messageId: info.messageId
    });

  } catch (error: any) {
    console.error('Email sending failed:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to send email',
      details: error?.message || 'Unknown error'
    }, { status: 500 });
  }
} 