# 기능 명세: 드래그 앤 드롭 및 날짜 클릭으로 일정 생성

## 질문 및 답변

### Q1. 드래그 앤 드롭으로 일정을 이동할 때, 반복 일정(recurring event)은 어떻게 처리해야 하나요?
**답변**: 자동으로 단일 일정 변환

- 반복 일정을 드래그할 때 다이얼로그 없이 자동으로 해당 인스턴스만 단일 일정으로 변환합니다
- 드래그된 인스턴스는 repeat.type = 'none'으로 설정되어 독립적인 일정이 됩니다
- 나머지 반복 일정 인스턴스들은 영향받지 않고 유지됩니다
- 드래그 앤 드롭은 빠른 조작을 위한 기능이므로 다이얼로그 없이 즉시 처리합니다

### Q2. 드래그 앤 드롭으로 일정을 이동할 때, 날짜만 변경할지, 시간도 함께 조정할지 정해주세요.
**답변**: 날짜만 변경

- 드래그 시 date 필드만 변경
- startTime, endTime은 그대로 유지
- 예: 2024-01-01 10:00-11:00 → 2024-01-05 10:00-11:00

### Q3. 드래그 중 사용자에게 어떤 시각적 피드백을 제공해야 하나요?
**답변**: 모든 옵션 선택 (고스트 이미지 표시, 드롭 가능 영역 하이라이트, 원본 위치 강조, 겹침 경고 표시)

1. **고스트 이미지 표시**: 드래그 중인 일정의 반투명 복사본을 마우스 커서 위치에 표시
2. **드롭 가능 영역 하이라이트**: 드래그 중 일정을 놓을 수 있는 날짜 셀을 배경색 변경 등으로 강조
3. **원본 위치 강조**: 드래그 시작 위치의 일정을 회색 처리하거나 점선으로 표시하여 원래 위치를 보여줌
4. **겹침 경고 표시**: 드롭하려는 위치에 이미 일정이 있어 겹칠 경우, 해당 셀에 빨간색 테두리나 경고 아이콘을 실시간으로 표시

### Q4. 날짜 클릭 시 일정 생성 폼을 어떻게 활성화하고, 사용자 경험을 어떻게 설계해야 하나요?
**답변**: 폼만 채우기

- 클릭한 날짜를 폼의 날짜 필드에 자동으로 채움
- 스크롤이나 포커스 이동은 하지 않음
- 사용자가 직접 폼 영역으로 이동해야 함

### Q5. 날짜 클릭 시 기본 시간값은 어떻게 설정해야 하나요?
**답변**: 현재 시간 기준

- 클릭한 시점의 현재 시간을 startTime으로 설정
- endTime은 1시간 후로 자동 설정
- 예: 현재 14:23 → startTime: 14:00, endTime: 15:00 (정각으로 반올림)

### Q6. 드래그 앤 드롭으로 일정을 이동할 때 겹침 검사를 어떻게 처리해야 하나요?
**답변**: 기존 다이얼로그 재사용

- 드롭 시 일정이 겹치면 기존의 OverlapDialog를 표시
- 사용자가 "취소" 또는 "계속 진행" 선택
- 기존 일정 생성/수정 시 겹침 검사 로직과 동일하게 처리

### Q7. 날짜 셀에 이미 일정이 여러 개 있는 경우, 셀 클릭 시 어떻게 동작해야 하나요?
**답변**: 빈 영역만 감지

- 날짜 셀 내 빈 공간을 클릭했을 때만 새 일정 생성
- 기존 일정 박스를 클릭하면 수정 모드로 진입 (기존 동작 유지)
- 이벤트 버블링 제어 필요: 일정 박스 클릭 시 셀 클릭 이벤트가 전파되지 않도록 함

### Q8. 드래그 앤 드롭 기능이 주간 뷰와 월간 뷰 모두에서 동일하게 동작해야 하나요?
**답변**: 동일하게 동작

- 주간 뷰와 월간 뷰 모두에서 동일한 드래그 앤 드롭 동작 제공
- 날짜만 변경하는 로직은 두 뷰에서 일관되게 적용

---

## 기능 명세서

### 1. 기능 개요

