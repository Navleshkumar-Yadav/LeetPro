const FavoriteList = require('../models/favoriteList.js');
const Problem = require('../models/problem.js');

const getUserLists = async (req, res) => {
    try {
        const userId = req.result._id;
        
        const lists = await FavoriteList.find({ userId })
            .populate({
                path: 'problems.problemId',
                select: 'title difficulty tags isPremium'
            })
            .sort({ isDefault: -1, createdAt: 1 });

        // If no default list exists, create one
        if (!lists.some(list => list.isDefault)) {
            const defaultList = await FavoriteList.create({
                userId,
                name: 'Favorite',
                description: 'My favorite problems',
                isDefault: true
            });
            lists.unshift(defaultList);
        }

        res.status(200).json({
            lists: lists.map(list => ({
                id: list._id,
                name: list.name,
                description: list.description,
                isDefault: list.isDefault,
                isPublic: list.isPublic,
                problemCount: list.problems.length,
                problems: list.problems.map(p => ({
                    id: p.problemId._id,
                    title: p.problemId.title,
                    difficulty: p.problemId.difficulty,
                    tags: p.problemId.tags,
                    isPremium: p.problemId.isPremium,
                    addedAt: p.addedAt
                })),
                createdAt: list.createdAt,
                updatedAt: list.updatedAt
            }))
        });

    } catch (error) {
        console.error('Error fetching user lists:', error);
        res.status(500).json({ error: 'Failed to fetch favorite lists' });
    }
};

const createList = async (req, res) => {
    try {
        const userId = req.result._id;
        const { name, description, isPublic } = req.body;

        if (!name || name.trim().length === 0) {
            return res.status(400).json({ error: 'List name is required' });
        }

        // Check if list with same name already exists
        const existingList = await FavoriteList.findOne({ userId, name: name.trim() });
        if (existingList) {
            return res.status(400).json({ error: 'A list with this name already exists' });
        }

        const newList = await FavoriteList.create({
            userId,
            name: name.trim(),
            description: description || '',
            isPublic: isPublic || false
        });

        res.status(201).json({
            message: 'List created successfully',
            list: {
                id: newList._id,
                name: newList.name,
                description: newList.description,
                isDefault: newList.isDefault,
                isPublic: newList.isPublic,
                problemCount: 0,
                problems: [],
                createdAt: newList.createdAt,
                updatedAt: newList.updatedAt
            }
        });

    } catch (error) {
        console.error('Error creating list:', error);
        res.status(500).json({ error: 'Failed to create list' });
    }
};

const addProblemToList = async (req, res) => {
    try {
        const userId = req.result._id;
        const { listId, problemId } = req.body;

        // Verify problem exists
        const problem = await Problem.findById(problemId);
        if (!problem) {
            return res.status(404).json({ error: 'Problem not found' });
        }

        // Find the list
        const list = await FavoriteList.findOne({ _id: listId, userId });
        if (!list) {
            return res.status(404).json({ error: 'List not found' });
        }

        // Check if problem is already in the list
        const existingProblem = list.problems.find(p => p.problemId.toString() === problemId);
        if (existingProblem) {
            return res.status(400).json({ error: 'Problem already exists in this list' });
        }

        // Add problem to list
        list.problems.push({
            problemId,
            addedAt: new Date()
        });

        await list.save();

        res.status(200).json({
            message: 'Problem added to list successfully',
            listId: list._id,
            problemId
        });

    } catch (error) {
        console.error('Error adding problem to list:', error);
        res.status(500).json({ error: 'Failed to add problem to list' });
    }
};

const removeProblemFromList = async (req, res) => {
    try {
        const userId = req.result._id;
        const { listId, problemId } = req.params;

        const list = await FavoriteList.findOne({ _id: listId, userId });
        if (!list) {
            return res.status(404).json({ error: 'List not found' });
        }

        // Remove problem from list
        list.problems = list.problems.filter(p => p.problemId.toString() !== problemId);
        await list.save();

        res.status(200).json({
            message: 'Problem removed from list successfully'
        });

    } catch (error) {
        console.error('Error removing problem from list:', error);
        res.status(500).json({ error: 'Failed to remove problem from list' });
    }
};

