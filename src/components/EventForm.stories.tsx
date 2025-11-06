import type { Meta, StoryObj } from '@storybook/react-vite';
import React, { useState } from 'react';

import { EventForm } from './EventForm';
import { Event, RepeatType } from '../types';

const meta = {
  title: 'Components/EventForm',
  component: EventForm,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: '400px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof EventForm>;

export default meta;
type Story = StoryObj<typeof meta>;

const categories = ['업무', '개인', '가족', '기타'];
const notificationOptions = [
  { value: 1, label: '1분 전' },
  { value: 10, label: '10분 전' },
  { value: 60, label: '1시간 전' },
  { value: 1440, label: '1일 전' },
  { value: 10080, label: '1주 전' },
];

const createFormState = (overrides: Record<string, unknown> = {}) => {
  const [title, setTitle] = useState((overrides.title as string) || '');
  const [date, setDate] = useState((overrides.date as string) || '');
  const [startTime, setStartTime] = useState((overrides.startTime as string) || '');
  const [endTime, setEndTime] = useState((overrides.endTime as string) || '');
  const [description, setDescription] = useState((overrides.description as string) || '');
  const [location, setLocation] = useState((overrides.location as string) || '');
  const [category, setCategory] = useState((overrides.category as string) || '업무');
  const [isRepeating, setIsRepeating] = useState((overrides.isRepeating as boolean) || false);
  const [repeatType, setRepeatType] = useState<RepeatType>(
    (overrides.repeatType as RepeatType) || 'none'
  );
  const [repeatInterval, setRepeatInterval] = useState((overrides.repeatInterval as number) || 1);
  const [repeatEndDate, setRepeatEndDate] = useState((overrides.repeatEndDate as string) || '');
  const [notificationTime, setNotificationTime] = useState(
    (overrides.notificationTime as number) || 10
  );

  return {
    title,
    setTitle,
    date,
    setDate,
    startTime,
    endTime,
    description,
    setDescription,
    location,
    setLocation,
    category,
    setCategory,
    isRepeating,
    setIsRepeating,
    repeatType,
    setRepeatType,
    repeatInterval,
    setRepeatInterval,
    repeatEndDate,
    setRepeatEndDate,
    notificationTime,
    setNotificationTime,
    startTimeError: overrides.startTimeError as string | null,
    endTimeError: overrides.endTimeError as string | null,
    editingEvent: overrides.editingEvent as Event | null,
    handleStartTimeChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      // Mock handler
    },
    handleEndTimeChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      // Mock handler
    },
  };
};

/**
 * 빈 폼 (초기 상태)
 */
export const Empty: Story = {
  render: () => {
    const formState = createFormState();
    return (
      <EventForm
        formState={formState}
        categories={categories}
        notificationOptions={notificationOptions}
        onSubmit={() => {}}
      />
    );
  },
};

/**
 * 일정 추가 모드 (일부 입력됨)
 */
export const AddMode: Story = {
  render: () => {
    const formState = createFormState({
      title: '팀 회의',
      date: '2024-11-07',
      startTime: '10:00',
      endTime: '11:00',
      description: '주간 팀 회의',
      location: '회의실 A',
      category: '업무',
    });
    return (
      <EventForm
        formState={formState}
        categories={categories}
        notificationOptions={notificationOptions}
        onSubmit={() => {}}
      />
    );
  },
};

/**
 * 일정 수정 모드
 */
export const EditMode: Story = {
  render: () => {
    const mockEvent: Event = {
      id: '1',
      title: '기존 일정',
      date: '2024-11-10',
      startTime: '14:00',
      endTime: '15:00',
      description: '수정할 일정',
      location: '회의실 B',
      category: '개인',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    };

    const formState = createFormState({
      title: mockEvent.title,
      date: mockEvent.date,
      startTime: mockEvent.startTime,
      endTime: mockEvent.endTime,
      description: mockEvent.description,
      location: mockEvent.location,
      category: mockEvent.category,
      editingEvent: mockEvent,
    });

    return (
      <EventForm
        formState={formState}
        categories={categories}
        notificationOptions={notificationOptions}
        onSubmit={() => {}}
      />
    );
  },
};

/**
 * 반복 일정 설정
 */
export const WithRecurrence: Story = {
  render: () => {
    const formState = createFormState({
      title: '주간 회의',
      date: '2024-11-07',
      startTime: '10:00',
      endTime: '11:00',
      isRepeating: true,
      repeatType: 'weekly' as RepeatType,
      repeatInterval: 1,
      repeatEndDate: '2024-12-31',
    });

    return (
      <EventForm
        formState={formState}
        categories={categories}
        notificationOptions={notificationOptions}
        onSubmit={() => {}}
      />
    );
  },
};

/**
 * 시간 유효성 에러 (시작 시간 > 종료 시간)
 */
