import { Router, Request, Response } from 'express';
import { db } from '../firebase';
import { v4 as uuidv4 } from 'uuid';
import admin from 'firebase-admin';
import { authenticate } from '../middleware/authMiddleware';
import { Invitation } from '../types/User';

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
router.post('/:boardId', authenticate, async (req: Request, res: Response) => {
	const { memberId, email } = req.body;
	const boardId = req.params.boardId;
	const inviteId = uuidv4();

	const boardDoc = await db.collection('boards').doc(boardId).get();
	if (!boardDoc.exists) {
		res.status(404).json({ error: 'Board not found' });
		return;
	}

	const boardOwnerId = boardDoc.data()?.userId;
	if (boardOwnerId !== req.uid) {
		res.status(403).json({ error: 'Only the board owner can invite users' });
		return;
	}

	await db
		.collection('invitations')
		.doc(inviteId)
		.set({
			inviteId,
			boardId,
			boardOwnerId,
			memberId: memberId,
			email: email || null,
			status: 'pending',
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
router.post('/:boardId/respond', authenticate, async (req: Request, res: Response) => {
	const { invite_id, status } = req.body;
	const boardId = req.params.boardId;

	if (!['accepted', 'declined'].includes(status)) {
		res.status(400).json({ error: 'Invalid status' });
		return;
	}

	const inviteRef = db.collection('invitations').doc(invite_id);
	const inviteDoc = await inviteRef.get();

	if (!inviteDoc.exists || inviteDoc.data()?.memberId !== req.uid) {
		res.status(403).json({ error: 'Not authorized to respond to this invitation' });
		return;
	}

	await inviteRef.update({ status });

	if (status === 'accepted') {
		const boardRef = db.collection('boards').doc(boardId);
		await boardRef.update({
			members: admin.firestore.FieldValue.arrayUnion(req.uid),
		});
	}

	res.status(200).json({ success: true });
});

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
router.get('/', authenticate, async (req: Request, res: Response) => {
	try {
		const [sentSnap, receivedSnap] = await Promise.all([
			db.collection('invitations').where('boardOwnerId', '==', req.uid).get(),
			db.collection('invitations').where('memberId', '==', req.uid).get(),
		]);

		const sent = sentSnap.docs.map((doc) => {
			const data = doc.data() as Invitation;
			return { type: 'sent', id: doc.id, ...data };
		});

		const received = receivedSnap.docs.map((doc) => {
			const data = doc.data() as Invitation;
			return { type: 'received', id: doc.id, ...data };
		});
		const invitations = [...sent, ...received];

		const userIds = new Set<string>();
		invitations.forEach((inv) => {
			userIds.add(inv.boardOwnerId);
			userIds.add(inv.memberId);
		});

		const userDocs = await db.getAll(
			...[...userIds].map((uid) => db.collection('users').doc(uid))
		);

		const userMap = new Map<string, { name: string; email: string }>();
		userDocs.forEach((doc) => {
			if (doc.exists) {
				const { name, email } = doc.data()!;
				userMap.set(doc.id, { name, email });
			}
		});

		const enrichedInvitations = invitations.map((inv) => ({
			...inv,
			sender: userMap.get(inv.boardOwnerId) || null,
			recipient: userMap.get(inv.memberId) || null,
		}));

		res.status(200).json(enrichedInvitations);
	} catch (err) {
		console.error('Failed to fetch invitations:', err);
		res.status(500).json({ error: 'Failed to fetch invitations', details: err });
	}
});


export default router;
