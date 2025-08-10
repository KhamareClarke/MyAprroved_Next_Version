# Manual Storage Bucket Setup Guide

## Step 1: Create Storage Bucket in Supabase Dashboard

1. **Go to your Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Select your project

2. **Navigate to Storage**
   - Click "Storage" in the left sidebar
   - Click "Create a new bucket"

3. **Configure the Bucket**
   - **Name**: `documents`
   - **Public bucket**: ❌ Uncheck (keep private)
   - **File size limit**: `10485760` (10MB)
   - **Allowed MIME types**: 
     - `application/pdf`
     - `image/jpeg`
     - `image/png`
     - `image/jpg`
     - `image/gif`

4. **Click "Create bucket"**

## Step 2: Set Up Storage Policies

1. **Go to SQL Editor**
   - Click "SQL Editor" in the left sidebar

2. **Run this SQL to create policies:**

```sql
-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy: Allow tradespeople to upload their own documents
CREATE POLICY "Tradespeople can upload documents" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Allow tradespeople to view their own documents
CREATE POLICY "Tradespeople can view own documents" ON storage.objects
FOR SELECT USING (
  bucket_id = 'documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Allow tradespeople to update their own documents
CREATE POLICY "Tradespeople can update own documents" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Allow tradespeople to delete their own documents
CREATE POLICY "Tradespeople can delete own documents" ON storage.objects
FOR DELETE USING (
  bucket_id = 'documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

## Step 3: Verify Setup

1. **Check bucket exists:**
```sql
SELECT * FROM storage.buckets WHERE name = 'documents';
```

2. **Check policies exist:**
```sql
SELECT * FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';
```

## Alternative: Use Simplified Registration (Temporary)

If you want to test registration without document uploads:

1. **Rename the current API file:**
   - Rename `app/api/trades/register/route.ts` to `app/api/trades/register/route-full.ts`
   - Rename `app/api/trades/register/route-simple.ts` to `app/api/trades/register/route.ts`

2. **This will use the simplified version that:**
   - ✅ Creates tradesperson records
   - ✅ Skips document uploads
   - ✅ Allows basic registration testing

## Troubleshooting

### If bucket creation fails:
- Check your Supabase plan (free tier has limitations)
- Ensure you have admin access to the project
- Try creating bucket with a different name first

### If policies fail:
- Make sure RLS is enabled on storage.objects
- Check for existing policies that might conflict
- Try dropping and recreating policies

### If uploads still fail:
- Check the bucket permissions in Storage settings
- Verify the file size is under 10MB
- Ensure file type is allowed 