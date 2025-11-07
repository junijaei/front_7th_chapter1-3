# 테스트 파일 구조 정리

## 정리 원칙

### 1. Prefix 제거
- `easy.*`, `medium.*` 등 과제용 난이도 prefix 완전 제거
- 테스트 대상을 명확히 알 수 있는 이름만 유지

### 2. 명확한 네이밍 규칙
- 파일명: `테스트대상.spec.ts(x)`
- 테스트 대상이 즉시 식별 가능하도록 명명

### 3. 디렉토리 구조
```
src/__tests__/
├── unit/              # 단위 테스트 (utils, helpers)
├── hooks/             # React 커스텀 훅 테스트
├── components/        # 컴포넌트 테스트
├── integration/       # 통합 테스트
├── e2e/               # E2E 테스트
├── edge-cases/        # 엣지 케이스 테스트
└── regression/        # 회귀 테스트
```

## 변경 사항

### Unit Tests (단위 테스트)
| 변경 전 | 변경 후 |
|---------|---------|
| `easy.dateClickUtils.spec.ts` | `dateClickUtils.spec.ts` |
| `easy.dateUtils.spec.ts` | `dateUtils.spec.ts` |
| `easy.dragDropUtils.spec.ts` | `dragDropUtils.spec.ts` |
| `easy.eventOverlap.spec.ts` | `eventOverlap.spec.ts` |
| `easy.eventUtils.spec.ts` | `eventUtils.spec.ts` |
| `easy.fetchHolidays.spec.ts` | `fetchHolidays.spec.ts` |
| `easy.notificationUtils.spec.ts` | `notificationUtils.spec.ts` |
| `easy.timeValidation.spec.ts` | `timeValidation.spec.ts` |
| `generateRepeatEvents.spec.ts` | `generateRepeatEvents.spec.ts` *(유지)* |

**설명**: 유틸리티 함수와 헬퍼 함수들의 순수 로직 테스트

### Hooks Tests (훅 테스트)
| 변경 전 | 변경 후 |
|---------|---------|
| `easy.useCalendarView.spec.ts` | `useCalendarView.spec.ts` |
| `easy.useDateClick.spec.ts` | `useDateClick.spec.ts` |
| `easy.useSearch.spec.ts` | `useSearch.spec.ts` |
| `medium.useDragAndDrop.spec.ts` | `useDragAndDrop.spec.ts` |
| `medium.useEventForm.spec.ts` | `useEventForm.spec.ts` |
| `medium.useEventOperations.spec.ts` | `useEventOperations.spec.ts` |
| `medium.useNotifications.spec.ts` | `useNotifications.spec.ts` |
| `useRecurringEventOperations.spec.ts` | `useRecurringEventOperations.spec.ts` *(유지)* |

**설명**: React 커스텀 훅의 단위 테스트

### Components Tests (컴포넌트 테스트)
| 변경 전 | 변경 후 |
|---------|---------|
| `RecurringEventDialog.spec.tsx` | `RecurringEventDialog.spec.tsx` *(유지)* |

**설명**: React 컴포넌트의 렌더링 및 동작 테스트

### Integration Tests (통합 테스트)
| 변경 전 | 변경 후 |
|---------|---------|
| `medium.integration.spec.tsx` | `eventManagement.spec.tsx` |
| `recurringEventWorkflow.spec.tsx` | `recurringEventWorkflow.spec.tsx` *(유지)* |

**설명**: 여러 컴포넌트와 훅이 협력하는 워크플로우 테스트

### E2E Tests (E2E 테스트)
| 파일명 | 설명 |
|--------|------|
| `basic-event-management.spec.ts` | 기본 일정 CRUD 시나리오 |
| `drag-and-drop.spec.ts` | 드래그 앤 드롭 기능 *(신규 추가)* |
| `event-overlap.spec.ts` | 일정 겹침 경고 |
| `notification-system.spec.ts` | 알림 시스템 |
| `recurring-event-management.spec.ts` | 반복 일정 관리 |
| `search-filter.spec.ts` | 검색 및 필터링 |
| `visual-regression.spec.ts` | 시각적 회귀 테스트 |

**설명**: 실제 브라우저 환경에서 사용자 시나리오 검증

### Edge Cases Tests (엣지 케이스 테스트)
| 변경 전 | 변경 후 |
|---------|---------|
| `recurringEventEdgeCases.spec.tsx` | `recurringEvent.spec.tsx` |

**설명**: 특수한 상황과 경계 조건 테스트

### Regression Tests (회귀 테스트)
| 변경 전 | 변경 후 |
|---------|---------|
| `recurringEventRegression.spec.tsx` | `recurringEvent.spec.tsx` |

**설명**: 이전 버그 재발 방지 테스트

## 최종 디렉토리 구조

```
src/__tests__/
├── components/
│   └── RecurringEventDialog.spec.tsx
├── e2e/
│   ├── basic-event-management.spec.ts
│   ├── drag-and-drop.spec.ts           ← 신규 추가
│   ├── event-overlap.spec.ts
│   ├── notification-system.spec.ts
│   ├── recurring-event-management.spec.ts
│   ├── search-filter.spec.ts
│   └── visual-regression.spec.ts
├── edge-cases/
│   └── recurringEvent.spec.tsx
├── hooks/
│   ├── useCalendarView.spec.ts
│   ├── useDateClick.spec.ts
│   ├── useDragAndDrop.spec.ts
│   ├── useEventForm.spec.ts
│   ├── useEventOperations.spec.ts
│   ├── useNotifications.spec.ts
│   ├── useRecurringEventOperations.spec.ts
│   └── useSearch.spec.ts
├── integration/
│   ├── eventManagement.spec.tsx
│   └── recurringEventWorkflow.spec.tsx
├── regression/
│   └── recurringEvent.spec.tsx
└── unit/
    ├── dateClickUtils.spec.ts
    ├── dateUtils.spec.ts
    ├── dragDropUtils.spec.ts
    ├── eventOverlap.spec.ts
    ├── eventUtils.spec.ts
    ├── fetchHolidays.spec.ts
    ├── generateRepeatEvents.spec.ts
    ├── notificationUtils.spec.ts
    └── timeValidation.spec.ts
```

## 정리의 이점

1. **가독성 향상**: 파일명에서 즉시 테스트 대상 파악 가능
2. **일관성**: 모든 파일이 동일한 네이밍 규칙 따름
3. **유지보수성**: 과제용 prefix 제거로 실무 환경에 적합한 구조
4. **명확한 분류**: 디렉토리별로 테스트 유형이 명확히 구분됨
5. **확장성**: 새로운 테스트 추가 시 규칙을 쉽게 적용 가능

## 테스트 실행

모든 테스트는 기존 명령어로 동일하게 실행됩니다:

```bash
# 단위 테스트
pnpm test

# E2E 테스트
pnpm test:e2e

# 특정 테스트
pnpm test useDragAndDrop
pnpm exec playwright test drag-and-drop
```
