# Decibel

Queriable in-memory database for TypeScript

```bash
npm i @hazae41/decibel
```

[**Node Package 📦**](https://www.npmjs.com/package/@hazae41/decibel)

## Features

### Current features
- 100% TypeScript and ESM
- No external dependencies
- NoSQL-like querying

## Usage

```tsx
const db = new Database()

db.append({
  id: 1n,
  name: "John",
  age: 30n,
  job: "Engineer",
  certifications: ["AWS", "Azure", "GCP"]
})

db.append({
  id: 2n,
  name: "Jane",
  age: 30n,
  job: "Engineer",
  certifications: ["AWS", "Azure", "Docker"]
})

/**
 * Find people whose job is `Engineer` and who have the `GCP` certification, order by ascending age, then order by descending id if they have the same age
 */
const [john] = db.get({ age: "ascending", id: "descending" }, { job: "Engineer", certifications: ["GCP"] })
```