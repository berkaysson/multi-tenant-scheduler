# Day.js Configuration for Turkey/Istanbul Timezone

This project uses Day.js configured with Turkey/Istanbul timezone (`Europe/Istanbul`) as the default timezone for the entire application.

## Installation

The following packages are installed:
- `dayjs` - Lightweight date library
- Day.js plugins for timezone support and additional functionality

## Configuration

The Day.js configuration is located in `src/lib/dayjs.ts` and includes:

### Plugins Loaded
- `utc` - UTC timezone support
- `timezone` - Timezone conversion support
- `customParseFormat` - Custom date format parsing
- `relativeTime` - Relative time formatting (e.g., "2 hours ago")
- `duration` - Duration handling
- `isSameOrAfter` - Date comparison utilities
- `isSameOrBefore` - Date comparison utilities
- `weekOfYear` - Week number calculations
- `advancedFormat` - Advanced formatting options

### Default Timezone
- **Timezone**: `Europe/Istanbul` (Turkey/Istanbul)
- **Default**: All date operations automatically use Turkey/Istanbul timezone

## Usage

### Import the configured Day.js instance

```typescript
import dayjs, { TURKEY_TIMEZONE } from '@/lib/dayjs';
```

### Basic Operations

```typescript
// Get current time in Turkey/Istanbul timezone (automatic)
const now = dayjs();

// Parse a date (automatically in Turkey/Istanbul timezone)
const parsedDate = dayjs('2024-01-15 10:30:00');

// Format date in Turkey/Istanbul timezone
const formatted = dayjs().format('DD/MM/YYYY HH:mm:ss');

// Convert UTC date to Turkey/Istanbul timezone
const fromUTC = dayjs.utc('2024-01-15T10:30:00Z').tz();

// Convert Turkey/Istanbul date to UTC
const toUTC = dayjs().utc();
```

### Date Boundaries

```typescript
// Get start/end of day in Turkey/Istanbul timezone
const startOfDay = dayjs().startOf('day');
const endOfDay = dayjs().endOf('day');

// Get start/end of week in Turkey/Istanbul timezone
const startOfWeek = dayjs().startOf('week');
const endOfWeek = dayjs().endOf('week');

// Get start/end of month in Turkey/Istanbul timezone
const startOfMonth = dayjs().startOf('month');
const endOfMonth = dayjs().endOf('month');
```

### Date Manipulation

```typescript
// Add time in Turkey/Istanbul timezone
const futureDate = dayjs().add(2, 'hours');
const nextWeek = dayjs().add(1, 'week');

// Subtract time in Turkey/Istanbul timezone
const pastDate = dayjs().subtract(1, 'day');
```

### Date Comparison

```typescript
// Check if date is same or after another date
const isAfter = dayjs(date1).isSameOrAfter(dayjs(date2), 'day');

// Check if date is same or before another date
const isBefore = dayjs(date1).isSameOrBefore(dayjs(date2), 'hour');

// Check if before
const isExpired = dayjs(date).isBefore(dayjs());
```

### Relative Time

```typescript
// Get relative time (e.g., "2 hours ago")
const relative = dayjs(date).fromNow();

// Get time until a future date
const timeUntil = dayjs(futureDate).toNow();
```

### Timezone Information

```typescript
// Get timezone offset in minutes
const offset = dayjs().utcOffset();

// Get timezone name
const timezoneName = dayjs().format('z');

// Get timezone abbreviation
const timezoneAbbr = dayjs().format('Z');
```

## Database Integration

### Prisma Schema
The Prisma schema has been updated to use `Europe/Istanbul` as the default timezone for organizations:

```prisma
model Organization {
  timezone String @default("Europe/Istanbul")
  // ... other fields
}
```

### Token Expiration
Token expiration times are now calculated using Turkey/Istanbul timezone:

```typescript
// Token expires in 1 hour from now (Turkey/Istanbul time)
const expires = dayjs().add(1, 'hour').toDate();
```

## Best Practices

1. **Always import from `@/lib/dayjs`** instead of directly from 'dayjs' package
2. **Timezone is automatic** - no need to specify Turkey/Istanbul explicitly
3. **Use standard dayjs methods** - all methods work automatically with configured timezone
4. **Convert to UTC for database storage** when needed using `.utc()`
5. **Use consistent formatting** throughout the application

## Migration

A database migration has been applied to update existing organizations to use `Europe/Istanbul` timezone by default.

## Example Usage

```typescript
import dayjs from '@/lib/dayjs';

// All operations automatically use Turkey/Istanbul timezone
const now = dayjs();
const formatted = dayjs().format('DD/MM/YYYY HH:mm:ss');
const expired = dayjs(token.expires).isBefore(dayjs());
const future = dayjs().add(1, 'hour').toDate();
```

- **Timezone**: Europe/Istanbul
- **UTC Offset**: +3 hours (UTC+3)
- **Daylight Saving**: Turkey does not observe daylight saving time
- **Abbreviation**: TRT (Turkey Time)
