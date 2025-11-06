# useEventForm 훅 테스트 설계 문서

## 개요
- **테스트 대상**: `src/hooks/useEventForm.ts`
- **테스트 파일 위치**: `src/__tests__/hooks/medium.useEventForm.spec.ts`
- **복잡도**: Medium (상태 관리 + 이벤트 핸들러 + 의존성 함수 호출)

## 기존 패턴 분석

### 참고 테스트 파일
1. **easy.useSearch.spec.ts**
   - `renderHook` 사용
   - `act`로 상태 변경 감싸기
   - 상태 변경 후 즉시 결과 검증
   - mock 데이터는 파일 상단에 정의

2. **medium.useNotifications.spec.ts**
   - 시간 관련 테스트에 `vi.setSystemTime` 사용
   - `act` + `vi.advanceTimersByTime` 조합
   - 복잡한 상태 변화 검증

### 공통 패턴
- `@testing-library/react`의 `renderHook`, `act` 사용
- 각 테스트는 독립적으로 실행 가능
- 명확한 한글 테스트 설명
- Given-When-Then 패턴 암묵적 적용

## 테스트 케이스 설계

### 1. 초기 상태 테스트 (initialEvent 없음)
```typescript
describe('초기 상태', () => {
  it('initialEvent가 없으면 모든 필드가 기본값으로 설정되어야 한다', () => {
    // Given: initialEvent 없이 훅 렌더링
    // When: 훅 초기화
    // Then:
    //   - title: ''
    //   - date: ''
    //   - startTime: ''
    //   - endTime: ''
    //   - description: ''
    //   - location: ''
    //   - category: '업무'
    //   - isRepeating: false
    //   - repeatType: 'none'
    //   - repeatInterval: 1
    //   - repeatEndDate: ''
    //   - notificationTime: 10
    //   - startTimeError: null
    //   - endTimeError: null
    //   - editingEvent: null
  });
});
```

### 2. 초기 상태 테스트 (initialEvent 있음)
```typescript
it('initialEvent가 있으면 해당 값으로 초기화되어야 한다', () => {
  // Given: 모든 필드가 채워진 Event 객체
  const mockEvent: Event = {
    id: '1',
    title: '팀 회의',
    date: '2025-10-01',
    startTime: '10:00',
    endTime: '11:00',
    description: '주간 팀 회의',
    location: '회의실 A',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  };

  // When: initialEvent와 함께 훅 렌더링
  // Then: 모든 필드가 mockEvent 값과 일치
});

it('initialEvent가 반복 일정이면 isRepeating이 true여야 한다', () => {
  // Given: repeat.type이 'daily'인 Event
  const mockEvent: Event = {
    id: '1',
    title: '매일 운동',
    date: '2025-10-01',
    startTime: '07:00',
    endTime: '08:00',
    description: '',
    location: '',
    category: '개인',
    repeat: { type: 'daily', interval: 1, endDate: '2025-12-31' },
    notificationTime: 10,
  };

  // When: 훅 렌더링
  // Then: isRepeating === true
});
```

### 3. Setter 함수 테스트
```typescript
describe('상태 변경 함수', () => {
  it('setTitle을 호출하면 title이 변경되어야 한다', () => {
    // Given: 초기 상태
    // When: setTitle('새 제목')
    // Then: title === '새 제목'
  });

  it('setDate를 호출하면 date가 변경되어야 한다', () => {
    // Given: 초기 상태
    // When: setDate('2025-10-15')
    // Then: date === '2025-10-15'
  });

  it('setCategory를 호출하면 category가 변경되어야 한다', () => {
    // Given: 초기 category === '업무'
    // When: setCategory('개인')
    // Then: category === '개인'
  });
});
```

### 4. handleStartTimeChange 테스트
```typescript
describe('handleStartTimeChange', () => {
  it('시작 시간을 변경하면 startTime이 업데이트되어야 한다', () => {
    // Given: 초기 상태
    // When: handleStartTimeChange({ target: { value: '09:00' } })
    // Then: startTime === '09:00'
  });

  it('시작 시간이 종료 시간보다 늦으면 에러 메시지가 설정되어야 한다', () => {
    // Given: endTime === '10:00'
    // When: handleStartTimeChange({ target: { value: '11:00' } })
    // Then:
    //   - startTimeError === '시작 시간은 종료 시간보다 빨라야 합니다.'
    //   - endTimeError === '종료 시간은 시작 시간보다 늦어야 합니다.'
  });

  it('시작 시간이 종료 시간보다 빠르면 에러가 해제되어야 한다', () => {
    // Given: startTime === '11:00', endTime === '10:00' (에러 상태)
    // When: handleStartTimeChange({ target: { value: '09:00' } })
    // Then: startTimeError === null, endTimeError === null
  });
});
```

### 5. handleEndTimeChange 테스트
```typescript
describe('handleEndTimeChange', () => {
  it('종료 시간을 변경하면 endTime이 업데이트되어야 한다', () => {
    // Given: 초기 상태
    // When: handleEndTimeChange({ target: { value: '18:00' } })
    // Then: endTime === '18:00'
  });

  it('종료 시간이 시작 시간보다 빠르면 에러 메시지가 설정되어야 한다', () => {
    // Given: startTime === '10:00'
    // When: handleEndTimeChange({ target: { value: '09:00' } })
    // Then:
    //   - startTimeError === '시작 시간은 종료 시간보다 빨라야 합니다.'
    //   - endTimeError === '종료 시간은 시작 시간보다 늦어야 합니다.'
  });

  it('종료 시간이 시작 시간보다 늦으면 에러가 해제되어야 한다', () => {
    // Given: startTime === '10:00', endTime === '09:00' (에러 상태)
    // When: handleEndTimeChange({ target: { value: '11:00' } })
    // Then: startTimeError === null, endTimeError === null
  });
});
```

