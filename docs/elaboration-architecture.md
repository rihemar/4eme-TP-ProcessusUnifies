# Elaboration: Baseline Architecture (I1, milestone M1.2)

Goal of this baseline: **one end-to-end route that runs** for the riskiest use case,
**UC3 – Book a seat**, going through every layer (UI → controller → service → data access → database),
with **an automated test that passes in CI**.

The code in `backend/` and `frontend/` is derived directly from the three diagrams below:
every box and every class name here exists in the code with the same name.

---

## 1. Logical architecture (layers)

```mermaid
flowchart LR
    subgraph FE["frontend (Angular)"]
        RL["RideListComponent"]
        RS["RideApiService<br/>(HttpClient)"]
        RL --> RS
    end

    subgraph BE["backend (NestJS)"]
        direction LR
        subgraph P["Presentation"]
            RC["RidesController<br/>GET /rides"]
            BC["BookingsController<br/>POST /rides/:rideId/bookings"]
        end
        subgraph B["Business"]
            RSV["RidesService"]
            BSV["BookingsService<br/>bookSeat()"]
        end
        subgraph D["Data access (TypeORM)"]
            RR["Repository#lt;Ride#gt;"]
            BR["Repository#lt;Booking#gt;"]
            SR["Repository#lt;Student#gt;"]
        end
        RC --> RSV --> RR
        BC --> BSV --> RR
        BSV --> BR
        BSV --> SR
    end

    DB[("SQLite<br/>(PostgreSQL in production)")]

    RS -- "HTTP / JSON" --> RC
    RS -- "HTTP / JSON" --> BC
    RR --> DB
    BR --> DB
    SR --> DB
```

| Layer | Responsibility | Rule |
|---|---|---|
| Presentation (controllers) | HTTP: routes, validation, status codes | No business logic |
| Business (services) | Use-case rules: "a seat can be booked only if one is left" | No HTTP, no SQL strings outside the transaction |
| Data access (repositories / entities) | Persistence through TypeORM | Only layer that talks to the database |

---

## 2. Domain model (class diagram)

Implemented in this baseline: `Student`, `Ride`, `Booking`.
Designed now, built later (I2 and I3, per the plan): `Payment`, `Rating`, `Report`.

```mermaid
classDiagram
    direction LR

    class Student {
        +number id
        +string email
        +string fullName
        +boolean verified
    }

    class Ride {
        +number id
        +string origin
        +string destination
        +Date departureAt
        +number totalSeats
        +number seatsAvailable
        +number pricePerSeat
    }

    class Booking {
        +number id
        +BookingStatus status
        +Date createdAt
    }

    class BookingStatus {
        <<enumeration>>
        CONFIRMED
        CANCELLED
    }

    class Payment {
        <<I2 - planned>>
        +number amount
        +string gatewayRef
        +string idempotencyKey
        +PaymentStatus status
    }

    class Rating {
        <<I3 - planned>>
        +number score
        +string comment
    }

    class Report {
        <<I3 - planned>>
        +string reason
        +string status
    }

    Student "1" --> "0..*" Ride : drives
    Student "1" --> "0..*" Booking : passenger
    Ride "1" --> "0..*" Booking : has
    Booking --> BookingStatus
    Booking "1" --> "0..1" Payment : paid by
    Student "1" --> "0..*" Rating : gives
    Student "1" --> "0..*" Report : files
```

**Invariant (the UC3 risk):** `0 <= Ride.seatsAvailable <= Ride.totalSeats`, and the number of
`CONFIRMED` bookings of a ride is `totalSeats - seatsAvailable`. A passenger cannot book the same ride twice
(unique constraint on `(rideId, passengerId)`).

---

## 3. UC3 – Book a seat (sequence diagram)

The overbooking risk is removed by a **conditional, atomic update**: the database decrements the counter
only if a seat is still free, and tells us how many rows it changed. Two passengers racing for the last
seat cannot both get `1 row affected`.

```mermaid
sequenceDiagram
    actor P as Passenger
    participant UI as RideListComponent
    participant API as RideApiService
    participant C as BookingsController
    participant S as BookingsService
    participant DB as Database

    P->>UI: click "Book"
    UI->>API: book(rideId, passengerId)
    API->>C: POST /rides/{rideId}/bookings {passengerId}
    C->>S: bookSeat(rideId, passengerId)
    S->>DB: BEGIN TRANSACTION
    S->>DB: SELECT student / ride (exist?)
    S->>DB: UPDATE ride SET seatsAvailable = seatsAvailable - 1<br/>WHERE id = :rideId AND seatsAvailable > 0
    alt 1 row affected (a seat was free)
        S->>DB: INSERT booking (CONFIRMED)
        S->>DB: COMMIT
        S-->>C: Booking
        C-->>API: 201 Created + booking
        API-->>UI: booking
        UI-->>P: "Seat booked"
    else 0 rows affected (ride full)
        S->>DB: ROLLBACK
        S-->>C: throw ConflictException
        C-->>API: 409 Conflict "No seat left"
        API-->>UI: error
        UI-->>P: "Ride is full"
    end
```

Other error cases: unknown ride or student → `404`; same passenger books twice → `409`.

---

## 4. Traceability: diagram → code

| Diagram element | File |
|---|---|
| `RidesController`, `BookingsController` | `backend/src/rides/rides.controller.ts`, `backend/src/bookings/bookings.controller.ts` |
| `RidesService`, `BookingsService.bookSeat()` | `backend/src/rides/rides.service.ts`, `backend/src/bookings/bookings.service.ts` |
| `Student`, `Ride`, `Booking`, `BookingStatus` | `backend/src/**/*.entity.ts` |
| Atomic update (sequence diagram) | `BookingsService.bookSeat()` |
| `RideListComponent`, `RideApiService` | `frontend/src/app/ride-list/`, `frontend/src/app/ride-api.service.ts` |
| Test of the risk (M1.2 criterion) | `backend/test/bookings.e2e-spec.ts` |
| CI | `.github/workflows/ci.yml` |
