# CLAUDE.md

ALWAYS RESPOND IN KOREAN

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Running the Application
- `pnpm dev` - Run development server with both backend and frontend (concurrently)
- `pnpm start` - Run frontend only (Vite dev server)
- `pnpm server` - Run backend server only
- `pnpm server:watch` - Run backend with auto-reload

### Testing
- `pnpm test` - Run tests in watch mode (Vitest)
- `pnpm test:ui` - Run tests with UI dashboard
- `pnpm test:coverage` - Generate coverage reports (outputs to `./.coverage`)

### Build and Linting
- `pnpm build` - Type check and build production bundle
- `pnpm lint` - Run both ESLint and TypeScript checks
- `pnpm lint:eslint` - Run ESLint only
- `pnpm lint:tsc` - Run TypeScript type checking only

## Architecture Overview

### Application Type
React-based calendar/event management application with recurring events support, drag-and-drop functionality, and notification system.

### Core Data Flow

**Event Operations:**
- `useEventOperations` - Main hook for CRUD operations on single events
- `useRecurringEventOperations` - Specialized hook for recurring event series management
- Events are persisted via REST API to Express server (server.js)
- Server uses JSON file as database (realEvents.json for dev, e2e.json for testing)

**Recurring Event Architecture:**
Events with `repeat.type !== 'none'` are part of recurring series. The system supports two approaches:
1. **repeatId-based**: Server-assigned UUID (repeat.id) groups recurring events for bulk operations
2. **Pattern-matching**: Fallback that identifies series by matching event properties (title, time, interval)

When editing/deleting recurring events:
- User chooses between "single event" or "entire series"
- Series operations use `repeat.id` when available, otherwise fall back to pattern matching
- Single edits convert recurring event to non-recurring (`repeat.type = 'none'`)

### Key Hooks Structure

- `useEventForm` - Form state management and validation
- `useCalendarView` - Calendar navigation, view switching (week/month), holiday fetching
- `useNotifications` - Notification system based on event notificationTime
- `useSearch` - Event filtering by search term

### API Endpoints (server.js)

**Single Event Operations:**
- GET `/api/events` - Fetch all events
- POST `/api/events` - Create single event
- PUT `/api/events/:id` - Update single event
- DELETE `/api/events/:id` - Delete single event

**Bulk Operations:**
- POST `/api/events-list` - Create multiple events (recurring series creation)
- PUT `/api/events-list` - Bulk update events
- DELETE `/api/events-list` - Bulk delete by event IDs

**Recurring Series Operations:**
- PUT `/api/recurring-events/:repeatId` - Update entire recurring series
- DELETE `/api/recurring-events/:repeatId` - Delete entire recurring series

### Testing Strategy

Tests are organized by complexity and type:
- `src/__tests__/unit/easy.*` - Simple utility function tests
- `src/__tests__/hooks/easy.*`, `medium.*` - Hook testing with increasing complexity
- `src/__tests__/integration/` - Integration tests for workflows
- `src/__tests__/regression/` - Regression tests for bug fixes
- `src/__tests__/edge-cases/` - Edge case scenarios

### Event Overlap Detection

`findOverlappingEvents()` in `src/utils/eventOverlap.ts` checks for time conflicts. Overlap warning dialog appears on save, but users can proceed anyway.

### MSW for Testing

Mock Service Worker (MSW) is configured in `src/__mocks__/handlers.ts` for API mocking during tests. The handlers mirror server.js endpoints.

## Important Implementation Notes

### Recurring Event Editing
When `handleRecurringEdit` is called:
- If `editSingleOnly=true`: Converts to non-recurring event (`repeat.type = 'none'`)
- If `editSingleOnly=false`: Updates all events in series (prefers repeatId API, falls back to individual updates)

### Recurring Event Generation
`generateRepeatEvents()` generates event instances up to `repeat.endDate` or '2025-12-30' default. Handles edge cases like February 29 (yearly repeats every 4 years) and month-end dates.

### Notification System
`useNotifications` hook checks event times against current time. Events within their `notificationTime` window are marked as notified and displayed with red styling and notification icon.

### Environment-Specific Database
Server uses `TEST_ENV` environment variable to switch between `realEvents.json` (dev) and `e2e.json` (E2E tests).
