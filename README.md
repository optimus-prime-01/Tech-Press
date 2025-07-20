# Tech-Press Blog Platform

A modern, full-stack, microservices-based tech blogging platform built with **Next.js (React)** for the frontend and **Node.js/Express** microservices for the backend. Features include authentication, blog CRUD, comments, profile management, and more.

---

## 🏗️ Architecture

```mermaid
flowchart TD
  FE1["Frontend (Next.js)"]
  US1["User Service (Express)"]
  BS1["Blog Service (Express)"]
  AS1["Author Service (Express)"]
  DBU["User DB (MongoDB)"]
  DBB["Blog DB (MongoDB)"]
  DBA["Author DB (MongoDB)"]
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
    /user1     # User microservice (Express, MongoDB)
    /blog      # Blog microservice (Express, MongoDB)
    /author    # Author microservice (Express, MongoDB)
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

### 4. Run the backend services

```bash
# In separate terminals
cd services/user1 && pnpm dev
cd services/blog && pnpm dev
cd services/author && pnpm dev
```

### 5. Run the frontend

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

## 🧩 API Endpoints

- **User Service:** `/api/v1/user1`
  - `POST /register` - Register user
  - `POST /login` - Login user
  - `GET /:id` - Get user profile
- **Blog Service:** `/api/v1/blog`
  - `GET /all` - Get all blogs
  - `POST /new` - Create blog
  - etc.

---

## 📝 Contributing

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin feature/YourFeature`)
5. Open a pull request

---

## 📄 License

[MIT](LICENSE)

---

## 🙏 Acknowledgements

- [Next.js](https://nextjs.org/)
- [Express](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Cloudinary](https://cloudinary.com/)

---

## 🖼️ UI Screenshots

Below are some screenshots of the Tech-Press Blog Platform UI:

<!-- Example: Place your screenshots in the /public or /assets directory and reference them here. -->

### Home Page
![Home Page](./public/screenshots/homepage.png)

### Blog List
![Blog List](./public/screenshots/bloglist.png)

### Blog Detail
![Blog Detail](./public/screenshots/blogdetail.png)

### Profile Page
![Profile Page](./public/screenshots/profile.png)

> **Tip:** Add your own screenshots to the `public/screenshots/` folder and update the paths above as needed.

---

**Feel free to copy and adjust this README for your GitHub repository! If you want the diagram or instructions tweaked, just ask.** 
