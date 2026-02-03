# Agri-Sathi - MERN Stack Project

A modern agricultural assistance platform built with the MERN stack (MongoDB, Express.js, React.js, Node.js).

## 🚀 Features

- **Modern UI/UX**: Beautiful, responsive design with Tailwind CSS
- **Full-Stack**: Complete MERN stack implementation
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT-based authentication system
- **Real-time**: Ready for real-time features
- **Mobile-First**: Responsive design for all devices

## 📁 Project Structure

```
AGRI-SATHI/
├── backend/                 # Node.js/Express server
│   ├── package.json
│   ├── server.js           # Main server file
│   └── config.env          # Environment variables
├── frontend/               # React application
│   ├── public/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   └── tailwind.config.js
├── package.json            # Root package.json
└── README.md
```

## 🛠️ Prerequisites

Before running this project, make sure you have the following installed:

- **Node.js** (v14 or higher)
- **npm** or **yarn**
- **MongoDB** (local installation or MongoDB Atlas)
- **MongoDB Compass** (for database management)

## 📦 Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd AGRI-SATHI
```

### 2. Install dependencies
```bash
# Install root dependencies
npm install

# Install backend dependencies
npm run install-server

# Install frontend dependencies
npm run install-client
```

### 3. Environment Setup

#### Backend Environment
Create a `.env` file in the `backend` folder (or use the existing `config.env`):
```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/agri-sathi
JWT_SECRET=your_jwt_secret_key_here_change_this_in_production
JWT_EXPIRE=30d
```

#### MongoDB Setup
1. Install MongoDB locally or use MongoDB Atlas
2. If using MongoDB Compass, connect to: `mongodb://localhost:27017`
3. Create a database named `agri-sathi`

## 🚀 Running the Application

### Development Mode (Both Frontend and Backend)
```bash
npm run dev
```

### Run Backend Only
```bash
npm run server
```

### Run Frontend Only
```bash
npm run client
```

### Production Build
```bash
npm run build
```

## 🌐 Access Points

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **MongoDB**: mongodb://localhost:27017/agri-sathi

## 📱 Available Pages

- **Home** (`/`): Landing page with features and statistics
- **About** (`/about`): Information about the project and team
- **Contact** (`/contact`): Contact form and information

## 🛠️ Tech Stack

### Backend
- **Node.js**: Runtime environment
- **Express.js**: Web framework
- **MongoDB**: Database
- **Mongoose**: ODM for MongoDB
- **JWT**: Authentication
- **bcryptjs**: Password hashing
- **cors**: Cross-origin resource sharing
- **helmet**: Security middleware
- **morgan**: HTTP request logger

### Frontend
- **React.js**: UI library
- **React Router**: Client-side routing
- **Tailwind CSS**: Utility-first CSS framework
- **React Icons**: Icon library
- **Axios**: HTTP client

## 🔧 Development Scripts

```bash
# Root level scripts
npm run dev              # Run both frontend and backend
npm run server           # Run backend only
npm run client           # Run frontend only
npm run install-all      # Install all dependencies
npm run build            # Build frontend for production

# Backend scripts
cd backend
npm run dev              # Run backend with nodemon
npm start                # Run backend in production

# Frontend scripts
cd frontend
npm start                # Run frontend development server
npm run build            # Build for production
```

## 📊 Database Schema

The application is ready for the following collections:
- **Users**: User authentication and profiles
- **Crops**: Crop information and management
- **Farms**: Farm details and analytics
- **Posts**: Community posts and discussions

## 🔐 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Helmet.js for security headers
- CORS configuration
- Input validation

## 🎨 UI/UX Features

- Responsive design
- Modern gradient backgrounds
- Glassmorphism effects
- Smooth animations
- Mobile-first approach
- Accessible design

## 🚀 Next Steps

1. **Database Models**: Create Mongoose schemas
2. **Authentication**: Implement user registration/login
3. **API Routes**: Add CRUD operations
4. **Real-time Features**: Add WebSocket support
5. **File Upload**: Implement image upload functionality
6. **Testing**: Add unit and integration tests

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For support, email info@agri-sathi.com or create an issue in the repository.

---

**Happy Coding! 🌱** 