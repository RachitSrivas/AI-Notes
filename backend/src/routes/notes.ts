import { Router } from 'express';
import { prisma } from '../db';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.get('/', async (req: AuthRequest, res) => {
  try {
    const notes = await prisma.note.findMany({
      where: { 
        authorId: req.user!.id, 
        isArchived: false 
      },
      orderBy: { updatedAt: 'desc' }, 
    });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});


router.post('/', async (req: AuthRequest, res) => {
  const { title, content, tags } = req.body;
  try {
    const newNote = await prisma.note.create({
      data: {
        title: title || 'Untitled Note',
        content: content || '',
        tags: tags || [],
        authorId: req.user!.id,
      },
    });
    res.status(201).json(newNote);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create note' });
  }
});



router.get('/stats', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const notes = await prisma.note.findMany({
      where: { authorId: userId }
    });

    const totalNotes = notes.length;
    
  
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const recentlyEdited = notes.filter(n => new Date(n.updatedAt) > oneWeekAgo).length;

   
    const tagCounts: Record<string, number> = {};
    notes.forEach(note => {
      note.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    const mostUsedTags = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5) // Top 5 tags
      .map(entry => ({ tag: entry[0], count: entry[1] }));


    const aiUsage = Math.floor(totalNotes * 2.5); 

    res.json({
      totalNotes,
      recentlyEdited,
      mostUsedTags,
      aiUsage,
      weeklyActivity: recentlyEdited > 2 ? 'Highly Active' : recentlyEdited > 0 ? 'Active' : 'Quiet'
    });
  } catch (error) {
    console.error('Stats Error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});


router.patch('/:id', async (req: AuthRequest, res) => {
  const id = req.params.id as string; 
  const { title, content, tags, isArchived, isPublic } = req.body;

  try {

    const note = await prisma.note.findFirst({ 
      where: { id: id, authorId: req.user!.id } 
    });
    
    if (!note) {
      res.status(404).json({ error: 'Note not found or unauthorized' });
      return;
    }

    const updatedNote = await prisma.note.update({
      where: { id: id }, 
      data: { title, content, tags, isArchived, isPublic },
    });
    res.json(updatedNote);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update note' });
  }
});


import { Mistral } from '@mistralai/mistralai'; 


router.post('/:id/generate-summary', async (req: AuthRequest, res) => {
  const id = req.params.id as string;

  try {
    const note = await prisma.note.findFirst({
      where: { id, authorId: req.user!.id },
    });

    if (!note) {
      res.status(404).json({ error: 'Note not found' });
      return;
    }

    if (!note.content || note.content.trim() === '') {
      res.status(400).json({ error: 'Note is empty. Add some text first!' });
      return;
    }

    const apiKey = process.env.MISTRAL_API_KEY;
    if (!apiKey) {
      res.status(500).json({ error: 'Mistral API key is not configured' });
      return;
    }
    const client = new Mistral({ apiKey: apiKey });

    const prompt = `
      Analyze the following note content.
      Provide a concise summary, a list of action items, and a better suggested title.
      Respond ONLY with a valid JSON object matching this exact structure:
      {
        "summary": "String summarizing the note",
        "action_items": ["Array of action item strings"],
        "suggested_title": "A short, catchy title string"
      }
      
      Note Content:
      "${note.content}"
    `;

    const chatResponse = await client.chat.complete({
      model: 'mistral-small-latest',
      messages: [{ role: 'user', content: prompt }],
      responseFormat: { type: 'json_object' } 
    });

   const aiResultString = chatResponse.choices?.[0]?.message?.content;
    
    if (!aiResultString || typeof aiResultString !== 'string') {
      throw new Error("Mistral returned an empty or invalid response");
    }

    const aiData = JSON.parse(aiResultString);
    res.json(aiData);

  } catch (error) {
    console.error('AI Generation Error:', error);
    res.status(500).json({ error: 'Failed to generate AI summary' });
  }
});




export default router;