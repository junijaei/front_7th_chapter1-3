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
 * 빈 주간 뷰
 */
export const Empty: Story = {
  args: {
    currentDate: mockCurrentDate,
    filteredEvents: [],
    notifiedEvents: [],
  },
};

/**
 * 일정이 있는 주간 뷰
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
  },
};

/**
 * 반복 일정이 있는 주간 뷰
 */
export const WithRecurringEvents: Story = {
  args: {
    currentDate: mockCurrentDate,
    filteredEvents: [
      createEvent({
        id: '1',
        title: '매일 스탠드업',
        date: '2024-11-04',
        repeat: { type: 'daily', interval: 1 },
      }),
      createEvent({
        id: '2',
        title: '주간 회의',
        date: '2024-11-07',
        repeat: { type: 'weekly', interval: 1, endDate: '2024-12-31' },
      }),
    ],
    notifiedEvents: [],
  },
};

/**
 * 알림이 활성화된 일정
 */
export const WithNotifications: Story = {
  args: {
    currentDate: mockCurrentDate,
    filteredEvents: [
      createEvent({
        id: '1',
        title: '중요한 회의',
        date: '2024-11-07',
        startTime: '14:00',
        endTime: '15:00',
      }),
      createEvent({
        id: '2',
        title: '긴급 미팅',
        date: '2024-11-08',
        startTime: '10:00',
        endTime: '11:00',
      }),
    ],
    notifiedEvents: ['1', '2'],
  },
};

/**
 * 하루에 여러 일정
 */
export const MultipleEventsPerDay: Story = {
  args: {
    currentDate: mockCurrentDate,
    filteredEvents: [
      createEvent({
        id: '1',
        title: '아침 회의',
        date: '2024-11-07',
        startTime: '09:00',
        endTime: '10:00',
      }),
      createEvent({
        id: '2',
        title: '프로젝트 미팅',
        date: '2024-11-07',
        startTime: '11:00',
        endTime: '12:00',
      }),
      createEvent({
        id: '3',
        title: '점심 약속',
        date: '2024-11-07',
        startTime: '12:30',
        endTime: '13:30',
      }),
      createEvent({
        id: '4',
        title: '오후 회의',
        date: '2024-11-07',
        startTime: '15:00',
        endTime: '16:00',
      }),
      createEvent({
        id: '5',
        title: '저녁 회식',
        date: '2024-11-07',
        startTime: '18:00',
        endTime: '20:00',
      }),
    ],
    notifiedEvents: [],
  },
};

/**
 * 긴 제목을 가진 일정들
 */
export const LongTitles: Story = {
  args: {
    currentDate: mockCurrentDate,
    filteredEvents: [
      createEvent({
        id: '1',
        title:
          '매우 긴 제목을 가진 일정입니다. 이렇게 긴 제목이 캘린더 셀에서 어떻게 표시되는지 확인하기 위한 테스트입니다.',
        date: '2024-11-04',
      }),
      createEvent({
        id: '2',
        title: 'Q4 전체 임직원 미팅 및 성과 발표회 with CEO',
        date: '2024-11-05',
      }),
      createEvent({
        id: '3',
        title: '신규 프로젝트 킥오프 미팅 및 요구사항 분석 세션',
        date: '2024-11-07',
      }),
    ],
    notifiedEvents: [],
  },
};

/**
 * 혼합된 상태의 일정들
 */
export const MixedStates: Story = {
  args: {
    currentDate: mockCurrentDate,
    filteredEvents: [
      createEvent({
        id: '1',
        title: '일반 일정',
        date: '2024-11-04',
      }),
      createEvent({
        id: '2',
        title: '반복 일정',
        date: '2024-11-05',
        repeat: { type: 'weekly', interval: 1 },
      }),
      createEvent({
        id: '3',
        title: '알림 활성화',
        date: '2024-11-06',
      }),
      createEvent({
        id: '4',
        title: '반복 + 알림',
        date: '2024-11-07',
        repeat: { type: 'daily', interval: 2 },
      }),
      createEvent({
        id: '5',
        title: '긴 제목을 가진 반복 일정',
        date: '2024-11-08',
        repeat: { type: 'monthly', interval: 1 },
      }),
    ],
    notifiedEvents: ['3', '4'],
  },
};

/**
 * 풀 일정 (스크롤 테스트)
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
  },
};
