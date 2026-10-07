# 4eme-TP-ProcessusUnifies

# Campus Carpooling: Unified Process Exercise

*Covoiturage universitaire: Processus Unifié (UP)*

---

## 1. Vision

- **Problem:** Students commute to campus in cars that run half empty, while others pay for expensive or unreliable transport. Coordination happens in chaotic Facebook or WhatsApp groups with no trust and no guarantees.
- **Users:** Students acting as drivers or passengers, and a university administrator who moderates.
- **Solution:** A platform where verified students publish rides, search for matching routes and schedules, book a seat, and split the cost.
- **Value:** Lower transport costs, fewer cars on the road, and more trust, since only verified university members can join.
- **Scope:** One university, one-off and recurring rides, seat booking with online cost-sharing.

### Actors

| Actor | Type | Role |
|---|---|---|
| **Passenger** | Primary | Searches for rides, books seats, pays |
| **Driver** | Primary | Publishes rides, receives payment |
| **Student** | Generalization | Parent of Passenger and Driver (registration, profile) |
| **Administrator** | Primary | Moderates reports and accounts |
| **Payment gateway** | Secondary (called by the system) | Processes payments and refunds |
| **Notification service** | Secondary (called by the system) | Sends email, SMS or push messages |

---

## 2. Use Cases

| ID | Use case | Technical risk |
|---|---|---|
| UC1 | Register and verify student status (university email) | Medium |
| UC2 | Publish a ride (route, time, seats, price) | Low |
| UC3 | Search for and book a seat | **High:** two passengers booking the last seat |
| UC4 | Pay and share the cost (with refund on cancellation) | **High:** external gateway, double charges, refunds |
| UC5 | Receive notifications (booking confirmed, ride cancelled, reminder) | **Medium-high:** asynchronous delivery, retries |
| UC6 | Rate users and moderate reports (admin) | Low |

Six use cases, three of them carrying technical risk.

---

## 3. Prioritization

Each use case is scored from 1 to 5 on three criteria:

- **Business value:** does the system make sense without it?
- **Risk:** technical or functional uncertainty.
- **Architecture impact:** does it force structural choices (database, locking, external APIs)?

| UC | Business value | Risk | Architecture impact | Total | Rank |
|---|---|---|---|---|---|
| UC3 Book a seat | 5 | 5 | 5 | **15** | 1 |
| UC4 Pay | 4 | 5 | 4 | **13** | 2 |
| UC2 Publish a ride | 5 | 2 | 4 | **11** | 3 |
| UC1 Register / verify | 4 | 3 | 4 | **11** | 3 |
| UC5 Notifications | 3 | 4 | 4 | **11** | 3 |
| UC6 Rate / moderate | 2 | 1 | 2 | **5** | 6 |

### Justification

- **UC3** is the heart of the product and forces the key architectural choices: transactions, locking, and how seats are modeled.
- **UC4** brings in an external dependency and money, so errors are costly.
- **UC2, UC1 and UC5** are tied. UC2 and UC1 are prerequisites for UC3 (no rides and no identity means nothing to book), so minimal versions are built early.
- **UC6** is useful but the system works without it.

**Treat first:** UC3 and UC4, plus minimal versions of UC1 and UC2 as enablers.

---

## 4. Planning: 3 Iterations and the 4 UP Phases

| Iteration | Phase | Content | Milestone |
|---|---|---|---|
| **Pre-iteration** | Inception | Vision, actors, UC list, risk list, prioritization, rough plan | **LCO:** scope and vision validated |
| **Iteration 1** | Elaboration | Architecture (database, API, authentication). UC1 minimal (university-email signup). UC2 basic. **UC3 with atomic seat reservation** (transaction or row lock, tested with concurrent requests). **UC4 prototype** against the gateway's test mode. | **LCA:** architecture stable, top 2 risks retired |
| **Iteration 2 ** | Construction | UC4 complete (payment confirmation, failure handling, refund on cancellation). UC5 (asynchronous notification queue with retries). UC1 and UC2 completed (recurring rides, profile). | **IOC:** beta, all core UCs working |
| **Iteration 3** | Transition | UC6, user testing with real students, bug fixes, deployment, documentation, admin training | **PD:** final release |

**Why this order works:** the two biggest risks, overbooking and payment, are tackled in iteration 1 and finished in iteration 2. If either causes trouble, you find out around week 4, not week 9.

---

## 5. The Four Milestones Explained

Each milestone marks the end of a UP phase and is a checkpoint where the team and stakeholders decide whether the project is ready to move on.

| Milestone | Full name | Ends phase | The question it answers |
|---|---|---|---|
| **LCO** | Life Cycle Objectives (*objectifs du cycle de vie*) | Inception | Is this project worth doing, and is the scope clear? |
| **LCA** | Life Cycle Architecture (*architecture du cycle de vie*) | Elaboration | Does the architecture hold up, and have the major risks been resolved? |
| **IOC** | Initial Operational Capability (*capacité opérationnelle initiale*) | Construction | Is the system complete enough to be tested by real users (beta)? |
| **PD** | Product Release (*livraison du produit*) | Transition | Is the product ready to be delivered and used for real? |

*Some course materials write the last one as **PR** (Product Release). Use whichever abbreviation your instructor uses.*

### What to show at each milestone in this project

- **LCO:** the vision, the actor list, the UC list, the risk list, and a rough plan. Nothing is built yet.
- **LCA:** a working skeleton where the risky parts are proven. Seat booking handles two simultaneous requests correctly, and a payment works against the gateway's test mode.
- **IOC:** all core UCs work end to end (book, pay, notify), even if some details are rough.
- **PD:** tested with real students, bugs fixed, deployed, and documented.

The most important one is **LCA**. If the architecture and the riskiest UCs are validated there, the rest of the project is much safer, which is why UC3 and UC4 sit in iteration 1.

---

## 6. Risk Table

| Risk | Mitigation |
|---|---|
| Two passengers book the last seat | Atomic update or database lock, plus a concurrency test in iteration 1 |
| Payment succeeds but booking fails, or double charge | Payment tied to booking status, idempotency keys, clear rollback flow |
| Notification not delivered | Message queue with retries, fallback channel |
| Fake accounts or unsafe rides | University-email verification, ratings, report button |

---

## 7. Other System Ideas (alternatives)

| System | Technical-risk use case |
|---|---|
| Sports court booking (padel, football) | Booking conflicts, payment |
| Medical appointment booking | Slot conflicts, SMS reminders |
| Room booking (university, coworking) | Conflicts, recurring reservations |
| Food ordering / click & collect | Online payment, status notifications |
| Event ticketing | High concurrency on the last tickets, payment |
| Online library | Book reservation, overdue alerts |
| Bike / scooter rental | Payment, real-time availability |