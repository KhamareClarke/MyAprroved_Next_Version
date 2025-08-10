import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    console.log('Testing simple email sending...');

    // Try different Gmail configurations
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: 'sajidasaif93@gmail.com',
        pass: 'idsp lvmm vmcp iynp'
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    // Verify connection configuration
    console.log('Verifying connection...');
    await transporter.verify();
    console.log('Connection verified successfully');

    const mailOptions = {
      from: 'sajidasaif93@gmail.com',
      to: 'fizasaif0233@gmail.com',
      subject: 'Simple Test Email',
      text: 'This is a simple test email to verify SMTP configuration.',
      html: '<p>This is a simple test email to verify SMTP configuration.</p>'
    };

    console.log('Sending test email...');
    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result);

    return NextResponse.json({
      message: 'Test email sent successfully',
      messageId: result.messageId,
      response: result.response
    });

  } catch (error) {
    console.error('Error in simple email test:', error);
    
    // Provide detailed error information
    let errorMessage = 'Unknown error';
    if (error instanceof Error) {
      errorMessage = error.message;
      console.error('Error stack:', error.stack);
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to send test email', 
        details: errorMessage,
        type: error instanceof Error ? error.constructor.name : 'Unknown'
      },
      { status: 500 }
    );
  }
} 