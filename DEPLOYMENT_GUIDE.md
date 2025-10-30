# 🚀 Deployment Guide - keyboard Game to Vercel + GoDaddy

## Quick Overview

You're going to:
1. Deploy to Vercel (free hosting with HTTPS)
2. Connect your GoDaddy domain
3. Share with friends!

---

## 📦 STEP 1: Deploy to Vercel

### Option A: Deploy via Vercel CLI (Command Line)

1. **Install Vercel CLI on your local machine:**
```bash
npm install -g vercel
```

2. **Login to Vercel:**
```bash
vercel login
```
Enter your email - you'll get a verification link.

3. **Deploy from your computer:**

First, copy the `/app/frontend` folder to your local machine, then:

```bash
cd /path/to/frontend
vercel --prod
```

Follow the prompts:
- **Set up and deploy?** → Yes
- **Which scope?** → Your account
- **Link to existing project?** → No
- **What's your project's name?** → keyboard-game (or your choice)
- **In which directory is your code located?** → ./
- **Override settings?** → No

**You'll get a URL like:** `https://keyboard-game.vercel.app`

---

### Option B: Deploy via Vercel Dashboard (No Code Needed - Easier!)

1. **Go to:** https://vercel.com
2. **Sign up/Login** with GitHub, GitLab, or email
3. Click **"Add New Project"**
4. Click **"Import Git Repository"**
   
   **If you have GitHub connected:**
   - Select your repository
   - Vercel auto-detects React app
   - Click **"Deploy"**
   
   **If no GitHub (deploy from local):**
   - Use Vercel CLI method above OR
   - Push to GitHub first, then import

---

## 🌐 STEP 2: Connect Your GoDaddy Domain

Once deployed to Vercel, here's how to connect your GoDaddy domain:

### In Vercel Dashboard:

1. Go to your project on Vercel
2. Click **"Settings"** → **"Domains"**
3. Enter your domain (e.g., `keyboard.yourdomain.com` or `yourdomain.com`)
4. Click **"Add"**
5. Vercel will show you DNS records to add

### In GoDaddy:

1. **Login to GoDaddy** (https://godaddy.com)
2. Go to **"My Products"** → Find your domain
3. Click **"DNS"** or **"Manage DNS"**

4. **Add these DNS records:**

   **For Subdomain (e.g., keyboard.yourdomain.com):**
   ```
   Type: CNAME
   Name: keyboard
   Value: cname.vercel-dns.com
   TTL: 600 (10 minutes)
   ```

   **For Root Domain (e.g., yourdomain.com):**
   ```
   Type: A
   Name: @
   Value: 76.76.21.21
   TTL: 600
   ```
   
   AND
   
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   TTL: 600
   ```

5. **Save all records**
6. **Wait 10-60 minutes** for DNS propagation

### Verify in Vercel:

- Go back to Vercel → Domains
- It should show ✅ when DNS is configured correctly
- Your domain will now point to your keyboard game!

---

## 🎯 STEP 3: Share With Friends!

Once deployed, share your URL:

**Your Live URL:**
- `https://keyboard-game.vercel.app` (Vercel default)
- OR `https://keyboard.yourdomain.com` (your custom domain)

**What friends can do:**
1. Visit the URL on any device
2. Play the game in browser
3. Install as PWA:
   - **iPhone:** Safari → Share → Add to Home Screen
   - **Android:** Chrome → Menu → Install app
   - **Desktop:** Install icon in address bar

---

## 📱 Test Before Sharing

Before sending to friends, test:

1. **Visit your URL** on different devices
2. **Test PWA installation:**
   - Can you add to home screen?
   - Does it work offline after first visit?
3. **Play the game:**
   - Does the keyboard work?
   - Do stats save?
   - Can you complete all 5 words?

---

## 🔄 Update Your App Later

When you make changes:

**Via CLI:**
```bash
cd /app/frontend
yarn build
vercel --prod
```

**Via GitHub:**
- Push changes to GitHub
- Vercel auto-deploys (if connected)

---

## ⚙️ Environment Variables (If Needed Later)

If you add backend features later:

1. In Vercel Dashboard → Settings → Environment Variables
2. Add: `REACT_APP_BACKEND_URL`
3. Value: Your backend API URL
4. Redeploy

---

## 💡 Pro Tips

1. **Use a subdomain** (keyboard.yourdomain.com) to keep your main domain free
2. **Enable Analytics** in Vercel to see visitor stats
3. **Set up custom 404 page** if you want
4. **Add meta tags** for better social sharing (Open Graph)

---

## 🐛 Troubleshooting

### "Domain not working"
- Wait 1-2 hours for DNS propagation
- Check DNS records are exact
- Clear browser cache

### "PWA not installing"
- Ensure deployed on HTTPS (Vercel has this)
- Check service worker in DevTools
- Try on actual mobile device (not simulator)

### "Build failed"
- Check for console errors
- Run `yarn build` locally first
- Check all imports are correct

---

## 📊 After Deployment Checklist

- [ ] App loads on Vercel URL
- [ ] Custom domain connected (if using)
- [ ] PWA installs on mobile
- [ ] Offline mode works
- [ ] Game is playable
- [ ] Stats persist
- [ ] Shared with friends!

---

## 🎉 You're Ready!

Your keyboard game is now:
- ✅ Deployed online
- ✅ Accessible on any device
- ✅ Installable as PWA
- ✅ Ready to share!

**Next Steps:**
1. Complete the Vercel deployment
2. Add your GoDaddy domain
3. Test thoroughly
4. Share the URL with friends!

---

## Need Help?

- **Vercel Docs:** https://vercel.com/docs
- **GoDaddy DNS Help:** https://www.godaddy.com/help/add-a-cname-record-19236
- **Vercel + Custom Domain:** https://vercel.com/docs/concepts/projects/domains

Good luck! 🚀
