
# Tech-Press Blog Platform

A modern, full-stack, microservices-based tech blogging platform built with **Next.js (React)** for the frontend and **Node.js/Express** microservices for the backend. Features include authentication, blog CRUD, comments, profile management, and more. The system uses both **SQL** and **MongoDB** databases for data storage, depending on the service and use case. 

This project also leverages **Cloudinary** for scalable image storage and delivery, **Redis** for fast caching and session management, and **RabbitMQ** for robust asynchronous message brokering between services.

---
# 🚀 Tech Stack

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-000?logo=nextdotjs&logoColor=fff" alt="Next.js"/>
  <img src="https://img.shields.io/badge/React-20232a?logo=react&logoColor=61dafb" alt="React"/>
  <img src="https://img.shields.io/badge/Node.js-339933?logo=nodedotjs&logoColor=fff" alt="Node.js"/>
  <img src="https://img.shields.io/badge/Express-000?logo=express&logoColor=fff" alt="Express"/>
  <img src="https://img.shields.io/badge/Tailwind_CSS-38bdf8?logo=tailwindcss&logoColor=fff" alt="Tailwind CSS"/>
  <img src="https://img.shields.io/badge/MongoDB-47A248?logo=mongodb&logoColor=fff" alt="MongoDB"/>
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=fff" alt="PostgreSQL"/>
  <img src="https://img.shields.io/badge/Redis-DC382D?logo=redis&logoColor=fff" alt="Redis"/>
  <img src="https://img.shields.io/badge/RabbitMQ-FF6600?logo=rabbitmq&logoColor=fff" alt="RabbitMQ"/>
  <img src="https://img.shields.io/badge/Cloudinary-3448C5?logo=cloudinary&logoColor=fff" alt="Cloudinary"/>
  <img src="https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=fff" alt="Docker"/>
  <img src="https://img.shields.io/badge/CI%2FCD-222?logo=githubactions&logoColor=blue" alt="CI/CD"/>
  <img src="https://img.shields.io/badge/AWS-232F3E?logo=amazonaws&logoColor=ff9900" alt="AWS"/>
</p>

---

## 🏗️ Architecture

```mermaid
flowchart TD
  FE1["Frontend (Next.js)"]
  US1["User Service (Express)"]
  BS1["Blog Service (Express)"]
  AS1["Author Service (Express)"]
  DBU["User DB (MongoDB/SQL)"]
  DBB["Blog DB (MongoDB/SQL)"]
  DBA["Author DB (MongoDB/SQL)"]
  REDIS["Redis (Cache/Session)"]
  MQ["RabbitMQ (Message Broker)"]
  CLOUD["Cloudinary (Image Storage)"]

  FE1 -- "REST API" --> US1
  FE1 -- "REST API" --> BS1
  FE1 -- "REST API" --> AS1

  US1 -- "User CRUD" --> DBU
  BS1 -- "Blog CRUD" --> DBB
  AS1 -- "Author CRUD" --> DBA

  US1 <--> BS1
  BS1 <--> AS1

  US1 -- "Cache/Session" --- REDIS
  BS1 -- "Cache/Session" --- REDIS
  AS1 -- "Cache/Session" --- REDIS

  US1 -- "Image Uploads" --- CLOUD
  BS1 -- "Image Uploads" --- CLOUD
  AS1 -- "Image Uploads" --- CLOUD

  US1 -- "Publish/Subscribe" --- MQ
  BS1 -- "Publish/Subscribe" --- MQ
  AS1 -- "Publish/Subscribe" --- MQ
```

---


## 🖼️ UI Screenshots

Below are some screenshots of the Tech-Press Blog Platform UI:

<!-- Example: Place your screenshots in the /public or /assets directory and reference them here. -->


