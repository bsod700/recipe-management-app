# Recipe Management App (מתכונים)

Android-only personal recipe app built with Expo SDK 54, strict TypeScript, and local SQLite persistence.  
The UI is Hebrew-first and RTL by default.

## Highlights

- Fully local app (no backend, no account system)
- Step-based preparation instructions (`01`, `02`, `03`, ...)
- Swipe-to-delete from the recipe list with confirmation dialog
- Optional recipe photos saved to app storage
- Clean Architecture layering:
  - `domain` -> `data` -> `application` -> `presentation`

## Tech Stack

- Expo SDK 54 (managed workflow)
- React Native 0.81 + React 19
- TypeScript (strict)
- SQLite via `expo-sqlite`
- Forms via `react-hook-form` + `zod`
- Styling via NativeWind v4
- Navigation via `@react-navigation/native-stack`

## Requirements

- Node.js 20+
- pnpm 10+
- Android device or emulator

## Quick Start

```bash
pnpm install
pnpm run android
```

If Metro is already running or UI direction looks stale:

```bash
pnpm run start -- --clear
```

## Available Scripts

- `pnpm run start` - start Expo dev server
- `pnpm run android` - run app on Android
- `pnpm run lint` - run ESLint
- `pnpm run typecheck` - run TypeScript checks (`--noEmit`)

## Project Structure

```text
src/
  domain/          # entities and validation schemas
  data/            # SQLite setup and repositories
  application/     # hooks/use-cases orchestration
  presentation/    # screens, components, navigation
  shared/          # theme, i18n, constants, utilities
App.tsx            # app bootstrap, RTL enforcement, navigation root
```

## Main Screens

- **List**: search, optimized FlatList, swipe-to-delete
- **Detail**: ingredients + numbered preparation steps
- **Edit**: dynamic ingredients and dynamic instruction steps, optional image, delete, dirty-form guards

## Data Model

Recipes are stored in a single SQLite table. Ingredients are serialized as JSON.

```sql
CREATE TABLE recipes (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  ingredients TEXT NOT NULL,
  instructions TEXT NOT NULL,
  image_uri TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
```

## RTL Notes

- RTL is enforced at startup (`I18nManager` + navigation direction).
- Text and inputs default to right alignment and RTL writing direction.
- If you still see LTR after changes, fully close Expo Go and relaunch from a clean Metro session.

## Performance and Accessibility

- 48dp minimum touch targets
- 16px base font size
- Debounced search (150ms)
- Memoized row components and tuned FlatList rendering
- Accessibility labels and roles on interactive elements
