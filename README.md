<p align="center">
  <img src="assets/foods66-banner.png" width="100%" />
</p>

<h1 align="center">Foods66 - Food Delivery App with MongoDB</h1>



# Foods66 - Food Delivery App with MongoDB

A modern food delivery application built with React, TypeScript, and Vite, powered by MongoDB for data persistence and Gemini AI for intelligent recommendations.

## Features

- 🍔 Browse restaurant menus
- 🤖 AI-powered food recommendations using Gemini
- 🛒 Shopping cart functionality
- 👤 User authentication and profiles
- 📦 Order tracking and history
- 💬 AI chatbot assistance
- 🎯 Personalized recommendations

## Technology Stack

- **Frontend:** React + TypeScript + Vite
- **Database:** MongoDB
- **AI Integration:** Google Gemini API
- **Styling:** CSS

## Prerequisites

- Node.js (v16 or higher)
- MongoDB instance (local or cloud)
- Gemini API key

## Installation & Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd foods66
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables in `.env.local`:
   ```
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   VITE_MONGODB_URI=your_mongodb_connection_string
   VITE_API_BASE_URL=http://localhost:5000
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```

## MongoDB Collections

The application uses the following MongoDB collections:

- **users** - User profiles and authentication
- **restaurants** - Restaurant information and menus
- **orders** - Order history and tracking
- **foodItems** - Food items and pricing
- **reviews** - Customer reviews and ratings
- **carts** - Shopping cart data

## Project Structure

```
foods66/
├── components/        # Reusable React components
├── pages/            # Page components
├── contexts/         # React context for state management
├── services/         # API and external service integrations
├── types.ts          # TypeScript type definitions
└── constants.ts      # Application constants
```

## Development

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

## API Integration

The app communicates with a backend API that handles MongoDB operations. Ensure your backend is running on the configured API URL.
