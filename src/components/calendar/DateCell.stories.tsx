import { DndContext } from '@dnd-kit/core';
import { Table, TableBody, TableRow } from '@mui/material';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { DateCell } from './DateCell';
import { Event } from '../../types';

const meta = {
  title: 'Calendar/DateCell',
  component: DateCell,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <DndContext>
        <Table sx={{ width: '200px' }}>
          <TableBody>
            <TableRow>
              <Story />
            </TableRow>
          </TableBody>
        </Table>
      </DndContext>
    ),
  ],
  args: {
    onDateCellClick: () => {},
    onEditEvent: () => {},
  },
} satisfies Meta<typeof DateCell>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockDate = new Date('2024-11-07');

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
 * 빈 셀
 */
export const Empty: Story = {
  args: {
    date: mockDate,
    dateString: '2024-11-07',
    filteredEvents: [],
    notifiedEvents: [],
  },
};

/**
 * 공휴일이 있는 셀
 */
export const WithHoliday: Story = {
  args: {
    date: mockDate,
    dateString: '2024-11-07',
    filteredEvents: [],
    notifiedEvents: [],
    holiday: '개천절',
  },
};

/**
 * 일정이 1개 있는 셀
 */
export const SingleEvent: Story = {
  args: {
    date: mockDate,
    dateString: '2024-11-07',
    filteredEvents: [
      createEvent({
        id: '1',
        title: '팀 회의',
      }),
    ],
    notifiedEvents: [],
  },
};

/**
 * 일정이 여러 개 있는 셀
 */
export const MultipleEvents: Story = {
  args: {
    date: mockDate,
    dateString: '2024-11-07',
    filteredEvents: [
      createEvent({ id: '1', title: '아침 회의', startTime: '09:00' }),
      createEvent({ id: '2', title: '점심 약속', startTime: '12:00' }),
      createEvent({ id: '3', title: '오후 미팅', startTime: '15:00' }),
    ],
    notifiedEvents: [],
  },
};

/**
 * 긴 제목 (오버플로우 테스트) - 세 가지 너비에서 말줄임 표시
 */
export const LongTitle: Story = {
  args: {
    date: mockDate,
    dateString: '2024-11-07',
    filteredEvents: [
      createEvent({
        id: '1',
        title:
          '매우 긴 제목을 가진 일정입니다. 이렇게 긴 제목이 캘린더 셀에서 어떻게 표시되는지 확인하기 위한 테스트입니다.',
      }),
    ],
    notifiedEvents: [],
  },
  decorators: [
    (Story, context) => (
      <DndContext>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'flex-start' }}>
          {/* 좁은 너비 (100px) */}
          <div>
            <div style={{ marginBottom: '8px', fontWeight: 'bold', fontSize: '14px' }}>좁은 너비 (100px)</div>
            <Table sx={{ width: '100px', border: '1px solid #ddd' }}>
              <TableBody>
                <TableRow>
                  <Story />
                </TableRow>
              </TableBody>
            </Table>
          </div>

          {/* 중간 너비 (200px) */}
          <div>
            <div style={{ marginBottom: '8px', fontWeight: 'bold', fontSize: '14px' }}>중간 너비 (200px)</div>
            <Table sx={{ width: '200px', border: '1px solid #ddd' }}>
              <TableBody>
                <TableRow>
                  <Story />
                </TableRow>
              </TableBody>
            </Table>
          </div>

          {/* 넓은 너비 (300px) */}
          <div>
            <div style={{ marginBottom: '8px', fontWeight: 'bold', fontSize: '14px' }}>넓은 너비 (300px)</div>
            <Table sx={{ width: '300px', border: '1px solid #ddd' }}>
              <TableBody>
                <TableRow>
                  <Story />
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      </DndContext>
    ),
  ],
};

/**
 * 여러 개의 긴 제목
 */
export const MultipleLongTitles: Story = {
  args: {
    date: mockDate,
    dateString: '2024-11-07',
    filteredEvents: [
      createEvent({
        id: '1',
        title: 'Q4 전체 임직원 미팅 및 성과 발표회',
      }),
      createEvent({
        id: '2',
        title: '신규 프로젝트 킥오프 미팅 및 요구사항 분석',
      }),
      createEvent({
        id: '3',
        title: '월간 전사 회의 with CEO and Executive Team',
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
    date: mockDate,
    dateString: '2024-11-07',
    filteredEvents: Array.from({ length: 10 }, (_, i) =>
      createEvent({
        id: `${i}`,
        title: `일정 ${i + 1}`,
        startTime: `${9 + i}:00`,
      })
    ),
    notifiedEvents: [],
  },
};

/**
 * 반복 일정 (아이콘 표시)
 */
export const RecurringEvent: Story = {
  args: {
    date: mockDate,
    dateString: '2024-11-07',
    filteredEvents: [
      createEvent({
        id: '1',
        title: '주간 회의',
        repeat: { type: 'weekly', interval: 1 },
      }),
    ],
    notifiedEvents: [],
  },
};

/**
 * 알림 활성화 (아이콘 및 강조 스타일)
 */
export const NotifiedEvent: Story = {
  args: {
    date: mockDate,
    dateString: '2024-11-07',
    filteredEvents: [
      createEvent({
        id: '1',
        title: '중요한 회의',
      }),
    ],
    notifiedEvents: ['1'],
  },
};

/**
 * 혼합 상태 (반복 + 알림 + 긴 제목)
 */
export const MixedStates: Story = {
  args: {
    date: mockDate,
    dateString: '2024-11-07',
    filteredEvents: [
      createEvent({
        id: '1',
        title: '일반 일정',
      }),
      createEvent({
        id: '2',
        title: '반복 일정',
        repeat: { type: 'weekly', interval: 1 },
      }),
      createEvent({
        id: '3',
        title: '알림 일정',
      }),
      createEvent({
        id: '4',
        title: '긴 제목을 가진 반복 알림 일정',
        repeat: { type: 'monthly', interval: 1 },
      }),
    ],
    notifiedEvents: ['3', '4'],
  },
};

/**
 * 극단적 오버플로우 (20개 일정)
 */
export const ExtremeOverflow: Story = {
  args: {
    date: mockDate,
    dateString: '2024-11-07',
    filteredEvents: Array.from({ length: 20 }, (_, i) =>
      createEvent({
        id: `${i}`,
        title: `일정 ${i + 1}: ${i % 2 === 0 ? '짧은 제목' : '매우 긴 제목을 가진 일정입니다'}`,
        startTime: `${9 + (i % 12)}:00`,
      })
    ),
    notifiedEvents: Array.from({ length: 10 }, (_, i) => `${i * 2}`),
  },
};
