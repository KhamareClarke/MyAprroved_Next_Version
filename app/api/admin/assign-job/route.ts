import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

const supabaseAdmin = createClient(
  'https://jismdkfjkngwbpddhomx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imppc21ka2Zqa25nd2JwZGRob214Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5Mzc2MzksImV4cCI6MjA2ODUxMzYzOX0.1pK4G-Mu5v8lSdDJUAsPsoDAlK9d7ocFaUH9dd2vl3A'
);

export async function POST(request: NextRequest) {
  try {
    const { 
      jobId, 
      tradespersonId, 
      quotationAmount, 
      quotationNotes 
    } = await request.json();

    if (!jobId || !tradespersonId || !quotationAmount) {
      return NextResponse.json(
        { error: 'Missing required fields: jobId, tradespersonId, quotationAmount' },
        { status: 400 }
      );
    }

    // Get job details
    const { data: job, error: jobError } = await supabaseAdmin
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

    // Check if job is already assigned by client
    if (job.assigned_by === 'client') {
      return NextResponse.json(
        { error: 'Job is already assigned by client. Admin cannot reassign.' },
        { status: 400 }
      );
    }

    // Check if job is already assigned
    if (job.assigned_tradesperson_id) {
      return NextResponse.json(
        { error: 'Job is already assigned to a tradesperson' },
        { status: 400 }
      );
    }

    // Check if job is approved
    if (!job.is_approved) {
      return NextResponse.json(
        { error: 'Job must be approved before assignment' },
        { status: 400 }
      );
    }

    // Get tradesperson details
    const { data: tradesperson, error: tradespersonError } = await supabaseAdmin
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

    // Check if tradesperson is approved and verified
    if (!tradesperson.is_approved || !tradesperson.is_verified) {
      return NextResponse.json(
        { error: 'Tradesperson must be approved and verified' },
        { status: 400 }
      );
    }

    // Update job with assignment
    const { error: updateError } = await supabaseAdmin
      .from('jobs')
      .update({
        assigned_tradesperson_id: tradespersonId,
        application_status: 'in_progress',
        quotation_amount: parseFloat(quotationAmount),
        quotation_notes: quotationNotes || null,
        assigned_by: 'admin',
        assigned_at: new Date().toISOString()
      })
      .eq('id', jobId);

    if (updateError) {
      console.error('Error updating job:', updateError);
      return NextResponse.json(
        { error: 'Failed to assign job' },
        { status: 500 }
      );
    }

    // Send email notifications
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'your-email@gmail.com', // Replace with your email
          pass: 'your-app-password' // Replace with your app password
        }
      });

      // Email to client
      const clientEmail = {
        from: 'your-email@gmail.com',
        to: job.clients.email,
        subject: `Job Assigned - ${job.trade}`,
        html: `
          <h2>Your Job Has Been Assigned</h2>
          <p><strong>Job:</strong> ${job.job_description}</p>
          <p><strong>Trade:</strong> ${job.trade}</p>
          <p><strong>Location:</strong> ${job.postcode}</p>
          <p><strong>Tradesperson:</strong> ${tradesperson.first_name} ${tradesperson.last_name}</p>
          <p><strong>Experience:</strong> ${tradesperson.years_experience} years</p>
          <p><strong>Hourly Rate:</strong> £${tradesperson.hourly_rate}</p>
          <p><strong>Phone:</strong> ${tradesperson.phone}</p>
          <p><strong>Approved Quotation:</strong> £${quotationAmount}</p>
          ${quotationNotes ? `<p><strong>Notes:</strong> ${quotationNotes}</p>` : ''}
          <p><strong>Assigned by:</strong> Admin</p>
          <p><strong>Assigned at:</strong> ${new Date().toLocaleString()}</p>
        `
      };

      await transporter.sendMail(clientEmail);

      // Email to tradesperson
      const tradespersonEmail = {
        from: 'your-email@gmail.com',
        to: tradesperson.email,
        subject: 'Job Assignment - New Job Available',
        html: `
          <h2>You Have Been Assigned a New Job</h2>
          <p><strong>Job:</strong> ${job.job_description}</p>
          <p><strong>Trade:</strong> ${job.trade}</p>
          <p><strong>Location:</strong> ${job.postcode}</p>
          <p><strong>Client:</strong> ${job.clients.first_name} ${job.clients.last_name}</p>
          <p><strong>Budget:</strong> £${job.budget || 'Not specified'} (${job.budget_type})</p>
          <p><strong>Approved Quotation:</strong> £${quotationAmount}</p>
          ${quotationNotes ? `<p><strong>Notes:</strong> ${quotationNotes}</p>` : ''}
          <p><strong>Assigned by:</strong> Admin</p>
          <p><strong>Assigned at:</strong> ${new Date().toLocaleString()}</p>
        `
      };

      await transporter.sendMail(tradespersonEmail);

    } catch (emailError) {
      console.error('Error sending emails:', emailError);
      // Don't fail the assignment if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Job assigned successfully by admin'
    });

  } catch (error) {
    console.error('Error in admin job assignment API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 