# Why Many Mature Systems (e.g. Cal.com) Use Two Identifiers for the User Model

```prisma
id   Int    @id @default(autoincrement())   // internal
uuid String @unique @default(uuid())        // public
```

---

## The Core Idea

* **`id` (Int)** → Fast, internal database operations (joins, indexes), 4 bytes
* **`uuid` (UUID/String)** → Safe, public-facing identifier (APIs, URLs), 16 bytes

This separation optimizes **performance internally** while maintaining **security externally**.

---

## Security Risks of Exposing Sequential `id`

If your APIs or URLs look like:

```
/users/1
/users/2
/users/3
```

you introduce serious risks:

1. **ID Enumeration (IDOR)**
   Attackers can increment IDs and access other users’ data if any authorization bug exists
   → known as *Insecure Direct Object Reference*.

2. **Bug Amplification**
   Even small authorization mistakes become highly exploitable when IDs are predictable.

3. **Mass Scraping**
   Sequential IDs make it trivial to scrape the entire user base.

4. **Business Data Leakage**
   Highest ID ≈ total users → reveals growth, scale, and churn patterns.

5. **Chained Attacks**
   User IDs often link to orders, payments, and invoices — one leak cascades into others.

---

## Why UUIDs Help

Public URLs using UUIDs:

```
/users/550e8400-e29b-41d4-a716-446655440000
```

* Non-guessable (128-bit randomness)
* Enumeration is impractical
* Reduces the blast radius of authorization bugs


| Situation                        | Use            |
| -------------------------------- | -------------- |
| Public-facing ID                 | **UUID**       |
| Core table (internal + public)   | **Int + UUID** |
| Internal / auth / session / logs | **CUID**       |
| Pure DB performance              | **Int**        |

Why cuid is not used for public facing IDs
- Not a database or protocol standard
- External systems may not expect it
- Mostly used in JS / Prisma world

Why not int/uuid for Internal IDs
- Internals still expose logs, admin panels, dashboards, etc so sometimes it can leak IDs accidentally
- It is preferred over uuid because of overhead 