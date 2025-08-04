const { calculateStreak, getUserStreak, resetUserStreak } = require('../utils/streakCalculator');
const UserStreak = require('../models/userStreak');
const mongoose = require('mongoose');

// Mock the UserStreak model
jest.mock('../models/userStreak');

describe('Streak Calculator', () => {
  const mockUserId = new mongoose.Types.ObjectId();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('calculateStreak', () => {
    it('should create new streak for first submission', async () => {
      UserStreak.findOne.mockResolvedValue(null);
      UserStreak.prototype.save = jest.fn().mockResolvedValue();

      const result = await calculateStreak(mockUserId);

      expect(result.currentStreak).toBe(1);
      expect(result.isNewStreak).toBe(true);
      expect(result.isStreakMaintained).toBe(false);
    });

    it('should maintain streak for consecutive day submission', async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const mockUserStreak = {
        userId: mockUserId,
        currentStreak: 5,
        maxStreak: 10,
        lastSubmissionDate: yesterday,
        streakHistory: [],
        save: jest.fn().mockResolvedValue()
      };

      UserStreak.findOne.mockResolvedValue(mockUserStreak);

      const result = await calculateStreak(mockUserId);

      expect(result.currentStreak).toBe(6);
      expect(result.isNewStreak).toBe(false);
      expect(result.isStreakMaintained).toBe(true);
    });

    it('should reset streak for missed days', async () => {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      const mockUserStreak = {
        userId: mockUserId,
        currentStreak: 5,
        maxStreak: 10,
        lastSubmissionDate: threeDaysAgo,
        streakHistory: [],
        save: jest.fn().mockResolvedValue()
      };

      UserStreak.findOne.mockResolvedValue(mockUserStreak);

      const result = await calculateStreak(mockUserId);

      expect(result.currentStreak).toBe(1);
      expect(result.isNewStreak).toBe(true);
      expect(result.isStreakMaintained).toBe(false);
    });

    it('should not change streak for same day submission', async () => {
      const today = new Date();

      const mockUserStreak = {
        userId: mockUserId,
        currentStreak: 5,
        maxStreak: 10,
        lastSubmissionDate: today,
        streakHistory: []
      };

      UserStreak.findOne.mockResolvedValue(mockUserStreak);

      const result = await calculateStreak(mockUserId);

      expect(result.hasSubmittedToday).toBe(true);
      expect(result.currentStreak).toBe(5);
      expect(result.streakIncreased).toBe(false);
    });

    it('should update max streak when current exceeds it', async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const mockUserStreak = {
        userId: mockUserId,
        currentStreak: 10,
        maxStreak: 10,
        lastSubmissionDate: yesterday,
        streakHistory: [],
        save: jest.fn().mockResolvedValue()
      };

      UserStreak.findOne.mockResolvedValue(mockUserStreak);

      const result = await calculateStreak(mockUserId);

      expect(result.currentStreak).toBe(11);
      expect(result.maxStreak).toBe(11);
    });
  });

  describe('getUserStreak', () => {
    it('should return default values for new user', async () => {
      UserStreak.findOne.mockResolvedValue(null);

      const result = await getUserStreak(mockUserId);

      expect(result.currentStreak).toBe(0);
      expect(result.maxStreak).toBe(0);
      expect(result.lastSubmissionDate).toBe(null);
    });

    it('should reset streak if too many days passed', async () => {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      const mockUserStreak = {
        userId: mockUserId,
        currentStreak: 5,
        maxStreak: 10,
        lastSubmissionDate: threeDaysAgo,
        save: jest.fn().mockResolvedValue()
      };

      UserStreak.findOne.mockResolvedValue(mockUserStreak);

      const result = await getUserStreak(mockUserId);

      expect(result.currentStreak).toBe(0);
      expect(mockUserStreak.save).toHaveBeenCalled();
    });
  });

  describe('resetUserStreak', () => {
    it('should reset user streak to zero', async () => {
      UserStreak.findOneAndUpdate.mockResolvedValue();

      await resetUserStreak(mockUserId);

      expect(UserStreak.findOneAndUpdate).toHaveBeenCalledWith(
        { userId: mockUserId },
        {
          currentStreak: 0,
          lastSubmissionDate: null,
          streakHistory: []
        },
        { upsert: true }
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle timezone differences correctly', async () => {
      // Test with different timezones
      const utcDate = new Date('2024-01-15T23:30:00.000Z');
      const yesterday = new Date('2024-01-14T01:00:00.000Z');

      const mockUserStreak = {
        userId: mockUserId,
        currentStreak: 1,
        maxStreak: 1,
        lastSubmissionDate: yesterday,
        streakHistory: [],
        save: jest.fn().mockResolvedValue()
      };

      UserStreak.findOne.mockResolvedValue(mockUserStreak);

      const result = await calculateStreak(mockUserId, utcDate);

      expect(result.currentStreak).toBe(2);
      expect(result.isStreakMaintained).toBe(true);
    });

    it('should handle multiple submissions on same day', async () => {
      const today = new Date();
      
      const mockUserStreak = {
        userId: mockUserId,
        currentStreak: 3,
        maxStreak: 5,
        lastSubmissionDate: today,
        streakHistory: []
      };

      UserStreak.findOne.mockResolvedValue(mockUserStreak);

      const result = await calculateStreak(mockUserId, today);

      expect(result.hasSubmittedToday).toBe(true);
      expect(result.currentStreak).toBe(3);
      expect(result.streakIncreased).toBe(false);
    });
  });
});