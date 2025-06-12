/**
 * @swagger
 * tags:
 *   name: Tasks
 *   description: Task management within cards and boards
 */

import { Router, Request, Response } from 'express';
import admin from 'firebase-admin';
import { authenticate } from '../middleware/authMiddleware';
import { checkBoardAccess } from '../middleware/checkBoardAccess';
import { db } from '../firebase';

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
router.get('/', authenticate, checkBoardAccess, async (req: Request, res: Response) => {
	const { id: cardId } = req.params;

	const snapshot = await db
		.collection('tasks')
		.where('cardId', '==', cardId)
		.orderBy('cardIndex')
		.get();

	const tasks = snapshot.docs.map((doc) => {
		const data = doc.data();
		return {
			id: doc.id,
			cardId: data.cardId,
			title: data.title,
			description: data.description,
			status: data.status,
			cardIndex: data.cardIndex,
		};
	});

	res.status(200).json(tasks);
});

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
router.post('/', authenticate, checkBoardAccess, async (req: Request, res: Response) => {
	const { id: cardId, boardId } = req.params;
	const { title, description, status } = req.body;

	if (!title || !description || !status) {
		res.status(400).json({ error: 'Missing fields' });
		return;
	}
	const existingTasks = await db
		.collection('tasks')
		.where('cardId', '==', cardId)
		.get();

	const nextIndex = existingTasks.empty ? 0 : (existingTasks.docs[0].data().cardIndex ?? 0) + 1;

	try {
		const docRef = await db.collection('tasks').add({
			cardId,
			boardId,
			title,
			description,
			status,
			ownerId: req.uid,
			assignedUserIds: [],
			createdAt: admin.firestore.Timestamp.now(),
			cardIndex: nextIndex,
		});
		await db
			.collection('cards')
			.doc(cardId)
			.update({
				tasksCount: admin.firestore.FieldValue.increment(1),
			});
		res.status(201).json({
			id: docRef.id,
			cardId,
			ownerId: req.uid,
			title,
			description,
			status,
		});
	} catch (error) {
		console.error('Error creating task:', error);
		res.status(500).json({ error: 'Failed to create task', details: error });
	}
});


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
router.get('/:taskId', authenticate, checkBoardAccess, async (req: Request, res: Response) => {
	const { taskId, id: cardId } = req.params;

	const taskDoc = await db.collection('tasks').doc(taskId).get();
	if (!taskDoc.exists) {
		res.status(404).json({ error: 'Task not found' });
		return;
	}

	const task = taskDoc.data()!;
	if (task.cardId !== cardId) {
		res.status(400).json({ error: 'Task does not belong to this card' });
		return;
	}

	res.status(200).json({ ...taskDoc });
});

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
router.put('/:taskId', authenticate, checkBoardAccess, async (req: Request, res: Response) => {
	const { taskId, id: cardId } = req.params;
	const updates = req.body;

	const ref = db.collection('tasks').doc(taskId);
	const doc = await ref.get();
	if (!doc.exists) {
		res.status(404).json({ error: 'Task not found' });
		return;
	}

	const task = doc.data()!;
	if (task.cardId !== cardId) {
		res.status(400).json({ error: 'Mismatch card ID' });
		return;
	}

	delete updates.cardId;
	delete updates.boardId;
	delete updates.ownerId;

	await ref.update(updates);


	const updatedDoc = await ref.get();
	const updatedTask = { id: ref.id, ...updatedDoc.data() };

	res.status(200).json(updatedTask);

});

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
router.delete('/:taskId', authenticate, checkBoardAccess, async (req: Request, res: Response) => {
	const { taskId, id: cardId } = req.params;

	try {
		const docRef = db.collection('tasks').doc(taskId);
		const doc = await docRef.get();

		if (!doc.exists) {
			res.status(404).json({ error: 'Task not found' });
			return;
		}

		const task = doc.data()!;
		if (task.cardId !== cardId) {
			res.status(400).json({ error: 'Card mismatch' });
			return;
		}

		await docRef.delete();

		await db
			.collection('cards')
			.doc(cardId)
			.update({
				tasksCount: admin.firestore.FieldValue.increment(-1),
			});

		res.status(204).send();
	} catch (error) {
		console.error('Error deleting task:', error);
		res.status(500).json({ error: 'Failed to delete task', details: error });
	}
});


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
	'/:taskId/assign',
	authenticate,
	checkBoardAccess,
	async (req: Request, res: Response) => {
		const { taskId } = req.params;
		const { memberId } = req.body;

		const taskRef = db.collection('tasks').doc(taskId);
		const doc = await taskRef.get();
		if (!doc.exists) {
			res.status(404).json({ error: 'Task not found' });
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
	'/:taskId/assign',
	authenticate,
	checkBoardAccess,
	async (req: Request, res: Response) => {
		const { taskId } = req.params;

		const doc = await db.collection('tasks').doc(taskId).get();
		if (!doc.exists) {
			res.status(404).json({ error: 'Task not found' });
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
	'/:taskId/assign/:memberId',
	authenticate,
	checkBoardAccess,
	async (req: Request, res: Response) => {
		const { taskId, memberId } = req.params;

		await db
			.collection('tasks')
			.doc(taskId)
			.update({
				assignedUserIds: admin.firestore.FieldValue.arrayRemove(memberId),
			});

		res.status(204).send();
	}
);

/**
 * @swagger
 * /boards/{boardId}/cards/{id}/tasks/reorder:
 *   put:
 *     summary: Reorder tasks within a card
 *     description: Reorders tasks based on drag-and-drop by updating their cardIndex within the same card.
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
 *         description: Card ID
 *         schema:
 *           type: string
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
 *                 description: ID of the task being moved
 *               targetId:
 *                 type: string
 *                 description: ID of the task to move next to
 *     responses:
 *       200:
 *         description: Tasks reordered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Tasks reordered
 *       400:
 *         description: One or both task IDs not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Server error during reorder
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 details:
 *                   type: string
 */

router.patch('/reorder', authenticate, checkBoardAccess, async (req: Request, res: Response) => {
	const { id: cardId } = req.params;
	const { sourceId, targetId } = req.body;
	try {
		const snapshot = await db
			.collection('tasks')
			.where('cardId', '==', cardId)
			.orderBy('cardIndex')
			.get();

		const tasks = snapshot.docs.map((doc) => ({
			id: doc.id,
			...doc.data(),
		}));

		const sourceIndex = tasks.findIndex((t) => t.id === sourceId);
		const targetIndex = tasks.findIndex((t) => t.id === targetId);

		if (sourceIndex === -1 || targetIndex === -1) {
			res.status(400).json({ error: 'Task not found in this card' });
			return;
		}

		const [moved] = tasks.splice(sourceIndex, 1);
		tasks.splice(targetIndex, 0, moved);

		const batch = db.batch();
		tasks.forEach((task, i) => {
			const ref = db.collection('tasks').doc(task.id);
			batch.update(ref, { cardIndex: i });
		});
		await batch.commit();

		res.status(200).json(tasks);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Failed to reorder tasks', details: error });
	}
});


/**
 * @swagger
 * /boards/{boardId}/cards/{id}/tasks/move:
 *   patch:
 *     summary: Move and reorder a task across cards
 *     description: Updates a task's cardId and cardIndex to reflect movement from one card (group) to another.
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
 *         description: Source card ID (original group)
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sourceId
 *               - targetId
 *               - targetGroup
 *             properties:
 *               sourceId:
 *                 type: string
 *                 description: Task being moved
 *               targetId:
 *                 type: string
 *                 description: Task to position after (or before)
 *               targetGroup:
 *                 type: string
 *                 description: Destination card ID (new group)
 *     responses:
 *       200:
 *         description: Task moved and reordered
 *       400:
 *         description: Task not found
 *       500:
 *         description: Server error
 */
router.patch('/move', authenticate, checkBoardAccess, async (req: Request, res: Response) => {
	const { id: sourceCardId } = req.params;
	const { sourceId, targetId, targetGroup } = req.body;


	if (!sourceId || !targetId || !targetGroup) {
		res.status(400).json({ error: 'Missing required fields' });
		return
	}

	try {
		const sourceSnapshot = await db
			.collection('tasks')
			.where('cardId', '==', sourceCardId)
			.orderBy('cardIndex')
			.get();


		const sourceTasks = sourceSnapshot.docs.map((doc) => ({
			id: doc.id,
			...doc.data(),
		}));


		const sourceIndex = sourceTasks.findIndex((task) => task.id === sourceId);
		if (sourceIndex === -1) {
			res.status(400).json({ error: 'Source task not found in source card' });
			return
		}
		const [movedTask] = sourceTasks.splice(sourceIndex, 1);

		const batch = db.batch();

		sourceTasks.forEach((task, i) => {
			const ref = db.collection('tasks').doc(task.id);
			batch.update(ref, { cardIndex: i });
		});

		if (targetId === '-1') {
			const movedRef = db.collection('tasks').doc(movedTask.id);
			batch.update(movedRef, { cardId: targetGroup, cardIndex: 0 });
		} else {
			const targetSnapshot = await db
				.collection('tasks')
				.where('cardId', '==', targetGroup)
				.orderBy('cardIndex')
				.get();

			const targetTasks = targetSnapshot.docs.map((doc) => ({
				id: doc.id,
				...doc.data(),
			}));

			const targetIndex = targetTasks.findIndex((task) => task.id === targetId);

			if (targetIndex === -1) {
				res.status(400).json({ error: 'Target task not found in target card' });
				return;
			}

			targetTasks.splice(targetIndex, 0, movedTask);

			targetTasks.forEach((task, i) => {
				const ref = db.collection('tasks').doc(task.id);
				const update: any = { cardIndex: i };
				if (task.id === movedTask.id) {
					update.cardId = targetGroup;
				}
				batch.update(ref, update);
			});
		}

		await batch.commit();

		res.status(200).json({ message: 'Task moved and reordered' });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Failed to move task', details: error });
	}
});


export default router;
