const bookmarkService = require('../services/bookmark.service');
const { success } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

// ─────────────────────────────────────────
// GET ALL BOOKMARKS
// GET /api/v1/bookmarks
// ─────────────────────────────────────────
const getBookmarks = asyncHandler(async (req, res) => {
  // req.user.id comes from authenticate middleware
  const bookmarks = await bookmarkService.getBookmarks(req.user.id);
  return success(res, { bookmarks }, 'Bookmarks fetched successfully!');
});

// ─────────────────────────────────────────
// ADD BOOKMARK
// POST /api/v1/bookmarks
// ─────────────────────────────────────────
const addBookmark = asyncHandler(async (req, res) => {
  const { content_block_id, note } = req.body;
  const bookmark = await bookmarkService.addBookmark(
    req.user.id,
    content_block_id,
    note
  );
  return success(res, { bookmark }, 'Bookmarked successfully!', 201);
});

// ─────────────────────────────────────────
// REMOVE BOOKMARK
// DELETE /api/v1/bookmarks/:id
// ─────────────────────────────────────────
const removeBookmark = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await bookmarkService.removeBookmark(req.user.id, id);
  return success(res, result, 'Bookmark removed successfully!');
});

module.exports = { getBookmarks, addBookmark, removeBookmark };