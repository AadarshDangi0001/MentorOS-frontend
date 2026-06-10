# Propeers — Frontend Guide
> Full page breakdown, features, API mapping, and component hints for the mentorship marketplace.

---

## Tech Stack Recommendation

| Concern | Pick |
|---|---|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS + shadcn/ui |
| State | Zustand (client) + React Query (server) |
| Auth | JWT stored in httpOnly cookie (matches your backend) |
| Payments | Razorpay JS SDK |
| Forms | React Hook Form + Zod |
| Dates | date-fns |
| Toasts/Alerts | sonner |

---

## Pages Overview (15 Pages)

| # | Route | Who Sees It | Auth Required |
|---|---|---|---|
| 1 | `/` | Everyone | No |
| 2 | `/auth/register` | Everyone | No |
| 3 | `/auth/login` | Everyone | No |
| 4 | `/auth/verify-email` | Everyone | No |
| 5 | `/auth/forgot-password` | Everyone | No |
| 6 | `/auth/reset-password/:token` | Everyone | No |
| 7 | `/explore` | Everyone | No |
| 8 | `/mentors/:mentorId` | Everyone | No |
| 9 | `/checkout/:mentorId` | Student | Yes |
| 10 | `/dashboard/student` | Student | Yes |
| 11 | `/dashboard/student/bookings/:id` | Student | Yes |
| 12 | `/dashboard/mentor` | Mentor | Yes |
| 13 | `/dashboard/mentor/profile` | Mentor | Yes |
| 14 | `/dashboard/mentor/availability` | Mentor | Yes |
| 15 | `/admin` | Admin / Super Admin | Yes |

---

## Page 1 — Landing Page `/`

**Purpose:** Convert visitors into registered students or mentors.

### Sections
- **Hero** — Headline + CTA buttons ("Find a Mentor" → `/explore`, "Become a Mentor" → `/auth/register?role=mentor`)
- **How It Works** — 3-step flow: Browse → Book → Meet
- **Featured Mentors Strip** — Static or fetched from `GET /api/v1/public/mentors?limit=6&sort=rating`
- **Testimonials** — Static reviews or pulled from public review endpoint
- **Footer** — Links, social, copyright

### APIs Used
```
GET /api/v1/public/mentors?limit=6&sort=rating&order=desc
```

---

## Page 2 — Register `/auth/register`

### Fields
- Name, Email, Password, Role (Student / Mentor toggle)

### Behavior
- On submit → `POST /api/v1/public/auth/register`
- On success → redirect to `/auth/verify-email` with a banner: "Check your inbox to verify your email"
- Google OAuth button → `GET /api/v1/public/auth/google`

### Validations
- Password: min 8 chars, 1 uppercase, 1 number, 1 special char
- Email format

---

## Page 3 — Login `/auth/login`

### Fields
- Email, Password, Remember Me (optional)

### Behavior
- `POST /api/v1/public/auth/login`
- On success → store `accessToken`, redirect based on role:
  - `student` → `/dashboard/student`
  - `mentor` → `/dashboard/mentor`
  - `admin` / `super_admin` → `/admin`

### Edge Cases
- Unverified email → show "Resend verification email" link (`POST /api/v1/public/auth/resend-verification`)
- Blocked account → show support message

---

## Page 4 — Verify Email `/auth/verify-email`

- Static info page showing "We sent a link to your email"
- Button: "Resend Email" → `POST /api/v1/public/auth/resend-verification`
- When user clicks email link → `GET /api/v1/public/auth/verify-email/:token` → redirect to login with success toast

---

## Page 5 & 6 — Forgot / Reset Password

### Forgot `/auth/forgot-password`
- Email input → `POST /api/v1/public/auth/forgot-password`
- Show: "If that email exists, a reset link was sent"

### Reset `/auth/reset-password/:token`
- New Password + Confirm Password
- On submit → `POST /api/v1/public/auth/reset-password/:token`
- On success → redirect to `/auth/login`

