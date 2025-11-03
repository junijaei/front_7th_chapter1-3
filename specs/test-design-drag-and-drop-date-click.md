# 테스트 설계 전략: 드래그 앤 드롭 및 날짜 클릭 일정 생성

## 명세서 참조
- **명세서**: `specs/calendar-drag-and-drop-date-click.md`
- **요구사항**: 드래그 앤 드롭으로 일정 이동 + 날짜 클릭으로 일정 생성
- **구현 방식**: dnd-kit 라이브러리 사용 (HTML5 네이티브 API 대신)

---

## 기존 코드베이스 분석 결과

### 재사용 가능한 기존 코드
1. **컴포넌트**:
   - `RecurringEventDialog` - 반복 일정 수정/삭제 선택 다이얼로그
   - `OverlapDialog` - 일정 겹침 경고 다이얼로그

2. **훅**:
   - `useEventOperations` - 일정 CRUD 작업
   - `useRecurringEventOperations` - 반복 일정 그룹 작업
   - `useEventForm` - 폼 상태 관리

3. **유틸리티**:
   - `findOverlappingEvents` - 일정 겹침 검사
   - `generateRepeatEvents` - 반복 일정 생성

4. **테스트 인프라**:
   - MSW (Mock Service Worker) - API 모킹
   - `@testing-library/react` - React 컴포넌트 테스트
   - `@testing-library/user-event` - 사용자 상호작용 시뮬레이션
   - Vitest - 테스트 러너

### 기존 테스트 패턴
1. **단위 테스트** (`src/__tests__/unit/easy.*`):
   - 순수 함수 유틸리티 테스트
   - 예: `dateUtils`, `eventOverlap`, `timeValidation`

2. **훅 테스트** (`src/__tests__/hooks/*`):
   - `renderHook` 사용
   - MSW로 API 모킹
   - `act`로 비동기 작업 처리

3. **통합 테스트** (`src/__tests__/integration/*`):
   - 전체 컴포넌트 렌더링
   - 사용자 시나리오 기반 워크플로우 테스트
   - `ThemeProvider`, `SnackbarProvider`로 감싸기

---

## dnd-kit 라이브러리 구조 이해

### 핵심 컴포넌트/훅 (이미 설치됨)
```typescript
// @dnd-kit/core
import { DndContext, useDraggable, useDroppable, DragOverlay } from '@dnd-kit/core';

// @dnd-kit/utilities
import { CSS } from '@dnd-kit/utilities';
```

### dnd-kit 작동 원리
1. **DndContext**: 최상위 컨텍스트 제공자
   - `onDragStart`, `onDragEnd`, `onDragOver` 이벤트 핸들러
   - 드래그 상태 관리

2. **useDraggable**: 드래그 가능한 요소
   - `attributes`, `listeners`, `setNodeRef` 반환
   - 일정 박스에 적용

3. **useDroppable**: 드롭 가능한 영역
   - `setNodeRef`, `isOver` 반환
   - 날짜 셀에 적용

4. **DragOverlay**: 드래그 중 시각적 피드백
   - 커서를 따라다니는 고스트 이미지

---

## 테스트 설계 전략

### 복잡도 평가: **중간 (Moderate)**
- **이유**: 새로운 UI 인터랙션이지만 기존 로직 재사용
- **접근 방식**:
  - 기존 테스트 패턴 최대한 활용
  - dnd-kit는 React Testing Library의 `fireEvent`로 시뮬레이션 가능
  - 새로운 유틸리티 함수 최소화

---

## 테스트 계층 구조

### Phase 1: 단위 테스트 (기존 패턴 활용)
**목적**: dnd-kit와 무관한 순수 로직 검증

#### 1.1 날짜 클릭 로직 테스트
**파일**: `src/__tests__/unit/easy.dateClickUtils.spec.ts`

**테스트 케이스**:
- ✅ 클릭한 날짜를 YYYY-MM-DD 형식으로 반환
- ✅ 현재 시간(14:23)을 정각(14:00)으로 반올림
- ✅ 종료 시간을 시작 시간 + 1시간으로 계산
- ✅ 23:00 클릭 시 종료 시간 24:00 (익일 00:00) 처리

**구현 대상 함수**:
```typescript
// src/utils/dateClickUtils.ts
export function roundToNearestHour(now: Date): string;
export function calculateEndTime(startTime: string): string;
```

