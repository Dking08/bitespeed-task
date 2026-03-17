# BiteSpeed Backend Task - Identity Reconciliation

A backend service that consolidates customer identities across multiple contact points (email and phone number) into a single unified profile. Built as part of the BiteSpeed Backend Engineering Task.

Live at: `https://bitespeed-task-backend-xjcn.onrender.com`

---

## Problem Statement

On an e-commerce platform like FluxKart, customers may make purchases using different combinations of email addresses and phone numbers. This service identifies and links those contacts, ensuring all purchases by the same person are tied to a single primary identity, even when different contact details are used.

---

## Tech Stack

| Layer       | Technology                  |
|-------------|-----------------------------|
| Runtime     | Node.js                     |
| Language    | TypeScript                  |
| Framework   | Express 5                   |
| ORM         | Prisma 6                    |
| Database    | PostgreSQL                  |
| Hosting     | Render                      |

---

## Data Model

```prisma
model Contact {
  id             Int            @id @default(autoincrement())
  phoneNumber    String?
  email          String?
  linkedId       Int?
  linkPrecedence LinkPrecedence
  createdAt      DateTime       @default(now())
  updatedAt      DateTime       @updatedAt
  deletedAt      DateTime?
}

enum LinkPrecedence {
  primary
  secondary
}
```

Each contact is either a `primary` (the root identity) or a `secondary` (linked to a primary via `linkedId`). The oldest contact in a cluster is always the primary.

---

## API Reference

### POST /identify

Identifies and reconciles a customer contact. Accepts an email, a phone number, or both. At least one field is required.

**Request**

```json
{
  "email": "lorraine@hillvalley.edu",
  "phoneNumber": "123456"
}
```

**Response**

```json
{
  "contact": {
    "primaryContactId": 1,
    "emails": ["lorraine@hillvalley.edu", "mcfly@hillvalley.edu"],
    "phoneNumbers": ["123456"],
    "secondaryContactIds": [23, 45]
  }
}
```

The primary contact's email and phone number always appear first in the respective arrays.

**Status Codes**

| Code | Meaning                                      |
|------|----------------------------------------------|
| 200  | Contact identified and response returned     |
| 400  | Neither email nor phoneNumber was provided   |

---

## Reconciliation Logic

The service handles four main scenarios:

1. **No match** - Both email and phone number are new. A new primary contact is created.

2. **Exact match** - The incoming data matches an existing contact exactly. The consolidated cluster is returned.

3. **Partial match with new info** - One field matches an existing contact but the other is new. A new secondary contact is created, linked to the primary of the matching cluster.

4. **Two separate primaries merge** - The email matches one primary and the phone number matches a different primary. The newer primary (and all its secondaries) are re-linked to the older primary, which retains its `primary` status.

---

## Project Structure

```
prod/
├── prisma/
│   ├── schema.prisma          # Database schema and Contact model
│   └── migrations/            # Prisma migration history
├── src/
│   ├── index.ts               # Express app entry point, /identify route
│   ├── prisma.ts              # Prisma client singleton
│   └── utils/
│       └── contactUtils.ts    # Core reconciliation utilities
├── .gitignore
├── package.json
└── tsconfig.json
```

### Core Utilities (`contactUtils.ts`)

| Function           | Description                                                                 |
|--------------------|-----------------------------------------------------------------------------|
| `expandCluster`    | BFS/DFS traversal to collect all contacts linked (directly or transitively) to any matched contact |
| `normaliseCluster` | Determines the oldest contact as primary, re-links all others as secondaries |
| `getPrimaryContact`| Returns the contact with the earliest `createdAt` timestamp                 |
| `hasNewInfo`       | Checks whether the incoming request carries an email or phone not yet in the cluster |

---

## Running Locally

### Prerequisites

- Node.js 18+
- A PostgreSQL database (docker image)
- Prisma CLI

### Setup

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env and set DATABASE_URL

# Run migrations
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate

# Start dev server
npm run dev
```

The server starts on port `8001` by default.

### Environment Variables

| Variable       | Description                          |
|----------------|--------------------------------------|
| `DATABASE_URL` | PostgreSQL connection string         |

---

## Deployment (Render)

The service is deployed on [Render](render.com). The following settings are used:

| Setting        | Value                        |
|----------------|------------------------------|
| Build Command  | `npm install && npx prisma generate && npx prisma migrate deploy`        |
| Start Command  | `npm run dev`       |
| Environment    | Node                         |

`DATABASE_URL` is set as an environment variable in the Render dashboard.
PostgreSQL is provisioned as a managed database on Render, and the connection string is used in the deployment settings.

> Also deploying on AWS EC2.

---

## Author

Dastageer - BiteSpeed Backend Engineering Task submission.