---

## Page 7 — Explore Mentors `/explore`

**Purpose:** Main discovery page. Most important public-facing page after landing.

### Layout
- Left sidebar (desktop) / Drawer (mobile): Filters
- Right: Mentor cards grid (3 col desktop, 2 col tablet, 1 col mobile)

### Filters
| Filter | Input Type | Query Param |
|---|---|---|
| Skill/Expertise | Tag multi-select | `skill` |
| Company | Text search | `company` |
| Min Experience | Slider / Number | `minExperience` |
| Max Experience | Slider / Number | `maxExperience` |
| Min Rating | Star select (1–5) | `minRating` |
| Sort By | Dropdown | `sort` (rating/experience/price) |
| Order | Toggle | `order` (asc/desc) |

### Mentor Card
```
┌──────────────────────────────┐
│  [Avatar]  John Doe          │
│            Senior SWE @ Meta │
│            ⭐ 4.8 (32 reviews)│
│  Skills: Node.js, TypeScript │
│  8 years exp                 │
│  From ₹999/session           │
│            [View Profile]    │
└──────────────────────────────┘
```

### APIs Used
```
GET /api/v1/public/mentors?skill=&company=&minExperience=&minRating=&page=&limit=&sort=&order=
```

### UX Notes
- Infinite scroll or pagination (12 per page)
- Debounce filter changes by 400ms
- Show skeleton cards while loading

---

## Page 8 — Mentor Profile `/mentors/:mentorId`

**Purpose:** Full mentor detail. Where the student decides to book.

### Sections

#### 1. Hero Block
- Avatar, Name, Role @ Company
- Experience, Languages, LinkedIn/GitHub links
- Rating + Total Reviews
- "Book a Session" CTA → scrolls to packages

#### 2. About / Bio
- `mentorProfile.bio`

#### 3. Skills
- Tag chips from `expertise[]`

#### 4. Packages
- Cards for each active package
```
┌─────────────────────────────┐
│  System Design Prep         │
│  45 min  ·  ₹2,000          │
│  Mock interview on HLD      │
│  [Select This Plan]         │
└─────────────────────────────┘
```

#### 5. Availability Calendar
- Fetched from `GET /api/v1/private/availability/:mentorId?available=true`
- Group slots by date, show as time chips
- User selects one slot → stored in local state

#### 6. Reviews
- Paginated list from `GET /api/v1/public/mentors/:mentorId/reviews`
- Star breakdown bar chart

### Booking Initiation Flow (on this page)
1. Student selects package
2. Student selects time slot
3. "Proceed to Pay" → navigate to `/checkout/:mentorId` with `packageId` + `availabilityId` in state/query

### APIs Used
```
GET /api/v1/public/mentors/:mentorId
GET /api/v1/private/availability/:mentorId?available=true
GET /api/v1/public/mentors/:mentorId/reviews?page=1&limit=10
GET /api/v1/private/packages/:mentorId
```

---

## Page 9 — Checkout `/checkout/:mentorId`

**Purpose:** Payment confirmation + Razorpay initiation.

### Layout
- Left: Order summary (mentor name, package, slot, price)
- Right: Pay button

### Flow
```
1. Page loads with packageId + availabilityId
2. Call POST /payments/create-order → get razorpayOrderId + amount
3. Open Razorpay modal (rzp.open())
4. On payment success → call POST /payments/verify with:
   - razorpayOrderId
   - razorpayPaymentId
   - razorpaySignature
   - meetingData (provider: "google-meet", links)
5. On verify success → redirect to /dashboard/student with success toast
```

### APIs Used
```
POST /api/v1/private/payments/create-order
POST /api/v1/private/payments/verify
```

### Notes
- Add a loading/processing overlay between Razorpay close and verify response
- Handle payment failure gracefully — show retry option, don't lose slot

---

