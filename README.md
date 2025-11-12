# Student CRM Demo

A lightweight student relationship management demo showcasing landing, authentication, and dashboard experiences using HTML, CSS, JavaScript, PHP, and MySQL.

## ✨ Features

- Landing page inspired by the supplied design with dark/light theme toggle.
- Account registration capturing basic details plus security question/answer.
- Login with PHP sessions and plain-text password comparison (hashing removed per project requirement).
- Forgot password flow verifying security answer before password reset.
- Authenticated dashboard with demo metrics, notifications, and logout.
- Dynamic course catalog with 30+ curated classes, one-click enrollment, and a dedicated course preview page.

## 📁 Folder Structure

```
Student-Management/
├── index.html
├── css/
│   ├── style.css
│   ├── landing.css
│   ├── auth.css
│   ├── dashboard.css
│   └── course.css
├── js/
│   ├── config.js
│   ├── theme.js
│   ├── auth.js
│   ├── dashboard.js
│   └── course.js
├── pages/
│   ├── login.html
│   ├── register.html
│   ├── forgot-password.html
│   ├── dashboard.html
│   └── course.html
├── php/
│   ├── db-connect.php
│   ├── login.php
│   ├── register.php
│   ├── forgot-password.php
│   ├── logout.php
│   └── courses.php
├── database/
│   └── schema.sql
├── php.ini
└── README.md
```

### Key Files at a Glance

- `index.html` – Landing page structure.
- `css/style.css` – Shared variables and base styling used across pages.
- `css/landing.css`, `css/auth.css`, `css/dashboard.css` – Page-specific styling for landing, auth flows, and the dashboard respectively.
- `js/theme.js` – Theme toggle logic and persistence.
- `js/auth.js` – Front-end form handling for register/login/forgot password flows.
- `js/dashboard.js` – Dashboard interactivity, session enforcement, and live course catalog management.
- `js/course.js` – Fetches individual course information and handles enrollment from the preview page.
- `pages/course.html` – Lightweight course spotlight page reached from the catalog.
- `php/db-connect.php` – Central MySQL connection configuration.
- `php/register.php` – Creates new accounts; saves passwords/security answers in plain text.
- `php/login.php` – Authenticates users using plain-text password comparison and starts sessions.
- `php/forgot-password.php` – Retrieves recovery questions, validates answers (case-insensitive), and updates passwords in plain text.
- `php/logout.php` – Destroys the active session.
- `php/courses.php` – Supplies the catalog, enrolled listings, and enrollment API endpoints.
- `database/schema.sql` – Defines the database, seeds the course catalog, and creates the `user_courses` join table with denormalized course names.
- `php.ini` – Optional development PHP configuration enabling MySQL extensions and verbose errors.

## 🛠️ Prerequisites

- PHP 7.4+ (for running the endpoints locally).
- MySQL 5.7+/8.0+.
- Modern browser (Chrome, Edge, Firefox, etc.).

## 🗄️ Database Setup

1. Open MySQL command-line or a GUI (phpMyAdmin, MySQL Workbench, etc.).
2. Run the script located at `database/schema.sql` to create the `student_crm` database, the core `users` table, and seed the `courses` / `user_courses` tables that power the dashboard catalog.

```sql
SOURCE path/to/Student-Management/database/schema.sql;
```

3. (Optional) Insert a starter account for testing (password and security answer are stored in plain text):

```sql
INSERT INTO users (first_name, last_name, email, password, security_question, security_answer)
VALUES (
   'Demo',
   'User',
   'demo@example.com',
   'DemoPass123!',
   'What is your first school's name?',
   'Greenwood High'
);
```

> ⚠️ **Security note:** Passwords and security answers are intentionally stored exactly as submitted. Do not reuse sensitive credentials; add hashing before deploying to production.

## 🔧 Configure Database Credentials

1. In MySQL Workbench, open **Database ▸ Manage Connections** and highlight your local instance (see the screenshot in this project notes). Copy the host, port, username, and password values shown there.
2. Open `php/db-connect.php` in your editor (this file centralizes the PHP ↔ MySQL connection used by every endpoint).
3. Update the values to mirror the connection you use in MySQL Workbench (`127.0.0.1`, port `3306`, username `root`, password `XXXXXXX`). The database name must remain `student_crm` unless you create a database with a different name in `schema.sql`.

