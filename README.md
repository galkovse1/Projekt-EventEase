# Projekt-EventEase

## Namestitev in zagon projekta

### Predpogoji
- Node.js (najnovejša LTS verzija)
- MYSql
- Git
- VS Code ali podoben IDE
- Postman ali podobno orodje za testiranje API-jev

### 1. Namestitev MySQL
1. Med namestitvijo si zapomnite:
   - Geslo za MySQL uporabnika
   - Vrata (port) - privzeto 3306
2. Ustvarite novo bazo podatkov:
```sql
CREATE DATABASE event_planner;
```

### 2. Backend namestitev
1. Pojdite v backend mapo:
```bash
cd backend
```

2. Namestite odvisnosti:
```bash
npm install
```

3. Ustvarite `.env` datoteko v backend(v korenu mape) mapi z naslednjo vsebino:
```env
# Baza podatkov
DB_NAME=event_planner
DB_USER=root ---spremni če je drugačen pri tebi
DB_PASSWORD= --spremni če je drugačen pri tebi
DB_HOST=127.0.0.1 --spremni če je drugačen pri tebi
DB_PORT=3306 --spremni če je drugačen pri tebi
AUTH0_ISSUER_BASE_URL=https://dev-r12pt12nxl2304iz.us.auth0.com
AUTH0_AUDIENCE=https://dev-r12pt12nxl2304iz.us.auth0.com/api/v2/
AUTH0_CLIENT_ID=Uzt64YhWzB0XVnYhxjyG31HOJG0rNaNU
```

4. Zaženite backend:
```bash
npx nodemon index.js
```

### 3. Frontend namestitev
1. Odprite novo terminal okno in pojdite v frontend mapo:
```bash
cd frontend
```

2. Namestite odvisnosti:
```bash
npm install
```

3.Nastavitev Auth0 (.env)

Vsak mora v mapi `frontend` ustvariti datoteko `.env` z naslednjo vsebino:

```
VITE_AUTH0_DOMAIN=dev-r12pt12nxl2304iz.us.auth0.com
VITE_AUTH0_CLIENT_ID=Uzt64YhWzB0XVnYhxjyG31HOJG0rNaNU
VITE_AUTH0_AUDIENCE=https://dev-r12pt12nxl2304iz.us.auth0.com/api/v2/
```

Datoteka `.env` naj bo dodana v `.gitignore` in naj se NE deli javno ali preko gita.

4.Spodaj pod 4 točko so vse knjižnice in za backend in za frontend

5. Zaženite frontend:
```bash
npm run dev
```

### 4. Reševanje težav
1. **Backend ne deluje:**
   - Preverite, če je MySQL zagnan
   - Preverite, če so vse spremenljivke v `.env` pravilno nastavljene
   - Preverite, če so nameščene vse potrebne knjižnice:
     ```bash
     # Backend knjižnice
     npm install express
     npm install cors
     npm install dotenv
     npm install mysql2
     npm install sequelize
     npm install express-oauth2-jwt-bearer
     npm install nodemon --save-dev
     ```

2. **Frontend ne deluje:**
   - Preverite, če je backend zagnan
   - Preverite, če so nameščene vse potrebne knjižnice:
     ```bash
     # Frontend knjižnice
     npm install @auth0/auth0-react
     npm install axios
     npm install react-router-dom
     npm install @types/react-router-dom
     npm install tailwindcss postcss autoprefixer
     npm install @vitejs/plugin-react
     npm install typescript
     ```

3. **Če imate težave z namestitvijo:**
   - Izbrišite `node_modules` mapo in `package-lock.json` datoteko
   - Ponovno zaženite `npm install`
   - Preverite, če imate pravilno verzijo Node.js (najnovejša LTS)

Tedenski plan razvoja

🟢 Teden 1 (ta teden)
-Inicializacija backenda (Node.js + Express)

-Sequelize setup + povezava z PostgreSQL

-Modeli: User, Event, Signup

-Testni API-ji (GET /events, POST /events)

-Lokalna baza + testni dogodki

➡️ Cilj: delujoča povezava z bazo + osnovni API za dogodke

🔵 Teden 2
-Inicializacija frontenda (React + TS)

-Integracija Auth0

-Prikaz dogodkov (GET /events)

-Dodajanje dogodka (POST)

-Validacija (datum ne sme biti v preteklosti)

➡️ Cilj: osnovni frontend z Auth0 + prikaz in dodajanje dogodkov

🟠 Teden 3
-Urejanje in brisanje dogodkov (samo za lastnika)

-Prikaz dogodka po ID-ju

-Cloudinary upload za slike

-Prijava na dogodek (če dovoljena)

➡️ Cilj: dogodek lahko dodaš, urejaš, brišeš, prijaviš

🔴 Teden 4
-Stran "/profile" s podatki uporabnika

-Koledar z označenimi dogodki

-Klik na datum → skok na dogodek

-Dodajanje opisa profila + profilne slike

➡️ Cilj: delujoč profil z integriranim koledarjem

🟣 Teden 5
-E-mail opomniki 1 dan prej (node-cron + nodemailer)

-Backend končna validacija in zaščita (Auth0 JWT)

-Deploy backenda (Render/Railway)

-Deploy frontenda (Vercel)

-Test na pravi povezavi

➡️ Cilj: aplikacija opozarja prijavljene uporabnike in delujoča javna aplikacija s funkcijami

--Končna predstavitev (PowerPoint + demo)
