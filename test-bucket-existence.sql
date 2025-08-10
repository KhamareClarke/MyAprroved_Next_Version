-- Test Documents Bucket Existence
-- This will help debug why profile pictures aren't being uploaded

-- Check if we can access storage buckets
-- Note: This might not work in SQL editor, but will show if bucket exists

-- Alternative: Check if any documents have been uploaded
SELECT 
    COUNT(*) as total_documents,
    doc_type,
    COUNT(*) as count_by_type
FROM documents 
GROUP BY doc_type
ORDER BY count_by_type DESC;

-- Check recent document uploads
SELECT 
    id,
    trade_id,
    doc_type,
    file_path,
    upload_date,
    status
FROM documents 
ORDER BY upload_date DESC
LIMIT 10;

-- Check if documents table exists and has data
SELECT 
    COUNT(*) as total_document_records
FROM documents;

-- Show documents table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'documents'
ORDER BY ordinal_position; 