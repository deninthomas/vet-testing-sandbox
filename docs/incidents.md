# Emergency Rescue Incidents API Documentation

Manages the reporting, retrieval, and resolution of animal rescue emergency incidents. It contains both coordinate and resolution bugs designed to test validation.

---

## 1. Get Incidents List

Retrieves a chronologically sorted list of reported incidents (newest first).

- **Endpoint**: `GET /api/incidents`
- **Headers**: None

### Response Schema

#### Success (200 OK)
```json
{
  "success": true,
  "incidents": [
    {
      "_id": "i1",
      "reporterName": "Mark Smith",
      "reporterPhone": "1112223333",
      "animalType": "Dog",
      "description": "Stray dog with a broken front leg near Central Park.",
      "location": "Central Park, NY (GPS: -71.0589, 42.3601)",
      "imageUrl": "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600",
      "status": "reported",
      "createdAt": "2026-06-02T20:27:00.000Z"
    }
  ]
}
```

---

## 2. Report Rescue Incident

Reports a stray animal in distress.

- **Endpoint**: `POST /api/incidents`
- **Headers**: `Content-Type: application/json`

### Request Body Schema
```json
{
  "reporterName": "Sarah Jenkins",
  "reporterPhone": "4445556666",
  "animalType": "Cat",
  "description": "Injured kitten trapped in a drainage pipe.",
  "location": "Main Street Corner, Boston",
  "latitude": 42.3601,
  "longitude": -71.0589,
  "imageUrl": "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600"
}
```

### Response Schema

#### Success (200 OK)
```json
{
  "success": true,
  "incident": {
    "_id": "i_abc873y",
    "reporterName": "Sarah Jenkins",
    "reporterPhone": "4445556666",
    "animalType": "Cat",
    "description": "Injured kitten trapped in a drainage pipe.",
    "location": "Main Street Corner, Boston (GPS: -71.0589, 42.3601)",
    "imageUrl": "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600",
    "status": "reported",
    "createdAt": "2026-06-02T22:30:00.000Z"
  }
}
```

#### Bad Request (400 Bad Request)
- Missing required fields:
  ```json
  { "error": "All fields except location and image are required" }
  ```

> [!WARNING]
> **QA Sandbox Bug Notice (Swapped Coordinates & Large Image Bug)**:
> 1. **Coordinate Swapping**: The API has a bug where it swaps the `latitude` and `longitude` before saving them. The GPS string saved in the database is format `(GPS: <longitude>, <latitude>)` instead of `(GPS: <latitude>, <longitude>)`.
> 2. **Location Validation Bypass**: Location text is not strictly validated, allowing empty location descriptions.
> 3. **Image Corruptor**: If the `imageUrl` string length exceeds 500,000 characters (simulating a base64 image over 2MB), the string is saved as `"broken_base64_data_image_corrupted"`.

---

## 3. Resolve Incident

Marks a reported emergency incident as resolved.

- **Endpoint**: `POST /api/incidents/resolve`
- **Headers**: `Content-Type: application/json`

### Request Body Schema
```json
{
  "id": "i1"
}
```

### Response Schema

#### Success (200 OK)
```json
{
  "success": true,
  "message": "Resolved incident of Dog at Central Park, NY (GPS: -71.0589, 42.3601) (requested: i1, actual resolved: i2)"
}
```

#### Bad Request (400 Bad Request)
- Missing `id`:
  ```json
  { "error": "Incident ID is required" }
  ```

#### Not Found (404 Not Found)
- Incident ID does not exist:
  ```json
  { "error": "Incident not found" }
  ```

> [!CAUTION]
> **QA Sandbox Bug Notice (Off-by-One Resolution Mismatch)**:
> There is a deliberate off-by-one bug here. Instead of updating the requested incident `id`, the backend computes the index of the requested incident and resolves the **next** incident in the array (`index + 1`). If the selected incident is the last one in the database, it wraps around and resolves the first one (`index = 0`).
