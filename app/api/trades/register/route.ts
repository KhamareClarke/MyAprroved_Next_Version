import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Extract form data
    const fullName = formData.get('fullName') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const phone = formData.get('phone') as string;
    const trade = formData.get('trade') as string;
    const city = formData.get('city') as string;
    const postcode = formData.get('postcode') as string;
    const idDocument = formData.get('idDocument') as File | null;
    const insuranceDocument = formData.get('insuranceDocument') as File | null;
    const qualificationDocument = formData.get('qualificationDocument') as File | null;
    const tradeCardDocument = formData.get('tradeCardDocument') as File | null;
    const insuranceExpiry = formData.get('insuranceExpiry') as string;
    const qualificationNumber = formData.get('qualificationNumber') as string;
    const tradeCardNumber = formData.get('tradeCardNumber') as string;
    const yearsExperience = formData.get('yearsExperience') as string;

    // Validate required fields
    if (!fullName || !email || !password || !phone || !trade || !city || !postcode) {
      console.log('Missing required fields:', { fullName, email, phone, trade, city, postcode });
      return NextResponse.json(
        { error: 'All required fields must be provided' },
        { status: 400 }
      );
    }

    // Validate required documents for ALL tradespeople
    if (!idDocument || !insuranceDocument || !qualificationDocument) {
      return NextResponse.json(
        { error: 'ID document, insurance document, and proof of qualifications are required for all tradespeople.' },
        { status: 400 }
      );
    }

    // Check if this trade requires additional trade card
    const needsTradeCard = ['Plumber', 'Electrician', 'Aircon Engineer'].includes(trade);
    if (needsTradeCard && !tradeCardDocument) {
      return NextResponse.json(
        { error: 'Trade card is required for Plumbers, Electricians, and Aircon Engineers.' },
        { status: 400 }
      );
    }

    // Validate required additional fields
    if (!insuranceExpiry || !qualificationNumber) {
      return NextResponse.json(
        { error: 'Insurance expiry date and qualification number are required.' },
        { status: 400 }
      );
    }

    if (needsTradeCard && !tradeCardNumber) {
      return NextResponse.json(
        { error: 'Trade card number is required for this trade.' },
        { status: 400 }
      );
    }

    console.log('Form data received:', { 
      fullName, 
      email, 
      phone, 
      trade, 
      city, 
      postcode,
      yearsExperience,
      hasIdDoc: !!idDocument,
      hasInsuranceDoc: !!insuranceDocument,
      hasQualificationDoc: !!qualificationDocument,
      hasTradeCardDoc: !!tradeCardDocument,
      needsTradeCard
    });

    // Initialize Supabase client
    const supabaseUrl = 'https://jismdkfjkngwbpddhomx.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imppc21ka2Zqa25nd2JwZGRob214Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5Mzc2MzksImV4cCI6MjA2ODUxMzYzOX0.1pK4G-Mu5v8lSdDJUAsPsoDAlK9d7ocFaUH9dd2vl3A';
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Generate user ID
    const userId = uuidv4();

    // 1. Check if email already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('tradespeople')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking existing user:', checkError);
      return NextResponse.json(
        { error: 'Failed to check existing user' },
        { status: 500 }
      );
    }

    if (existingUser) {
      return NextResponse.json(
        { error: 'A tradesperson with this email already exists' },
        { status: 400 }
      );
    }

    // 2. Insert into tradespeople table
    const { error: tradespersonError } = await supabase
      .from('tradespeople')
      .insert({
        id: userId,
        email: email,
        password_hash: password,
        first_name: fullName.split(' ')[0] || fullName,
        last_name: fullName.split(' ').slice(1).join(' ') || '',
        phone: phone,
        trade: trade,
        city: city,
        postcode: postcode,
        years_experience: yearsExperience ? parseInt(yearsExperience) : null,
        is_verified: false,
        is_active: true,
        is_approved: false
      });

    if (tradespersonError) {
      console.error('Error inserting tradesperson:', tradespersonError);
      console.error('Error details:', {
        code: tradespersonError.code,
        message: tradespersonError.message,
        details: tradespersonError.details,
        hint: tradespersonError.hint
      });
      return NextResponse.json(
        { 
          error: 'Failed to create tradesperson account',
          details: tradespersonError.message,
          code: tradespersonError.code
        },
        { status: 500 }
      );
    }

    // Send email notification to admin about new tradesperson registration
    try {
      const nodemailer = require('nodemailer');
      
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'myapproved2024@gmail.com',
          pass: 'qjqj qjqj qjqj qjqj'
        }
      });

      const adminEmailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">New Tradesperson Registration</h2>
          <p>A new tradesperson has registered on My Approved platform:</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Tradesperson Details:</h3>
            <p><strong>Name:</strong> ${fullName}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone}</p>
            <p><strong>Trade:</strong> ${trade}</p>
            <p><strong>Years of Experience:</strong> ${yearsExperience || 'Not specified'}</p>
            <p><strong>City:</strong> ${city}</p>
            <p><strong>Postcode:</strong> ${postcode}</p>
            <p><strong>Registration Date:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
          
          <p><strong>Documents Uploaded:</strong></p>
          <ul>
            <li>ID Document: ${idDocument ? 'Yes' : 'No'}</li>
            <li>Insurance Document: ${insuranceDocument ? 'Yes' : 'No'}</li>
            <li>Qualification Document: ${qualificationDocument ? 'Yes' : 'No'}</li>
            <li>Trade Card: ${tradeCardDocument ? 'Yes' : 'No'}</li>
          </ul>
          
          <p>Please review and approve this tradesperson in the admin dashboard.</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
            <p style="color: #666; font-size: 12px;">This is an automated notification from My Approved platform.</p>
          </div>
        </div>
      `;

      await transporter.sendMail({
        from: '"My Approved" <myapproved2024@gmail.com>',
        to: 'fizasaif0233@gmail.com', // Admin email
        subject: 'New Tradesperson Registration - My Approved',
        html: adminEmailContent
      });

      console.log('Admin notification email sent successfully');
    } catch (emailError) {
      console.error('Failed to send admin notification email:', emailError);
      // Don't fail the registration if email fails
    }

    // 3. Check if documents bucket exists and create if needed
    let bucketExists = false;
    try {
      const { data: buckets } = await supabase.storage.listBuckets();
      const documentsBucket = buckets?.find(bucket => bucket.name === 'documents');
      bucketExists = !!documentsBucket;

      if (!documentsBucket) {
        console.log('Documents bucket not found. Please create it manually in Supabase dashboard.');
        console.log('Bucket name: documents');
        console.log('Settings: private, 10MB limit, allowed types: PDF, JPEG, PNG, JPG, GIF');
        
        // Continue without bucket for now - user can upload documents later
        console.log('Continuing registration without document uploads...');
      } else {
        console.log('Documents bucket exists');
      }
    } catch (error) {
      console.error('Error checking bucket:', error);
      console.log('Continuing registration without document uploads...');
    }

    // Handle document uploads only if bucket exists
    const documentUploads = [];

    if (bucketExists) {
      // Upload ID Document
      if (idDocument) {
        try {
          const fileExt = idDocument.name.split('.').pop();
          const fileName = `${userId}/id-${uuidv4()}.${fileExt}`;

          const { data: uploadData, error: uploadError } = await supabase
            .storage
            .from('documents')
            .upload(fileName, idDocument);

          if (uploadError) {
            console.error('ID document upload error:', uploadError);
            return NextResponse.json(
              { error: 'Failed to upload ID document: ' + uploadError.message },
              { status: 500 }
            );
          }

          documentUploads.push({
            trade_id: userId,
            doc_type: 'id',
            file_path: fileName,
            upload_date: new Date().toISOString(),
            status: 'pending',
          });
        } catch (error: any) {
          console.error('ID document processing error:', error);
          return NextResponse.json(
            { error: 'Failed to process ID document: ' + error.message },
            { status: 500 }
          );
        }
      }

      // Upload Insurance Document
      if (insuranceDocument) {
        try {
          const fileExt = insuranceDocument.name.split('.').pop();
          const fileName = `${userId}/insurance-${uuidv4()}.${fileExt}`;

          const { data: uploadData, error: uploadError } = await supabase
            .storage
            .from('documents')
            .upload(fileName, insuranceDocument);

          if (uploadError) {
            console.error('Insurance upload error:', uploadError);
            return NextResponse.json(
              { error: 'Failed to upload insurance document: ' + uploadError.message },
              { status: 500 }
            );
          }

          documentUploads.push({
            trade_id: userId,
            doc_type: 'insurance',
            file_path: fileName,
            upload_date: new Date().toISOString(),
            expiry_date: insuranceExpiry || null,
            status: 'pending',
          });
        } catch (error: any) {
          console.error('Insurance document processing error:', error);
          return NextResponse.json(
            { error: 'Failed to process insurance document: ' + error.message },
            { status: 500 }
          );
        }
      }

      // Upload Qualification Document
      if (qualificationDocument) {
        try {
          const fileExt = qualificationDocument.name.split('.').pop();
          const fileName = `${userId}/qualification-${uuidv4()}.${fileExt}`;

          const { data: uploadData, error: uploadError } = await supabase
            .storage
            .from('documents')
            .upload(fileName, qualificationDocument);

          if (uploadError) {
            console.error('Qualification upload error:', uploadError);
            return NextResponse.json(
              { error: 'Failed to upload qualification document: ' + uploadError.message },
              { status: 500 }
            );
          }

          documentUploads.push({
            trade_id: userId,
            doc_type: 'qualification',
            file_path: fileName,
            upload_date: new Date().toISOString(),
            doc_number: qualificationNumber || null,
            status: 'pending',
          });
        } catch (error: any) {
          console.error('Qualification document processing error:', error);
          return NextResponse.json(
            { error: 'Failed to process qualification document: ' + error.message },
            { status: 500 }
          );
        }
      }

      // Upload Trade Card Document (for specific trades)
      if (tradeCardDocument) {
        try {
          const fileExt = tradeCardDocument.name.split('.').pop();
          const fileName = `${userId}/trade-card-${uuidv4()}.${fileExt}`;

          const { data: uploadData, error: uploadError } = await supabase
            .storage
            .from('documents')
            .upload(fileName, tradeCardDocument);

          if (uploadError) {
            console.error('Trade card upload error:', uploadError);
            return NextResponse.json(
              { error: 'Failed to upload trade card document: ' + uploadError.message },
              { status: 500 }
            );
          }

          documentUploads.push({
            trade_id: userId,
            doc_type: 'trade_card',
            file_path: fileName,
            upload_date: new Date().toISOString(),
            doc_number: tradeCardNumber || null,
            status: 'pending',
          });
        } catch (error: any) {
          console.error('Trade card document processing error:', error);
          return NextResponse.json(
            { error: 'Failed to process trade card document: ' + error.message },
            { status: 500 }
          );
        }
      }

      // 4. Insert document records if we have any uploads
      if (documentUploads.length > 0) {
        const { data: docData, error: docError } = await supabase
          .from('documents')
          .insert(documentUploads);

        if (docError) {
          console.error('Document record error:', docError);
          return NextResponse.json(
            { error: 'Failed to create document records' },
            { status: 500 }
          );
        }
      }
    } else {
      console.log('Skipping document uploads - bucket not available');
    }

    // Success response
    return NextResponse.json({
      success: true,
      message: 'Trade registration successful! Please check your email to verify your account.',
    });

  } catch (error: any) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      {
        error: 'An unexpected error occurred',
        details: error?.message || String(error),
        stack: error?.stack || 'No stack trace available',
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 15) + '...',
        supabaseKeySet: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      },
      { status: 500 }
    );
  }
}