# Dubai Visa Services Portal — Client Guide

> **Owner note:** Before sending this file to the client, fill in `ADMIN_USERNAME`, `ADMIN_PASSWORD`, and `SUPPORT_PHONE` where marked with `[...]`.

---

## 1. Important Links

| What | URL |
|---|---|
| Website (home) | https://frontend-nine-gold-31.vercel.app/ |
| Track application | https://frontend-nine-gold-31.vercel.app/track |
| Admin panel (CRM) | https://visa-production-a0b7.up.railway.app/admin/ |
| Admin login | Username: `[ADMIN_USERNAME]` · Password: `[ADMIN_PASSWORD]` |

---

## 2. How to Test the Website (5 minutes)

1. **Home page** — Select Citizen: **India**, Travelling From: **UAE**, Destination: **Dubai**, then click **Search Visas**. You should see 3 visa cards with live prices.
2. Click **Apply Now** on any card and fill the form:
   - Select Citizen **Pakistan** → a **National ID section (Section 3)** appears. Select **India** → it disappears. This conditional logic is intentional — please test both.
   - Upload a passport scan and photo (JPG/PNG/PDF, max 5 MB each).
   - Tick the declaration checkbox and **Submit**. You will get a **reference number** (like `DXB-2026-000123`). **Note it down.**
3. The **Payment page** opens a Razorpay popup (UPI / cards / NetBanking). Complete a test payment.
4. The **Confirmation page** shows your reference card. The **Download Receipt** button downloads a real receipt file.
5. Open the **Track page**, enter your reference number → your application status card appears (`pending` → after admin approval, `approved`).

---

## 3. Admin Panel (CRM) Guide

**Tip:** At the bottom of every edit page there is a **"Frontend Live Preview"** section showing the live website page where that item appears. Always press **Save** first, then refresh the preview.

### 3.1 Pricings (most important)
- **Add Pricing**: select Visa type + Citizen country. Leave **Travelling From** and **Destination** empty = base price for everyone. To charge a different price for a specific route (e.g. India → UAE → Dubai), fill From/Destination too — an exact match always wins, otherwise the base price applies.
- **The price you enter is exactly what the customer is charged.** Enter it carefully.
- Countries/visas with no pricing show a "Contact us" message on the site (this is correct behavior, not a bug).
- Prices can also be edited directly in the list, without opening each row.

### 3.2 Countries
- Name, slug, landing text. **Never change the slug afterwards** — page URLs will break.
- **National ID toggle**: when ON, that country's form requires a National ID number + upload.
- Deactivating a country hides it from all dropdowns and lists.

### 3.3 Visa Types
- Name, duration, entry type, category, processing time, validity, description. Deactivating hides it everywhere.

### 3.4 Destinations
- Appear in the Home and Apply dropdowns. Adding a new one shows it in both places immediately.

### 3.5 FAQs
- Set **Category** to `visa` (shows on visa detail pages) or `track` (shows on the Track page). Use **Order** (1, 2, 3…) for sequence. Empty categories stay hidden on the site.

### 3.6 Requirements
- Leave **Country empty** = shown for every country (passport scan, photo, return ticket). Select a **Country** = extra item shown only there. Use a Material Symbols icon name (e.g. `menu_book`, `face`, `badge`) and **Order** for sequence.

### 3.7 Site Settings
- Key must be exactly `support_phone`, value is the real phone number (e.g. `+91 98200 12345`). It updates 5 places on the site (helpdesk boxes, payment page, confirmation page, footers). If the key is missing, the number stays hidden.

### 3.8 Applications (daily work)
- The list can be searched (reference / name / passport) and filtered (status / payment / date).
- Open a row → change **Status** (`under_review` → `approved` / `rejected`) → Save. The customer's Track page updates instantly.
- The **Payments** section shows amount, Razorpay order/payment IDs and status per application (managed automatically by webhooks — do not edit by hand).

---

## 4. Important Notes

- **Prices = real money.** Whatever is in Pricing is what Razorpay charges. Delete test applications after testing.
- **Never edit slugs** (country / visa / destination links will break).
- Support phone number: `[SUPPORT_PHONE]` (changeable in Site Settings).
- If anything behaves unexpectedly, contact your developer with the page URL and a screenshot — do not guess values in Admin.
