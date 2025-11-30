# Admin Account Setup Guide

## 🔐 Creating Your Admin Account

### Step 1: Register Your Admin Account

1. **Start the dev server** (if not already running):
   ```bash
   npm run dev
   ```

2. **Open the app** in your browser (usually `http://localhost:5173`)

3. **Go to Settings** (click the Settings icon in the navigation)

4. **Register a new account**:
   - **Email**: `admin@coursetracker.com` (or use your own email)
   - **Password**: `Admin@123456` (or choose your own secure password)
   - Click **Register**

5. **Check your email** for confirmation (if using real email)
   - If using a test email, you can skip email confirmation in Supabase settings

### Step 2: Make Yourself Admin in Supabase

1. **Go to your Supabase Dashboard**: https://supabase.com/dashboard

2. **Select your project**

3. **Go to Table Editor** (left sidebar)

4. **Open the `profiles` table**

5. **Find your user** (the one you just registered)

6. **Edit the row**:
   - Set `is_admin` to `true` (check the checkbox)
   - Click **Save**

### Step 3: Verify Admin Access

1. **Refresh your app** in the browser

2. **Go to Settings**

3. **You should now see**:
   - 🟣 **Admin** button next to Logout
   - This confirms you have admin privileges

4. **Click the Admin button** to access the Admin Dashboard

## 📋 Admin Features

### Admin Dashboard (`/admin`)

- **Manage Global Announcements**: Set messages that appear on all users' dashboards
- **View System Stats**: (Future feature)
- **Manage Users**: (Future feature)

### How to Use Admin Dashboard

1. **Navigate to** `/admin` or click the **Admin** button in Settings

2. **Update Announcement**:
   - Type your message in the text area
   - Click **Save Announcement**
   - All users will see this message on their dashboard

## 🔒 Recommended Admin Credentials

For production use, create a strong admin account:

```
Email: admin@yourdomain.com
Password: [Use a strong password generator]
```

**Security Tips**:
- ✅ Use a unique, strong password (20+ characters)
- ✅ Enable 2FA if available
- ✅ Don't share admin credentials
- ✅ Regularly rotate passwords
- ✅ Use a password manager

## 🧪 Test Admin Account (Development Only)

For local testing, you can use:

```
Email: admin@test.local
Password: TestAdmin123!
```

**⚠️ WARNING**: Never use test credentials in production!

## 🚀 Quick Start Commands

```bash
# 1. Start the app
npm run dev

# 2. Open browser
http://localhost:5173

# 3. Go to Settings
Click Settings icon → Register account

# 4. Set admin in Supabase
Dashboard → Table Editor → profiles → Set is_admin = true

# 5. Access admin panel
Settings → Click "Admin" button
```

## 🔧 Troubleshooting

### "Admin button not showing"
- ✅ Check that `is_admin = true` in the `profiles` table
- ✅ Refresh the page after setting admin
- ✅ Make sure you're logged in

### "Cannot access /admin route"
- ✅ Verify you're logged in
- ✅ Check browser console for errors
- ✅ Ensure Supabase credentials are in `.env.local`

### "Changes not saving"
- ✅ Check Supabase connection
- ✅ Verify RLS policies are set up correctly
- ✅ Check browser console for errors

## 📝 Admin Checklist

- [ ] Supabase project created
- [ ] SQL schema executed
- [ ] `.env.local` configured with Supabase keys
- [ ] Admin account registered in app
- [ ] `is_admin = true` set in Supabase
- [ ] Admin button visible in Settings
- [ ] Admin dashboard accessible
- [ ] Announcement feature working

## 🎯 Next Steps

1. **Test the announcement feature**: Post a test message
2. **Invite users**: Share the app URL
3. **Monitor usage**: Check Supabase dashboard for user activity
4. **Secure your admin account**: Use strong credentials
