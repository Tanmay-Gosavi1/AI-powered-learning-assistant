# 🔑 Required Environment Variables for Cloudinary

Add these three variables to your `Server/.env` file:

```env
CLOUD_NAME=your_cloudinary_cloud_name
API_KEY=your_cloudinary_api_key
API_SECRET=your_cloudinary_api_secret
```

## 📋 How to Get These Values:

1. **Sign up** at https://cloudinary.com (Free tier available)
2. Go to your **Dashboard** after logging in
3. Find your credentials:
   - **CLOUD_NAME**: Displayed at the top of the dashboard
   - **API_KEY**: In the "Account Details" section
   - **API_SECRET**: In the "Account Details" section (click "Show" to reveal)

## 📸 Example:

```env
CLOUD_NAME=dwzxabcd123
API_KEY=123456789012345
API_SECRET=abcdefghijklmnopqrstuvwxyz123456
```

## ⚠️ Important Notes:

- Keep your API_SECRET private and never commit it to Git
- The free tier includes:
  - 25 GB storage
  - 25 GB bandwidth per month
  - Perfect for development and small-scale production

## ✅ After Adding:

1. Restart your server
2. Test uploading a PDF document
3. Check your Cloudinary Media Library to see the uploaded file
