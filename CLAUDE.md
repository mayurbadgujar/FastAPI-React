# Cureveda — Healthcare Directory App

Full-stack healthcare directory: **React 19 + Vite** frontend, **FastAPI + SQLAlchemy + SQLite** backend.

## Architecture

```
my-cureveda/
├── frontend/my-react-app/   # React app (Vite, port 5173)
│   └── src/
│       ├── Components/      # Pages: about, contact, doctors, patients, login, register
│       ├── Components/layout/  # AuthLayout, MainLayout, PageHeader, ProtectedRoute
│       ├── Navbar/          # Main navigation bar with theme toggle
│       ├── context/         # AuthContext, ThemeContext
│       ├── constants/       # roles.js
│       ├── utils/           # permissions.js, toast.js (showSuccess/showError/getApiErrorMessage)
│       └── api.jsx          # Axios instance (API base URL + JWT interceptor)
├── backend/                 # FastAPI backend (port 8000)
│   ├── core/                # config.py, roles.py, rbac.py, security.py
│   ├── database/            # connection.py, doctor.py, patient.py, user.py, schema_migrations.py
│   ├── routes/              # auth_routes.py, doctor_routes.py, patient_route.py
│   ├── schemas/             # user_schema.py, doctor_schema.py, patient_schema.py
│   ├── services/            # auth_service.py, doctors_service.py, patient_service.py
│   ├── utils/               # jwt_handlers.py
│   ├── tests/               # test_auth_service.py
│   └── main.py              # App entry point
├── .env                     # Backend environment (gitignored)
└── README.md
```

## Key Concepts

### RBAC
- Roles: `ADMIN`, `DOCTOR`, `PATIENT` (see `constants/roles.js` / `core/roles.py`)
- Permissions: `canViewDoctors`, `canManageDoctors`, `canViewPatients`, `canManagePatients`
  - ADMIN: can manage doctors + patients
  - DOCTOR: can view doctors + manage patients
  - PATIENT: can view doctors only

### AG Grid
- Library: `ag-grid-react` v36 + `ag-grid-community`
- Used in `Doctors.jsx` and `Patients.jsx` for data tables
- Edit mode: inline cell editing with `onCellValueChanged`
- Theme: `quartz` (dark/light aware via `ag-theme-quartz` / `ag-theme-quartz-dark`)

### Toast Notifications
- Utility in `utils/toast.js`: `showSuccess()`, `showError()`, `getApiErrorMessage()`
- `getApiErrorMessage` extracts FastAPI validation/detai l errors from response
- `ToastContainer` is rendered in `main.jsx`

## Development Commands

```bash
# Frontend
cd frontend/my-react-app
npm install        # install deps
npm run dev        # start Vite dev server (port 5173)
npm run build      # production build
npm run lint       # ESLint

# Backend
cd backend
pip install -r requirements.txt
python main.py     # start FastAPI server (port 8000)
```

## Environment Variables

**Backend** (`.env` in `backend/`):
- `DATABASE_URL` — SQLite connection string
- `SECRET_KEY` — JWT signing key
- `ALGORITHM` — JWT algorithm (HS256)
- `ACCESS_TOKEN_EXPIRE_MINUTES` — token expiry (30)

**Frontend** (`.env` in `frontend/my-react-app/`):
- `VITE_API_URL` — Backend API base URL (e.g. `http://127.0.0.1:8000`)

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/register` | Public | Register user (first user = admin) |
| POST | `/auth/login` | Public | Login, returns JWT |
| GET | `/auth/current_user` | Auth | Get current user info |
| POST | `/doctors/create` | Admin | Create doctor |
| GET | `/doctors/all` | All roles | List all active doctors |
| GET | `/doctors/{id}` | All roles | Get doctor by ID |
| GET | `/doctors/` | All roles | Search by email or phone |
| PUT | `/doctors/{id}` | Admin | Update doctor |
| DELETE | `/doctors/{id}` | Admin | Soft-delete doctor |
| POST | `/patient/` | Admin/Doctor | Create patient |
| GET | `/patient/all` | Admin/Doctor | List all patients |
| GET | `/patient/{id}` | Admin/Doctor | Get patient by ID |
| PUT | `/patient/{id}` | Admin/Doctor | Update patient |
| DELETE | `/patient/{id}` | Admin/Doctor | Soft-delete patient |