export const TimeValidationError: Story = {
  render: () => {
    const formState = createFormState({
      title: '일정',
      date: '2024-11-07',
      startTime: '15:00',
      endTime: '14:00',
      startTimeError: '시작 시간은 종료 시간보다 빨라야 합니다.',
      endTimeError: null,
    });

    return (
      <EventForm
        formState={formState}
        categories={categories}
        notificationOptions={notificationOptions}
        onSubmit={() => {}}
      />
    );
  },
};

/**
 * 모든 필드 채워진 상태
 */
export const AllFieldsFilled: Story = {
  render: () => {
    const formState = createFormState({
      title: '중요한 프로젝트 킥오프 미팅',
      date: '2024-11-15',
      startTime: '09:00',
      endTime: '12:00',
      description:
        '신규 프로젝트의 킥오프 미팅입니다. 전체 팀원이 참석해야 하며, 프로젝트 목표와 일정에 대해 논의합니다.',
      location: '본사 3층 대회의실',
      category: '업무',
      isRepeating: false,
      notificationTime: 60,
    });

    return (
      <EventForm
        formState={formState}
        categories={categories}
        notificationOptions={notificationOptions}
        onSubmit={() => {}}
      />
    );
  },
};

/**
 * 매일 반복 일정
 */
export const DailyRecurrence: Story = {
  render: () => {
    const formState = createFormState({
      title: '매일 스탠드업',
      date: '2024-11-07',
      startTime: '09:00',
      endTime: '09:15',
      isRepeating: true,
      repeatType: 'daily' as RepeatType,
      repeatInterval: 1,
    });

    return (
      <EventForm
        formState={formState}
        categories={categories}
        notificationOptions={notificationOptions}
        onSubmit={() => {}}
      />
    );
  },
};

/**
 * 격주 반복 일정
 */
export const BiweeklyRecurrence: Story = {
  render: () => {
    const formState = createFormState({
      title: '격주 회의',
      date: '2024-11-07',
      startTime: '14:00',
      endTime: '15:00',
      isRepeating: true,
      repeatType: 'weekly' as RepeatType,
      repeatInterval: 2,
      repeatEndDate: '2024-12-31',
    });

    return (
      <EventForm
        formState={formState}
        categories={categories}
        notificationOptions={notificationOptions}
        onSubmit={() => {}}
      />
    );
  },
};

/**
 * 월간 반복 일정
 */
export const MonthlyRecurrence: Story = {
  render: () => {
    const formState = createFormState({
      title: '월간 리뷰',
      date: '2024-11-01',
      startTime: '10:00',
      endTime: '12:00',
      isRepeating: true,
      repeatType: 'monthly' as RepeatType,
      repeatInterval: 1,
    });

    return (
      <EventForm
        formState={formState}
        categories={categories}
        notificationOptions={notificationOptions}
        onSubmit={() => {}}
      />
    );
  },
};

/**
 * 연간 반복 일정
 */
export const YearlyRecurrence: Story = {
  render: () => {
    const formState = createFormState({
      title: '연례 행사',
      date: '2024-11-15',
      startTime: '10:00',
      endTime: '18:00',
      isRepeating: true,
      repeatType: 'yearly' as RepeatType,
      repeatInterval: 1,
    });

    return (
      <EventForm
        formState={formState}
        categories={categories}
        notificationOptions={notificationOptions}
        onSubmit={() => {}}
      />
    );
  },
};

/**
 * 다양한 카테고리
 */
export const DifferentCategories: Story = {
  render: () => {
    const formState = createFormState({
      title: '가족 모임',
      date: '2024-11-20',
      startTime: '18:00',
      endTime: '21:00',
      category: '가족',
    });

    return (
      <EventForm
        formState={formState}
        categories={categories}
        notificationOptions={notificationOptions}
        onSubmit={() => {}}
      />
    );
  },
};

/**
 * 긴 제목과 설명
 */
export const LongContent: Story = {
  render: () => {
    const formState = createFormState({
      title:
        '매우 긴 제목을 가진 일정입니다. 이렇게 긴 제목이 폼에서 어떻게 표시되는지 확인하기 위한 테스트입니다.',
      date: '2024-11-25',
      startTime: '10:00',
      endTime: '11:00',
      description:
        '이것은 매우 긴 설명입니다. 일정에 대한 자세한 내용이 여러 줄에 걸쳐 작성되어 있을 때 폼이 어떻게 보이는지 테스트하기 위한 것입니다. 실제 사용자들이 작성할 수 있는 긴 설명을 시뮬레이션합니다. 추가적으로 더 많은 텍스트를 넣어서 스크롤이 필요한 상황도 테스트해봅니다.',
      location: '서울특별시 강남구 테헤란로 123번길 45-67 빌딩 3층 대회의실',
    });

    return (
      <EventForm
        formState={formState}
        categories={categories}
        notificationOptions={notificationOptions}
        onSubmit={() => {}}
      />
    );
  },
};
