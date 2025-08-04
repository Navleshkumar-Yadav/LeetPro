const DailyTask = require('../models/dailyTask.js');

const getTasks = async (req, res) => {
    try {
        const userId = req.result._id;
        const { date, completed } = req.query;
        
        let query = { userId };
        
        if (date) {
            const startDate = new Date(date);
            const endDate = new Date(date);
            endDate.setDate(endDate.getDate() + 1);
            
            query.dueDate = {
                $gte: startDate,
                $lt: endDate
            };
        }
        
        if (completed !== undefined) {
            query.isCompleted = completed === 'true';
        }
        
        const tasks = await DailyTask.find(query)
            .sort({ dueDate: 1, createdAt: -1 });
        
        res.status(200).json({
            tasks: tasks.map(task => ({
                id: task._id,
                title: task.title,
                dueDate: task.dueDate,
                isCompleted: task.isCompleted,
                completedAt: task.completedAt,
                priority: task.priority,
                createdAt: task.createdAt
            }))
        });
        
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
};

const createTask = async (req, res) => {
    try {
        const userId = req.result._id;
        const { title, dueDate, priority } = req.body;
        
        if (!title || !title.trim()) {
            return res.status(400).json({ error: 'Task title is required' });
        }
        
        if (!dueDate) {
            return res.status(400).json({ error: 'Due date is required' });
        }
        
        const task = await DailyTask.create({
            userId,
            title: title.trim(),
            dueDate: new Date(dueDate),
            priority: priority || 'medium'
        });
        
        res.status(201).json({
            message: 'Task created successfully',
            task: {
                id: task._id,
                title: task.title,
                dueDate: task.dueDate,
                isCompleted: task.isCompleted,
                completedAt: task.completedAt,
                priority: task.priority,
                createdAt: task.createdAt
            }
        });
        
    } catch (error) {
        console.error('Error creating task:', error);
        res.status(500).json({ error: 'Failed to create task' });
    }
};

const updateTask = async (req, res) => {
    try {
        const userId = req.result._id;
        const { taskId } = req.params;
        const { title, dueDate, isCompleted, priority } = req.body;
        
        const task = await DailyTask.findOne({ _id: taskId, userId });
        
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }
        
        const updateData = {};
        
        if (title !== undefined) updateData.title = title.trim();
        if (dueDate !== undefined) updateData.dueDate = new Date(dueDate);
        if (priority !== undefined) updateData.priority = priority;
        
        if (isCompleted !== undefined) {
            updateData.isCompleted = isCompleted;
            updateData.completedAt = isCompleted ? new Date() : null;
        }
        
        const updatedTask = await DailyTask.findByIdAndUpdate(
            taskId,
            updateData,
            { new: true, runValidators: true }
        );
        
        res.status(200).json({
            message: 'Task updated successfully',
            task: {
                id: updatedTask._id,
                title: updatedTask.title,
                dueDate: updatedTask.dueDate,
                isCompleted: updatedTask.isCompleted,
                completedAt: updatedTask.completedAt,
                priority: updatedTask.priority,
                createdAt: updatedTask.createdAt
            }
        });
        
    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({ error: 'Failed to update task' });
    }
};

const deleteTask = async (req, res) => {
    try {
        const userId = req.result._id;
        const { taskId } = req.params;
        
        const task = await DailyTask.findOneAndDelete({ _id: taskId, userId });
        
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }
        
        res.status(200).json({
            message: 'Task deleted successfully'
        });
        
    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({ error: 'Failed to delete task' });
    }
};

const getTaskStats = async (req, res) => {
    try {
        const userId = req.result._id;
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const [totalTasks, completedTasks, todayTasks, overdueTasks] = await Promise.all([
            DailyTask.countDocuments({ userId }),
            DailyTask.countDocuments({ userId, isCompleted: true }),
            DailyTask.countDocuments({ 
                userId, 
                dueDate: { $gte: today, $lt: tomorrow } 
            }),
            DailyTask.countDocuments({ 
                userId, 
                isCompleted: false,
                dueDate: { $lt: today } 
            })
        ]);
        
        res.status(200).json({
            stats: {
                total: totalTasks,
                completed: completedTasks,
                today: todayTasks,
                overdue: overdueTasks,
                completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
            }
        });
        
    } catch (error) {
        console.error('Error fetching task stats:', error);
        res.status(500).json({ error: 'Failed to fetch task statistics' });
    }
};

module.exports = {
    getTasks,
    createTask,
    updateTask,
    deleteTask,
    getTaskStats
};