# Flat Connect - Community Communication Platform

A comprehensive platform connecting apartment residents for better communication, issue tracking, and community management.

## Features

### 🏠 For Residents

- **Dashboard**: View personal complaints, announcements, and upcoming events
- **Complaint Management**: Submit and track maintenance requests and issues
- **Community Events**: View and register for apartment events
- **Real-time Announcements**: Stay updated with important community news
- **Profile Management**: Update personal information and preferences

### 👨‍💼 For Administrators

- **Admin Dashboard**: Complete overview of community activities
- **Complaint Resolution**: Track, assign, and resolve resident complaints
- **Event Management**: Create and manage community events
- **Announcement System**: Broadcast important information to residents
- **User Management**: Manage resident accounts and permissions

### 🎨 Design Features

- **Dark Theme**: Modern, eye-friendly dark interface
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Smooth Animations**: Framer Motion powered interactions
- **Video Background**: High-quality streaming video background
- **Glass Morphism**: Modern glass-effect UI elements

## Tech Stack

### Frontend

- **React 18** - Modern React with hooks
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations and transitions
- **HLS.js** - Video streaming for background video
- **Lucide React** - Beautiful icon library
- **React Router** - Client-side routing

### Backend

- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Token authentication
- **bcryptjs** - Password hashing
- **Express Validator** - Input validation

## Quick Start

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd flat-connect
   ```

2. **Install dependencies**

   ```bash
   npm run install-all
   ```

3. **Set up environment variables**

   ```bash
   # Copy the example environment file
   cp server/.env.example server/.env

   # Edit the .env file with your configuration
   # Update MongoDB URI, JWT secret, etc.
   ```

4. **Start MongoDB**

   ```bash
   # If using local MongoDB
   mongod

   # Or use MongoDB Atlas cloud service
   ```

5. **Run the application**

   ```bash
   # Development mode (runs both client and server)
   npm run dev

   # Or run separately:
   # Terminal 1 - Backend
   npm run server

   # Terminal 2 - Frontend
   npm run client
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - API Health Check: http://localhost:5000/api/health

## Demo Accounts

The application includes demo accounts for testing:

### Resident Account

- **Email**: resident@demo.com
- **Password**: demo123
- **Role**: Resident

### Admin Account

- **Email**: admin@demo.com
- **Password**: admin123
- **Role**: Administrator

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile

### Complaints

- `GET /api/complaints` - Get complaints (filtered by role)
- `POST /api/complaints` - Create new complaint
- `GET /api/complaints/:id` - Get single complaint
- `PUT /api/complaints/:id/status` - Update complaint status (admin)
- `POST /api/complaints/:id/comments` - Add comment to complaint

### Events

- `GET /api/events` - Get all events
- `POST /api/events` - Create new event (admin/owner)
- `GET /api/events/:id` - Get single event
- `PUT /api/events/:id` - Update event
- `POST /api/events/:id/register` - Register for event
- `DELETE /api/events/:id/register` - Unregister from event

### Announcements

- `GET /api/announcements` - Get announcements
- `POST /api/announcements` - Create announcement (admin/owner)
- `GET /api/announcements/:id` - Get single announcement
- `PUT /api/announcements/:id` - Update announcement
- `POST /api/announcements/:id/read` - Mark as read

### Users

- `GET /api/users` - Get all users (admin)
- `GET /api/users/:id` - Get single user
- `PUT /api/users/:id` - Update user
- `PUT /api/users/:id/activate` - Activate user (admin)
- `PUT /api/users/:id/deactivate` - Deactivate user (admin)

## Project Structure

```
flat-connect/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── HeroSection.jsx
│   │   │   ├── VideoPlayer.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   └── Auth.jsx
│   │   ├── App.js         # Main App component
│   │   ├── index.js       # React entry point
│   │   └── index.css      # Global styles
│   ├── package.json
│   └── tailwind.config.js
├── server/                # Node.js backend
│   ├── models/           # MongoDB models
│   │   ├── User.js
│   │   ├── Complaint.js
│   │   ├── Event.js
│   │   └── Announcement.js
│   ├── routes/           # API routes
│   │   ├── auth.js
│   │   ├── complaints.js
│   │   ├── events.js
│   │   ├── announcements.js
│   │   └── users.js
│   ├── middleware/       # Custom middleware
│   │   └── auth.js
│   ├── index.js         # Server entry point
│   ├── .env             # Environment variables
│   └── package.json
├── package.json         # Root package.json
└── README.md
```

## Key Features Implementation

### 1. Hero Section with Video Background

- Streaming video background using HLS.js
- Glass morphism navigation bar
- Animated content with Framer Motion
- Responsive design with Tailwind CSS

### 2. Authentication System

- JWT-based authentication
- Role-based access control (Resident, Owner, Admin, Maintenance, Security)
- Secure password hashing with bcrypt
- Demo accounts for quick testing

### 3. Complaint Management

- Submit complaints with categories and priorities
- Admin dashboard for complaint resolution
- Status tracking (Pending → In Progress → Resolved)
- Comment system for communication

### 4. Event Management

- Create and manage community events
- RSVP system with attendance tracking
- Event categories and status management
- Calendar integration ready

### 5. Announcement System

- Broadcast announcements to specific user groups
- Priority levels and expiration dates
- Read tracking and notifications
- Rich content support

## Customization

### Styling

- Modify `client/tailwind.config.js` for theme customization
- Update `client/src/index.css` for global styles
- Component-specific styles in individual files

### Database Schema

- Extend models in `server/models/` directory
- Add new fields or relationships as needed
- Update API routes accordingly

### API Extensions

- Add new routes in `server/routes/` directory
- Implement custom middleware in `server/middleware/`
- Update authentication and authorization as needed

## Deployment

### Frontend (Netlify/Vercel)

```bash
cd client
npm run build
# Deploy the build folder
```

### Backend (Heroku/Railway/DigitalOcean)

```bash
cd server
# Set environment variables
# Deploy with your preferred service
```

### Database

- Use MongoDB Atlas for cloud database
- Update connection string in environment variables

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:

- Create an issue in the repository
- Check the documentation
- Review the API endpoints

---

**Flat Connect** - Bringing apartment communities together through technology.
