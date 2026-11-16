const express = require('express');
const router = express.Router();

const noteController = require('../controllers/note.controller');
const { authenticate } = require('../middleware/auth.middleware');

// All note routes are protected
// Student must be logged in to add notes

// GET /api/v1/notes
// Get all notes for logged in student
router.get('/', authenticate, noteController.getNotes);

// POST /api/v1/notes
// Add a new note or highlight
router.post('/', authenticate, noteController.addNote);

// PUT /api/v1/notes/:id
// Update an existing note
router.put('/:id', authenticate, noteController.updateNote);

// DELETE /api/v1/notes/:id
// Delete a note
router.delete('/:id', authenticate, noteController.deleteNote);

module.exports = router;