<img width="1452" height="824" alt="Screenshot 2025-07-21 at 2 22 55 AM" src="https://github.com/user-attachments/assets/887cb57b-e1dd-4099-82d0-e1da82f90c82" />
<img width="2940" height="1662" alt="screencapture-localhost-3001-profile-687d47860d211504630eebe1-2025-07-21-02_27_56" src="https://github.com/user-attachments/assets/9c567363-3ae9-4136-947e-24aef6451eb1" />
<img width="2940" height="1662" alt="screencapture-localhost-3001-dashboard-2025-07-21-02_28_34" src="https://github.com/user-attachments/assets/aec5e359-4e89-44be-997e-8b5e4d428279" />

---

## 📝 .env Structure

Below are example `.env` files for each service and the frontend. Copy these into the appropriate folders and fill in your own values.

### Frontend (`tech-press-blog/.env`)
```
NEXT_PUBLIC_API_URL=http://localhost:5002/api/v1
NEXT_PUBLIC_USER_API_URL=http://localhost:5001/api/v1/user1
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
```

### User Service (`services/user1/.env`)
```
MONGO_URI=your_mongodb_uri
SQL_URI=your_sql_uri
JWT_SEC=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
REDIS_URL=redis://localhost:6379
RABBITMQ_URL=amqp://localhost
PORT=5001
```

### Blog Service (`services/blog/.env`)
```
MONGO_URI=your_mongodb_uri
SQL_URI=your_sql_uri
JWT_SEC=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
REDIS_URL=redis://localhost:6379
RABBITMQ_URL=amqp://localhost
PORT=5002
```

### Author Service (`services/author/.env`)
```
MONGO_URI=your_mongodb_uri
SQL_URI=your_sql_uri
JWT_SEC=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
REDIS_URL=redis://localhost:6379
RABBITMQ_URL=amqp://localhost
PORT=5003
```

> **Tip:** Never commit your `.env` files to version control. They are already included in `.gitignore`.

---

## ✨ Features

- **Authentication:** JWT-based login/register, Google OAuth, protected routes.
- **Blog Management:** Create, edit, delete, and view blogs with images, categories, and tags.
- **Comments:** Add comments to blogs.
- **Profile:** View and update user profiles, including profile picture upload.
- **Saved Blogs:** Save and view favorite blogs.
- **Responsive UI:** Modern, mobile-friendly design with Tailwind CSS.
- **Microservices:** Separate services for user, blog, and author management.
- **File Uploads:** Multer and Cloudinary integration for images.

---

## 📁 Project Structure

```
/tech-press-blog
  /app         # Next.js app directory (pages, layouts, etc.)
  /components  # Reusable React components
  /hooks       # Custom React hooks
  /lib         # Utility functions
  /public      # Static assets
  /styles      # Global and component styles
  /services
    /user1     # User microservice (Express, MongoDB/SQL)
    /blog      # Blog microservice (Express, MongoDB/SQL)
    /author    # Author microservice (Express, MongoDB/SQL)
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js (18+ recommended)
- MongoDB instance (local or Atlas)
- Cloudinary account (for image uploads)

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/tech-press-blog.git
cd tech-press-blog
```

### 2. Install dependencies

Install for each service and the frontend:

```bash
cd tech-press-blog
pnpm install # or npm install or yarn
cd services/user1 && pnpm install
cd ../blog && pnpm install
cd ../author && pnpm install
```

### 3. Environment Variables

Create `.env` files for each service and the frontend. Example for user1 service:

```
MONGO_URI=your_mongodb_uri
JWT_SEC=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 4. Start the Backend Services

Open three separate terminals (one for each service):

```bash
# Terminal 1: User Service
cd services/user1
pnpm dev

# Terminal 2: Blog Service
cd services/blog
pnpm dev

# Terminal 3: Author Service
cd services/author
pnpm dev
```

### 5. Start the Frontend

Open a new terminal and run:

```bash
cd tech-press-blog
pnpm dev
```

---

## 🛠️ Key Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server

---

## 📝 Contributing

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin feature/YourFeature`)
5. Open a pull request



