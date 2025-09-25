const request = require('supertest');
const express = require('express');
const streakRouter = require('../routes/streak');
const { getUserStreak, resetUserStreak } = require('../utils/streakCalculator');

// Mock the streak calculator
jest.mock('../utils/streakCalculator');

// Mock middleware
const mockUserMiddleware = (req, res, next) => {
  req.result = { _id: 'mockUserId' };
  next();
};

const app = express();
app.use(express.json());
app.use('/streak', mockUserMiddleware, streakRouter);

describe('Streak API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /streak/current', () => {
    it('should return current streak information', async () => {
      const mockStreakInfo = {
        currentStreak: 5,
        maxStreak: 10,
        lastSubmissionDate: new Date()
      };

      getUserStreak.mockResolvedValue(mockStreakInfo);

      const response = await request(app)
        .get('/streak/current')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.streak).toEqual(mockStreakInfo);
      expect(getUserStreak).toHaveBeenCalledWith('mockUserId');
    });

    it('should handle errors gracefully', async () => {
      getUserStreak.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/streak/current')
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Failed to fetch streak information');
    });
  });

  describe('POST /streak/reset', () => {
    it('should reset user streak successfully', async () => {
      resetUserStreak.mockResolvedValue();

      const response = await request(app)
        .post('/streak/reset')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Streak reset successfully');
      expect(resetUserStreak).toHaveBeenCalledWith('mockUserId');
    });

    it('should handle reset errors gracefully', async () => {
      resetUserStreak.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/streak/reset')
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Failed to reset streak');
    });
  });
});