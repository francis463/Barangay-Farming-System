# Plant n' Plan - Data Flow Diagram Level 0 (Context Diagram)

## Overview

The **Level 0 Data Flow Diagram**, also known as the **Context Diagram**, represents the highest-level view of the Plant n' Plan system. It shows the entire system as a single process and illustrates how it interacts with external entities (users, systems, and services) through data flows.

This diagram establishes the **system boundary**—what is inside the system versus what is outside it—and identifies all the inputs and outputs that cross this boundary.

---

## Context Diagram

### Visual Representation (ASCII Art)

```
                    ┌──────────────────────────────────────────┐
                    │      EXTERNAL ENTITIES                   │
                    └──────────────────────────────────────────┘

┌─────────────────────┐                              ┌─────────────────────┐
│                     │   Login Credentials          │                     │
│  Barangay Admin     │   (email, password)          │  Community Members  │
│ (francisjohngorres  │─────────────────────────────▶│   (Regular Users)   │
│   @gmail.com)       │                              │                     │
│                     │   Registration Data          │                     │
└──────────┬──────────┘   (name, email, password)    └──────────┬──────────┘
           │                                                     │
           │                                                     │
           │ • Crop Data (Create/Update/Delete)                 │
           │ • Harvest Records                                  │
           │ • Budget Transactions                              │ • View All Data
           │ • Volunteer Tasks                                  │ • Submit Feedback
           │ • Photo Uploads                                    │ • Vote in Polls
           │ • Poll Creation                                    │ • View Weather
           │ • User Management                                  │ • Update Profile
           │ • View All Data                                    │ • View Dashboard
           │ • Export/Print Reports                             │
           │                                                     │
           └──────────────────────┬──────────────────────────────┘
                                  │
                                  ▼
           ╔══════════════════════════════════════════════════════╗
           ║                                                      ║
           ║          PLANT N' PLAN SYSTEM                        ║
           ║     (Barangay Community Farming System)              ║
           ║                                                      ║
           ║  Core Functions:                                     ║
           ║  • User Authentication & Authorization               ║
           ║  • Crop Lifecycle Management                         ║
           ║  • Harvest Tracking & Analytics                      ║
           ║  • Budget Transparency & Visualization               ║
           ║  • Volunteer Task Management                         ║
           ║  • Photo Gallery Management                          ║
           ║  • Community Engagement (Polls/Feedback)             ║
           ║  • Weather Information Integration                   ║
           ║  • User Profile Management                           ║
           ║  • Data Export & Reporting                           ║
           ║                                                      ║
           ╚══════════════════════════════════════════════════════╝
                                  │
                                  │
           ┌──────────────────────┼──────────────────────────────┐
           │                      │                              │
           ▼                      ▼                              ▼
  ┌─────────────────┐   ┌─────────────────┐         ┌─────────────────────┐
  │                 │   │                 │         │                     │
  │   Supabase      │   │ OpenWeatherMap  │         │  Browser Storage    │
  │   Services      │   │      API        │         │   (Local/Session)   │
  │                 │   │                 │         │                     │
  │  • PostgreSQL   │   │ Provides:       │         │  Stores:            │
  │    Database     │   │ • Temperature   │         │  • Theme Preference │
  │  • Auth Service │   │ • Humidity      │         │  • Location Data    │
  │  • Storage      │   │ • Wind Speed    │         │  • Session Cache    │
  │    (Images)     │   │ • Conditions    │         │                     │
  │  • Edge         │   │ • Weather Icons │         │                     │
  │    Functions    │   │                 │         │                     │
  │                 │   │                 │         │                     │
  └─────────────────┘   └─────────────────┘         └─────────────────────┘
           │                      │                              │
           │                      │                              │
           │ Returns:             │ Returns:                     │ Returns:
           │ • User Sessions      │ • Weather Data (JSON)        │ • Cached Data
           │ • Data Records       │ • Location Name              │ • Preferences
           │ • Signed URLs        │ • Forecast Info              │
           │ • Auth Tokens        │                              │
           │                      │                              │
           └──────────────────────┴──────────────────────────────┘
                                  │
                                  ▼
           ╔══════════════════════════════════════════════════════╗
           ║              SYSTEM OUTPUTS                          ║
           ║                                                      ║
           ║  To Admin:                                           ║
           ║  • Dashboard Analytics & Insights                    ║
           ║  • CRUD Confirmation Messages                        ║
           ║  • User Directory Listings                           ║
           ║  • Export Files (CSV, JSON, PDF)                     ║
           ║  • Print-Ready Reports                               ║
           ║                                                      ║
           ║  To Community Members:                               ║
           ║  • View-Only Data Access                             ║
           ║  • Poll Results with Percentages                     ║
           ║  • Weather Forecasts & Updates                       ║
           ║  • Harvest Statistics & History                      ║
           ║  • Budget Transparency Charts                        ║
           ║  • Photo Gallery Displays                            ║
           ║  • Volunteer Schedule Views                          ║
           ║                                                      ║
           ║  To All Users:                                       ║
           ║  • Success/Error Notifications                       ║
           ║  • Real-Time Weather Updates                         ║
           ║  • Profile Information Display                       ║
           ║  • Responsive UI (Mobile/Desktop)                    ║
           ║  • Dark/Light Mode Interface                         ║
           ║                                                      ║
           ╚══════════════════════════════════════════════════════╝
```

