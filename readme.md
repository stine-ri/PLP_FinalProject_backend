
# 📚 MamaShule Teacher Dashboard

MamaShule is a comprehensive MERN-based School Management System designed to streamline interactions between school administrators, teachers, and parents. Built to enhance efficiency, communication, and analytics, MamaShule is ideal for modern institutions seeking digitizatio

---
## 🚀 Live Links

- 🌐 [Frontend Live](https://mamashule-peach.vercel.app/)
- 🧠 [Backend API (Hosted)](https://mama-shule.onrender.com)

---
## 📦 Repositories

- 💻 *Frontend GitHub*: [https://github.com/stine-ri/PLP_FinalProject_frontend.git](https://github.com/stine-ri/PLP_FinalProject_frontend.git)
- 🔧 *Backend GitHub*: [https://github.com/stine-ri/PLP_FinalProject_backend.git](https://github.com/stine-ri/PLP_FinalProject_backend.git)

---

## 🧠 Features by Role

### ✅ 1. Admin Dashboard

#### 🔹 Core Features:
- Manage school information (name, logo, address, contact)
- CRUD operations on users (teachers & parents)
- Assign students to classes and teachers
- View and filter all payment history
- Upload student results (Excel or manual form)
- Post announcements/messages across the school
- Configure class/subject structures

#### 💸 Monetizable Features:
- Mpesa & Stripe Integration – with digital receipts
- Analytics Dashboard – insights into performance, fee balance
- Push Notifications (SMS(Africa's Talking) /Email(NodeMailer))
- Subscription-based analytics for parents

---

### ✅ 2. Teacher Dashboard

#### 🔹 Core Features:
- View assigned classes and students
- Mark attendance daily per class
- Upload student results (term/subject)
- Add, edit, and view student results
- Assign homework, notes, monitor submissions
- Chat with assigned parents (real-time planned)
- Notify admin of class-related issues

#### 💸 Monetizable Features:
- Homework PDF uploads (basic limit, unlimited on premium)
- Performance tracking tools
- CSV/PDF report exports
- Real-time messaging with read receipts

---

### ✅ 3. Parent Dashboard

#### 🔹 Core Features:
- Read-only privileges – cannot edit or post
- View child’s profile, class, assigned teacher
- See results per term and subject
- Attendance tracking
- School fees payments (Mpesa/Stripe)
- School-wide announcements
- Chat with teachers

#### 💸 Monetizable Features:
- SMS notifications (absenteeism, fee reminders, results)
- Installment-based school fee payments
- Access to downloadable report cards
- Access via PWA or mobile app

---
## 🔐 Authentication & Access Control

- Role-based redirection (Admin, Teacher, Parent)
- Secure JWT auth
- Protected Routes per role
- Login persistence (localStorage & Redux)
- Access Permissions:
     - Admin: Full access to all actions and data
     - Teacher: Can add, edit, and view student records
     - Parent: View-only access to assigned data


---
## 📈 Monetization Strategy

| Feature                       | Role(s)         | Monetization Model                 |
|------------------------------|------------------|------------------------------------|
| Premium Analytics            | Admin, Parent    | Subscription Monthly/Yearly       |
| Messaging System             | Parents, Teachers| Free Tier + Paid Full Access       |
| PDF Report Cards             | Parent           | Paid per term/year                |
| SMS Notifications (Africa's Talking)           | Parent           | Pay per SMS bundle                |
| Homework Uploads             | Teacher          | Basic Limit, Premium Unlimited    |
| Parent App Access (PWA)      | Parent           | Basic Free, Full Premium          |

---
## ✨ Future Enhancements

- 📲 Mobile App with React Native or Flutter
- 🌍 Multi-school support with Super Admin access
- 🔔 Real-time notifications via Firebase
- 🤖 AI-powered chatbot for student Q&A
- 🧠 Performance Prediction with ML Models

---

## 📦 Installation Guide

### 1. Clone Repositories

```bash
git clone https://github.com/stine-ri/mamashule-frontend.git
git clone https://github.com/stine-ri/mamashule-backend.git
```

### 2. Frontend Setup

```bash
cd mamashule-frontend
npm install
npm run dev
```

### 3. Backend Setup

```bash
cd mamashule-backend
npm install
```

### Create a `.env` file

```
PORT=8000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key

# Africa's Talking Integration
AFRICASTALKING_USERNAME=sandbox
AFRICASTALKING_API_KEY=your_api_key

```

Then run the backend:

```bash
npm run dev
```

---

## 🗃️ Folder Structure

### Frontend

```
mamashule-frontend/
│
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   ├── pages/
│   ├── redux/
│   ├── routes/
│   └── App.tsx
│
├── package.json
└── vite.config.ts
```

### Backend

```
mamashule-backend/
│
├── controllers/
│   ├── authController.ts
│   ├── teacherController.ts
│   └── ...
│
├── models/
│   ├── Teacher.ts
│   ├── Student.ts
│   ├── Message.ts
│   └── Notification.ts
│
├── routes/
│   ├── authRoutes.ts
│   ├── teacherRoutes.ts
│   └── ...
│
├── sockets/
│   └── chatSocket.ts
│
├── server.ts
└── .env
```

---

## 🔐 Environment Variables

In your `.env` file (both frontend and backend), include:

```env
# Backend
PORT=8000
MONGO_URI=your_mongo_url
JWT_SECRET=your_secret

# Frontend (optional)
VITE_API_URL=https://mamashule-backend.onrender.com
```

---

## 🧪 Tech Stack

> *Project Stack*: MongoDB | Express.js | React.js (with TypeScript) | Node.js  
> *Frontend Styling*:  Tailwind CSS  
> *State Management*: Redux Toolkit  
> *Authentication*: Role-Based Auth (JWT)  
> *Payments*: Mpesa (STK Push) & Stripe Integration  
> *Real-Time Chat*: Socket.io 
> *SMS Integration: Africa's Talking

## 👩🏾‍💻 Author

- **Name**: Christine Nyambwari
- **GitHub**: [@stine-ri](https://github.com/stine-ri)
- **Email**: christinenyambwari@gmail.com

---

## 🙏 Acknowledgements

- 🙌 Power Learn Project (PLP) – For providing the opportunity and guidance.

---

## 📜 License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.

---

> MamaShule – Digitizing Schools, Empowering Communities
