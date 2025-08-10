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
      completedBy, 
      rating, 
      reviewText,
      reviewerType,
      reviewerId 
    } = await request.json();

    if (!jobId || !completedBy) {
      return NextResponse.json(
        { error: 'Missing required fields: jobId, completedBy' },
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
        ),
        tradespeople (
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

    // Check if job is already completed
    if (job.is_completed) {
      return NextResponse.json(
        { error: 'Job is already completed' },
        { status: 400 }
      );
    }

    // Check if job is in progress
    if (job.application_status !== 'in_progress') {
      return NextResponse.json(
        { error: 'Job must be in progress to be completed' },
        { status: 400 }
      );
    }

    // Update job to completed
    const updateData: any = {
      is_completed: true,
      application_status: 'closed', // Mark as closed so it doesn't appear as available
      completed_at: new Date().toISOString(),
      completed_by: completedBy
    };

    // Add rating and review if provided
    if (rating && reviewText) {
      updateData.client_rating = rating;
      updateData.client_review = reviewText;
      updateData.review_submitted_at = new Date().toISOString();
    }

    const { error: updateError } = await supabaseAdmin
      .from('jobs')
      .update(updateData)
      .eq('id', jobId);

    if (updateError) {
      console.error('Error updating job:', updateError);
      return NextResponse.json(
        { error: 'Failed to complete job' },
        { status: 500 }
      );
    }

    // Add review to job_reviews table if rating and review provided
    if (rating && reviewText && reviewerType && reviewerId) {
      const { error: reviewError } = await supabaseAdmin
        .from('job_reviews')
        .insert({
          job_id: jobId,
          reviewer_type: reviewerType,
          reviewer_id: reviewerId,
          rating: rating,
          review_text: reviewText
        });

      if (reviewError) {
        console.error('Error adding review:', reviewError);
        // Don't fail the completion if review fails
      }
    }

    // Send email notifications
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'sajidasaif93@gmail.com',
          pass: 'idsp lvmm vmcp iynp'
        }
      });

      // Email to admin
      const adminEmail = {
        from: 'My Approved <noreply@myapproved.co.uk>',
        to: 'fizasaif0233@gmail.com', // Admin email
        subject: `Job Completed - ${job.trade}`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:20px;border:1px solid #eee;border-radius:8px;">
            <h2 style="color:#2d3748;">Job Completed</h2>
            <div style="background-color:#f7fafc;padding:16px;border-radius:8px;margin:16px 0;">
              <h3 style="margin-top:0;">Job Details:</h3>
              <p><strong>Job ID:</strong> ${job.id}</p>
              <p><strong>Trade:</strong> ${job.trade}</p>
              <p><strong>Description:</strong> ${job.job_description}</p>
              <p><strong>Location:</strong> ${job.postcode}</p>
            </div>
            <div style="background-color:#ecfdf5;padding:16px;border-radius:8px;margin:16px 0;">
              <h3 style="margin-top:0;">People Involved:</h3>
              <p><strong>Client:</strong> ${job.clients.first_name} ${job.clients.last_name} (${job.clients.email})</p>
              <p><strong>Tradesperson:</strong> ${job.tradespeople.first_name} ${job.tradespeople.last_name} (${job.tradespeople.email})</p>
              <p><strong>Completed by:</strong> ${completedBy}</p>
              <p><strong>Completed at:</strong> ${new Date().toLocaleString()}</p>
            </div>
            ${rating ? `
            <div style="background-color:#fef3c7;padding:16px;border-radius:8px;margin:16px 0;">
              <h3 style="margin-top:0;">Client Feedback:</h3>
              <p><strong>Rating:</strong> ${rating}/5 ⭐</p>
              ${reviewText ? `<p><strong>Review:</strong> "${reviewText}"</p>` : ''}
            </div>
            ` : ''}
            <p style="color:#888;font-size:0.9em;">&copy; My Approved</p>
          </div>
        `
      };

      await transporter.sendMail(adminEmail);

      // Email to tradesperson
      if (job.tradespeople) {
        const tradespersonEmail = {
          from: 'My Approved <noreply@myapproved.co.uk>',
          to: job.tradespeople.email,
          subject: 'Job Completed Successfully - My Approved',
          html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:20px;border:1px solid #eee;border-radius:8px;">
              <h2 style="color:#2d3748;">Job Completed Successfully!</h2>
              <p>Dear ${job.tradespeople.first_name} ${job.tradespeople.last_name},</p>
              <p>Congratulations! Your job has been marked as completed by the client.</p>
              <div style="background-color:#f7fafc;padding:16px;border-radius:8px;margin:16px 0;">
                <h3 style="margin-top:0;">Job Details:</h3>
                <p><strong>Trade:</strong> ${job.trade}</p>
                <p><strong>Description:</strong> ${job.job_description}</p>
                <p><strong>Location:</strong> ${job.postcode}</p>
                <p><strong>Client:</strong> ${job.clients.first_name} ${job.clients.last_name}</p>
                <p><strong>Completed by:</strong> ${completedBy}</p>
                <p><strong>Completed at:</strong> ${new Date().toLocaleString()}</p>
              </div>
              ${rating ? `
              <div style="background-color:#ecfdf5;padding:16px;border-radius:8px;margin:16px 0;">
                <h3 style="margin-top:0;">Client Feedback:</h3>
                <p><strong>Rating:</strong> ${rating}/5 ⭐</p>
                ${reviewText ? `<p><strong>Review:</strong> "${reviewText}"</p>` : ''}
              </div>
              ` : `
              <div style="background-color:#fef3c7;padding:16px;border-radius:8px;margin:16px 0;">
                <h3 style="margin-top:0;">Client Feedback:</h3>
                <p>The client has not provided a rating or review yet.</p>
              </div>
              `}
              <p>Thank you for your excellent work! This completed job will help build your reputation on our platform.</p>
              <p style="color:#888;font-size:0.9em;">&copy; My Approved</p>
            </div>
          `
        };

        await transporter.sendMail(tradespersonEmail);
      }

    } catch (emailError) {
      console.error('Error sending emails:', emailError);
      // Don't fail the completion if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Job completed successfully'
    });

  } catch (error) {
    console.error('Error in job completion API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 