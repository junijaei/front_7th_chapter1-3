# useEventForm 훅 테스트 명세서

## 1. 개요

### 목적
`useEventForm` 훅의 form 상태 관리 및 이벤트 편집 기능에 대한 테스트를 작성한다.

### 범위
- **포함**: 8가지 핵심 시나리오 (초기화, setter 함수, 시간 검증, 편집 기능)
- **제외**: 유효성 검증 로직 자체 (이미 easy.timeValidation.spec.ts에서 테스트됨)

### 테스트 파일
- 경로: `src/__tests__/hooks/medium.useEventForm.spec.ts`
- 참고 패턴: `src/__tests__/hooks/easy.useSearch.spec.ts`

---

## 2. 테스트 케이스

### 2.1 초기 상태 (initialEvent 없음)

**시나리오**: useEventForm을 초기 이벤트 없이 호출할 때 기본값으로 초기화되어야 한다.

**Given**:
- 아무 인자 없이 useEventForm() 호출

**When**:
- renderHook(() => useEventForm())

**Then**:
- title: '' (빈 문자열)
- date: '' (빈 문자열)
- startTime: '' (빈 문자열)
- endTime: '' (빈 문자열)
- description: '' (빈 문자열)
- location: '' (빈 문자열)
- category: '업무' (기본값)
- isRepeating: false
- repeatType: 'none'
- repeatInterval: 1
- repeatEndDate: '' (빈 문자열)
- notificationTime: 10
- startTimeError: null
- endTimeError: null
- editingEvent: null

---

### 2.2 초기 상태 (initialEvent 있음)

**시나리오**: useEventForm을 초기 이벤트와 함께 호출할 때 해당 이벤트 데이터로 초기화되어야 한다.

**Given**:
- 반복 일정이 아닌 초기 이벤트 객체:
  ```typescript
  {
    id: '1',
    title: '팀 회의',
    date: '2025-11-10',
    startTime: '10:00',
    endTime: '11:00',
    description: '주간 팀 회의',
    location: '회의실 A',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 15
  }
  ```

**When**:
- renderHook(() => useEventForm(initialEvent))

**Then**:
- title: '팀 회의'
- date: '2025-11-10'
- startTime: '10:00'
- endTime: '11:00'
- description: '주간 팀 회의'
- location: '회의실 A'
- category: '업무'
- isRepeating: false
- repeatType: 'none'
- repeatInterval: 0
- repeatEndDate: '' (빈 문자열)
- notificationTime: 15

---

### 2.3 Setter 함수 - title

**시나리오**: setTitle을 호출하면 title 상태가 업데이트되어야 한다.

**Given**:
- useEventForm() 호출로 훅 초기화

**When**:
- act(() => { result.current.setTitle('새로운 제목') })

**Then**:
- result.current.title === '새로운 제목'

---

### 2.4 Setter 함수 - date

**시나리오**: setDate를 호출하면 date 상태가 업데이트되어야 한다.

**Given**:
- useEventForm() 호출로 훅 초기화

**When**:
- act(() => { result.current.setDate('2025-12-01') })

**Then**:
- result.current.date === '2025-12-01'

---

### 2.5 Setter 함수 - category

**시나리오**: setCategory를 호출하면 category 상태가 업데이트되어야 한다.

**Given**:
- useEventForm() 호출로 훅 초기화

**When**:
- act(() => { result.current.setCategory('개인') })

**Then**:
- result.current.category === '개인'

---

### 2.6 시간 변경 및 유효성 검증 (handleStartTimeChange)

**시나리오**: handleStartTimeChange를 호출하면 startTime이 업데이트되고 getTimeErrorMessage가 호출되어 에러 상태가 설정되어야 한다.

**Given**:
- useEventForm() 호출로 훅 초기화
- endTime이 '15:00'으로 설정됨
- getTimeErrorMessage 함수 모킹 (vi.fn())

**When**:
- act(() => {
    result.current.setEndTime('15:00');
  })
- act(() => {
    result.current.handleStartTimeChange({ target: { value: '16:00' } } as ChangeEvent<HTMLInputElement>)
  })

