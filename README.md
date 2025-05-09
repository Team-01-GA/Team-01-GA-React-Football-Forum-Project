
# ⚽ React Fantasy Football Forum

A full-stack web forum application built with **React** and **Firebase**, designed for football fans to discuss gameweeks, players, and strategies.

---

## 🌟 Project Overview

This is a single-page application (SPA) where authenticated users can:
- Register or log in using email/password
- Create posts with a title and rich text content
- Browse and read all community posts
- Like posts and add comments (in future extensions)

---

## 🧱 Core Features

### 🔐 User Authentication
- Secure registration and login via Firebase Auth
- Each user has a unique handle and is stored in the database

### 📝 Posts (Forum Threads)
- Each post includes:
  - `title`: 16–64 characters
  - `content`: 32–8192 characters
  - `author`: user handle
  - `createdOn`: timestamp
  - `likes`: numeric counter
  - `comments`: object (keyed by comment IDs)
- Users can create posts once authenticated

### 📄 Post Listing
- All posts are stored in Firebase under `/posts`
- Posts can be queried and displayed in a feed-style format

### 💬 Comments (Planned)
- Each post will support threaded comments stored under `post.comments`
- Comments will include author, content, and timestamp

### ❤️ Likes (Planned)
- Users can like/unlike posts
- Each post tracks liked users
- Like counts are shown per post

---

## 🧠 Architecture

- **Frontend:** React + Vite + React Router + Context API
- **Backend:** Firebase Realtime Database & Auth
- **Global State:** AppContext for `user` and `userData`
- **Modular Design:** Services for DB access, views for page components

---

## 📁 Folder Structure

```
src/
├── components/        # Shared components like Header
├── config/            # Firebase config
├── providers/         # App context provider
├── services/          # Logic for auth, user, and post data
├── views/             # Page-level components (Login, Register, CreatePost, AllPosts, etc.)
└── App.jsx            # Central routing and context wiring
```

---

## ⚙️ Setup Instructions

1. Clone the repository
2. Run `npm install` to install dependencies
3. Set up a Firebase project:
   - Enable Email/Password Authentication
   - Create a Realtime Database
4. Add your config to `src/config/firebase-config.js`
5. Run `npm run dev` to start the development server

---

## 🧑‍🤝‍🧑 Target Audience

Football fans, FPL enthusiasts, or general sports communities who want a minimalist, open-source discussion platform.

---

## 📌 Goals

- Demonstrate full CRUD capability in a modern SPA
- Build a scalable, component-based React project
- Apply best practices in Firebase integration
- Practice team collaboration and task ownership

---

This is a learning-driven project, structured for readability and real-world development experience.
