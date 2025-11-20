# 🌱 Plant n' Plan - Barangay Community Farming System

A comprehensive, transparent community farming management system designed to help barangays manage and monitor their community gardens with complete transparency. Built with TypeScript, React, Tailwind CSS, and Supabase.

![Plant n' Plan](https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=1200&q=80)

## 📋 Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [Admin Features](#admin-features)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

### 🎯 Core Features

#### 1. **Dashboard**
- Real-time overview of all farming activities
- Quick stats: Total crops, active plots, upcoming harvests
- Budget summary with visual progress indicators
- Recent community updates and events
- Responsive grid layout optimized for all devices

#### 2. **Crops Management**
- Complete CRUD operations for crop tracking
- Track crop details: name, type, planting date, expected harvest
- Visual health indicators (Healthy, Needs Attention, Critical)
- Status tracking (Planted, Growing, Ready to Harvest, Harvested)
- Plot number assignment and management
- Search and filter crops by status and health
- Bulk actions for multiple crops
- Export crop data to CSV
- Print-friendly crop reports

#### 3. **Harvest Tracker**
- Record and monitor all harvest activities
- Track harvest amounts (in kg) with date and time
- Link harvests to specific crops
- Quality rating system (Excellent, Good, Fair, Poor)
- Distribution tracking (Sold, Distributed, Stored)
- Harvest history with visual charts
- Filter by date range and crop type
- Export harvest reports

#### 4. **Budget Transparency**
- Complete visibility of all expenses
- Categorized budget items (Seeds, Tools, Fertilizer, Water, Labor, Other)
- Real-time budget vs. spent tracking
- Visual progress bars and charts
- Budget item management (Add, Edit, Delete)
- Total budget configuration
- Expense history with timestamps
- Export budget reports for transparency

#### 5. **Volunteer Management**
- Volunteer registration and tracking
- Task assignment system
- Availability scheduling
- Volunteer statistics and contribution tracking
- Contact information management
- Role assignment (Admin, Member, Volunteer)
- Task completion monitoring
- Export volunteer data

#### 6. **Task Management**
- Create and assign tasks to volunteers
- Task priority levels (High, Medium, Low)
- Status tracking (Pending, In Progress, Completed)
- Due date reminders
- Task description and notes
- Filter and sort tasks
- Task completion notifications

#### 7. **Photo Gallery**
- Upload and showcase garden progress photos
- Organize photos by date and category
- Photo captions and descriptions
- Grid and masonry layout views
- Photo upload with drag-and-drop support
- Delete and manage photos
- Mobile-optimized image viewing

#### 8. **Weather Forecasting**
- Real-time weather data integration
- 5-day weather forecast
- Temperature, humidity, and precipitation tracking
- Auto-location detection via IP geolocation
- Manual location override option
- Weather alerts and farming recommendations
- OpenWeatherMap API integration

#### 9. **Community Engagement**
- Community polls and voting system
- Feedback collection and management
- Poll creation with multiple options
- Real-time poll results with visual charts
- Feedback categorization (Suggestion, Complaint, Appreciation, Question)
- Status tracking for feedback (Pending, In Review, Resolved)
- Admin-only poll creation
- Export community engagement data

#### 10. **Planting Schedule**
- Visual calendar of planting activities
- Seasonal planting recommendations
- Crop rotation planning
- Planting reminders and notifications
- Integration with crops management

#### 11. **Community Updates**
- News and announcements system
- Event calendar
- Important notifications
- Activity timeline
- Real-time updates

### 🔐 Authentication & User Management

#### 12. **User Authentication**
- Secure signup and login system
- Email-based authentication via Supabase Auth
- Password strength validation
- Session management
- Auto-login for returning users
- Secure logout functionality

#### 13. **User Profiles**
- Customizable user profiles
- Profile information: Name, email, bio, location
- Profile picture upload (up to 2MB)
- Hover-to-upload avatar functionality
- Mobile-friendly photo upload button
- User statistics: Tasks completed, hours contributed, events attended
- Activity history tracking
- Profile edit functionality

#### 14. **Role-Based Access Control**
- Admin role for system administrators (francisjohngorres@gmail.com)
- Visual admin indicators (golden avatar border, shield icon, admin badge)
- Member and volunteer roles
- Permission-based feature access
- Admin-only features clearly marked

#### 15. **User Management (Admin Only)**
- View all registered users
- User role management
- Detailed user statistics
- User activity monitoring
- Search and filter users
- Export user data

### 🎨 User Interface Features

#### 16. **Dark Mode**
- System-wide dark mode toggle
- Persistent theme preference
- Smooth theme transitions
- Optimized for both light and dark viewing

#### 17. **Responsive Design**
- Mobile-first approach
- Tablet and desktop optimized layouts
- Burger menu for mobile navigation
- Touch-friendly interface
- Responsive tables and charts

#### 18. **Search & Filter**
- Global search functionality
- Advanced filtering options
- Sort by multiple criteria
- Real-time search results
- Filter persistence

#### 19. **Export & Print**
- Export data to CSV format
- Print-friendly reports
- Bulk data export
- Formatted printable views

#### 20. **Notifications**
- Toast notifications for user actions
- Success, error, and info messages
- Non-intrusive notification design
- Auto-dismiss with custom duration

### 🗄️ Backend Features

#### 21. **Database Management**
- Supabase PostgreSQL database
- Key-value store for flexible data storage
- Automatic data initialization
- Sample data generation
- Real-time data synchronization

#### 22. **File Storage**
- Supabase Storage integration
- Profile picture storage
- Photo gallery storage
- Secure file upload with validation
- Automatic file cleanup

#### 23. **API Integration**
- RESTful API architecture
- Secure authentication tokens
- CORS-enabled endpoints
- Error handling and logging
- Rate limiting protection

#### 24. **Location Services**
- IP-based geolocation
- Manual location override
- Location storage and retrieval
- City and coordinates tracking

## 🛠️ Technology Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Styling framework
- **shadcn/ui** - Component library
- **Lucide React** - Icon system
- **Recharts** - Data visualization
- **Sonner** - Toast notifications
- **React Hook Form** - Form management
- **Motion (Framer Motion)** - Animations

### Backend
- **Supabase** - Backend-as-a-Service
  - PostgreSQL Database
  - Authentication
  - Storage
  - Edge Functions (Deno)
- **Hono** - Web framework for Edge Functions

### APIs
- **OpenWeatherMap API** - Weather data
- **IP Geolocation API** - Location detection

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** or **yarn** - Package manager
- **Git** - Version control
- **VS Code** (recommended) - [Download](https://code.visualstudio.com/)
- **Supabase Account** - [Sign up](https://supabase.com/)

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
# Clone the repository
git clone <repository-url>

# Navigate to project directory
cd plant-n-plan
```

### 2. Install Dependencies

```bash
# Using npm
npm install

# Or using yarn
yarn install
```

### 3. Set Up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com/)
2. Copy your project credentials:
   - Project URL
   - Anon/Public Key
   - Service Role Key (keep this secret!)

### 4. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
# Create .env file
touch .env
```

Add the following variables to `.env`:

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SUPABASE_DB_URL=your_supabase_database_url

# OpenWeatherMap API (Optional but recommended)
OPENWEATHER_API_KEY=your_openweathermap_api_key

# IP Geolocation API (Optional)
IPGEOLOCATION_API_KEY=your_ipgeolocation_api_key
```

### 5. Deploy Supabase Edge Functions

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your_project_ref

# Deploy edge functions
supabase functions deploy server

# Set secrets for edge functions
supabase secrets set SUPABASE_URL=your_url
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_key
supabase secrets set OPENWEATHER_API_KEY=your_key
```

### 6. Initialize Database

The application will automatically initialize the database with sample data on first run. No manual SQL setup required!

## 🎮 Running the Application

### Development Mode

```bash
# Start development server
npm run dev

# Or with yarn
yarn dev

# Application will open at http://localhost:5173
```

### Build for Production

```bash
# Create production build
npm run build

# Preview production build
npm run preview

# Or with yarn
yarn build
yarn preview
```

### VS Code Setup

#### Recommended VS Code Extensions

Install these extensions for the best development experience:

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense"
  ]
}
```

#### VS Code Settings

Create `.vscode/settings.json`:

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "tailwindCSS.experimental.classRegex": [
    ["cn\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"]
  ]
}
```

#### Available Scripts

```bash
# Development
npm run dev              # Start dev server with hot reload

# Building
npm run build            # Build for production
npm run preview          # Preview production build

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint errors
npm run format           # Format code with Prettier

# Type Checking
npm run type-check       # Check TypeScript types

# Testing (if configured)
npm run test             # Run tests
npm run test:watch       # Run tests in watch mode
```

## 📁 Project Structure

```
plant-n-plan/
├── App.tsx                      # Main application component
├── components/                  # React components
│   ├── BudgetTransparency.tsx   # Budget management
│   ├── CommunityEngagement.tsx  # Polls and feedback
│   ├── CommunityUpdates.tsx     # News and updates
│   ├── CropsManagement.tsx      # Crop tracking
│   ├── Dashboard.tsx            # Main dashboard
│   ├── HarvestTracker.tsx       # Harvest records
│   ├── LandingPage.tsx          # Landing/login page
│   ├── LocationSettings.tsx     # Location configuration
│   ├── PhotoGallery.tsx         # Photo management
│   ├── PlantingSchedule.tsx     # Planting calendar
│   ├── ProfilePage.tsx          # User profile
│   ├── Sidebar.tsx              # Navigation sidebar
│   ├── SignUpDialog.tsx         # User registration
│   ├── ThemeToggle.tsx          # Dark mode toggle
│   ├── UserManagement.tsx       # User admin panel
│   ├── UserMenu.tsx             # User dropdown menu
│   ├── UserRegistration.tsx     # Registration form
│   ├── VolunteerManagement.tsx  # Volunteer system
│   ├── WeatherWidget.tsx        # Weather display
│   ├── figma/                   # Figma-related components
│   │   └── ImageWithFallback.tsx
│   └── ui/                      # shadcn/ui components
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       └── ... (40+ UI components)
├── styles/
│   └── globals.css              # Global styles and Tailwind config
├── supabase/
│   └── functions/
│       └── server/
│           ├── index.tsx        # Main server file (Hono)
│           └── kv_store.tsx     # Database utilities
├── utils/
│   ├── api.ts                   # API client functions
│   ├── auth.ts                  # Authentication utilities
│   ├── initializeData.ts        # Sample data generator
│   ├── weather.ts               # Weather API integration
│   └── supabase/
│       └── info.tsx             # Supabase configuration
├── guidelines/
│   └── Guidelines.md            # Development guidelines
├── .env                         # Environment variables (create this)
├── package.json                 # Dependencies
├── tsconfig.json               # TypeScript config
├── vite.config.ts              # Vite configuration
├── tailwind.config.js          # Tailwind CSS config
├── README.md                   # This file
├── WEATHER_API_SETUP.md        # Weather API setup guide
└── Attributions.md             # Image attributions
```

## 👨‍💼 Admin Features

The admin user (francisjohngorres@gmail.com) has access to additional features:

### Admin-Only Capabilities

1. **User Management**
   - View all registered users
   - Manage user roles
   - View user statistics
   - Monitor user activity

2. **Poll Creation**
   - Create community polls
   - Set poll duration
   - Add multiple poll options
   - Close polls manually

3. **Data Management**
   - Delete any content
   - Modify system settings
   - Access full analytics
   - Export all data

4. **Visual Indicators**
   - Golden avatar border
   - Shield icon next to name
   - "Admin" badge throughout UI
   - Special admin color scheme

### Setting Up Admin Account

1. Register with email: `francisjohngorres@gmail.com`
2. Use the sign-up form on the landing page
3. Admin role is automatically assigned
4. All admin features will be available immediately

## 🔌 API Documentation

### Base URL

```
https://[project-id].supabase.co/functions/v1/make-server-a8901673
```

### Authentication

All requests (except health check) require Bearer token authentication:

```bash
Authorization: Bearer [access_token]
```

### Endpoints

#### Crops
- `GET /crops` - Get all crops
- `POST /crops` - Create new crop
- `PUT /crops/:id` - Update crop
- `DELETE /crops/:id` - Delete crop

#### Harvests
- `GET /harvests` - Get all harvests
- `POST /harvests` - Create harvest record
- `PUT /harvests/:id` - Update harvest
- `DELETE /harvests/:id` - Delete harvest

#### Budget
- `GET /budget` - Get budget items
- `POST /budget` - Add budget item
- `PUT /budget/:id` - Update budget item
- `DELETE /budget/:id` - Delete budget item
- `GET /budget/total` - Get total budget
- `POST /budget/total` - Update total budget

#### Volunteers
- `GET /volunteers` - Get all volunteers
- `POST /volunteers` - Add volunteer
- `PUT /volunteers/:id` - Update volunteer
- `DELETE /volunteers/:id` - Delete volunteer

#### Tasks
- `GET /tasks` - Get all tasks
- `POST /tasks` - Create task
- `PUT /tasks/:id` - Update task
- `DELETE /tasks/:id` - Delete task

#### Polls
- `GET /polls` - Get all polls
- `POST /polls` - Create poll (Admin only)
- `POST /polls/:id/vote` - Vote on poll
- `DELETE /polls/:id` - Delete poll (Admin only)

#### Feedback
- `GET /feedbacks` - Get all feedback
- `POST /feedbacks` - Submit feedback
- `PUT /feedbacks/:id` - Update feedback status
- `DELETE /feedbacks/:id` - Delete feedback

#### Photos
- `GET /photos` - Get all photos
- `POST /photos` - Upload photo
- `DELETE /photos/:id` - Delete photo

#### Profile Pictures
- `POST /profile/avatar` - Upload profile picture
- `DELETE /profile/avatar` - Delete profile picture

#### Location
- `GET /location` - Get saved location
- `POST /location` - Save location

#### Health
- `GET /health` - Health check

## 🗄️ Database Schema

The application uses a key-value store with the following data structures:

### Data Keys

```typescript
// Crops
crops:list              // Array of all crops

// Harvests
harvests:list           // Array of all harvest records

// Budget
budget:items            // Array of budget items
budget:total            // Total budget amount

// Volunteers
volunteers:list         // Array of volunteers

// Tasks
tasks:list             // Array of tasks

// Polls
polls:list             // Array of community polls

// Feedback
feedbacks:list         // Array of feedback submissions

// Photos
photos:list            // Array of photo gallery items

// Updates
updates:list           // Array of community updates

// Events
events:list            // Array of events

// Users
user_profile:[user_id] // Individual user profiles

// Location
location:settings      // Saved location data
```

## 📝 Environment Variables Reference

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `SUPABASE_URL` | Your Supabase project URL | Yes | `https://xxxxx.supabase.co` |
| `SUPABASE_ANON_KEY` | Supabase anonymous/public key | Yes | `eyJhbGc...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Yes | `eyJhbGc...` |
| `SUPABASE_DB_URL` | PostgreSQL connection string | Yes | `postgresql://...` |
| `OPENWEATHER_API_KEY` | OpenWeatherMap API key | No* | `abc123...` |
| `IPGEOLOCATION_API_KEY` | IP Geolocation API key | No* | `xyz789...` |

\* *Optional but highly recommended for full weather functionality*

## 🔧 Configuration Files

### vite.config.ts

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
})
```

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["**/*.ts", "**/*.tsx"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

## 🚀 Deployment

### Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard
```

