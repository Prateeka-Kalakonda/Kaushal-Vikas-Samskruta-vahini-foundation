const translationService = require('../services/translation.service');
const { success } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

// ─────────────────────────────────────────
// GET TRANSLATIONS FOR AN ENTITY
// GET /api/v1/translations/:entityType/:entityId/:language
// ─────────────────────────────────────────
const getTranslations = asyncHandler(async (req, res) => {
  const { entityType, entityId, language } = req.params;
  const data = await translationService.getTranslations(
    entityType,
    entityId,
    language
  );
  return success(res, data, 'Translations fetched successfully!');
});

// ─────────────────────────────────────────
// GET FULL TRANSLATED CHAPTER
// GET /api/v1/translations/chapter/:chapterId/:language
// ─────────────────────────────────────────
const getTranslatedChapter = asyncHandler(async (req, res) => {
  const { chapterId, language } = req.params;
  const data = await translationService.getTranslatedChapter(
    chapterId,
    language
  );
  return success(res, data, `Chapter fetched in ${language} successfully!`);
});

// ─────────────────────────────────────────
// ADD TRANSLATION (admin only)
// POST /api/v1/translations
// ─────────────────────────────────────────
const addTranslation = asyncHandler(async (req, res) => {
  const {
    entity_type,
    entity_id,
    language,
    field_name,
    translated_text,
  } = req.body;

  const translation = await translationService.addTranslation({
    entity_type,
    entity_id,
    language,
    field_name,
    translated_text,
  });

  return success(
    res,
    { translation },
    'Translation added successfully!',
    201
  );
});

// ─────────────────────────────────────────
// GET AVAILABLE LANGUAGES FOR AN ENTITY
// GET /api/v1/translations/:entityType/:entityId/languages
// ─────────────────────────────────────────
const getAvailableLanguages = asyncHandler(async (req, res) => {
  const { entityType, entityId } = req.params;
  const data = await translationService.getAvailableLanguages(
    entityType,
    entityId
  );
  return success(res, data, 'Available languages fetched successfully!');
});

module.exports = {
  getTranslations,
  getTranslatedChapter,
  addTranslation,
  getAvailableLanguages,
};