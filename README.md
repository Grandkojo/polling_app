# Polling App

A modern, full-stack polling application built with Next.js, NextAuth.js, and Supabase.

## 🚀 Features

- **User Authentication**: Secure registration and login system
- **Password Security**: Bcrypt hashing with 12 salt rounds
- **Session Management**: JWT-based authentication with NextAuth.js
- **Responsive Design**: Beautiful UI built with Tailwind CSS
- **TypeScript**: Full type safety throughout the application
- **Database Integration**: Supabase backend for data persistence

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: NextAuth.js
- **Database**: Supabase
- **Password Hashing**: bcryptjs
- **Validation**: Zod

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── auth/
│   │       ├── [...nextauth]/route.ts    # NextAuth configuration
│   │       └── register/route.ts         # User registration API
│   ├── auth/
│   │   ├── login/page.tsx                # Login page
│   │   └── register/page.tsx             # Registration page
│   ├── dashboard/page.tsx                # Protected dashboard
│   ├── layout.tsx                        # Root layout with providers
│   └── page.tsx                          # Landing page
├── components/
│   ├── LoginForm.tsx                     # Login form component
│   ├── RegisterForm.tsx                  # Registration form component
│   └── Providers.tsx                     # Session provider wrapper
├── lib/
│   └── supabase.ts                       # Supabase client configuration
└── types/
    └── auth.ts                           # TypeScript type definitions
```



## 🔐 Authentication Flow

1. **Registration**: Users can create accounts at `/auth/register`
2. **Login**: Users authenticate at `/auth/login`
3. **Dashboard**: Protected route accessible after authentication
4. **Session Management**: Automatic session handling with NextAuth.js

## 🎨 UI Components

- **Landing Page**: Marketing page with app introduction
- **Login Form**: Email/password authentication
- **Registration Form**: User account creation
- **Dashboard**: Protected user area (placeholder for future features)
- **Navigation**: Clean, responsive navigation between pages

## 🔒 Security Features

- **Password Hashing**: Bcrypt with 12 salt rounds
- **CSRF Protection**: Built-in NextAuth.js protection
- **Session Security**: JWT-based secure sessions
- **Input Validation**: Zod schema validation
- **Environment Variables**: Secure configuration management

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile devices
- All modern browsers

## 🚧 Current Status

### ✅ Completed
- User authentication system
- Registration and login forms
- Password security implementation
- Supabase integration
- Responsive UI design
- TypeScript setup
- Session management

### 🔄 In Progress
- Core polling functionality
- Database schema design

### 📋 Planned Features
- Create and manage polls
- Real-time voting
- Results visualization
- User profiles
- Poll sharing
- Analytics dashboard

## 🧪 Testing

The app includes test credentials for development:
- **Email**: `user@example.com`
- **Password**: `password123`

## 📝 API Endpoints

- `POST /api/auth/register` - User registration
- `GET/POST /api/auth/[...nextauth]` - NextAuth.js endpoints
- `GET /dashboard` - Protected dashboard (requires auth)



## 🆘 Support

If you encounter any issues:
1. Check the console for error messages
2. Verify your environment variables
3. Ensure Supabase is properly configured
4. Check the terminal logs for compilation errors

## 🔮 Future Enhancements

- Email verification
- Password reset functionality
- Social authentication (Google, GitHub)
- Real-time updates with WebSockets
- Advanced analytics
- Mobile app
- API rate limiting
- Multi-language support

---

Built with ❤️ using Next.js and Supabase
