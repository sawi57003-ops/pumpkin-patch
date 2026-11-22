# Pumpkin Patch — Kiro Spec: Requirements

## Introduction
Pumpkin Patch is a habit garden for the Kiroween 2026 hackathon (Costume Contest category). Instead of a boring checklist, each habit is a plant in a haunted garden. Daily check-ins make it grow through five visual stages (seed → sprout → vine → pumpkin → jack-o'-lantern). Miss days and it wilts, then dies and joins the Graveyard as a tombstone with an epitaph. The whole garden lives in the browser (localStorage, no account, no backend) and is deployed as a static site.

## Glossary
- **Habit / Plant**: a habit the user plants. One habit = one plant.
- **Check-in**: marking a habit done for the current day.
- **Streak**: consecutive days checked in.
- **Growth stage**: visual state of a plant, driven by streak length.
- **Harvest**: completing 7 consecutive days; yields one pumpkin and resets the plant to seed (or continues to Golden Pumpkin at 30 days).
- **Wilt**: state after missing one day (grace day).
- **Graveyard**: where dead habits go, shown as tombstones with auto-generated epitaphs.
- **Moon phase**: a garden-wide meter driven by this week's completion rate.

## Requirements

### Requirement 1: Plant habits
**User Story:** As a user, I want to plant a habit with a name, so it appears as a seed in my garden.
#### Acceptance Criteria
1. WHEN the user submits a habit name THEN the system SHALL create a plant in stage "seed" with streak 0 and store it in localStorage.
2. WHEN the user adds a habit with an empty name THEN the system SHALL reject it with an inline message.
3. WHEN the page loads THEN the system SHALL restore all plants from localStorage.

### Requirement 2: Daily check-in and growth
**User Story:** As a user, I want to check in a habit once per day, so my plant grows.
#### Acceptance Criteria
1. WHEN the user checks in a habit THEN the system SHALL record today's date, increment the streak by 1, and advance the growth stage.
2. WHEN a habit is already checked in today THEN the system SHALL show it as done and disable further check-ins for that habit today.
3. WHEN the streak reaches 2 THEN the stage SHALL be "sprout"; 4 → "vine"; 6 → "pumpkin"; 7 → "jack-o'-lantern" (harvest-ready).
4. WHEN the user checks in THEN the system SHALL play a small growth animation and update the garden stats.

### Requirement 3: Harvest
**User Story:** As a user, I want to harvest a full-grown plant, so I earn a pumpkin and can start a new cycle.
#### Acceptance Criteria
1. WHEN a plant reaches streak 7 THEN the system SHALL mark it harvest-ready and show a Harvest button.
2. WHEN the user harvests THEN the system SHALL increment the total pumpkin count, reset the plant to seed with streak 0, and log the harvest.
3. WHEN a plant reaches streak 30 without harvest THEN the system SHALL mark it a Golden Pumpkin (rare, kept as a trophy).

### Requirement 4: Wilt and death
**User Story:** As a user, I want missed days to have consequences, so the garden feels alive.
#### Acceptance Criteria
1. WHEN a plant misses one day THEN the system SHALL mark it wilted on next load (visual wilt state, streak kept).
2. WHEN a plant misses two consecutive days THEN the system SHALL mark it dead, move it to the Graveyard with an auto-generated epitaph, and reset its streak.
3. WHEN a user revives a tombstone THEN the system SHALL replant it as a seed (tombstone remains in the Graveyard history).

### Requirement 5: Garden mood (moon phase + ghost)
**User Story:** As a user, I want the garden to react to my consistency, so it feels alive.
#### Acceptance Criteria
1. WHEN the week's completion rate changes THEN the system SHALL update the moon phase (new → crescent → half → gibbous → full).
2. WHEN the user checks in THEN the ghost companion SHALL show a happy state; WHEN a plant dies THEN the ghost SHALL show a sad state.
3. WHEN the page loads THEN the system SHALL show one random "haunt" (a spooky motivational line).

### Requirement 6: Stats and persistence
**User Story:** As a user, I want my progress saved, so I never lose my garden.
#### Acceptance Criteria
1. WHEN any state changes THEN the system SHALL persist the full garden to localStorage immediately.
2. WHEN the page loads THEN the system SHALL show total pumpkins harvested, current best streak, and active plant count.
3. WHEN the user has no plants THEN the system SHALL show an empty-garden onboarding message.

### Requirement 7: Offline static deployment
**User Story:** As a user, I want the app to load fast anywhere, so it works as a static site.
#### Acceptance Criteria
1. WHEN the app is served as static files THEN the system SHALL work with no backend and no build step.
2. WHEN the app loads THEN the system SHALL NOT require any network call for core functionality (fonts may fall back to system fonts).
