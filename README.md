# FilmSage Frontend

<div align="center">
  <h3>🎬 An Intelligent Movie Discovery & Review Platform</h3>
  <p>A modern Vue.js application for discovering, reviewing, and getting personalized movie recommendations</p>
  <p>
    <a href="https://film-sage-frontend.vercel.app">🚀 Live Demo</a> •
    <a href="https://github.com/c0d3sh0rt4g3/FilmSage-Frontend">📖 Repository</a>
  </p>
</div>

## 🚀 Overview

FilmSage is a comprehensive movie discovery platform that combines the power of community reviews with AI-driven recommendations. Built with Vue.js 3 and modern web technologies, it provides users with an intuitive interface to explore movies, write reviews, and discover their next favorite film.

## ✨ Features

### 🔍 Movie Discovery
- **Advanced Search**: Search movies with intelligent autocomplete and advanced filtering options
- **Movie Details**: Comprehensive movie information with ratings, cast, and community reviews
- **Trending & Popular**: Discover what's currently trending in the movie world

### 👤 User Experience
- **User Authentication**: Secure registration and login system
- **Personalized Profiles**: Manage your movie preferences and viewing history
- **Favorites System**: Save and organize your favorite movies
- **Watchlist**: Keep track of movies you want to watch

### 📝 Reviews & Ratings
- **Write Reviews**: Share your thoughts with detailed movie reviews
- **Rating System**: Rate movies and see community ratings
- **Review Interactions**: Like and comment on other users' reviews

### 🤖 AI-Powered Recommendations
- **Smart Recommendations**: Get personalized movie suggestions based on your reviews and preferences
- **Genre-Based Filtering**: Discover movies in your favorite genres
- **Intelligent Matching**: AI analyzes your viewing patterns for better recommendations

### 🛡️ Administration
- **Admin Dashboard**: Complete administrative interface for platform management
- **User Management**: Monitor and manage user activities
- **Content Moderation**: Ensure quality and appropriate content

## 🛠️ Technology Stack

- **Frontend Framework**: Vue.js 3 with Composition API
- **Build Tool**: Vite for fast development and optimized builds
- **State Management**: Pinia for reactive state management
- **Routing**: Vue Router 4 with authentication guards
- **Styling**: SASS/SCSS for advanced styling capabilities
- **HTTP Client**: Axios for API communication
- **Development Tools**: Vue DevTools integration

## 📦 Project Structure

```
src/
├── components/          # Reusable Vue components
│   ├── AdvancedFilters.vue
│   ├── Header.vue
│   ├── Login/RegisterModals
│   └── SearchAutocomplete.vue
├── pages/              # Main application views
│   ├── Home.vue
│   ├── Search.vue
│   ├── MovieDetail.vue
│   ├── Profile.vue
│   ├── Favorites.vue
│   ├── Recommendations.vue
│   └── AdminDashboard.vue
├── stores/             # Pinia state stores
│   ├── authStore.js
│   └── reviewStore.js
├── utils/              # Utility functions
│   ├── api.js         # API communication layer
│   ├── tmdb.js        # Movie database integration
│   └── favorites.js   # Favorites management
├── router/             # Vue Router configuration
└── assets/            # Static assets and styles
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/c0d3sh0rt4g3/FilmSage-Frontend.git
   cd filmsage-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Configure your environment variables for API endpoints and external services.

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173` to see the application.

## 🔧 Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production with optimizations
- `npm run preview` - Preview production build locally
- `npm run docs` - Generate JSDoc documentation
- `npm run docs:serve` - Serve documentation on localhost:8080

## 📖 Documentation

### Code Documentation

This project includes comprehensive JSDoc documentation for all JavaScript utilities, stores, and router configurations. The documentation is automatically generated from inline comments in the code.

#### Generate Documentation
```bash
npm run docs
```

#### View Documentation
```bash
npm run docs:serve
```

Or use the Windows batch script:
```bash
generate-docs.bat
```

The documentation will be available at: **http://localhost:8080**

#### Documentation Structure

The generated documentation includes:

- **🛠️ Utils Modules**
  - `api.js` - Backend API communication layer
  - `tmdb.js` - TMDB API integration
  - `axios.js` - HTTP client configuration  
  - `favorites.js` - Local storage management
  - `validation.js` - Form validation utilities

- **🏪 Stores (Pinia)**
  - `authStore.js` - Authentication and user session management
  - `reviewStore.js` - Review creation and management

- **🛣️ Router**
  - `router/index.js` - Main routing configuration with guards
  - `router.js` - Alternative router setup

- **🎯 Main Entry**
  - `main.js` - Application entry point

#### Documentation Features

- **🔍 Search Functionality** - Find any function or module quickly
- **📱 Responsive Design** - Works on desktop and mobile
- **🔗 Cross-References** - Links between related functions
- **📄 Source Links** - Direct links to source code
- **📊 Module Organization** - Logical grouping of functionality

#### Maintenance

When adding new JavaScript files or functions:
1. Add JSDoc comments following the established patterns
2. Run `npm run docs` to regenerate documentation
3. Test locally with `npm run docs:serve`

## 🔒 Authentication & Security

- Secure JWT-based authentication system
- Protected routes with navigation guards
- Role-based access control (Admin/User roles)
- Secure API communication with interceptors

## 🎨 User Interface

- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Modern UI/UX**: Clean, intuitive interface with smooth interactions
- **Accessibility**: Built with accessibility best practices
- **Theme Support**: Consistent design system throughout the application

## 🌐 API Integration

The frontend communicates with a backend API for:
- User authentication and management
- Movie data and metadata
- Review and rating systems
- AI-powered recommendation engine
- Administrative functions

## 🔄 State Management

Utilizes Pinia for centralized state management:
- **Auth Store**: User authentication state and methods
- **Review Store**: Review-related data and operations
- Reactive updates across components
- Persistent user sessions

## 📱 Responsive Design

- Touch-friendly interface for mobile devices
- Optimized performance across all screen sizes
- Progressive Web App (PWA) capabilities

## 🚀 Deployment

### Production Build
```bash
npm run build
```

The `dist/` folder contains the production-ready files that can be deployed to any static hosting service.

### Deployment Options
- Netlify
- Vercel
- GitHub Pages
- AWS S3 + CloudFront
- Traditional web servers

## 📄 License

This project is part of a Final Degree Project (TFG) and is available for educational purposes.

---

<div align="center">
  <p>Built with ❤️ using Vue.js 3</p>
</div>
