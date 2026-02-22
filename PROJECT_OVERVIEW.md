# Rentel - Van Rental Service Platform

## Project Overview

**Rentel** is a full-stack web application for renting vans online. The platform allows users to browse available vans, make bookings, and receive AI-powered recommendations based on their needs. It also includes an admin panel for managing the entire system.

**Live Demo:** http://localhost:5173 (Frontend) | http://localhost:5000 (Backend API)

---

## Table of Contents

1. [Key Features](#key-features)
2. [User Roles](#user-roles)
3. [Technical Architecture](#technical-architecture)
4. [Feature Details](#feature-details)
5. [AI Integration](#ai-integration)
6. [Database Design](#database-design)
7. [API Endpoints](#api-endpoints)
8. [Team Contributions](#team-contributions)
9. [How to Run the Project](#how-to-run-the-project)
10. [Testing the Application](#testing-the-application)

---

## Key Features

| Feature | Description |
|---------|-------------|
| User Authentication | Secure login/registration with JWT tokens |
| Van Browsing | Browse, filter, and sort available vans |
| Smart Recommendations | AI-powered van suggestions based on user needs |
| Booking System | Real-time availability checking and booking |
| AI Chat Assistant | 24/7 FAQ bot powered by Google Gemini |
| Admin Panel | Complete management dashboard for administrators |
| Responsive Design | Modern UI that works on all devices |

---

## User Roles

### 1. Guest User (Not Logged In)
- Browse van listings
- View van details
- Use AI chat assistant for FAQs
- Register for an account

### 2. Registered User
- All guest features, plus:
- Book vans with date selection
- View booking history
- Cancel bookings
- Get personalized recommendations
- Access profile dashboard

### 3. Administrator
- All user features, plus:
- Access admin dashboard (`/admin`)
- Manage users (view, update roles, delete)
- Manage vans (create, edit, delete)
- Manage bookings (view, update status)
- Configure system settings (API keys, policies)
- View system statistics

---

## Technical Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
│                    React.js + Vite                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │   Pages     │  │ Components  │  │  Context    │              │
│  │  - Home     │  │  - Layout   │  │  - Auth     │              │
│  │  - VanList  │  │  - FaqBot   │  │             │              │
│  │  - Profile  │  │  - NavBar   │  │             │              │
│  │  - Admin/*  │  │  - etc.     │  │             │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/REST API
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         BACKEND                                  │
│                    Node.js + Express                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │   Routes    │  │ Middleware  │  │  Services   │              │
│  │  - auth     │  │  - JWT Auth │  │  - AI       │              │
│  │  - vans     │  │  - CORS     │  │  - Recommend│              │
│  │  - bookings │  │  - Validate │  │             │              │
│  │  - admin    │  │             │  │             │              │
│  │  - ai       │  │             │  │             │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        DATABASE                                  │
│                       PostgreSQL                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │   users     │  │    vans     │  │  bookings   │              │
│  │  - id       │  │  - id       │  │  - id       │              │
│  │  - email    │  │  - name     │  │  - user_id  │              │
│  │  - password │  │  - type     │  │  - van_id   │              │
│  │  - role     │  │  - capacity │  │  - dates    │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                             │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              Google Gemini AI API                        │    │
│  │   - Chat responses    - Van descriptions                 │    │
│  │   - Recommendations   - FAQ assistance                   │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Feature Details

### 1. Landing Page (`/`)

**Purpose:** First impression for visitors, quick access to van search.

**Features:**
- Hero section with call-to-action
- "How Can We Help?" quick search
- Suggested search tags (Moving, Road Trip, Family Vacation, etc.)
- Personalized recommendations for logged-in users

**Technical Implementation:**
- React component with premium styling
- Fetches recommendations from `/api/recommendations`
- Responsive grid layout

---

### 2. Van Listing Page (`/vans`)

**Purpose:** Browse and filter all available vans.

**Features:**
- **Filter by Type:** Passenger, Cargo, Camper
- **Sort Options:** Price (Low-High, High-Low), Name, Capacity
- **View Modes:** Grid view or List view
- **Van Cards:** Image, name, type, capacity, price

**Technical Implementation:**
- Dynamic filtering via query parameters
- Backend SQL queries with WHERE clauses
- Responsive card grid with CSS

---

### 3. Van Detail Page (`/vans/:id`)

**Purpose:** View complete information about a specific van.

**Features:**
- Large van image
- Detailed specifications (capacity, type, features)
- Price per day
- "Book Now" button
- Related van recommendations

**Technical Implementation:**
- Fetches van by ID from `/api/vans/:id`
- Displays specs from JSON field
- RecommendedVans component for suggestions

---

### 4. Booking System

**Purpose:** Allow users to reserve vans for specific dates.

#### Booking Form (`/book/:vanId`)
- Date picker for start and end dates
- Real-time availability checking
- Price calculation
- Booking confirmation

#### My Bookings (`/bookings`)
- List of all user bookings
- Status indicators (Confirmed, Cancelled)
- Cancel booking option
- Van details with images

**Technical Implementation:**
- Availability check: `GET /api/bookings/availability`
- Create booking: `POST /api/bookings`
- Cancel booking: `PATCH /api/bookings/:id/cancel`
- Prevents double-booking through database constraints

---

### 5. Assisted Booking / Help Page (`/help`)

**Purpose:** Help users find the right van through guided questions.

**Features:**
- **Quick Search:** Type your need and get recommendations
- **Suggestion Tags:** Pre-defined search options
- **Questionnaire:** Multi-step form asking:
  1. What's your purpose? (Moving, Trip, Camping, etc.)
  2. How many people?
  3. Any special requirements?
- **Results:** Recommended vans based on answers

**Technical Implementation:**
- Questionnaire component builds a "need text"
- Sends to `/api/recommendations` endpoint
- Rule-based matching + AI enhancement

---

### 6. User Profile (`/profile`)

**Purpose:** Personal dashboard for logged-in users.

**Features:**
- User information display
- Booking statistics (total bookings, completed, cancelled)
- Recent booking history with van images
- Personalized van recommendations

**Technical Implementation:**
- Fetches from `/api/recommendations/history`
- Fetches from `/api/recommendations/personalized`
- Displays booking stats calculated client-side

---

### 7. Authentication System

**Purpose:** Secure user registration and login.

#### Registration (`/register`)
- Email validation
- Password hashing (bcrypt)
- Automatic login after registration

#### Login (`/login`)
- Email/password authentication
- JWT token generation
- Token stored in localStorage

**Technical Implementation:**
- JWT tokens with 7-day expiration
- bcrypt password hashing (10 salt rounds)
- Protected routes using AuthContext

---

### 8. Admin Panel (`/admin`)

**Purpose:** Complete system management for administrators.

#### Dashboard (`/admin`)
- Total users count
- Total vans count
- Total bookings count
- Revenue calculations
- Recent bookings list

#### User Management (`/admin/users`)
- View all users
- Search users by email
- Change user roles (user/admin)
- Delete users

#### Van Management (`/admin/vans`)
- View all vans
- Add new vans
- Edit van details
- **AI Description Generator:** Generate descriptions using AI
- Delete vans

#### Booking Management (`/admin/bookings`)
- View all bookings
- Filter by status
- Update booking status
- Pagination

#### Settings (`/admin/settings`)
- Configure Gemini API key
- Cancellation policy settings
- Site configuration

**Technical Implementation:**
- Protected by `requireAdmin` middleware
- Role check: `user.role === 'admin'`
- CRUD operations via `/api/admin/*` endpoints

---

## AI Integration

### Google Gemini AI

The application uses **Google Gemini 2.5 Pro** for intelligent features.

### 1. AI Chat Assistant (FaqBot)

**Location:** Floating button (bottom-right corner)

**Capabilities:**
- Answer questions about van types
- Explain booking process
- Provide pricing information
- Explain cancellation policy
- General customer support

**How it works:**
1. User types a question
2. Frontend sends to `/api/ai/chat`
3. Backend constructs prompt with system context
4. Gemini generates response
5. Response cleaned and returned to user

**Fallback System:**
If AI fails, rule-based responses handle common questions:
- "types" → Van types explanation
- "book" → Booking process
- "cancel" → Cancellation policy
- "price" → Pricing information

### 2. Van Description Generator

**Location:** Admin Panel → Van Management → "Generate with AI" button

**How it works:**
1. Admin enters van name, type, capacity
2. Clicks "Generate with AI"
3. Backend sends specs to Gemini
4. AI generates marketing description
5. Description populated in form

### 3. Smart Recommendations

**Location:** Home page, Help page, Profile page

**How it works:**
1. User enters their need (e.g., "family vacation for 6 people")
2. **Rule-based analysis:**
   - Keywords matched to van types
   - Capacity hints extracted
3. **AI Enhancement:** (if available)
   - Gemini refines recommendations
4. **Database query:**
   - Fetch matching vans
   - Sort by relevance

**Recommendation Rules:**
| Keywords | Van Type | Score |
|----------|----------|-------|
| moving, furniture, relocate | Cargo | 10 |
| camping, road trip, adventure | Camper | 10 |
| family, group, passengers | Passenger | 10 |
| delivery, transport, haul | Cargo | 9 |
| wedding, event, party | Passenger | 8 |

---

## Database Design

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Vans Table
```sql
CREATE TABLE vans (
  id SERIAL PRIMARY KEY,
  type VARCHAR(50) NOT NULL,
  name VARCHAR(100) NOT NULL,
  capacity INTEGER NOT NULL,
  specs_json JSONB,
  description TEXT,
  price_per_day DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Bookings Table
```sql
CREATE TABLE bookings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  van_id INTEGER REFERENCES vans(id),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'confirmed',
  created_at TIMESTAMP DEFAULT NOW(),
  CHECK (end_date >= start_date)
);
```

### Settings Table
```sql
CREATE TABLE settings (
  key VARCHAR(100) PRIMARY KEY,
  value TEXT,
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user |

### Vans
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/vans` | List all vans (with filters) |
| GET | `/api/vans/:id` | Get van details |

### Bookings
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/bookings` | User's bookings |
| POST | `/api/bookings` | Create booking |
| GET | `/api/bookings/availability` | Check availability |
| PATCH | `/api/bookings/:id/cancel` | Cancel booking |

### Recommendations
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/recommendations` | Get recommendations |
| GET | `/api/recommendations/personalized` | User-specific suggestions |
| GET | `/api/recommendations/history` | Booking history |

### AI
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/chat` | Chat with AI assistant |
| POST | `/api/ai/generate-description` | Generate van description |
| POST | `/api/ai/recommend` | AI-enhanced recommendations |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/stats` | Dashboard statistics |
| GET | `/api/admin/users` | List all users |
| PUT | `/api/admin/users/:id` | Update user |
| DELETE | `/api/admin/users/:id` | Delete user |
| POST | `/api/admin/vans` | Create van |
| PUT | `/api/admin/vans/:id` | Update van |
| DELETE | `/api/admin/vans/:id` | Delete van |
| GET | `/api/admin/bookings` | All bookings |
| PUT | `/api/admin/bookings/:id` | Update booking |
| GET/PUT | `/api/admin/settings` | System settings |

---

## Team Contributions

### Mohammod Habib Ullah (hab1b01) - Foundation & Auth
- Project structure and repository setup
- Express.js backend configuration
- PostgreSQL database setup and migrations
- User authentication (registration, login, JWT)
- React app initialization with Vite
- Login/Register pages and AuthContext
- Protected routes and API client

### Tanvir Ahammed (Tanvir3135) - Van Services & Booking
- Van model and listing API
- Van filtering and sorting
- Booking model and APIs
- Availability checking system
- Van listing page with filters
- Van detail page
- Booking form and confirmation
- My Bookings page
- Validation and error handling

### Emtiuz Bhuiyan (Emtiuz-Bhuiyan) - Recommendations & UX
- Recommendation rules engine
- Recommendations API
- Assisted booking / Help page
- Recommended vans display
- Booking history integration
- Short questionnaire component
- User profile dashboard
- Modern landing page design
- Premium color palette and styling

### Mahmudul Hasan (mahasan24) - AI & Deployment
- FAQ documentation and RAG setup
- Google Gemini AI integration
- AI Chat Bot (FaqBot)
- Van description generation API
- Admin Panel (Dashboard, Users, Vans, Bookings, Settings)
- Jest API tests
- GitHub Actions CI
- Deployment configuration

---

## How to Run the Project

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database
- Google Gemini API key

### Step 1: Clone the Repository
```bash
git clone https://github.com/mahasan24/Rental_Service.git
cd Rental_Service
```

### Step 2: Setup Backend
```bash
cd backend
npm install
```

Create `.env` file:
```
DATABASE_URL=postgresql://username:password@localhost:5432/rentel
JWT_SECRET=your-secret-key-here
GEMINI_API_KEY=your-gemini-api-key
PORT=5000
FRONTEND_URL=http://localhost:5173
```

Run migrations and seed data:
```bash
npm run migrate
npm run seed
```

Start backend server:
```bash
npm run dev
```

### Step 3: Setup Frontend
```bash
cd ../frontend
npm install
npm run dev
```

### Step 4: Access the Application
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

---

## Testing the Application

### Test User Accounts
After running seed, you can use:
- **Regular User:** Register a new account
- **Admin User:** Update a user's role to 'admin' in the database

### Test Scenarios

1. **Browse Vans:**
   - Go to `/vans`
   - Try different filters (Passenger, Cargo, Camper)
   - Change sorting options

2. **Make a Booking:**
   - Click on a van
   - Click "Book Now"
   - Select dates
   - Confirm booking

3. **AI Chat:**
   - Click the chat icon (bottom-right)
   - Ask "What types of vans do you have?"
   - Ask "How do I book a van?"

4. **Get Recommendations:**
   - Go to `/help`
   - Type "family vacation for 8 people"
   - Or use the questionnaire

5. **Admin Panel:**
   - Login as admin
   - Go to `/admin`
   - Try managing users, vans, bookings

---

## Conclusion

Rentel demonstrates a complete full-stack application with:

- **Modern Frontend:** React.js with responsive design
- **Robust Backend:** Node.js/Express with RESTful API
- **Database:** PostgreSQL with proper relationships
- **AI Integration:** Google Gemini for intelligent features
- **Security:** JWT authentication and role-based access
- **Admin Features:** Complete management dashboard

The project showcases real-world development practices including team collaboration, version control, and modular architecture.

---

*Created by Team Rentel - 2026*