#### 1.2 드래그 앤 드롭 유틸리티 테스트
**파일**: `src/__tests__/unit/easy.dragDropUtils.spec.ts`

**테스트 케이스**:
- ✅ 일정의 날짜만 변경하고 시간 유지 (`changeEventDate`)
- ✅ 드래그 거리 계산 (날짜 차이)
- ✅ 빈 셀(null) 드롭 시 무효 처리

**구현 대상 함수**:
```typescript
// src/utils/dragDropUtils.ts
export function changeEventDate(event: Event, newDate: string): Event;
export function isValidDropTarget(date: string | null): boolean;
```

---

### Phase 2: 훅 테스트 (기존 패턴 확장)

#### 2.1 날짜 클릭 훅 테스트
**파일**: `src/__tests__/hooks/easy.useDateClick.spec.ts`

**테스트 케이스**:
- ✅ 날짜 클릭 시 폼에 날짜 자동 입력
- ✅ 현재 시간 기준 시작/종료 시간 설정
- ✅ 편집 모드 초기화 (`editingEvent = null`)
- ✅ 기존 일정 박스 클릭 시 수정 모드 유지 (이벤트 버블링 차단)

**구현 대상 훅**:
```typescript
// src/hooks/useDateClick.ts
export function useDateClick(
  setDate: (date: string) => void,
  setStartTime: (time: string) => void,
  setEndTime: (time: string) => void,
  setEditingEvent: (event: Event | null) => void
) {
  const handleDateCellClick = (date: string) => { /* ... */ };
  return { handleDateCellClick };
}
```

**테스트 패턴** (기존 훅 테스트 참조):
```typescript
import { renderHook, act } from '@testing-library/react';

it('날짜 클릭 시 폼에 날짜와 시간이 자동 입력된다', () => {
  const setDate = vi.fn();
  const setStartTime = vi.fn();
  const setEndTime = vi.fn();
  const setEditingEvent = vi.fn();

  const { result } = renderHook(() =>
    useDateClick(setDate, setStartTime, setEndTime, setEditingEvent)
  );

  act(() => {
    result.current.handleDateCellClick('2025-10-20');
  });

  expect(setDate).toHaveBeenCalledWith('2025-10-20');
  expect(setStartTime).toHaveBeenCalledWith(expect.stringMatching(/^\d{2}:00$/));
  expect(setEditingEvent).toHaveBeenCalledWith(null);
});
```

#### 2.2 드래그 앤 드롭 훅 테스트
**파일**: `src/__tests__/hooks/medium.useDragAndDrop.spec.ts`

**테스트 케이스**:
- ✅ 드래그 시작 시 `draggedEvent` 상태 저장
- ✅ 드롭 시 일정 날짜 변경
- ✅ 반복 일정 드래그 시 다이얼로그 트리거
- ✅ 겹침 검사 후 OverlapDialog 트리거
- ✅ 네트워크 오류 시 원본 복원

**구현 대상 훅**:
```typescript
// src/hooks/useDragAndDrop.ts
export function useDragAndDrop(
  events: Event[],
  saveEvent: (event: Event) => Promise<void>,
  handleRecurringEdit: (event: Event, editSingleOnly: boolean) => Promise<void>,
  findOverlappingEvents: (event: Event, events: Event[]) => Event[]
) {
  const [draggedEvent, setDraggedEvent] = useState<Event | null>(null);
  const [dragOverDate, setDragOverDate] = useState<string | null>(null);

  const handleDragStart = (event: Event) => { /* ... */ };
  const handleDragEnd = async (newDate: string) => { /* ... */ };

  return {
    draggedEvent,
    dragOverDate,
    handleDragStart,
    handleDragEnd,
  };
}
```

---

### Phase 3: 통합 테스트 (dnd-kit 통합)

#### 3.1 dnd-kit DndContext 통합 테스트
**파일**: `src/__tests__/integration/dragAndDropWorkflow.spec.tsx`

**테스트 목표**: dnd-kit의 `DndContext`와 실제 컴포넌트 통합 검증

**테스트 케이스**:

##### 3.1.1 기본 드래그 앤 드롭
- ✅ 단일 일정을 다른 날짜로 드래그하여 날짜만 변경
- ✅ 드래그 중 고스트 이미지 표시 (DragOverlay)
- ✅ 드롭 가능 영역 하이라이트 (`isOver` 상태)
- ✅ 드롭 후 서버에 업데이트 요청 (MSW 검증)

