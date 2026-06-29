# منصة العمران 🏗️

منصة متكاملة لإدارة المشاريع العقارية والإنشائية مع نظام اشتراكات للعملاء المميزين.

## المميزات

- **نظام أدوار**: مستخدم / مدير بصلاحيات مختلفة
- **إضافة المشاريع**: نموذج إضافة وانتظار موافقة الإدارة مع إرسال رابط التسويق
- **العملاء المميزون**: 3 باقات (125/250/350 ريال) مع دفع بواسطة Stripe أو إيصال تحويل
- **شات الفريق**: محادثة مباشرة بين المستخدمين والإدارة عبر Supabase Realtime
- **الإشعارات**: إشعارات فورية للمستخدمين والإدارة
- **RTL عربي**: واجهة عربية كاملة

## التقنيات

- **Frontend**: Next.js 14 (App Router) + TypeScript
- **UI**: Tailwind CSS + shadcn/ui
- **Backend**: Supabase (Auth + PostgreSQL + Realtime + Storage)
- **Payments**: Stripe (Subscriptions + Webhooks)
- **Forms**: React Hook Form + Zod

## شجرة الملفات

```
omran-platform/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx            # صفحة تسجيل الدخول
│   │   └── register/page.tsx         # صفحة إنشاء الحساب
│   ├── (dashboard)/
│   │   ├── layout.tsx                # تخطيط لوحة المستخدم
│   │   ├── dashboard/page.tsx        # الصفحة الرئيسية للمستخدم
│   │   ├── add-project/page.tsx      # إضافة مشروع جديد
│   │   ├── clients/page.tsx          # العملاء المميزون + الدفع
│   │   ├── chat/page.tsx             # شات الفريق
│   │   └── notifications/page.tsx    # إشعارات المستخدم
│   ├── admin/
│   │   ├── layout.tsx                # تخطيط لوحة الإدارة
│   │   ├── dashboard/page.tsx        # إحصائيات الإدارة
│   │   ├── projects/page.tsx         # إدارة المشاريع
│   │   ├── clients/page.tsx          # إدارة العملاء
│   │   ├── users/page.tsx            # إدارة المستخدمين
│   │   └── notifications/page.tsx    # إرسال إشعارات
│   ├── api/
│   │   ├── stripe/
│   │   │   ├── checkout/route.ts     # إنشاء جلسة Stripe
│   │   │   └── webhook/route.ts      # معالج Stripe Webhook
│   │   └── ...
│   ├── payment/
│   │   └── success/page.tsx          # صفحة نجاح الدفع
│   ├── layout.tsx                    # تخطيط التطبيق الرئيسي
│   ├── globals.css                   # الأنماط العامة
│   └── page.tsx                      # إعادة توجيه الرئيسية
├── components/
│   ├── shared/
│   │   ├── Sidebar.tsx               # الشريط الجانبي (مستخدم + مدير)
│   │   ├── MarkAllReadButton.tsx     # زر تعليم كل الإشعارات كمقروءة
│   ├── admin/
│   │   ├── AdminProjectActions.tsx   # قبول/رفض/حذف مشروع
│   │   ├── AdminClientActions.tsx    # قبول/رفض/حذف عميل
│   │   ├── AdminUserActions.tsx      # تغيير دور/حذف مستخدم
│   │   └── SendNotificationForm.tsx  # إرسال إشعار للمستخدمين
├── hooks/
│   └── useNotifications.ts          # hook للإشعارات الفورية
├── lib/
│   ├── supabase/
│   │   ├── client.ts                 # Supabase browser client
│   │   └── server.ts                 # Supabase server + admin client
│   ├── stripe.ts                     # Stripe client + تعريف الباقات
│   └── utils.ts                      # دوال مساعدة
├── types/
│   └── index.ts                      # TypeScript types
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql    # مخطط قاعدة البيانات الكامل
├── middleware.ts                     # حماية المسارات + التحقق من الدور
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── postcss.config.mjs
└── .env.local.example
```

## الإعداد

### 1. إنشاء مشروع Supabase

1. انتقل إلى [supabase.com](https://supabase.com) وأنشئ مشروعاً جديداً
2. من لوحة التحكم، انتقل إلى **SQL Editor** وانسخ محتوى `supabase/migrations/001_initial_schema.sql` ونفّذه
3. من **Settings > API** احفظ:
   - `Project URL`
   - `anon public key`
   - `service_role key`

### 2. إعداد Stripe

1. انتقل إلى [stripe.com](https://stripe.com) وأنشئ حساباً
2. من **Developers > API Keys** احفظ المفاتيح
3. لتطوير Webhook محلياً: `stripe listen --forward-to localhost:3000/api/stripe/webhook`

### 3. إعداد متغيرات البيئة

```bash
cp .env.local.example .env.local
```

عدّل `.env.local` بالقيم الفعلية:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. التشغيل

```bash
# تثبيت الحزم
npm install

# تشغيل في بيئة التطوير
npm run dev
```

### 5. إنشاء حساب مدير

بعد التسجيل، شغّل هذا SQL في Supabase لمنح دور المدير:

```sql
UPDATE profiles SET role = 'admin' WHERE email = 'your-admin@email.com';
```

## مسارات التطبيق

| المسار | الوصف | الدور |
|--------|-------|-------|
| `/login` | تسجيل الدخول | الجميع |
| `/register` | إنشاء حساب | الجميع |
| `/dashboard` | الصفحة الرئيسية | مستخدم |
| `/add-project` | إضافة مشروع | مستخدم |
| `/clients` | الاشتراك كعميل مميز | مستخدم |
| `/chat` | شات الفريق | الجميع |
| `/notifications` | الإشعارات | مستخدم |
| `/admin/dashboard` | إحصائيات الإدارة | مدير |
| `/admin/projects` | إدارة المشاريع | مدير |
| `/admin/clients` | إدارة العملاء | مدير |
| `/admin/users` | إدارة المستخدمين | مدير |
| `/admin/notifications` | إرسال إشعارات | مدير |

## النشر على Vercel

```bash
npm install -g vercel
vercel
```

أضف متغيرات البيئة في لوحة تحكم Vercel، وعدّل `NEXT_PUBLIC_APP_URL` إلى الدومين الفعلي.

لإعداد Stripe Webhook في الإنتاج: أضف endpoint `https://your-domain.com/api/stripe/webhook` في لوحة Stripe مع حدث `checkout.session.completed` و `invoice.payment_failed`.
