# פרויקט מסכם Node.js – Cards REST API

## תיאור הפרויקט

REST API לניהול משתמשים וכרטיסי ביקור עסקיים.

המערכת כוללת:

- הרשמה והתחברות
- JWT Authentication
- הרשאות Admin / Business / Regular User
- ניהול משתמשים
- יצירה, עריכה ומחיקה של כרטיסי ביקור
- Like / Unlike
- MongoDB + Mongoose
- Validation
- Hashing לסיסמאות
- Logging
- File Logger
- חסימת משתמש ל־24 שעות לאחר 3 ניסיונות התחברות שגויים

---

## טכנולוגיות

- Node.js
- Express
- TypeScript
- MongoDB
- Mongoose
- Zod
- bcrypt
- jose
- Pino
- CORS

---

## התקנה והרצה

התקנת החבילות:

```
npm install
```

הגדרות Environment לפי:

```
src/config/.env.example
```

הרצת הפרויקט:

```
npm run dev
```

השרת רץ כברירת מחדל בכתובת:

```
http://localhost:3000
```

Base URL:

```
http://localhost:3000/api/v1
```

---

## Initial Data

בסביבת Development, אם מסד הנתונים ריק, נוצרים:

- 3 משתמשים
- 3 כרטיסי ביקור

סוגי המשתמשים:

- Admin
- Business User
- Regular User

---

## Users API

| Method | URL | הרשאה | פעולה |
|---|---|---|---|
| POST | `/users` | כולם | יצירת משתמש |
| POST | `/users/login` | כולם | התחברות וקבלת JWT |
| GET | `/users` | Admin | קבלת כל המשתמשים |
| GET | `/users/:id` | משתמש עצמו / Admin | קבלת משתמש |
| PUT | `/users/:id` | משתמש עצמו / Admin | עדכון משתמש |
| PATCH | `/users/:id` | משתמש מורשה | שינוי `isBusiness` |
| DELETE | `/users/:id` | משתמש עצמו / Admin | מחיקת משתמש |

---

## Cards API

| Method | URL | הרשאה | פעולה |
|---|---|---|---|
| GET | `/cards` | כולם | קבלת כל הכרטיסים |
| GET | `/cards/my-cards` | משתמש רשום | הכרטיסים שלי |
| GET | `/cards/:id` | כולם | קבלת כרטיס |
| POST | `/cards` | Business / Admin | יצירת כרטיס |
| PUT | `/cards/:id` | בעל הכרטיס | עדכון כרטיס |
| PATCH | `/cards/:id` | משתמש רשום | Like / Unlike |
| DELETE | `/cards/:id` | בעל הכרטיס / Admin | מחיקת כרטיס |

---

## Authentication והרשאות

המערכת משתמשת ב־JWT.

ה־Token כולל:

```
_id
email
isBusiness
isAdmin
```

בבקשות מוגנות:

```
Authorization: bearer YOUR_TOKEN
```

משתמש רגיל אינו יכול ליצור Card או לגשת לפעולות Admin.  
Business User יכול ליצור ולנהל כרטיסים שבבעלותו.  
Admin יכול לבצע פעולות ניהול בהתאם להרשאות.

---

## אבטחת Login

לאחר 3 ניסיונות רצופים עם סיסמה שגויה המשתמש נחסם ל־24 שעות.

בזמן החסימה גם סיסמה נכונה לא מאפשרת Login.

Login מוצלח מאפס את מספר הניסיונות.

---

## bizNumber

בעת יצירת Card חדש נוצר אוטומטית `bizNumber`.

המספר נשמר ב־MongoDB ונשאר קבוע גם לאחר עדכון הכרטיס.

---

## Validation ואבטחת סיסמאות

המערכת משתמשת ב־Zod לצורך Validation.

הסיסמאות עוברות Hashing באמצעות `bcrypt` לפני השמירה ב־MongoDB.

---

## Logging

הפרויקט משתמש ב־Pino.

בנוסף, כל בקשה שמחזירה Status Code של `400` ומעלה נשמרת בקובץ:

```
logs/errors.log
```

ה־log כולל:

- Date
- Method
- URL
- Status Code
- Response Time

---

## Error Handling

בפרויקט קיים Error Handler מרכזי.

קודי HTTP נפוצים:

```
200 - OK
201 - Created
400 - Bad Request
401 - Unauthorized
403 - Forbidden
404 - Not Found
500 - Internal Server Error
```

---

## בדיקות

ניתן לבדוק את ה־API באמצעות:

```
users.rest
cards.rest
```

הבדיקות כוללות:

- Register / Login
- Users CRUD
- Cards CRUD
- Like / Unlike
- Authorization
- Validation
- Login Blocking
- File Logger

---

## Git

לא מועלים ל־Git:

```
node_modules
dist
logs
src/config/.env
src/config/.env.development
src/config/.env.production
src/config/.env.test
```

קיים קובץ דוגמה:

```
src/config/.env.example
```

---

## מחבר

**Pavel Garber**