캘린더 애플리케이션에 두 가지 사용자 편의 기능을 추가합니다:
1. **드래그 앤 드롭 (D&D)**: 일정을 마우스로 끌어 다른 날짜로 이동
2. **날짜 클릭으로 일정 생성**: 빈 날짜 셀 클릭 시 해당 날짜가 폼에 자동으로 입력

### 2. 영향 받는 컴포넌트 및 파일

#### 수정이 필요한 파일
- **src/App.tsx**: 캘린더 렌더링 및 이벤트 핸들러 추가
  - `renderWeekView()`: 드래그 앤 드롭 및 날짜 클릭 이벤트 추가
  - `renderMonthView()`: 드래그 앤 드롭 및 날짜 클릭 이벤트 추가
  - 새 핸들러 함수 추가: `handleDateCellClick`, `handleEventDragStart`, `handleDragOver`, `handleDrop` 등

- **src/hooks/useEventForm.ts**: 날짜 및 시간 자동 설정 기능 추가
  - `setDateAndTime()` 함수 추가: 날짜 클릭 시 폼에 날짜와 현재 시간 자동 입력

- **src/hooks/useEventOperations.ts**: 드래그 앤 드롭 이동 로직 추가
  - `moveEvent()` 함수 추가: 일정 날짜 변경 후 서버에 업데이트

#### 새로 생성할 파일 (선택 사항)
- **src/hooks/useDragAndDrop.ts**: 드래그 앤 드롭 로직을 별도 훅으로 분리 (선택 사항)
  - 드래그 상태 관리
  - 드롭 가능 영역 계산
  - 시각적 피드백 상태 관리

- **src/utils/dragDropUtils.ts**: 드래그 앤 드롭 관련 유틸리티 함수
  - 드롭 대상 날짜 계산
  - 드래그 가능 여부 확인
  - 겹침 실시간 검사

### 3. 상세 기능 명세

#### 3.1 드래그 앤 드롭 (D&D) 기능

##### 3.1.1 드래그 시작 (dragstart)
- **트리거**: 일정 박스 (Box 컴포넌트)를 마우스로 드래그
- **동작**:
  1. 일정 박스에 `draggable="true"` 속성 추가
  2. `onDragStart` 이벤트 핸들러 추가
  3. 드래그 중인 일정 정보를 `dataTransfer` 또는 state에 저장
  4. 반복 일정 여부 확인 (드롭 시점에 자동 변환 예정)
  5. 시각적 피드백 활성화:
     - 드래그 중인 일정을 고스트 이미지로 표시 (반투명)
     - 원본 위치의 일정을 회색 처리 또는 점선 표시

##### 3.1.2 드래그 중 (dragover)
- **트리거**: 드래그 중인 마우스가 날짜 셀 위를 지나갈 때
- **동작**:
  1. 모든 날짜 셀(TableCell)에 `onDragOver` 이벤트 핸들러 추가
  2. `event.preventDefault()` 호출하여 드롭 가능하도록 설정
  3. 시각적 피드백:
     - 드래그 중인 커서 아래의 날짜 셀 배경색 변경 (예: 연한 파란색)
     - 해당 날짜에 일정이 있어 겹칠 경우, 빨간색 테두리 또는 경고 아이콘 표시
  4. 드롭 가능 영역만 하이라이트 (날짜가 있는 셀만, 빈 셀은 제외)

##### 3.1.3 드롭 (drop)
- **트리거**: 드래그 중인 일정을 날짜 셀에 드롭
- **동작**:
  1. 날짜 셀에 `onDrop` 이벤트 핸들러 추가
  2. 드롭된 날짜 추출 (셀의 date 정보)
  3. 드래그한 일정의 date 필드만 변경 (startTime, endTime은 유지)
  4. 반복 일정 처리 (자동 단일 변환):
     - 반복 일정인 경우: 자동으로 해당 인스턴스의 repeat.type을 'none'으로 변경
     - 날짜 업데이트와 동시에 단일 일정으로 변환
     - 다이얼로그 표시 없음
  5. 겹침 검사:
     - `findOverlappingEvents()` 호출
     - 겹치는 일정이 있으면 OverlapDialog 표시
     - "취소" 선택 시: 원래 위치로 복원
     - "계속 진행" 선택 시: 일정 업데이트 진행
  6. 서버 업데이트:
     - `saveEvent()` 호출 (단일 일정으로 변환되었으므로 단일 API 사용)
  7. 시각적 피드백 제거 (하이라이트, 고스트 이미지 등)

