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
cd ../backend
yarn dev
```

---

## 📌 Features

* Authentication (sign in/up)
* Create, update, and delete boards
* Drag-and-drop cards and tasks
* Real-time UI updates
* Fully responsive layout

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
│   ├── controllers/
│   ├── routes/
│   ├── models/
│   └── index.ts
```


---

## 📄 License

MIT License

---

## ✨ Author

**LeQuy**
[GitHub](https://github.com/LeQuy-123)

