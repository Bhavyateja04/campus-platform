/**
 * ============================================================================
 * ExamHallScreen.test.js
 * ============================================================================
 * Unit and rendering tests for the ExamHallScreen component
 *
 * Run with: jest ExamHallScreen.test.js
 *
 * Dependencies:
 *   - jest
 *   - @testing-library/react-native
 *   - react-native-safe-area-context (mocked)
 *   - expo-linear-gradient (mocked)
 *   - @expo/vector-icons (mocked)
 * ============================================================================
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ExamHallScreen from '../screens/ExamHallScreen';

// ============================================================================
// Mocks - External Dependencies
// ============================================================================

/**
 * Mock safe-area-context SafeAreaView
 * Replaces with plain View to avoid native dependencies
 */
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    SafeAreaView: ({ children, ...props }) =>
      React.createElement(View, props, children),
  };
});

/**
 * Mock expo-linear-gradient LinearGradient
 * Replaces with plain View to avoid native dependencies
 */
jest.mock('expo-linear-gradient', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    LinearGradient: ({ children, ...props }) =>
      React.createElement(View, props, children),
  };
});

/**
 * Mock @expo/vector-icons Ionicons
 * Renders icon name as text for testability
 */
jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    Ionicons: ({ name, ...props }) =>
      React.createElement(Text, props, name),
  };
});

// ============================================================================
// Test Data
// ============================================================================

/**
 * Static exam hall data
 * Mirrors the data structure in ExamHallScreen
 */
const HALLS = [
  {
    hall: 'Hall A',
    note: 'CSE - 3rd year',
    time: '9:30 AM',
  },
  {
    hall: 'Hall B',
    note: 'ECE - 2nd year',
    time: '9:30 AM',
  },
  {
    hall: 'Hall C',
    note: 'MECH - 1st year',
    time: '2:00 PM',
  },
];

// ============================================================================
// Test Utilities
// ============================================================================

/**
 * Mock navigation object
 */
const mockNavigation = { goBack: jest.fn() };

/**
 * Helper function to render the screen with optional navigation overrides
 * @param {Object} navOverrides - Navigation props to override
 * @returns {Object} Rendered component
 */
const renderScreen = (navOverrides = {}) =>
  render(
    <ExamHallScreen navigation={{ ...mockNavigation, ...navOverrides }} />,
  );

// ============================================================================
// 1. Render Tests: Header
// ============================================================================

describe('ExamHallScreen — Header', () => {
  /**
   * Tests that the screen title is displayed
   */
  it('renders the screen title "Exam Hall"', () => {
    const { getByText } = renderScreen();
    expect(getByText('Exam Hall')).toBeTruthy();
  });

  /**
   * Tests that the subtitle is displayed
   */
  it('renders the subtitle text', () => {
    const { getByText } = renderScreen();
    expect(
      getByText('Quick hall lookup and exam timing overview'),
    ).toBeTruthy();
  });

  /**
   * Tests that the back navigation icon is rendered
   * Mock Ionicons renders icon name as text
   */
  it('renders back-chevron icon', () => {
    const { getByText } = renderScreen();
    expect(getByText('chevron-back')).toBeTruthy();
  });
});

// ============================================================================
// 2. Render Tests: Hero Card
// ============================================================================

describe('ExamHallScreen — Hero Card', () => {
  /**
   * Tests that the hero card title is displayed
   */
  it('renders the hero title "Find your hall faster"', () => {
    const { getByText } = renderScreen();
    expect(getByText('Find your hall faster')).toBeTruthy();
  });

  /**
   * Tests that the offline-safe notice is displayed
   * This assures users the content works without network
   */
  it('renders the offline-safe notice', () => {
    const { getByText } = renderScreen();
    expect(
      getByText(
        'This page is local frontend content, not a backend feed. It is safe to open even when the API is down.',
      ),
    ).toBeTruthy();
  });

  /**
   * Tests that the navigate icon is rendered
   */
  it('renders the navigate-circle-outline icon', () => {
    const { getByText } = renderScreen();
    expect(getByText('navigate-circle-outline')).toBeTruthy();
  });
});

// ============================================================================
// 3. Render Tests: Section Title
// ============================================================================

describe('ExamHallScreen — Section Title', () => {
  /**
   * Tests that the section title is displayed
   */
  it('renders the section title "Today\'s hall list"', () => {
    const { getByText } = renderScreen();
    expect(getByText("Today's hall list")).toBeTruthy();
  });
});

// ============================================================================
// 4. Render Tests: Hall Cards (Data-Driven)
// ============================================================================

