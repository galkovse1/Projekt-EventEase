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
     npm install cloudinary # 2024-05-11: dodano za upload slik (Cloudinary)
     npm install multer # 2024-05-11: dodano za upload slik
     npm install multer-storage-cloudinary # 2024-05-11: dodano za upload slik (ni nujno, če ne uporabljaš direktno)
     npm install streamifier # 2024-05-11: dodano za upload slik (stream upload)
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
     npm install react-helmet-async # 2024-05-11: dinamičen naslov zavihka (SPA)
     ```

3. **Če imate težave z namestitvijo:**
   - Izbrišite `node_modules` mapo in `package-lock.json` datoteko
   - Ponovno zaženite `npm install`
   - Preverite, če imate pravilno verzijo Node.js (najnovejša LTS)




## Trenutne funkcionalnosti projekta

### 0. Omejen dostop za neprijavljene uporabnike
- Če uporabnik **ni prijavljen**, lahko **samo gleda dogodke**.
- Ne more ustvarjati dogodkov, urejati dogodkov ali se prijavljati na dogodke.
- Če neprijavljen uporabnik poskusi dostopati do teh funkcij, je preusmerjen na prijavo.

### 1. Prijava prek Auth0
- Uporabnik se lahko prijavi izključno prek Auth0.
- Sistem pozna identiteto uporabnika na podlagi njegovega Auth0 ID-ja.

### 2. Kreiranje dogodkov (če si prijavljen)
- Prijavljen uporabnik lahko ustvari nov dogodek.
- Dogodek se shrani v bazo skupaj z `ownerId` (Auth0 ID ustvarjalca).

### 3. Prikaz ustvarjenih dogodkov v koledarju na profilu
- Uporabniku se na njegovem **profilu prikaže koledar** z dogodki, ki jih je sam ustvaril.

### 4. Urejanje profila
- Uporabnik lahko ureja svoj profil.

### 5. Prijava/Odjava na dogodek
- Vsak uporabnik se lahko **prijavi** ali **odjavi** na dogodek.

### 6. Nastavitve dogodka s strani ustvarjalca
- Ustvarjalec dogodka lahko določi:
  - Ali so prijave dovoljene ali ne.
  - Maksimalno število prijavljenih uporabnikov.

### 7. Upravljanje s prijavljenimi
- Ustvarjalec dogodka lahko **briše prijavljene uporabnike** s svojega dogodka.

### 8. Urejanje in brisanje dogodka
- Ustvarjalec lahko **ureja** ali **izbriše** svoj dogodek.
- Drugi uporabniki lahko dogodek **samo vidijo**.
  
### 9. Javni ali zasebni dogodki
 - Ustvarjalec bo lahko izbral, ali je dogodek javen (viden vsem) ali zaseben (viden le povabljenim).
  
### 10. E-mail opomniki  
 - Uporabniki bodo prejeli opomnike po e-pošti za bližajoče se dogodke.

### 11.Filtriranje dogodkov 
 - Dodana bo možnost filtriranja dogodkov po datumu, tipu, ustvarjalcu ipd.

### 12.Klik na datum → skok na dogodek 
  - V koledarju bo omogočen klik na datum, ki bo uporabnika preusmeril na podrobnosti dogodka.

## Načrtovane funkcionalnosti in izboljšave(kaj še pride)


- **Nalaganje slik (Cloudinary)**  
  Uporabniki bodo lahko naložili profilne slike in slike za dogodke preko storitve Cloudinary.
  
- **Dodana funkcionalnost polla za odločabje datuma(če kreator zbere to opcijo)**  

- **Izboljšan uporabniški vmesnik profila**  
  Vizualna prenova in več možnosti za urejanje uporabniškega profila.

- **Splošna vizualna prenova (frontend)**  
  Celoten vmesnik bo grafično izboljšan z boljšim UX/UI dizajnom.

- **Deploy backend aplikacije**  
  Načrtovana objava backend strežnika preko Render ali Railway.

- **Deploy frontend aplikacije**  
  Načrtovana objava React aplikacije preko Vercel.