**dnd-kit 시뮬레이션 방법**:
```typescript
import { fireEvent, screen } from '@testing-library/react';

it('단일 일정을 드래그하여 다른 날짜로 이동한다', async () => {
  const { user } = setup(<App />);
  await screen.findByText('일정 로딩 완료!');

  // 드래그할 일정 찾기
  const eventBox = screen.getByText('팀 미팅');

  // 드래그 시작 (dnd-kit는 onPointerDown 사용)
  fireEvent.pointerDown(eventBox);

  // 드롭할 날짜 셀 찾기
  const targetCell = screen.getByText('20'); // 10월 20일 셀

  // 드롭 (onPointerUp)
  fireEvent.pointerUp(targetCell);

  // 결과 검증: 날짜만 변경되고 시간 유지
  const updatedEvent = screen.getByText('팀 미팅');
  expect(updatedEvent).toHaveTextContent('2025-10-20');
  expect(updatedEvent).toHaveTextContent('09:00'); // 시간 유지
});
```

**중요**: dnd-kit는 HTML5 Drag API 대신 `PointerEvent`를 사용합니다.

##### 3.1.2 반복 일정 드래그 + RecurringEventDialog
- ✅ 반복 일정 드래그 시 다이얼로그 표시
- ✅ "이 일정만" 선택 시 단일 일정으로 변환 (`repeat.type = 'none'`)
- ✅ "모든 반복 일정" 선택 시 전체 시리즈 이동

**기존 패턴 재사용**:
```typescript
it('반복 일정 드래그 시 RecurringEventDialog가 나타난다', async () => {
  setupMockHandlerRecurringListUpdate(/* ... */);
  const { user } = setup(<App />);

  // 반복 일정 드래그
  const recurringEvent = screen.getByText('매일 회의');
  fireEvent.pointerDown(recurringEvent);

  // 다이얼로그 확인
  expect(screen.getByText('반복 일정 수정')).toBeInTheDocument();
  expect(screen.getByText('해당 일정만 이동하시겠어요?')).toBeInTheDocument();

  // "예" 선택 (단일 이동)
  await user.click(screen.getByText('예'));

  // 드롭
  const targetCell = screen.getByText('20');
  fireEvent.pointerUp(targetCell);

  // 결과 검증: 단일 일정만 이동되고 repeat.type = 'none'
  // ...
});
```

##### 3.1.3 겹침 검사 + OverlapDialog
- ✅ 드롭 대상 날짜에 겹치는 일정 있을 시 OverlapDialog 표시
- ✅ "취소" 선택 시 원본 위치 유지
- ✅ "계속 진행" 선택 시 일정 업데이트

**기존 겹침 로직 재사용**:
```typescript
it('겹치는 일정이 있을 때 OverlapDialog가 표시된다', async () => {
  // 기존 일정: 2025-10-20 09:00-10:00
  // 드래그할 일정: 2025-10-15 09:00-10:00 → 2025-10-20로 이동

  const { user } = setup(<App />);

  // 드래그 앤 드롭
  fireEvent.pointerDown(screen.getByText('팀 미팅'));
  fireEvent.pointerUp(screen.getByText('20'));

  // 겹침 다이얼로그 확인
  expect(screen.getByText('일정 겹침 경고')).toBeInTheDocument();

  // "취소" 선택
  await user.click(screen.getByText('취소'));

  // 원본 위치 유지 확인
  expect(screen.getByText('팀 미팅')).toHaveTextContent('2025-10-15');
});
```

#### 3.2 날짜 클릭 통합 테스트
**파일**: `src/__tests__/integration/dateClickWorkflow.spec.tsx`

**테스트 케이스**:
- ✅ 빈 날짜 셀 클릭 시 폼에 날짜/시간 자동 입력
- ✅ 일정 박스 클릭 시 수정 모드 (기존 동작 유지)
- ✅ 편집 모드 중 다른 날짜 클릭 시 새 일정 모드로 전환
- ✅ 월간 뷰 빈 셀(null) 클릭 시 무반응