**Then**:
- result.current.startTime === '16:00'
- getTimeErrorMessage가 '16:00', '15:00'으로 호출됨
- result.current.startTimeError: '시작 시간은 종료 시간보다 빨라야 합니다.'
- result.current.endTimeError: '종료 시간은 시작 시간보다 늦어야 합니다.'

**참고**: getTimeErrorMessage의 실제 유효성 검증 로직은 테스트하지 않는다 (easy.timeValidation.spec.ts에서 이미 테스트됨). 이 테스트는 함수 호출과 상태 업데이트만 확인한다.

---

### 2.7 시간 변경 및 유효성 검증 (handleEndTimeChange)

**시나리오**: handleEndTimeChange를 호출하면 endTime이 업데이트되고 getTimeErrorMessage가 호출되어 에러 상태가 설정되어야 한다.

**Given**:
- useEventForm() 호출로 훅 초기화
- startTime이 '14:00'으로 설정됨
- getTimeErrorMessage 함수 모킹 (vi.fn())

**When**:
- act(() => {
    result.current.setStartTime('14:00');
  })
- act(() => {
    result.current.handleEndTimeChange({ target: { value: '13:00' } } as ChangeEvent<HTMLInputElement>)
  })

**Then**:
- result.current.endTime === '13:00'
- getTimeErrorMessage가 '14:00', '13:00'으로 호출됨
- result.current.startTimeError: '시작 시간은 종료 시간보다 빨라야 합니다.'
- result.current.endTimeError: '종료 시간은 시작 시간보다 늦어야 합니다.'

---

### 2.8 resetForm 함수

**시나리오**: resetForm을 호출하면 모든 상태가 기본값으로 초기화되어야 한다.

**Given**:
- useEventForm() 호출로 훅 초기화
- 여러 상태 값 설정:
  - title: '기존 제목'
  - date: '2025-11-10'
  - startTime: '10:00'
  - endTime: '11:00'
  - description: '기존 설명'
  - location: '기존 위치'
  - category: '개인'
  - isRepeating: true
  - repeatType: 'daily'
  - repeatInterval: 2
  - repeatEndDate: '2025-12-31'
  - notificationTime: 20

**When**:
- act(() => { result.current.resetForm() })

**Then**:
- title: '' (빈 문자열)
- date: '' (빈 문자열)
- startTime: '' (빈 문자열)
- endTime: '' (빈 문자열)
- description: '' (빈 문자열)
- location: '' (빈 문자열)
- category: '업무'
- isRepeating: false
- repeatType: 'none'
- repeatInterval: 1
- repeatEndDate: '' (빈 문자열)
- notificationTime: 10

---

### 2.9 editEvent 함수 - 반복 일정 아님

**시나리오**: editEvent를 반복 일정이 아닌 이벤트로 호출하면 모든 상태가 해당 이벤트 데이터로 업데이트되어야 한다.

**Given**:
- useEventForm() 호출로 훅 초기화
- 편집할 이벤트 객체 (반복 일정 아님):
  ```typescript
  {
    id: '2',
    title: '프로젝트 리뷰',
    date: '2025-11-15',
    startTime: '14:00',
    endTime: '16:00',
    description: 'Q4 프로젝트 리뷰',
    location: '대회의실',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 30
  }
  ```

**When**:
- act(() => { result.current.editEvent(eventToEdit) })

**Then**:
- editingEvent: eventToEdit (전체 객체)
- title: '프로젝트 리뷰'
- date: '2025-11-15'
- startTime: '14:00'
- endTime: '16:00'
- description: 'Q4 프로젝트 리뷰'
- location: '대회의실'
- category: '업무'
- isRepeating: false
- repeatType: 'none'
- repeatInterval: 0
- repeatEndDate: '' (빈 문자열, endDate 없음)
- notificationTime: 30

---

### 2.10 editEvent 함수 - 반복 일정

**시나리오**: editEvent를 반복 일정으로 호출하면 isRepeating이 true가 되어야 한다.

