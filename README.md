# StockFlow — دليل النشر والتشغيل

## بنية المشروع

```
stockflow-project/
├── index.html              الصفحة الرئيسية
├── css/style.css            التنسيقات (تم فصلها عن HTML)
├── js/app.js                منطق التطبيق (تم فصله عن HTML)
├── js/chart.umd.min.js      مكتبة الرسوم البيانية (مستضافة محليًا، بدون CDN خارجي)
├── js/firebase-config.js    ⚠️ يجب تعديل هذا الملف (انظر أدناه)
├── js/firebase-init.js      طبقة الاتصال بـ Firebase (Auth + Firestore)
├── database.rules.json      قواعد أمان Realtime Database
├── _headers                 رؤوس أمان HTTP لـ Cloudflare Pages
└── README.md                هذا الملف
```

## 1) النشر على Cloudflare Pages

المشروع جاهز للرفع مباشرة:

1. من لوحة Cloudflare → **Workers & Pages** → **Create Application** → **Pages** → **Upload assets**.
2. ارفع كل محتويات مجلد `stockflow-project` (وليس المجلد نفسه — الملفات التي بداخله).
3. اضغط **Deploy**.

بعد الرفع مباشرة سيعمل الموقع في **وضع العرض التجريبي (Demo Mode)**:
بيانات تجريبية جاهزة، وتسجيل دخول بالحساب:
`admin` / `123456`

هذا يعني أن الموقع "يعمل فورًا دون أي تعديل"، حتى قبل ربطه بـ Firebase.

## 2) ربط المشروع بـ Firebase (Authentication + Firestore)

هذه الخطوة **يجب أن تنفذها أنت**، لأنها تتطلب مشروع Firebase خاص بك — لا يمكن لأي طرف ثالث (بما في ذلك أنا) إنشاء أو تخمين بيانات اعتماد Firebase نيابة عنك، فهي مرتبطة بحسابك على Google.

### الخطوات:

