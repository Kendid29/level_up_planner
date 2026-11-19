// Unit tests for CSV serialization and formula injection prevention
import { describe, it, expect } from '@jest/globals';
import {
  escapeCSVField,
  sanitizeFormulaInjection,
  serializeToCSV,
} from '../csv';

describe('CSV Serialization & Formula Injection Prevention', () => {
  describe('sanitizeFormulaInjection', () => {
    it('prepends a single quote to formula starting characters (=, +, -, @, \\t, \\r)', () => {
      expect(sanitizeFormulaInjection('=SUM(A1:A10)')).toBe("'=SUM(A1:A10)");
      expect(sanitizeFormulaInjection('+12345')).toBe("'+12345");
      expect(sanitizeFormulaInjection('-cmd|calc')).toBe("'-cmd|calc");
      expect(sanitizeFormulaInjection('@macro')).toBe("'@macro");
      expect(sanitizeFormulaInjection('\tcmd')).toBe("'\tcmd");
      expect(sanitizeFormulaInjection('\rcmd')).toBe("'\rcmd");
    });

    it('handles values with leading spaces before formula triggers', () => {
      expect(sanitizeFormulaInjection('  =1+1')).toBe("'  =1+1");
      expect(sanitizeFormulaInjection('  +hello')).toBe("'  +hello");
    });

    it('leaves standard text untouched', () => {
      expect(sanitizeFormulaInjection('Plan for today')).toBe('Plan for today');
      expect(sanitizeFormulaInjection('Learn React Native & TypeScript')).toBe(
        'Learn React Native & TypeScript'
      );
      expect(sanitizeFormulaInjection('100% committed')).toBe('100% committed');
    });
  });

  describe('escapeCSVField', () => {
    it('handles empty and null values', () => {
      expect(escapeCSVField(null)).toBe('');
      expect(escapeCSVField(undefined)).toBe('');
      expect(escapeCSVField('')).toBe('');
    });

    it('wraps fields with commas in quotes', () => {
      expect(escapeCSVField('Jakarta, Indonesia')).toBe('"Jakarta, Indonesia"');
    });

    it('escapes internal quotes with double quotes', () => {
      expect(escapeCSVField('Say "Hello"')).toBe('"Say ""Hello"""');
    });

    it('handles multiline strings', () => {
      const multiline = 'Line 1\nLine 2';
      expect(escapeCSVField(multiline)).toBe('"Line 1\nLine 2"');
    });

    it('safely handles Indonesian and accented characters', () => {
      const indonesian = 'Menyelesaikan target tahunan, fokus & berkembang!';
      expect(escapeCSVField(indonesian)).toBe(
        '"Menyelesaikan target tahunan, fokus & berkembang!"'
      );
    });
  });

  describe('serializeToCSV', () => {
    it('generates valid RFC 4180 CSV with UTF-8 BOM', () => {
      const columns = [
        { key: 'title', header: 'Title' },
        { key: 'category', header: 'Category' },
        { key: 'status', header: 'Status' },
      ] as const;

      const data = [
        { title: 'Morning Jog, 5km', category: 'Health', status: 'completed' },
        { title: '=DDE("calc")', category: 'Security', status: 'todo' },
      ];

      const csv = serializeToCSV(columns, data);

      // Verify UTF-8 BOM at start
      expect(csv.startsWith('\uFEFF')).toBe(true);

      const lines = csv.slice(1).split('\r\n');
      expect(lines[0]).toBe('Title,Category,Status');
      expect(lines[1]).toBe('"Morning Jog, 5km",Health,completed');
      expect(lines[2]).toBe('"\'=DDE(""calc"")",Security,todo');
    });
  });
});
