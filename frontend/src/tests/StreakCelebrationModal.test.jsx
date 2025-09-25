import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StreakCelebrationModal from '../components/StreakCelebrationModal';

// Mock react-confetti
jest.mock('react-confetti', () => {
  return function MockConfetti() {
    return <div data-testid="confetti" />;
  };
});

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }) => children,
}));

describe('StreakCelebrationModal', () => {
  const mockOnClose = jest.fn();
  
  const defaultStreakInfo = {
    currentStreak: 5,
    maxStreak: 10,
    isNewStreak: false,
    isStreakMaintained: true,
    streakIncreased: true
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock window dimensions
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 768,
    });
  });

  it('should not render when isOpen is false', () => {
    render(
      <StreakCelebrationModal
        isOpen={false}
        onClose={mockOnClose}
        streakInfo={defaultStreakInfo}
      />
    );

    expect(screen.queryByText(/Streak/)).not.toBeInTheDocument();
  });

  it('should render celebration modal for new streak', () => {
    const newStreakInfo = {
      ...defaultStreakInfo,
      currentStreak: 1,
      isNewStreak: true,
      isStreakMaintained: false
    };

    render(
      <StreakCelebrationModal
        isOpen={true}
        onClose={mockOnClose}
        streakInfo={newStreakInfo}
      />
    );

    expect(screen.getByText('🔥 Streak Started!')).toBeInTheDocument();
    expect(screen.getByText("You've started your coding streak! Keep it going!")).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('should render celebration modal for maintained streak', () => {
    render(
      <StreakCelebrationModal
        isOpen={true}
        onClose={mockOnClose}
        streakInfo={defaultStreakInfo}
      />
    );

    expect(screen.getByText('⚡ Streak Maintained!')).toBeInTheDocument();
    expect(screen.getByText('5 days in a row! Keep coding!')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('should render amazing streak message for long streaks', () => {
    const longStreakInfo = {
      ...defaultStreakInfo,
      currentStreak: 15,
      maxStreak: 20
    };

    render(
      <StreakCelebrationModal
        isOpen={true}
        onClose={mockOnClose}
        streakInfo={longStreakInfo}
      />
    );

    expect(screen.getByText('🚀 Amazing Streak!')).toBeInTheDocument();
    expect(screen.getByText("15 days strong! You're on fire!")).toBeInTheDocument();
  });

  it('should display correct streak level badges', () => {
    const testCases = [
      { streak: 1, level: 'Beginner' },
      { streak: 5, level: 'Rising' },
      { streak: 10, level: 'Expert' },
      { streak: 20, level: 'Master' },
      { streak: 35, level: 'Legendary' }
    ];

    testCases.forEach(({ streak, level }) => {
      const { rerender } = render(
        <StreakCelebrationModal
          isOpen={true}
          onClose={mockOnClose}
          streakInfo={{ ...defaultStreakInfo, currentStreak: streak }}
        />
      );

      expect(screen.getByText(`${level} Level`)).toBeInTheDocument();
      
      rerender(<div />); // Clear for next test
    });
  });

  it('should show confetti when modal opens', () => {
    render(
      <StreakCelebrationModal
        isOpen={true}
        onClose={mockOnClose}
        streakInfo={defaultStreakInfo}
      />
    );

    expect(screen.getByTestId('confetti')).toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <StreakCelebrationModal
        isOpen={true}
        onClose={mockOnClose}
        streakInfo={defaultStreakInfo}
      />
    );

    const closeButton = screen.getByRole('button');
    await user.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should display motivational quotes based on streak length', () => {
    const quotes = [
      { streak: 1, quote: 'Every expert was once a beginner!' },
      { streak: 5, quote: 'Consistency is the key to mastery!' },
      { streak: 10, quote: "You're building an amazing habit!" },
      { streak: 20, quote: 'Your dedication is inspiring!' },
      { streak: 35, quote: "You're a coding legend! 🏆" }
    ];

    quotes.forEach(({ streak, quote }) => {
      const { rerender } = render(
        <StreakCelebrationModal
          isOpen={true}
          onClose={mockOnClose}
          streakInfo={{ ...defaultStreakInfo, currentStreak: streak }}
        />
      );

      expect(screen.getByText(quote)).toBeInTheDocument();
      
      rerender(<div />); // Clear for next test
    });
  });

  it('should handle window resize events', () => {
    render(
      <StreakCelebrationModal
        isOpen={true}
        onClose={mockOnClose}
        streakInfo={defaultStreakInfo}
      />
    );

    // Simulate window resize
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 800,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 600,
    });

    window.dispatchEvent(new Event('resize'));

    // Component should still be rendered without errors
    expect(screen.getByText(/Streak/)).toBeInTheDocument();
  });
});