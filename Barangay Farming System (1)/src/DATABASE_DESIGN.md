# Plant n' Plan - Database Design Documentation

## Table of Contents
1. [Database Architecture Overview](#database-architecture-overview)
2. [Physical Database Structure](#physical-database-structure)
3. [Logical Data Organization](#logical-data-organization)
4. [Entity Schemas & Sample Data](#entity-schemas--sample-data)
5. [Relationships & Foreign Keys](#relationships--foreign-keys)
6. [Storage Buckets](#storage-buckets)
7. [Indexes & Performance](#indexes--performance)
8. [Data Integrity Rules](#data-integrity-rules)

---

## Database Architecture Overview

### Technology Stack
- **Database System:** PostgreSQL (Supabase-managed)
- **Authentication:** Supabase Auth Service
- **File Storage:** Supabase Storage (Object Storage)
- **ORM/Query Method:** Key-Value Store Pattern (Custom)

### Design Pattern
The Plant n' Plan system uses a **Key-Value Store (KV Store)** pattern built on top of PostgreSQL. Instead of creating multiple normalized tables, the system stores all data in a single table with JSON values, organized by key prefixes.

### Why KV Store Pattern?
1. **Flexibility:** Easy to modify data structure without migrations
2. **Rapid Prototyping:** Quick to implement and iterate
3. **Simple Queries:** All operations use get/set/delete methods
4. **No Schema Migrations:** Add new entity types without DDL statements
5. **Suitable for MVP:** Perfect for barangay-level deployment

---

## Physical Database Structure

### Table 1: `kv_store_a8901673`

**Purpose:** Primary data storage for all application entities

| Column Name | Data Type | Constraints | Description |
|-------------|-----------|-------------|-------------|
| `key` | TEXT | PRIMARY KEY, NOT NULL | Unique identifier (format: `entity_a8901673:{id}`) |
| `value` | JSONB | NOT NULL | JSON object containing entity data |
| `created_at` | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Record creation timestamp |
| `updated_at` | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Last update timestamp |

**Index:** 
- Primary index on `key` (automatic)
- GIN index on `value` (for JSON queries)
- B-tree index on `key` with text pattern ops (for prefix searches)

**Sample Physical Records:**

```sql
-- Sample row structure
SELECT * FROM kv_store_a8901673 WHERE key = 'crops_a8901673:1730880000000';

key                              | crops_a8901673:1730880000000
value                            | {"id":"1730880000000","name":"Tomatoes","plantingDate":"2024-11-01","expectedHarvest":"2025-01-15","health":"Healthy","stage":"Growing","status":"Active"}
created_at                       | 2024-11-06 08:30:00+00
updated_at                       | 2024-11-06 08:30:00+00
```

---

### Table 2: `auth.users` (Managed by Supabase Auth)

**Purpose:** User authentication and account management

| Column Name | Data Type | Description |
|-------------|-----------|-------------|
| `id` | UUID | Primary key, auto-generated |
| `email` | VARCHAR(255) | User email (unique) |
| `encrypted_password` | TEXT | Hashed password (bcrypt) |
| `email_confirmed_at` | TIMESTAMP | Email verification timestamp |
| `created_at` | TIMESTAMP | Account creation date |
| `updated_at` | TIMESTAMP | Last profile update |
| `raw_user_meta_data` | JSONB | User metadata (name, bio, etc.) |
| `role` | TEXT | User role (authenticated) |

**Sample Record:**

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "email": "francisjohngorres@gmail.com",
  "email_confirmed_at": "2024-11-06T08:00:00Z",
  "raw_user_meta_data": {
    "name": "Francis John Gorres",
    "role": "admin"
  },
  "created_at": "2024-11-01T10:00:00Z"
}
```

---

## Logical Data Organization

### Entity Types (Key Prefixes)

The system organizes data using key prefixes to simulate separate tables:

| Entity Type | Key Prefix | Description | Admin Only |
|-------------|-----------|-------------|------------|
| Crops | `crops_a8901673:` | Planted crops with health tracking | Write only |
| Harvests | `harvests_a8901673:` | Harvest records and yield data | Write only |
| Budget | `budget_a8901673:` | Financial transactions | Write only |
| Volunteers | `volunteers_a8901673:` | Volunteer tasks and schedules | Write only |
| Gallery | `gallery_a8901673:` | Photo metadata | Write only |
| Polls | `polls_a8901673:` | Community polls | Write only |
| Feedback | `feedback_a8901673:` | User feedback submissions | No (all users) |
| User Data | `user_data_a8901673:` | Extended user profiles | Own profile only |

---

## Entity Schemas & Sample Data

### Entity 1: Crops

**Logical Table Name:** `crops`  
**Key Format:** `crops_a8901673:{timestamp_id}`

#### Schema

| Field Name | Data Type | Required | Description | Validation |
|------------|-----------|----------|-------------|------------|
| `id` | String | Yes | Unique identifier (timestamp) | Auto-generated |
| `name` | String | Yes | Crop name | Max 100 chars |
| `plantingDate` | String (ISO Date) | Yes | Date planted | YYYY-MM-DD format |
| `expectedHarvest` | String (ISO Date) | Yes | Expected harvest date | YYYY-MM-DD format |
| `health` | String (Enum) | Yes | Health status | "Healthy", "Needs Attention", "Critical" |
| `stage` | String (Enum) | Yes | Growth stage | "Seedling", "Growing", "Mature", "Harvested" |
| `status` | String (Enum) | Yes | Current status | "Active", "Harvested", "Failed" |
| `notes` | String | No | Additional notes | Max 500 chars |
| `createdAt` | String (ISO DateTime) | Yes | Record creation time | Auto-generated |
| `updatedAt` | String (ISO DateTime) | Yes | Last update time | Auto-updated |

#### Sample Data

```json
// Key: crops_a8901673:1730880000000
{
  "id": "1730880000000",
  "name": "Tomatoes (Roma)",
  "plantingDate": "2024-11-01",
  "expectedHarvest": "2025-01-15",
  "health": "Healthy",
  "stage": "Growing",
  "status": "Active",
  "notes": "Planted in section A, row 3. Using organic fertilizer.",
  "createdAt": "2024-11-01T08:00:00.000Z",
  "updatedAt": "2024-11-06T10:30:00.000Z"
}

// Key: crops_a8901673:1730885000000
{
  "id": "1730885000000",
  "name": "Lettuce (Green)",
  "plantingDate": "2024-10-15",
  "expectedHarvest": "2024-12-01",
  "health": "Needs Attention",
  "stage": "Mature",
  "status": "Active",
  "notes": "Showing signs of aphid infestation. Applied neem oil treatment.",
  "createdAt": "2024-10-15T09:00:00.000Z",
  "updatedAt": "2024-11-05T14:20:00.000Z"
}

// Key: crops_a8901673:1728000000000
{
  "id": "1728000000000",
  "name": "Eggplant (Talong)",
  "plantingDate": "2024-09-01",
  "expectedHarvest": "2024-11-30",
  "health": "Healthy",
  "stage": "Harvested",
  "status": "Harvested",
  "notes": "Excellent yield. Will plant again next season.",
  "createdAt": "2024-09-01T07:00:00.000Z",
  "updatedAt": "2024-11-04T16:00:00.000Z"
}
```

---

### Entity 2: Harvests

**Logical Table Name:** `harvests`  
**Key Format:** `harvests_a8901673:{timestamp_id}`

#### Schema

| Field Name | Data Type | Required | Description | Validation |
|------------|-----------|----------|-------------|------------|
| `id` | String | Yes | Unique identifier | Auto-generated |
| `cropId` | String | Yes | Reference to crop | Must exist in crops |
| `cropName` | String | Yes | Crop name (denormalized) | For display |
| `harvestDate` | String (ISO Date) | Yes | Date harvested | YYYY-MM-DD format |
| `quantity` | Number | Yes | Amount harvested (kg) | Positive number |
| `quality` | String (Enum) | Yes | Harvest quality | "Excellent", "Good", "Fair", "Poor" |
| `notes` | String | No | Harvest notes | Max 500 chars |
| `createdAt` | String (ISO DateTime) | Yes | Record creation time | Auto-generated |

#### Sample Data

```json
// Key: harvests_a8901673:1730970000000
{
  "id": "1730970000000",
  "cropId": "1728000000000",
  "cropName": "Eggplant (Talong)",
  "harvestDate": "2024-11-04",
  "quantity": 25.5,
  "quality": "Excellent",
  "notes": "Harvested 102 pieces. Uniform size, no pest damage.",
  "createdAt": "2024-11-04T16:00:00.000Z"
}

// Key: harvests_a8901673:1730975000000
{
  "id": "1730975000000",
  "cropId": "1730885000000",
  "cropName": "Lettuce (Green)",
  "harvestDate": "2024-11-05",
  "quantity": 12.3,
  "quality": "Good",
  "notes": "Partial harvest. Some leaves affected by pests.",
  "createdAt": "2024-11-05T09:30:00.000Z"
}

// Key: harvests_a8901673:1730980000000
{
  "id": "1730980000000",
  "cropId": "1730880000000",
  "cropName": "Tomatoes (Roma)",
  "harvestDate": "2024-11-06",
  "quantity": 8.7,
  "quality": "Excellent",
  "notes": "First harvest batch. Ripe and flavorful.",
  "createdAt": "2024-11-06T11:00:00.000Z"
}
```

---

### Entity 3: Budget Transactions

**Logical Table Name:** `budget`  
**Key Format:** `budget_a8901673:{timestamp_id}`

#### Schema

| Field Name | Data Type | Required | Description | Validation |
|------------|-----------|----------|-------------|------------|
| `id` | String | Yes | Unique identifier | Auto-generated |
| `description` | String | Yes | Transaction description | Max 200 chars |
| `category` | String (Enum) | Yes | Budget category | See categories below |
| `amount` | Number | Yes | Transaction amount (PHP) | Positive number |
| `type` | String (Enum) | Yes | Transaction type | "Income", "Expense" |
| `date` | String (ISO Date) | Yes | Transaction date | YYYY-MM-DD format |
| `receipt` | String | No | Receipt/reference number | Optional |
| `createdAt` | String (ISO DateTime) | Yes | Record creation time | Auto-generated |

#### Budget Categories

**Expense Categories:**
- Seeds
- Equipment
- Water
- Fertilizer
- Labor
- Maintenance
- Other Expenses

**Income Categories:**
- Harvest Sales
- Donations
- Grants
- Other Income

#### Sample Data

```json
// Key: budget_a8901673:1730800000000
{
  "id": "1730800000000",
  "description": "Tomato seeds (Roma variety, 2 packets)",
  "category": "Seeds",
  "amount": 350.00,
  "type": "Expense",
  "date": "2024-10-25",
  "receipt": "RCP-2024-001",
  "createdAt": "2024-10-25T10:00:00.000Z"
}

// Key: budget_a8901673:1730850000000
{
  "id": "1730850000000",
  "description": "Organic fertilizer (50kg bag)",
  "category": "Fertilizer",
  "amount": 1200.00,
  "type": "Expense",
  "date": "2024-10-28",
  "receipt": "RCP-2024-002",
  "createdAt": "2024-10-28T14:30:00.000Z"
}

// Key: budget_a8901673:1730900000000
{
  "id": "1730900000000",
  "description": "Eggplant harvest sales (25.5kg @ PHP 60/kg)",
  "category": "Harvest Sales",
  "amount": 1530.00,
  "type": "Income",
  "date": "2024-11-05",
  "receipt": "SALE-2024-001",
  "createdAt": "2024-11-05T16:00:00.000Z"
}

// Key: budget_a8901673:1730920000000
{
  "id": "1730920000000",
  "description": "Drip irrigation system installation",
  "category": "Equipment",
  "amount": 4500.00,
  "type": "Expense",
  "date": "2024-11-02",
  "receipt": "RCP-2024-003",
  "createdAt": "2024-11-02T11:00:00.000Z"
}

// Key: budget_a8901673:1730940000000
{
  "id": "1730940000000",
  "description": "Water bill (October)",
  "category": "Water",
  "amount": 850.00,
  "type": "Expense",
  "date": "2024-11-01",
  "receipt": "WATER-OCT-2024",
  "createdAt": "2024-11-01T09:00:00.000Z"
}

// Key: budget_a8901673:1730960000000
{
  "id": "1730960000000",
  "description": "Barangay donation for community garden",
  "category": "Donations",
  "amount": 5000.00,
  "type": "Income",
  "date": "2024-11-03",
  "receipt": "DON-2024-001",
  "createdAt": "2024-11-03T13:00:00.000Z"
}
```

#### Budget Summary Calculations

```typescript
// Example calculations from BudgetTransparency.tsx
const totalIncome = 1530.00 + 5000.00 = 6530.00
const totalExpenses = 350.00 + 1200.00 + 4500.00 + 850.00 = 6900.00
const balance = totalIncome - totalExpenses = -370.00 (deficit)
```

---

### Entity 4: Volunteers

**Logical Table Name:** `volunteers`  
**Key Format:** `volunteers_a8901673:{timestamp_id}`

#### Schema

| Field Name | Data Type | Required | Description | Validation |
|------------|-----------|----------|-------------|------------|
| `id` | String | Yes | Unique identifier | Auto-generated |
| `name` | String | Yes | Volunteer name | Max 100 chars |
| `task` | String | Yes | Task description | Max 200 chars |
| `date` | String (ISO Date) | Yes | Scheduled date | YYYY-MM-DD format |
| `status` | String (Enum) | Yes | Task status | "Pending", "In Progress", "Completed" |
| `contactNumber` | String | No | Phone number | Optional |
| `notes` | String | No | Additional notes | Max 300 chars |
| `createdAt` | String (ISO DateTime) | Yes | Record creation time | Auto-generated |
| `updatedAt` | String (ISO DateTime) | Yes | Last update time | Auto-updated |

#### Sample Data

```json
// Key: volunteers_a8901673:1730880000000
{
  "id": "1730880000000",
  "name": "Juan Dela Cruz",
  "task": "Watering plants in Section A and B",
  "date": "2024-11-07",
  "status": "Pending",
  "contactNumber": "09171234567",
  "notes": "Morning shift (6:00 AM - 8:00 AM)",
  "createdAt": "2024-11-05T15:00:00.000Z",
  "updatedAt": "2024-11-05T15:00:00.000Z"
}

// Key: volunteers_a8901673:1730885000000
{
  "id": "1730885000000",
  "name": "Maria Santos",
  "task": "Weeding and pest inspection",
  "date": "2024-11-06",
  "status": "In Progress",
  "contactNumber": "09189876543",
  "notes": "Focus on tomato section",
  "createdAt": "2024-11-04T10:00:00.000Z",
  "updatedAt": "2024-11-06T08:30:00.000Z"
}

// Key: volunteers_a8901673:1730890000000
{
  "id": "1730890000000",
  "name": "Pedro Reyes",
  "task": "Fertilizer application",
  "date": "2024-11-05",
  "status": "Completed",
  "contactNumber": "09195556789",
  "notes": "Applied organic fertilizer to all sections. Used 10kg.",
  "createdAt": "2024-11-03T14:00:00.000Z",
  "updatedAt": "2024-11-05T17:00:00.000Z"
}

// Key: volunteers_a8901673:1730895000000
{
  "id": "1730895000000",
  "name": "Ana Gomez",
  "task": "Harvest eggplants and prepare for market",
  "date": "2024-11-04",
  "status": "Completed",
  "contactNumber": "09201234567",
  "notes": "Harvested 25.5kg. Sorted and packaged.",
  "createdAt": "2024-11-03T16:00:00.000Z",
  "updatedAt": "2024-11-04T18:00:00.000Z"
}
```

---

### Entity 5: Photo Gallery

**Logical Table Name:** `gallery`  
**Key Format:** `gallery_a8901673:{timestamp_id}`

#### Schema

| Field Name | Data Type | Required | Description | Validation |
|------------|-----------|----------|-------------|------------|
| `id` | String | Yes | Unique identifier | Auto-generated |
| `imageUrl` | String | Yes | Signed URL from Storage | Generated by server |
| `storagePath` | String | Yes | Path in Storage bucket | `gallery/{timestamp}_{filename}` |
| `description` | String | Yes | Photo description | Max 200 chars |
| `uploadedBy` | String | Yes | User ID who uploaded | UUID from auth.users |
| `uploadedByName` | String | Yes | User name (denormalized) | For display |
| `uploadDate` | String (ISO Date) | Yes | Upload date | YYYY-MM-DD format |
| `createdAt` | String (ISO DateTime) | Yes | Record creation time | Auto-generated |

#### Sample Data

```json
// Key: gallery_a8901673:1730880000000
{
  "id": "1730880000000",
  "imageUrl": "https://xxx.supabase.co/storage/v1/object/sign/make-a8901673-gallery/gallery/1730880000000_tomatoes.jpg?token=xxx",
  "storagePath": "gallery/1730880000000_tomatoes.jpg",
  "description": "Tomato seedlings after 2 weeks - showing healthy growth",
  "uploadedBy": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "uploadedByName": "Francis John Gorres",
  "uploadDate": "2024-11-01",
  "createdAt": "2024-11-01T09:30:00.000Z"
}

// Key: gallery_a8901673:1730900000000
{
  "id": "1730900000000",
  "imageUrl": "https://xxx.supabase.co/storage/v1/object/sign/make-a8901673-gallery/gallery/1730900000000_harvest.jpg?token=xxx",
  "storagePath": "gallery/1730900000000_harvest.jpg",
  "description": "Eggplant harvest day - 25.5kg yield!",
  "uploadedBy": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "uploadedByName": "Francis John Gorres",
  "uploadDate": "2024-11-04",
  "createdAt": "2024-11-04T16:30:00.000Z"
}

// Key: gallery_a8901673:1730920000000
{
  "id": "1730920000000",
  "imageUrl": "https://xxx.supabase.co/storage/v1/object/sign/make-a8901673-gallery/gallery/1730920000000_irrigation.jpg?token=xxx",
  "storagePath": "gallery/1730920000000_irrigation.jpg",
  "description": "New drip irrigation system installed in Section A",
  "uploadedBy": "b2c3d4e5-f6g7-8901-bcde-fg2345678901",
  "uploadedByName": "Maria Santos",
  "uploadDate": "2024-11-02",
  "createdAt": "2024-11-02T14:00:00.000Z"
}
```

---

### Entity 6: Community Polls

**Logical Table Name:** `polls`  
**Key Format:** `polls_a8901673:{timestamp_id}`

#### Schema

| Field Name | Data Type | Required | Description | Validation |
|------------|-----------|----------|-------------|------------|
| `id` | String | Yes | Unique identifier | Auto-generated |
| `question` | String | Yes | Poll question | Max 200 chars |
| `options` | Array<Object> | Yes | Poll options | Min 2, max 6 options |
| `options[].text` | String | Yes | Option text | Max 100 chars |
| `options[].votes` | Number | Yes | Vote count | Initialize to 0 |
| `createdBy` | String | Yes | Admin user ID | UUID |
| `createdByName` | String | Yes | Admin name | For display |
| `status` | String (Enum) | Yes | Poll status | "Active", "Closed" |
| `createdAt` | String (ISO DateTime) | Yes | Creation time | Auto-generated |
| `closedAt` | String (ISO DateTime) | No | Closing time | Optional |

#### Sample Data

```json
// Key: polls_a8901673:1730880000000
{
  "id": "1730880000000",
  "question": "What crop should we prioritize planting next season?",
  "options": [
    {
      "text": "More tomatoes",
      "votes": 15
    },
    {
      "text": "Bell peppers",
      "votes": 8
    },
    {
      "text": "Bitter gourd (Ampalaya)",
      "votes": 22
    },
    {
      "text": "String beans (Sitaw)",
      "votes": 12
    }
  ],
  "createdBy": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "createdByName": "Francis John Gorres",
  "status": "Active",
  "createdAt": "2024-11-01T10:00:00.000Z"
}

// Key: polls_a8901673:1730920000000
{
  "id": "1730920000000",
  "question": "Should we invest in a composting system?",
  "options": [
    {
      "text": "Yes, it's worth the investment",
      "votes": 35
    },
    {
      "text": "No, we need to focus on other priorities",
      "votes": 7
    },
    {
      "text": "Let's research more options first",
      "votes": 11
    }
  ],
  "createdBy": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "createdByName": "Francis John Gorres",
  "status": "Closed",
  "createdAt": "2024-10-20T09:00:00.000Z",
  "closedAt": "2024-11-02T17:00:00.000Z"
}
```

---

### Entity 7: Community Feedback

**Logical Table Name:** `feedback`  
**Key Format:** `feedback_a8901673:{timestamp_id}`

#### Schema

| Field Name | Data Type | Required | Description | Validation |
|------------|-----------|----------|-------------|------------|
| `id` | String | Yes | Unique identifier | Auto-generated |
| `message` | String | Yes | Feedback message | Max 500 chars |
| `submittedBy` | String | Yes | User ID | UUID |
| `submittedByName` | String | Yes | User name | For display |
| `category` | String (Enum) | Yes | Feedback category | See categories below |
| `status` | String (Enum) | Yes | Review status | "New", "Reviewed", "Implemented" |
| `adminResponse` | String | No | Admin response | Max 500 chars |
| `createdAt` | String (ISO DateTime) | Yes | Submission time | Auto-generated |
| `reviewedAt` | String (ISO DateTime) | No | Review time | Optional |

#### Feedback Categories
- Suggestion
- Complaint
- Question
- Appreciation
- Other

#### Sample Data

```json
// Key: feedback_a8901673:1730880000000
{
  "id": "1730880000000",
  "message": "Can we have more volunteer slots on weekends? Many working members can only help on Saturdays.",
  "submittedBy": "c3d4e5f6-g7h8-9012-cdef-gh3456789012",
  "submittedByName": "Juan Dela Cruz",
  "category": "Suggestion",
  "status": "Reviewed",
  "adminResponse": "Great idea! We'll add Saturday morning shifts starting next month.",
  "createdAt": "2024-11-03T14:00:00.000Z",
  "reviewedAt": "2024-11-04T09:00:00.000Z"
}

// Key: feedback_a8901673:1730900000000
{
  "id": "1730900000000",
  "message": "The new irrigation system is working great! Plants look much healthier.",
  "submittedBy": "b2c3d4e5-f6g7-8901-bcde-fg2345678901",
  "submittedByName": "Maria Santos",
  "category": "Appreciation",
  "status": "Reviewed",
  "adminResponse": "Thank you! We're glad it's making a positive impact.",
  "createdAt": "2024-11-05T10:30:00.000Z",
  "reviewedAt": "2024-11-05T11:00:00.000Z"
}

// Key: feedback_a8901673:1730920000000
{
  "id": "1730920000000",
  "message": "I noticed some lettuce plants have aphids. Should we treat them?",
  "submittedBy": "d4e5f6g7-h8i9-0123-defg-hi4567890123",
  "submittedByName": "Pedro Reyes",
  "category": "Question",
  "status": "Implemented",
  "adminResponse": "Yes, we applied neem oil treatment. Thanks for reporting!",
  "createdAt": "2024-11-04T08:00:00.000Z",
  "reviewedAt": "2024-11-04T10:00:00.000Z"
}
```

---

### Entity 8: User Profile Data

**Logical Table Name:** `user_data`  
**Key Format:** `user_data_a8901673:{user_id}`

#### Schema

| Field Name | Data Type | Required | Description | Validation |
|------------|-----------|----------|-------------|------------|
| `userId` | String (UUID) | Yes | Supabase Auth user ID | From auth.users |
| `name` | String | Yes | Full name | Max 100 chars |
| `email` | String | Yes | Email (denormalized) | From auth.users |
| `bio` | String | No | User bio/description | Max 300 chars |
| `avatarUrl` | String | No | Profile picture URL | Signed URL from Storage |
| `avatarStoragePath` | String | No | Storage path | `avatars/{userId}_{timestamp}` |
| `role` | String (Enum) | Yes | User role | "admin", "member" |
| `phone` | String | No | Contact number | Optional |
| `joinDate` | String (ISO Date) | Yes | Registration date | From auth.users |
| `updatedAt` | String (ISO DateTime) | Yes | Last profile update | Auto-updated |

#### Sample Data

```json
// Key: user_data_a8901673:a1b2c3d4-e5f6-7890-abcd-ef1234567890
{
  "userId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "name": "Francis John Gorres",
  "email": "francisjohngorres@gmail.com",
  "bio": "Barangay Administrator and Community Garden Coordinator. Passionate about sustainable agriculture and community development.",
  "avatarUrl": "https://xxx.supabase.co/storage/v1/object/sign/make-a8901673-avatars/avatars/a1b2c3d4_1730880000000.jpg?token=xxx",
  "avatarStoragePath": "avatars/a1b2c3d4_1730880000000.jpg",
  "role": "admin",
  "phone": "09171234567",
  "joinDate": "2024-11-01",
  "updatedAt": "2024-11-05T16:00:00.000Z"
}

// Key: user_data_a8901673:b2c3d4e5-f6g7-8901-bcde-fg2345678901
{
  "userId": "b2c3d4e5-f6g7-8901-bcde-fg2345678901",
  "name": "Maria Santos",
  "email": "maria.santos@example.com",
  "bio": "Active volunteer since 2024. Love gardening and helping the community!",
  "avatarUrl": null,
  "avatarStoragePath": null,
  "role": "member",
  "phone": "09189876543",
  "joinDate": "2024-11-02",
  "updatedAt": "2024-11-02T10:00:00.000Z"
}

// Key: user_data_a8901673:c3d4e5f6-g7h8-9012-cdef-gh3456789012
{
  "userId": "c3d4e5f6-g7h8-9012-cdef-gh3456789012",
  "name": "Juan Dela Cruz",
  "email": "juan.delacruz@example.com",
  "bio": "Weekend volunteer. Interested in organic farming techniques.",
  "avatarUrl": "https://xxx.supabase.co/storage/v1/object/sign/make-a8901673-avatars/avatars/c3d4e5f6_1730920000000.jpg?token=xxx",
  "avatarStoragePath": "avatars/c3d4e5f6_1730920000000.jpg",
  "role": "member",
  "phone": "09171234567",
  "joinDate": "2024-11-03",
  "updatedAt": "2024-11-04T14:30:00.000Z"
}
```

---

## Relationships & Foreign Keys

Since the system uses a Key-Value Store pattern, traditional foreign key constraints don't exist at the database level. However, logical relationships are maintained through application code:

### Relationship Diagram

```
┌─────────────────┐
│   auth.users    │
│   (Supabase)    │
└────────┬────────┘
         │
         │ 1:1
         │
         ▼
┌─────────────────┐      ┌─────────────────┐
│   user_data     │      │     crops       │
└─────────────────┘      └────────┬────────┘
                                  │
                                  │ 1:N
                                  │
                                  ▼
                         ┌─────────────────┐
                         │    harvests     │
                         └─────────────────┘

┌─────────────────┐
│   auth.users    │
└────────┬────────┘
         │
         │ 1:N
         │
         ▼
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│     gallery     │      │      polls      │      │    feedback     │
└─────────────────┘      └─────────────────┘      └─────────────────┘

┌─────────────────┐      ┌─────────────────┐
│     budget      │      │   volunteers    │
└─────────────────┘      └─────────────────┘
```

### Relationship Details

| Parent Entity | Child Entity | Relationship | Join Condition | Enforced By |
|--------------|--------------|--------------|----------------|-------------|
| `crops` | `harvests` | One-to-Many | `crops.id = harvests.cropId` | Application |
| `auth.users` | `user_data` | One-to-One | `auth.users.id = user_data.userId` | Application |
| `auth.users` | `gallery` | One-to-Many | `auth.users.id = gallery.uploadedBy` | Application |
| `auth.users` | `polls` | One-to-Many | `auth.users.id = polls.createdBy` | Application |
| `auth.users` | `feedback` | One-to-Many | `auth.users.id = feedback.submittedBy` | Application |

### Referential Integrity Rules (Application-Level)

1. **Harvest → Crop Reference**
   - Before creating a harvest, verify crop exists
   - Crop name is denormalized for display (no joins needed)
   - Orphaned harvests are prevented at API level

2. **Gallery → User Reference**
   - User ID stored in `uploadedBy` field
   - User name denormalized for display
   - Deleting user doesn't cascade delete photos (business rule)

3. **Polls/Feedback → User Reference**
   - Creator/submitter ID stored
   - User name denormalized for performance
   - Historical data preserved even if user account deleted

---

## Storage Buckets

### Bucket 1: `make-a8901673-gallery`

**Purpose:** Store community garden photos

| Property | Value |
|----------|-------|
| Bucket Name | `make-a8901673-gallery` |
| Privacy | Private (requires signed URLs) |
| File Path Pattern | `gallery/{timestamp}_{original_filename}` |
| Allowed File Types | image/jpeg, image/png, image/webp |
| Max File Size | 5 MB |
| Signed URL Duration | 1 hour |

**Sample Files:**
```
make-a8901673-gallery/
├── gallery/
│   ├── 1730880000000_tomatoes.jpg
│   ├── 1730900000000_harvest.jpg
│   ├── 1730920000000_irrigation.jpg
│   └── 1730940000000_volunteers.jpg
```

---

### Bucket 2: `make-a8901673-avatars`

**Purpose:** Store user profile pictures

| Property | Value |
|----------|-------|
| Bucket Name | `make-a8901673-avatars` |
| Privacy | Private (requires signed URLs) |
| File Path Pattern | `avatars/{userId}_{timestamp}.{ext}` |
| Allowed File Types | image/jpeg, image/png |
| Max File Size | 2 MB |
| Signed URL Duration | 1 hour |

**Sample Files:**
```
make-a8901673-avatars/
├── avatars/
│   ├── a1b2c3d4_1730880000000.jpg
│   ├── c3d4e5f6_1730920000000.jpg
│   └── b2c3d4e5_1730940000000.png
```

---

## Indexes & Performance

### Primary Indexes

1. **kv_store_a8901673 PRIMARY KEY (key)**
   - Automatically created on primary key
   - B-tree index for exact key lookups
   - O(log n) lookup time

2. **kv_store_a8901673 GIN Index on value**
   ```sql
   CREATE INDEX idx_kv_value_gin ON kv_store_a8901673 USING GIN (value);
   ```
   - Supports JSON field queries
   - Used for searching within JSON data

3. **kv_store_a8901673 Prefix Index**
   ```sql
   CREATE INDEX idx_kv_key_prefix ON kv_store_a8901673 (key text_pattern_ops);
   ```
   - Optimizes `getByPrefix()` queries
   - Speeds up queries like `key LIKE 'crops_a8901673:%'`

### Query Performance Examples

| Operation | Method | Index Used | Time Complexity |
|-----------|--------|------------|-----------------|
| Get single crop | `kv.get('crops_a8901673:123')` | PRIMARY KEY | O(log n) |
| Get all crops | `kv.getByPrefix('crops_a8901673')` | Prefix Index | O(m log n) |
| Get all harvests | `kv.getByPrefix('harvests_a8901673')` | Prefix Index | O(m log n) |
| Search budget by category | JSON query in app | GIN Index | O(m) |

*where n = total records, m = matching records*

---

## Data Integrity Rules

### Validation Rules

#### 1. Crops Entity
- ✓ Name cannot be empty
- ✓ Planting date cannot be in the future
- ✓ Expected harvest must be after planting date
- ✓ Health status must be one of: Healthy, Needs Attention, Critical
- ✓ Stage must be one of: Seedling, Growing, Mature, Harvested
- ✓ Status must be one of: Active, Harvested, Failed

#### 2. Harvests Entity
- ✓ Crop ID must reference existing crop
- ✓ Harvest date cannot be before planting date
- ✓ Quantity must be positive number
- ✓ Quality must be one of: Excellent, Good, Fair, Poor

#### 3. Budget Entity
- ✓ Amount must be positive number
- ✓ Category must be from predefined list
- ✓ Type must be Income or Expense
- ✓ Date cannot be in the future

#### 4. Volunteers Entity
- ✓ Name cannot be empty
- ✓ Date cannot be in the past (for new assignments)
- ✓ Status must be one of: Pending, In Progress, Completed

#### 5. Gallery Entity
- ✓ File must be image type (jpeg, png, webp)
- ✓ File size must be under 5 MB
- ✓ Description required

#### 6. User Data Entity
- ✓ Email must be unique (enforced by Supabase Auth)
- ✓ Email must be valid format
- ✓ Admin role only for francisjohngorres@gmail.com

---

### Business Rules

1. **Admin Privileges**
   - Only admin can create/update/delete crops, harvests, budget, volunteers, gallery
   - Admin detected by email: francisjohngorres@gmail.com
   - Regular users have read-only access (except feedback submission)

2. **Harvest Rules**
   - Cannot harvest a crop before its planting date
   - Harvesting a crop should update crop status to "Harvested"
   - Total yield calculated from all harvest records

3. **Budget Rules**
   - Transparent to all users (read access)
   - Balance = Total Income - Total Expenses
   - Negative balance indicates deficit

4. **Poll Rules**
   - Only admins can create polls
   - All authenticated users can vote
   - Each user can vote once per poll (tracked in frontend state)
   - Closed polls cannot receive new votes

5. **Storage Rules**
   - Photos automatically deleted from Storage when record deleted from KV Store
   - Signed URLs expire after 1 hour (regenerated on each fetch)
   - Duplicate uploads allowed (unique timestamp in filename)

---

## Database Queries (via KV Store API)

### Common Queries

#### 1. Get All Crops
```typescript
// Server-side: /supabase/functions/server/index.tsx
const crops = await kv.getByPrefix('crops_a8901673');
// Returns: Array of crop objects
```

#### 2. Get Single Harvest
```typescript
const harvest = await kv.get(`harvests_a8901673:${harvestId}`);
// Returns: Single harvest object or null
```

#### 3. Create Budget Transaction
```typescript
const transaction = {
  id: Date.now().toString(),
  description: "Seeds purchase",
  category: "Seeds",
  amount: 500,
  type: "Expense",
  date: "2024-11-06",
  createdAt: new Date().toISOString()
};
await kv.set(`budget_a8901673:${transaction.id}`, transaction);
```

#### 4. Update Volunteer Task
```typescript
const taskId = "1730880000000";
const task = await kv.get(`volunteers_a8901673:${taskId}`);
task.status = "Completed";
task.updatedAt = new Date().toISOString();
await kv.set(`volunteers_a8901673:${taskId}`, task);
```

#### 5. Delete Photo
```typescript
// Delete from KV Store
await kv.del(`gallery_a8901673:${photoId}`);

// Delete from Storage
await supabase.storage
  .from('make-a8901673-gallery')
  .remove([storagePath]);
```

#### 6. Get All Users (Admin Only)
```typescript
// Get from Supabase Auth
const { data: authUsers } = await supabase.auth.admin.listUsers();

// Get profile data from KV Store
const profilePromises = authUsers.users.map(user =>
  kv.get(`user_data_a8901673:${user.id}`)
);
const profiles = await Promise.all(profilePromises);

// Merge data
const users = authUsers.users.map((user, i) => ({
  ...user,
  profile: profiles[i]
}));
```

---

## Database Backup & Recovery

### Current Strategy

**Automated Backups:**
- Supabase automatically backs up the entire database daily
- Point-in-time recovery available (Supabase Pro plan)
- Backups retained for 7 days (default)

**Manual Export:**
```typescript
// Export all data to JSON
const allData = {
  crops: await kv.getByPrefix('crops_a8901673'),
  harvests: await kv.getByPrefix('harvests_a8901673'),
  budget: await kv.getByPrefix('budget_a8901673'),
  volunteers: await kv.getByPrefix('volunteers_a8901673'),
  gallery: await kv.getByPrefix('gallery_a8901673'),
  polls: await kv.getByPrefix('polls_a8901673'),
  feedback: await kv.getByPrefix('feedback_a8901673'),
  userData: await kv.getByPrefix('user_data_a8901673')
};

// Download as JSON file
const blob = new Blob([JSON.stringify(allData, null, 2)], {
  type: 'application/json'
});
```

---

## Future Database Enhancements

### Potential Improvements

1. **Normalized Tables**
   - Migrate from KV Store to proper PostgreSQL tables
   - Implement foreign key constraints
   - Add database-level validation

2. **Full-Text Search**
   - Add PostgreSQL full-text search indexes
   - Enable searching across crops, harvests, feedback

3. **Audit Logging**
   - Track all data modifications
   - Store who changed what and when
   - Enable rollback capabilities

4. **Real-Time Subscriptions**
   - Use Supabase real-time features
   - Live updates without polling
   - Instant notifications to all users

5. **Data Archiving**
   - Move old harvests to archive table
   - Separate active/historical data
   - Improve query performance

6. **Analytics Tables**
   - Pre-computed aggregations
   - Faster dashboard loading
   - Historical trend analysis

---

## Entity-Relationship Diagram (ERD) - Text Format

```
┌───────────────────────────────────────────────┐
│              auth.users (Supabase)            │
├───────────────────────────────────────────────┤
│ PK: id (UUID)                                 │
│ UK: email (VARCHAR)                           │
│     encrypted_password (TEXT)                 │
│     email_confirmed_at (TIMESTAMP)            │
│     raw_user_meta_data (JSONB)                │
│     created_at (TIMESTAMP)                    │
└──────────────────┬────────────────────────────┘
                   │
                   │ 1:1
                   │
                   ▼
┌───────────────────────────────────────────────┐
│              user_data                        │
├───────────────────────────────────────────────┤
│ PK: userId (UUID) FK→auth.users.id            │
│     name (STRING)                             │
│     email (STRING)                            │
│     bio (STRING)                              │
│     avatarUrl (STRING)                        │
│     avatarStoragePath (STRING)                │
│     role (ENUM: admin, member)                │
│     phone (STRING)                            │
│     joinDate (DATE)                           │
│     updatedAt (DATETIME)                      │
└───────────────────────────────────────────────┘

┌───────────────────────────────────────────────┐
│                   crops                       │
├───────────────────────────────────────────────┤
│ PK: id (STRING)                               │
│     name (STRING)                             │
│     plantingDate (DATE)                       │
│     expectedHarvest (DATE)                    │
│     health (ENUM)                             │
│     stage (ENUM)                              │
│     status (ENUM)                             │
│     notes (STRING)                            │
│     createdAt (DATETIME)                      │
│     updatedAt (DATETIME)                      │
└──────────────────┬────────────────────────────┘
                   │
                   │ 1:N
                   │
                   ▼
┌───────────────────────────────────────────────┐
│                harvests                       │
├───────────────────────────────────────────────┤
│ PK: id (STRING)                               │
│ FK: cropId → crops.id                         │
│     cropName (STRING) [denormalized]          │
│     harvestDate (DATE)                        │
│     quantity (NUMBER)                         │
│     quality (ENUM)                            │
│     notes (STRING)                            │
│     createdAt (DATETIME)                      │
└───────────────────────────────────────────────┘

┌───────────────────────────────────────────────┐
│                  budget                       │
├───────────────────────────────────────────────┤
│ PK: id (STRING)                               │
│     description (STRING)                      │
│     category (ENUM)                           │
│     amount (NUMBER)                           │
│     type (ENUM: Income, Expense)              │
│     date (DATE)                               │
│     receipt (STRING)                          │
│     createdAt (DATETIME)                      │
└───────────────────────────────────────────────┘

┌───────────────────────────────────────────────┐
│               volunteers                      │
├───────────────────────────────────────────────┤
│ PK: id (STRING)                               │
│     name (STRING)                             │
│     task (STRING)                             │
│     date (DATE)                               │
│     status (ENUM)                             │
│     contactNumber (STRING)                    │
│     notes (STRING)                            │
│     createdAt (DATETIME)                      │
│     updatedAt (DATETIME)                      │
└───────────────────────────────────────────────┘

┌───────────────────────────────────────────────┐
│                 gallery                       │
├───────────────────────────────────────────────┤
│ PK: id (STRING)                               │
│ FK: uploadedBy → auth.users.id                │
│     imageUrl (STRING)                         │
│     storagePath (STRING)                      │
│     description (STRING)                      │
│     uploadedByName (STRING) [denormalized]    │
│     uploadDate (DATE)                         │
│     createdAt (DATETIME)                      │
└───────────────────────────────────────────────┘

┌───────────────────────────────────────────────┐
│                  polls                        │
├───────────────────────────────────────────────┤
│ PK: id (STRING)                               │
│ FK: createdBy → auth.users.id                 │
│     question (STRING)                         │
│     options (ARRAY<OBJECT>)                   │
│       └─ text (STRING)                        │
│       └─ votes (NUMBER)                       │
│     createdByName (STRING) [denormalized]     │
│     status (ENUM)                             │
│     createdAt (DATETIME)                      │
│     closedAt (DATETIME)                       │
└───────────────────────────────────────────────┘

┌───────────────────────────────────────────────┐
│                feedback                       │
├───────────────────────────────────────────────┤
│ PK: id (STRING)                               │
│ FK: submittedBy → auth.users.id               │
│     message (STRING)                          │
│     submittedByName (STRING) [denormalized]   │
│     category (ENUM)                           │
│     status (ENUM)                             │
│     adminResponse (STRING)                    │
│     createdAt (DATETIME)                      │
│     reviewedAt (DATETIME)                     │
└───────────────────────────────────────────────┘

┌───────────────────────────────────────────────┐
│          Supabase Storage Buckets             │
├───────────────────────────────────────────────┤
│ make-a8901673-gallery                         │
│   └─ gallery/{timestamp}_{filename}           │
│                                               │
│ make-a8901673-avatars                         │
│   └─ avatars/{userId}_{timestamp}.{ext}       │
└───────────────────────────────────────────────┘
```

---

## Database Statistics (Sample)

### Current Data Volume (Hypothetical Production)

| Entity | Record Count | Avg Size (KB) | Total Size (KB) |
|--------|--------------|---------------|-----------------|
| Crops | 45 | 0.5 | 22.5 |
| Harvests | 123 | 0.3 | 36.9 |
| Budget | 87 | 0.4 | 34.8 |
| Volunteers | 156 | 0.6 | 93.6 |
| Gallery | 234 | 1.2 | 280.8 |
| Polls | 12 | 0.8 | 9.6 |
| Feedback | 78 | 0.5 | 39.0 |
| User Data | 34 | 0.7 | 23.8 |
| **Total** | **769** | - | **541 KB** |

### Storage Usage

| Bucket | File Count | Total Size (MB) |
|--------|------------|-----------------|
| make-a8901673-gallery | 234 | 487.2 |
| make-a8901673-avatars | 34 | 12.8 |
| **Total** | **268** | **500 MB** |

---

## SQL Equivalent Queries

For reference, here are SQL equivalents of common operations (if the system used traditional tables):

### Create Crop
```sql
INSERT INTO crops (id, name, planting_date, expected_harvest, health, stage, status, created_at, updated_at)
VALUES ('1730880000000', 'Tomatoes', '2024-11-01', '2025-01-15', 'Healthy', 'Growing', 'Active', NOW(), NOW());
```

### Get All Active Crops
```sql
SELECT * FROM crops WHERE status = 'Active' ORDER BY planting_date DESC;
```

### Get Harvests with Crop Names
```sql
SELECT h.*, c.name as crop_name
FROM harvests h
JOIN crops c ON h.crop_id = c.id
ORDER BY h.harvest_date DESC;
```

### Calculate Total Budget Balance
```sql
SELECT
  SUM(CASE WHEN type = 'Income' THEN amount ELSE 0 END) as total_income,
  SUM(CASE WHEN type = 'Expense' THEN amount ELSE 0 END) as total_expenses,
  SUM(CASE WHEN type = 'Income' THEN amount ELSE -amount END) as balance
FROM budget;
```

### Get Poll Results
```sql
SELECT
  p.question,
  jsonb_array_elements(p.options) as option
FROM polls p
WHERE p.id = '1730880000000';
```

---

## Database Migration Path (Future)

If the system needs to scale, here's the recommended migration path:

### Phase 1: Export Data
```typescript
// Export all data from KV Store
const backup = {
  crops: await kv.getByPrefix('crops_a8901673'),
  harvests: await kv.getByPrefix('harvests_a8901673'),
  // ... other entities
};
```

### Phase 2: Create Normalized Tables
```sql
CREATE TABLE crops (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  planting_date DATE NOT NULL,
  expected_harvest DATE NOT NULL,
  health VARCHAR(20) NOT NULL,
  stage VARCHAR(20) NOT NULL,
  status VARCHAR(20) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE harvests (
  id BIGSERIAL PRIMARY KEY,
  crop_id BIGINT REFERENCES crops(id) ON DELETE CASCADE,
  harvest_date DATE NOT NULL,
  quantity DECIMAL(10,2) NOT NULL,
  quality VARCHAR(20) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ... other tables
```

### Phase 3: Import Data
```typescript
// Transform and import
for (const crop of backup.crops) {
  await supabase
    .from('crops')
    .insert(crop);
}
```

### Phase 4: Update Application Code
- Replace `kv.get()` with `supabase.from('table').select()`
- Replace `kv.set()` with `supabase.from('table').insert()`
- Add proper foreign key handling

---

**Document Version:** 1.0  
**Last Updated:** November 6, 2025  
**System:** Plant n' Plan - Barangay Community Farming System
