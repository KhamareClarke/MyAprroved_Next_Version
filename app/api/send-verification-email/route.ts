import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

// Initialize Supabase client for API routes
const supabase = createClient(
  'https://jismdkfjkngwbpddhomx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imppc21ka2Zqa25nd2JwZGRob214Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5Mzc2MzksImV4cCI6MjA2ODUxMzYzOX0.1pK4G-Mu5v8lSdDJUAsPsoDAlK9d7ocFaUH9dd2vl3A'
);



export async function POST(request: NextRequest) {
  try {
    const { email, firstName, token } = await request.json();

    if (!email || !firstName || !token) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate a simple captcha code (3 digits)
    const captchaCode = Math.floor(100 + Math.random() * 900).toString();
    
    // Store verification data in Supabase (with error handling)
    try {
      const { error: updateError } = await supabase
        .from('clients')
        .update({ 
          verification_token: token,
          verification_sent_at: new Date().toISOString()
        })
        .eq('email', email);

      if (updateError) {
        console.error('Error storing verification data:', updateError);
        // Continue anyway - we'll still send the email
      }

      // Try to update captcha_code if the column exists
      try {
        await supabase
          .from('clients')
          .update({ captcha_code: captchaCode })
          .eq('email', email);
      } catch (captchaError) {
        console.log('Captcha code column not available yet:', captchaError);
        // Continue without captcha code for now
      }
    } catch (dbError) {
      console.error('Database error:', dbError);
      // Continue anyway - we'll still send the email
    }

    // Email content with My Approved branding (using working format)
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #2563eb; color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0;">My Approved</h1>
          <p>Email Verification</p>
        </div>
        
        <div style="background: #f8fafc; padding: 30px;">
          <h2>Hi ${firstName},</h2>
          <p>Thank you for registering with <strong>My Approved</strong>! To complete your registration, please verify your email address.</p>
          
          <h3>Your Verification Code:</h3>
          <div style="background: #e0e7ff; border: 2px solid #3b82f6; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
            <div style="font-size: 32px; font-weight: bold; color: #1e40af;">${captchaCode}</div>
          </div>
          <p>Enter this code on the verification page to complete your registration.</p>
          
          <p><strong>Important:</strong> This verification code will expire in 24 hours. If you didn't create an account with us, you can safely ignore this email.</p>
          
          <p>Best regards,<br>
          The My Approved Team</p>
        </div>
        
        <div style="text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px;">
          <p><strong>My Approved</strong> - Connecting you with verified, reliable tradespeople.</p>
          <p>This email was sent to ${email}</p>
        </div>
      </div>
    `;

    // Send real email using Gmail SMTP
    try {
      // Create transporter with Gmail
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'sajidasaif93@gmail.com',
          pass: 'tsus gznu cyya xnna'
        }
      });

      // Email options
      const mailOptions = {
        from: '"My Approved" <sajidasaif93@gmail.com>',
        to: email,
        subject: 'Verify Your Email - My Approved',
        html: emailContent
      };

      // Send email
      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent successfully to:', email);
      
      // Store verification code in database
      try {
        await supabase
          .from('clients')
          .update({ captcha_code: captchaCode })
          .eq('email', email);
      } catch (dbError) {
        console.log('Could not store captcha code:', dbError);
      }
      
      return NextResponse.json({
        success: true,
        message: 'Verification email sent successfully'
      });

    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      
      return NextResponse.json({
        success: false,
        error: 'Failed to send verification email. Please try again.'
      });
    }

  } catch (error) {
    console.error('Error sending verification email:', error);
    return NextResponse.json(
      { error: 'Failed to send verification email' },
      { status: 500 }
    );
  }
} 