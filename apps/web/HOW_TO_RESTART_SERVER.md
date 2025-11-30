# 🚨 CRITICAL: How to Restart Development Server

## You're seeing this because of the 404 API error

**Error message:**

```
GET http://localhost:3000/api/meetings 404 (Not Found)
```

---

## 📋 **Quick Fix (2 minutes)**

### **Step 1: Find your terminal**

Look for the terminal/command prompt window where you ran `npm run dev`

It should show something like:

```
- ready started server on 0.0.0.0:3000, url: http://localhost:3000
```

### **Step 2: Stop the server**

1. Click on that terminal window to focus it
2. Press **Ctrl+C** on your keyboard
3. Wait until you see your command prompt return (like `D:\meetsolis>`)

### **Step 3: Restart the server**

Type this command and press Enter:

```bash
npm run dev
```

### **Step 4: Wait for compilation**

You should see messages like:

```
○ Compiling /dashboard ...
✓ Compiled in X seconds
```

**DO NOT** refresh browser yet! Wait for:

```
✓ Ready in X seconds
```

### **Step 5: Hard refresh your browser**

- **Windows/Linux:** Press **Ctrl+Shift+R**
- **Mac:** Press **Cmd+Shift+R**

### **Step 6: Verify it worked**

1. Open DevTools Console (press F12)
2. Look for the API call
3. You should now see:
   - ✅ `GET /api/meetings 200 OK` (success!)
   - OR ✅ `GET /api/meetings 401 Unauthorized` (sign in required - still good!)
   - ❌ NOT: `GET /api/meetings 404 Not Found` (still broken)

---

## ✅ **Success Checklist**

After restart, you should see:

- [ ] Terminal shows "✓ Compiled successfully"
- [ ] Browser shows full dashboard page
- [ ] No 404 errors in Console
- [ ] Meeting History section loads (empty or with meetings)
- [ ] No MIME type errors

---

## ❌ **If Still Broken After Restart**

Try the nuclear option:

```bash
# Stop server (Ctrl+C)
cd D:\meetsolis\apps\web
rm -rf .next
npm run dev
```

This deletes the build cache and forces a complete rebuild.

---

## 🎯 **Why This Happened**

Next.js requires server restart when:

1. ✏️ Environment variables changed in `.env.local`
2. 🗑️ Build cache (`.next` folder) was deleted
3. 📁 New API routes were created
4. 🔄 Major file structure changes

**None of these are hot-reloaded** - they all need a full restart!

---

## 📞 **Still Having Issues?**

If restart doesn't fix it, check:

1. `.env.local` file exists in `D:\meetsolis\apps\web\`
2. It contains this line:
   ```
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```
3. No other process is using port 3000
4. You're signed into the app (authentication required for API)

---

**Last updated:** 2025-10-04
**Issue:** API Route 404 Error
**Severity:** Critical (blocks all testing)
