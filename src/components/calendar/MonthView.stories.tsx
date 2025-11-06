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
 * 빈 월간 뷰
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
 * 공휴일이 있는 월간 뷰
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
 * 일정이 있는 월간 뷰
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
 * 반복 일정이 있는 월간 뷰
 */
export const WithRecurringEvents: Story = {
  args: {
    currentDate: mockCurrentDate,
    filteredEvents: [
      createEvent({
        id: '1',
        title: '주간 회의',
        date: '2024-11-04',
        repeat: { type: 'weekly', interval: 1 },
      }),
      createEvent({
        id: '2',
        title: '주간 회의',
        date: '2024-11-11',
        repeat: { type: 'weekly', interval: 1 },
      }),
      createEvent({
        id: '3',
        title: '주간 회의',
        date: '2024-11-18',
        repeat: { type: 'weekly', interval: 1 },
      }),
      createEvent({
        id: '4',
        title: '주간 회의',
        date: '2024-11-25',
        repeat: { type: 'weekly', interval: 1 },
      }),
      createEvent({
        id: '5',
        title: '월간 리뷰',
        date: '2024-11-01',
        repeat: { type: 'monthly', interval: 1 },
      }),
    ],
    notifiedEvents: [],
    holidays: {},
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
        title: '중요한 미팅',
        date: '2024-11-07',
      }),
      createEvent({
        id: '2',
        title: '프레젠테이션',
        date: '2024-11-15',
      }),
      createEvent({
        id: '3',
        title: '마감일',
        date: '2024-11-30',
      }),
    ],
    notifiedEvents: ['1', '2', '3'],
    holidays: {},
  },
};

/**
 * 각 날짜에 여러 일정
 */
export const MultipleEventsPerDay: Story = {
  args: {
    currentDate: mockCurrentDate,
    filteredEvents: [
      createEvent({ id: '1', title: '아침 회의', date: '2024-11-07', startTime: '09:00' }),
      createEvent({ id: '2', title: '점심 약속', date: '2024-11-07', startTime: '12:00' }),
      createEvent({ id: '3', title: '오후 미팅', date: '2024-11-07', startTime: '15:00' }),
      createEvent({ id: '4', title: '저녁 회식', date: '2024-11-07', startTime: '18:00' }),
      createEvent({ id: '5', title: '스터디', date: '2024-11-15', startTime: '10:00' }),
      createEvent({ id: '6', title: '세미나', date: '2024-11-15', startTime: '14:00' }),
      createEvent({ id: '7', title: '네트워킹', date: '2024-11-15', startTime: '19:00' }),
    ],
    notifiedEvents: [],
    holidays: {},
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
          '매우 긴 제목을 가진 일정입니다. 이렇게 긴 제목이 월간 뷰의 작은 셀에서 어떻게 표시되는지 확인하기 위한 테스트입니다.',
        date: '2024-11-05',
      }),
      createEvent({
        id: '2',
        title: 'Q4 전체 임직원 미팅 및 성과 발표회 with CEO and Executive Team',
        date: '2024-11-12',
      }),
      createEvent({
        id: '3',
        title: '신규 프로젝트 킥오프 미팅 및 요구사항 분석 세션',
        date: '2024-11-20',
      }),
    ],
    notifiedEvents: [],
    holidays: {},
  },
};

/**
 * 풀 스케줄 (매일 일정)
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

/**
 * 셀당 많은 일정 (스크롤/오버플로우 테스트)
 */
export const OverflowTest: Story = {
  args: {
    currentDate: mockCurrentDate,
    filteredEvents: Array.from({ length: 10 }, (_, i) =>
      createEvent({
        id: `${i}`,
        title: `일정 ${i + 1}`,
        date: '2024-11-15',
        startTime: `${9 + i}:00`,
        endTime: `${10 + i}:00`,
      })
    ),
    notifiedEvents: [],
    holidays: {},
  },
};

/**
 * 혼합된 상태 (공휴일 + 일정 + 알림)
 */
export const MixedStates: Story = {
  args: {
    currentDate: mockCurrentDate,
    filteredEvents: [
      createEvent({
        id: '1',
        title: '개천절 행사',
        date: '2024-11-03',
      }),
      createEvent({
        id: '2',
        title: '일반 일정',
        date: '2024-11-05',
      }),
      createEvent({
        id: '3',
        title: '주간 회의',
        date: '2024-11-07',
        repeat: { type: 'weekly', interval: 1 },
      }),
      createEvent({
        id: '4',
        title: '알림 일정',
        date: '2024-11-11',
      }),
      createEvent({
        id: '5',
        title: '반복 + 알림',
        date: '2024-11-14',
        repeat: { type: 'weekly', interval: 1 },
      }),
      createEvent({
        id: '6',
        title: '여러 일정 1',
        date: '2024-11-20',
      }),
      createEvent({
        id: '7',
        title: '여러 일정 2',
        date: '2024-11-20',
      }),
      createEvent({
        id: '8',
        title: '여러 일정 3',
        date: '2024-11-20',
      }),
    ],
    notifiedEvents: ['4', '5'],
    holidays: {
      '2024-11-03': '개천절',
      '2024-11-25': '크리스마스',
    },
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
