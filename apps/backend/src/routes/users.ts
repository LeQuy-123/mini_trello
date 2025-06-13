import { Router, Request, Response } from 'express';
import { db } from '../firebase';
import { authenticate } from '../middleware/authMiddleware';

const userRouter = Router();
userRouter.get('/', authenticate, async (req: Request, res: Response) => {
	const userSnap = await db.collection('users').get();

	const user = userSnap.docs.map((doc) => {
		const { password, ...rest } = doc.data();
		return { id: doc.id, ...rest };
	});

	res.status(200).json(user);
});

export default userRouter;