##### 3.1.4 드래그 종료 (dragend)
- **트리거**: 드래그 작업이 끝날 때 (성공적인 드롭 또는 취소)
- **동작**:
  1. `onDragEnd` 이벤트 핸들러 추가
  2. 모든 시각적 피드백 제거
  3. 드래그 상태 초기화

#### 3.2 날짜 클릭으로 일정 생성 기능

##### 3.2.1 날짜 셀 클릭
- **트리거**: 빈 날짜 셀 클릭
- **동작**:
  1. 모든 날짜 셀(TableCell)에 `onClick` 이벤트 핸들러 추가
  2. 클릭된 셀의 날짜 정보 추출
  3. 이벤트 버블링 제어:
     - 일정 박스(Box) 클릭 시 `event.stopPropagation()` 호출하여 셀 클릭 이벤트 전파 차단
     - 빈 공간 클릭 시에만 날짜 셀 클릭 핸들러 실행
  4. 폼 자동 입력:
     - `setDate(클릭한 날짜)` 호출 (YYYY-MM-DD 형식)
     - 현재 시간 계산 후 정각으로 반올림
       - 예: 현재 14:23 → 14:00
     - `setStartTime(정각으로 반올림한 현재 시간)` 호출
     - `setEndTime(startTime + 1시간)` 호출
  5. 편집 모드 초기화:
     - `setEditingEvent(null)` 호출하여 새 일정 생성 모드로 설정
     - 기존 폼 데이터는 초기화하지 않음 (날짜와 시간만 설정)

##### 3.2.2 기존 일정 클릭 (기존 동작 유지)
- **트리거**: 일정 박스(Box) 클릭
- **동작**:
  - 기존과 동일: 우측 일정 목록에서 Edit 버튼 클릭 시와 동일하게 수정 모드로 진입
  - `handleEditEvent()` 호출

### 4. 데이터 구조 변경

데이터 구조 변경 없음. 기존 Event 타입 그대로 사용.

```typescript
interface Event {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD 형식
  startTime: string; // HH:mm 형식
  endTime: string;
  description: string;
  location: string;
  category: string;
  repeat: RepeatInfo;
  notificationTime: number;
}
```

### 5. API 호출

#### 5.1 드래그 앤 드롭
- **단일 일정 이동**: `PUT /api/events/:id` (기존 API 사용)
  ```json
  {
    "id": "event-id",
    "date": "2024-01-05",  // 변경된 날짜
    "title": "...",
    "startTime": "10:00",  // 유지
    "endTime": "11:00",    // 유지
    ...
  }
  ```

- **반복 일정 드래그**: `PUT /api/events/:id` (단일 일정으로 변환 후 사용)
  - 반복 일정을 드래그하면 자동으로 `repeat.type = 'none'`으로 변환
  - 단일 일정 API를 사용하여 저장
  - 서버에서는 해당 ID의 일정만 업데이트됨

#### 5.2 날짜 클릭
- API 호출 없음 (폼 상태만 변경)

### 6. 시각적 피드백 상세

#### 6.1 드래그 중 시각적 상태

1. **고스트 이미지**:
   - 드래그 중인 일정의 복사본을 커서 위치에 표시
   - 스타일: `opacity: 0.6`, `cursor: grabbing`
   - 구현: `onDragStart`에서 `dataTransfer.setDragImage()` 사용 (선택 사항)

2. **원본 위치 강조**:
   - 드래그 시작 위치의 일정 스타일 변경
   - 스타일: `opacity: 0.3`, `border: 2px dashed #999`

3. **드롭 가능 영역 하이라이트**:
   - 드래그 중 호버된 날짜 셀 배경색 변경
   - 스타일: `backgroundColor: '#e3f2fd'` (연한 파란색)

4. **겹침 경고**:
   - 드롭 대상 날짜에 겹치는 일정이 있을 경우
   - 스타일: `border: 2px solid #f44336` (빨간색 테두리)
   - 선택 사항: Warning 아이콘 추가

