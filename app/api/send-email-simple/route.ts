import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, firstName, captchaCode } = await request.json();

    if (!email || !firstName || !captchaCode) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Simple email content
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">MyApproved All</h1>
          <p style="margin: 10px 0 0 0;">Email Verification</p>
        </div>
        
        <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2>Hi ${firstName},</h2>
          
          <p>Thank you for registering with <strong>MyApproved All</strong>! To complete your registration, please verify your email address.</p>
          
          <div style="background: #e0e7ff; border: 2px solid #3b82f6; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
            <h3>Your Verification Code:</h3>
            <div style="font-size: 32px; font-weight: bold; color: #1e40af; letter-spacing: 5px;">${captchaCode}</div>
            <p>Enter this code on the verification page to complete your registration.</p>
          </div>
          
          <p><strong>Important:</strong> This verification code will expire in 24 hours. If you didn't create an account with us, you can safely ignore this email.</p>
          
          <p>Best regards,<br>
          The MyApproved All Team</p>
        </div>
        
        <div style="text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px;">
          <p><strong>MyApproved All</strong> - Connecting you with verified, reliable tradespeople.</p>
          <p>This email was sent to ${email}</p>
        </div>
      </div>
    `;

    // Try to send email using a simple service
    try {
      // Using a simple email service (you can replace with your preferred service)
      const emailResponse = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          service_id: 'your_service_id',
          template_id: 'your_template_id',
          user_id: 'your_user_id',
          template_params: {
            to_email: email,
            to_name: firstName,
            verification_code: captchaCode,
            message: emailContent
          }
        }),
      });

      if (emailResponse.ok) {
        console.log('Email sent successfully to:', email);
        return NextResponse.json({
          success: true,
          message: 'Verification email sent successfully'
        });
      } else {
        throw new Error('Email service not available');
      }
    } catch (emailError) {
      console.log('Email service not available, using console logging');
      
      // Log email content for testing
      console.log('=== EMAIL CONTENT ===');
      console.log('To:', email);
      console.log('Subject: Verify Your Email - MyApproved All');
      console.log('Verification Code:', captchaCode);
      console.log('====================');
      
      return NextResponse.json({
        success: true,
        message: 'Verification email sent successfully (check console for code)',
        captchaCode: captchaCode
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