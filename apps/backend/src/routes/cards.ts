import { Router, Request, Response } from 'express';
import { Timestamp, FieldValue } from 'firebase-admin/firestore';
import { authenticate } from '../middleware/authMiddleware';
import { checkBoardAccess } from '../middleware/checkBoardAccess';
import { db } from '../firebase';
import taskRoute from './tasks';
import { Card } from '../types/Card';

const router = Router({ mergeParams: true });
/**
 * @swagger
 * tags:
 *   name: Cards
 *   description: Card management within boards
 */

/**
 * @swagger
 * /boards/{boardId}/cards:
 *   get:
 *     summary: Get all cards in a board
 *     tags: [Cards]
 *     parameters:
 *       - in: path
 *         name: boardId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the board
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of cards
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
 *       500:
 *         description: Failed to fetch cards
 */

router.get('/', authenticate, checkBoardAccess, async (req: Request, res: Response) => {
	const { boardId } = req.params;

	try {
		const snapshot = await db
			.collection('cards')
			.where('boardId', '==', boardId)
			.orderBy('boardIndex')
			.get();

		const cards = snapshot.docs.map((doc) => {
			const data = doc.data();
			return {
				id: doc.id,
				name: data.name,
				description: data.description,
				boardIndex: data.boardIndex,
				...data,
			};
		});

		res.status(200).json(cards);
	} catch (error) {
		res.status(500).json({ error: 'Failed to fetch cards', details: error });
	}
});

/**
 * @swagger
 * /boards/{boardId}/cards:
 *   post:
 *     summary: Create a new card in a board
 *     tags: [Cards]
 *     parameters:
 *       - in: path
 *         name: boardId
 *         required: true
 *         schema:
 *           type: string
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
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Card created
 *       400:
 *         description: Missing fields
 *       500:
 *         description: Failed to create card
 */

router.post('/', authenticate, checkBoardAccess, async (req: Request, res: Response) => {
	const { boardId } = req.params;
	const { name, description } = req.body;

	if (!name || !description) {
		res.status(400).json({ error: 'Missing required fields: name or description' });
		return;
	}

	try {
		const boardRef = db.collection('boards').doc(boardId);
		const boardDoc = await boardRef.get();
		if (!boardDoc.exists) {
			res.status(404).json({ error: 'Board not found' });
			return
		}
		const snapshotCard = await db.collection('cards').where('boardId', '==', boardId).get();
		const currentIndex = snapshotCard.size || 0;

		const docRef = await db.collection('cards').add({
			name,
			description,
			boardId,
			userId: req.uid,
			createdAt: Timestamp.now(),
			tasksCount: 0,
			boardIndex: currentIndex,
		});

		await boardRef.update({
			cardsCount: FieldValue.increment(1),
		});

		res.status(201).json({
			id: docRef.id,
			name,
			description,
			boardIndex: currentIndex,
		});
	} catch (error) {
		res.status(500).json({ error: 'Failed to create card', details: error });
	}
});

/**
 * @swagger
 * /boards/{boardId}/cards/{id}:
 *   get:
 *     summary: Get details of a specific card
 *     tags: [Cards]
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
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Card details
 *       404:
 *         description: Card not found
 *       400:
 *         description: Card does not belong to this board
 *       500:
 *         description: Failed to fetch card
 */
router.get('/:id', authenticate, checkBoardAccess, async (req: Request, res: Response) => {
	const { boardId, id } = req.params;

	try {
		const cardDoc = await db.collection('cards').doc(id).get();

		if (!cardDoc.exists) {
			res.status(404).json({ error: 'Card not found' });
			return;
		}

		const card = cardDoc.data()!;
		if (card.boardId !== boardId) {
			res.status(400).json({ error: 'Card does not belong to this board' });
			return;
		}

		res.status(200).json({
			id: cardDoc.id,
			name: card.name,
			description: card.description,
		});
	} catch (error) {
		res.status(500).json({ error: 'Failed to fetch card details', details: error });
	}
});
/**
 * @swagger
 * /boards/{boardId}/cards/user/{user_id}:
 *   get:
 *     summary: Get cards by user in a board
 *     tags: [Cards]
 *     parameters:
 *       - in: path
 *         name: boardId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cards created by user
 *       500:
 *         description: Failed to fetch cards
 */
router.get(
	'/user/:user_id',
	authenticate,
	checkBoardAccess,
	async (req: Request, res: Response) => {
		const { boardId, user_id } = req.params;

		try {
			const snapshot = await db
				.collection('cards')
				.where('boardId', '==', boardId)
				.where('userId', '==', user_id)
				.get();

			const cards = snapshot.docs.map((doc) => {
				const data = doc.data();
				return {
					id: doc.id,
					name: data.name,
					description: data.description,
					tasksCount: data.tasksCount || 0,
					createdAt: (() => {
						if ('toMillis' in data.createdAt) return data.createdAt.toMillis();
						if (data.createdAt instanceof Date) return data.createdAt.getTime();
						return 0;
					})(),
				};
			});

			res.status(200).json(cards);
		} catch (error) {
			res.status(500).json({ error: 'Failed to fetch cards by user', details: error });
		}
	}
);

