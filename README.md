# Cloud Web Drive – Backend

## Overview
Cloud Web Drive is a **Google Drive–inspired cloud storage prototype** built with a secure, scalable backend architecture. The backend is responsible for authentication, authorization, file and folder metadata management, AWS S3 integration, and storage quota enforcement.

> **Prototype Notice**: This system is intentionally configured with **lower storage limits** to prevent misuse and abuse. The architecture, however, is designed to scale.

---

## Technologies Used

- **Node.js** – Server-side runtime
- **Express.js** – REST API framework
- **MongoDB Atlas** – Cloud database for persistent storage
- **Mongoose** – ODM for MongoDB
- **AWS S3** – Object storage for files
- **JWT (JSON Web Tokens)** – Authentication & authorization
- **bcrypt** – Secure password hashing
- **AWS SES (Simple Email Service)** – Transactional email delivery for account activation and password reset

---

## Authentication & Security Features

### User Registration & Activation
- Email address used as **unique username**
- Passwords are **hashed using bcrypt** before storage
- Two-step activation workflow:
  1. User registers → account created as **inactive**
  2. Activation email sent with secure token
  3. Account becomes active only after link verification
- Only **activated users** are allowed to log in

### Login Protection
- Login blocked for:
  - Non-existent users
  - Inactive accounts
  - Invalid credentials
- Meaningful error messages returned to the client

### Forgot Password Workflow
- Email validation before reset request
- Secure, randomly generated reset token
- Token stored temporarily in MongoDB
- Token expires automatically and is **single-use**
- Token invalidated immediately after password reset

---

## File & Folder Management

- Files uploaded to **AWS S3** using pre-signed URLs
- Only file metadata stored in MongoDB
- Folder hierarchy preserved using parent–child relationships
- Full folder path reconstruction supported
- Ownership enforced at API level (users can only access their own data)

---

## Storage Management

- Per-user storage usage tracking
- Configurable storage limit via environment variables
- Upload requests blocked when quota is exceeded
- Backend acts as the **single source of truth** for storage limits

---

## Edge Cases Handled

- Duplicate email registration
- Login attempt before account activation
- Expired or reused activation/reset tokens
- Upload exceeding storage quota
- File name conflicts within the same folder
- Unauthorized access to files or folders
- Invalid or tampered tokens

---

## Environment Variables

```env
PORT=5000

# ==============================
# Database (MongoDB Atlas)
# ==============================
MONGO_URI=mongodb+srv://<DB_USER>:<DB_PASSWORD>@<CLUSTER_NAME>.mongodb.net/<DB_NAME>?retryWrites=true&w=majority

# ==============================
# Authentication (JWT)
# ==============================
JWT_SECRET=<YOUR_JWT_SECRET>
JWT_EXPIRES_IN=30m

# ==============================
# AWS Configuration
# ==============================
AWS_REGION=<AWS_REGION>
AWS_ACCESS_KEY_ID=<AWS_ACCESS_KEY_ID>
AWS_SECRET_ACCESS_KEY=<AWS_SECRET_ACCESS_KEY>
AWS_S3_BUCKET_NAME=<AWS_S3_BUCKET_NAME>
AWS_SES_SENDER_EMAIL=<VERIFIED_SENDER_EMAIL>

FRONTEND_URL=http://localhost:5173

STORAGE_LIMIT_MB=250
```

---

## Running the Backend

### Development Mode

```bash
npm install
npm run dev
```

- Starts the server using **nodemon**
- Auto-reloads on code changes
- Intended for local development

---

### Production Mode

```bash
npm install
npm start
```

- Runs the server in production mode
- Optimized for stability and performance
- Environment variables must be configured correctly


---

## Notes

- This backend follows **real-world cloud storage patterns**
- Designed for extensibility (sharing, versioning, plans)
- Suitable for academic evaluation and portfolio demonstration

---

## License

This project is a **prototype developed for educational and demonstration purposes**.
