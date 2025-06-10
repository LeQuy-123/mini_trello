/**
 * @swagger
 * tags:
 *   name: Tasks
 *   description: Task management within cards and boards
 */

import { Router, Request, Response } from "express";
import admin from "firebase-admin";
import { authenticate } from "../middleware/authMiddleware";
import { checkBoardAccess } from "../middleware/checkBoardAccess";
import { db } from "../firebase";

const router = Router({ mergeParams: true });

/**
 * @swagger
 * /boards/{boardId}/cards/{id}/tasks:
 *   get:
 *     summary: Retrieve all tasks for a card
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: boardId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of tasks
 */
router.get(
  "/",
  authenticate,
  checkBoardAccess,
  async (req: Request, res: Response) => {
    const { id: cardId } = req.params;

    const snapshot = await db
      .collection("tasks")
      .where("cardId", "==", cardId)
      .get();

    const tasks = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        cardId: data.cardId,
        title: data.title,
        description: data.description,
        status: data.status,
      };
    });

    res.status(200).json(tasks);
  }
);

/**
 * @swagger
 * /boards/{boardId}/cards/{id}/tasks:
 *   post:
 *     summary: Create a new task within a card
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: boardId
 *         required: true
 *         schema:
 *           type: string
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
 *             required: [title, description, status]
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *     responses:
 *       201:
 *         description: Task created successfully
 */
router.post(
  "/",
  authenticate,
  checkBoardAccess,
  async (req: Request, res: Response) => {
    const { id: cardId, boardId } = req.params;
    const { title, description, status } = req.body;

    if (!title || !description || !status) {
      res.status(400).json({ error: "Missing fields" });
      return;
    }

    const docRef = await db.collection("tasks").add({
      cardId,
      boardId,
      title,
      description,
      status,
      ownerId: req.uid,
      assignedUserIds: [],
      createdAt: admin.firestore.Timestamp.now(),
    });

    res.status(201).json({
      id: docRef.id,
      cardId,
      ownerId: req.uid,
      title,
      description,
      status,
    });
  }
);

/**
 * @swagger
 * /boards/{boardId}/cards/{id}/tasks/{taskId}:
 *   get:
 *     summary: Retrieve task details within a card
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: boardId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Task details
 */
router.get(
  "/:taskId",
  authenticate,
  checkBoardAccess,
  async (req: Request, res: Response) => {
    const { taskId, id: cardId } = req.params;

    const taskDoc = await db.collection("tasks").doc(taskId).get();
    if (!taskDoc.exists) {
      res.status(404).json({ error: "Task not found" });
      return;
    }

    const task = taskDoc.data()!;
    if (task.cardId !== cardId) {
      res.status(400).json({ error: "Task does not belong to this card" });
      return;
    }

    res.status(200).json({
      id: taskDoc.id,
      cardId: task.cardId,
      title: task.title,
      description: task.description,
      status: task.status,
    });
  }
);

/**
 * @swagger
 * /boards/{boardId}/cards/{id}/tasks/{taskId}:
 *   put:
 *     summary: Update task details within a card
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Task updated
 */
router.put(
  "/:taskId",
  authenticate,
  checkBoardAccess,
  async (req: Request, res: Response) => {
    const { taskId, id: cardId } = req.params;
    const updates = req.body;

    const ref = db.collection("tasks").doc(taskId);
    const doc = await ref.get();
    if (!doc.exists) {
      res.status(404).json({ error: "Task not found" });
      return;
    }

    const task = doc.data()!;
    if (task.cardId !== cardId) {
      res.status(400).json({ error: "Mismatch card ID" });
      return;
    }

    delete updates.cardId;
    delete updates.boardId;
    delete updates.ownerId;

    await ref.update(updates);

    res.status(200).json({
      id: ref.id,
      cardId: task.cardId,
    });
  }
);

/**
 * @swagger
 * /boards/{boardId}/cards/{id}/tasks/{taskId}:
 *   delete:
 *     summary: Delete a task within a card
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: Task deleted
 */
router.delete(
  "/:taskId",
  authenticate,
  checkBoardAccess,
  async (req: Request, res: Response) => {
    const { taskId, id: cardId } = req.params;

    const docRef = db.collection("tasks").doc(taskId);
    const doc = await docRef.get();
    if (!doc.exists) {
      res.status(404).json({ error: "Task not found" });
      return;
    }

    const task = doc.data()!;
    if (task.cardId !== cardId) {
      res.status(400).json({ error: "Card mismatch" });
      return;
    }

    await docRef.delete();
    res.status(204).send();
  }
);

/**
 * @swagger
 * /boards/{boardId}/cards/{id}/tasks/{taskId}/assign:
 *   post:
 *     summary: Assign member to a task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               memberId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Member assigned
 */
router.post(
  "/:taskId/assign",
  authenticate,
  checkBoardAccess,
  async (req: Request, res: Response) => {
    const { taskId } = req.params;
    const { memberId } = req.body;

    const taskRef = db.collection("tasks").doc(taskId);
    const doc = await taskRef.get();
    if (!doc.exists) {
      res.status(404).json({ error: "Task not found" });
      return;
    }

    await taskRef.update({
      assignedUserIds: admin.firestore.FieldValue.arrayUnion(memberId),
    });

    res.status(201).json({ taskId, memberId });
  }
);

/**
 * @swagger
 * /boards/{boardId}/cards/{id}/tasks/{taskId}/assign:
 *   get:
 *     summary: Retrieve assigned members of a task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of assigned members
 */
router.get(
  "/:taskId/assign",
  authenticate,
  checkBoardAccess,
  async (req: Request, res: Response) => {
    const { taskId } = req.params;

    const doc = await db.collection("tasks").doc(taskId).get();
    if (!doc.exists) {
      res.status(404).json({ error: "Task not found" });
      return;
    }

    const data = doc.data()!;
    const members = (data.assignedUserIds || []).map((memberId: string) => ({
      taskId,
      memberId,
    }));

    res.status(200).json(members);
  }
);

/**
 * @swagger
 * /boards/{boardId}/cards/{id}/tasks/{taskId}/assign/{memberId}:
 *   delete:
 *     summary: Remove member from a task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: Member removed
 */
router.delete(
  "/:taskId/assign/:memberId",
  authenticate,
  checkBoardAccess,
  async (req: Request, res: Response) => {
    const { taskId, memberId } = req.params;

    await db
      .collection("tasks")
      .doc(taskId)
      .update({
        assignedUserIds: admin.firestore.FieldValue.arrayRemove(memberId),
      });

    res.status(204).send();
  }
);

export default router;