```typescript
it('빈 날짜 셀 클릭 시 폼에 날짜와 시간이 자동 입력된다', async () => {
  const { user } = setup(<App />);

  // 빈 날짜 셀 클릭 (10월 20일)
  const emptyCell = screen.getByText('20').closest('td');
  await user.click(emptyCell!);

  // 폼 확인
  const dateInput = screen.getByLabelText('날짜');
  expect(dateInput).toHaveValue('2025-10-20');

  const startTimeInput = screen.getByLabelText('시작 시간');
  expect(startTimeInput).toHaveValue(expect.stringMatching(/^\d{2}:00$/));

  const endTimeInput = screen.getByLabelText('종료 시간');
  // endTime = startTime + 1시간
});
```

---

### Phase 4: 엣지 케이스 및 회귀 테스트

#### 4.1 엣지 케이스 테스트
**파일**: `src/__tests__/edge-cases/dragAndDropEdgeCases.spec.tsx`

**테스트 케이스**:
- ✅ 과거 날짜로 드롭 (허용)
- ✅ 월간 뷰 빈 셀(null)로 드롭 (무시)
- ✅ 드래그 중 뷰 전환 (주간 ↔ 월간) → 드래그 취소
- ✅ 드래그 중 검색 필터 적용 → 드래그 유지
- ✅ 네트워크 오류 시 원본 복원 + Snackbar 표시
- ✅ 반복 일정 다이얼로그 취소 → 드래그 중단
- ✅ 겹침 다이얼로그 취소 → 원본 복원

#### 4.2 시각적 피드백 테스트
**파일**: `src/__tests__/integration/dragVisualFeedback.spec.tsx`

**테스트 케이스**:
- ✅ 드래그 중 DragOverlay 렌더링 확인
- ✅ 드롭 가능 영역 하이라이트 스타일 (`isOver` 상태)
- ✅ 원본 위치 강조 스타일 (`opacity: 0.3`)
- ✅ 겹침 발생 시 빨간 테두리 표시

**스타일 검증 방법**:
```typescript
it('드래그 중 드롭 가능 영역이 하이라이트된다', () => {
  fireEvent.pointerDown(screen.getByText('팀 미팅'));

  const targetCell = screen.getByText('20').closest('td');

  // dnd-kit의 isOver 상태는 PointerEnter 이벤트로 트리거
  fireEvent.pointerEnter(targetCell!);

  // 스타일 확인
  expect(targetCell).toHaveStyle({ backgroundColor: '#e3f2fd' });
});
```

---

## 테스트 우선순위

### P0 (필수 - TDD RED 단계)
1. ✅ 단위 테스트: `dateClickUtils`, `dragDropUtils`
2. ✅ 훅 테스트: `useDateClick`, `useDragAndDrop`
3. ✅ 통합 테스트: 단일 일정 드래그 앤 드롭
4. ✅ 통합 테스트: 날짜 클릭 기본 동작

### P1 (중요 - GREEN 후 추가)
5. ✅ 반복 일정 드래그 + RecurringEventDialog
6. ✅ 겹침 검사 + OverlapDialog
7. ✅ 네트워크 오류 처리

### P2 (선택 - 리팩토링 단계)
8. ✅ 시각적 피드백 테스트
9. ✅ 엣지 케이스 전체
10. ✅ 접근성 테스트 (ARIA 속성)

---

## MSW 핸들러 확장

### 드래그 앤 드롭 API 모킹
기존 `setupMockHandlerUpdating` 재사용:

```typescript
// src/__mocks__/handlersUtils.ts
// 기존 핸들러 그대로 사용 가능
setupMockHandlerUpdating([
  {
    id: '1',
    title: '팀 미팅',
    date: '2025-10-20', // 변경된 날짜
    startTime: '09:00', // 시간 유지
    endTime: '10:00',
    // ...
  }
]);
```

**새로운 핸들러 불필요** - 기존 PUT `/api/events/:id` 엔드포인트 재사용

---

## dnd-kit 테스트 모범 사례

### 1. PointerEvent 사용 (HTML5 Drag 대신)
```typescript
// ❌ 잘못된 방법 (HTML5 Drag API)
fireEvent.dragStart(element);
fireEvent.drop(target);

// ✅ 올바른 방법 (dnd-kit PointerEvent)
fireEvent.pointerDown(element);
fireEvent.pointerUp(target);
```

### 2. DragOverlay 테스트
```typescript
it('드래그 중 고스트 이미지가 표시된다', () => {
  fireEvent.pointerDown(screen.getByText('팀 미팅'));

  // DragOverlay는 Portal로 렌더링되므로 baseElement 사용
  const dragOverlay = within(document.body).getByTestId('drag-overlay');
  expect(dragOverlay).toBeInTheDocument();
  expect(dragOverlay).toHaveTextContent('팀 미팅');
});
```

