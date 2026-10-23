# FormFit — Cloudflare Workers + D1

نسخه مستقل فرم‌فیت برای حساب Cloudflare خودتان. شامل صفحه ورود ایمیلی و گوگل، دیتابیس D1، برنامه و ثبت تمرین، پنل مدیریت، جست‌وجوی منابع و نقشه تعاملی ۱۳ گروه عضلانی است. سایت فعلی و دیتابیس آن تغییر نکرده‌اند. اطلاعات کاربران نسخه Sites یا VPS داخل این بسته نیست.

## مسیر نصب

Node.js 24 و pnpm 11.25.0 نصب کنید. بسته را استخراج کنید و در پوشه formfit-cloudflare این فرمان‌ها را اجرا کنید:

```sh
pnpm install --frozen-lockfile
pnpm exec wrangler login
pnpm exec wrangler d1 create formfit
```

شناسه database_id برگشتی را جای شناسه نمونه در `wrangler.jsonc` قرار دهید. Binding باید `DB` بماند. Worker name را در صورت نیاز تغییر دهید. APP_ORIGIN را نشانی واقعی HTTPS بدون مسیر بگذارید، مانند `https://formfit.your-subdomain.workers.dev` یا دامنه اختصاصی خودتان. نشانی نمونه، نشانی فعال نیست.

برای ثبت‌نام اولیه ALLOW_REGISTRATION را `true` کنید، سپس:

```sh
pnpm db:remote
pnpm build
pnpm deploy
```

این فرمان‌ها دیتابیس حساب Cloudflare شما را ایجاد/به‌روز و Worker را منتشر می‌کنند. قبل از اجرای migrations روی دیتابیس دارای اطلاعات، پشتیبان بگیرید. فایل‌های SQL موجود را پس از اجرا تغییر ندهید؛ مهاجرت جدید اضافه کنید. دامنه اختصاصی را در Cloudflare Workers → Settings → Domains & Routes متصل کنید و APP_ORIGIN را هم به همان دامنه تغییر دهید، دوباره build/deploy کنید.

نیازی به VPS، Docker، Caddy یا SQLite روی دیسک سرور نیست. فایل‌های frontend همراه Worker منتشر می‌شوند. این پروژه یک سایت static صرف برای Pages نیست.

## حساب مدیر

در `/signin` حساب خود را ثبت کنید و ورود با رمز آن را بررسی کنید. سپس فقط از کامپیوتری که به حساب Cloudflare شما مجاز است اجرا کنید:

```sh
node scripts/admin.mjs YOUR_EMAIL --remote
```

خروجی باید همان ایمیل و نقش admin را نشان دهد. اگر حساب وجود نداشته باشد چیزی ارتقا نمی‌یابد. این فرمان فقط برای حسابی است که خودتان ساخته و مالکیت ورودش را بررسی کرده‌اید؛ ایمیل به‌تنهایی تأییدشده محسوب نمی‌شود. سپس `/admin` را باز کنید. برای دوستان ALLOW_REGISTRATION=true بماند؛ برای بستن ثبت‌نام false کنید و دوباره build/deploy کنید. هیچ رمز مدیر پیش‌فرضی وجود ندارد.

## ورود گوگل

در Google Cloud یک OAuth client از نوع Web Application بسازید. Redirect URI دقیقاً:

```text
https://YOUR-DOMAIN/api/auth/google/callback
```

GOOGLE_CLIENT_ID را در vars فایل wrangler.jsonc بگذارید. Client Secret فقط با فرمان زیر وارد Secrets شود:

```sh
pnpm exec wrangler secret put GOOGLE_CLIENT_SECRET
pnpm build
pnpm deploy
```

کلید را در سورس یا چت قرار ندهید. برای حالت آزمایشی Google، کاربران آزمایش را در تنظیم consent اضافه کنید. گوگل بدون تنظیم دو مقدار فعال نیست. حساب محلی با همان ایمیل خودکار با Google ادغام نمی‌شود؛ برای جلوگیری از تصاحب حساب، روش ورود قبلی را استفاده کنید. اتصال دستی دو روش ورود و ارسال ایمیل تأیید/فراموشی رمز در این نسخه پیاده‌سازی نشده‌اند.

## اجرای توسعه و بررسی

```sh
cp .dev.vars.example .dev.vars
pnpm db:local
pnpm dev
```

`.dev.vars` فقط برای توسعه و نباید منتشر شود. APP_ORIGIN را مطابق پورت محلی قرار دهید. برای بررسی‌های خودکار:

```sh
pnpm typecheck
pnpm build
pnpm test:worker
pnpm test:integration
pnpm exec wrangler deploy --dry-run
```

