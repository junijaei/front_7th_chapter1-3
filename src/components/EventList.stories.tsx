import type { Meta, StoryObj } from '@storybook/react-vite';

import { EventList } from './EventList';
import { Event } from '../types';

const meta = {
  title: 'Components/EventList',
  component: EventList,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  args: {
    searchTerm: '',
    setSearchTerm: () => {},
    onEditEvent: () => {},
    onDeleteEvent: () => {},
    notificationOptions: [
      { value: 1, label: '1분 전' },
      { value: 10, label: '10분 전' },
      { value: 60, label: '1시간 전' },
      { value: 1440, label: '1일 전' },
      { value: 10080, label: '1주 전' },
    ],
  },
} satisfies Meta<typeof EventList>;

export default meta;
type Story = StoryObj<typeof meta>;

const createEvent = (overrides: Partial<Event>): Event => ({
  id: Math.random().toString(),
  title: '일정',
  date: '2024-11-07',
  startTime: '10:00',
  endTime: '11:00',
  description: '일정 설명',
  location: '회의실',
  category: '업무',
  repeat: { type: 'none', interval: 1 },
  notificationTime: 10,
  ...overrides,
});

/**
 * 빈 목록 (검색 결과 없음)
 */
export const Empty: Story = {
  args: {
    filteredEvents: [],
    notifiedEvents: [],
  },
};

/**
 * 검색 중 상태 (검색어 입력됨)
 */
export const Searching: Story = {
  args: {
    searchTerm: '회의',
    filteredEvents: [],
    notifiedEvents: [],
  },
};

/**
 * 일반 일정 목록
 */
export const NormalEvents: Story = {
  args: {
    filteredEvents: [
      createEvent({
        id: '1',
        title: '팀 회의',
        date: '2024-11-07',
        startTime: '10:00',
        endTime: '11:00',
        description: '주간 팀 회의',
        location: '회의실 A',
        category: '업무',
      }),
      createEvent({
        id: '2',
        title: '점심 약속',
        date: '2024-11-08',
        startTime: '12:00',
        endTime: '13:00',
        description: '친구와 점심',
        location: '레스토랑',
        category: '개인',
      }),
    ],
    notifiedEvents: [],
  },
};

/**
 * 반복 일정
 */
