# VendorBridge

> End-to-end procurement management platform — FastAPI + React

## Project Structure

```
VendorBridge/
├── backend/                  # FastAPI Python backend
│   ├── main.py               # App entry point
│   ├── requirements.txt
│   ├── .env.example          → copy to .env
│   └── app/
│       ├── core/
│       │   ├── config.py     # Pydantic settings
│       │   ├── security.py   # JWT + bcrypt
│       │   ├── dependencies.py  # get_current_user, require_role()
│       │   └── enums.py      # UserRole enum
│       ├── models/
│       │   └── user.py       # Pydantic schemas
│       ├── db/
│       │   └── mock_store.py # In-memory store (→ Supabase in Phase 2)
│       └── routers/
│           ├── auth.py       # /api/auth/* (register, login, me)
│           ├── vendors.py
│           ├── rfqs.py
│           ├── quotations.py
│           ├── purchase_orders.py
│           ├── invoices.py
│           └── activity_logs.py
│
└── frontend/                 # React + Vite + Tailwind
    ├── index.html
    ├── tailwind.config.js
    ├── .env.example          → copy to .env
    └── src/
        ├── lib/
        │   └── axios.ts      # Axios instance + interceptors
        ├── types/
        │   └── auth.ts       # TypeScript types
        ├── contexts/
        │   └── AuthContext.tsx  # Auth state + login/register/logout
        ├── components/
        │   └── ProtectedRoute.tsx
        ├── pages/
        │   ├── LoginPage.tsx
        │   ├── RegisterPage.tsx
        │   └── DashboardPage.tsx
        └── App.tsx
```

## Phase 1 — Quick Start

### Backend

```bash
cd backend
cp .env.example .env          # fill in SECRET_KEY

python3 -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt

uvicorn main:app --reload
# API: http://localhost:8000
# Docs: http://localhost:8000/docs
```

### Frontend

```bash
cd frontend
cp .env.example .env

npm install
npm run dev
# App: http://localhost:5173
```

## Roles & Permissions

| Role | Register | RFQs | Quotations | POs | Logs |
|------|----------|------|------------|-----|------|
| `officer` | ✅ | R/W | Read | Read | ✗ |
| `vendor` | ✅ | Read | Submit | Read | ✗ |
| `manager` | ✅ | R/W | R/W | R/W | Read |
| `admin` | ✅ | R/W | R/W | R/W | R/W |

## Demo Credentials (Phase 1 mock)

```
Email:    admin@vendorbridge.com
Password: Admin@1234
```

## Phase 2 Checklist (coming next)

- [ ] Supabase PostgreSQL — wire all tables
- [ ] Replace `mock_store.py` with async Supabase client
- [ ] Full dashboard, vendor list, RFQ creation UI
- [ ] Approval workflow
- [ ] Reports & analytics
