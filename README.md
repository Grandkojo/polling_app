# Polling App

A modern, full-stack polling application built with Next.js, NextAuth.js, and Supabase.

## 📣 Capstone Project Plan

### 🔖 Project Title & Description

**Title**: Polling App – Shareable, Real‑Time Polls with QR Codes

**Description**: A Next.js app for creating, sharing, and voting on polls. Users can authenticate, create polls with multiple options, share via unique links and QR codes, and view results in real time. Designed for event hosts, educators, product teams, and community managers who need fast audience feedback.

**Why it matters**: Polls are a low-friction way to collect insights. This project emphasizes a strong developer experience (DX) with Server Components and Server Actions, secure authentication with Supabase, and AI-assisted workflows to speed up delivery while maintaining quality.

### 🛠️ Tech Stack

- **Language**: TypeScript
- **Framework**: Next.js (App Router)
- **Database & Auth**: Supabase (Postgres, RLS, Auth)
- **Styling**: Tailwind CSS + shadcn/ui
- **State**: Server Components for server state, minimal Client Components with `useState`/`useReducer` for interactivity
- **Mutations**: Next.js Server Actions
- **QR Codes**: `qrcode.react`
- **Testing**: Jest + React Testing Library, Next.js testing utilities
- **Linting/Formatting**: ESLint, Prettier
- **CI/CD**: GitHub Actions (planned)

### 🧠 AI Integration Strategy

- **Code generation**:
  - Use IDE agent (Cursor) to scaffold features: Server Actions, pages in `/app`, components in `/components`, and Supabase queries in `/lib`.
  - Generate boilerplate forms using shadcn/ui patterns and Zod validation stubs where needed.
  - Enforce project conventions: App Router, Server Components for data fetching, Server Actions for mutations.
- **Testing**:
  - Prompt AI to draft unit/integration tests (Jest + RTL) mirroring user flows: auth, create poll, vote, share, and result rendering.
  - Generate test data factories and Supabase test helpers for isolated runs.
- **Documentation**:
  - Generate and maintain README sections, feature docs, and migration notes.
  - Ask AI to produce docstrings for complex utilities in `lib/` and for Server Actions with clear input/output and error cases.
- **Context-aware techniques**:
  - Provide the AI with: file tree snapshots, diffs, API and DB schemas (`/database/schema.sql`), and relevant code snippets.
  - Use structured prompts to review PRs, summarize changes, and recommend refactors.
- **AI-powered reviews & release notes**:
  - Use CodeRabbit (or similar) to produce PR reviews and generate release notes per milestone.

### 📦 Scope & Feature Roadmap

- **MVP (existing + finalize)**
  - Auth (register/login) with Supabase and NextAuth.js
  - Create/view polls, vote via server actions
  - Shareable links and QR code generation per poll

- **Capstone Enhancements**
  - ✅ 🔒 User role management (admin vs regular)
  - ✅ 📊 Poll result charts (chart.js via react-chartjs-2)
  - ✅ 💬 Comments/discussion on each poll
  - 📱 Mobile responsiveness & a11y improvements
  - ✉️ Email notifications (e.g., poll closing alerts)
  - 🧪 Unit & integration tests (Jest/RTL)
  - 🧠 AI-powered reviews and automated release notes
  - ✅ 📷 QR codes for every poll

### 🗺️ Milestones

1. ✅ Foundation hardening (auth, DB, RLS, core polls CRUD, voting server actions)
2. ✅ Sharing & QR codes; unique share codes; share page UX
3. ✅ Role management (admin capabilities: manage polls/users, moderate comments)
4. ✅ Results visualization (charts) and real-time updates UX polish
5. ✅ Comments/discussion threads with moderation tools
6. Notifications (scheduled/triggered emails for poll closing or activity)
7. Testing coverage (unit + integration) and CI pipeline
8. Accessibility, performance pass, and release notes automation

### ✅ Definition of Done (Verification Checklist)

- Uses Next.js App Router with Server Components for data fetching
- All mutations implemented as Server Actions (no client-side fetch for forms)
- Supabase client used for all DB interactions; RLS policies in place
- shadcn/ui components used for UI; Tailwind for styles
- No secrets hardcoded; Supabase keys from environment variables
- QR codes generated with `qrcode.react` and share pages functional
- Tests for critical flows (auth, create poll, vote, share, view results) pass in CI
- README updated with plan, setup, and usage; AI workflow documented


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
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── [...nextauth]/route.ts    # NextAuth configuration
│   │   │   └── register/route.ts         # User registration API
│   │   └── polls/
│   │       ├── route.ts                  # Polls CRUD operations
│   │       └── [id]/route.ts             # Individual poll operations
│   ├── auth/
│   │   ├── login/page.tsx                # Login page
│   │   └── register/page.tsx             # Registration page
│   ├── polls/
│   │   ├── page.tsx                      # Browse all polls
│   │   ├── create/page.tsx               # Create new poll
│   │   └── [id]/page.tsx                 # View individual poll
│   ├── dashboard/page.tsx                # Protected dashboard
│   ├── layout.tsx                        # Root layout with providers
│   └── page.tsx                          # Landing page
├── components/
│   ├── ui/                               # Shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   └── form.tsx
│   ├── LoginForm.tsx                     # Login form component
│   ├── RegisterForm.tsx                  # Registration form component
│   ├── Navigation.tsx                    # Main navigation component
│   └── Providers.tsx                     # Session provider wrapper
├── lib/
│   ├── supabase.ts                       # Supabase client configuration
│   └── utils.ts                          # Shadcn utility functions
└── types/
    └── auth.ts                           # TypeScript type definitions
```



## 🔐 Authentication Flow

1. **Registration**: Users can create accounts at `/auth/register`
2. **Login**: Users authenticate at `/auth/login`
3. **Dashboard**: Protected route accessible after authentication
4. **Session Management**: Automatic session handling with NextAuth.js

## 🎨 UI Components

### Landing Page
![Landing Page](/public/imgs/landing_page.png)

*Marketing page with app introduction and call-to-action buttons*

### Authentication Pages
![Login Form](/public/imgs/login.png)
*Email/password authentication with form validation*

![Registration Form](/public/imgs/register.png)
*User account creation with password confirmation*

### Dashboard
![Dashboard](/public/imgs/dashboard.png)
*Protected user area accessible after authentication*

### Development Process
![AI Development Process](/public/imgs/cursor_prompt_response2.png)
![AI Development Process](/public/imgs/cursor_prompt_response1.png)
*Screenshots showing the AI-assisted development workflow*

### Supabase Integration
![Supabase Setup](/public/imgs/supabase.png)
*Database and authentication backend setup*

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
