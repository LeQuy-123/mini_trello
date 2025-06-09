import { Router, Request, Response } from "express";
import { db } from "../firebase";
import { v4 as uuidv4 } from "uuid";
import admin from "firebase-admin";
import { authenticate } from "../middleware/authMiddleware";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Invitations
 *   description: Board invitation management
 */

/**
 * @swagger
 * /invitations/{boardId}:
 *   post:
 *     summary: Invite a user to a board
 *     tags: [Invitations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: boardId
 *         required: true
 *         schema:
 *           type: string
 *         description: Board ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               member_id:
 *                 type: string
 *               email_member:
 *                 type: string
 *             required:
 *               - member_id
 *     responses:
 *       200:
 *         description: Invitation sent
 *       403:
 *         description: Unauthorized
 */
router.post("/:boardId", authenticate, async (req: Request, res: Response) => {
  const { member_id, email_member } = req.body;
  const boardId = req.params.boardId;
  const inviteId = uuidv4();

  const boardDoc = await db.collection("boards").doc(boardId).get();
  if (!boardDoc.exists) {
    res.status(404).json({ error: "Board not found" });
    return;
  }

  const boardOwnerId = boardDoc.data()?.userId;
  if (boardOwnerId !== req.uid) {
    res.status(403).json({ error: "Only the board owner can invite users" });
    return;
  }

  await db
    .collection("invitations")
    .doc(inviteId)
    .set({
      inviteId,
      boardId,
      boardOwnerId,
      memberId: member_id,
      email: email_member || null,
      status: "pending",
      createdAt: Date.now(),
    });

  res.status(200).json({ success: true, inviteId });
});

/**
 * @swagger
 * /invitations/{boardId}/respond:
 *   post:
 *     summary: Accept or decline an invitation
 *     tags: [Invitations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: boardId
 *         required: true
 *         schema:
 *           type: string
 *         description: Board ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               invite_id:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [accepted, declined]
 *             required:
 *               - invite_id
 *               - status
 *     responses:
 *       200:
 *         description: Invitation response recorded
 */
router.post(
  "/:boardId/respond",
  authenticate,
  async (req: Request, res: Response) => {
    const { invite_id, status } = req.body;
    const boardId = req.params.boardId;

    if (!["accepted", "declined"].includes(status)) {
      res.status(400).json({ error: "Invalid status" });
      return;
    }

    const inviteRef = db.collection("invitations").doc(invite_id);
    const inviteDoc = await inviteRef.get();

    if (!inviteDoc.exists || inviteDoc.data()?.memberId !== req.uid) {
      res
        .status(403)
        .json({ error: "Not authorized to respond to this invitation" });
      return;
    }

    await inviteRef.update({ status });

    if (status === "accepted") {
      const boardRef = db.collection("boards").doc(boardId);
      await boardRef.update({
        members: admin.firestore.FieldValue.arrayUnion(req.uid),
      });
    }

    res.status(200).json({ success: true });
  }
);

/**
 * @swagger
 * /invitations:
 *   get:
 *     summary: Get all invitations related to the user (sent & received)
 *     tags: [Invitations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of invitations
 */
router.get("/", authenticate, async (req: Request, res: Response) => {
  const [sentSnap, receivedSnap] = await Promise.all([
    db.collection("invitations").where("boardOwnerId", "==", req.uid).get(),
    db.collection("invitations").where("memberId", "==", req.uid).get(),
  ]);

  const sent = sentSnap.docs.map((doc) => ({ type: "sent", ...doc.data() }));
  const received = receivedSnap.docs.map((doc) => ({
    type: "received",
    ...doc.data(),
  }));

  res.status(200).json([...sent, ...received]);
});

export default router;