### 3. isOver 상태 테스트
```typescript
it('드롭 가능 영역에 호버 시 스타일이 변경된다', () => {
  const { setNodeRef } = useDroppable({ id: 'droppable-cell' });

  fireEvent.pointerDown(draggable);
  fireEvent.pointerEnter(droppableCell); // isOver = true

  expect(droppableCell).toHaveStyle({ backgroundColor: '#e3f2fd' });
});
```

---

## 구현 파일 구조 (테스트 우선)

### 1. 유틸리티 함수
- `src/utils/dateClickUtils.ts` - 날짜 클릭 로직
- `src/utils/dragDropUtils.ts` - 드래그 앤 드롭 로직

### 2. 훅
- `src/hooks/useDateClick.ts` - 날짜 클릭 상태 관리
- `src/hooks/useDragAndDrop.ts` - 드래그 앤 드롭 상태 관리

### 3. 컴포넌트 수정
- `src/App.tsx` - DndContext 통합, 이벤트 핸들러 추가
- `src/components/EventBox.tsx` (선택 사항) - useDraggable 통합
- `src/components/DateCell.tsx` (선택 사항) - useDroppable 통합

---

## 성공 기준

### RED 상태 (테스트 먼저 작성)
- ✅ 모든 P0 테스트가 실패함 (구현 전)
- ✅ 테스트가 명세서 요구사항을 100% 반영
- ✅ dnd-kit PointerEvent 시뮬레이션 검증

### GREEN 상태 (최소 구현)
- ✅ 모든 P0 + P1 테스트 통과
- ✅ 기존 테스트 전체 통과 (회귀 방지)
- ✅ dnd-kit DndContext, useDraggable, useDroppable 통합 완료

### REFACTOR 상태 (코드 품질)
- ✅ 모든 P2 테스트 통과
- ✅ 코드 중복 제거 (재사용 가능한 컴포넌트/훅)
- ✅ 성능 최적화 (useMemo, useCallback)

---

## 예상 테스트 커버리지

### 단위 테스트
- `dateClickUtils.ts`: 100%
- `dragDropUtils.ts`: 100%

### 훅 테스트
- `useDateClick.ts`: 90% (엣지 케이스 제외)
- `useDragAndDrop.ts`: 85% (복잡한 상호작용 제외)

### 통합 테스트
- 드래그 앤 드롭 워크플로우: 80% (모든 시나리오)
- 날짜 클릭 워크플로우: 90% (간단한 로직)

### 전체 커버리지 목표
- **라인 커버리지**: 85% 이상
- **브랜치 커버리지**: 80% 이상

---

## 잠재적 리스크 및 완화 전략

### 리스크 1: dnd-kit 테스트 복잡도
**완화**:
- PointerEvent 시뮬레이션 사용
- 공식 문서 및 예제 참조
- 필요 시 실제 E2E 테스트 추가 (Playwright)

### 리스크 2: 반복 일정 + 드래그 앤 드롭 조합
**완화**:
- 기존 `RecurringEventDialog` 로직 100% 재사용
- 통합 테스트에서 시나리오 철저히 검증

### 리스크 3: 겹침 검사 성능
**완화**:
- 드래그 중이 아닌 드롭 시점에만 검사
- 기존 `findOverlappingEvents` 함수 재사용

---

## 다음 단계 (STAGE 3: Test Code Generation)

테스트 설계 승인 후:
1. `src/__tests__/unit/easy.dateClickUtils.spec.ts` 작성
2. `src/__tests__/unit/easy.dragDropUtils.spec.ts` 작성
3. `src/__tests__/hooks/easy.useDateClick.spec.ts` 작성
4. `src/__tests__/hooks/medium.useDragAndDrop.spec.ts` 작성
5. `src/__tests__/integration/dragAndDropWorkflow.spec.tsx` 작성
6. `src/__tests__/integration/dateClickWorkflow.spec.tsx` 작성

**모든 테스트는 RED 상태로 시작합니다** (구현 파일 없음).

---

## 문서 버전

- **버전**: 1.0
- **작성일**: 2025-11-04
- **작성자**: TDD Orchestrator (test-design-strategist)
- **승인 대기**: 사용자 검토 필요