---

### Simplified Visual Diagram

```
                    ╔════════════════════════════════════╗
                    ║    EXTERNAL ENTITIES (ACTORS)      ║
                    ╚════════════════════════════════════╝

        ┌───────────────────┐                  ┌───────────────────┐
        │  Barangay Admin   │                  │ Community Members │
        │   (Write Access)  │                  │   (Read Access)   │
        └─────────┬─────────┘                  └─────────┬─────────┘
                  │                                      │
                  │  • Crop CRUD                         │  • View Data
                  │  • Budget Entry                      │  • Vote
                  │  • Photo Upload                      │  • Feedback
                  │  • User Mgmt                         │
                  │                                      │
                  └───────────────┬──────────────────────┘
                                  │
                  ┌───────────────▼────────────────┐
                  │    User Authentication         │
                  │  (Login/Registration)          │
                  └───────────────┬────────────────┘
                                  │
    ╔═════════════════════════════▼═══════════════════════════════╗
    ║                                                             ║
    ║                  PLANT N' PLAN SYSTEM                       ║
    ║             (Single Process - Level 0)                      ║
    ║                                                             ║
    ║  • Manages crops, harvests, budget, volunteers              ║
    ║  • Provides transparency and community engagement           ║
    ║  • Integrates weather data and photo documentation          ║
    ║  • Enables search, filter, export, and reporting            ║
    ║                                                             ║
    ╚═════════════════════════════════════════════════════════════╝
                                  │
                  ┌───────────────┼────────────────┐
                  │               │                │
                  ▼               ▼                ▼
         ┌────────────┐  ┌─────────────┐  ┌──────────────┐
         │  Supabase  │  │OpenWeatherMap│ │   Browser    │
         │  Backend   │  │     API      │  │   Storage    │
         └────────────┘  └─────────────┘  └──────────────┘
                  │               │                │
                  └───────────────┴────────────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │  System Outputs │
                         │  • Dashboards   │
                         │  • Reports      │
                         │  • Charts       │
                         │  • Notifications│
                         └─────────────────┘
```

---

## External Entities

External entities are actors (people, systems, or organizations) that interact with the Plant n' Plan system but are not part of the system itself.

### 1. Barangay Administrator (Admin User)

**Type:** Human Actor  
**Email:** francisjohngorres@gmail.com  
**Role:** System Administrator with full privileges

**Interactions with System:**

**Inputs Provided to System:**
- Login credentials (email, password)
- New crop information (name, planting date, expected harvest, health status)
- Harvest records (crop selection, date, quantity, quality)
- Budget transactions (description, category, amount, type, date)
- Volunteer task assignments (name, task, date, status)
- Photo uploads with descriptions
- Community polls (questions and options)
- User management actions (view users, manage profiles)
- Profile updates (name, bio, avatar)

**Outputs Received from System:**
- Authentication confirmation (login success/failure)
- Dashboard with comprehensive analytics
- CRUD operation confirmations
- User directory listings
- All data views (crops, harvests, budget, volunteers, gallery)
- Budget visualization charts (pie charts, bar charts)
- Export files (CSV, JSON)
- Print-ready reports
- Success/error notifications
- Weather forecasts
- Admin-specific UI elements (golden avatar, admin badges)

---

### 2. Community Members (Regular Users)

**Type:** Human Actor  
**Role:** Barangay residents with read-only access

**Interactions with System:**

**Inputs Provided to System:**
- Login credentials (email, password)
- Registration data (name, email, password)
- Poll votes (option selection)
- Feedback submissions (message, category)
- Profile updates (own profile only)
- Profile picture uploads