```php
$host = '127.0.0.1';   // Hostname taken from MySQL Workbench > Manage Server Connections
$username = 'root';    // Username used in Workbench
$password = 'XXXXXX'; // Password stored for the local MySQL instance
$database = 'student_crm'; // Schema created by database/schema.sql
```

> **Tip:** If you secure MySQL with a different password later, update the `$password` value here and in your Workbench connection at the same time so both stay in sync.

## 🧩 Configure PHP & Extensions

The repository includes a ready-to-use PHP configuration file at `php.ini` (located in the project root). Follow these steps so PHP can talk to MySQL via `mysqli`/`pdo_mysql`:

1. Locate your PHP installation directory (for example `C:\php` or `C:\Program Files\php-8.4.13`).
2. Back up the existing `php.ini` if you already have one.
3. Copy the project’s `php.ini` into that directory and overwrite (or merge the contents manually if you have other custom settings).
4. Open the copied file and confirm the extension path matches your installation:
   ```ini
   extension_dir = "C:\php\ext"       ; Update this if PHP lives somewhere else
   extension=mysqli                     ; Enables the mysqli driver
   extension=pdo_mysql                  ; Enables PDO MySQL, used for future expansion
   ```
   • If PHP is installed under `C:\Program Files\php-8.4.13`, change the path to `"C:\Program Files\php-8.4.13\ext"` (remember to wrap it in quotes).  
   • Leave the remaining directives as-is—they enable error reporting suitable for local development.
5. Refresh the PATH environment variable without closing PowerShell:
   ```powershell
   $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
   ```
6. Verify the extensions are active:
   ```powershell
   php -m | Select-String mysqli
   ```
   You should see `mysqli` in the output. If not, re-check the `extension_dir` path and ensure the `php_mysqli.dll` file exists inside that folder.

## 🚀 Run Locally

```powershell
php -S localhost:8000
```

3. Visit `http://localhost:8000/index.html` in your browser.

> The JavaScript fetch calls target the PHP endpoints via relative paths (e.g., `../php/login.php`). Keeping the PHP server root at the project root preserves these paths.

## 🔐 Authentication Flow

1. **Register** a new account via `pages/register.html`.
2. **Login** using the credentials; success redirects to the dashboard while errors appear in modals.
3. **Forgot password**: supply your email, answer the security question, then set a new password.
4. **Logout**: from the dashboard navigation; the session clears and you return to the landing page.

> All three flows (register, login, forgot-password) were verified with the bundled `php.ini` configuration and a local MySQL 8.0 instance configured through Workbench.

## 🎨 Theming

- The theme toggle (`theme.js`) persists the chosen mode using `localStorage`.
- Buttons and cards automatically adapt to the active theme via CSS variables.

## 🧪 Testing Notes

- Manual smoke testing is recommended after configuring the database:
   - Registration with new email.
   - Login with valid/invalid credentials.
   - Forgot password flow with matching and mismatching answers.
   - Logout and session expiry (refresh dashboard after logout should redirect to login).
   - Dashboard course catalog loads at least 30 courses and allows enrolling into a new class.

## 📌 Troubleshooting

- **CORS / Network Errors**: Ensure you access pages through the PHP server (`php -S`) rather than opening the HTML files directly.
- **Database Connection Errors**: Double-check credentials in `php/db-connect.php` and confirm the MySQL service is running.
- **PHP extension errors**: If you see `Class "mysqli" not found` or startup warnings about `php_mysqli.dll`, confirm you copied the provided `php.ini` into your PHP install, updated `extension_dir`, and that `php -m | Select-String mysqli` returns a match.
- **Session Issues**: PHP sessions require cookies; confirm the browser accepts them and that requests include `credentials: 'include'` (already handled in the scripts).

## ✅ Requirements Coverage

- Landing, login, registration, dashboard, and forgot password screens implemented with the provided UI direction.
- PHP endpoints now store passwords and security answers in plain text while still using prepared statements and session management.
- Dashboard pulls personalized enrollments, syncs one-click course enrollment back to MySQL, and exposes a lightweight course preview page.
- README documents structure, setup, run instructions, and clarifies the intentional credential storage change.

Enjoy exploring the Student CRM demo! 🎓