describe('ExamHallScreen — Hall Cards', () => {
  /**
   * Tests that all hall cards are rendered
   */
  it(`renders all ${HALLS.length} hall cards`, () => {
    const { getAllByText } = renderScreen();
    HALLS.forEach(({ hall }) => {
      expect(getAllByText(hall).length).toBeGreaterThanOrEqual(1);
    });
  });

  /**
   * Data-driven test: verify each hall name is rendered
   */
  it.each(HALLS)('renders hall name "$hall"', ({ hall }) => {
    const { getByText } = renderScreen();
    expect(getByText(hall)).toBeTruthy();
  });

  /**
   * Data-driven test: verify each note is rendered
   */
  it.each(HALLS)('renders note "$note" for $hall', ({ note }) => {
    const { getByText } = renderScreen();
    expect(getByText(note)).toBeTruthy();
  });

  /**
   * Data-driven test: verify each time slot is rendered
   * Note: times may appear multiple times (e.g., "9:30 AM" for Halls A & B)
   */
  it.each(HALLS)('renders time "$time" for $hall', ({ time }) => {
    const { getAllByText } = renderScreen();
    expect(getAllByText(time).length).toBeGreaterThanOrEqual(1);
  });

  /**
   * Tests that exactly 3 distinct halls are rendered
   */
  it('renders exactly 3 hall cards', () => {
    const { getAllByText } = renderScreen();
    const hallNames = HALLS.map((h) => h.hall);
    const found = hallNames.filter((name) => {
      try {
        getAllByText(name);
        return true;
      } catch {
        return false;
      }
    });
    expect(found).toHaveLength(3);
  });
});

// ============================================================================
// 5. Interaction Tests: Back Button
// ============================================================================

describe('ExamHallScreen — Back Button', () => {
  /**
   * Clear all mocks before each test
   */
  beforeEach(() => jest.clearAllMocks());

  /**
   * Tests that pressing the back button calls navigation.goBack()
   */
  it('calls navigation.goBack() when back button is pressed', () => {
    const goBack = jest.fn();
    const { getByText } = render(
      <ExamHallScreen navigation={{ goBack }} />,
    );
    fireEvent.press(getByText('chevron-back'));
    expect(goBack).toHaveBeenCalledTimes(1);
  });

  /**
   * Tests that goBack is not called on initial render
   */
  it('does not call goBack on initial render', () => {
    const goBack = jest.fn();
    render(<ExamHallScreen navigation={{ goBack }} />);
    expect(goBack).not.toHaveBeenCalled();
  });
});

// ============================================================================
// 6. Data Validation Tests: HALLS Static Data
// ============================================================================

describe('HALLS static data — Structure & Content', () => {
  /**
   * Tests that the HALLS array has the expected length
   */
  it('contains exactly 3 exam hall entries', () => {
    expect(HALLS).toHaveLength(3);
  });

  /**
   * Data-driven test: verify each entry has required fields
   */
  it.each(HALLS)('entry "$hall" has all required fields', (item) => {
    expect(item).toHaveProperty('hall');
    expect(item).toHaveProperty('note');
    expect(item).toHaveProperty('time');
  });

  /**
   * Data-driven test: verify times are non-empty strings
   */
  it.each(HALLS)('time "$time" is a non-empty string', ({ time }) => {
    expect(typeof time).toBe('string');
    expect(time.trim().length).toBeGreaterThan(0);
  });

  /**
   * Tests that hall names are unique (no duplicates)
   */
  it('hall names are unique', () => {
    const names = HALLS.map((h) => h.hall);
    expect(new Set(names).size).toBe(names.length);
  });

  /**
   * Tests that notes are unique (no duplicate department assignments)
   */
  it('notes are unique (no duplicate department assignments)', () => {
    const notes = HALLS.map((h) => h.note);
    expect(new Set(notes).size).toBe(notes.length);
  });
});

// ============================================================================
// 7. Data Validation Tests: Time Slot Logic
// ============================================================================

describe('HALLS static data — Time Slots', () => {
  /**
   * Tests that Halls A and B share the same morning time slot
   * This validates the expected exam schedule structure
   */
  it('first two halls share the same morning time slot', () => {
    expect(HALLS[0].time).toBe(HALLS[1].time);
  });

  /**
   * Tests that Hall C has an afternoon time slot
   * This validates the expected exam schedule structure
   */
  it('Hall C has an afternoon time slot (2:00 PM)', () => {
    const hallC = HALLS.find((h) => h.hall === 'Hall C');
    expect(hallC.time).toBe('2:00 PM');
  });

  /**
   * Tests that there are exactly 2 distinct time slots
   * This validates the exam scheduling is reasonable
   */
  it('there are exactly 2 distinct time slots', () => {
    const times = new Set(HALLS.map((h) => h.time));
    expect(times.size).toBe(2);
  });
});

// ============================================================================
// 8. Snapshot Tests
// ============================================================================

describe('ExamHallScreen — Snapshot', () => {
  /**
   * Snapshot test: ensures component renders consistently
   * Update with: jest -u ExamHallScreen.test.js
   */
  it('matches snapshot', () => {
    const tree = renderScreen().toJSON();
    expect(tree).toMatchSnapshot();
  });
});
