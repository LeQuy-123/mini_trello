import { Request, Response, NextFunction } from "express";
import { db } from "../firebase";
import { Board } from "../types/Board";

export async function checkBoardAccess(req: Request, res: Response, next: Function) {
  const userId = req.uid;
  const { boardId } = req.params;

  try {
    if(!userId) {
      res.status(404).json({ error: "User id not found" });
      return;
    }
    const boardDoc = await db.collection("boards").doc(boardId).get();
    if (!boardDoc.exists) {
      res.status(404).json({ error: "Board not found" });
      return
    }
    const board = boardDoc.data()! as Board;
    // Check user owns board or is a members 
    if (
      board.userId !== userId &&
      !(board.members || []).includes(userId)
    ) {
      res.status(403).json({ error: "Access denied to this board" });
      return 
    }
    next();
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to verify board access", details: error });
  }
}