**Outputs Received from System:**
- Authentication confirmation
- Dashboard with read-only data
- Crop listings with health indicators
- Harvest history and statistics
- Complete budget transparency (all transactions visible)
- Budget charts and financial summaries
- Volunteer task schedules
- Photo gallery displays
- Poll results with vote percentages
- Feedback submission confirmations
- Weather forecasts with auto-refresh
- Responsive UI across devices
- Dark/light mode interface

---

### 3. Supabase Services (Backend System)

**Type:** External System/Service  
**Provider:** Supabase Inc.  
**Role:** Backend-as-a-Service provider

**Components:**

**a) PostgreSQL Database**
- Receives: SQL queries, data insert/update/delete operations
- Returns: Query results, data records, operation confirmations

**b) Supabase Auth**
- Receives: Registration data, login credentials, session tokens
- Returns: JWT tokens, user sessions, authentication status

**c) Supabase Storage**
- Receives: Image file uploads (photos, avatars)
- Returns: Signed URLs for secure image access, upload confirmations

**d) Supabase Edge Functions**
- Receives: API requests (HTTP POST/GET/PUT/DELETE)
- Returns: JSON responses, status codes, processed data

**Data Exchange:**
- System sends: User credentials, crop data, harvest records, budget transactions, file uploads
- System receives: Authentication tokens, stored data, signed URLs, operation results

---

### 4. OpenWeatherMap API (External Service)

**Type:** Third-party Web Service  
**Provider:** OpenWeatherMap  
**Role:** Weather data provider

**Interactions with System:**

**Inputs Provided to System:**
- Current weather data (JSON format)
  - Temperature (Celsius)
  - Humidity percentage
  - Wind speed (m/s)
  - Weather conditions (Clear, Rainy, Cloudy, etc.)
  - Weather icons
  - Location name

**Outputs Sent by System:**
- API requests with location coordinates (latitude, longitude)
- API key for authentication
- Units preference (metric)

**Communication Pattern:**
- Request Type: HTTP GET
- Frequency: Every 15 minutes (auto-refresh)
- Endpoint: `https://api.openweathermap.org/data/2.5/weather`

---

### 5. Browser Storage (Client-Side Storage)

**Type:** Browser Technology  
**Role:** Local data persistence

**Interactions with System:**

**Data Stored by System:**
- User theme preference (dark/light mode)
- Weather location coordinates
- Session cache (temporary data)
- User preferences

**Data Retrieved by System:**
- Saved theme setting
- Cached location data
- User preferences for UI customization

**Storage Methods:**
- localStorage (persistent across sessions)
- sessionStorage (temporary, session-only)

---

## Data Flows

Data flows represent the movement of information between external entities and the system.

### Input Data Flows (Into the System)

| Data Flow Name | Source | Destination | Description | Data Elements |
|----------------|--------|-------------|-------------|---------------|
| **User Credentials** | Admin / Community Members | Plant n' Plan System | Login authentication data | Email, Password |
| **Registration Data** | Community Members | Plant n' Plan System | New user signup information | Name, Email, Password |
| **Crop Information** | Admin | Plant n' Plan System | New or updated crop records | Name, Planting Date, Expected Harvest, Health, Stage, Status, Notes |
| **Harvest Records** | Admin | Plant n' Plan System | Harvest event documentation | Crop ID, Date, Quantity (kg), Quality Rating |
| **Budget Transactions** | Admin | Plant n' Plan System | Financial income/expense entries | Description, Category, Amount (PHP), Type, Date, Receipt |
| **Volunteer Tasks** | Admin | Plant n' Plan System | Task assignments for volunteers | Volunteer Name, Task, Date, Status, Contact |
| **Photo Uploads** | Admin | Plant n' Plan System | Garden progress images | Image File, Description, Upload Date |
| **Poll Data** | Admin | Plant n' Plan System | Community poll creation | Question, Options Array |
| **Poll Votes** | Community Members | Plant n' Plan System | User voting on polls | Poll ID, Selected Option |
| **Feedback** | Community Members | Plant n' Plan System | Community suggestions/complaints | Message, Category, User ID |
| **Profile Updates** | All Users | Plant n' Plan System | User profile modifications | Name, Bio, Avatar, Contact |
| **Location Coordinates** | Browser Geolocation API | Plant n' Plan System | User's geographic location | Latitude, Longitude |
| **Weather Request** | Plant n' Plan System | OpenWeatherMap API | Request for weather data | Location Coordinates, API Key |
| **Database Queries** | Plant n' Plan System | Supabase | Data retrieval/manipulation requests | SQL Queries, Key-Value Operations |
| **File Upload** | Plant n' Plan System | Supabase Storage | Image file storage requests | Binary File Data, Metadata |

