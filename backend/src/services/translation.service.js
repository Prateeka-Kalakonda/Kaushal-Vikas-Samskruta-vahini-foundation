const db = require('../config/database');
const { AppError } = require('../utils/apiResponse');

// Supported languages
const SUPPORTED_LANGUAGES = ['en', 'hi', 'te'];

// ─────────────────────────────────────────
// GET TRANSLATIONS FOR AN ENTITY
// Example: get Hindi translation of a content block
// ─────────────────────────────────────────
const getTranslations = async (entityType, entityId, language) => {
  // Validate language
  if (!SUPPORTED_LANGUAGES.includes(language)) {
    throw new AppError(
      `Language not supported. Use: ${SUPPORTED_LANGUAGES.join(', ')}`,
      400
    );
  }

  const result = await db.query(
    `SELECT id, entity_type, entity_id, language, field_name, translated_text
     FROM translations
     WHERE entity_type = $1
       AND entity_id = $2
       AND language = $3
     ORDER BY field_name`,
    [entityType, entityId, language]
  );

  // Convert array of rows into a clean object
  // Example: { title: "विद्युत आवेश", content: "विद्युत आवेश पदार्थ..." }
  const translationMap = {};
  result.rows.forEach((row) => {
    translationMap[row.field_name] = row.translated_text;
  });

  return {
    entity_type: entityType,
    entity_id: entityId,
    language,
    translations: translationMap,
  };
};

// ─────────────────────────────────────────
// GET TRANSLATED CHAPTER WITH CONTENT
// Returns full chapter in requested language
// Falls back to English if translation missing
// ─────────────────────────────────────────
const getTranslatedChapter = async (chapterId, language) => {
  if (!SUPPORTED_LANGUAGES.includes(language)) {
    throw new AppError(
      `Language not supported. Use: ${SUPPORTED_LANGUAGES.join(', ')}`,
      400
    );
  }

  // Get original chapter content blocks
  const contentResult = await db.query(
    `SELECT id, block_type, title, content, order_index
     FROM content_blocks
     WHERE chapter_id = $1
     ORDER BY order_index`,
    [chapterId]
  );

  if (contentResult.rows.length === 0) {
    throw new AppError('Chapter not found.', 404);
  }

  // Get all translations for these content blocks
  const blockIds = contentResult.rows.map((b) => b.id);

  const translationsResult = await db.query(
    `SELECT entity_id, field_name, translated_text
     FROM translations
     WHERE entity_type = 'content_block'
       AND entity_id = ANY($1)
       AND language = $2`,
    [blockIds, language]
  );

  // Map translations by entity_id
  const translationMap = {};
  translationsResult.rows.forEach((row) => {
    if (!translationMap[row.entity_id]) {
      translationMap[row.entity_id] = {};
    }
    translationMap[row.entity_id][row.field_name] = row.translated_text;
  });

  // Merge translations with original content
  // If translation exists use it, otherwise fall back to English
  const translatedBlocks = contentResult.rows.map((block) => {
    const blockTranslations = translationMap[block.id] || {};
    return {
      ...block,
      title: blockTranslations.title || block.title,
      content: blockTranslations.content
        ? JSON.parse(blockTranslations.content)
        : block.content,
      is_translated: Object.keys(blockTranslations).length > 0,
      language: Object.keys(blockTranslations).length > 0 ? language : 'en',
    };
  });

  return {
    chapter_id: chapterId,
    language,
    content_blocks: translatedBlocks,
  };
};

// ─────────────────────────────────────────
// ADD TRANSLATION (admin only)
// ─────────────────────────────────────────
const addTranslation = async ({
  entity_type,
  entity_id,
  language,
  field_name,
  translated_text,
}) => {
  if (!SUPPORTED_LANGUAGES.includes(language)) {
    throw new AppError(
      `Language not supported. Use: ${SUPPORTED_LANGUAGES.join(', ')}`,
      400
    );
  }

  // Insert or update if already exists
  const result = await db.query(
    `INSERT INTO translations
      (entity_type, entity_id, language, field_name, translated_text)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (entity_type, entity_id, language, field_name)
     DO UPDATE SET translated_text = EXCLUDED.translated_text
     RETURNING id, entity_type, entity_id, language, field_name, translated_text`,
    [entity_type, entity_id, language, field_name, translated_text]
  );

  return result.rows[0];
};

// ─────────────────────────────────────────
// GET ALL AVAILABLE LANGUAGES FOR AN ENTITY
// ─────────────────────────────────────────
const getAvailableLanguages = async (entityType, entityId) => {
  const result = await db.query(
    `SELECT DISTINCT language
     FROM translations
     WHERE entity_type = $1 AND entity_id = $2`,
    [entityType, entityId]
  );

  const available = result.rows.map((r) => r.language);

  // English is always available (it's the default)
  if (!available.includes('en')) {
    available.unshift('en');
  }

  return {
    entity_type: entityType,
    entity_id: entityId,
    available_languages: available,
    all_supported: SUPPORTED_LANGUAGES,
  };
};

module.exports = {
  getTranslations,
  getTranslatedChapter,
  addTranslation,
  getAvailableLanguages,
};