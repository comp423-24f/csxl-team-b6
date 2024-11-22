# Technical Specification Document - SP01

## I. Descriptions

Our feature is purely a front-end concern. There was no modification to the existing API routes. The changes we made enhance the UI for interacting with the same operating hours API routes.

### API Route: `/api/coworking/operating_hours`

```json
[
  {
    "id": 1,
    "start": "2024-11-20T10:00:00",
    "end": "2024-11-20T20:00:00"
  },
  {
    "id": 2,
    "start": "2024-11-21T10:00:00",
    "end": "2024-11-21T20:00:00"
  }
]
```

#### Query Parameters:

- `start` (optional): Start date and time
- `end` (optional): End date and time

#### Usage in the Feature:

In our feature, this endpoint is used to fetch the operating hours from the db to show them in the admin panel. The query parameters `start` and `end` filter the operating hours within a specific date range.

## II. Model Representation

We are relying on the existing entity format for open hours:

- **id** - Unique identifier for the set of hours.
- **start** - Coworking open time, stored as a `dateTime`.
- **end** - Coworking close time, stored as `dateTime`.

This entity has all the necessary information to view open hours.

```json
{
  "id": 1,
  "start": "2024-11-21T10:00:00",
  "end": "2024-11-21T20:00:00"
}
```

The database schema for operating hours includes:

- `id` (Primary Key)
- `start` (DateTime)
- `end` (DateTime)

## III. Design Decisions

### UX

We chose to use a start and end time dropdown list over having chips for each day of the week because the old design has logical issues when selecting a date range. This new design ensures users select a valid date range and seperate time interval, even if it may take longer to input into then the chips.

### Technical

We decided to fetch operating hours once during component creation and when new hours are added. This reduces the number of API calls versus fetching periodically. It's probably rare that multiple people add hours at the same time, so we think the trade-off is worth it.

## IV. Development Concerns

- `frontend/src/app/coworking/coworking-admin/coworking-admin.component.ts`: Contains the logic for parsing user input into operating hours and calls injected coworking service for fetching/adding operating hours.
- `frontend/src/app/coworking/coworking.service.ts`: Service file uses Angular HTTP client to interact with the backend API, fetching and adding open hours.
- `frontend/src/app/coworking/coworking-admin/coworking-admin.component.html`: Defines the UI structure for the admin panel.
- `frontend/src/app/coworking/coworking-admin/coworking-admin.component.css`: Defines a few custom styles we added.
