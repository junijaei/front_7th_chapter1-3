/**
 * 캘린더 이벤트 박스 스타일 상수
 */
export const eventBoxStyles = {
  notified: {
    backgroundColor: '#ffebee',
    fontWeight: 'bold',
    color: '#d32f2f',
  },
  normal: {
    backgroundColor: '#f5f5f5',
    fontWeight: 'normal',
    color: 'inherit',
  },
  common: {
    p: 0.5,
    my: 0.5,
    borderRadius: 1,
    minHeight: '18px',
    width: '100%',
    overflow: 'hidden',
  },
} as const;

/**
 * 캘린더 셀 스타일 상수
 */
export const calendarCellStyles = {
  height: '120px',
  width: '14.28%', // 7일 = 100% / 7
  padding: 1,
  border: '1px solid #e0e0e0',
  verticalAlign: 'top' as const,
  overflow: 'hidden',
  cursor: 'pointer',
  transition: 'background-color 0.2s',
} as const;
