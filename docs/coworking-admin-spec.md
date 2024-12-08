# Technical Specification Document

## Authors

- [Krish Patel](https://github.com/krishpatelunc)
- [Milan Dutta](https://github.com/duttamilan1)
- [Vishaan Saxena](https://github.com/VSaxena111)
- [Kensho Pilkey](https://github.com/kensho-pilkey)

## Feature Overview

This feature provides a management interface for the CXSL’s coworking space operating hours. Admins can add, edit, and delete future hours, as well as view and page through both upcoming and historical hours.

## API and Data Representations

### Relevant API Routes

All routes below are defined in `backend/api/coworking/operating_hours.py` and return JSON data.  
They rely on database functions in `backend/services/coworking/operating_hours.py`.

| Route                                  | Method | Params                                      | Description                                    |
| -------------------------------------- | ------ | ------------------------------------------- | ---------------------------------------------- |
| `/api/coworking/operating_hours`       | GET    | `start`, `end` (optional)                   | Fetches hours in a date range.                 |
| `/api/coworking/operating_hours`       | POST   | OperatingHours JSON body                    | Creates new hours, fails if conflicting.       |
| `/api/coworking/operating_hours`       | PUT    | OperatingHours JSON body                    | Edits existing hours, fails if conflicting.    |
| `/api/coworking/operating_hours/{id}`  | DELETE | Path param `id`                             | Deletes a future operating hours entry.        |
| `/api/coworking/operating_hours/page`  | GET    | `start_date`, `page`, `page_size`, `future` | Fetch page of future or historical hours.      |
| `/api/coworking/operating_hours/count` | GET    | `start_date`, `future`                      | Returns count of future or historical entries. |

### Data Model

The `OperatingHours` model is the same:

```json
{
  "id": 1,
  "start": "2024-12-08T10:00:00",
  "end": "2024-12-08T20:00:00"
}
```

**Schema (`operating_hours` table):**

- **`id`**: `int`, Primary Key
- **`start`**: `DateTime`, indexed
- **`end`**: `DateTime`, indexed

## Design Choices

**UX Choice:**  
We chose a date range selector with start and end time inputs instead of chips for selecting days of the week. The old approach had logical issues and it wasn’t clear how to handle conflicts between the date range and day selection. The trade-off is that our current approach takes more steps when scheduling recurring days like Monday to Friday for a month.

**Technical Choice:**  
We decided to use server-side pagination and counting endpoints instead of fetching all data and filtering it client-side. While fetching everything at once would simplify database queries and API parameters, it would slow down table loading as the data grows. Handling paging server-side scales better, especially since most admins won’t need to access all the data very often.

## Development Concerns

Files you should look at:

**Backend:**

- `backend/api/coworking/operating_hours.py`: Defines FastAPI endpoints for CRUD on operating hours.
- `backend/services/coworking/operating_hours.py`: DB service functions for CRUD (reading based on page or time range, create, edit, delete, count).
- `backend/test/services/coworking/operating_hours_test.py`: Unit tests for DB service functions

**Frontend:**

- `frontend/src/app/coworking/coworking-admin/coworking-admin.component.ts`: Main admin panel logic, talks to the `CoworkingService` to get API data.
- `frontend/src/app/coworking/coworking-admin/coworking-admin.component.html`: Layout for admin panel with date/time pickers, table, and add/edit/delete controls.
- `frontend/src/app/coworking/coworking.service.ts`: Handles making API requests for component to fetch, create, edit, and delete hours.
- `frontend/src/app/coworking/widgets/edit-operating-hours-dialog`: Dialog widget for editing a single hours row.
