import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";

const supabaseAdmin = createClient(
  "https://jismdkfjkngwbpddhomx.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imppc21ka2Zqa25nd2JwZGRob214Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5Mzc2MzksImV4cCI6MjA2ODUxMzYzOX0.1pK4G-Mu5v8lSdDJUAsPsoDAlK9d7ocFaUH9dd2vl3A"
);

export async function POST(request: NextRequest) {
  try {
    const { jobId } = await request.json();

    if (!jobId) {
      return NextResponse.json(
        { error: "Job ID is required" },
        { status: 400 }
      );
    }

    // Get job details with client information
    const { data: job, error: fetchError } = await supabaseAdmin
      .from("jobs")
      .select(
        `
        *,
        clients (
          id,
          email,
          first_name,
          last_name
        )
      `
      )
      .eq("id", jobId)
      .single();

    if (fetchError || !job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Update job to approved
    const { error: updateError } = await supabaseAdmin
      .from("jobs")
      .update({
        is_approved: true,
        status: "approved",
        approved_at: new Date().toISOString(),
      })
      .eq("id", jobId);

    if (updateError) {
      console.error("Error updating job:", updateError);
      return NextResponse.json(
        { error: "Failed to approve job" },
        { status: 500 }
      );
    }

    // Send email notification to client
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "sajidasaif93@gmail.com",
          pass: "idsp lvmm vmcp iynp",
        },
      });

      const mailOptions = {
        from: "My Approved <noreply@myapproved.co.uk>",
        to: job.clients.email,
        subject: "Your Job Has Been Approved - My Approved",
        html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:20px;border:1px solid #eee;border-radius:8px;">
          <h2 style="color:#2d3748;">Job Approved!</h2>
          <p>Dear ${job.clients.first_name} ${job.clients.last_name},</p>
          <p>Great news! Your job posting has been approved by our admin team.</p>
          <p>Tradespeople can now see and apply for your job.</p>
          <div style="background-color:#f7fafc;padding:16px;border-radius:8px;margin:16px 0;">
            <h3 style="margin-top:0;">Job Details:</h3>
            <p><strong>Trade:</strong> ${job.trade}</p>
            <p><strong>Description:</strong> ${job.job_description}</p>
            <p><strong>Location:</strong> ${job.postcode}</p>
            <p><strong>Budget:</strong> £${job.budget || "Not specified"} (${
          job.budget_type
        })</p>
            <p><strong>Status:</strong> Approved</p>
          </div>
          <p>You can view your job and any applications in your client dashboard.</p>
          <p>Thank you for choosing My Approved!</p>
          <p style="color:#888;font-size:0.9em;">&copy; My Approved</p>
        </div>`,
      };

      const result = await transporter.sendMail(mailOptions);
      console.log("Job approval email sent successfully:", result.messageId);
    } catch (emailError) {
      console.error("Failed to send job approval email:", emailError);
    }

    // Find matching tradespeople and send notifications (non-blocking)
    setTimeout(async () => {
      try {
        // Get tradespeople with matching trade and location
        const { data: matchingTradespeople, error: tradespeopleError } =
          await supabaseAdmin
            .from("tradespeople")
            .select(
              "id, first_name, last_name, email, trade, postcode, city, is_verified"
            )
            .eq("trade", job.trade)
            .eq("is_verified", true); // Only verified tradespeople

        if (tradespeopleError) {
          console.error(
            "Error fetching matching tradespeople:",
            tradespeopleError
          );
          return;
        }

        if (!matchingTradespeople || matchingTradespeople.length === 0) {
          console.log("No matching tradespeople found for this job");
          return;
        }

        // Filter by location (postcode or city match)
        const locationMatchingTradespeople = matchingTradespeople.filter(
          (tradesperson) => {
            const tradespersonLocation =
              tradesperson.postcode || tradesperson.city || "";
            const jobLocation = job.postcode || "";

            // Simple location matching - can be enhanced with proper postcode radius logic
            return (
              tradespersonLocation
                .toLowerCase()
                .includes(jobLocation.toLowerCase()) ||
              jobLocation
                .toLowerCase()
                .includes(tradespersonLocation.toLowerCase())
            );
          }
        );

        if (locationMatchingTradespeople.length === 0) {
          console.log("No tradespeople found in the job location");
          return;
        }

        console.log(
          `Found ${locationMatchingTradespeople.length} matching tradespeople for job notification`
        );

        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: "sajidasaif93@gmail.com",
            pass: "idsp lvmm vmcp iynp",
          },
        });

        // Send email to each matching tradesperson
        for (const tradesperson of locationMatchingTradespeople) {
          try {
            const mailOptions = {
              from: "My Approved <noreply@myapproved.co.uk>",
              to: tradesperson.email,
              subject: `New ${job.trade} Job Available in ${job.postcode} - My Approved`,
              html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:20px;border:1px solid #eee;border-radius:8px;">
                <div style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:white;padding:20px;border-radius:8px 8px 0 0;text-align:center;">
                  <h1 style="margin:0;font-size:24px;">My Approved</h1>
                  <p style="margin:5px 0 0 0;opacity:0.9;">Professional Job Matching Platform</p>
                </div>
                
                <div style="padding:20px;">
                  <h2 style="color:#2d3748;margin-top:0;">New Job Opportunity!</h2>
                  <p>Hello ${tradesperson.first_name} ${
                tradesperson.last_name
              },</p>
                  <p>A new <strong>${
                    job.trade
                  }</strong> job has been approved and is now available in your area that matches your skills and location.</p>
                  
                  <div style="background-color:#f7fafc;padding:16px;border-radius:8px;margin:16px 0;border-left:4px solid #4299e1;">
                    <h3 style="margin-top:0;color:#2d3748;">Job Details:</h3>
                    <p><strong>Trade:</strong> ${job.trade}</p>
                    <p><strong>Description:</strong> ${job.job_description}</p>
                    <p><strong>Location:</strong> ${job.postcode}</p>
                    <p><strong>Budget:</strong> £${
                      job.budget || "Not specified"
                    } (${job.budget_type})</p>
                    <p><strong>Preferred Date:</strong> ${
                      job.preferred_date || "Not specified"
                    }</p>
                    ${
                      job.images && job.images.length > 0
                        ? `<p><strong>Images:</strong> ${job.images.length} uploaded</p>`
                        : ""
                    }
                  </div>
                  
                  <div style="background-color:#e6fffa;padding:16px;border-radius:8px;margin:16px 0;border-left:4px solid #38b2ac;">
                    <h4 style="margin-top:0;color:#2c7a7b;">💼 Perfect Match!</h4>
                    <p style="margin:0;color:#2c7a7b;">
                      This job matches your trade (${
                        job.trade
                      }) and location (${
                tradesperson.postcode || tradesperson.city
              }). 
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
              </div>`,
            };

            await transporter.sendMail(mailOptions);
            console.log(`Job notification email sent to ${tradesperson.email}`);
          } catch (emailError) {
            console.error(
              `Failed to send email to ${tradesperson.email}:`,
              emailError
            );
          }
        }

        console.log(
          `Job notifications sent to ${locationMatchingTradespeople.length} tradespeople`
        );
      } catch (error) {
        console.error(
          "Error sending job notifications to tradespeople:",
          error
        );
      }
    }, 200);

    return NextResponse.json({
      message: "Job approved successfully",
      job: {
        id: job.id,
        trade: job.trade,
        status: "approved",
      },
    });
  } catch (error) {
    console.error("Error in approve job API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
