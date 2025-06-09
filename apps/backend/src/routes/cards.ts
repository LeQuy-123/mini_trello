import { Router, Request, Response } from "express";
import { Timestamp } from "firebase-admin/firestore";
import { authenticate } from "../middleware/authMiddleware";
import { checkBoardAccess } from "../middleware/checkBoardAccess";
import { db } from "../firebase";

const router = Router();
 
// 1. Get all cards in a board
router.get(
  "/:boardId/cards",
  authenticate,
  checkBoardAccess,
  async (req: Request, res: Response) => {
    const { boardId } = req.params;

    try {
      const snapshot = await db
        .collection("cards")
        .where("boardId", "==", boardId)
        .get();

      const cards = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          description: data.description,
        };
      });

      res.status(200).json(cards);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch cards", details: error });
    }
  }
);

// 2. Create a new card in a board
router.post(
  "/:boardId/cards",
  authenticate,
  checkBoardAccess,
  async (req: Request, res: Response) => {
    const { boardId } = req.params;
    const { name, description } = req.body;

    if (!name || !description) {
      res
        .status(400)
        .json({ error: "Missing required fields: name or description" });
      return
    }

    try {
      const docRef = await db.collection("cards").add({
        name,
        description,
        boardId,
        userId: req.uid,
        createdAt: Timestamp.now(),
        list_member: [],
        tasks_count: 0,
      });

      res.status(201).json({ id: docRef.id, name, description });
    } catch (error) {
      res.status(500).json({ error: "Failed to create card", details: error });
    }
  }
);

// 3. Get specific card details
router.get(
  "/:boardId/cards/:id",
  authenticate,
  checkBoardAccess,
  async (req: Request, res: Response) => {
    const { boardId, id } = req.params;

    try {
      const cardDoc = await db.collection("cards").doc(id).get();

      if (!cardDoc.exists) {
        res.status(404).json({ error: "Card not found" });
        return 
      }

      const card = cardDoc.data()!;
      if (card.boardId !== boardId) {
        res.status(400).json({ error: "Card does not belong to this board" });
        return 
      }

      res.status(200).json({
        id: cardDoc.id,
        name: card.name,
        description: card.description,
      });
    } catch (error) {
      res
        .status(500)
        .json({ error: "Failed to fetch card details", details: error });
    }
  }
);

// 4. Get cards by user in a board
router.get(
  "/:boardId/cards/user/:user_id",
  authenticate,
  checkBoardAccess,
  async (req: Request, res: Response) => {
    const { boardId, user_id } = req.params;

    try {
      const snapshot = await db
        .collection("cards")
        .where("boardId", "==", boardId)
        .where("userId", "==", user_id)
        .get();

      const cards = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          description: data.description,
          tasks_count: data.tasks_count || 0,
          list_member: data.list_member || [],
          createdAt: (() => {
            if ("toMillis" in data.createdAt) return data.createdAt.toMillis();
            if (data.createdAt instanceof Date) return data.createdAt.getTime();
            return 0;
          })(),
        };
      });

      res.status(200).json(cards);
    } catch (error) {
      res
        .status(500)
        .json({ error: "Failed to fetch cards by user", details: error });
    }
  }
);

// 5. Update card details
router.put(
  "/:boardId/cards/:id",
  authenticate,
  checkBoardAccess,
  async (req: Request, res: Response) => {
    const { boardId, id } = req.params;
    const updateData = req.body;

    try {
      const cardRef = db.collection("cards").doc(id);
      const cardDoc = await cardRef.get();

      if (!cardDoc.exists) {
        res.status(404).json({ error: "Card not found" });
        return 
      }

      const card = cardDoc.data()!;
      if (card.boardId !== boardId) {
        res.status(400).json({ error: "Card does not belong to this board" });
        return 
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
      res.status(500).json({ error: "Failed to update card", details: error });
    }
  }
);

// 6. Delete a card
router.delete(
  "/:boardId/cards/:id",
  authenticate,
  checkBoardAccess,
  async (req: Request, res: Response) => {
    const { boardId, id } = req.params;

    try {
      const cardRef = db.collection("cards").doc(id);
      const cardDoc = await cardRef.get();

      if (!cardDoc.exists) {
        res.status(404).json({ error: "Card not found" });
        return 
      }

      const card = cardDoc.data()!;
      if (card.boardId !== boardId) {
        res.status(400).json({ error: "Card does not belong to this board" });
        return 
      }

      await cardRef.delete();
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete card", details: error });
    }
  }
);

export default router;
