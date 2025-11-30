# טופס הסכמה לטיפולי קוסמטיקה 💅

אפליקציית React מקצועית לניהול טפסי הסכמה לטיפולי קוסמטיקה עם חתימה דיגיטלית, יצירת PDF ושליחה למייל.

## תכונות

✨ **טופס מקיף** - כל השדות הנדרשים לטיפולי קוסמטיקה
🖊️ **חתימה דיגיטלית** - באמצעות Canvas
📄 **יצירת PDF אוטומטי** - עם jsPDF
📧 **שליחה למייל** - באמצעות EmailJS
🎨 **עיצוב מודרני** - Material-UI (MUI)
📱 **מותאם למובייל** - Responsive Design
🇮🇱 **תמיכה בעברית** - RTL מלא

## התקנה

```bash
# התקנת תלויות
npm install

# הרצת האפליקציה
npm start
```

האפליקציה תיפתח בכתובת: http://localhost:3000

## הגדרת EmailJS

כדי שהשליחה למייל תעבוד, יש להירשם ל-EmailJS ולהגדיר:

1. היכנסי ל-[EmailJS](https://www.emailjs.com/)
2. צרי חשבון חינם
3. הוסיפי שירות אימייל (Gmail, Outlook וכו')
4. צרי תבנית (Template) חדשה
5. העתיקי את הפרטים הבאים:
   - Service ID
   - Template ID
   - Public Key

6. עדכני את הקוד ב-`src/App.js` בשורות 185-189:

```javascript
await emailjs.send(
  'YOUR_SERVICE_ID',      // החליפי עם ה-Service ID שלך
  'YOUR_TEMPLATE_ID',     // החליפי עם ה-Template ID שלך
  templateParams,
  'YOUR_PUBLIC_KEY'       // החליפי עם ה-Public Key שלך
);
```

7. עדכני את המייל של בעלת העסק בשורה 181:
```javascript
to_email: 'YOUR_BUSINESS_EMAIL@example.com',
```

## תבנית EmailJS מומלצת

בתבנית ב-EmailJS, השתמשי במשתנים הבאים:

```
שם לקוחה: {{client_name}}
אימייל: {{client_email}}
טלפון: {{client_phone}}

הטופס המלא מצורף כ-PDF.
```

## מבנה הפרויקט

```
cosmetic-consent-form/
├── public/
│   └── index.html
├── src/
│   ├── App.js          # הקומפוננטה הראשית
│   └── index.js        # נקודת הכניסה
├── package.json
└── README.md
```

## טכנולוגיות

- **React 18** - ספריית UI
- **Material-UI (MUI)** - עיצוב וקומפוננטות
- **react-signature-canvas** - חתימה דיגיטלית
- **jsPDF** - יצירת PDF
- **EmailJS** - שליחת מיילים
- **Emotion** - RTL Support

## שיפורים אפשריים

- 📊 שמירת נתונים ב-Firebase/Database
- 🔐 אימות משתמשים
- 📱 אפליקציית מובייל (React Native)
- 🖨️ הדפסה ישירה
- 📊 דשבורד לניהול טפסים
- 🌐 תמיכה בשפות נוספות

## תמיכה

לשאלות או בעיות, צרי קשר או פתחי Issue ב-GitHub.

---

נבנה עם ❤️ עבור בעלות עסקים קוסמטיים
