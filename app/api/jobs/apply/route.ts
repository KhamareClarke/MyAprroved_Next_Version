import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const { jobId, tradespersonId, quotationAmount, quotationNotes } = await request.json();

    if (!jobId || !tradespersonId || !quotationAmount) {
      return NextResponse.json(
        { error: 'Missing required fields: jobId, tradespersonId, quotationAmount' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Get job details
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select(`
        *,
        clients (
          id,
          email,
          first_name,
          last_name
        )
      `)
      .eq('id', jobId)
      .single();

    if (jobError || !job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    // Check if job is still open
    if (job.application_status !== 'open') {
      return NextResponse.json(
        { error: 'Job is no longer accepting applications' },
        { status: 400 }
      );
    }

    // Get tradesperson details
    const { data: tradesperson, error: tradespersonError } = await supabase
      .from('tradespeople')
      .select('*')
      .eq('id', tradespersonId)
      .single();

    if (tradespersonError || !tradesperson) {
      return NextResponse.json(
        { error: 'Tradesperson not found' },
        { status: 404 }
      );
    }

    // Check if tradesperson already applied
    const { data: existingApplication } = await supabase
      .from('job_applications')
      .select('id')
      .eq('job_id', jobId)
      .eq('tradesperson_id', tradespersonId)
      .maybeSingle();

    if (existingApplication) {
      return NextResponse.json(
        { error: 'You have already applied to this job' },
        { status: 400 }
      );
    }

    // Create application
    const { data: application, error: applicationError } = await supabase
      .from('job_applications')
      .insert({
        job_id: jobId,
        tradesperson_id: tradespersonId,
        quotation_amount: parseFloat(quotationAmount),
        quotation_notes: quotationNotes || '',
        status: 'pending'
      })
      .select()
      .single();

    if (applicationError) {
      console.error('Error creating application:', applicationError);
      return NextResponse.json(
        { error: 'Failed to create application' },
        { status: 500 }
      );
    }

    // Note: Job remains in 'open' status until admin approves the quotation
    // The application is stored in job_applications table with 'pending' status

    // Send email notification to client (non-blocking)
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
          to: job.clients.email,
          subject: 'New Job Application - My Approved',
          html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:20px;border:1px solid #eee;border-radius:8px;">
            <h2 style="color:#2d3748;">New Job Application</h2>
            <p>Dear ${job.clients.first_name} ${job.clients.last_name},</p>
            <p>A tradesperson has applied to your job and provided a quotation.</p>
            <div style="background-color:#f7fafc;padding:16px;border-radius:8px;margin:16px 0;">
              <h3 style="margin-top:0;">Job Details:</h3>
              <p><strong>Trade:</strong> ${job.trade}</p>
              <p><strong>Description:</strong> ${job.job_description}</p>
              <p><strong>Location:</strong> ${job.postcode}</p>
            </div>
            <div style="background-color:#f0f9ff;padding:16px;border-radius:8px;margin:16px 0;">
              <h3 style="margin-top:0;">Tradesperson Details:</h3>
              <p><strong>Name:</strong> ${tradesperson.first_name} ${tradesperson.last_name}</p>
              <p><strong>Trade:</strong> ${tradesperson.trade}</p>
              <p><strong>Experience:</strong> ${tradesperson.years_experience} years</p>
              <p><strong>Hourly Rate:</strong> £${tradesperson.hourly_rate}</p>
            </div>
            <div style="background-color:#ecfdf5;padding:16px;border-radius:8px;margin:16px 0;">
              <h3 style="margin-top:0;">Quotation:</h3>
              <p><strong>Amount:</strong> £${quotationAmount}</p>
              <p><strong>Notes:</strong> ${quotationNotes || 'No additional notes'}</p>
            </div>
            <p>You can review this application in your client dashboard.</p>
            <p style="color:#888;font-size:0.9em;">&copy; My Approved</p>
          </div>`
        };

        const result = await transporter.sendMail(mailOptions);
        console.log('Client notification email sent successfully:', result.messageId);
      } catch (emailError) {
        console.error('Failed to send client notification email:', emailError);
      }
    }, 100);

    return NextResponse.json({
      message: 'Application submitted successfully! Your quotation is pending admin approval.',
      application: {
        id: application.id,
        jobId: application.job_id,
        status: application.status
      }
    });

  } catch (error) {
    console.error('Error in job application API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 