## Page 10 — Student Dashboard `/dashboard/student`

### Tabs / Sections

#### Overview Tab
- Stats row: Upcoming Sessions count, Completed count, Mentors booked
- Next session card (if any)

#### Bookings Tab
| Sub-tab | Filter |
|---|---|
| Upcoming | status: confirmed |
| Completed | status: completed |
| Cancelled | status: cancelled |
| Rescheduled | status: rescheduled |

**Booking Card:**
```
┌──────────────────────────────────────┐
│ John Doe  (Senior SWE @ Google)      │
│ Jun 20, 2026 · 7:00 PM · 60 min      │
│ Status: Confirmed                    │
│ [Join Meeting]  [View Details]       │
└──────────────────────────────────────┘
```

- "Join Meeting" button active only 10 min before `scheduledAt`
- Show reschedule accept/reject UI if `bookingStatus === "rescheduled"`

### APIs Used
```
GET /api/v1/private/bookings/my?status=confirmed
GET /api/v1/private/bookings/my?status=completed
GET /api/v1/private/bookings/my?status=cancelled
GET /api/v1/private/auth/me
```

---

## Page 11 — Student Booking Detail `/dashboard/student/bookings/:id`

### Content
- Full booking info: mentor, date/time, duration, package, price
- Meeting link (if confirmed)
- Payment receipt section
- Reschedule status banner (if pending student action)
  - Accept → `POST /bookings/:id/accept-reschedule`
  - Reject → `POST /bookings/:id/reject-reschedule`
- Submit review form (only if `status === "completed"` and no review submitted)
  - Star rating (1–5) + text → `POST /api/v1/private/reviews`

### APIs Used
```
GET /api/v1/private/bookings/:id
GET /api/v1/private/meetings/:bookingId
POST /api/v1/private/bookings/:id/accept-reschedule
POST /api/v1/private/bookings/:id/reject-reschedule
POST /api/v1/private/reviews
```

---

## Page 12 — Mentor Dashboard `/dashboard/mentor`

### Tabs

#### Overview Tab
- Stats: Total sessions, Upcoming sessions, Total earnings, Avg rating
- Pending approval banner (if `approved === false`)

#### Bookings Tab
- List of all mentor bookings from `GET /api/v1/private/bookings/mentor`
- Per booking: student name, date/time, package, status
- Reschedule button → opens modal to select new slot + reason → `POST /bookings/:id/reschedule`

### APIs Used
```
GET /api/v1/private/bookings/mentor
GET /api/v1/private/auth/me
```

---

## Page 13 — Mentor Profile Settings `/dashboard/mentor/profile`

### Sections

#### Basic Info
- Edit: company, currentRole, experience, bio, linkedIn, github, hourlyRate, languages
- → `PUT /api/v1/private/mentor/profile`

#### Packages
- List existing packages (title, duration, price, isActive toggle)
- Create new package form → `POST /api/v1/private/packages`
- Edit inline → `PUT /api/v1/private/packages/:id`
- Delete → `DELETE /api/v1/private/packages/:id`

### APIs Used
```
GET /api/v1/private/mentor/profile
PUT /api/v1/private/mentor/profile
GET /api/v1/private/packages/:mentorId
POST /api/v1/private/packages
PUT /api/v1/private/packages/:id
DELETE /api/v1/private/packages/:id
```

---

## Page 14 — Mentor Availability `/dashboard/mentor/availability`

### Layout
- Calendar view (week view preferred)
- Existing slots shown as blocks: green = available, grey = booked
- Click empty slot → opens "Add Slot" modal with start/end time pickers
- Click existing available slot → delete confirmation → `DELETE /api/v1/private/availability/:slotId`

### Add Slot Modal
- Date picker + Start time + End time
- → `POST /api/v1/private/availability`

### APIs Used
```
GET /api/v1/private/availability/:mentorId
POST /api/v1/private/availability
DELETE /api/v1/private/availability/:slotId
```

