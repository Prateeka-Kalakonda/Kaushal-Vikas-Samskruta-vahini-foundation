const express = require('express');
const router = express.Router();

const bookmarkController = require('../controllers/bookmark.controller');
const { authenticate } = require('../middleware/auth.middleware');

// All bookmark routes are protected
// Student must be logged in to bookmark anything

// GET /api/v1/bookmarks
// Get all bookmarks for logged in student
router.get('/', authenticate, bookmarkController.getBookmarks);

// POST /api/v1/bookmarks
// Add a new bookmark
router.post('/', authenticate, bookmarkController.addBookmark);

// DELETE /api/v1/bookmarks/:id
// Remove a bookmark
router.delete('/:id', authenticate, bookmarkController.removeBookmark);

module.exports = router;