#### 6.2 날짜 클릭 시각적 상태

- 특별한 시각적 피드백 없음 (폼만 업데이트)
- 선택 사항: 클릭한 날짜 셀을 잠깐 강조 표시 (0.3초 후 사라짐)

### 7. 엣지 케이스 및 예외 처리

#### 7.1 드래그 앤 드롭
1. **반복 일정 드래그**:
   - 자동으로 단일 일정으로 변환되므로 다이얼로그 없음
   - 나머지 반복 일정 인스턴스는 영향받지 않음

2. **과거 날짜로 드롭**:
   - 제한 없음 (과거 날짜로도 이동 가능)

3. **존재하지 않는 날짜**:
   - 월간 뷰에서 빈 셀(null)로 드롭 시 작업 무시

4. **드래그 중 뷰 전환**:
   - 주간 뷰 ↔ 월간 뷰 전환 시 드래그 작업 취소

5. **네트워크 오류 및 에러 핸들링**:
   - 서버 업데이트 실패 시 Snackbar로 오류 메시지 표시: "일정 저장 중 오류가 발생했습니다"
   - 원래 위치로 복원 (`fetchEvents()` 호출하여 서버 상태와 동기화)
   - try-catch로 API 에러를 적절히 처리
   - 일정 이동 시 반드시 `setEditingEvent(draggedEvent)`를 설정하여 수정 모드 명시
   - `await saveEvent(updatedEvent)` 호출로 비동기 완료 대기
   - State 업데이트 시 `events.map(e => e.id === updatedEvent.id ? updatedEvent : e)` 패턴 사용 (복제 방지)

6. **정확한 일정 선택 보장**:
   - 여러 일정이 겹쳐있을 때 정확한 일정이 드래그되도록 고유 key prop 사용
   - 이벤트 버블링 제어: `event.stopPropagation()` 사용
   - 드래그 중인 일정은 z-index를 높여 최상위 표시

#### 7.2 날짜 클릭
1. **편집 모드 중 날짜 클릭**:
   - 기존 편집 모드 취소
   - 새 일정 생성 모드로 전환
   - 폼 초기화 후 클릭한 날짜로 설정

2. **과거 날짜 클릭**:
   - 제한 없음 (과거 날짜도 선택 가능)

3. **반복 일정 영역 클릭**:
   - 기존 동작 유지: 수정 모드로 진입 (셀 클릭 이벤트 전파 차단)

4. **빈 셀(null) 클릭 (월간 뷰)**:
   - 아무 동작 안 함

### 8. 접근성 (Accessibility)

1. **키보드 지원**:
   - 드래그 앤 드롭은 마우스 전용 (키보드 대체: Edit 버튼 사용)
   - 날짜 클릭도 마우스 전용 (키보드 대체: 폼 직접 입력)

2. **ARIA 속성**:
   - 일정 박스에 `aria-label` 추가: `"일정: {title}, 날짜: {date}, 시간: {startTime}-{endTime}"`
   - 드래그 가능한 일정에 `aria-grabbed="false"` 속성 추가

3. **스크린 리더**:
   - 드래그 앤 드롭 완료 시 Snackbar로 "일정이 {새 날짜}로 이동되었습니다" 메시지 표시
   - 날짜 클릭 시 특별한 알림 없음 (폼 필드 자체가 스크린 리더로 읽힘)

### 9. 테스트 시나리오

#### 9.1 드래그 앤 드롭
1. **단일 일정 드래그**:
   - 단일 일정을 다른 날짜로 드래그하여 날짜만 변경되고 시간은 유지되는지 확인

2. **반복 일정 드래그 - 자동 단일 변환**:
   - 반복 일정을 드래그하여 다른 날짜로 이동
   - 다이얼로그 없이 자동으로 해당 인스턴스만 단일 일정으로 변환되는지 확인 (repeat.type = 'none')
   - 나머지 반복 일정 인스턴스들은 영향받지 않고 유지되는지 확인

4. **겹침 경고**:
   - 드롭 대상 날짜에 겹치는 일정이 있을 때 OverlapDialog가 표시되는지 확인
   - "취소" 선택 시 원래 위치로 복원되는지 확인
   - "계속 진행" 선택 시 일정이 이동되는지 확인

