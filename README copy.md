# SmartHouse Backend

## MongoDB Project Structure

This project follows a clean architecture approach for working with MongoDB/Mongoose with 25-30 collections:

```
src/
├── models/           # Database schemas and models
│   ├── index.js      # Exports all models
│   ├── User.js       # User model schema
│   └── [Collection].js  # Other collection models
├── repositories/     # Data access layer
│   ├── index.js      # Exports all repositories
│   ├── BaseRepository.js  # Generic repository methods
│   └── [Entity]Repository.js  # Specific repository implementations
├── services/         # Business logic layer
│   ├── index.js      # Exports all services
│   └── [Entity]Service.js  # Service implementations
├── controllers/      # Route handlers
│   └── [Entity]Controller.js  # Controller implementations
├── routers/          # Express routes
│   ├── index.js      # Combines all routes
│   └── [entity].js   # Route definitions
├── middlewares/      # Express middlewares
├── utils/            # Utility functions
├── config/           # Configuration
│   └── database.js   # MongoDB connection setup
├── constants/        # Application constants
├── templates/        # Email templates etc.
└── server.js         # Express server setup
```

### Key Components:

1. **Models**: Mongoose schemas that define the structure of documents
2. **Repositories**: Data access objects that encapsulate database operations
3. **Services**: Business logic that utilizes repositories
4. **Controllers**: Handle HTTP requests/responses and use services
5. **Routes**: Define API endpoints and connect them to controllers

## Getting Started

1. Install dependencies: `npm install`
2. Create a `.env` file based on `.env.example`
3. Start development server: `npm run dev`

## Available Scripts

- `npm run dev`: Start development server
- `npm start`: Start production server
- `npm run lint`: Run ESLint
- `npm run build-docs`: Generate API documentation