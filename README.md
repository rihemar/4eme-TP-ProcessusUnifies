# 4eme-TP-ProcessusUnifies

## Campus Carpooling:

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
![use case diagram](use_case_diagram_2.png)
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

 
## 4. Planning: 3 Iterations Placed Across the 4 UP Phases
 
In UP, a **phase** is a stretch of the project that contains one or more **iterations**. Each iteration is a mini-project with its own planning, analysis, design, implementation and testing, and ends with an executable increment.
 
| Phase | Iterations | Weeks | Content | Milestone |
|---|---|---|---|---|
| **Inception** | Pre-iteration (I0) | 1 | Vision, actors, UC list, risk list, prioritization, rough plan | **LCO:** scope and vision validated |
| **Elaboration** | **I1** | 2-4 | Architecture (database, API, authentication). UC1 minimal (university-email signup). UC2 basic. **UC3 with atomic seat reservation** (transaction or row lock, tested with concurrent requests). **UC4 prototype** against the gateway's test mode. | **LCA:** architecture stable, top 2 risks retired |
| **Construction** | **I2** | 5-6 | UC4 complete (payment confirmation, failure handling, refund on cancellation). UC5 (asynchronous notification queue with retries). | End of I2: risky UCs complete (internal milestone) |
| | **I3** | 7-8 | UC1 and UC2 completed (recurring rides, profile). UC6 (ratings, report moderation). Integration and system tests. | **IOC:** beta, all core UCs working |
| **Transition** | Short final stretch (T) | 9 | User testing with real students, bug fixes, deployment, documentation, admin training | **PD:** final release |
 
### How to read this
 
- **Inception** is the pre-iteration, and **Transition** is a short final stretch. Neither counts as one of the 3 development iterations.
- **Elaboration** is I1 alone, because one iteration is enough to retire the two biggest risks.
- **Construction** is built by two iterations, I2 and I3, and each ends with a working, tested increment. Here several iterations produce one phase.
- Phase milestones (LCO, LCA, IOC, PD) fall at the end of phases. Iterations end with an executable increment, which is not necessarily a phase milestone.
**Why this order works:** the two biggest risks, overbooking (UC3) and payment (UC4), are tackled in I1 and finished in I2. If either causes trouble, you find out around week 4, not week 9. UC6 sits in I3 because it is low risk and fits Construction rather than Transition.
 
---
 