---

### Output Data Flows (From the System)

| Data Flow Name | Source | Destination | Description | Data Elements |
|----------------|--------|-------------|-------------|---------------|
| **Authentication Result** | Plant n' Plan System | Admin / Community Members | Login success/failure notification | Session Token, User Info, Error Message |
| **Dashboard Data** | Plant n' Plan System | Admin / Community Members | Comprehensive overview display | Crop Stats, Harvest Summary, Budget Balance, Tasks, Weather |
| **Crop Listings** | Plant n' Plan System | All Users | List of all planted crops | Crop Array with full details |
| **Harvest Statistics** | Plant n' Plan System | All Users | Harvest history and analytics | Total Yield, Quality Distribution, Historical Data |
| **Budget Reports** | Plant n' Plan System | All Users | Financial transparency data | Transaction List, Charts, Income/Expense Totals, Balance |
| **Budget Charts** | Plant n' Plan System | All Users | Visual financial data | Pie Chart (Categories), Bar Chart (Monthly Trends) |
| **Volunteer Schedule** | Plant n' Plan System | All Users | Task assignments and status | Volunteer List, Task Details, Dates, Status |
| **Photo Gallery** | Plant n' Plan System | All Users | Garden progress images | Image Array with Signed URLs, Descriptions |
| **Poll Results** | Plant n' Plan System | All Users | Voting results with percentages | Question, Options with Vote Counts, Total Votes |
| **Weather Forecast** | Plant n' Plan System | All Users | Current weather information | Temperature, Conditions, Humidity, Wind, Icon, Last Updated |
| **User Directory** | Plant n' Plan System | Admin | List of registered users | User Array with Names, Emails, Roles, Registration Dates |
| **Success Notifications** | Plant n' Plan System | All Users | Operation confirmations | Toast Messages, Success/Error Alerts |
| **Export Files** | Plant n' Plan System | Admin | Downloadable data files | CSV Files, JSON Data, PDF Reports |
| **Weather Data Response** | OpenWeatherMap API | Plant n' Plan System | Current weather information | JSON with Temperature, Humidity, Wind, Conditions |
| **Database Results** | Supabase | Plant n' Plan System | Query results and stored data | JSON Objects, Arrays, Status Codes |
| **Signed URLs** | Supabase Storage | Plant n' Plan System | Secure image access links | HTTPS URLs with Tokens (1-hour expiration) |
| **Auth Tokens** | Supabase Auth | Plant n' Plan System | User session authentication | JWT Tokens, User Metadata |

---

## System Boundary

The **system boundary** defines what is inside the Plant n' Plan system versus what is outside (external entities).

### Inside the System Boundary

**Components that ARE part of Plant n' Plan:**
- ✅ React frontend application (`App.tsx`, all components)
- ✅ User interface components (Dashboard, CropsManagement, etc.)
- ✅ Application logic (`/utils/api.ts`, `/utils/auth.ts`, `/utils/weather.ts`)
- ✅ Hono web server (`/supabase/functions/server/index.tsx`)
- ✅ API routes and endpoints
- ✅ Business logic and data validation
- ✅ State management (React hooks)
- ✅ Styling and themes (`/styles/globals.css`)
- ✅ Client-side data processing

### Outside the System Boundary

**Components that are NOT part of Plant n' Plan:**
- ❌ Supabase services (third-party backend)
- ❌ PostgreSQL database (managed by Supabase)
- ❌ Supabase Auth service (third-party authentication)
- ❌ Supabase Storage (third-party file hosting)
- ❌ OpenWeatherMap API (third-party weather service)
- ❌ Browser local storage (browser feature)
- ❌ User devices (smartphones, tablets, computers)
- ❌ Internet infrastructure (networks, servers)

**Why This Matters:**
The system boundary helps us understand:
1. What we control (inside) vs. what we depend on (outside)
2. Where data enters and exits our system
3. Which components we're responsible for maintaining
4. What external dependencies we have

---

## Context Diagram Components

### The Central Process

**Process Name:** Plant n' Plan System  
**Process Number:** 0 (Level 0 - highest level)  
**Type:** Automated Information System

