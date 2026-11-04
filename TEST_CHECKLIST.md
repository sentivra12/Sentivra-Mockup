# ✅ Sentivra CMS - Test Checklist

Complete this checklist after setup to verify everything works.

---

## 🔍 Connection Test

- [ ] Open http://localhost:5174
- [ ] Yellow "Missing Supabase Configuration" banner is GONE
- [ ] No red errors in browser console (F12)
- [ ] Page loads in under 2 seconds

---

## 📄 Public Pages Load

- [ ] **Homepage** (http://localhost:5174)
  - [ ] Shows 3 trust badges
  - [ ] Shows 9 services
  - [ ] Shows sample projects
  - [ ] Shows "Why Choose Us" section

- [ ] **Services** (http://localhost:5174/services)
  - [ ] Lists all 9 services
  - [ ] Each has an icon and description
  - [ ] Can filter by category

- [ ] **Service Detail** (click any service)
  - [ ] Shows service details
  - [ ] Shows key features list
  - [ ] Has "Request Consultation" button

- [ ] **Our Work** (http://localhost:5174/our-work)
  - [ ] Shows sample projects
  - [ ] Has category filters
  - [ ] Shows client logos
  - [ ] Has testimonials slider

- [ ] **Mockups** (http://localhost:5174/mockups)
  - [ ] Shows mockup grid
  - [ ] Has category filters
  - [ ] Search box works
  - [ ] FAQs appear at bottom

- [ ] **About** (http://localhost:5174/about)
  - [ ] Shows countries section
  - [ ] Shows timeline
  - [ ] Shows company values
  - [ ] Shows stats strip

- [ ] **Contact** (http://localhost:5174/contact)
  - [ ] Form loads correctly
  - [ ] Country dropdown works
  - [ ] All fields present
  - [ ] FAQs appear at bottom

---

## 🔐 Admin Login

- [ ] Go to: http://localhost:5174/admin
- [ ] Login page appears
- [ ] Can enter email and password
- [ ] Click "Sign In" button
- [ ] Redirects to dashboard (not error page)
- [ ] Dashboard shows:
  - [ ] Sidebar menu
  - [ ] Stats cards (Total Services, Projects, etc.)
  - [ ] Recent messages section
  - [ ] Quick actions buttons

---

## ➕ Add Content Test

### Test 1: Add a Service

- [ ] Click **Services** in sidebar
- [ ] Click **Add Service** button
- [ ] Form opens with all fields
- [ ] Fill in:
  - Title: "Test Web Development"
  - Category: "Web & Mobile"
  - Short Description: "Professional web development services"
  - Icon: Select "Code" from dropdown
- [ ] Click **Save**
- [ ] Green toast appears: "Service created successfully"
- [ ] New service appears in list
- [ ] Go to http://localhost:5174/services
- [ ] New service is visible on public site

### Test 2: Upload an Image

- [ ] Edit the service you just created
- [ ] Scroll to **Image** field
- [ ] Click **Choose File**
- [ ] Select any JPG or PNG image
- [ ] Click **Save**
- [ ] Green toast: "Service updated successfully"
- [ ] Image preview appears in form
- [ ] Go to http://localhost:5174/services
- [ ] Image shows on service card

### Test 3: Add a Project

- [ ] Click **Projects** in sidebar
- [ ] Click **Add Project**
- [ ] Fill in:
  - Title: "Test E-commerce Website"
  - Category: "Web Apps"
  - Short Description: "Modern e-commerce platform"
  - Technologies: Add "React", "Node.js"
- [ ] Upload an image
- [ ] Click **Save**
- [ ] Go to http://localhost:5174/our-work
- [ ] Project appears in grid

### Test 4: Add a Mockup

- [ ] Click **Mockups** in sidebar
- [ ] Click **Add Mockup**
- [ ] Fill in:
  - Title: "Restaurant Website Design"
  - Category: "Restaurant & Food"
  - Description: "Modern restaurant website mockup"
  - Premium: Check "Is Premium"
- [ ] Upload an image
- [ ] Click **Save**
- [ ] Go to http://localhost:5174/mockups
- [ ] Mockup appears in grid
- [ ] Has "Premium" badge

### Test 5: Add a Testimonial

- [ ] Click **Testimonials** in sidebar
- [ ] Click **Add Testimonial**
- [ ] Fill in:
  - Client Name: "John Doe"
  - Role: "CEO at TechCorp"
  - Text: "Excellent service, highly recommend!"
  - Rating: 5 stars
- [ ] Click **Save**
- [ ] Go to http://localhost:5174/our-work
- [ ] Scroll to testimonials slider
- [ ] New testimonial appears

### Test 6: Add a FAQ

- [ ] Click **FAQs** in sidebar
- [ ] Click **Add FAQ**
- [ ] Fill in:
  - Page: "Services"
  - Question: "Do you offer maintenance?"
  - Answer: "Yes, we provide ongoing maintenance and support."
- [ ] Click **Save**
- [ ] Go to http://localhost:5174/services
- [ ] Scroll to FAQ section
- [ ] New FAQ appears

---

## 📧 Contact Form Test

- [ ] Go to: http://localhost:5174/contact
- [ ] Fill in form:
  - Full Name: "Test User"
  - Country: "Egypt"
  - Phone: "+20 123 456 7890"
  - WhatsApp: Check "Same as phone"
  - Email: "test@example.com"
  - Project Details: "I need a website for my business"
- [ ] Click **Send Message**
- [ ] Green toast appears: "Message Sent Successfully!"
- [ ] Form clears after submission
- [ ] Go to: http://localhost:5174/admin/messages
- [ ] New message appears with:
  - [ ] Orange "New" status badge
  - [ ] Correct name and details
  - [ ] Today's date

### View and Update Message

- [ ] Click on the message
- [ ] Details modal opens
- [ ] All fields are visible
- [ ] Click status dropdown
- [ ] Change to "Read"
- [ ] Badge changes to blue "Read"
- [ ] Close modal
- [ ] Go back to http://localhost:5174/contact
- [ ] Submit another message
- [ ] It appears in admin messages

---

## 🔄 Update & Delete Test

### Edit Service

- [ ] Go to: http://localhost:5174/admin/services
- [ ] Click ✏️ edit icon on any service
- [ ] Change the title
- [ ] Click **Save**
- [ ] Go to public services page
- [ ] Title updated on public site

### Unpublish Service

- [ ] Edit any service
- [ ] Uncheck "Is Active"
- [ ] Click **Save**
- [ ] Go to public services page
- [ ] Service is now hidden
- [ ] Go back to admin and re-activate it
- [ ] Service appears on public site again

### Delete Service

- [ ] In admin services list
- [ ] Click 🗑️ delete icon on test service
- [ ] Confirm deletion
- [ ] Service removed from list
- [ ] Go to public services page
- [ ] Service no longer appears

---

## 🎨 Image Upload Test

- [ ] Edit any service with an image
- [ ] Click **Choose File**
- [ ] Upload different image
- [ ] Click **Save**
- [ ] Image updates in admin
- [ ] Go to public page
- [ ] New image shows immediately

---

## 🔍 Search & Filter Test

### Mockups Search

- [ ] Go to: http://localhost:5174/mockups
- [ ] Type "restaurant" in search box
- [ ] Only restaurant mockups show
- [ ] Clear search
- [ ] All mockups appear again

### Category Filter

- [ ] Click "Business" category
- [ ] Only business mockups show
- [ ] Click "All Mockups"
- [ ] All categories show again

### Projects Filter

- [ ] Go to: http://localhost:5174/our-work
- [ ] Click "Web Apps" filter
- [ ] Only web app projects show
- [ ] Click "All Projects"
- [ ] All projects appear

---

## 🚨 Error Handling Test

### Logout Test

- [ ] In admin dashboard
- [ ] Click **Logout** button
- [ ] Redirects to login page
- [ ] Try to access: http://localhost:5174/admin/services
- [ ] Should redirect to login (not crash)

### Invalid Login

- [ ] Go to: http://localhost:5174/admin
- [ ] Enter wrong password
- [ ] Error message appears (not blank page)
- [ ] Can try again

### Empty Form Submit

- [ ] Go to: http://localhost:5174/contact
- [ ] Click **Send Message** without filling form
- [ ] Red validation errors appear
- [ ] Form doesn't submit

### Network Offline Test

- [ ] Open DevTools (F12)
- [ ] Go to Network tab
- [ ] Set to "Offline"
- [ ] Reload page
- [ ] Should show error message (not blank page)
- [ ] Set back to "Online"
- [ ] Page works again

---

## 📊 Summary

**Total Tests:** 50+

**Must Pass:** All public pages, admin login, add service, contact form

**Optional:** Can skip delete/unpublish tests if basic CRUD works

**Time to Complete:** 15-20 minutes

---

## ✅ All Tests Passed?

If yes, your CMS is **fully operational**! 🎉

**What works:**
- ✅ Database connected
- ✅ All public pages load with data
- ✅ Admin dashboard fully functional
- ✅ Can add/edit/delete content
- ✅ Images upload successfully
- ✅ Contact form saves to database
- ✅ Changes appear immediately on site

**You can now:**
1. Replace sample content with real data
2. Upload your actual images
3. Invite team members to admin
4. Go live with the site!

---

## ❌ Some Tests Failed?

### Check:
1. `.env.local` has correct Supabase credentials
2. All SQL migrations ran successfully
3. Storage buckets created with public access
4. User has admin role in user_roles table
5. Browser console for specific errors

### Get Help:
- See `QUICK_START.md` for step-by-step setup
- See `BLANK_PAGE_FIX.md` for troubleshooting
- Check browser console (F12) for error details