### 6. resetForm 테스트
```typescript
describe('resetForm', () => {
  it('모든 필드를 기본값으로 초기화해야 한다', () => {
    // Given: 모든 필드에 값이 채워진 상태
    const { result } = renderHook(() => useEventForm());

    act(() => {
      result.current.setTitle('제목');
      result.current.setDate('2025-10-01');
      result.current.setStartTime('10:00');
      result.current.setEndTime('11:00');
      result.current.setDescription('설명');
      result.current.setLocation('위치');
      result.current.setCategory('개인');
      result.current.setIsRepeating(true);
      result.current.setRepeatType('daily');
      result.current.setRepeatInterval(2);
      result.current.setRepeatEndDate('2025-12-31');
      result.current.setNotificationTime(30);
    });

    // When: resetForm 호출
    // Then: 모든 필드가 기본값으로 초기화
  });
});
```

### 7. editEvent 테스트 (반복 일정 아님)
```typescript
describe('editEvent', () => {
  it('일반 이벤트를 편집하면 모든 필드가 해당 이벤트 값으로 설정되어야 한다', () => {
    // Given: 초기 상태
    const mockEvent: Event = {
      id: '1',
      title: '점심 약속',
      date: '2025-10-15',
      startTime: '12:00',
      endTime: '13:00',
      description: '친구와 점심',
      location: '레스토랑',
      category: '개인',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 15,
    };

    // When: editEvent(mockEvent)
    // Then:
    //   - 모든 필드가 mockEvent 값과 일치
    //   - editingEvent === mockEvent
    //   - isRepeating === false
  });
});
```

### 8. editEvent 테스트 (반복 일정)
```typescript
it('반복 일정을 편집하면 반복 관련 필드도 올바르게 설정되어야 한다', () => {
  // Given: 초기 상태
  const mockEvent: Event = {
    id: '2',
    title: '주간 회의',
    date: '2025-10-01',
    startTime: '14:00',
    endTime: '15:00',
    description: '주간 팀 회의',
    location: '회의실',
    category: '업무',
    repeat: {
      type: 'weekly',
      interval: 1,
      endDate: '2025-12-31',
    },
    notificationTime: 10,
  };

  // When: editEvent(mockEvent)
  // Then:
  //   - 모든 필드가 mockEvent 값과 일치
  //   - isRepeating === true
  //   - repeatType === 'weekly'
  //   - repeatInterval === 1
  //   - repeatEndDate === '2025-12-31'
});
```

## 테스트 구조

### Import 구문
```typescript
import { act, renderHook } from '@testing-library/react';
import { ChangeEvent } from 'react';

import { useEventForm } from '../../hooks/useEventForm.ts';
import { Event } from '../../types.ts';
```

### Mock 데이터
```typescript
const mockNonRepeatingEvent: Event = {
  id: '1',
  title: '팀 회의',
  date: '2025-10-01',
  startTime: '10:00',
  endTime: '11:00',
  description: '주간 팀 회의',
  location: '회의실 A',
  category: '업무',
  repeat: { type: 'none', interval: 0 },
  notificationTime: 10,
};

const mockRepeatingEvent: Event = {
  id: '2',
  title: '주간 회의',
  date: '2025-10-01',
  startTime: '14:00',
  endTime: '15:00',
  description: '주간 팀 회의',
  location: '회의실',
  category: '업무',
  repeat: {
    type: 'weekly',
    interval: 1,
    endDate: '2025-12-31',
  },
  notificationTime: 10,
};
```

### 헬퍼 함수
```typescript
// ChangeEvent 모킹용 헬퍼
const createChangeEvent = (value: string): ChangeEvent<HTMLInputElement> => ({
  target: { value },
} as ChangeEvent<HTMLInputElement>);
```

## 의존성 및 통합

### 외부 의존성
- `getTimeErrorMessage` from `src/utils/timeValidation.ts`
  - 실제 함수 사용 (mocking 불필요)
  - 시간 검증 로직 통합 테스트

### 타입 의존성
- `Event` from `src/types.ts`
- `RepeatType` from `src/types.ts`

## 테스트 실행 환경
- **프레임워크**: Vitest
- **테스트 유틸리티**: @testing-library/react
- **실행 명령어**: `pnpm test medium.useEventForm.spec.ts`

## 성공 기준
1. ✅ 모든 테스트 케이스 통과 (10개)
2. ✅ 초기 상태 검증 완료
3. ✅ 상태 변경 함수 동작 검증
4. ✅ 시간 검증 에러 처리 확인
5. ✅ resetForm 동작 검증
6. ✅ editEvent 동작 검증 (반복/비반복)
7. ✅ getTimeErrorMessage 통합 동작 확인

## 제외 사항 (YAGNI 원칙)
- ❌ 경계값 테스트 (23:59, 00:00 등) - 명세에 없음
- ❌ 성능 테스트 - 요구사항 아님
- ❌ 접근성 테스트 - 범위 밖
- ❌ 복잡한 시간대 처리 - 현재 구현에 없음
- ❌ 비동기 상태 업데이트 - 동기적 상태 관리만 사용