const updateList = async (req, res) => {
    try {
        const userId = req.result._id;
        const { listId } = req.params;
        const { name, description, isPublic } = req.body;

        const list = await FavoriteList.findOne({ _id: listId, userId });
        if (!list) {
            return res.status(404).json({ error: 'List not found' });
        }

        // Don't allow renaming default list
        if (list.isDefault && name && name !== list.name) {
            return res.status(400).json({ error: 'Cannot rename the default list' });
        }

        // Check for duplicate names
        if (name && name !== list.name) {
            const existingList = await FavoriteList.findOne({ userId, name: name.trim() });
            if (existingList) {
                return res.status(400).json({ error: 'A list with this name already exists' });
            }
        }

        // Update list
        if (name) list.name = name.trim();
        if (description !== undefined) list.description = description;
        if (isPublic !== undefined) list.isPublic = isPublic;

        await list.save();

        res.status(200).json({
            message: 'List updated successfully',
            list: {
                id: list._id,
                name: list.name,
                description: list.description,
                isDefault: list.isDefault,
                isPublic: list.isPublic,
                problemCount: list.problems.length
            }
        });

    } catch (error) {
        console.error('Error updating list:', error);
        res.status(500).json({ error: 'Failed to update list' });
    }
};

const deleteList = async (req, res) => {
    try {
        const userId = req.result._id;
        const { listId } = req.params;

        const list = await FavoriteList.findOne({ _id: listId, userId });
        if (!list) {
            return res.status(404).json({ error: 'List not found' });
        }

        // Don't allow deleting default list
        if (list.isDefault) {
            return res.status(400).json({ error: 'Cannot delete the default list' });
        }

        await FavoriteList.findByIdAndDelete(listId);

        res.status(200).json({
            message: 'List deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting list:', error);
        res.status(500).json({ error: 'Failed to delete list' });
    }
};

const getListById = async (req, res) => {
    try {
        const userId = req.result._id;
        const { listId } = req.params;

        const list = await FavoriteList.findOne({ _id: listId, userId })
            .populate({
                path: 'problems.problemId',
                select: 'title difficulty tags isPremium'
            });

        if (!list) {
            return res.status(404).json({ error: 'List not found' });
        }

        res.status(200).json({
            list: {
                id: list._id,
                name: list.name,
                description: list.description,
                isDefault: list.isDefault,
                isPublic: list.isPublic,
                problemCount: list.problems.length,
                problems: list.problems.map(p => ({
                    id: p.problemId._id,
                    title: p.problemId.title,
                    difficulty: p.problemId.difficulty,
                    tags: p.problemId.tags,
                    isPremium: p.problemId.isPremium,
                    addedAt: p.addedAt
                })),
                createdAt: list.createdAt,
                updatedAt: list.updatedAt
            }
        });

    } catch (error) {
        console.error('Error fetching list:', error);
        res.status(500).json({ error: 'Failed to fetch list' });
    }
};

const checkProblemInLists = async (req, res) => {
    try {
        const userId = req.result._id;
        const { problemId } = req.params;

        const lists = await FavoriteList.find({ 
            userId,
            'problems.problemId': problemId 
        }).select('_id name');

        res.status(200).json({
            lists: lists.map(list => ({
                id: list._id,
                name: list.name
            }))
        });

    } catch (error) {
        console.error('Error checking problem in lists:', error);
        res.status(500).json({ error: 'Failed to check problem in lists' });
    }
};

module.exports = {
    getUserLists,
    createList,
    addProblemToList,
    removeProblemFromList,
    updateList,
    deleteList,
    getListById,
    checkProblemInLists
};