# ExpenseTracker
## 🚀 Project opstarten
Elke keer dat je het project wilt starten, volg je deze stappen:
```sh
# 1. Haal de nieuwste wijzigingen op
git pull origin main

# 2. Installeer dependencies (indien nodig)
npm install

# 3. Start de Angular applicatie
ng serve
```
De applicatie zal beschikbaar zijn op `http://localhost:4200/`.

---

# 🚀 Uitbreidingen voor de Expense Tracker

Dit document bevat mogelijke uitbreidingen en verbeteringen voor de Expense Tracker-applicatie. Hieronder staan verschillende ideeën gesorteerd op categorie.

---

## 📌 **1. Functionaliteit uitbreiden**

### ✅ **Verwijderen van transacties (DONE)**
- [x] Functionaliteit toevoegen om transacties te verwijderen
- [x] UI aanpassen zodat verwijderen duidelijk is

### 🔄 **Bewerken van transacties**
- [x] Mogelijkheid om bestaande transacties aan te passen
- [x] Knoppen toevoegen in de UI voor bewerken
- [x] Formulier vooraf invullen bij bewerken

### 📊 **Statistieken & Grafieken**
- [ ] Uitbreiden met meer grafieken (bijv. maandelijkse uitgaven, categorie-verdeling)
- [ ] Pie chart voor categorie-uitgaven
- [ ] Line chart voor saldo over tijd
- [ ] updateChartData() automatisch triggeren via effect() i.p.v. manueel
   ```bash
   import { effect } from '@angular/core';

   effect(() => {
     this.updateChartData();
   });
   ```

### 📂 **Categorieën & Subcategorieën uitbreiden**
- [x] Toevoegen van categorieën en subcategorieën
- [ ] Mogelijkheid om zelf categorieën toe te voegen
- [ ] UI verbeteren voor categorie-keuze

### 📂 **Transacties**
- [ ] Filter op maand/categorie
- [ ] Sorteren op datum / bedrag / categorie
- [ ] Toevoegen van tags of notities aan transacties
- [ ] Zoekfunctie binnen transacties
- [ ] Filtering optimaliseren ( getFilteredTransactions() ):
   ```bash
   if (monthKey !== this.lastSelectedMonth) {
     this.cachedFiltered = ...
     this.lastSelectedMonth = monthKey;
   }
   ```
   Maar je cachet nu enkel de laatste maand. Overweeg:\
   ✅ Verbetering: gebruik een Map<string, Transaction[]> om meerdere maanden te cachen:\
   filteredTransactionCache: Map<string, Transaction[]>

---

## 💾 **2. Data-opslag & Backend**

### 🔗 **Supabase Database Verbeteringen**
- [ ] Validatie toevoegen in backend (geen lege waarden toestaan)
- [ ] Transacties sorteren op datum
- [ ] Timestamps correct verwerken en tonen

### 🔄 **Persistentie uitbreiden**
- [ ] Lokale opslag (localStorage) voor snelle caching
- [ ] Offline-modus: gegevens opslaan en later synchroniseren
- [ ] loadTransactions() -> Voeg caching toe voor categoriesMap en subcategoriesMap
- [ ] filteredTransactions wordt vaak herberekend -> Je gebruikt een getter filteredTransactions, die elke keer opnieuw filtert op basis van selectedMonth.
      Deze wordt impliciet vaak opnieuw getriggerd in de template én door updateBalance() en updateChartData().
      Dit kan leiden tot onnodige re-computations, zeker als je een grote lijst transacties hebt.
- [ ] State management of memorization (Angular houdt alles in de component zelf. Voor performance:)
      #Voeg een dedicated service toe voor state (TransactionStoreService), waarin je transacties, categorieën en maand-selectie opslaat, en enkel subscribes in je component.
      Of gebruik bij grotere apps een lib zoals NgRx of SignalStore.


---

## 🎨 **3. UI & UX Verbeteringen**

### 🎭 **Extra pagina's**
- [ ] Aparte pagina voor uitgaven
- [ ] Aparte pagina voor inkomsten
- [ ] Aparte pagina voor overzichtllllllllllllllll

### 🎭 **Thema en Styling**
- [ ] UI verbeteren met Material UI of Tailwind CSS
- [ ] Animaties voor betere gebruikerservaring

### 📱 **Responsiveness & Mobile**
- [ ] UI optimaliseren voor mobiele weergave
- [ ] Mobiel menu toevoegen

---

## 🚀 **4. Extra Features**

### 🔔 **Notificaties & Reminders**
- [ ] Meldingen voor aankomende betalingen
- [ ] E-mail of push notificaties integreren

### 💰 **Budget Planning**
- [ ] Budget per categorie instellen
- [ ] Wekelijkse of maandelijkse budgetlimieten
- [ ] Waarschuwingen bij overschrijding

### 📜 **Export & Import van Data**
- [ ] Exporteren naar CSV of Excel
- [ ] Importeren van bestaande financiële gegevens

---

## 🌍 **5. Toekomstige Integraties**

### 🏦 **Bank Integratie**
- [ ] Automatisch transacties importeren via Open Banking API
- [ ] Bankrekening koppelen voor realtime saldo

### 📈 **AI & Slimme Analyses**
- [ ] AI-gedreven uitgave-voorspellingen
- [ ] Slimme bespaartips genereren

---

## ✅ **Volgende Stappen**
Wil je een uitbreiding aanpakken? Maak een aparte branch en werk daar verder aan!

1. **Nieuwe branch maken**
   ```bash
   git checkout -b feature-nieuwe-functionaliteit
   ```
2. **Code aanpassen en committen**
   ```bash
   git add .
   git commit -m "Nieuwe feature toegevoegd: [beschrijving]"
   ```
3. **Push naar GitHub en pull request openen**
   ```bash
   git push origin feature-nieuwe-functionaliteit
   ```

---

## 🔀 Branches Mergen
Als je een feature-branch hebt afgerond en wilt samenvoegen met de `main` branch:
```sh
# 1. Schakel over naar de main branch
git checkout main

# 2. Haal de nieuwste wijzigingen op
git pull origin main

# 3. Schakel over naar jouw feature branch
git checkout mijn-feature-branch

# 4. Merge de main branch in jouw feature branch (los eventuele conflicten op)
git merge main

# 5. Ga terug naar de main branch en merge de feature branch
 git checkout main
git merge mijn-feature-branch

# 6. Push de wijzigingen naar GitHub
git push origin main
```
Als je een pull request gebruikt, kun je de wijzigingen eerst pushen en via de GitHub-interface mergen.

---

📌 Laatste update: *07/04/2024*
