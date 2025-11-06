import type { Meta, StoryObj } from '@storybook/react-vite';

import { MonthView } from './MonthView';
import { Event } from '../../types';

const meta = {
  title: 'Calendar/MonthView',
  component: MonthView,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  args: {
    onDateCellClick: () => {},
    onEditEvent: () => {},
  },
} satisfies Meta<typeof MonthView>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockCurrentDate = new Date('2024-11-01'); // 2024년 11월

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
 * 빈 월간 뷰 (레이아웃 확인)
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
 * 공휴일이 있는 월간 뷰 (월간 뷰 특화 기능)
 */
export const WithHolidays: Story = {
  args: {
    currentDate: mockCurrentDate,
    filteredEvents: [],
    notifiedEvents: [],
    holidays: {
      '2024-11-03': '개천절',
      '2024-11-11': '추수감사절',
      '2024-11-25': '크리스마스',
    },
  },
};

/**
 * 일정이 있는 월간 뷰 (기본 레이아웃)
 */
export const WithEvents: Story = {
  args: {
    currentDate: mockCurrentDate,
    filteredEvents: [
      createEvent({
        id: '1',
        title: '프로젝트 시작',
        date: '2024-11-04',
      }),
      createEvent({
        id: '2',
        title: '중간 점검',
        date: '2024-11-15',
      }),
      createEvent({
        id: '3',
        title: '최종 발표',
        date: '2024-11-29',
      }),
    ],
    notifiedEvents: [],
    holidays: {},
  },
};

/**
 * 월 경계 테스트 (10월 말과 12월 초 포함)
 */
export const MonthBoundaries: Story = {
  args: {
    currentDate: mockCurrentDate,
    filteredEvents: [
      createEvent({
        id: '1',
        title: '10월 마지막 날',
        date: '2024-10-31',
      }),
      createEvent({
        id: '2',
        title: '11월 첫날',
        date: '2024-11-01',
      }),
      createEvent({
        id: '3',
        title: '11월 마지막 날',
        date: '2024-11-30',
      }),
      createEvent({
        id: '4',
        title: '12월 첫날',
        date: '2024-12-01',
      }),
    ],
    notifiedEvents: [],
    holidays: {},
  },
};

/**
 * 풀 스케줄 (레이아웃 스트레스 테스트)
 */
export const FullSchedule: Story = {
  args: {
    currentDate: mockCurrentDate,
    filteredEvents: Array.from({ length: 30 }, (_, i) => {
      const date = new Date('2024-11-01');
      date.setDate(date.getDate() + i);
      return createEvent({
        id: `${i}`,
        title: `일정 ${i + 1}`,
        date: date.toISOString().split('T')[0],
      });
    }),
    notifiedEvents: [],
    holidays: {},
  },
};
