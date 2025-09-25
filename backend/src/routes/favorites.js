const express = require('express');
const favoriteRouter = express.Router();
const userMiddleware = require('../middleware/userMiddleware.js');
const {
    getUserLists,
    createList,
    addProblemToList,
    removeProblemFromList,
    updateList,
    deleteList,
    getListById,
    checkProblemInLists
} = require('../controllers/favoriteController.js');

favoriteRouter.get('/lists', userMiddleware, getUserLists);
favoriteRouter.post('/lists', userMiddleware, createList);
favoriteRouter.get('/lists/:listId', userMiddleware, getListById);
favoriteRouter.put('/lists/:listId', userMiddleware, updateList);
favoriteRouter.delete('/lists/:listId', userMiddleware, deleteList);
favoriteRouter.post('/add-problem', userMiddleware, addProblemToList);
favoriteRouter.delete('/lists/:listId/problems/:problemId', userMiddleware, removeProblemFromList);
favoriteRouter.get('/problem/:problemId/lists', userMiddleware, checkProblemInLists);

module.exports = favoriteRouter;