# CUET-SHCMS Frontend

React + Vite + TypeScript frontend for the Student Hostel Complaint Management System.

## 🚀 Quick Start

### Development
```bash
npm install
npm run dev
```

### Build for Production
```bash
npm run build
npm run preview  # Preview production build locally
```

## 📦 Deployment

### Netlify Deployment

1. **Connect Repository**
   - Go to [Netlify](https://app.netlify.com)
   - Click "Add new site" > "Import an existing project"
   - Connect your GitHub repository

2. **Build Settings**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Environment variable: `VITE_API_BASE_URL=https://shcms-backend.onrender.com/api`

3. **Deploy**
   - Netlify will auto-deploy on every push to main branch
   - Your site will be live at: `https://cuet-shcms.netlify.app`

### Manual Deployment
```bash
npm run build
# Upload the 'dist' folder to your hosting provider
```

## 🌐 Environment Variables

Create `.env` files for different environments:

### `.env.production` (Netlify)
```
VITE_API_BASE_URL=https://shcms-backend.onrender.com/api
VITE_APP_NAME=CUET-SHCMS
VITE_APP_VERSION=1.0.0
```

### `.env.local` (Local Development)
```
VITE_API_BASE_URL=http://localhost:8080/api
VITE_APP_NAME=CUET-SHCMS
VITE_APP_VERSION=1.0.0
```

## 🔧 Configuration Files

- **`netlify.toml`** - Netlify deployment config with redirects
- **`vite.config.ts`** - Vite bundler configuration
- **`tsconfig.json`** - TypeScript configuration

## 📁 Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── Chatbot.tsx
│   ├── Sidebar.tsx
│   └── StatusBadge.tsx
├── views/           # Page components
│   ├── LandingPage.tsx
│   ├── Login.tsx
│   ├── StudentDashboard.tsx
│   ├── StaffDashboard.tsx
│   ├── AdminConsole.tsx
│   └── AIAnalysis.tsx
├── services/        # API service layer
│   └── api.ts
├── types/           # TypeScript type definitions
│   └── index.ts
├── utils/           # Utility functions
│   └── api.ts       # Axios instance & interceptors
├── App.tsx          # Root component
└── main.tsx         # Application entry point
```

## 🔐 Authentication

The app uses JWT token-based authentication:
- Tokens stored in `localStorage`
- Auto-redirect to login on 401 responses
- Auth token sent in `Authorization: Bearer <token>` header

## 🎨 Features

- **Student Dashboard**: Submit and track complaints
- **Staff Dashboard**: View assigned complaints and update status
- **Admin Console**: Manage all complaints, users, and system config
- **Real-time Updates**: Live complaint status updates
- **AI Analysis**: Complaint trends and insights (mock)
- **Responsive Design**: Mobile-friendly interface

## 🧪 Testing Credentials

| Role | Username | Password |
|------|----------|----------|
| Student | 2204107 | student |
| Staff | staff1 | staff1 |
| Admin | admin | admin |

## 🌍 API Endpoints

Backend API: `https://shcms-backend.onrender.com/api`

### Public Endpoints
- `POST /auth/login` - User authentication
- `GET /health` - Health check

### Protected Endpoints (require auth token)
- `GET /complaints` - Get all complaints
- `POST /complaints` - Create complaint
- `GET /complaints/student/:id` - Get student complaints
- `PATCH /complaints/:id/status` - Update status
- And more...

## 🚨 Troubleshooting

### CORS Errors
Make sure backend allows your frontend origin:
```
https://cuet-shcms.netlify.app
```

### API Connection Failed
1. Check backend is running: `https://shcms-backend.onrender.com/api/health`
2. Verify `VITE_API_BASE_URL` in `.env.production`
3. Check browser console for errors

### Build Fails
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

## 📝 License

Proprietary - CUET Student Hostel Management System

## 👥 Team

Developed for Chittagong University of Engineering and Technology (CUET)