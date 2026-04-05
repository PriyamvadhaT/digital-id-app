# 🚀 Deployment Guide: Digital ID System

Follow these steps to move your application from local development to a production environment.

## 1. Backend Deployment (Node.js/Express)

### Prerequisites
- A Node.js environment (v18+)
- A MongoDB instance (e.g., [MongoDB Atlas](https://www.mongodb.com/products/platform/atlas-database))

### Steps
1.  **Environment Setup**:
    - Copy `.env.example` to `.env` on your server.
    - Update `MONGO_URI` to point to your production database.
    - Generate a strong `JWT_SECRET` (e.g., `openssl rand -base64 48`).
    - Set the `PORT` (default is 3000).
2.  **Installation**:
    ```bash
    cd backend
    npm install --production
    ```
3.  **Process Management**:
    - Use a process manager like **PM2** to keep the app running:
    ```bash
    npm install -g pm2
    pm2 start src/server.js --name "digital-id-api"
    ```

---

## 2. Frontend Deployment (Ionic/Angular)

### Prerequisites
- A static hosting provider (e.g., Vercel, Firebase Hosting, Netlify, or AWS S3).

### Steps
1.  **Configuration**:
    - Update `frontend/src/environments/environment.prod.ts` with your **live backend API URL**.
    ```typescript
    export const environment = {
      production: true,
      apiUrl: 'https://api.yourdomain.com/api'
    };
    ```
2.  **Build**:
    ```bash
    cd frontend
    npm run build
    ```
    - This will generate a `www/` folder.
3.  **Upload**:
    - Upload the contents of the `www/` folder to your static hosting provider.

---

## 🛡️ Security Checklist for Production
- [ ] **SSL/TLS**: Ensure both frontend and backend are served via `https`.
- [ ] **Cors Policy**: Update `backend/src/server.js` `allowedOrigins` with your final production domain.
- [ ] **Database Backup**: Set up automated backups for your MongoDB database.
- [ ] **Secrets**: Never commit your `.env` file to version control.