### Notes
- Prevent selecting past dates
- Enforce minimum slot duration (match your backend validation)

---

## Page 15 — Admin Panel `/admin`

> Accessible only to `admin` and `super_admin` roles.

### Tabs

#### Stats Tab
- Platform-wide: total users, mentors, bookings, revenue
- → `GET /api/v1/private/admin/stats`

#### Users Tab
- Paginated user table: name, email, role, status, joined date
- Per row actions:
  - Block → `PATCH /admin/users/:id/block`
  - Unblock → `PATCH /admin/users/:id/unblock`
  - Delete → `PATCH /admin/users/:id/delete`
- Super Admin only: Change Role dropdown → `PATCH /admin/users/:id/role`

#### Mentors Tab
- List of pending mentor applications (`approved === false`)
- Per row actions:
  - Approve → `PATCH /admin/mentors/:id/approve`
  - Reject → `PATCH /admin/mentors/:id/reject`

### APIs Used
```
GET /api/v1/private/admin/stats
GET /api/v1/private/admin/users?page=&limit=
PATCH /api/v1/private/admin/users/:id/block
PATCH /api/v1/private/admin/users/:id/unblock
PATCH /api/v1/private/admin/users/:id/delete
PATCH /api/v1/private/admin/users/:id/role   ← super_admin only
PATCH /api/v1/private/admin/mentors/:id/approve
PATCH /api/v1/private/admin/mentors/:id/reject
```

---

## Shared Components

| Component | Used On |
|---|---|
| `<Navbar />` | All public pages — shows login/register or user avatar menu |
| `<ProtectedRoute />` | Wraps dashboard + checkout pages |
| `<RoleGuard role="mentor" />` | Mentor-only pages |
| `<RoleGuard role="admin" />` | Admin pages |
| `<BookingCard />` | Student + Mentor dashboards |
| `<MentorCard />` | Explore page, Landing page |
| `<PackageCard />` | Mentor profile, Checkout |
| `<SlotPicker />` | Mentor profile page, Reschedule modal |
| `<ReviewCard />` | Mentor profile reviews section |
| `<StarRating />` | Review form, Mentor card |
| `<RescheduleModal />` | Mentor dashboard |
| `<ConfirmDialog />` | Delete slot, Delete package, Block user |
| `<PageLoader />` | Route-level suspense |
| `<EmptyState />` | No bookings, No slots, No mentors found |

---

## Auth Flow (Token Strategy)

```
Login → accessToken (memory/Zustand) + refreshToken (httpOnly cookie)
       ↓
All private API calls → Authorization: Bearer <accessToken>
       ↓
On 401 → call POST /auth/refresh → get new accessToken
       ↓
On refresh failure → logout → redirect /auth/login
```

Use an Axios interceptor to handle token refresh automatically.

---

## Role-Based Redirect Map

| Role | After Login |
|---|---|
| `student` | `/dashboard/student` |
| `mentor` | `/dashboard/mentor` |
| `admin` | `/admin` |
| `super_admin` | `/admin` |
| `blocked` | Show blocked screen |
| `deleted` | Treat as logged out |

---

## Build Order Recommendation

Build in this sequence to unblock yourself at each stage:

```
Phase 1 — Auth (Pages 2, 3, 4, 5, 6)
Phase 2 — Explore + Mentor Profile (Pages 7, 8)
Phase 3 — Student Booking Flow (Page 9, 10, 11)
Phase 4 — Mentor Dashboard (Pages 12, 13, 14)
Phase 5 — Landing Page (Page 1)
Phase 6 — Admin Panel (Page 15)
```

---

## Environment Variables (Frontend)

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api/v1
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxx
NEXT_PUBLIC_GOOGLE_CLIENT_ID=xxxxxx.apps.googleusercontent.com
```

---

*Generated for Propeers — MentorOS Frontend Guide*