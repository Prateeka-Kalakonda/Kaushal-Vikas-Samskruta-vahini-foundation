const noteService = require('../services/note.service');
const { success } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

// ─────────────────────────────────────────
// GET ALL NOTES
// GET /api/v1/notes
// ─────────────────────────────────────────
const getNotes = asyncHandler(async (req, res) => {
  const notes = await noteService.getNotes(req.user.id);
  return success(res, { notes }, 'Notes fetched successfully!');
});

// ─────────────────────────────────────────
// ADD NOTE
// POST /api/v1/notes
// ─────────────────────────────────────────
const addNote = asyncHandler(async (req, res) => {
  const { content_block_id, highlighted_text, note_text, color } = req.body;
  const note = await noteService.addNote(req.user.id, {
    content_block_id,
    highlighted_text,
    note_text,
    color,
  });
  return success(res, { note }, 'Note added successfully!', 201);
});

// ─────────────────────────────────────────
// UPDATE NOTE
// PUT /api/v1/notes/:id
// ─────────────────────────────────────────
const updateNote = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { note_text, color } = req.body;
  const note = await noteService.updateNote(req.user.id, id, {
    note_text,
    color,
  });
  return success(res, { note }, 'Note updated successfully!');
});

// ─────────────────────────────────────────
// DELETE NOTE
// DELETE /api/v1/notes/:id
// ─────────────────────────────────────────
const deleteNote = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await noteService.deleteNote(req.user.id, id);
  return success(res, result, 'Note deleted successfully!');
});

module.exports = { getNotes, addNote, updateNote, deleteNote };