### Deploy to Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build and deploy
netlify deploy --prod

# Configure environment variables in Netlify dashboard
```

## 🐛 Troubleshooting

### Common Issues

**Issue: "Unauthorized" errors**
- Check that your Supabase keys are correctly set in `.env`
- Ensure you're logged in with a valid account
- Verify the access token is being passed correctly

**Issue: Weather data not loading**
- Verify `OPENWEATHER_API_KEY` is set
- Check API quota limits
- See `WEATHER_API_SETUP.md` for detailed setup

**Issue: Profile pictures not uploading**
- Check file size (must be under 2MB)
- Verify file type is an image
- Check browser console for detailed errors
- Ensure Supabase Storage is properly configured

**Issue: Dark mode not persisting**
- Clear browser cache and localStorage
- Check browser console for errors
- Verify theme toggle component is working

**Issue: Mobile sidebar not opening**
- Check that window width is correctly detected
- Verify burger menu button is visible
- Check z-index conflicts in styles

### Debug Mode

Enable detailed logging:

```typescript
// Add to App.tsx
console.log('Environment:', import.meta.env.MODE)
console.log('API Base:', API_BASE)
```

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [React Documentation](https://react.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [OpenWeatherMap API Docs](https://openweathermap.org/api)

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Use existing UI components from shadcn/ui
- Maintain consistent code formatting
- Add comments for complex logic
- Test thoroughly before submitting PR

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👏 Acknowledgments

- **shadcn/ui** - Beautiful component library
- **Supabase** - Amazing backend platform
- **Unsplash** - High-quality images
- **OpenWeatherMap** - Weather data
- **Lucide** - Icon system

## 📧 Contact

For questions or support, please contact:
- **Email**: francisjohngorres@gmail.com
- **Project Admin**: Francis John Gorres

---

**Made with 🌱 for our Barangay Community**

*Last Updated: November 2, 2025*
