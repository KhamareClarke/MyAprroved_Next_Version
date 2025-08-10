import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

// Use the correct Supabase project (same as all other APIs)
const supabaseAdmin = createClient(
  'https://jismdkfjkngwbpddhomx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imppc21ka2Zqa25nd2JwZGRob214Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5Mzc2MzksImV4cCI6MjA2ODUxMzYzOX0.1pK4G-Mu5v8lSdDJUAsPsoDAlK9d7ocFaUH9dd2vl3A'
);

export async function POST(request: NextRequest) {
  try {
    // Handle FormData for file uploads
    const formData = await request.formData();
    console.log('Job posting request - FormData received');

    const trade = formData.get('trade') as string;
    const job_description = formData.get('job_description') as string;
    const postcode = formData.get('postcode') as string;
    const budget = formData.get('budget') as string;
    const budget_type = formData.get('budget_type') as string;
    const preferred_date = formData.get('preferred_date') as string;
    const client_id = formData.get('client_id') as string;

    // Get image files
    const imageFiles = formData.getAll('images') as File[];
    console.log('Image files received:', imageFiles.length);
    console.log('Image files details:', imageFiles.map(f => ({ name: f.name, size: f.size, type: f.type })));
    
    const imageUrls: string[] = [];

    // Upload images to Supabase Storage if any
    if (imageFiles.length > 0) {
      console.log('Starting image upload process...');
      
      for (const file of imageFiles) {
        console.log('Processing file:', file.name, 'Size:', file.size, 'Type:', file.type);
        
        if (file.size > 0) {
          const fileName = `job-images/${Date.now()}-${file.name}`;
          console.log('Uploading to path:', fileName);
          
          try {
            const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
              .from('job-images')
              .upload(fileName, file);

            if (uploadError) {
              console.error('Error uploading image:', uploadError);
              console.error('Upload error details:', {
                message: uploadError.message,
                name: uploadError.name
              });
            } else {
              console.log('Upload successful:', uploadData);
              const { data: urlData } = supabaseAdmin.storage
                .from('job-images')
                .getPublicUrl(fileName);
              imageUrls.push(urlData.publicUrl);
              console.log('Public URL generated:', urlData.publicUrl);
            }
          } catch (uploadException) {
            console.error('Exception during upload:', uploadException);
          }
        } else {
          console.log('Skipping empty file:', file.name);
        }
      }
      
      console.log('Final image URLs:', imageUrls);
    } else {
      console.log('No image files to upload');
    }

    console.log('Job posting data:', {
      trade,
      job_description,
      postcode,
      budget,
      budget_type,
      preferred_date,
      client_id,
      imageUrls,
      imageCount: imageUrls.length
    });

    // Validate required fields
    if (!trade || !job_description || !postcode || !client_id) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create job record
    const { data: job, error: insertError } = await supabaseAdmin
      .from('jobs')
      .insert({
        client_id: client_id,
        trade,
        job_description,
        postcode,
        budget: budget ? parseFloat(budget) : null,
        budget_type: budget_type || 'fixed',
        images: imageUrls,
        preferred_date: preferred_date || null,
        status: 'pending',
        is_approved: false
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting job:', insertError);
      return NextResponse.json(
        { error: 'Failed to create job', details: insertError.message },
        { status: 500 }
      );
    }

    // Get client details for email
    const { data: client } = await supabaseAdmin
      .from('clients')
      .select('first_name, last_name, email')
      .eq('id', client_id)
      .single();

    // Send email notification to admin (non-blocking)
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
          to: 'fizasaif0233@gmail.com', // Admin email
          subject: 'New Job Posted - My Approved',
          html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:20px;border:1px solid #eee;border-radius:8px;">
            <h2 style="color:#2d3748;">New Job Posted</h2>
            <p>A new job has been posted and requires your approval.</p>
            <div style="background-color:#f7fafc;padding:16px;border-radius:8px;margin:16px 0;">
              <h3 style="margin-top:0;">Job Details:</h3>
              <p><strong>Trade:</strong> ${trade}</p>
              <p><strong>Description:</strong> ${job_description}</p>
              <p><strong>Location:</strong> ${postcode}</p>
              <p><strong>Budget:</strong> £${budget || 'Not specified'} (${budget_type || 'fixed'})</p>
              <p><strong>Preferred Date:</strong> ${preferred_date || 'Not specified'}</p>
              <p><strong>Client:</strong> ${client?.first_name} ${client?.last_name} (${client?.email})</p>
              ${imageUrls.length > 0 ? `<p><strong>Images:</strong> ${imageUrls.length} uploaded</p>` : ''}
            </div>
            <p style="color:#666;font-size:14px;">Please review and approve this job posting.</p>
          </div>`
        };

        await transporter.sendMail(mailOptions);
        console.log('Admin notification email sent');
      } catch (emailError) {
        console.error('Failed to send admin notification email:', emailError);
      }
    }, 100);

    // Send email notifications to matching tradespeople (non-blocking)
    setTimeout(async () => {
      try {
        // Find tradespeople with matching trade and location
        const { data: matchingTradespeople, error: tradespeopleError } = await supabaseAdmin
          .from('tradespeople')
          .select('id, first_name, last_name, email, trade, postcode, city, is_verified')
          .eq('trade', trade)
          .eq('is_verified', true);

        if (tradespeopleError) {
          console.error('Error fetching matching tradespeople:', tradespeopleError);
          return;
        }

        if (!matchingTradespeople || matchingTradespeople.length === 0) {
          console.log('No matching tradespeople found for this job');
          return;
        }

        // Filter by location (postcode or city match)
        const locationMatchingTradespeople = matchingTradespeople.filter(tradesperson => {
          const tradespersonLocation = tradesperson.postcode || tradesperson.city || '';
          const jobLocation = postcode || '';
          
          // Simple location matching - check if postcodes are similar
          const tradespersonPostcode = tradespersonLocation.toLowerCase().replace(/\s/g, '');
          const jobPostcode = jobLocation.toLowerCase().replace(/\s/g, '');
          
          // Match if postcodes are similar (same area)
          return tradespersonPostcode.includes(jobPostcode.substring(0, 3)) ||
                 jobPostcode.includes(tradespersonPostcode.substring(0, 3)) ||
                 tradespersonPostcode === jobPostcode;
        });

        if (locationMatchingTradespeople.length === 0) {
          console.log('No tradespeople found in the job location');
          return;
        }

        console.log(`Found ${locationMatchingTradespeople.length} matching tradespeople for job notification`);

        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: 'sajidasaif93@gmail.com',
            pass: 'idsp lvmm vmcp iynp'
          }
        });

        // Send email to each matching tradesperson
        for (const tradesperson of locationMatchingTradespeople) {
          try {
            const mailOptions = {
              from: 'My Approved <noreply@myapproved.co.uk>',
              to: tradesperson.email,
              subject: `New ${trade} Job Available in ${postcode} - My Approved`,
              html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:20px;border:1px solid #eee;border-radius:8px;">
                <div style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:white;padding:20px;border-radius:8px 8px 0 0;text-align:center;">
                  <h1 style="margin:0;font-size:24px;">My Approved</h1>
                  <p style="margin:5px 0 0 0;opacity:0.9;">Professional Job Matching Platform</p>
                </div>
                
                <div style="padding:20px;">
                  <h2 style="color:#2d3748;margin-top:0;">New Job Opportunity!</h2>
                  <p>Hello ${tradesperson.first_name} ${tradesperson.last_name},</p>
                  <p>A new <strong>${trade}</strong> job has been posted in your area that matches your skills and location.</p>
                  
                  <div style="background-color:#f7fafc;padding:16px;border-radius:8px;margin:16px 0;border-left:4px solid #4299e1;">
                    <h3 style="margin-top:0;color:#2d3748;">Job Details:</h3>
                    <p><strong>Trade:</strong> ${trade}</p>
                    <p><strong>Description:</strong> ${job_description}</p>
                    <p><strong>Location:</strong> ${postcode}</p>
                    <p><strong>Budget:</strong> £${budget || 'Not specified'} (${budget_type})</p>
                    <p><strong>Preferred Date:</strong> ${preferred_date || 'Not specified'}</p>
                    ${imageUrls.length > 0 ? `<p><strong>Images:</strong> ${imageUrls.length} uploaded</p>` : ''}
                  </div>
                  
                  <div style="background-color:#e6fffa;padding:16px;border-radius:8px;margin:16px 0;border-left:4px solid #38b2ac;">
                    <h4 style="margin-top:0;color:#2c7a7b;">💼 Perfect Match!</h4>
                    <p style="margin:0;color:#2c7a7b;">
                      This job matches your trade (${trade}) and location (${tradesperson.postcode || tradesperson.city}). 
                      Don't miss this opportunity!
                    </p>
                  </div>
                  
                  <div style="text-align:center;margin:20px 0;">
                    <a href="http://localhost:3000/dashboard/tradesperson" 
                       style="background-color:#4299e1;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block;font-weight:bold;">
                      🚀 Apply Now
                    </a>
                  </div>
                  
                  <div style="background-color:#fff5f5;padding:16px;border-radius:8px;margin:16px 0;border-left:4px solid #f56565;">
                    <h4 style="margin-top:0;color:#c53030;">⏰ Act Fast!</h4>
                    <p style="margin:0;color:#c53030;font-size:14px;">
                      Other tradespeople in your area will also receive this notification. 
                      Apply quickly to increase your chances of getting selected!
                    </p>
                  </div>
                  
                  <p style="color:#666;font-size:14px;margin-top:20px;">
                    This is an automated notification from My Approved. Log in to your dashboard to view and apply for this job.
                  </p>
                </div>
                
                <div style="background-color:#f7fafc;padding:16px;border-radius:0 0 8px 8px;text-align:center;border-top:1px solid #e2e8f0;">
                  <p style="margin:0;color:#666;font-size:12px;">
                    © 2024 My Approved. All rights reserved.
                  </p>
                </div>
              </div>`
            };
            await transporter.sendMail(mailOptions);
            console.log(`Job notification email sent to ${tradesperson.email}`);
          } catch (emailError) {
            console.error(`Failed to send email to ${tradesperson.email}:`, emailError);
          }
        }
        console.log(`Job notifications sent to ${locationMatchingTradespeople.length} tradespeople`);
      } catch (error) {
        console.error('Error sending job notifications to tradespeople:', error);
      }
    }, 200);

    return NextResponse.json({
      message: 'Job posted successfully! It is now pending admin approval.',
      job: {
        id: job.id,
        trade: job.trade,
        status: job.status
      }
    });

  } catch (error) {
    console.error('Error in job posting API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 