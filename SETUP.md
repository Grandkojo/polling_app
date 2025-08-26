# Polling App Authentication Setup

## Overview
This polling app includes a complete authentication system built with NextAuth.js, featuring user registration, login, and session management.

## Features
- ✅ User registration with validation
- ✅ User login with NextAuth.js
- ✅ Session management and protection
- ✅ Responsive UI with Tailwind CSS
- ✅ TypeScript support
- ✅ Form validation with Zod

## File Structure
```
src/
├── app/
│   ├── api/
│   │   └── auth/
│   │       ├── [...nextauth]/route.ts    # NextAuth configuration
│   │       └── register/route.ts         # Registration API
│   ├── auth/
│   │   ├── login/page.tsx                # Login page
│   │   └── register/page.tsx             # Registration page
│   ├── dashboard/page.tsx                # Protected dashboard
│   └── layout.tsx                        # Root layout with providers
├── components/
│   ├── LoginForm.tsx                     # Login form component
│   ├── RegisterForm.tsx                  # Registration form component
│   └── Providers.tsx                     # Session provider wrapper
└── types/
    └── auth.ts                           # TypeScript type definitions
```

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Create a `.env.local` file in the root directory with:
```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
```

**Important:** Generate a secure secret key:
```bash
openssl rand -base64 32
```

### 3. Run the Development Server
```bash
npm run dev
```

## Usage

### Authentication Flow
1. **Home Page**: Navigate to `/` to see the landing page
2. **Registration**: Click "Sign Up" or navigate to `/auth/register`
3. **Login**: Click "Sign In" or navigate to `/auth/login`
4. **Dashboard**: After successful login, users are redirected to `/dashboard`

### Test Credentials
For development, you can use these test credentials:
- Email: `user@example.com`
- Password: `password123`

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `GET/POST /api/auth/[...nextauth]` - NextAuth.js endpoints

### Protected Routes
- `/dashboard` - Requires authentication

## Customization

### Adding Database Integration
1. Update the `authorize` function in `src/app/api/auth/[...nextauth]/route.ts`
2. Replace mock user logic with actual database queries
3. Update the registration API to save users to your database

### Styling
The app uses Tailwind CSS. Customize colors and styling in the component files.

## Security Notes
- Passwords are hashed using bcryptjs
- Input validation is implemented with Zod
- Session management is handled by NextAuth.js
- CSRF protection is built-in

## Next Steps
- [ ] Add database integration (PostgreSQL, MongoDB, etc.)
- [ ] Implement email verification
- [ ] Add password reset functionality
- [ ] Create poll creation and management features
- [ ] Add real-time updates with WebSockets
- [ ] Implement user roles and permissions
