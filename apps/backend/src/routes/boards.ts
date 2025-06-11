import { Request, Response, Router } from 'express';
import { db } from '../firebase';
import { authenticate } from '../middleware/authMiddleware';
import { Board } from '../types/Board';
import { Timestamp } from 'firebase-admin/firestore';
import cardRoutes from './cards';
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
router.post('/', authenticate, async (req: Request, res: Response) => {
	const { name, description } = req.body;

	if (!name || !description) {
		res.status(400).json({ error: 'Missing fields' });
		return;
	}

	try {
		const docRef = await db.collection('boards').add({
			name,
			description,
			userId: req.uid,
			createdAt: Timestamp.now(),
			cardCount: 0,
			members: [], // empty array to save user who being invited to this boards
		});

		res.status(201).json({ id: docRef.id, name, description });
	} catch (error) {
		res.status(500).json({ error: 'Failed to create board', details: error });
	}
});
/**
 * @swagger
 * /boards:
 *   get:
 *     summary: Get boards created by or shared with the user
 *     tags: [Boards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Filter boards by name (case-insensitive, partial match)
 *       - in: query
 *         name: created
 *         schema:
 *           type: boolean
 *         description: If true, only return boards created by the user
 *     responses:
 *       200:
 *         description: List of boards (sorted by creation time descending)
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: Board ID
 *                   name:
 *                     type: string
 *                     description: Board name
 *                   description:
 *                     type: string
 *                     description: Board description
 */

router.get('/', authenticate, async (req: Request, res: Response) => {
	try {
		const userId = req.uid;
		const { name, created } = req.query;

		const boardDocs: FirebaseFirestore.QueryDocumentSnapshot[] = [];

		if (created === 'true') {
			const ownedBoardsSnapshot = await db
				.collection('boards')
				.where('userId', '==', userId)
				.get();
			boardDocs.push(...ownedBoardsSnapshot.docs);
		} else if (created === 'false') {
			const invitedBoardsSnapshot = await db
				.collection('boards')
				.where('members', 'array-contains', userId)
				.get();
			boardDocs.push(...invitedBoardsSnapshot.docs);
		} else {
			const [ownedSnapshot, invitedSnapshot] = await Promise.all([
				db.collection('boards').where('userId', '==', userId).get(),
				db.collection('boards').where('members', 'array-contains', userId).get(),
			]);
			boardDocs.push(...ownedSnapshot.docs, ...invitedSnapshot.docs);
		}

		const uniqueBoardsMap = new Map<string, FirebaseFirestore.DocumentData>();
		boardDocs.forEach((doc) => {
			if (!uniqueBoardsMap.has(doc.id)) {
				uniqueBoardsMap.set(doc.id, doc);
			}
		});

		let boards = Array.from(uniqueBoardsMap.values()).map((doc) => {
			const data = doc.data() as Board;
			return {
				id: doc.id,
				name: data.name,
				description: data.description,
				createdAt: data.createdAt?.toMillis?.() || 0,
			};
		});

		if (name && typeof name === 'string') {
			const lowerName = name.toLowerCase();
			boards = boards.filter((board) => board.name.toLowerCase().includes(lowerName));
		}

		boards.sort((a, b) => b.createdAt - a.createdAt);

		res.status(200).json(
			boards.map(({ id, name, description }) => ({ id, name, description }))
		);
	} catch (err) {
		console.error('Error fetching boards:', err);
		res.status(500).json({ error: 'Failed to fetch boards', details: err });
	}
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
router.get('/:id', authenticate, async (req: Request, res: Response) => {
	const doc = await db.collection('boards').doc(req.params.id).get();
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
router.put('/:id', authenticate, async (req: Request, res: Response) => {
	const { name, description } = req.body;
	const docRef = db.collection('boards').doc(req.params.id);
	const doc = await docRef.get();

	if (!doc.exists || doc.data()?.userId !== req.uid) {
		res.sendStatus(404);
		return;
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
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
	const boardId = req.params.id;
	const boardRef = db.collection('boards').doc(boardId);
	const boardDoc = await boardRef.get();

	if (!boardDoc.exists || boardDoc.data()?.userId !== req.uid) {
		res.sendStatus(404);
		return
	}
	try {
		const batch = db.batch();
		const tasksSnap = await db.collection('tasks').where('boardId', '==', boardId).get();
		tasksSnap.forEach((doc) => batch.delete(doc.ref));
		const cardsSnap = await db.collection('cards').where('boardId', '==', boardId).get()
		cardsSnap.forEach((doc) => batch.delete(doc.ref));
		batch.delete(boardRef);
		await batch.commit();
		res.sendStatus(204);
		return
	} catch (error) {
		console.error('Failed to delete board with related cards and tasks:', error);
		res.status(500).json({ error: 'Failed to delete board and related items.' });
	}
});

router.use('/:boardId/cards', cardRoutes);

export default router;
