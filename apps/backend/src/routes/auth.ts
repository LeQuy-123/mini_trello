/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication routes
 */

import { Request, Response, Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { db } from "../firebase";
import { User } from "../types/User";
import { authenticate } from "../middleware/authMiddleware";
import dotenv from "dotenv";

dotenv.config();

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "default_secret";

/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: Sign up a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Email already in use
 */
router.post("/signup", async (req: Request, res: Response) => {
  const { email, password, name } = req.body;

  const usersRef = db.collection("users");
  const existing = await usersRef.where("email", "==", email).get();

  if (!existing.empty) {
    res.status(400).json({ message: "Email already in use" });
    return;
  }

  const hash = await bcrypt.hash(password, 10);
  const userDoc = usersRef.doc();

  const newUser: User = {
    id: userDoc.id,
    email,
    name,
    password: hash,
    createdAt: new Date(),
  };

  await userDoc.set(newUser);

  res.status(201).json({ user: { id: userDoc.id, email, name } });
});

/**
 * @swagger
 * /auth/signin:
 *   post:
 *     summary: Sign in an existing user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successfully authenticated
 *       401:
 *         description: Invalid credentials
 *       404:
 *         description: User not found
 */
router.post("/signin", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const usersRef = db.collection("users");
  const snapshot = await usersRef.where("email", "==", email).get();

  if (snapshot.empty) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  const userDoc = snapshot.docs[0];
  const userData = userDoc.data() as User;

  const isValid = await bcrypt.compare(password, userData.password);
  if (!isValid) {
    res.status(401).json({ message: "Wrong email or password" });
    return;
  }

  const token = jwt.sign({ uid: userDoc.id }, JWT_SECRET, { expiresIn: "7d" });

  res.json({
    user: { id: userDoc.id, email: userData.email, name: userData.name },
    token,
  });
});

/**
 * @swagger
 * /auth/profile:
 *   get:
 *     summary: Get current authenticated user's profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Authenticated user info
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 */
router.get("/profile", authenticate, async (req: Request, res: Response) => {
  const uid = (req as any).uid;
  const doc = await db.collection("users").doc(uid).get();

  if (!doc.exists) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  const { password, ...userData } = doc.data() as User;
  res.json(userData);
});

export default router;
