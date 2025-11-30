# Bus API Documentation

Complete API documentation for bus and seat management endpoints.

## Base URL
```
http://localhost:8010/v1/buses
```

## Authentication
Most endpoints require authentication via `accessToken` cookie and appropriate RBAC permissions.

---

## Table of Contents

1. [Bus CRUD Operations](#bus-crud-operations)
2. [Seat Management](#seat-management)
3. [Public Endpoints](#public-endpoints)
4. [Request/Response Examples](#requestresponse-examples)
5. [Error Handling](#error-handling)

---

## Bus CRUD Operations

### 1. Create Bus

Create a new bus for an operator.

**Endpoint:** `POST /v1/buses`

**Permission:** `MANAGE_BUSES` (admin, operator)

**Request Body:**
```json
{
  "operatorId": "uuid-of-operator",
  "plateNumber": "29A-12345",
  "model": "Hyundai Universe",
  "seatCapacity": 45,
  "amenities": {
    "wifi": true,
    "ac": true,
    "restroom": false,
    "entertainment": true,
    "usb_charging": true,
    "reclining_seats": true,
    "reading_light": false,
    "blanket": false,
    "water": true
  }
}
```

**Validation Rules:**
- `operatorId`: Required, must be valid UUID
- `plateNumber`: Required, 5-20 chars, uppercase letters/numbers/hyphens only
- `model`: Required, 2-100 chars
- `seatCapacity`: Required, integer 1-100
- `amenities`: Optional object with boolean values

**Response:** `201 Created`
```json
{
  "id": "bus-uuid",
  "operator_id": "operator-uuid",
  "plate_number": "29A-12345",
  "model": "Hyundai Universe",
  "seat_capacity": 45,
  "amenities_json": "{...}",
  "amenities": {
    "wifi": true,
    "ac": true,
    ...
  },
  "operator": {
    "id": "...",
    "name": "..."
  },
  "seats": []
}
```

---

### 2. List Buses (with Pagination)

Get list of all buses with filtering and pagination.

**Endpoint:** `GET /v1/buses`

**Permission:** `READ_BUSES` (admin, operator, client)

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `operatorId` (optional): Filter by operator
- `plateNumber` (optional): Search by plate number (partial match)
- `minCapacity` (optional): Minimum seat capacity
- `search` (optional): Search in plate number or model

**Example Request:**
```
GET /v1/buses?page=1&limit=10&operatorId=uuid&minCapacity=40
```

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "bus-uuid",
      "plate_number": "29A-12345",
      "model": "Hyundai Universe",
      "seat_capacity": 45,
      "amenities": {...},
      "operator": {...},
      "seats": [...]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

**Operator Behavior:**
- Operators automatically see only their own buses
- Admins see all buses

---

### 3. Get Bus Details

Get detailed information about a specific bus.

**Endpoint:** `GET /v1/buses/:id`

**Permission:** `READ_BUSES`

**Response:** `200 OK`
```json
{
  "id": "bus-uuid",
  "operator_id": "operator-uuid",
  "plate_number": "29A-12345",
  "model": "Hyundai Universe",
  "seat_capacity": 45,
  "amenities": {
    "wifi": true,
    "ac": true,
    ...
  },
  "operator": {
    "id": "operator-uuid",
    "name": "ABC Bus Company",
    "contact_email": "contact@abc.com"
  },
  "seats": [
    {
      "id": "seat-uuid",
      "seat_number": "A1",
      "seat_type": "regular",
      "is_active": true
    },
    ...
  ]
}
```

---

### 4. Update Bus

Update bus information.

**Endpoint:** `PUT /v1/buses/:id`

**Permission:** `MANAGE_BUSES`

**Request Body:** (all fields optional)
```json
{
  "plateNumber": "29A-54321",
  "model": "Mercedes-Benz Travego",
  "seatCapacity": 50,
  "amenities": {
    "wifi": true,
    "ac": true,
    "restroom": true
  }
}
```

**Validation:**
- At least one field must be provided
- Plate number uniqueness check
- Operators can only update their own buses

**Response:** `200 OK` (same structure as Get Bus)

---

### 5. Delete Bus

Delete a bus from the system.

**Endpoint:** `DELETE /v1/buses/:id`

**Permission:** `MANAGE_BUSES`

**Constraints:**
- Cannot delete bus with active/scheduled trips
- Operators can only delete their own buses

**Response:** `200 OK`
```json
{
  "deleted": true
}
```

---

## Seat Management

### 6. Create Seats

Manually create seats for a bus.

**Endpoint:** `POST /v1/buses/:busId/seats`

**Permission:** `MANAGE_BUSES`

**Request Body:**
```json
{
  "seats": [
    {
      "seatNumber": "A1",
      "seatType": "regular",
      "isActive": true
    },
    {
      "seatNumber": "A2",
      "seatType": "regular",
      "isActive": true
    },
    {
      "seatNumber": "VIP1",
      "seatType": "premium",
      "isActive": true
    }
  ]
}
```

**Validation:**
- `seatNumber`: Required, 1-10 chars, uppercase letters/numbers only
- `seatType`: Optional, one of: regular, premium, sleeper (default: regular)
- `isActive`: Optional, boolean (default: true)
- No duplicate seat numbers

**Response:** `201 Created`
```json
[
  {
    "id": "seat-uuid-1",
    "bus_id": "bus-uuid",
    "seat_number": "A1",
    "seat_type": "regular",
    "is_active": true
  },
  ...
]
```

---

### 7. Auto-Generate Seats

Automatically generate seat layout based on configuration.

**Endpoint:** `POST /v1/buses/:busId/seats/generate`

**Permission:** `MANAGE_BUSES`

**Request Body:**
```json
{
  "layout": "2-2",
  "rows": 11,
  "seatType": "regular",
  "startRow": 1
}
```

**Parameters:**
- `layout`: Required, one of: "2-2", "2-3", "1-2", "2-1"
  - Format: `{left seats}-{right seats}`
  - "2-2" = 2 seats on left side of aisle, 2 on right
- `rows`: Required, integer 1-20
- `seatType`: Optional, default "regular"
- `startRow`: Optional, default 1

**Example Layouts:**
- `"2-2"` with 10 rows = 40 seats (A1, B1, C1, D1, A2, B2, C2, D2, ...)
- `"2-3"` with 10 rows = 50 seats
- `"1-2"` with 10 rows = 30 seats

**Generated Seat Pattern:**
```
Row 1: A1  B1  | aisle |  D1  E1  F1  (layout: 2-3)
Row 2: A2  B2  | aisle |  D2  E2  F2
...
```

**Response:** `201 Created` (array of generated seats)

---

### 8. List Seats

Get all seats for a bus.

**Endpoint:** `GET /v1/buses/:busId/seats`

**Permission:** `READ_BUSES`

**Query Parameters:**
- `includeInactive` (optional): Include inactive seats (default: false)

**Response:** `200 OK`
```json
[
  {
    "id": "seat-uuid",
    "bus_id": "bus-uuid",
    "seat_number": "A1",
    "seat_type": "regular",
    "is_active": true
  },
  ...
]
```

---

### 9. Update Seat

Update a specific seat.

**Endpoint:** `PUT /v1/buses/:busId/seats/:seatId`

**Permission:** `MANAGE_BUSES`

**Request Body:** (all fields optional)
```json
{
  "seatNumber": "A1-NEW",
  "seatType": "premium",
  "isActive": false
}
```

**Response:** `200 OK` (updated seat object)

---

### 10. Delete Seat

Delete a seat from a bus.

**Endpoint:** `DELETE /v1/buses/:busId/seats/:seatId`

**Permission:** `MANAGE_BUSES`

**Constraints:**
- Cannot delete seat with active bookings
- Consider deactivating instead

**Response:** `200 OK`
```json
{
  "deleted": true
}
```

---

## Public Endpoints

### 11. Search Buses

Search for available buses (public access).

**Endpoint:** `GET /v1/buses/search`

**Permission:** None (public)

**Query Parameters:**
- `originStopId`: UUID of origin stop
- `destinationStopId`: UUID of destination stop
- `date`: Travel date (YYYY-MM-DD)
- `seatType`: Filter by seat type (regular, premium, sleeper)
- `minSeats`: Minimum available seats
- `amenities`: Comma-separated list (e.g., "wifi,ac,restroom")

**Example:**
```
GET /v1/buses/search?originStopId=uuid1&destinationStopId=uuid2&date=2025-12-01&amenities=wifi,ac
```

**Response:** `200 OK`
```json
[
  {
    "id": "bus-uuid",
    "plate_number": "29A-12345",
    "model": "Hyundai Universe",
    "seat_capacity": 45,
    "amenities": {...},
    "operator": {...},
    "seats": [...],
    "trips": [
      {
        "id": "trip-uuid",
        "departure_time": "2025-12-01T08:00:00Z",
        "arrival_time": "2025-12-01T14:30:00Z",
        "base_price": "250000.00",
        "status": "scheduled",
        "route": {
          "originStop": {...},
          "destinationStop": {...}
        }
      }
    ]
  }
]
```

---

### 12. Get Seat Layout

Get visual seat layout for booking.

**Endpoint:** `GET /v1/buses/:busId/layout`

**Permission:** None (public)

**Query Parameters:**
- `tripId` (optional): If provided, shows seat availability for that trip

**Response:** `200 OK`
```json
[
  {
    "id": "seat-uuid",
    "bus_id": "bus-uuid",
    "seat_number": "A1",
    "seat_type": "regular",
    "is_active": true,
    "availability": {
      "status": "available",
      "locked_until": null
    }
  },
  {
    "id": "seat-uuid-2",
    "seat_number": "A2",
    "seat_type": "regular",
    "is_active": true,
    "availability": {
      "status": "booked",
      "locked_until": null
    }
  }
]
```

---

### 13. Get Bus Trips

Get schedule/trips for a bus.

**Endpoint:** `GET /v1/buses/:busId/trips`

**Permission:** None (public)

**Query Parameters:**
- `status`: Filter by status (scheduled, active, completed, cancelled)
- `startDate`: Start date filter
- `endDate`: End date filter

**Response:** `200 OK` (bus object with trips array)

---

### 14. Check Bus Availability

Check if bus is available on specific dates.

**Endpoint:** `GET /v1/buses/:busId/availability`

**Permission:** None (public)

**Query Parameters:**
- `startDate`: Required
- `endDate`: Required

**Response:** `200 OK`
```json
{
  "busId": "bus-uuid",
  "plateNumber": "29A-12345",
  "trips": [...],
  "hasAvailability": true
}
```

---

## Request/Response Examples

### Complete Create Bus Flow

**1. Create Bus:**
```bash
curl -X POST http://localhost:8010/v1/buses \
  -H "Content-Type: application/json" \
  -H "Cookie: accessToken=your-token" \
  -d '{
    "operatorId": "op-uuid",
    "plateNumber": "29A-12345",
    "model": "Hyundai Universe",
    "seatCapacity": 45,
    "amenities": {
      "wifi": true,
      "ac": true,
      "restroom": false
    }
  }'
```

**2. Generate Seats:**
```bash
curl -X POST http://localhost:8010/v1/buses/bus-uuid/seats/generate \
  -H "Content-Type: application/json" \
  -H "Cookie: accessToken=your-token" \
  -d '{
    "layout": "2-2",
    "rows": 11,
    "seatType": "regular"
  }'
```

**3. List Buses with Pagination:**
```bash
curl http://localhost:8010/v1/buses?page=1&limit=10&minCapacity=40 \
  -H "Cookie: accessToken=your-token"
```

---

## Error Handling

### Common Error Responses

**400 Bad Request** - Validation Error
```json
{
  "statusCode": 422,
  "message": "\"plateNumber\" must only contain uppercase letters, numbers, and hyphens"
}
```

**401 Unauthorized** - Missing/Invalid Token
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

**403 Forbidden** - Insufficient Permissions
```json
{
  "statusCode": 403,
  "message": "You do not have permission to manage this bus"
}
```

**404 Not Found**
```json
{
  "statusCode": 404,
  "message": "Bus not found"
}
```

**409 Conflict** - Business Logic Violation
```json
{
  "statusCode": 409,
  "message": "Bus with this plate number already exists"
}
```

```json
{
  "statusCode": 409,
  "message": "Cannot delete bus with active or scheduled trips"
}
```

---

## Permission Matrix

| Endpoint | Admin | Operator | Client |
|----------|-------|----------|--------|
| POST /buses | ✅ All | ✅ Own | ❌ |
| GET /buses | ✅ All | ✅ Own | ✅ View |
| GET /buses/:id | ✅ | ✅ | ✅ |
| PUT /buses/:id | ✅ All | ✅ Own | ❌ |
| DELETE /buses/:id | ✅ All | ✅ Own | ❌ |
| POST /buses/:id/seats | ✅ All | ✅ Own | ❌ |
| GET /buses/:id/seats | ✅ | ✅ | ✅ |
| PUT /buses/:id/seats/:sid | ✅ All | ✅ Own | ❌ |
| DELETE /buses/:id/seats/:sid | ✅ All | ✅ Own | ❌ |
| GET /buses/search | ✅ | ✅ | ✅ Public |
| GET /buses/:id/layout | ✅ | ✅ | ✅ Public |
| GET /buses/:id/trips | ✅ | ✅ | ✅ Public |

---

## Business Rules

1. **Plate Numbers:**
   - Must be unique across all buses
   - Uppercase letters, numbers, and hyphens only
   - 5-20 characters

2. **Operator Ownership:**
   - Operators can only manage their own buses
   - Admins can manage all buses
   - Validated at service layer

3. **Seat Management:**
   - Seat numbers must be unique within a bus
   - Cannot delete seats with active bookings
   - Deactivate instead of deleting when possible

4. **Bus Deletion:**
   - Cannot delete bus with active or scheduled trips
   - Must cancel/complete all trips first

5. **Capacity:**
   - Generated seats cannot exceed bus seat_capacity
   - Actual seat count should match declared capacity

---

## Related Documentation

- [Database Design](./dbs/DATABASE_DESIGN.md)
- [Routes & Stops API](./ROUTES_STOPS.md)
- [API Documentation Guide](./dbs/API_DOCUMENTATION_GUIDE.md)

---

## Testing with Postman

Import this collection structure:

```
Bus Booking API/
├── Buses/
│   ├── Create Bus
│   ├── List Buses (with pagination)
│   ├── Get Bus
│   ├── Update Bus
│   └── Delete Bus
├── Seats/
│   ├── Create Seats
│   ├── Generate Seats
│   ├── List Seats
│   ├── Update Seat
│   └── Delete Seat
└── Public/
    ├── Search Buses
    ├── Get Seat Layout
    ├── Get Bus Trips
    └── Check Availability
```

**Environment Variables:**
```
baseUrl: http://localhost:8010/v1
accessToken: your-jwt-token
busId: test-bus-uuid
operatorId: test-operator-uuid
```
