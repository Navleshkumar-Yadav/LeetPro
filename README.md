# 🚀 LeetPro - Advanced Coding Platform

<div align="center">

![LeetPro Logo](https://img.shields.io/badge/LeetPro-Coding%20Platform-blue?style=for-the-badge&logo=code&logoColor=white)

[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=flat&logo=react&logoColor=white)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?style=flat&logo=mongodb&logoColor=white)](https://mongodb.com/)
[![Redis](https://img.shields.io/badge/Redis-Cache-DC382D?style=flat&logo=redis&logoColor=white)](https://redis.io/)

*A comprehensive coding platform with premium features, contests, assessments, and AI-powered assistance*

[🌟 Features](#-features) • [🛠️ Tech Stack](#️-tech-stack) • [🚀 Quick Start](#-quick-start) • [📚 API Documentation](#-api-documentation)

</div>

---

## 📋 Table of Contents

- [🌟 Features](#-features)
- [🛠️ Tech Stack](#️-tech-stack)
- [🏗️ Project Structure](#️-project-structure)
- [🚀 Quick Start](#-quick-start)
- [🔧 Environment Setup](#-environment-setup)
- [📚 API Documentation](#-api-documentation)
- [🎨 UI Components](#-ui-components)
- [💳 Payment Integration](#-payment-integration)
- [🏆 Contest System](#-contest-system)
- [🤖 AI Features](#-ai-features)
- [👨‍💼 Admin Panel](#-admin-panel)
- [🔒 Authentication & Security](#-authentication--security)
- [📱 Responsive Design](#-responsive-design)


---

## 🌟 Features

### 🎯 Core Features

#### 🏠 **Landing & Authentication**
- **Landing Page** - Professional introduction to the platform
- **User Authentication** - Secure login/signup with JWT tokens
- **Role-based Access** - User and Admin role management

#### 💻 **Problem Solving**
- **Coding Problems** - Extensive collection of DSA problems
- **Multi-language Support** - C++, Java, JavaScript
- **Real-time Code Editor** - Monaco Editor with syntax highlighting
- **Custom Test Cases** - Run code with custom inputs
- **Submission History** - Track all previous attempts
- **Move Code to Editor** - Seamlessly transfer code between submissions

#### 🏆 **Contest System**
- **Live Contests** - Real-time competitive programming
- **Rating System** - ELO-based rating calculation
- **Leaderboards** - Live rankings and performance tracking
- **Contest History** - Detailed performance analytics
- **Rating Graphs** - Visual progress tracking

#### 📊 **Assessments**
- **MCQ Tests** - Multiple choice technical assessments
- **Coding Assessments** - Programming challenges
- **Company-specific Tests** - Premium assessments for top companies
- **Detailed Reports** - Comprehensive performance analysis

#### 👑 **Premium Features**
- **Premium Problems** - Exclusive coding challenges
- **Company Tags** - See which companies asked specific problems
- **Advanced Analytics** - Detailed performance insights
- **Priority Support** - Enhanced customer service

### 🎮 **User Experience**

#### 📈 **Progress Tracking**
- **Activity Calendar** - Monthly coding activity heatmap
- **Streak System** - Daily coding streak with celebrations
- **Progress Rings** - Visual difficulty-wise progress
- **Badges & Achievements** - Gamified milestone rewards

#### 📝 **Organization Tools**
- **Custom Lists** - Create and manage problem collections
- **Notes System** - Add personal notes to problems
- **Daily Planner** - Task management for coding goals
- **Favorites** - Quick access to preferred problems

#### 🛍️ **Points & Store**
- **Point System** - Earn points through various activities
- **Merchandise Store** - Redeem points for branded goodies
- **Order Tracking** - Complete order management system
- **Address Management** - Secure shipping information

### 🔧 **Advanced Features**

#### 🤖 **AI Integration**
- **AI Assistant** - Context-aware coding help
- **Complexity Analysis** - Automated time/space complexity analysis
- **Smart Hints** - Intelligent problem-solving guidance

#### 🎥 **Educational Content**
- **Video Editorials** - Solution explanations (Brute Force & Optimal)
- **Custom Thumbnails** - Enhanced video presentation
- **Categorized Solutions** - Organized learning paths

#### ⏱️ **Productivity Tools**
- **Stopwatch/Timer** - Built-in time tracking
- **Code Persistence** - Automatic code saving across sessions
- **Multi-tab Support** - Work on multiple problems simultaneously

### 👨‍💼 **Admin Panel**

#### 📚 **Content Management**
- **Problem Creation** - Rich problem editor with test cases
- **Video Management** - Upload and organize solution videos
- **Problem Updates** - Edit existing problems and solutions
- **Content Deletion** - Remove outdated content

#### 🏢 **Business Management**
- **Contest Creation** - Schedule and manage coding contests
- **Order Management** - Handle customer merchandise orders
- **User Analytics** - Monitor platform usage and engagement
- **Premium Management** - Subscription and payment oversight

---

## 🛠️ Tech Stack

### 🎨 **Frontend**
```
React 19.1.0          - Modern UI library
Vite 6.3.5            - Fast build tool
Tailwind CSS 4.1.7    - Utility-first CSS framework
DaisyUI 5.0.35        - Component library
Framer Motion 11.11.17 - Animation library
Monaco Editor 4.7.0   - Code editor
React Hook Form 7.56.4 - Form management
Redux Toolkit 2.8.2   - State management
Axios 1.9.0           - HTTP client
Socket.io Client 4.8.1 - Real-time communication
```

### ⚙️ **Backend**
```
Node.js + Express 5.1.0 - Server framework
MongoDB + Mongoose 8.14.0 - Database
Redis 5.0.0             - Caching & sessions
Socket.io 4.8.1         - Real-time features
JWT 9.0.2               - Authentication
bcryptjs 3.0.2          - Password hashing
Multer 2.0.1            - File uploads
Cloudinary 2.6.1        - Media management
```

### 🔧 **External Services**
```
Judge0 API              - Code execution
Google Gemini AI        - AI assistance
Razorpay 2.9.6         - Payment processing
Cloudinary             - Video/image storage
Redis Cloud            - Managed Redis
```

### 🧪 **Testing & Development**
```
Jest                   - Testing framework
Vitest                 - Frontend testing
ESLint                 - Code linting
Nodemon 3.1.10         - Development server
```

---

## 🏗️ Project Structure

```
leetpro/
├── 📁 backend/                 # Node.js Backend
│   ├── 📁 src/
│   │   ├── 📁 config/          # Database & Redis configuration
│   │   ├── 📁 controllers/     # Business logic
│   │   ├── 📁 middleware/      # Authentication & validation
│   │   ├── 📁 models/          # MongoDB schemas
│   │   ├── 📁 routes/          # API endpoints
│   │   ├── 📁 scripts/         # Data seeding scripts
│   │   ├── 📁 tests/           # Backend tests
│   │   └── 📁 utils/           # Helper functions
│   ├── 📄 package.json
│   └── 📄 jest.config.js
│
├── 📁 frontend/                # React Frontend
│   ├── 📁 src/
│   │   ├── 📁 components/      # Reusable UI components
│   │   ├── 📁 pages/           # Route components
│   │   ├── 📁 hooks/           # Custom React hooks
│   │   ├── 📁 utils/           # Frontend utilities
│   │   ├── 📁 store/           # Redux store
│   │   └── 📁 tests/           # Frontend tests
│   ├── 📄 package.json
│   ├── 📄 vite.config.js
│   └── 📄 tailwind.config.js
│
└── 📄 README.md
```

---

## 🚀 Quick Start

### 📋 Prerequisites

- **Node.js** (v18 or higher)
- **MongoDB** (v5 or higher)
- **Redis** (v6 or higher)
- **npm** or **yarn**

### ⚡ Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/leetpro.git
cd leetpro
```

2. **Install Backend Dependencies**
```bash
cd backend
npm install
```

3. **Install Frontend Dependencies**
```bash
cd ../frontend
npm install
```

4. **Set up Environment Variables** (See [Environment Setup](#-environment-setup))

5. **Start the Development Servers**

**Backend:**
```bash
cd backend
npm start
```

**Frontend:**
```bash
cd frontend
npm run dev
```

6. **Access the Application**
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3000`

---

## 🔧 Environment Setup

### 🔐 Backend Environment Variables

Create `backend/.env`:

```env
# Server Configuration
PORT=3000
FRONTEND_URL=http://localhost:5173

# Database
DB_CONNECT_STRING=mongodb://localhost:27017/leetpro

# Redis Configuration
REDIS_PASS=your_redis_password

# JWT Secret
JWT_KEY=your_super_secret_jwt_key

# External APIs
JUDGE0_KEY=your_judge0_api_key
GEMINI_KEY=your_google_gemini_api_key

# Cloudinary (Media Storage)
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret

# Payment Gateway
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

### 🎨 Frontend Environment Variables

Create `frontend/.env`:

```env
VITE_BACKEND_URL=http://localhost:3000
```

---

## 📚 API Documentation

### 🔐 Authentication Routes
```
POST   /user/register          # User registration
POST   /user/login             # User login
POST   /user/logout            # User logout
GET    /user/check             # Verify authentication
DELETE /user/deleteProfile     # Delete user account
```

### 💻 Problem Routes
```
GET    /problem/getAllProblem           # Get all problems
GET    /problem/problemById/:id         # Get specific problem
GET    /problem/problemSolvedByUser     # Get user's solved problems
GET    /problem/submittedProblem/:pid   # Get submissions for problem

# Admin only
POST   /problem/create                  # Create new problem
PUT    /problem/update/:id              # Update problem
DELETE /problem/delete/:id              # Delete problem
```

### 🏆 Contest Routes
```
GET    /contest/current                 # Live contests
GET    /contest/upcoming                # Upcoming contests
GET    /contest/past                    # Past contests
GET    /contest/my                      # User's registered contests
GET    /contest/:contestId              # Contest details
POST   /contest/:contestId/register     # Register for contest
GET    /contest/:contestId/problems     # Contest problems (live)
POST   /contest/:contestId/submit       # Submit solution
GET    /contest/:contestId/report       # Contest report
```

### 📊 Assessment Routes
```
GET    /assessment/all                  # All assessments
GET    /assessment/:assessmentId        # Assessment details
POST   /assessment/:assessmentId/start  # Start assessment
POST   /assessment/:assessmentId/mcq-answer     # Submit MCQ answer
POST   /assessment/:assessmentId/coding-answer  # Submit coding answer
POST   /assessment/:assessmentId/complete       # Complete assessment
```

### 💳 Payment Routes
```
GET    /payment/plans                   # Available plans
POST   /payment/create-order            # Create payment order
POST   /payment/verify-payment          # Verify payment
GET    /payment/subscription-status     # Check subscription
```

### 🛍️ Store Routes
```
GET    /store/goodies                   # Available merchandise
POST   /store/order                     # Place order
GET    /store/orders                    # User's orders

# Admin only
GET    /store/admin/orders              # All orders
PATCH  /store/admin/order/:orderId      # Update order status
```

### 📈 Dashboard Routes
```
GET    /dashboard/data                  # Dashboard analytics
GET    /dashboard/calendar              # Activity calendar
PUT    /dashboard/profile               # Update profile
POST   /dashboard/profile-image         # Upload profile image
GET    /dashboard/points                # User points
GET    /dashboard/points/activity       # Points activity log
```

---

## 🎨 UI Components

### 🧩 Core Components

#### **AnimatedCard**
```jsx
<AnimatedCard className="custom-styles" delay={0.2}>
  <h3>Card Content</h3>
</AnimatedCard>
```

#### **GradientButton**
```jsx
<GradientButton 
  variant="primary" 
  size="lg" 
  loading={isLoading}
  onClick={handleClick}
>
  Click Me
</GradientButton>
```

#### **LoadingSpinner**
```jsx
<LoadingSpinner size="xl" text="Loading..." />
```

### 🎯 Specialized Components

#### **DashboardMultiRingChart**
- Visual progress tracking with animated rings
- Difficulty-wise problem solving statistics

#### **ActivityCalendar**
- Monthly activity heatmap
- Streak visualization
- Interactive date selection

#### **StreakCelebrationModal**
- Animated celebration for streak milestones
- Confetti effects
- Achievement notifications

#### **GlobalNavigation**
- Comprehensive navigation menu
- User profile dropdown
- Quick access to all features

---

## 💳 Payment Integration

### 🔄 Payment Flow

1. **Plan Selection** - User chooses subscription plan
2. **Order Creation** - Backend creates Razorpay order
3. **Payment Gateway** - Razorpay handles payment processing
4. **Verification** - Backend verifies payment signature
5. **Subscription Activation** - Premium features unlocked

### 💰 Supported Plans

| Plan | Duration | Price | Features |
|------|----------|-------|----------|
| Weekly | 7 days | ₹99 | Basic premium access |
| Monthly | 30 days | ₹299 | Full premium features |
| Yearly | 365 days | ₹2999 | Best value + exclusive content |

### 🔒 Security Features

- **Signature Verification** - Razorpay signature validation
- **Duplicate Prevention** - Order ID tracking
- **Secure Storage** - Encrypted payment details
- **Subscription Management** - Automatic renewal handling

---

## 🏆 Contest System

### 📊 Rating Algorithm

The platform implements an ELO-based rating system:

```javascript
// Rating calculation factors
- Performance ratio (score/max_score)
- Rank position (relative to participants)
- Current rating (higher rated players gain/lose less)
- Contest difficulty multiplier
```

### 🎯 Contest Features

- **Real-time Leaderboards** - Live ranking updates
- **Problem Scoring** - Weighted point system
- **Time Penalties** - Faster submissions rank higher
- **Rating History** - Complete rating progression
- **Contest Reports** - Detailed performance analysis

### 📈 Rating Tiers

| Rating Range | Tier | Color |
|--------------|------|-------|
| 800-1199 | Beginner | Gray |
| 1200-1399 | Novice | Green |
| 1400-1599 | Intermediate | Blue |
| 1600-1799 | Advanced | Purple |
| 1800+ | Expert | Gold |

---

## 🤖 AI Features

### 🧠 AI Assistant

**Powered by Google Gemini AI**

- **Context-aware Help** - Understands current problem
- **Hint Generation** - Step-by-step guidance
- **Code Review** - Bug detection and suggestions
- **Solution Explanation** - Algorithm breakdown

### 📊 Complexity Analysis

**Automated Analysis Features:**

- **Time Complexity** - Big O notation analysis
- **Space Complexity** - Memory usage evaluation
- **Algorithm Identification** - Pattern recognition
- **Optimization Suggestions** - Performance improvements

### 💡 Smart Features

- **Adaptive Hints** - Difficulty-based assistance
- **Learning Path** - Personalized problem recommendations
- **Progress Insights** - AI-powered analytics

---

## 👨‍💼 Admin Panel

### 📚 Content Management

#### **Problem Creation**
- Rich text editor for problem descriptions
- Multiple test case management
- Multi-language code templates
- Reference solution validation

#### **Video Management**
- Cloudinary integration for video storage
- Custom thumbnail support
- Categorized solutions (Brute Force/Optimal)
- Bulk video operations

#### **Assessment Management**
- MCQ question bank
- Coding problem assignments
- Company-specific test creation
- Performance analytics

### 🏢 Business Operations

#### **Order Management**
- Customer order tracking
- Status updates (Pending → Processing → Shipped → Delivered)
- Shipping address management
- Bulk order operations

#### **Contest Administration**
- Contest scheduling and management
- Problem assignment and scoring
- Participant monitoring
- Result publication

#### **Analytics Dashboard**
- User engagement metrics
- Revenue tracking
- Performance insights
- Growth analytics

---

## 🔒 Authentication & Security

### 🛡️ Security Measures

#### **Authentication**
- **JWT Tokens** - Secure session management
- **Redis Blacklisting** - Token invalidation
- **Role-based Access** - User/Admin permissions
- **Password Hashing** - bcrypt encryption

#### **Data Protection**
- **Input Validation** - Zod schema validation
- **SQL Injection Prevention** - Mongoose ODM
- **XSS Protection** - Content sanitization
- **CORS Configuration** - Cross-origin security

#### **API Security**
- **Rate Limiting** - Request throttling
- **Authentication Middleware** - Route protection
- **Error Handling** - Secure error responses
- **Logging** - Security event tracking

### 🔐 User Privacy

- **Data Encryption** - Sensitive data protection
- **Secure File Upload** - Cloudinary integration
- **Privacy Controls** - User data management
- **GDPR Compliance** - Data protection standards

---

## 📱 Responsive Design

### 🎨 Design System

#### **Color Palette**
```css
Primary: Blue (#667eea) to Purple (#764ba2)
Success: Green (#10b981)
Warning: Yellow (#f59e0b)
Error: Red (#ef4444)
Neutral: Gray scale (#1f2937 to #f9fafb)
```

#### **Typography**
- **Headings** - Inter font family, 120% line height
- **Body Text** - Inter font family, 150% line height
- **Code** - JetBrains Mono, monospace

#### **Spacing System**
- **Base Unit** - 8px grid system
- **Consistent Margins** - Multiples of 8px
- **Responsive Breakpoints** - Mobile-first approach

### 📐 Responsive Breakpoints

| Device | Breakpoint | Layout |
|--------|------------|--------|
| Mobile | < 768px | Single column |
| Tablet | 768px - 1024px | Two columns |
| Desktop | > 1024px | Multi-column |
| Large | > 1440px | Wide layout |

---

## 🙏 Acknowledgments

- **Judge0** - Code execution engine
- **Google Gemini** - AI assistance
- **Razorpay** - Payment processing
- **Cloudinary** - Media management
- **MongoDB** - Database solution
- **Redis** - Caching layer

---

<div align="center">

**Made with ❤️ for The LeetPro**

</div>
