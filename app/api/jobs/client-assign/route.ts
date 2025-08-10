import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

const supabaseAdmin = createClient(
  'https://jismdkfjkngwbpddhomx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imppc21ka2Zqa25nd2JwZGRob214Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5Mzc2MzksImV4cCI6MjA2ODUxMzYzOX0.1pK4G-Mu5v8lSdDJUAsPsoDAlK9d7ocFaUH9dd2vl3A'
);

export async function POST(request: NextRequest) {
  try {
    const { jobId, tradespersonId, quotationAmount, quotationNotes, assignedBy } = await request.json();

    if (!jobId || !tradespersonId || !quotationAmount || !assignedBy) {
      return NextResponse.json(
        { error: 'Missing required fields: jobId, tradespersonId, quotationAmount, assignedBy' },
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

    // Check if job is already assigned
    if (job.application_status === 'in_progress' && job.assigned_tradesperson_id) {
      return NextResponse.json(
        { error: 'Job is already assigned to a tradesperson' },
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

    // Check if there's an existing application and update it
    const { data: existingApplication } = await supabaseAdmin
      .from('job_applications')
      .select('id')
      .eq('job_id', jobId)
      .eq('tradesperson_id', tradespersonId)
      .maybeSingle();

    if (existingApplication) {
      // Update existing application to accepted
      const { error: updateAppError } = await supabaseAdmin
        .from('job_applications')
        .update({
          status: 'accepted',
          accepted_at: new Date().toISOString()
        })
        .eq('id', existingApplication.id);

      if (updateAppError) {
        console.error('Error updating application:', updateAppError);
      }
    } else {
      // Create new application record
      const { error: createAppError } = await supabaseAdmin
        .from('job_applications')
        .insert({
          job_id: jobId,
          tradesperson_id: tradespersonId,
          quotation_amount: parseFloat(quotationAmount),
          quotation_notes: quotationNotes || '',
          status: 'accepted',
          accepted_at: new Date().toISOString()
        });

      if (createAppError) {
        console.error('Error creating application:', createAppError);
      }
    }

    // Update job status
    const { error: updateJobError } = await supabaseAdmin
      .from('jobs')
      .update({
        application_status: 'in_progress',
        assigned_tradesperson_id: tradespersonId,
        quotation_amount: parseFloat(quotationAmount),
        quotation_notes: quotationNotes || '',
        applied_at: new Date().toISOString(),
        assigned_by: assignedBy // 'client' or 'admin'
      })
      .eq('id', jobId);

    if (updateJobError) {
      console.error('Error updating job:', updateJobError);
      return NextResponse.json(
        { error: 'Failed to assign job' },
        { status: 500 }
      );
    }

    // Send email notification to tradesperson (non-blocking)
    setTimeout(async () => {
      try {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: 'sajidasaif93@gmail.com',
            pass: 'idsp lvmm vmcp iynp'
          }
        });

        const assignedByText = assignedBy === 'client' ? 'the client' : 'our admin team';
        
        const mailOptions = {
          from: 'My Approved <noreply@myapproved.co.uk>',
          to: tradesperson.email,
          subject: 'Job Assigned to You - My Approved',
          html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:20px;border:1px solid #eee;border-radius:8px;">
            <h2 style="color:#2d3748;">Job Assigned!</h2>
            <p>Dear ${tradesperson.first_name} ${tradesperson.last_name},</p>
            <p>A job has been assigned to you by ${assignedByText}.</p>
            <div style="background-color:#f7fafc;padding:16px;border-radius:8px;margin:16px 0;">
              <h3 style="margin-top:0;">Job Details:</h3>
              <p><strong>Trade:</strong> ${job.trade}</p>
              <p><strong>Description:</strong> ${job.job_description}</p>
              <p><strong>Location:</strong> ${job.postcode}</p>
              <p><strong>Client Budget:</strong> £${job.budget || 'Not specified'} (${job.budget_type})</p>
            </div>
            <div style="background-color:#ecfdf5;padding:16px;border-radius:8px;margin:16px 0;">
              <h3 style="margin-top:0;">Assignment Details:</h3>
              <p><strong>Quotation Amount:</strong> £${quotationAmount}</p>
              <p><strong>Notes:</strong> ${quotationNotes || 'No additional notes'}</p>
              <p><strong>Assigned By:</strong> ${assignedBy === 'client' ? 'Client' : 'Admin'}</p>
            </div>
            <div style="background-color:#f0f9ff;padding:16px;border-radius:8px;margin:16px 0;">
              <h3 style="margin-top:0;">Client Details:</h3>
              <p><strong>Name:</strong> ${job.clients.first_name} ${job.clients.last_name}</p>
              <p><strong>Email:</strong> ${job.clients.email}</p>
            </div>
            <p>This job will appear in your "In Progress Jobs" section. You can now contact the client to arrange the work.</p>
            <p>Thank you for choosing My Approved!</p>
            <p style="color:#888;font-size:0.9em;">&copy; My Approved</p>
          </div>`
        };

        const result = await transporter.sendMail(mailOptions);
        console.log('Tradesperson assignment email sent successfully:', result.messageId);
      } catch (emailError) {
        console.error('Failed to send tradesperson assignment email:', emailError);
      }
    }, 100);

    return NextResponse.json({
      message: 'Job assigned successfully!',
      job: {
        id: job.id,
        trade: job.trade,
        status: 'in_progress',
        assignedTo: tradesperson.first_name + ' ' + tradesperson.last_name
      }
    });

  } catch (error) {
    console.error('Error in client assign job API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 