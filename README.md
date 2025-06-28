# Global Error Handling

A comprehensive demonstration of production-ready error handling for Node.js applications using Express and Prisma ORM. This project showcases how to transform cryptic database errors into clean, user-friendly API responses.

## 🌟 Features

- **Global Error Handling**: Centralized error processing with environment-aware responses
- **Prisma Error Transformation**: Converts database errors into user-friendly messages
- **Clean API Responses**: Consistent error format across all endpoints
- **Development vs Production**: Different error detail levels for debugging and production
- **Type Safety**: Full TypeScript implementation with proper error typing

## 🚀 Quick Start

### Prerequisites

- Node.js (v20 or higher)
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/rosahadi/global-error-handling.git
   cd global-error-handling
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up the database**

   ```bash
   # Generate Prisma client
   npm run db:generate

   # Push schema to database
   npm run db:push
   ```

4. **Configure environment**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` file:

   ```env
   NODE_ENV=development
   PORT=3000
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:3000`

## 🧪 Testing Error Scenarios

The project includes comprehensive error testing scenarios. Use the provided `api.http` file with VS Code's REST Client extension:

### 1. Duplicate Email Error (P2002)

```http
POST http://localhost:3000/api/users
Content-Type: application/json

{
  "email": "duplicate@example.com",
  "name": "Test User"
}
```

### 2. Foreign Key Violation (P2003)

```http
POST http://localhost:3000/api/users/999/posts
Content-Type: application/json

{
  "title": "Post with Invalid User",
  "content": "This will fail"
}
```

### 3. Record Not Found (P2025)

```http
DELETE http://localhost:3000/api/users/999
```

## 📋 Error Response Format

### Development Mode

```json
{
  "status": "fail",
  "message": "Duplicate value found for email. Please use a different value.",
  "error": {
    /* Full error object */
  },
  "stack": "Error stack trace..."
}
```

### Production Mode

```json
{
  "status": "fail",
  "message": "Duplicate value found for email. Please use a different value."
}
```

## 🛠️ Available Scripts

| Script                | Description                              |
| --------------------- | ---------------------------------------- |
| `npm run dev`         | Start development server with hot reload |
| `npm run build`       | Build TypeScript to JavaScript           |
| `npm start`           | Start production server                  |
| `npm run db:generate` | Generate Prisma client                   |
| `npm run db:push`     | Push schema changes to database          |
| `npm run db:studio`   | Open Prisma Studio                       |

## 🏗️ Architecture Overview

### Error Handling Flow

1. **Route Handler**: Business logic throws or encounters an error
2. **catchAsync Wrapper**: Catches async errors and passes to Express
3. **Global Error Handler**: Transforms errors based on type and environment
4. **Response**: Clean, consistent error response sent to client

### Key Components

#### Custom Error Class (`AppError`)

- Extends native Error class
- Adds `statusCode`, `status`, and `isOperational` properties
- Distinguishes between operational and system errors

#### Async Error Wrapper (`catchAsync`)

- Eliminates try-catch boilerplate in route handlers
- Automatically forwards errors to global handler

#### Global Error Handler

- Transforms Prisma errors into user-friendly messages
- Provides environment-specific error details
- Handles different error types (validation, database, system)

## 🔍 Supported Prisma Errors

| Error Code | Description                      | Transformed Message                    |
| ---------- | -------------------------------- | -------------------------------------- |
| P2002      | Unique constraint violation      | "Duplicate value found for {field}"    |
| P2003      | Foreign key constraint violation | "Invalid reference for field: {field}" |
| P2025      | Record not found                 | "Record not found"                     |
| P2021      | Table does not exist             | "The table does not exist"             |
| P2022      | Column does not exist            | "The column does not exist"            |

## 🌍 Environment Configuration

### Development

- Detailed error responses with stack traces
- Full error objects in responses
- Console logging for debugging

### Production

- Clean, user-friendly error messages
- No sensitive information leaked
- Proper HTTP status codes

## 🚦 Process Management

The application includes proper process handling:

- **Uncaught Exceptions**: Logs error and exits gracefully
- **Unhandled Rejections**: Closes server before exit
- **SIGTERM Handling**: Graceful shutdown with database cleanup

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

## 🙏 Acknowledgments

- Built with [Express.js](https://expressjs.com/)
- Database ORM by [Prisma](https://www.prisma.io/)
- TypeScript for type safety
- SQLite for simple database setup

## 📞 Support

If you have any questions or run into issues:

1. Check the [Issues](https://github.com/rosahadi/global-error-handling/issues) page
2. Review the error handling examples in `api.http`
3. Ensure your environment variables are set correctly
4. Verify database connection and schema