5. **시각적 피드백**:
   - 드래그 중 고스트 이미지, 원본 위치 강조, 드롭 가능 영역 하이라이트가 표시되는지 확인
   - 겹침이 발생할 때 빨간색 테두리가 표시되는지 확인

6. **빈 셀로 드롭**:
   - 월간 뷰의 빈 셀(null)로 드롭 시 작업이 무시되는지 확인

#### 9.2 날짜 클릭
1. **빈 날짜 셀 클릭**:
   - 빈 날짜 셀 클릭 시 폼의 날짜 필드에 해당 날짜가 입력되는지 확인
   - 현재 시간이 정각으로 반올림되어 startTime에 설정되는지 확인
   - endTime이 startTime + 1시간으로 설정되는지 확인

2. **일정 있는 날짜 셀의 빈 공간 클릭**:
   - 일정 박스가 아닌 빈 공간 클릭 시 새 일정 생성 폼이 활성화되는지 확인

3. **일정 박스 클릭**:
   - 일정 박스 클릭 시 수정 모드로 진입하는지 확인 (기존 동작 유지)

4. **편집 모드 중 날짜 클릭**:
   - 편집 모드 중 다른 날짜 클릭 시 편집 모드가 취소되고 새 일정 생성 모드로 전환되는지 확인

5. **빈 셀 클릭 (월간 뷰)**:
   - 월간 뷰의 빈 셀(null) 클릭 시 아무 동작이 없는지 확인

#### 9.3 통합 테스트
1. **드래그 후 날짜 클릭**:
   - 드래그로 일정 이동 후 다른 날짜 클릭하여 새 일정 생성이 정상 작동하는지 확인

2. **주간 뷰 ↔ 월간 뷰 전환**:
   - 뷰 전환 후에도 드래그 앤 드롭과 날짜 클릭이 정상 작동하는지 확인

3. **검색 중 드래그 앤 드롭**:
   - 검색 필터 적용 중에도 드래그 앤 드롭이 정상 작동하는지 확인

### 10. 구현 우선순위

#### Phase 1: 기본 기능
1. 날짜 클릭으로 일정 생성 (구현 난이도: 쉬움)
2. 단일 일정 드래그 앤 드롭 (구현 난이도: 중간)

#### Phase 2: 반복 일정 및 검증
3. 반복 일정 드래그 앤 드롭 - 자동 단일 변환 (구현 난이도: 쉬움)
4. 겹침 검사 및 OverlapDialog 통합 (구현 난이도: 중간)
5. 네트워크 오류 처리 및 복원 로직 (구현 난이도: 중간)

#### Phase 3: 시각적 피드백
5. 드래그 중 시각적 피드백 (고스트 이미지, 하이라이트 등) (구현 난이도: 중간)

#### Phase 4: 테스트 및 접근성
6. 테스트 코드 작성
7. 접근성 개선

### 11. 기술 스택 및 라이브러리

- **React DnD 라이브러리 사용 여부**: 사용하지 않음
  - HTML5 Drag and Drop API 직접 사용 (네이티브 API)
  - 이유: 프로젝트가 이미 Material-UI로 구성되어 있고, 기본 DnD 기능만 필요하므로 추가 라이브러리 불필요

- **Material-UI**: 기존 컴포넌트 계속 사용
  - Box, TableCell 등에 드래그 이벤트 핸들러 추가

### 12. 성능 고려 사항

1. **드래그 중 렌더링 최적화**:
   - 드래그 중 불필요한 리렌더링 방지
   - `useMemo`, `useCallback` 사용

2. **이벤트 리스너 최적화**:
   - 모든 날짜 셀에 개별 핸들러 대신, 이벤트 위임(Event Delegation) 고려
   - 예: Table 레벨에서 단일 핸들러로 모든 셀 클릭 처리

3. **겹침 검사 캐싱**:
   - 드래그 중 겹침 검사를 매 프레임마다 수행하지 않고, 드롭 시점에만 수행

### 13. 향후 확장 가능성

1. **시간 조정 기능**:
   - 주간 뷰에서 시간대별 그리드 추가하여 시간도 함께 조정 가능

2. **멀티 드래그**:
   - Shift/Ctrl 키로 여러 일정 선택 후 일괄 이동

