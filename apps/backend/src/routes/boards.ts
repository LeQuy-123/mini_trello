import { Request, Response, Router } from "express";
import { db } from "../firebase";
import { authenticate } from "../middleware/authMiddleware";
import { Board } from "../types/Board";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Boards
 *   description: Board management
 */

/**
 * @swagger
 * /boards:
 *   post:
 *     summary: Creates a new board
 *     tags: [Boards]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Board created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 description:
 *                   type: string
 */
router.post("/", authenticate, async  (req: Request, res: Response) => {
  const { name, description } = req.body;
  if (!name || !description) {
    res.status(400).json({ error: "Missing fields" });
    return;
  }
    

  const docRef = await db.collection("boards").add({
    name,
    description,
    userId: req.uid,
    createdAt: new Date(),
  });

  res.status(201).json({ id: docRef.id, name, description });
});

/**
 * @swagger
 * /boards:
 *   get:
 *     summary: Get all boards for user
 *     tags: [Boards]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of boards
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   description:
 *                     type: string
 */
router.get("/", authenticate, async  (req: Request, res: Response) => {
  const snapshot = await db
    .collection("boards")
    .where("userId", "==", req.uid)
    .get();
    const boards = snapshot.docs.map((doc) => {
      const data = doc.data() as Board;
      return {
        id: doc.id,
        name: data.name,
        description: data.description,
      };
    });
  res
    .status(200)
    .json(
      boards.map(({ id, name, description }) => ({ id, name, description }))
    );
});

/**
 * @swagger
 * /boards/{id}:
 *   get:
 *     summary: Get board by ID
 *     tags: [Boards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Board details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 description:
 *                   type: string
 *       404:
 *         description: Board not found
 */
router.get("/:id", authenticate, async  (req: Request, res: Response) => {
  const doc = await db.collection("boards").doc(req.params.id).get();
  if (!doc.exists || doc.data()?.userId !== req.uid) {
    res.sendStatus(404);
    return;
  }

  const { name, description } = doc.data()!;
  res.status(200).json({ id: doc.id, name, description });
});

/**
 * @swagger
 * /boards/{id}:
 *   put:
 *     summary: Update a board
 *     tags: [Boards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Board updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 description:
 *                   type: string
 *       404:
 *         description: Board not found
 */
router.put("/:id", authenticate, async  (req: Request, res: Response) => {
  const { name, description } = req.body;
  const docRef = db.collection("boards").doc(req.params.id);
  const doc = await docRef.get();

  if (!doc.exists || doc.data()?.userId !== req.uid) {
    res.sendStatus(404);
    return
  }

  await docRef.update({ name, description });
  res.status(200).json({ id: req.params.id, name, description });
});

/**
 * @swagger
 * /boards/{id}:
 *   delete:
 *     summary: Delete a board
 *     tags: [Boards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Board deleted successfully
 *       404:
 *         description: Board not found
 */
router.delete("/:id", authenticate, async  (req: Request, res: Response) => {
  const docRef = db.collection("boards").doc(req.params.id);
  const doc = await docRef.get();

  if (!doc.exists || doc.data()?.userId !== req.uid) {
    res.sendStatus(404);
    return;
  }

  await docRef.delete();
  res.sendStatus(204);
});

export default router;
