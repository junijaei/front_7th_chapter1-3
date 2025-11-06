import type { Meta, StoryObj } from '@storybook/react-vite';

import RecurringEventDialog from './RecurringEventDialog';

const meta = {
  title: 'Components/RecurringEventDialog',
  component: RecurringEventDialog,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    onClose: () => {},
    onConfirm: () => {},
  },
} satisfies Meta<typeof RecurringEventDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockEvent = {
  id: '1',
  title: '주간 팀 회의',
  date: '2024-11-07',
  startTime: '10:00',
  endTime: '11:00',
  description: '매주 목요일 팀 회의',
  location: '회의실 A',
  category: '업무',
  repeat: { type: 'weekly' as const, interval: 1 },
  notificationTime: 10,
};

/**
 * 닫힌 상태의 다이얼로그
 */
export const Closed: Story = {
  args: {
    open: false,
    event: null,
    mode: 'edit',
  },
};

/**
 * 반복 일정 수정 모드
 */
export const EditMode: Story = {
  args: {
    open: true,
    event: mockEvent,
    mode: 'edit',
  },
};

/**
 * 반복 일정 삭제 모드
 */
export const DeleteMode: Story = {
  args: {
    open: true,
    event: mockEvent,
    mode: 'delete',
  },
};