3. **드래그로 일정 복사**:
   - Ctrl+드래그로 일정 복사 (이동이 아닌 복제)

4. **날짜 범위 드래그**:
   - 여러 날짜를 드래그하여 범위로 일정 생성

---

## 부록: 코드 구조 예시

### A. App.tsx 수정 예시

```typescript
// 드래그 상태 관리
const [draggedEvent, setDraggedEvent] = useState<Event | null>(null);
const [dragOverDate, setDragOverDate] = useState<string | null>(null);

// 드래그 시작 핸들러
const handleEventDragStart = (event: Event) => {
  setDraggedEvent(event);
  // 반복 일정 여부 확인은 드롭 시점에 수행
};

// 드래그 오버 핸들러
const handleDragOver = (e: React.DragEvent, date: string) => {
  e.preventDefault();
  setDragOverDate(date);
};

// 드롭 핸들러
const handleDrop = async (e: React.DragEvent, newDate: string) => {
  e.preventDefault();
  if (!draggedEvent || !newDate) return;

  // 반복 일정 자동 변환
  const updatedEvent = {
    ...draggedEvent,
    date: newDate,
    repeat: isRecurringEvent(draggedEvent)
      ? { type: 'none', interval: 0 }
      : draggedEvent.repeat
  };

  // 겹침 검사
  const overlapping = findOverlappingEvents(updatedEvent, events);
  if (overlapping.length > 0) {
    setOverlappingEvents(overlapping);
    setIsOverlapDialogOpen(true);
    return;
  }

  // 수정 모드 설정 및 저장
  setEditingEvent(draggedEvent);
  try {
    await saveEvent(updatedEvent);
    showSnackbar('일정이 수정되었습니다', 'success');
  } catch (error) {
    showSnackbar('일정 저장 중 오류가 발생했습니다', 'error');
    await fetchEvents(); // 서버 상태로 복원
  } finally {
    setDraggedEvent(null);
    setEditingEvent(null);
    setDragOverDate(null);
  }
};

// 날짜 셀 클릭 핸들러
const handleDateCellClick = (date: string) => {
  setEditingEvent(null);
  setDate(date);

  // 현재 시간을 정각으로 반올림
  const now = new Date();
  const hours = now.getHours();
  const startTime = `${String(hours).padStart(2, '0')}:00`;
  const endTime = `${String(hours + 1).padStart(2, '0')}:00`;

  setStartTime(startTime);
  setEndTime(endTime);
};
```

### B. 일정 박스 수정 예시

```typescript
<Box
  key={event.id}
  draggable
  onDragStart={() => handleEventDragStart(event)}
  onClick={(e) => {
    e.stopPropagation(); // 셀 클릭 이벤트 전파 차단
    handleEditEvent(event);
  }}
  sx={{
    ...eventBoxStyles.common,
    opacity: draggedEvent?.id === event.id ? 0.3 : 1,
    cursor: 'grab',
    '&:active': { cursor: 'grabbing' },
  }}
>
  {/* 일정 내용 */}
</Box>
```

### C. 날짜 셀 수정 예시

```typescript
<TableCell
  onDragOver={(e) => handleDragOver(e, dateString)}
  onDrop={(e) => handleDrop(e, dateString)}
  onClick={() => handleDateCellClick(dateString)}
  sx={{
    backgroundColor: dragOverDate === dateString ? '#e3f2fd' : 'transparent',
    border: dragOverDate === dateString && hasOverlap ? '2px solid #f44336' : '1px solid #e0e0e0',
  }}
>
  {/* 날짜 및 일정 렌더링 */}
</TableCell>
```

---

## 명세서 버전

- **버전**: 2.0 (명세서 통합 및 정리)
- **작성일**: 2025-11-03
- **최종 업데이트**: 2025-11-04
- **작성자**: Claude (spec-writer agent)
- **변경 이력**:
  - v1.0: 초안 작성
  - v1.1: 버그 수정 사항 추가
  - v1.2: 버그 내역 정리
  - v1.3: 반복 일정 드래그 시 다이얼로그 제거, 자동 단일 변환
  - v2.0: 버그 관련 별도 섹션 제거, 주요 기능 명세에 통합 및 상세화
