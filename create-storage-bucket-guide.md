# Create Documents Storage Bucket

## Step 1: Create the Documents Table
1. Go to your Supabase Dashboard
2. Click on **"SQL Editor"** in the left sidebar
3. Click **"New Query"**
4. Copy and paste the contents of `create-documents-table.sql`
5. Click **"Run"** to execute the script

## Step 2: Create the Documents Storage Bucket
1. In your Supabase Dashboard, click on **"Storage"** in the left sidebar
2. Click **"Create a new bucket"**
3. Fill in the details:
   - **Bucket name**: `documents`
   - **Public bucket**: ✅ (check this box)
   - **File size limit**: `10MB`
   - **Allowed MIME types**: 
     - `application/pdf`
     - `image/jpeg`
     - `image/png`
     - `image/jpg`
     - `image/gif`
4. Click **"Create bucket"**

## Step 3: Set Storage Policies
After creating the bucket, you need to set up storage policies:

### Go to Storage > Policies and run these SQL commands:

```sql
-- Allow public access to read documents
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'documents');

-- Allow authenticated users to upload documents
CREATE POLICY "Authenticated users can upload documents" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'documents' AND auth.role() = 'authenticated');

-- Allow users to update their own documents
CREATE POLICY "Users can update own documents" ON storage.objects 
FOR UPDATE USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to delete their own documents
CREATE POLICY "Users can delete own documents" ON storage.objects 
FOR DELETE USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);
```

## Step 4: Test the Setup
1. Visit: `http://localhost:3001/api/test/storage-bucket`
2. You should see: `"bucketExists": true`
3. Try registering a tradesperson with a profile picture
4. Check the `documents` table and `tradespeople` table for the uploaded data

## What This Enables:
- ✅ Profile picture uploads
- ✅ ID document uploads
- ✅ Insurance document uploads
- ✅ Qualification document uploads
- ✅ Trade card uploads
- ✅ All documents tracked in database
- ✅ Public URLs for profile pictures
- ✅ Secure file storage with proper permissions 