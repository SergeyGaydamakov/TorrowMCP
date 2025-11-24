/**
 * Tests for phrase parsing utilities
 */
import { parsePhrase, validateName } from '../util/phrase.js';

describe('Phrase parsing', () => {
  describe('parsePhrase', () => {
    test('should parse phrase with name, text and tags', () => {
      const result = parsePhrase('Рецепты. Описание приготовления блюд. #Еда');
      expect(result).toEqual({
        name: 'Рецепты',
        text: 'Описание приготовления блюд.',
        tags: ['Еда']
      });
    });

    test('should parse phrase with name and multiple tags', () => {
      const result = parsePhrase('Рецепт макарон. Сварить макароны 15 минут. #Рецепты#Еда#Макароны');
      expect(result).toEqual({
        name: 'Рецепт макарон',
        text: 'Сварить макароны 15 минут.',
        tags: ['Рецепты', 'Еда', 'Макароны']
      });
    });

    test('should parse phrase with only name', () => {
      const result = parsePhrase('Простая заметка');
      expect(result).toEqual({
        name: 'Простая заметка',
        tags: []
      });
    });

    test('should parse phrase with name and tags but no text', () => {
      const result = parsePhrase('Заметка. #Тег1#Тег2');
      expect(result).toEqual({
        name: 'Заметка',
        text: '',
        tags: ['Тег1', 'Тег2']
      });
    });

    test('should parse phrase with name and text but no tags', () => {
      const result = parsePhrase('Название. Текст заметки');
      expect(result).toEqual({
        name: 'Название',
        text: 'Текст заметки',
        tags: []
      });
    });

    test('should handle multiple dots in text', () => {
      const result = parsePhrase('Название. Текст с точками... и еще текст.');
      expect(result).toEqual({
        name: 'Название',
        text: 'Текст с точками... и еще текст.',
        tags: []
      });
    });

    test('should throw error for empty phrase', () => {
      expect(() => parsePhrase('')).toThrow('Phrase cannot be empty');
      expect(() => parsePhrase('   ')).toThrow('Phrase cannot be empty');
    });

    test('should throw error for phrase with empty name', () => {
      expect(() => parsePhrase('. Только текст')).toThrow('Name cannot be empty');
    });
  });

  describe('validateName', () => {
    test('should accept valid name', () => {
      expect(() => validateName('Валидное название')).not.toThrow();
    });

    test('should throw error for empty name', () => {
      expect(() => validateName('')).toThrow('Name cannot be empty');
      expect(() => validateName('   ')).toThrow('Name cannot be empty');
    });

    test('should throw error for name longer than 100 characters', () => {
      const longName = 'a'.repeat(101);
      expect(() => validateName(longName)).toThrow('Name cannot be longer than 100 characters');
    });

    test('should accept name with exactly 100 characters', () => {
      const name100 = 'a'.repeat(100);
      expect(() => validateName(name100)).not.toThrow();
    });
  });
});