آزمون‌های خودکار از دیتابیس موقت Miniflare استفاده می‌کنند و به داده واقعی دست نمی‌زنند. تست integration خروجی `dist/server` را اجرا می‌کند؛ قبل از آن build لازم است.

## لاگ و عیب‌یابی

```sh
pnpm logs
```

Observability روشن است. خطای کنترل‌نشده با شناسه پیگیری و نام مسیر ثبت می‌شود؛ بدنه درخواست، رمز، کوکی و توکن در logger افزوده‌شده ثبت نمی‌شوند. Cloudflare ممکن است متادیتای درخواست را با تنظیمات پلتفرم خود نگه دارد؛ دسترسی لاگ‌ها را محدود کنید. پاسخ عمومی خطا جزئیات داخلی را نمایش نمی‌دهد. خطای منبع بیرونی با نام میزبان/وضعیت ثبت می‌شود. canceled همیشه باگ نیست؛ ممکن است درخواست قبلی با جست‌وجوی جدید یا خروج کاربر لغو شده باشد.

خطای D1 binding: DB و database_id را بررسی کنید. خطای no such table: migrations را روی همان دیتابیس remote اجرا کنید. خطای 403 هنگام ذخیره: APP_ORIGIN باید دقیقاً با origin مرورگر برابر باشد. خطای ورود Google: redirect URI، Secret و کاربران آزمایش را بررسی کنید. خطای CPU exceeded: مصرف واقعی را بررسی کنید؛ حد منابع پلن رایگان ممکن است برای جست‌وجوی چندمنبعی یا هش رمز کافی نباشد. امنیت هش رمز را برای کاهش مصرف پایین نیاورید.

## پشتیبان

```sh
pnpm exec wrangler d1 export DB --remote --output=./formfit-backup.sql
```

پشتیبان حاوی اطلاعات خصوصی است؛ خارج از public و مخزن Git نگهداری کنید. برای بازیابی، ابتدا دیتابیس جدید خالی بسازید، SQL را به آن import و بررسی کنید؛ سپس binding را جابه‌جا کنید. روی دیتابیس فعال بدون برنامه بازیابی import نکنید. بکاپ و انتقال دیتابیس قبلی خودکار انجام نشده است. رمزهای VPS از نوع scrypt هستند ولی انتقال حساب‌ها و نگاشت شناسه‌ها نیاز به مهاجرت جدا دارد.

## ساختار و محدودیت‌ها

- `worker.ts`: ورودی Worker، سقف ۲۵۶ کیلوبایت بدنه درخواست، خطای عمومی و پاک‌سازی روزانهٔ نشست/وضعیت OAuth/محدودیت تلاش منقضی.
- `db/` و `drizzle/`: Drizzle روی D1 و تمام SQLهای ساخت دیتابیس.
- `lib/local-auth.mjs`: scrypt، نشست با توکن تصادفی و ذخیره هش، کنترل Origin، نقش دیتابیس و محدودیت تلاش مبتنی بر IP واقعی Cloudflare.
- `lib/google-auth.mjs`: code + PKCE، state یک‌بارمصرف، nonce و اعتبارسنجی ID token.
- `lib/data/`: بانک‌های آموزشی؛ عمداً داخل خروجی نگه داشته شده‌اند.
- `app/`: صفحات و API؛ `public/`: دارایی‌های مرورگر و موتور دوربین.
- نقشه بدن انیمیشن برجسته‌سازی دارد؛ مدل سه‌بعدی اجرای تمرین نیست.
- اتصال MCP/ایجنت قدیمی Sites منتقل نشده و endpoint آن غیرفعال است. پاسخ‌گویی مدیر به درخواست‌ها باقی است.
- دوربین و بعضی ویدئوها مدل/رسانه را از منابع بیرونی می‌گیرند؛ در دسترس بودن آن‌ها در شبکه کاربر تضمین نشده است.
- نصب روی Cloudflare تضمین رفع فیلتر یا رایگان‌بودن مصرف در هر مقیاس نیست. هیچ سرویس پولی در این تحویل فعال نشده است.
- این بسته در حساب Cloudflare شما منتشر نشده است؛ نیازمند ورود شما، ساخت D1 و تنظیم دامنه/Google است.

راهنمای VPS و گزارش‌های قدیمی موجود در docs/tests مربوط به تاریخچه پروژه‌اند؛ مرجع این بسته README و VALIDATION جدید است.

منابع: https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/ ، https://developers.cloudflare.com/d1/get-started/ ، https://developers.cloudflare.com/workers/runtime-apis/nodejs/crypto/ ، https://developers.google.com/identity/openid-connect/openid-connect