1. افتح [console.firebase.google.com](https://console.firebase.google.com) وأنشئ مشروعًا جديدًا (أو استخدم مشروعًا قائمًا).
2. من **Project Settings → General → Your apps**، أضف "Web App" وانسخ بيانات `firebaseConfig`.
3. افتح ملف `js/firebase-config.js` واستبدل قيم `apiKey` / `authDomain` / `projectId` / `appId`
   بالقيم التي نسختها. (`databaseURL` معبّأ مسبقًا برابط قاعدة البيانات التي أرسلتها.)
4. من قائمة Firebase الجانبية:
   - **Authentication → Sign-in method** → فعّل **Email/Password**.
   - **Realtime Database** → تأكد من وجودها (موجودة فعلًا حسب الرابط الذي أرسلته).
5. انشر ملف `database.rules.json` المرفق:
   - إما عبر Firebase CLI: `firebase deploy --only database`
   - أو بلصق محتواه يدويًا في **Realtime Database → Rules** بلوحة التحكم.
6. أضف مستخدمًا واحدًا على الأقل من **Authentication → Users** (بريد إلكتروني + كلمة مرور).
7. أعد رفع الملفات (أو فقط `js/firebase-config.js`) إلى Cloudflare Pages.

بعد ذلك:
- تسجيل الدخول بأي **بريد إلكتروني** (يحتوي على `@`) سيستخدم Firebase Authentication الحقيقي.
- تسجيل الدخول باسم المستخدم التجريبي `admin` سيستمر بالعمل كوضع عرض تجريبي (لن يُستخدم مع Firebase).
- بيانات وحدتي **المخزون (Inventory)** و **المستودعات (Warehouses)** ستُقرأ وتُكتب مباشرة من/إلى Realtime Database تلقائيًا.

## 3) نطاق الربط الحالي مع Firestore — مهم

تم ربط **المخزون** و **المستودعات** بشكل كامل مع Realtime Database (قراءة وكتابة تلقائية عند أي إضافة/تعديل/حذف).

الوحدات التالية لا تزال تعمل ببيانات تجريبية محلية فقط (كما كانت في النموذج الأولي الأصلي)، لأن ربطها الكامل بقاعدة بيانات حقيقية يتطلب قرارات تصميم إضافية (مخطط البيانات، صلاحيات كل دور، اختبار كل شاشة) تتجاوز نطاق هذه الجولة من التحسينات:

- المبيعات وعروض الأسعار
- المشتريات
- طلبات الصرف
- المشاريع
- المستخدمون
- الإشعارات

يمكنني إكمال ربط هذه الوحدات تباعًا في جلسات لاحقة باستخدام نفس النمط المطبق على المخزون والمستودعات (`js/firebase-init.js` + `withFirestoreSync`، والاسم لا يزال كما هو رغم التحويل لـ Realtime Database)، فقط أخبرني بأي وحدة تريد البدء بها.

## 4) ملاحظات أمان مهمة

- **كلمات المرور في وضع العرض التجريبي غير آمنة** (مجرد ترميز Base64، وليس تشفيرًا حقيقيًا). هذا مقبول للعرض التجريبي فقط. بمجرد ربط Firebase Authentication، تصبح كلمات المرور الحقيقية مُدارة ومشفّرة بالكامل من طرف Google.
- ملف `database.rules.json` المرفق يسمح بالقراءة/الكتابة لأي مستخدم مسجّل دخول فقط (لا يوجد تمييز حسب الدور حاليًا) — يمكن تخصيصه لاحقًا حسب الحاجة.
- تمت إضافة رؤوس أمان HTTP (`_headers`) تشمل Content-Security-Policy وX-Frame-Options وغيرها.

## 5) ما تم إصلاحه في هذه المراجعة

- إصلاح خطأ HTML: سمة `class` مكررة على عنصر الشعار.
- إصلاح خطأ HTML: عنصر `<div>` داخل `<button>` (غير مسموح في HTML5) — تم تحويله إلى `<span>`.
- إصلاح ترميز `&` غير المهرّب في رابط خطوط Google.
- فصل CSS وJavaScript عن ملف HTML الواحد إلى ملفات منظمة (تحسين الأداء والصيانة).
- استضافة مكتبة Chart.js محليًا بدلاً من الاعتماد على CDN خارجي (يحل مشكلة "فشل تحميل CDN" التي رُصدت سابقًا في فحص التوافق مع الجوال).
- إضافة رؤوس أمان HTTP لـ Cloudflare Pages.
- إضافة تكامل حقيقي مع Firebase Authentication وRealtime Database (المخزون والمستودعات).

## 6) رفع المشروع على GitHub

المجلد جاهز الآن كمستودع Git (تم تهيئته بأمر `git init` وأول Commit). لرفعه:

1. أنشئ مستودعًا جديدًا وفارغًا على GitHub (بدون README أو .gitignore تلقائي).
2. من داخل مجلد المشروع، نفّذ:
   ```bash
   git remote add origin https://github.com/USERNAME/REPO_NAME.git
   git branch -M main
   git push -u origin main
   ```
3. بعدها يمكنك ربط المستودع مباشرة بـ Cloudflare Pages (Cloudflare → Pages → Create → **Connect to Git**) بدلًا من الرفع اليدوي، وسينشر تلقائيًا مع كل Commit جديد.

**ملاحظة:** ملف `js/firebase-config.js` غير محمي بـ `.gitignore` عمدًا — قيم إعداد الويب في Firebase (`apiKey`, `authDomain`, إلخ) ليست سرية بطبيعتها ويمكن رؤيتها من أي متصفح على أي حال؛ الحماية الحقيقية تأتي من `database.rules.json`.

## 7) نشر قواعد Realtime Database عبر Firebase CLI (بديل عن النسخ اليدوي)

المشروع يحتوي الآن على `firebase.json` و`.firebaserc` جاهزين (مرتبطين بمشروعك `stook-flow`). إذا كان عندك Node.js مثبّت:

```bash
npm install -g firebase-tools
firebase login
firebase deploy --only database
```

هذا يقرأ محتوى `database.rules.json` وينشره تلقائيًا في مشروعك — نفس نتيجة النسخ واللصق اليدوي في لوحة التحكم، لكن أسرع في التحديثات المستقبلية.
