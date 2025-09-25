const express = require('express');
const notesRouter = express.Router();
const userMiddleware = require('../middleware/userMiddleware.js');
const {
    getNoteByProblem,
    saveNote,
    deleteNote,
    getAllUserNotes
} = require('../controllers/notesController.js');

notesRouter.get('/problem/:problemId', userMiddleware, getNoteByProblem);
notesRouter.post('/problem/:problemId', userMiddleware, saveNote);
notesRouter.delete('/problem/:problemId', userMiddleware, deleteNote);
notesRouter.get('/user/all', userMiddleware, getAllUserNotes);

module.exports = notesRouter;