export const RecurringEvents: Story = {
  args: {
    filteredEvents: [
      createEvent({
        id: '1',
        title: '매일 스탠드업',
        date: '2024-11-07',
        repeat: { type: 'daily', interval: 1 },
      }),
      createEvent({
        id: '2',
        title: '주간 회의',
        date: '2024-11-08',
        repeat: { type: 'weekly', interval: 1, endDate: '2024-12-31' },
      }),
      createEvent({
        id: '3',
        title: '월간 리뷰',
        date: '2024-11-15',
        repeat: { type: 'monthly', interval: 1 },
      }),
      createEvent({
        id: '4',
        title: '연례 행사',
        date: '2024-11-20',
        repeat: { type: 'yearly', interval: 1 },
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
    filteredEvents: [
      createEvent({
        id: '1',
        title: '중요한 회의',
        date: '2024-11-07',
        notificationTime: 10,
      }),
      createEvent({
        id: '2',
        title: '긴급 미팅',
        date: '2024-11-08',
        notificationTime: 1,
      }),
      createEvent({
        id: '3',
        title: '프레젠테이션',
        date: '2024-11-10',
        notificationTime: 60,
      }),
    ],
    notifiedEvents: ['1', '2', '3'],
  },
};

/**
 * 반복 + 알림 일정
 */
export const RecurringWithNotifications: Story = {
  args: {
    filteredEvents: [
      createEvent({
        id: '1',
        title: '매일 스탠드업',
        date: '2024-11-07',
        repeat: { type: 'daily', interval: 1 },
        notificationTime: 10,
      }),
      createEvent({
        id: '2',
        title: '주간 회의',
        date: '2024-11-08',
        repeat: { type: 'weekly', interval: 1, endDate: '2024-12-31' },
        notificationTime: 60,
      }),
    ],
    notifiedEvents: ['1', '2'],
  },
};

/**
 * 다양한 카테고리
 */
export const VariousCategories: Story = {
  args: {
    filteredEvents: [
      createEvent({
        id: '1',
        title: '업무 회의',
        category: '업무',
      }),
      createEvent({
        id: '2',
        title: '개인 약속',
        category: '개인',
      }),
      createEvent({
        id: '3',
        title: '가족 모임',
        category: '가족',
      }),
      createEvent({
        id: '4',
        title: '기타 일정',
        category: '기타',
      }),
    ],
    notifiedEvents: [],
  },
};

/**
 * 긴 제목과 설명
 */
export const LongContent: Story = {
  args: {
    filteredEvents: [
      createEvent({
        id: '1',
        title:
          '매우 긴 제목을 가진 일정입니다. 이렇게 긴 제목이 목록에서 어떻게 표시되는지 확인하기 위한 테스트입니다.',
        description:
          '이것은 매우 긴 설명입니다. 일정에 대한 자세한 내용이 여러 줄에 걸쳐 작성되어 있을 때 UI가 어떻게 보이는지 테스트하기 위한 것입니다. 실제 사용자들이 작성할 수 있는 긴 설명을 시뮬레이션합니다.',
        location: '서울특별시 강남구 테헤란로 123번길 45-67 빌딩 3층 대회의실',
      }),
      createEvent({
        id: '2',
        title: 'Q4 전체 임직원 미팅 및 성과 발표회 with CEO and Executive Team Members',
        description: '분기별 성과 발표 및 향후 계획 공유',
        location: '본사 대강당',
      }),
    ],
    notifiedEvents: [],
  },
};

/**
 * 많은 일정 (스크롤 테스트)
 */
export const ManyEvents: Story = {
  args: {
    filteredEvents: Array.from({ length: 20 }, (_, i) =>
      createEvent({
        id: `${i}`,
        title: `일정 ${i + 1}`,
        date: `2024-11-${String(i + 1).padStart(2, '0')}`,
        startTime: `${9 + (i % 10)}:00`,
        endTime: `${10 + (i % 10)}:00`,
      })
    ),
    notifiedEvents: [],
  },
};

/**
 * 혼합된 상태
 */
export const MixedStates: Story = {
  args: {
    filteredEvents: [
      createEvent({
        id: '1',
        title: '일반 일정',
        date: '2024-11-07',
      }),
      createEvent({
        id: '2',
        title: '반복 일정',
        date: '2024-11-08',
        repeat: { type: 'weekly', interval: 1 },
      }),
      createEvent({
        id: '3',
        title: '알림 일정',
        date: '2024-11-09',
      }),
      createEvent({
        id: '4',
        title: '반복 + 알림',
        date: '2024-11-10',
        repeat: { type: 'daily', interval: 2 },
      }),
      createEvent({
        id: '5',
        title: '긴 제목을 가진 반복 알림 일정',
        date: '2024-11-11',
        repeat: { type: 'monthly', interval: 1 },
        description: '자세한 설명이 포함된 일정',
      }),
    ],
    notifiedEvents: ['3', '4', '5'],
  },
};

/**
 * 다양한 알림 시간
 */
export const VariousNotificationTimes: Story = {
  args: {
    filteredEvents: [
      createEvent({
        id: '1',
        title: '1분 전 알림',
        notificationTime: 1,
      }),
      createEvent({
        id: '2',
        title: '10분 전 알림',
        notificationTime: 10,
      }),
      createEvent({
        id: '3',
        title: '1시간 전 알림',
        notificationTime: 60,
      }),
      createEvent({
        id: '4',
        title: '1일 전 알림',
        notificationTime: 1440,
      }),
      createEvent({
        id: '5',
        title: '1주 전 알림',
        notificationTime: 10080,
      }),
    ],
    notifiedEvents: [],
  },
};

/**
 * 빈 필드가 있는 일정
 */
export const WithEmptyFields: Story = {
  args: {
    filteredEvents: [
      createEvent({
        id: '1',
        title: '제목만 있는 일정',
        description: '',
        location: '',
      }),
      createEvent({
        id: '2',
        title: '위치 없는 일정',
        description: '설명은 있지만 위치는 없음',
        location: '',
      }),
      createEvent({
        id: '3',
        title: '설명 없는 일정',
        description: '',
        location: '회의실 A',
      }),
    ],
    notifiedEvents: [],
  },
};
