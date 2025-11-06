import type { Meta, StoryObj } from '@storybook/react-vite';

import { OverlapDialog } from './OverlapDialog';

const meta = {
  title: 'Components/OverlapDialog',
  component: OverlapDialog,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    onClose: () => {},
    onConfirm: () => {},
  },
} satisfies Meta<typeof OverlapDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 닫힌 상태의 다이얼로그
 */
export const Closed: Story = {
  args: {
    open: false,
    overlappingEvents: [],
  },
};

/**
 * 단일 일정과 겹침
 */
export const SingleOverlap: Story = {
  args: {
    open: true,
    overlappingEvents: [
      {
        id: '1',
        title: '팀 회의',
        date: '2024-11-07',
        startTime: '10:00',
        endTime: '11:00',
        description: '주간 팀 회의',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 10,
      },
    ],
  },
};

/**
 * 여러 일정과 겹침
 */
export const MultipleOverlaps: Story = {
  args: {
    open: true,
    overlappingEvents: [
      {
        id: '1',
        title: '팀 회의',
        date: '2024-11-07',
        startTime: '10:00',
        endTime: '11:00',
        description: '주간 팀 회의',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '프로젝트 리뷰',
        date: '2024-11-07',
        startTime: '10:30',
        endTime: '12:00',
        description: '프로젝트 진행 상황 리뷰',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 10,
      },
      {
        id: '3',
        title: '점심 약속',
        date: '2024-11-07',
        startTime: '11:30',
        endTime: '13:00',
        description: '클라이언트 미팅',
        location: '레스토랑',
        category: '개인',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 30,
      },
    ],
  },
};

/**
 * 긴 제목을 가진 일정과 겹침
 */
export const LongTitleOverlap: Story = {
  args: {
    open: true,
    overlappingEvents: [
      {
        id: '1',
        title:
          '매우 긴 제목을 가진 일정입니다. 이렇게 긴 제목이 어떻게 표시되는지 확인하기 위한 테스트입니다.',
        date: '2024-11-07',
        startTime: '14:00',
        endTime: '16:00',
        description: '긴 제목 테스트',
        location: '회의실',
        category: '업무',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 10,
      },
    ],
  },
};