/**
 * @swagger
 * /boards/{boardId}/cards/{id}:
 *   put:
 *     summary: Update a card's details
 *     tags: [Cards]
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
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Card updated
 *       400:
 *         description: Invalid request
 *       404:
 *         description: Card not found
 *       500:
 *         description: Failed to update card
 */
router.put('/:id', authenticate, checkBoardAccess, async (req: Request, res: Response) => {
	const { boardId, id } = req.params;
	const updateData = req.body;

	try {
		const cardRef = db.collection('cards').doc(id);
		const cardDoc = await cardRef.get();

		if (!cardDoc.exists) {
			res.status(404).json({ error: 'Card not found' });
			return;
		}

		const card = cardDoc.data()!;
		if (card.boardId !== boardId) {
			res.status(400).json({ error: 'Card does not belong to this board' });
			return;
		}

		// Prevent changing boardId or userId accidentally
		if (updateData.boardId || updateData.userId) {
			delete updateData.boardId;
			delete updateData.userId;
		}

		await cardRef.update(updateData);

		const updatedDoc = await cardRef.get();
		const updatedCard = updatedDoc.data();

		res.status(200).json({
			id: updatedDoc.id,
			name: updatedCard?.name,
			description: updatedCard?.description,
		});
	} catch (error) {
		res.status(500).json({ error: 'Failed to update card', details: error });
	}
});

/**
 * @swagger
 * /boards/{boardId}/cards/{id}:
 *   delete:
 *     summary: Delete a card
 *     tags: [Cards]
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
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: Card deleted
 *       404:
 *         description: Card not found
 *       500:
 *         description: Failed to delete card
 */
router.delete('/:id', authenticate, checkBoardAccess, async (req: Request, res: Response) => {
	const { boardId, id } = req.params;

	try {
		const cardRef = db.collection('cards').doc(id);
		const cardDoc = await cardRef.get();

		if (!cardDoc.exists) {
			res.status(404).json({ error: 'Card not found' });
			return;
		}

		const card = cardDoc.data()!;
		if (card.boardId !== boardId) {
			res.status(400).json({ error: 'Card does not belong to this board' });
			return;
		}

		await cardRef.delete();
		await db
			.collection('boards')
			.doc(boardId)
			.update({
				cardsCount: FieldValue.increment(-1),
			});
		res.status(204).send();
	} catch (error) {
		res.status(500).json({ error: 'Failed to delete card', details: error });
	}
});
/**
 * @swagger
 * /boards/{boardId}/cards/reorder:
 *   patch:
 *     summary: Reorder cards using source and target IDs
 *     tags: [Cards]
 *     parameters:
 *       - in: path
 *         name: boardId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the board where cards are reordered
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sourceId
 *               - targetId
 *             properties:
 *               sourceId:
 *                 type: string
 *                 example: "card_abc123"
 *               targetId:
 *                 type: string
 *                 example: "card_xyz456"
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cards reordered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 cards:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       index:
 *                         type: integer
 *       400:
 *         description: Invalid input or card not found
 *       500:
 *         description: Server error while reordering cards
 */

router.patch(
	'/reorder',
	authenticate,
	checkBoardAccess,
	async (req: Request, res: Response) => {
		const { boardId } = req.params;
		const { sourceId, targetId } = req.body;


		if (!sourceId || !targetId) {
			res.status(400).json({ error: 'Missing sourceId or targetId' });
			return;
		}

		try {
			const snapshot = await db
				.collection('cards')
				.where('boardId', '==', boardId)
				.orderBy('boardIndex')
				.get();

			const cards = snapshot.docs.map((doc) => ({
				id: doc.id,
				...doc.data(),
			})) as Card[];

			const sourceIndex = cards.findIndex((card) => card.id === sourceId);
			const targetIndex = cards.findIndex((card) => card.id === targetId);

			if (sourceIndex === -1 || targetIndex === -1) {
				res.status(400).json({ error: 'Card not found' });
				return;
			}

			const [movedCard] = cards.splice(sourceIndex, 1);
			cards.splice(targetIndex, 0, movedCard);

			const batch = db.batch();
			cards.forEach((card, i) => {
				const ref = db.collection('cards').doc(card.id);
				batch.update(ref, { boardIndex: i });
			});

			await batch.commit();


			res.status(200).json(cards);
		} catch (error) {
			console.error(error);
			res.status(500).json({ error: 'Failed to reorder cards', details: error });
		}
	}
);

router.use('/:id/tasks', taskRoute);

export default router;
