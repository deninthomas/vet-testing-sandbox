# Adoption Board API Documentation

Manages the pet profiles showcased on the adoption board, listing animals available for adoption, adding new profiles, and processing application requests.

---

## 1. Get Adoption Board Animals

Retrieves a list of animals for display on the adoption board.

- **Endpoint**: `GET /api/adoption`
- **Headers**: None

### Response Schema

#### Success (200 OK)
```json
{
  "success": true,
  "animals": [
    {
      "_id": "a1",
      "name": "Buddy",
      "species": "Dog",
      "breed": "Golden Retriever Mix",
      "age": "2 years",
      "healthStatus": "Healthy (Vaccinated)",
      "temperament": "Friendly, playful, energetic",
      "imageUrl": "https://images.unsplash.com/photo-1552053831-71594a27632d?w=600",
      "status": "available",
      "createdAt": "2026-06-02T22:30:00.000Z"
    },
    {
      "_id": "a3",
      "name": "Max",
      "species": "Dog",
      "breed": "German Shepherd",
      "age": "3 years",
      "healthStatus": "Healthy",
      "temperament": "Protective, alert, trained",
      "imageUrl": "https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=600",
      "status": "adopted",
      "createdAt": "2026-06-01T15:00:00.000Z"
    }
  ]
}
```

> [!WARNING]
> **QA Sandbox Bug Notice (Adoption Filtering Issue)**:
> Instead of filtering and returning only animals with `status = 'available'`, the GET endpoint returns all animals in the database including those that have already been adopted (`status = 'adopted'`).

---

## 2. Create Animal Listing

Creates a new animal profile for adoption.

- **Endpoint**: `POST /api/adoption`
- **Headers**: `Content-Type: application/json`

### Request Body Schema
```json
{
  "name": "Luna",
  "species": "Cat",
  "breed": "Domestic Shorthair",
  "age": "6 months",
  "healthStatus": "Recovering from minor skin allergy",
  "temperament": "Calm, affectionate, quiet",
  "imageUrl": "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=600"
}
```

### Response Schema

#### Success (200 OK)
```json
{
  "success": true,
  "animal": {
    "_id": "a_abc987z",
    "name": "Luna",
    "species": "Cat",
    "breed": "Domestic Shorthair",
    "age": "6 months",
    "healthStatus": "Recovering from minor skin allergy",
    "temperament": "Calm, affectionate, quiet",
    "imageUrl": "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=600",
    "status": "available",
    "createdAt": "2026-06-02T22:30:00.000Z"
  }
}
```

#### Bad Request (400 Bad Request)
- Missing name or species:
  ```json
  { "error": "Name and species are required" }
  ```

---

## 3. Apply For Animal Adoption

Submits an adoption application for an animal. On success, this marks the animal's status as `'adopted'`.

- **Endpoint**: `POST /api/adoption/apply`
- **Headers**: `Content-Type: application/json`

### Request Body Schema
```json
{
  "animalId": "a1",
  "applicantName": "John Doe",
  "applicantPhone": "1234567890",
  "adoptionDate": "2026-06-15"
}
```

### Response Schema

#### Success (200 OK)
```json
{
  "success": true,
  "message": "Adoption application received for Buddy!",
  "animal": {
    "_id": "a1",
    "name": "Buddy",
    "species": "Dog",
    "status": "adopted"
  }
}
```

#### Bad Request (400 Bad Request)
- Missing required fields:
  ```json
  { "error": "All fields are required" }
  ```

#### Not Found (404 Not Found)
- Animal ID does not exist:
  ```json
  { "error": "Animal not found" }
  ```

#### Server Error / Simulated Crash (500 Internal Server Error)
- Attempting to adopt a pet that is already adopted triggers a simulated null pointer exception crash:
  ```json
  {
    "error": "CRITICAL_CRASH: NullPointerException inside AnimalMatchingService. Match recommendations failed because animal is already bound to another owner account!",
    "stack": "Error: CRITICAL_CRASH: NullPointerException inside AnimalMatchingService...\n    at POST (route.ts:39:15)..."
  }
  ```

> [!WARNING]
> **QA Sandbox Bug Notice (Past Date Allowed & Double Adoption Crash)**:
> 1. The API does not validate the `adoptionDate` field. You can request adoption dates in the past (e.g. `2020-01-01`).
> 2. If the animal's status is already `adopted`, submitting another application will throw a raw 500 error simulating a service crash.
