# Dubai Visa Services Portal — Client Handover Guide

> **Owner note:** Is file ko client ko bhejne se pehle `ADMIN_USERNAME`, `ADMIN_PASSWORD` aur support phone number wali jagah bhar dena (neeche `[...]` me marked hai).

---

## 1. Website Links

| What | URL |
|---|---|
| Website (home) | https://frontend-nine-gold-31.vercel.app/ |
| Track application | https://frontend-nine-gold-31.vercel.app/track |
| Admin panel (CRM) | https://visa-production-a0b7.up.railway.app/admin/ |
| Admin login | Username: `[ADMIN_USERNAME]` · Password: `[ADMIN_PASSWORD]` |

---

## 2. User Flow — kaise test karein (5 min)

1. **Home** kholo → Citizen: **India**, Travelling From: **UAE**, Destination: **Dubai** → **Search Visas**
   - 3 visa cards with live prices dikhne chahiye.
2. Kisi card pe **Apply Now** → form bharo:
   - Citizen **Pakistan** select karne pe **Section 3 (National ID)** appear hota hai, India pe nahi — ye conditional logic hai, test karo.
   - Passport + photo upload karo (JPG/PNG/PDF, max 5 MB each).
   - Attestation checkbox tick karke **Submit** → reference number milega (format `DXB-2026-XXXXXX`). **Ise note kar lo.**
3. **Payment page** pe Razorpay popup khulega (UPI / cards / NetBanking) → test payment karo.
4. **Confirmation page** pe reference card + **Download Receipt** button hai (real receipt file download hoti hai).
5. **Track page** pe reference daalo → status card dikhega (`pending` → admin approve kare to `approved`).

---

## 3. Admin Panel (CRM) Guide

Admin ke **har edit page ke neeche "Frontend Live Preview"** section hai — usme **live website ka iframe** dikhta hai ki ye detail site pe kahan dikhegi. Pehle **Save** karo, phir preview refresh karo.

### 3.1 Pricings (sabse important)
- **Add Pricing**: Visa type + Citizen country select karo. **Travelling From** aur **Destination** khali chhodo = base price (sab ke liye). Kisi specific route ke liye alag rate chahiye to From/Destination bhi select karo — exact match jeetega, nahi to base price lagega.
- **Price wahi amount hai jo customer se charge hoga.** Sochke dalo.
- Jiski pricing nahi hogi, us country pe site "Contact us" dikhayegi (koi fake price nahi).
- List me price **inline edit** hota hai (bina page khole).

### 3.2 Countries
- Name, slug (slug **kabhi change mat karna** — URLs toot jayengi), content (landing text).
- **National ID toggle**: ON = us country ke form me National ID number + upload mandatory ho jayega.
- Deactivate = lists/dropdowns se gayab.

### 3.3 Visa Types
- Name, duration, entry type, category, processing time, validity, description. Deactivate = gayab.

### 3.4 Destinations
- Home + Apply ke dropdowns me dikhte hai. Naya add karoge to dono jagah aa jayega.

### 3.5 FAQs
- Category `visa` = Visa detail page pe, `track` = Track page pe. **Order** se sequence. Khaali hai to section hidden rehta hai.

### 3.6 Requirements
- **Country khali** = har country pe dikhega (passport scan, photo, ticket jaise common docs). **Country select** = sirf us country pe extra item.
- Icon me Material Symbols naam likho (jaise `menu_book`, `face`, `badge`).

### 3.7 Site Settings
- Key exactly `support_phone`, value me real number (jaise `+91 98200 12345`). Site pe 5 jagah (helpdesk, payment, confirmation, footers) update ho jayega. Key missing hai to number hidden rehta hai.

### 3.8 Applications (roz ka kaam)
- List me **search** (reference / naam / passport), **filter** (status / payment / date).
- Row kholo → **Status** badlo (`under_review` → `approved` / `rejected`) → Save. User ke Track page pe turant reflect hoga.
- **Payments** section me har application ka amount, Razorpay order/payment id aur status dikhta hai (read-only — webhook manage karta hai).

---

## 4. Important Notes

- **Prices = real money.** Jo Pricing me daloge wahi Razorpay charge karega. Test ke baad test applications delete kar dena.
- **Slugs kabhi edit mat karna** (country / visa / destination ke links toot jayenge).
- Support phone number: `[SUPPORT_PHONE]` (Site Settings me change hota hai).
- Koi bhi doubt ho to apne developer se poocho — blindly values mat badlo.
