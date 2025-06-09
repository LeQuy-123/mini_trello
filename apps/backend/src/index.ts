import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import authRoute from "./routes/auth";
import boardRoutes from "./routes/boards";
import invitationsRouter from "./routes/invitations";

import path from "path";

const PORT = process.env.PORT || 3001;

const app = express();

// Swagger config
const swaggerOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Mini Trello Backend API",
      version: "1.0.0",
      description: "API documentation for authentication routes",
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [path.resolve(__dirname, "./routes/*.ts")],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use(cors());
app.use(express.json());

app.use(
  "/api",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    explorer: true,
  })
);

// Your routes
app.use("/auth", authRoute);
app.use("/boards", boardRoutes);
app.use("/invitations", invitationsRouter);

app.use("/", (req, res) => {
  res.send("Hello world");
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Swagger docs available at http://localhost:${PORT}/api`);
});
