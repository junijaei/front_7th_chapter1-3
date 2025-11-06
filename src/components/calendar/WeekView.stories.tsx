import type { Meta, StoryObj } from '@storybook/react-vite';

import { WeekView } from './WeekView';
import { Event } from '../../types';

const meta = {
  title: 'Calendar/WeekView',
  component: WeekView,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  args: {
    onDateCellClick: () => {},
    onEditEvent: () => {},
  },
} satisfies Meta<typeof WeekView>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockCurrentDate = new Date('2024-11-07'); // 2024년 11월 7일 (목요일)

const createEvent = (overrides: Partial<Event>): Event => ({
  id: Math.random().toString(),
  title: '일정',
  date: '2024-11-07',
  startTime: '10:00',
  endTime: '11:00',
  description: '',
  location: '',
  category: '업무',
  repeat: { type: 'none', interval: 1 },
  notificationTime: 10,
  ...overrides,
});

/**
 * 빈 주간 뷰 (레이아웃 확인)
 */
export const Empty: Story = {
  args: {
    currentDate: mockCurrentDate,
    filteredEvents: [],
    notifiedEvents: [],
    holidays: {},
  },
};

/**
 * 일정이 있는 주간 뷰 (기본 레이아웃)
 */
export const WithEvents: Story = {
  args: {
    currentDate: mockCurrentDate,
    filteredEvents: [
      createEvent({
        id: '1',
        title: '팀 회의',
        date: '2024-11-04',
        startTime: '10:00',
        endTime: '11:00',
      }),
      createEvent({
        id: '2',
        title: '프로젝트 리뷰',
        date: '2024-11-05',
        startTime: '14:00',
        endTime: '15:00',
      }),
      createEvent({
        id: '3',
        title: '점심 약속',
        date: '2024-11-07',
        startTime: '12:00',
        endTime: '13:00',
      }),
    ],
    notifiedEvents: [],
    holidays: {},
  },
};

/**
 * 풀 일정 (레이아웃 스트레스 테스트)
 */
export const FullSchedule: Story = {
  args: {
    currentDate: mockCurrentDate,
    filteredEvents: Array.from({ length: 35 }, (_, i) => {
      const dayIndex = i % 7;
      const baseDate = new Date('2024-11-04');
      baseDate.setDate(baseDate.getDate() + dayIndex);
      return createEvent({
        id: `${i}`,
        title: `일정 ${i + 1}`,
        date: baseDate.toISOString().split('T')[0],
        startTime: `${9 + (i % 10)}:00`,
        endTime: `${10 + (i % 10)}:00`,
      });
    }),
    notifiedEvents: [],
    holidays: {},
  },
};
