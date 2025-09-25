const express = require('express');
const dailyTaskRouter = express.Router();
const userMiddleware = require('../middleware/userMiddleware.js');
const {
    getTasks,
    createTask,
    updateTask,
    deleteTask,
    getTaskStats
} = require('../controllers/dailyTaskController.js');

// Get all tasks for user
dailyTaskRouter.get('/', userMiddleware, getTasks);

// Create new task
dailyTaskRouter.post('/', userMiddleware, createTask);

// Update task
dailyTaskRouter.put('/:taskId', userMiddleware, updateTask);

// Delete task
dailyTaskRouter.delete('/:taskId', userMiddleware, deleteTask);

// Get task statistics
dailyTaskRouter.get('/stats', userMiddleware, getTaskStats);

module.exports = dailyTaskRouter;