**Given**:
- useEventForm() 호출로 훅 초기화
- 편집할 이벤트 객체 (반복 일정):
  ```typescript
  {
    id: '3',
    title: '주간 스탠드업',
    date: '2025-11-11',
    startTime: '09:00',
    endTime: '09:30',
    description: '팀 주간 스탠드업',
    location: '온라인',
    category: '업무',
    repeat: {
      type: 'weekly',
      interval: 1,
      endDate: '2025-12-31'
    },
    notificationTime: 5
  }
  ```

**When**:
- act(() => { result.current.editEvent(eventToEdit) })

**Then**:
- editingEvent: eventToEdit (전체 객체)
- title: '주간 스탠드업'
- date: '2025-11-11'
- startTime: '09:00'
- endTime: '09:30'
- description: '팀 주간 스탠드업'
- location: '온라인'
- category: '업무'
- isRepeating: true
- repeatType: 'weekly'
- repeatInterval: 1
- repeatEndDate: '2025-12-31'
- notificationTime: 5

---

## 3. 테스트 구조 및 패턴

### 3.1 기존 패턴 준수
- `@testing-library/react`의 `renderHook`, `act` 사용
- `it()` 형식 (describe 블록 없이)
- 한글 테스트 설명
- Mock 데이터는 테스트 파일 내부에 직접 정의

### 3.2 Import 구조
```typescript
import { act, renderHook } from '@testing-library/react';
import { ChangeEvent } from 'react';
import { useEventForm } from '../../hooks/useEventForm.ts';
import { Event } from '../../types.ts';
import * as timeValidation from '../../utils/timeValidation';
```

### 3.3 Mock 설정
- getTimeErrorMessage 함수만 모킹 (시나리오 2.6, 2.7에서만)
- 모킹 방법:
  ```typescript
  vi.spyOn(timeValidation, 'getTimeErrorMessage').mockReturnValue({
    startTimeError: '시작 시간은 종료 시간보다 빨라야 합니다.',
    endTimeError: '종료 시간은 시작 시간보다 늦어야 합니다.'
  });
  ```
- 각 테스트 후 복원: `vi.restoreAllMocks()`

### 3.4 시간 검증 테스트 접근
- **목적**: getTimeErrorMessage 함수 호출 확인 + 에러 상태 업데이트 확인
- **제외**: 유효성 검증 로직 자체 (이미 easy.timeValidation.spec.ts에서 테스트됨)

---

## 4. 제약 사항 및 원칙

### 4.1 YAGNI 원칙
- **명시된 8가지 시나리오만 테스트**
- 추가 edge case 테스트 금지
- 성능 최적화 테스트 금지

### 4.2 기존 패턴 우선
- easy.useSearch.spec.ts의 테스트 패턴 따르기
- 기존 테스트 유틸리티 활용
- 새로운 테스트 아키텍처 생성 금지

### 4.3 단순함 유지
- 복잡한 테스트 유틸리티 생성 금지
- 직접적인 expect 검증 사용
- 테스트 파일 내부에 필요한 데이터 직접 정의

---

## 5. 성공 기준

### 5.1 테스트 통과
- 10개 테스트 케이스 모두 통과
- RED 상태 확인 (구현 전 실패)
- 명확한 실패 메시지

### 5.2 코드 품질
- 기존 테스트 패턴 일관성 유지
- 한글 테스트 설명
- 간결하고 읽기 쉬운 코드

### 5.3 커버리지
- 8가지 핵심 시나리오 모두 커버
- 불필요한 테스트 없음
- 명확한 Given-When-Then 구조

---

## 6. 참고 사항

### 6.1 테스트 대상 훅
- 파일: `src/hooks/useEventForm.ts`
- 이미 구현 완료됨
- 테스트 파일만 작성 필요

### 6.2 의존성
- `getTimeErrorMessage` (utils/timeValidation.ts) - 시간 검증 유틸리티
- `Event`, `RepeatType` (types.ts) - 타입 정의
- React hooks (useState, ChangeEvent)

### 6.3 복잡도
- **Simple**: form 상태 관리 훅
- 기존 패턴 따르기
- 과도한 엔지니어링 피하기
