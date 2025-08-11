import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

const supabaseAdmin = createClient(
  'https://jismdkfjkngwbpddhomx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imppc21ka2Zqa25nd2JwZGRob214Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5Mzc2MzksImV4cCI6MjA2ODUxMzYzOX0.1pK4G-Mu5v8lSdDJUAsPsoDAlK9d7ocFaUH9dd2vl3A'
);

export async function POST(request: NextRequest) {
  try {
    const { applicationId, action } = await request.json(); // action: 'approve' or 'reject'

    if (!applicationId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields: applicationId, action' },
        { status: 400 }
      );
    }

    // Get application details with job and tradesperson info
    const { data: application, error: fetchError } = await supabaseAdmin
      .from('job_applications')
      .select(`
        *,
        jobs (
          id,
          trade,
          job_description,
          postcode,
          budget,
          budget_type,
          clients (
            id,
            first_name,
            last_name,
            email
          )
        ),
        tradespeople (
          id,
          first_name,
          last_name,
          email,
          trade,
          years_experience,
          hourly_rate,
          phone
        )
      `)
      .eq('id', applicationId)
      .single();

    if (fetchError || !application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    // Update application status
    const newStatus = action === 'approve' ? 'accepted' : 'rejected';
    const { error: updateError } = await supabaseAdmin
      .from('job_applications')
      .update({
        status: newStatus,
        accepted_at: action === 'approve' ? new Date().toISOString() : null
      })
      .eq('id', applicationId);

    if (updateError) {
      console.error('Error updating application:', updateError);
      return NextResponse.json(
        { error: 'Failed to update application' },
        { status: 500 }
      );
    }

    // If approved, update job status
    if (action === 'approve') {
      // Check if job is already assigned
      if (application.jobs.application_status === 'in_progress' && application.jobs.assigned_tradesperson_id) {
        return NextResponse.json(
          { error: 'Job is already assigned to a tradesperson' },
          { status: 400 }
        );
      }

      const { error: jobUpdateError } = await supabaseAdmin
        .from('jobs')
        .update({
          application_status: 'in_progress',
          assigned_tradesperson_id: application.tradesperson_id,
          quotation_amount: application.quotation_amount,
          quotation_notes: application.quotation_notes,
          applied_at: application.applied_at,
          assigned_by: 'admin'
        })
        .eq('id', application.job_id);

      if (jobUpdateError) {
        console.error('Error updating job:', jobUpdateError);
      }
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

        const subject = action === 'approve' 
          ? 'Your Quotation Has Been Approved - My Approved'
          : 'Quotation Update - My Approved';

        const html = action === 'approve' 
          ? `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:20px;border:1px solid #eee;border-radius:8px;">
              <h2 style="color:#2d3748;">Quotation Approved!</h2>
              <p>Dear ${application.tradespeople.first_name} ${application.tradespeople.last_name},</p>
              <p>Great news! Your quotation has been approved by our admin team.</p>
              <p>The job is now assigned to you and marked as "In Progress".</p>
              <div style="background-color:#f7fafc;padding:16px;border-radius:8px;margin:16px 0;">
                <h3 style="margin-top:0;">Job Details:</h3>
                <p><strong>Trade:</strong> ${application.jobs.trade}</p>
                <p><strong>Description:</strong> ${application.jobs.job_description}</p>
                <p><strong>Location:</strong> ${application.jobs.postcode}</p>
                <p><strong>Client Budget:</strong> £${application.jobs.budget || 'Not specified'} (${application.jobs.budget_type})</p>
              </div>
              <div style="background-color:#ecfdf5;padding:16px;border-radius:8px;margin:16px 0;">
                <h3 style="margin-top:0;">Your Quotation:</h3>
                <p><strong>Amount:</strong> £${application.quotation_amount}</p>
                <p><strong>Notes:</strong> ${application.quotation_notes || 'No additional notes'}</p>
              </div>
              <div style="background-color:#f0f9ff;padding:16px;border-radius:8px;margin:16px 0;">
                <h3 style="margin-top:0;">Client Details:</h3>
                <p><strong>Name:</strong> ${application.jobs.clients.first_name} ${application.jobs.clients.last_name}</p>
                <p><strong>Email:</strong> ${application.jobs.clients.email}</p>
              </div>
              <p>You can now contact the client to arrange the work. The job will appear in your "In Progress" jobs.</p>
              <p>Thank you for choosing My Approved!</p>
              <p style="color:#888;font-size:0.9em;">&copy; My Approved</p>
            </div>`
          : `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:20px;border:1px solid #eee;border-radius:8px;">
              <h2 style="color:#2d3748;">Quotation Update</h2>
              <p>Dear ${application.tradespeople.first_name} ${application.tradespeople.last_name},</p>
              <p>Your quotation for the following job has been reviewed by our admin team.</p>
              <div style="background-color:#f7fafc;padding:16px;border-radius:8px;margin:16px 0;">
                <h3 style="margin-top:0;">Job Details:</h3>
                <p><strong>Trade:</strong> ${application.jobs.trade}</p>
                <p><strong>Description:</strong> ${application.jobs.job_description}</p>
                <p><strong>Location:</strong> ${application.jobs.postcode}</p>
              </div>
              <div style="background-color:#fef2f2;padding:16px;border-radius:8px;margin:16px 0;">
                <h3 style="margin-top:0;">Your Quotation:</h3>
                <p><strong>Amount:</strong> £${application.quotation_amount}</p>
                <p><strong>Status:</strong> <span style="color:#dc2626;">Not Accepted</span></p>
              </div>
              <p>The job is now available for other tradespeople to apply. You can continue to browse and apply for other jobs.</p>
              <p>Thank you for your interest!</p>
              <p style="color:#888;font-size:0.9em;">&copy; My Approved</p>
            </div>`;

        const mailOptions = {
          from: 'My Approved <noreply@myapproved.co.uk>',
          to: application.tradespeople.email,
          subject: subject,
          html: html
        };

        const result = await transporter.sendMail(mailOptions);
        console.log('Tradesperson notification email sent successfully:', result.messageId);
      } catch (emailError) {
        console.error('Failed to send tradesperson notification email:', emailError);
      }
    }, 100);

    return NextResponse.json({
      message: `Quotation ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
      application: {
        id: application.id,
        status: newStatus,
        tradespersonEmail: application.tradespeople.email
      }
    });

  } catch (error) {
    console.error('Error in approve quotation API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 