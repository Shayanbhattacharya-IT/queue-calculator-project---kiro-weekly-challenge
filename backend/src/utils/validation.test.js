import { validateWaitTime, validateReportSubmission, validateLocationData } from './validation.js';

describe('Validation Utilities', () => {
  describe('validateWaitTime', () => {
    test('accepts valid non-negative numbers', () => {
      expect(validateWaitTime(0).isValid).toBe(true);
      expect(validateWaitTime(15).isValid).toBe(true);
      expect(validateWaitTime(100).isValid).toBe(true);
      expect(validateWaitTime('25').isValid).toBe(true);
    });

    test('rejects negative numbers', () => {
      const result = validateWaitTime(-5);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Wait time must be non-negative');
    });

    test('rejects null and undefined', () => {
      expect(validateWaitTime(null).isValid).toBe(false);
      expect(validateWaitTime(undefined).isValid).toBe(false);
    });

    test('rejects empty string', () => {
      const result = validateWaitTime('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Wait time is required');
    });

    test('rejects non-numeric values', () => {
      const result = validateWaitTime('abc');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Wait time must be a valid number');
    });

    test('returns numeric value for valid input', () => {
      const result = validateWaitTime('42');
      expect(result.isValid).toBe(true);
      expect(result.value).toBe(42);
    });
  });

  describe('validateReportSubmission', () => {
    test('accepts valid report data', () => {
      const result = validateReportSubmission({
        locationId: 1,
        waitTimeMinutes: 15
      });
      
      expect(result.isValid).toBe(true);
      expect(result.validatedData).toEqual({
        locationId: 1,
        waitTimeMinutes: 15
      });
    });

    test('accepts string numbers and converts them', () => {
      const result = validateReportSubmission({
        locationId: '2',
        waitTimeMinutes: '20'
      });
      
      expect(result.isValid).toBe(true);
      expect(result.validatedData.locationId).toBe(2);
      expect(result.validatedData.waitTimeMinutes).toBe(20);
    });

    test('rejects missing locationId', () => {
      const result = validateReportSubmission({
        waitTimeMinutes: 15
      });
      
      expect(result.isValid).toBe(false);
      expect(result.errors.locationId).toBeDefined();
    });

    test('rejects missing waitTimeMinutes', () => {
      const result = validateReportSubmission({
        locationId: 1
      });
      
      expect(result.isValid).toBe(false);
      expect(result.errors.waitTimeMinutes).toBeDefined();
    });

    test('rejects negative wait time', () => {
      const result = validateReportSubmission({
        locationId: 1,
        waitTimeMinutes: -10
      });
      
      expect(result.isValid).toBe(false);
      expect(result.errors.waitTimeMinutes).toBe('Wait time must be non-negative');
    });

    test('rejects invalid locationId', () => {
      const result = validateReportSubmission({
        locationId: 'invalid',
        waitTimeMinutes: 15
      });
      
      expect(result.isValid).toBe(false);
      expect(result.errors.locationId).toBeDefined();
    });

    test('collects multiple errors', () => {
      const result = validateReportSubmission({});
      
      expect(result.isValid).toBe(false);
      expect(result.errors.locationId).toBeDefined();
      expect(result.errors.waitTimeMinutes).toBeDefined();
    });
  });

  describe('validateLocationData', () => {
    describe('for creation', () => {
      test('accepts valid location data', () => {
        const result = validateLocationData({
          name: 'Test Bank',
          categoryId: 1
        });
        
        expect(result.isValid).toBe(true);
        expect(result.validatedData).toEqual({
          name: 'Test Bank',
          categoryId: 1
        });
      });

      test('trims whitespace from name', () => {
        const result = validateLocationData({
          name: '  Test Bank  ',
          categoryId: 1
        });
        
        expect(result.isValid).toBe(true);
        expect(result.validatedData.name).toBe('Test Bank');
      });

      test('rejects missing name', () => {
        const result = validateLocationData({
          categoryId: 1
        });
        
        expect(result.isValid).toBe(false);
        expect(result.errors.name).toBeDefined();
      });

      test('rejects empty name', () => {
        const result = validateLocationData({
          name: '   ',
          categoryId: 1
        });
        
        expect(result.isValid).toBe(false);
        expect(result.errors.name).toBe('Location name cannot be empty');
      });

      test('rejects missing categoryId', () => {
        const result = validateLocationData({
          name: 'Test Bank'
        });
        
        expect(result.isValid).toBe(false);
        expect(result.errors.categoryId).toBeDefined();
      });

      test('rejects name longer than 255 characters', () => {
        const result = validateLocationData({
          name: 'a'.repeat(256),
          categoryId: 1
        });
        
        expect(result.isValid).toBe(false);
        expect(result.errors.name).toBe('Location name must be 255 characters or less');
      });

      test('accepts optional isActive field', () => {
        const result = validateLocationData({
          name: 'Test Bank',
          categoryId: 1,
          isActive: false
        });
        
        expect(result.isValid).toBe(true);
        expect(result.validatedData.isActive).toBe(false);
      });

      test('rejects invalid isActive type', () => {
        const result = validateLocationData({
          name: 'Test Bank',
          categoryId: 1,
          isActive: 'yes'
        });
        
        expect(result.isValid).toBe(false);
        expect(result.errors.isActive).toBeDefined();
      });
    });

    describe('for update', () => {
      test('allows partial updates', () => {
        const result = validateLocationData({
          name: 'Updated Name'
        }, true);
        
        expect(result.isValid).toBe(true);
        expect(result.validatedData).toEqual({
          name: 'Updated Name'
        });
      });

      test('allows updating only categoryId', () => {
        const result = validateLocationData({
          categoryId: 2
        }, true);
        
        expect(result.isValid).toBe(true);
        expect(result.validatedData).toEqual({
          categoryId: 2
        });
      });

      test('allows updating only isActive', () => {
        const result = validateLocationData({
          isActive: false
        }, true);
        
        expect(result.isValid).toBe(true);
        expect(result.validatedData).toEqual({
          isActive: false
        });
      });

      test('validates provided fields even in update mode', () => {
        const result = validateLocationData({
          name: '   '
        }, true);
        
        expect(result.isValid).toBe(false);
        expect(result.errors.name).toBe('Location name cannot be empty');
      });
    });
  });
});