**Description:**
The Plant n' Plan system is a web-based barangay community farming management platform that provides:
- Transparent crop lifecycle tracking
- Harvest documentation and analytics
- Budget transparency with visualizations
- Volunteer task management
- Community engagement through polls and feedback
- Weather information integration
- Photo documentation gallery
- User authentication and profile management

**Processing Functions:**
1. Authenticates users and manages sessions
2. Processes CRUD operations for crops, harvests, budget, volunteers
3. Stores and retrieves data from database
4. Generates visualizations (charts) from budget data
5. Integrates weather data from external API
6. Manages file uploads to storage
7. Facilitates community engagement (polls, feedback)
8. Exports data for reporting
9. Enforces role-based access control

---

## Data Flow Descriptions

### Major Input Flows

#### 1. User Authentication Flow
```
User → [Login Credentials] → System → [Validate] → Supabase Auth → 
[JWT Token] → System → [Session Created] → User Dashboard
```

#### 2. Crop Management Flow (Admin)
```
Admin → [Crop Data] → System → [Validate] → Hono Server → 
[Store in DB] → Supabase → [Confirmation] → System → 
[Success Toast] → Admin
```

#### 3. Weather Data Flow
```
User Opens App → System → [Location Request] → Browser Geolocation → 
[Coordinates] → System → [API Request] → OpenWeatherMap → 
[Weather JSON] → System → [Display] → User
```

#### 4. Budget Transparency Flow
```
Community Member → [View Budget] → System → [Fetch Transactions] → 
Supabase → [Transaction Array] → System → [Generate Charts] → 
[Display Pie/Bar Charts] → Community Member
```

---

### Major Output Flows

#### 1. Dashboard Display Flow
```
System → [Fetch Multiple Data Sources] → Supabase → 
[Crops, Harvests, Budget, Weather] → System → [Calculate Statistics] → 
[Render Dashboard] → User
```

#### 2. Photo Gallery Flow
```
System → [Request Photos] → Supabase Storage → [Generate Signed URLs] → 
Supabase → [Metadata + URLs] → System → [Display Images] → User
```

#### 3. Export Data Flow
```
Admin → [Export Request] → System → [Query Data] → Supabase → 
[Data Array] → System → [Generate CSV/JSON] → [Download File] → Admin
```

---

## Context Diagram in Mermaid Format

For those who prefer Mermaid.js syntax for rendering in documentation tools:

```mermaid
graph TB
    Admin[Barangay Administrator<br/>francisjohngorres@gmail.com]
    User[Community Members<br/>Regular Users]
    System[PLANT N' PLAN SYSTEM<br/>Barangay Community Farming Platform]
    Supabase[Supabase Services<br/>Database, Auth, Storage]
    Weather[OpenWeatherMap API<br/>Weather Data Provider]
    Browser[Browser Storage<br/>Local/Session Storage]

    Admin -->|Login, Crop CRUD, Budget Entry,<br/>Photo Upload, User Management| System
    User -->|Login, View Data, Vote,<br/>Submit Feedback, View Weather| System
    
    System -->|Dashboard, Reports, Charts,<br/>Admin Controls, Notifications| Admin
    System -->|Read-Only Data, Poll Results,<br/>Weather Forecasts, Charts| User
    
    System <-->|Auth Requests, Data Queries,<br/>File Uploads, Tokens| Supabase
    System <-->|Weather Requests<br/>Weather Data (JSON)| Weather
    System <-->|Store Preferences<br/>Retrieve Settings| Browser

    style System fill:#10b981,stroke:#059669,stroke-width:3px,color:#fff
    style Admin fill:#f59e0b,stroke:#d97706,stroke-width:2px
    style User fill:#3b82f6,stroke:#2563eb,stroke-width:2px
    style Supabase fill:#8b5cf6,stroke:#7c3aed,stroke-width:2px
    style Weather fill:#06b6d4,stroke:#0891b2,stroke-width:2px
    style Browser fill:#6b7280,stroke:#4b5563,stroke-width:2px
```

---

## Detailed Entity Descriptions

### Entity 1: Barangay Administrator

**Characteristics:**
- Single designated admin user
- Email: francisjohngorres@gmail.com
- Full system privileges
- Visual indicators (golden avatar, shield icon, admin badge)

**Responsibilities:**
- Manage crop lifecycle (create, update, delete)
- Record harvest events
- Enter budget transactions
- Assign volunteer tasks
- Upload garden photos
- Create community polls
- Manage user directory
- Export and print reports

**System Usage Pattern:**
- Logs in daily to check dashboard
- Updates crop health status weekly
- Records harvests as they occur
- Enters budget transactions immediately
- Responds to community feedback
- Reviews volunteer task completion

