// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: NextRequest) {
  try {
    // Initialize Supabase client
    const supabaseUrl = "https://jismdkfjkngwbpddhomx.supabase.co";
    const supabaseKey =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imppc21ka2Zqa25nd2JwZGRob214Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5Mzc2MzksImV4cCI6MjA2ODUxMzYzOX0.1pK4G-Mu5v8lSdDJUAsPsoDAlK9d7ocFaUH9dd2vl3A";

    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log("Testing bucket access...");

    // Try to list buckets
    const { data: buckets, error: bucketError } =
      await supabase.storage.listBuckets();

    console.log("Buckets response:", { buckets, bucketError });

    if (bucketError) {
      return NextResponse.json({
        success: false,
        error: bucketError.message,
        code: bucketError.statusCode,
        details: bucketError,
      });
    }

    const documentsBucket = buckets?.find(
      (bucket) => bucket.name === "documents"
    );
    const bucketExists = !!documentsBucket;

    console.log("Documents bucket found:", bucketExists);
    console.log("Documents bucket details:", documentsBucket);

    // Try to list files in documents bucket if it exists
    let files = null;
    let filesError = null;

    if (bucketExists) {
      const { data: filesData, error: filesErr } = await supabase.storage
        .from("documents")
        .list();

      files = filesData;
      filesError = filesErr;

      console.log("Files in documents bucket:", files);
      console.log("Files error:", filesError);
    }

    return NextResponse.json({
      success: true,
      bucketExists,
      documentsBucket,
      allBuckets: buckets?.map((b) => ({
        id: b.id,
        name: b.name,
        public: b.public,
      })),
      files,
      filesError,
      message: bucketExists
        ? "Documents bucket exists and is accessible"
        : "Documents bucket does not exist or is not accessible",
    });
  } catch (error: any) {
    console.error("Simple bucket test error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        stack: error.stack,
      },
      { status: 500 }
    );
  }
}
