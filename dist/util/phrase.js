import { ValidationError } from '../common/errors.js';
/**
 * Parses a phrase in format: <name>.<text>#tag#tag
 * Example: "Рецепты. Описание приготовления блюд. #Еда"
 * Result: {name: "Рецепты", text: "Описание приготовления блюд.", tags: ["Еда"]}
 */
export function parsePhrase(phrase) {
    if (!phrase || phrase.trim() === '') {
        throw new Error('Phrase cannot be empty');
    }
    const trimmedPhrase = phrase.trim();
    // Извлекаем теги (все что после #)
    const tagMatches = trimmedPhrase.match(/#([^#\s]+)/g);
    const tags = tagMatches ? tagMatches.map(tag => tag.substring(1)) : [];
    // Удаляем теги из фразы
    const withoutTags = trimmedPhrase.replace(/#[^#\s]+/g, '').trim();
    // Разделяем на название и текст по первой точке
    const dotIndex = withoutTags.indexOf('.');
    if (dotIndex === -1) {
        // Нет точки - вся фраза это название
        return {
            name: withoutTags,
            tags
        };
    }
    const name = withoutTags.substring(0, dotIndex).trim();
    const text = withoutTags.substring(dotIndex + 1).trim();
    if (name === '') {
        throw new Error('Name cannot be empty');
    }
    return {
        name,
        text: text || undefined,
        tags
    };
}
/**
 * Validates name length (max 100 characters)
 */
export function validateName(name) {
    if (!name || name.trim() === '') {
        throw new ValidationError('Name cannot be empty');
    }
    if (name.length > 100) {
        throw new ValidationError('Name cannot be longer than 100 characters');
    }
}
//# sourceMappingURL=phrase.js.map