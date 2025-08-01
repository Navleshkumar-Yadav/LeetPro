const ProblemNote = require('../models/problemNote.js');
const Problem = require('../models/problem.js');

const getNoteByProblem = async (req, res) => {
    try {
        const userId = req.result._id;
        const { problemId } = req.params;

        const note = await ProblemNote.findOne({ userId, problemId });
        
        if (!note) {
            return res.status(200).json({
                note: null,
                message: 'No notes found for this problem'
            });
        }

        res.status(200).json({
            note: {
                id: note._id,
                title: note.title,
                content: note.content,
                isPublic: note.isPublic,
                tags: note.tags,
                createdAt: note.createdAt,
                updatedAt: note.updatedAt
            }
        });

    } catch (error) {
        console.error('Error fetching note:', error);
        res.status(500).json({ error: 'Failed to fetch note' });
    }
};

const saveNote = async (req, res) => {
    try {
        const userId = req.result._id;
        const { problemId } = req.params;
        const { title, content, isPublic, tags } = req.body;

        // Validate that the problem exists
        const problem = await Problem.findById(problemId);
        if (!problem) {
            return res.status(404).json({ error: 'Problem not found' });
        }

        // Validate content
        if (!content || content.trim().length === 0) {
            return res.status(400).json({ error: 'Note content cannot be empty' });
        }

        const noteData = {
            userId,
            problemId,
            title: title || 'My Notes',
            content: content.trim(),
            isPublic: isPublic || false,
            tags: tags || []
        };

        const note = await ProblemNote.findOneAndUpdate(
            { userId, problemId },
            noteData,
            { 
                new: true, 
                upsert: true,
                runValidators: true
            }
        );

        res.status(200).json({
            message: 'Note saved successfully',
            note: {
                id: note._id,
                title: note.title,
                content: note.content,
                isPublic: note.isPublic,
                tags: note.tags,
                createdAt: note.createdAt,
                updatedAt: note.updatedAt
            }
        });

    } catch (error) {
        console.error('Error saving note:', error);
        res.status(500).json({ error: 'Failed to save note' });
    }
};

const deleteNote = async (req, res) => {
    try {
        const userId = req.result._id;
        const { problemId } = req.params;

        const deletedNote = await ProblemNote.findOneAndDelete({ userId, problemId });
        
        if (!deletedNote) {
            return res.status(404).json({ error: 'Note not found' });
        }

        res.status(200).json({
            message: 'Note deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting note:', error);
        res.status(500).json({ error: 'Failed to delete note' });
    }
};

const getAllUserNotes = async (req, res) => {
    try {
        const userId = req.result._id;
        const { page = 1, limit = 10, search = '' } = req.query;

        const query = { userId };
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { content: { $regex: search, $options: 'i' } },
                { tags: { $in: [new RegExp(search, 'i')] } }
            ];
        }

        const notes = await ProblemNote.find(query)
            .populate('problemId', 'title difficulty tags')
            .sort({ updatedAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await ProblemNote.countDocuments(query);

        res.status(200).json({
            notes: notes.map(note => ({
                id: note._id,
                title: note.title,
                content: note.content.substring(0, 200) + (note.content.length > 200 ? '...' : ''),
                isPublic: note.isPublic,
                tags: note.tags,
                problem: note.problemId,
                createdAt: note.createdAt,
                updatedAt: note.updatedAt
            })),
            pagination: {
                current: page,
                pages: Math.ceil(total / limit),
                total
            }
        });

    } catch (error) {
        console.error('Error fetching user notes:', error);
        res.status(500).json({ error: 'Failed to fetch notes' });
    }
};

module.exports = {
    getNoteByProblem,
    saveNote,
    deleteNote,
    getAllUserNotes
};