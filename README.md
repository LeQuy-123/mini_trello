# mini_trello


```markdown
# Mini Trello

A minimalist Trello-like Kanban board built with a full-stack architecture, featuring drag-and-drop task management.

---

## ⚙️ Tech Stack

- Framework: [React](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- Language: TypeScript
- Styling: Emotion, MUI (Material-UI)
- State Management: Redux Toolkit
- Form Handling: React Hook Form + Yup
- Drag and Drop: DnD Kit
- Socket Communication: Socket.IO
- Routing: React Router

### Backend:
- Node.js + Express
- REST API
- Authentication and board/task endpoints

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- Yarn (preferred) or npm
- MongoDB or appropriate DB (check backend config)

### Install dependencies

```bash
# At project root
yarn install
````

### Start development servers

```bash
# Start frontend
cd apps/frontend
yarn dev

# Start backend
cd apps/backend
yarn dev

# Or start both, using concurrently
yarn dev
```

---

## 📌 Features

* Authentication (sign in/up), also have sign in with GitHub  
  <img src="./assets/login.png" alt="Login" width="300"/>  
  <img src="./assets/signUp.png" alt="Sign Up" width="300"/>

* Create, update, and delete boards  
  <img src="./assets/addBoard.png" alt="Add Board" width="300"/>  
  <img src="./assets/editBoard.png" alt="Edit Board" width="300"/>  
  <img src="./assets/boardList.png" alt="Board List" width="300"/>

* Create, update, and delete cards and tasks inside a board  
  <img src="./assets/addCard.png" alt="Add Card" width="300"/>  
  <img src="./assets/addTask.png" alt="Add Task" width="300"/>  
  <img src="./assets/editCard.png" alt="Edit Card" width="300"/>  
  <img src="./assets/editTask.png" alt="Edit Task" width="300"/>

* Real-time UI updates

* Fully responsive layout  
  <img src="./assets/boardListMobile.png" alt="Board List Mobile" width="200"/>  
  <img src="./assets/loginMobile.png" alt="Login Mobile" width="200"/>

* Invitation  
  <img src="./assets/invitationList.png" alt="Invitation List" width="300"/>  
  <img src="./assets/inviteUser.png" alt="Invite User" width="300"/>


---

## 🧪 Scripts

| Location | Command    | Description              |
| -------- | ---------- | ------------------------ |
| frontend | `yarn dev` | Start React dev server   |
| backend  | `yarn dev` | Start backend API server |

---

## 🧱 Folder Structure

```
frontend/
├── public/               # Static assets
├── src/
│   ├── auth/             # Route guards
│   ├── components/       # Reusable components
│   ├── pages/            # Route-based components
│   ├── store/            # Redux store configuration
│   ├── App.tsx           # Main App component
│   ├── main.tsx          # Entry point
│   └── socket.ts         # WebSocket logic
├── index.html            # HTML template
├── vite.config.ts        # Vite configuration
├── tsconfig.json         # TypeScript config
└── package.json          # Project metadata
```

```
apps/backend/
├── src/
│   ├── middleware/
│   ├── routes/
│   ├── types/
│   ├── firebase.ts
│   ├── socket.ts
│   └── index.ts
```


---

## 📄 License

MIT License

---

## ✨ Author

**LeQuy**
[GitHub](https://github.com/LeQuy-123)

