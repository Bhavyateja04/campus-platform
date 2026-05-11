/**
 * ExamHallScreen.test.js
 * Unit + rendering tests for the ExamHallScreen component.
 * Run with: jest ExamHallScreen.test.js
 *
 * Dependencies:
 *   jest, @testing-library/react-native,
 *   react-native-safe-area-context (mocked below),
 *   expo-linear-gradient (mocked below),
 *   @expo/vector-icons (mocked below)
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ExamHallScreen from '../screens/ExamHallScreen'; // adjust path as needed

// ─── Mocks ────────────────────────────────────────────────────────────────────
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    SafeAreaView: ({ children, ...props }) =>
      React.createElement(View, props, children),
  };
});

jest.mock('expo-linear-gradient', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    LinearGradient: ({ children, ...props }) =>
      React.createElement(View, props, children),
  };
});

jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    Ionicons: ({ name, ...props }) =>
      React.createElement(Text, props, name),
  };
});

// ─── Static data (mirrors the component) ─────────────────────────────────────
const HALLS = [
  { hall: 'Hall A', note: 'CSE - 3rd year', time: '9:30 AM' },
  { hall: 'Hall B', note: 'ECE - 2nd year', time: '9:30 AM' },
  { hall: 'Hall C', note: 'MECH - 1st year', time: '2:00 PM' },
];

// ─── Factory ──────────────────────────────────────────────────────────────────
const mockNavigation = { goBack: jest.fn() };

const renderScreen = (navOverrides = {}) =>
  render(
    <ExamHallScreen navigation={{ ...mockNavigation, ...navOverrides }} />
  );

// ─────────────────────────────────────────────────────────────────────────────
// 1. RENDER — header
// ─────────────────────────────────────────────────────────────────────────────
describe('Header', () => {
  it('renders the screen title', () => {
    const { getByText } = renderScreen();
    expect(getByText('Exam Hall')).toBeTruthy();
  });

  it('renders the subtitle', () => {
    const { getByText } = renderScreen();
    expect(getByText('Quick hall lookup and exam timing overview')).toBeTruthy();
  });

  it('renders back-chevron icon', () => {
    const { getByText } = renderScreen(); // Ionicons mock renders icon name as text
    expect(getByText('chevron-back')).toBeTruthy();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. RENDER — hero card
// ─────────────────────────────────────────────────────────────────────────────
describe('Hero card', () => {
  it('renders the hero title', () => {
    const { getByText } = renderScreen();
    expect(getByText('Find your hall faster')).toBeTruthy();
  });

  it('renders the offline-safe notice text', () => {
    const { getByText } = renderScreen();
    expect(
      getByText(
        'This page is local frontend content, not a backend feed. It is safe to open even when the API is down.'
      )
    ).toBeTruthy();
  });

  it('renders the navigate icon', () => {
    const { getByText } = renderScreen();
    expect(getByText('navigate-circle-outline')).toBeTruthy();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. RENDER — section title
// ─────────────────────────────────────────────────────────────────────────────
describe('Section title', () => {
  it('renders "Today\'s hall list"', () => {
    const { getByText } = renderScreen();
    expect(getByText("Today's hall list")).toBeTruthy();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. RENDER — hall cards (data-driven)
// ─────────────────────────────────────────────────────────────────────────────
describe('Hall cards', () => {
  it(`renders all ${HALLS.length} hall cards`, () => {
    const { getAllByText } = renderScreen();
    // Each card has a unique hall name — count them
    HALLS.forEach(({ hall }) => {
      expect(getAllByText(hall).length).toBeGreaterThanOrEqual(1);
    });
  });

  it.each(HALLS)('renders hall name "$hall"', ({ hall }) => {
    const { getByText } = renderScreen();
    expect(getByText(hall)).toBeTruthy();
  });

  it.each(HALLS)('renders note "$note" for $hall', ({ note }) => {
    const { getByText } = renderScreen();
    expect(getByText(note)).toBeTruthy();
  });

  it.each(HALLS)('renders time "$time" for $hall', ({ time }) => {
    const { getAllByText } = renderScreen();
    // "9:30 AM" appears twice; just confirm at least one instance
    expect(getAllByText(time).length).toBeGreaterThanOrEqual(1);
  });

  it('renders exactly 3 hall cards', () => {
    const { getAllByText } = renderScreen();
    const hallNames = HALLS.map(h => h.hall);
    const found = hallNames.filter(name => {
      try { getAllByText(name); return true; } catch { return false; }
    });
    expect(found).toHaveLength(3);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. INTERACTION — back button
// ─────────────────────────────────────────────────────────────────────────────
describe('Back button', () => {
  beforeEach(() => jest.clearAllMocks());

  it('calls navigation.goBack() when back button is pressed', () => {
    const goBack = jest.fn();
    const { getByText } = render(
      <ExamHallScreen navigation={{ goBack }} />
    );
    fireEvent.press(getByText('chevron-back'));
    expect(goBack).toHaveBeenCalledTimes(1);
  });

  it('does not call goBack on initial render', () => {
    const goBack = jest.fn();
    render(<ExamHallScreen navigation={{ goBack }} />);
    expect(goBack).not.toHaveBeenCalled();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. STATIC DATA — shape & content validation
// ─────────────────────────────────────────────────────────────────────────────
describe('HALLS static data', () => {
  it('contains exactly 3 entries', () => {
    expect(HALLS).toHaveLength(3);
  });

  it.each(HALLS)('entry "$hall" has all required fields', (item) => {
    expect(item).toHaveProperty('hall');
    expect(item).toHaveProperty('note');
    expect(item).toHaveProperty('time');
  });

  it.each(HALLS)('time "$time" is a non-empty string', ({ time }) => {
    expect(typeof time).toBe('string');
    expect(time.trim().length).toBeGreaterThan(0);
  });

  it('hall names are unique', () => {
    const names = HALLS.map(h => h.hall);
    expect(new Set(names).size).toBe(names.length);
  });

  it('notes are unique (no duplicate department assignments)', () => {
    const notes = HALLS.map(h => h.note);
    expect(new Set(notes).size).toBe(notes.length);
  });

  it('first two halls share the same morning time slot', () => {
    expect(HALLS[0].time).toBe(HALLS[1].time);
  });

  it('Hall C has an afternoon slot', () => {
    const hallC = HALLS.find(h => h.hall === 'Hall C');
    expect(hallC.time).toBe('2:00 PM');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 7. SNAPSHOT
// ─────────────────────────────────────────────────────────────────────────────
describe('Snapshot', () => {
  it('matches snapshot', () => {
    const tree = renderScreen().toJSON();
    expect(tree).toMatchSnapshot();
  });
});