---

### Entity 2: Community Members

**Characteristics:**
- Multiple users (50+ in barangay)
- Standard user accounts
- Read-only access to most data
- Can participate in polls and submit feedback

**Motivations:**
- Transparency in budget usage
- See what's growing in the garden
- Know when to volunteer
- Participate in decision-making (polls)
- View harvest results
- Check weather for garden work

**System Usage Pattern:**
- Check dashboard occasionally
- View budget transparency regularly
- Vote in polls when created
- Submit suggestions/feedback
- Check volunteer schedule before visiting garden
- View photo gallery to see progress

---

### Entity 3: Supabase Services

**Service Level Agreement:**
- 99.9% uptime guarantee
- Automatic daily backups
- Scalable infrastructure
- Built-in security features

**Integration Points:**
1. **Database (PostgreSQL)**
   - KV Store table for all data
   - Automatic timestamps
   - JSONB support for flexible schemas

2. **Authentication Service**
   - Email/password authentication
   - JWT token management
   - User metadata storage
   - Admin role detection

3. **Storage Service**
   - Two buckets (gallery, avatars)
   - Signed URL generation
   - Automatic file management
   - 5MB file size limit (gallery), 2MB (avatars)

4. **Edge Functions**
   - Deno runtime
   - Hono web server
   - RESTful API endpoints
   - CORS enabled

---

### Entity 4: OpenWeatherMap API

**API Details:**
- Version: 2.5
- Protocol: RESTful HTTP
- Format: JSON
- Authentication: API Key

**Data Provided:**
- Current conditions
- Temperature (°C)
- Humidity (%)
- Wind speed (m/s)
- Weather description
- Location name
- Icon codes

**Usage Limits:**
- Free tier: 60 calls/minute
- System usage: ~96 calls/day (every 15 minutes)
- Well within free tier limits

**Reliability:**
- 99.9% uptime
- Global CDN delivery
- Response time: < 1 second typically

---

## System Inputs Summary

### Complete List of System Inputs

**Authentication & User Management:**
1. Login credentials (email, password)
2. Registration data (name, email, password)
3. Profile updates (name, bio, contact, avatar)

**Crop Management (Admin Only):**
4. New crop data (name, dates, health, stage, status, notes)
5. Crop updates (health changes, stage progression, notes)
6. Crop deletion requests

**Harvest Tracking (Admin Only):**
7. Harvest records (crop ID, date, quantity, quality, notes)
8. Harvest updates (corrections, additional notes)
9. Harvest deletion requests

**Budget Transparency (Admin Only):**
10. Budget transactions (description, category, amount, type, date, receipt)
11. Transaction updates (corrections)
12. Transaction deletion requests

**Volunteer Management (Admin Only):**
13. Volunteer tasks (name, task, date, status, contact, notes)
14. Task status updates (pending → in progress → completed)
15. Task deletion requests

**Photo Gallery (Admin Only):**
16. Photo uploads (image file, description)
17. Photo deletion requests

**Community Engagement:**
18. Poll creation (question, options) - Admin only
19. Poll votes (poll ID, option selected) - All users
20. Feedback submissions (message, category) - All users

**System Settings:**
21. Theme preference (light/dark mode)
22. Location coordinates (for weather)
23. Search/filter queries
24. Export/print requests

---

## System Outputs Summary

### Complete List of System Outputs

**Authentication & Session:**
1. Login success/failure messages
2. JWT authentication tokens
3. User session data
4. Logout confirmations

**Dashboard & Analytics:**
5. Crop health statistics
6. Total yield calculations
7. Budget balance summary
8. Upcoming volunteer tasks
9. Recent harvest records
10. Weather forecast widget

**Data Displays:**
11. Crop listings with full details
12. Harvest history tables
13. Budget transaction lists
14. Volunteer schedule displays
15. Photo gallery grids
16. User directory (admin only)

**Visualizations:**
17. Budget pie chart (expense by category)
18. Budget bar chart (monthly income vs expenses)
19. Harvest quality distribution
20. Crop health status indicators

**Community Features:**
21. Poll results with percentages
22. Feedback submission list
23. Community announcements
24. Poll participation statistics

**Weather Information:**
25. Current temperature display
26. Weather conditions and icons
27. Humidity and wind speed
28. Last updated timestamp
29. Location name

**Notifications & Feedback:**
30. Success toast messages
31. Error alerts
32. Confirmation dialogs
33. Loading indicators
34. Progress feedback

