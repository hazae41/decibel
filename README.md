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
  id: "1",
  name: "John",
  age: 30,
  job: "Engineer",
  certifications: ["AWS", "Azure", "GCP"]
})

db.append({
  id: "2",
  name: "Jane",
  age: 30,
  job: "Engineer",
  certifications: ["AWS", "Azure", "Docker"]
})

/**
 * Find people whose job is `Engineer` and who have the `GCP` certification, order by ascending age, then order by descending id if they have the same age
 */
const [john] = db.get({ age: "ascending", id: "descending" }, { job: "Engineer", certifications: ["GCP"] })
```

- Any column that can be converted to `number` will be orderable (e.g. `0.1`, `"0.1"`, `1n`, `"0x1"`)
- Arrays are filtered with inter / inner join / "and" (e.g. `["GCP", "AWS"]` -> arrays containing both `Azure` and `GCP`)