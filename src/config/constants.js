// Video and File Configuration
export const VIDEO_CONFIG = {
  MAX_VIEWS_PER_WEEK: 20,
  VIEW_LIMIT_DAYS: 7,
  FILE_ACCESS_WEEKS: 2,
  BYTES_TO_MB_DIVISOR: 1024 * 1024,
  PERCENTAGE_DECIMAL_PLACES: 2,
};

// URL Configuration
export const API_URLS = {
  BUNNY_CDN: {
    BASE_URL: 'https://video.bunnycdn.com/library/359657/videos/',
    // NOTE: API key should be moved to backend - security issue
    ACCESS_KEY: "a12e0bb1-1753-422b-8592a11c9c61-605b-46a8",
  },
  LAMBDA_URL: 'https://mmdgrbvftfhtczhavnl7ec4zqe0stxcq.lambda-url.ap-south-1.on.aws/',
  VIGNAM_SIMULATION: 'https://app.vignamlabs.com/openSimulation/SIM-4e8c7a62-b9f3-4c71-a9d5-61c4f8d72e45?def_token=INST-5ccefcb8-1294-4adc-9975-a18b3c0b7c8d',
};

// Time Constants (in milliseconds)
export const TIME_CONSTANTS = {
  WEEK_IN_MS: 7 * 24 * 60 * 60 * 1000,
  TWO_WEEKS_IN_MS: 14 * 24 * 60 * 60 * 1000,
  DAY_IN_MS: 24 * 60 * 60 * 1000,
};

// UI Colors
export const COLORS = {
  PRIMARY: "#f97316",
  PDF_ICON: "#dc3545",
  VIDEO_ICON: "#FF9800",
  SUCCESS: "#22c55e",
  ERROR: "#dc2626",
  GRAY_LIGHT: "#e2e8f0",
  GRAY_DARK: "#2d3748",
  GRAY_BORDER: "#e2e8f0",
};

// UI Spacing and Sizing
export const UI_CONSTANTS = {
  BORDER_RADIUS_MEDIUM: "12px",
  BORDER_RADIUS_SMALL: "8px",
  PADDING_MEDIUM: "12px",
  PADDING_LARGE: "24px",
  PADDING_SMALL: "6px",
  ICON_SIZE: 24,
  STROKE_WIDTH: "2",
  TRANSITION_FAST: "all 0.2s",
  TRANSITION_EASE: "all 0.2s ease",
  TEXT_UNDERLINE_OFFSET: "2px",
  BORDER_WIDTH: "1px",
  BOX_SHADOW_LIGHT: "0 1px 2px rgba(0, 0, 0, 0.05)",
};

// File Types
export const FILE_TYPES = {
  PDF: 'pdf',
  VIDEO: 'video',
};

// Sort Orders
export const SORT_ORDERS = {
  ASC: 'asc',
  DESC: 'desc',
};

// Database Collections
export const DB_COLLECTIONS = {
  VIDEO_ACCESS_GRANTED: 'VideoAccessGranted',
  STUDENTS: 'students',
  EXAMS: 'exams',
};

// Navigation Routes
export const ROUTES = {
  STUDENTS: '/students',
  EXAMS: '/exams',
  EXAM_INTERFACE: '/exam-interface',
};

// SVG ViewBox
export const SVG_CONSTANTS = {
  VIEWBOX_24: "0 0 24 24",
  PLUS_ICON_PATH: "M12 5v14M5 12h14",
};