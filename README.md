# Yeahnah - RSVP Management Platform (Next.js)

Yeahnah is a comprehensive RSVP management platform built with **Next.js** and designed to streamline event planning for both personal and business events. The platform features a modern, intuitive interface with advanced functionality including multi-store support, award voting systems, and detailed analytics.

## 🚀 Features

### 🎯 Core Functionality
- **Dual Event Types**: Support for both Business and Personal events
- **Simple RSVP System**: Guests respond with "Yeah" (Yes) or "Nah" (No)
- **Unique Guest IDs**: Optional guest IDs for easy RSVP access via custom links
- **Multi-Store Support**: Business events can organize guests by stores/departments

### 🏆 Award Voting System
- **Custom Awards**: Create your own award categories
- **Store-Filtered Voting**: Vote within specific departments or stores
- **Real-time Leaderboards**: See top performers instantly with Top 10 rankings
- **Voting Analytics**: Track vote counts and participation

### 📊 Host Dashboard
- **RSVP Management**: View all guest responses with filtering options
- **Export Functionality**: Download guest lists as CSV files
- **Share Links**: Generate unique RSVP links for each guest
- **Real-time Statistics**: Track attendance rates and response rates

### 🎨 Modern UI/UX
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Beautiful Gradients**: Modern glassmorphism design with smooth animations
- **Intuitive Navigation**: Clean, organized interface with clear visual hierarchy
- **Accessibility**: Keyboard navigation and screen reader friendly

## 🏗️ Technology Stack

### Full-Stack Next.js Application
- **Next.js 15** with App Router
- **React 19** with TypeScript
- **SQLite** database (in-memory for demo)
- **Tailwind CSS** for styling
- **Lucide React** for modern icons
- **API Routes** for backend functionality

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/anthev-stack/Yeahnah.git
   cd Yeahnah
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
yeahnah-rsvp/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API Routes
│   │   │   ├── events/        # Event management endpoints
│   │   │   ├── rsvp/          # RSVP endpoints
│   │   │   └── ...
│   │   ├── create-event/      # Event creation page
│   │   ├── event/[eventId]/   # Event dashboard pages
│   │   ├── rsvp/[guestId]/    # Guest RSVP pages
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Home page
│   │   └── globals.css        # Global styles
│   ├── components/            # Reusable components
│   │   └── Header.tsx
│   ├── context/               # React context providers
│   │   └── EventContext.tsx
│   └── lib/                   # Utility functions
│       └── database.ts        # Database configuration
├── package.json
├── next.config.js
├── tsconfig.json
├── vercel.json               # Vercel deployment config
└── README.md
```

## 🎯 Usage Guide

### Creating an Event

1. **Navigate to Create Event**: Click "Create Event" in the header
2. **Choose Event Type**: Select between Business or Personal event
3. **Fill Event Details**: Add title, description, host information
4. **Configure Options**: 
   - Enable multi-store for business events
   - Enable award voting system
5. **Add Guests**: Enter guest details with optional IDs and store assignments
6. **Create Awards**: Add custom award categories (optional)
7. **Create Event**: Review and create your event

### Managing RSVPs

1. **Access Dashboard**: Navigate to your event dashboard
2. **View Statistics**: See real-time RSVP counts and response rates
3. **Share Links**: Copy unique RSVP links for each guest
4. **Export Data**: Download guest lists as CSV files
5. **Filter Results**: Use store/department filters for business events

### Guest Experience

1. **Receive Invitation**: Get RSVP link from event host
2. **Enter Guest ID**: Use provided ID for quick access (optional)
3. **Respond to RSVP**: Click "Yeah" or "Nah" to confirm attendance
4. **Vote for Awards**: If enabled, vote for colleagues and friends
5. **View Results**: See voting results and event updates

## 🔌 API Endpoints

### Events
- `POST /api/events` - Create new event
- `GET /api/events?eventId={id}` - Get event details
- `GET /api/events/{eventId}/guests` - Get event guests
- `GET /api/events/{eventId}/awards` - Get event awards
- `GET /api/events/{eventId}/results` - Get voting results

### Guests
- `POST /api/events/{eventId}/guests` - Add guest to event
- `GET /api/rsvp/{guestId}` - Get guest RSVP status
- `POST /api/rsvp/{guestId}` - Submit RSVP response

### Awards & Voting
- `POST /api/events/{eventId}/awards` - Create award
- `POST /api/events/{eventId}/vote` - Submit vote

## 🗄️ Database Schema

### Events Table
- Event details, type, host information
- Multi-store configuration flags

### Guests Table
- Guest information and RSVP status
- Store/department assignments
- Unique guest IDs for easy access

### Awards Table
- Award categories and descriptions
- Event-specific awards

### Votes Table
- Voting records with voter and nominee tracking
- Timestamp and award association

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect your GitHub repository** to Vercel
2. **Vercel will auto-detect** this as a Next.js application
3. **Deploy!** - The app will be live in minutes

### Other Platforms

The application can also be deployed to:
- **Netlify** (with serverless functions)
- **Railway**
- **Render**
- **DigitalOcean App Platform**

## ⚠️ Production Considerations

### Current Setup (Demo)
- ✅ **Perfect for testing and demos**
- ❌ **In-memory database** (data lost on restart)
- 🔄 **Suitable for development and prototyping**

### For Production Use
1. **Replace SQLite** with a persistent database (PostgreSQL, MongoDB)
2. **Add authentication** (NextAuth.js recommended)
3. **Implement input validation** and security measures
4. **Add error monitoring** and logging
5. **Set up proper CI/CD** pipeline

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support, email support@yeahnah.com or create an issue in the repository.

---

**Built with Next.js** for modern, full-stack web development ❤️

**Ready for deployment on Vercel** - Connect your GitHub repo and deploy in minutes!