**Export & Reporting:**
35. CSV data exports
36. JSON data exports
37. Print-ready layouts
38. PDF reports (future)

**UI Elements:**
39. Responsive layouts (mobile/desktop)
40. Dark/light themed interfaces
41. Admin visual indicators (golden avatar, badges)
42. Navigation menus
43. Form validation messages

---

## Data Characteristics

### Data Types

**Structured Data:**
- User credentials (strings)
- Crop records (objects with dates, enums, strings)
- Harvest records (objects with numbers, dates, enums)
- Budget transactions (objects with numbers, dates, categories)

**Semi-Structured Data:**
- Poll options (arrays of objects)
- Feedback submissions (text with metadata)
- User metadata (JSONB in database)

**Unstructured Data:**
- Photo images (binary files - JPEG, PNG)
- Profile avatars (binary files)

**Real-Time Data:**
- Weather information (refreshes every 15 minutes)
- User session status
- Dashboard statistics (calculated on-demand)

---

## Data Volume Estimates

### Expected Data Growth (Annual)

| Data Type | Current Records | Annual Growth | 5-Year Projection |
|-----------|----------------|---------------|-------------------|
| Crops | 45 | +30/year | 195 records |
| Harvests | 123 | +100/year | 623 records |
| Budget Transactions | 87 | +150/year | 837 records |
| Volunteer Tasks | 156 | +200/year | 1,156 records |
| Photos | 234 | +300/year | 1,734 images |
| Polls | 12 | +20/year | 112 polls |
| Feedback | 78 | +100/year | 578 submissions |
| Users | 34 | +10/year | 84 users |

**Storage Requirements:**
- Database: ~500 KB → ~2.5 MB (5 years)
- Images: ~500 MB → ~3 GB (5 years)
- Total: Easily manageable with Supabase free tier

---

## Security & Privacy Considerations

### Data Security in Context Diagram

**Encrypted Connections:**
- All external entity ↔ system communications use HTTPS
- Supabase ↔ system connections encrypted with TLS
- OpenWeatherMap ↔ system uses HTTPS

**Authentication:**
- User credentials never stored in plain text
- Passwords hashed with bcrypt
- JWT tokens for session management
- Tokens expire after defined period

**Authorization:**
- Role-based access control (admin vs member)
- Admin privileges hardcoded (francisjohngorres@gmail.com)
- Server-side validation of all operations

**Data Privacy:**
- Private storage buckets (signed URLs required)
- User emails not publicly displayed
- Budget data visible to all (intentional transparency)
- No sensitive personal information collected

---

## System Context Summary

### What the Context Diagram Shows

The Level 0 DFD illustrates:

1. **Two primary user types** interacting with the system:
   - Barangay Administrator (full control)
   - Community Members (read + limited participation)

2. **Three external systems** providing services:
   - Supabase (backend infrastructure)
   - OpenWeatherMap (weather data)
   - Browser Storage (client-side persistence)

3. **Bidirectional data flows** showing:
   - What users send to the system (inputs)
   - What the system returns to users (outputs)
   - How the system communicates with external services

4. **System boundary** clearly defining:
   - What's inside Plant n' Plan (our application)
   - What's outside (third-party services and users)

5. **High-level functionality** without implementation details:
   - Data management (crops, harvests, budget, volunteers)
   - Transparency and community engagement
   - Weather integration
   - User authentication and profiles

---

## Relationship to Other DFD Levels

### DFD Hierarchy

```
Level 0 (Context Diagram) ← YOU ARE HERE
    │
    └─→ Shows: Entire system as single process
        Shows: All external entities
        Shows: Major data flows in/out
    
    ↓ Decomposed into
    
Level 1 DFD
    │
    └─→ Shows: Major processes within system (8-10 processes)
        Shows: Data flows between processes
        Shows: Data stores
        Examples: Authentication Process, Crop Management Process,
                  Budget Management Process, etc.
    
    ↓ Further decomposed into
    
Level 2 DFD
    │
    └─→ Shows: Detailed sub-processes
        Shows: Specific operations
        Shows: Detailed data transformations
        Examples: Create Crop Process, Update Harvest Process,
                  Generate Budget Chart Process, etc.
```

**Note:** The complete Level 1 and Level 2 DFDs are documented in `/DATA_FLOW_DIAGRAM.md`

---

## How to Use This Diagram

### For Thesis Documentation

**Include the Context Diagram to:**
1. Show the scope of your system
2. Identify all external entities (actors)
3. Demonstrate system boundaries
4. Illustrate major data flows
5. Provide high-level system overview

