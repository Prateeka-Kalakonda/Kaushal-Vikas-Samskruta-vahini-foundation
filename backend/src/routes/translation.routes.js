const express = require('express');
const router = express.Router();

const translationController = require('../controllers/translation.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');

// ─────────────────────────────────────────
// PUBLIC ROUTES
// Anyone can read translations
// ─────────────────────────────────────────

// GET /api/v1/translations/chapter/:chapterId/:language
// Get full chapter in Hindi or Telugu
// Example: /translations/chapter/c8dd793c.../hi
router.get(
  '/chapter/:chapterId/:language',
  translationController.getTranslatedChapter
);

// GET /api/v1/translations/:entityType/:entityId/:language
// Get translations for any entity
// Example: /translations/content_block/7ddaedbb.../hi
router.get(
  '/:entityType/:entityId/:language',
  translationController.getTranslations
);

// GET /api/v1/translations/:entityType/:entityId/languages
// Get all available languages for an entity
router.get(
  '/:entityType/:entityId/languages',
  translationController.getAvailableLanguages
);

// ─────────────────────────────────────────
// ADMIN ONLY ROUTES
// Only admin can add translations
// ─────────────────────────────────────────

// POST /api/v1/translations
// Add a new translation
router.post(
  '/',
  authenticate,
  requireRole('admin'),
  translationController.addTranslation
);

module.exports = router;