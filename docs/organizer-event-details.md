# Organizer — Event Description & Details (Issue #16)

## User Story
As an **organizer**, I want to provide event details (title, description, date/time, location) so that students understand the event before registering.

## Acceptance Criteria
- [ ] Organizer can input **title**
- [ ] Organizer can input **description**
- [ ] Organizer can select **date & time**
- [ ] Organizer can input **location**

## Field/Validation Notes
- Title: required, 3–120 chars
- Description: optional, up to 2000 chars
- Date/Time: required, must be in the future
- Location: required (free text for now)

## Example Event Object (for later)
```json
{
  "title": "Career Fair",
  "description": "Meet employers and learn about internships.",
  "startDateTime": "2025-10-05T14:00",
  "location": "Hall Building Atrium"
}
