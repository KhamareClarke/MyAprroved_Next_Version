# Test Both Quote Requests and Messages

## Testing Steps:

### 1. Test Quote Requests:
1. Go to `http://localhost:3001/find-tradespeople`
2. Click "Get Quote" on any tradesperson
3. Fill out the form and submit
4. **First time**: Should show success message
5. **Second time with same email**: Should show duplicate prevention message

### 2. Test Messages:
1. Go to any tradesperson profile page
2. Click "Send Message" 
3. Fill out the form and submit
4. **First time**: Should show success message  
5. **Second time with same email**: Should show duplicate prevention message

## Expected Results:

✅ **First submission**: "Quote request sent successfully!" or "Message sent successfully!"
✅ **Duplicate submission**: "You have already sent a quote request/message to this tradesperson. Please wait for their response."

## What to Check:
- [ ] Quote request works first time
- [ ] Quote request blocks duplicate
- [ ] Message works first time  
- [ ] Message blocks duplicate
- [ ] Both show friendly error messages
- [ ] No server errors in console