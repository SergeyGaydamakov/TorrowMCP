/**
 * Utilities for parsing phrases in format: <name>.<text>#tag#tag
 */
import { ParsedPhrase } from '../common/types.js';
/**
 * Parses a phrase in format: <name>.<text>#tag#tag
 * Example: "Рецепты. Описание приготовления блюд. #Еда"
 * Result: {name: "Рецепты", text: "Описание приготовления блюд.", tags: ["Еда"]}
 */
export declare function parsePhrase(phrase: string): ParsedPhrase;
/**
 * Validates name length (max 100 characters)
 */
export declare function validateName(name: string): void;
//# sourceMappingURL=phrase.d.ts.map