**Typical Placement:**
- Chapter 3: System Design and Architecture
- Section: Data Flow Analysis
- Before detailed Level 1 and Level 2 DFDs

---

### For Presentations

**Use this diagram to:**
1. Quickly explain what the system does
2. Show who uses the system
3. Demonstrate external dependencies
4. Explain data inputs and outputs
5. Provide context before diving into details

---

### For Stakeholders

**This diagram helps non-technical audiences understand:**
1. What the system does at a high level
2. Who can use it (admin vs community members)
3. What data goes in and comes out
4. What external services are needed
5. The overall system architecture

---

## Diagram Creation Tools

### Recommended Tools for Drawing DFD Level 0

**Online Tools (Free):**
1. **Draw.io / Diagrams.net**
   - URL: https://app.diagrams.net/
   - Pros: Free, web-based, export to many formats
   - Has built-in DFD shapes and templates

2. **Lucidchart**
   - URL: https://www.lucidchart.com/
   - Pros: Professional looking, collaboration features
   - Free tier available for students

3. **Creately**
   - URL: https://creately.com/
   - Pros: Intuitive, templates available
   - Educational discounts

**Desktop Tools:**
4. **Microsoft Visio**
   - Pros: Industry standard, extensive templates
   - Cons: Paid software

5. **yEd**
   - URL: https://www.yworks.com/products/yed
   - Pros: Free, powerful, automatic layouts
   - Cons: Steeper learning curve

**Text-Based (for Documentation):**
6. **Mermaid.js**
   - Renders in Markdown
   - Good for version control
   - Example provided above

7. **PlantUML**
   - Code-based diagrams
   - Integrates with documentation systems

---

## Common DFD Notation

### Symbols Used

```
┌─────────┐
│ Entity  │  = External Entity (Rectangle)
└─────────┘

╔═════════╗
║ Process ║  = Process (Rounded Rectangle)
╚═════════╝

─────────>  = Data Flow (Arrow with label)

┌─────────┐
│  Data   │  = Data Store (Open Rectangle)
│  Store  │
```

**Rules:**
- External entities: Rectangles
- Processes: Rounded rectangles (or circles in some notations)
- Data flows: Arrows labeled with data names
- Data stores: Open rectangles (only in Level 1+, not in Level 0)

---

## Validation Checklist

### Context Diagram Quality Check

Use this checklist to verify your DFD Level 0:

- [ ] All external entities identified
- [ ] System shown as single process
- [ ] Major data flows labeled
- [ ] Arrows show direction correctly
- [ ] Data flow names are descriptive
- [ ] No data stores shown (those are for Level 1+)
- [ ] System boundary is clear
- [ ] Inputs and outputs are balanced (what goes in must come out in some form)
- [ ] No implementation details included
- [ ] Readable and well-organized
- [ ] Legend/notation key provided (if needed)

---

## Example Usage in Thesis

### Sample Text to Accompany Diagram

> "Figure 3.1 presents the Level 0 Data Flow Diagram (Context Diagram) for the Plant n' Plan system. The diagram illustrates the system's position within its environment and identifies two primary user types: the Barangay Administrator and Community Members. The administrator interacts with the system to manage crops, record harvests, enter budget transactions, and oversee volunteers, while community members access read-only information and participate through polls and feedback.
>
> The system integrates with three external services: Supabase provides backend infrastructure including database, authentication, and file storage; OpenWeatherMap API supplies real-time weather data; and browser storage maintains user preferences locally. All communication between the system and external entities occurs through clearly defined data flows, ensuring transparency and traceability throughout the application."

---

## Glossary of Terms

**Context Diagram:** The highest-level DFD showing the system as a single process

**External Entity:** A person, organization, or system outside the system boundary that interacts with the system

**Data Flow:** Movement of data between entities, processes, or data stores, represented by arrows

**Process:** An activity that transforms inputs into outputs

**System Boundary:** The dividing line between what's inside the system and what's outside

**CRUD:** Create, Read, Update, Delete - basic database operations

**JWT:** JSON Web Token - authentication token format

**API:** Application Programming Interface - how systems communicate

**Signed URL:** Temporary, secure URL for accessing private files

---

**Document Version:** 1.0  
**Created:** November 6, 2025  
**System:** Plant n' Plan - Barangay Community Farming System  
**Diagram Level:** 0 (Context Diagram)  
**Status:** Complete and Ready for Thesis Documentation ✅
