import { Router } from 'express';
import { prisma } from '../db';

const router = Router();

router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const note = await prisma.note.findUnique({
      where: { id }
    });

    if (!note || !note.isPublic) {
      res.status(404).json({ error: 'Note not found or is not public' });
      return;
    }

    res.json({
      title: note.title,
      content: note.content,
      tags: note.tags,
      updatedAt: note.updatedAt
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch shared note' });
  }
});

export default router;