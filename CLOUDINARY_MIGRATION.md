# Cloudinary Migration Guide

## Overview
The file upload system has been migrated from local storage (Multer) to Cloudinary cloud storage. This provides better scalability, reliability, and works seamlessly in production/deployment environments.

## Changes Made

### 1. Server-Side Changes

#### Installed Packages
```bash
npm install express-fileupload cloudinary
```

#### New Files Created
- **config/cloudinary.js**: Cloudinary configuration and connection
- **utils/imageUpload.js**: Helper function to upload files to Cloudinary
- **.env.example**: Updated with Cloudinary environment variables

#### Modified Files
- **server.js**: 
  - Added `express-fileupload` middleware
  - Initialized Cloudinary connection
  - Removed static file serving for `/uploads`
  
- **controllers/docController.js**:
  - Updated `uploadDoc` to use Cloudinary instead of Multer
  - Changed file validation to use `req.files` (express-fileupload)
  - Modified `deleteDoc` to delete files from Cloudinary
  
- **routes/docRoute.js**: Removed Multer middleware from upload route

#### Removed Dependencies
- Multer is no longer used (config/multer.js can be removed)

### 2. Client-Side Changes

#### Modified Files
- **pages/Document/DocumentDetailPage.jsx**: Updated PDF URL handling to work with Cloudinary URLs

## Environment Variables Setup

Add the following variables to your `.env` file:

```env
# Cloudinary Configuration
CLOUD_NAME=your_cloudinary_cloud_name
API_KEY=your_cloudinary_api_key
API_SECRET=your_cloudinary_api_secret
```

### How to Get Cloudinary Credentials

1. Sign up for a free account at [https://cloudinary.com](https://cloudinary.com)
2. Go to your Dashboard
3. Copy the following credentials:
   - **Cloud Name**: Found at the top of the dashboard
   - **API Key**: Found in the Account Details section
   - **API Secret**: Found in the Account Details section (click "Show" to reveal)

## File Upload Flow

### Before (Multer)
1. File uploaded via multipart/form-data
2. Multer saves file to `Server/uploads/documents/`
3. Server generates local URL: `http://localhost:8000/uploads/documents/filename.pdf`
4. File stored locally

### After (Cloudinary)
1. File uploaded via multipart/form-data
2. express-fileupload saves to temporary directory (`/tmp/`)
3. File uploaded to Cloudinary folder: `learning-assistant/documents/`
4. Cloudinary returns secure HTTPS URL
5. URL stored in database
6. Temporary file automatically cleaned up

## Benefits

✅ **Scalability**: No local storage constraints  
✅ **Deployment Ready**: Works on Heroku, Vercel, AWS, etc.  
✅ **CDN**: Fast file delivery worldwide  
✅ **Security**: HTTPS URLs with secure access  
✅ **Backup**: Files stored in cloud with redundancy  
✅ **No Server Cleanup**: No need to manage local file storage

## Testing

1. Ensure environment variables are set
2. Restart the server: `npm run dev`
3. Upload a PDF document through the application
4. Verify the file appears in your Cloudinary Media Library
5. Test viewing the PDF in the application
6. Test deleting a document (should remove from Cloudinary)

## Troubleshooting

### Upload Fails
- Check Cloudinary credentials in `.env`
- Ensure `CLOUD_NAME`, `API_KEY`, and `API_SECRET` are correct
- Check file size limits (default: 10MB)

### PDF Not Loading
- Verify the `filePath` in database contains a valid Cloudinary URL
- Check browser console for CORS errors
- Ensure Cloudinary URL is accessible (not private)

### Deployment Issues
- Ensure all environment variables are set in your deployment platform
- Verify `/tmp/` directory is writable (most platforms support this)
- Check Cloudinary account limits (free tier: 25GB storage, 25GB bandwidth/month)

## Rollback (If Needed)

To revert to Multer:
1. Restore `config/multer.js`
2. Update `docRoute.js` to use Multer middleware
3. Restore original `docController.js` logic
4. Remove Cloudinary imports from `server.js`
5. Run `npm uninstall express-fileupload cloudinary`

## Production Checklist

- [ ] Cloudinary account created
- [ ] Environment variables configured in production
- [ ] Test file upload in production
- [ ] Test file viewing in production
- [ ] Test file deletion in production
- [ ] Monitor Cloudinary usage/quota
- [ ] Set up Cloudinary transformations (optional)
