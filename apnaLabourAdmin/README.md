# Apna Labour - Frontend

A React-based frontend application for the Apna Labour platform, providing admin dashboard functionality for labor management.

## Features

- **Authentication System**
  - Email-based signup and login
  - OTP verification via email
  - Auto-login after verification
  - Admin user management

- **Dashboard Components**
  - Order management
  - Labour management
  - Category management
  - Notification system
  - Suggestions management

## Tech Stack

- **Frontend**: React.js
- **Styling**: Tailwind CSS
- **Authentication**: AWS Amplify (Cognito)
- **Build Tool**: Webpack
- **Package Manager**: npm

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- AWS Amplify CLI (for backend setup)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd apnalabour_frontend
```

2. Install dependencies:
```bash
npm install
```

3. Set up AWS Amplify (if not already configured):
```bash
amplify init
amplify add auth
amplify add api
amplify push
```

4. Start the development server:
```bash
npm start
```

The application will be available at `http://localhost:3000`

## Project Structure

```
src/
├── components/          # React components
│   ├── LoginSignup.jsx  # Authentication component
│   ├── Dashboard.jsx    # Main dashboard
│   ├── Orders.jsx       # Order management
│   ├── LabourManagement.jsx
│   └── ...
├── services/            # API and utility services
│   ├── amplifyAuth.js   # AWS Amplify authentication
│   ├── api.jsx          # API service
│   └── ...
├── utils/               # Utility functions
├── App.js              # Main application component
└── index.js            # Application entry point
```

## Authentication Flow

1. **Signup**: User enters email and password
2. **Verification**: OTP sent to email for verification
3. **Auto-login**: After successful verification, user is automatically logged in
4. **Dashboard**: Access to admin dashboard features

## Environment Setup

The application uses AWS Amplify for backend services. Make sure to:

1. Configure AWS Amplify in your project
2. Set up Cognito User Pool for authentication
3. Configure GraphQL API for data management
4. Set up S3 storage for file uploads

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is proprietary software. All rights reserved.

## Support

For support and questions, please contact the development team.