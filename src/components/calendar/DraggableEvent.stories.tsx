import { DndContext } from '@dnd-kit/core';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { DraggableEvent } from './DraggableEvent';
import { Event } from '../../types';

const meta = {
  title: 'Calendar/DraggableEvent',
  component: DraggableEvent,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <DndContext>
        <div style={{ width: '200px', padding: '8px', backgroundColor: '#f5f5f5' }}>
          <Story />
        </div>
      </DndContext>
    ),
  ],
  args: {
    onEditEvent: () => {},
  },
} satisfies Meta<typeof DraggableEvent>;

export default meta;
type Story = StoryObj<typeof meta>;

const createEvent = (overrides: Partial<Event>): Event => ({
  id: '1',
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
 * 일반 일정
 */
export const Normal: Story = {
  args: {
    event: createEvent({
      title: '팀 회의',
    }),
    notifiedEvents: [],
  },
};

/**
 * 반복 일정
 */
export const Recurring: Story = {
  args: {
    event: createEvent({
      title: '주간 회의',
      repeat: { type: 'weekly', interval: 1 },
    }),
    notifiedEvents: [],
  },
};

/**
 * 알림 활성화
 */
export const Notified: Story = {
  args: {
    event: createEvent({
      id: '1',
      title: '중요한 미팅',
    }),
    notifiedEvents: ['1'],
  },
};

/**
 * 반복 + 알림
 */
export const RecurringNotified: Story = {
  args: {
    event: createEvent({
      id: '1',
      title: '매일 스탠드업',
      repeat: { type: 'daily', interval: 1 },
    }),
    notifiedEvents: ['1'],
  },
};

/**
 * 짧은 제목
 */
export const ShortTitle: Story = {
  args: {
    event: createEvent({
      title: '회의',
    }),
    notifiedEvents: [],
  },
};

/**
 * 긴 제목 (오버플로우 테스트)
 */
export const LongTitle: Story = {
  args: {
    event: createEvent({
      title:
        '매우 긴 제목을 가진 일정입니다. 이렇게 긴 제목이 작은 박스에서 어떻게 표시되는지 확인하기 위한 테스트입니다.',
    }),
    notifiedEvents: [],
  },
};

/**
 * 긴 제목 + 반복
 */
export const LongTitleRecurring: Story = {
  args: {
    event: createEvent({
      title: 'Q4 전체 임직원 미팅 및 성과 발표회',
      repeat: { type: 'weekly', interval: 1 },
    }),
    notifiedEvents: [],
  },
};

/**
 * 긴 제목 + 알림
 */
export const LongTitleNotified: Story = {
  args: {
    event: createEvent({
      id: '1',
      title: '신규 프로젝트 킥오프 미팅 및 요구사항 분석',
    }),
    notifiedEvents: ['1'],
  },
};

/**
 * 모든 아이콘 표시
 */
export const AllIcons: Story = {
  args: {
    event: createEvent({
      id: '1',
      title: '중요 반복 일정',
      repeat: { type: 'monthly', interval: 1, endDate: '2024-12-31' },
    }),
    notifiedEvents: ['1'],
  },
};

/**
 * 매일 반복
 */
export const DailyRecurrence: Story = {
  args: {
    event: createEvent({
      title: '매일 스탠드업',
      repeat: { type: 'daily', interval: 1 },
    }),
    notifiedEvents: [],
  },
};

/**
 * 격주 반복
 */
export const BiweeklyRecurrence: Story = {
  args: {
    event: createEvent({
      title: '격주 회의',
      repeat: { type: 'weekly', interval: 2 },
    }),
    notifiedEvents: [],
  },
};

/**
 * 월간 반복
 */
export const MonthlyRecurrence: Story = {
  args: {
    event: createEvent({
      title: '월간 리뷰',
      repeat: { type: 'monthly', interval: 1 },
    }),
    notifiedEvents: [],
  },
};

/**
 * 연간 반복
 */
export const YearlyRecurrence: Story = {
  args: {
    event: createEvent({
      title: '연례 행사',
      repeat: { type: 'yearly', interval: 1 },
    }),
    notifiedEvents: [],
  },
};

/**
 * 종료일이 있는 반복 일정
 */
export const RecurrenceWithEndDate: Story = {
  args: {
    event: createEvent({
      title: '임시 반복 회의',
      repeat: { type: 'weekly', interval: 1, endDate: '2024-12-31' },
    }),
    notifiedEvents: [],
  },
};

/**
 * 다양한 간격의 반복 (3일마다)
 */
export const CustomInterval: Story = {
  args: {
    event: createEvent({
      title: '3일마다 점검',
      repeat: { type: 'daily', interval: 3 },
    }),
    notifiedEvents: [],
  },
};
