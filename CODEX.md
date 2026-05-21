# CODEX.md

# SMARTSHIFT AI WORKSPACE

> Core AI rules for SmartShift project.  
> Optimized for Codex CLI / Claude Code / Cursor AI.

---

# PROJECT CONTEXT

## Project
SmartShift

## Stack

### Backend
- NodeJS
- ExpressJS
- MongoDB
- JWT

### Frontend
- React
- TypeScript

---

# DEVELOPMENT PRIORITIES

Priority order:
1. Correct business logic
2. Clean architecture
3. Maintainability
4. Scalability

Never sacrifice architecture quality for temporary speed.

---

# AI GLOBAL RULES

## ALWAYS
- scan project before coding
- read related files first
- follow existing architecture
- reuse existing logic if possible
- keep changes inside task scope
- explain risky changes
- verify auth and validation flow

---

## NEVER
- rewrite unrelated code
- silently change architecture
- install packages without permission
- bypass auth/validation
- modify .env automatically
- delete code without confirmation
- create duplicated logic
- break API response structure

---

# BACKEND ARCHITECTURE

## Structure Style
Module-Based Structure

## Standard Structure

```txt
src/
├── modules/
│   ├── auth/
│   ├── user/
│   ├── shift/
│   ├── attendance/
│   └── payroll/
```

---

## Module Structure

```txt
module-name/
├── controller/
├── service/
├── repository/
├── model/
├── route/
├── validation/
└── dto/
```

---

# RESPONSIBILITY RULES

## Controller
- handle request/response
- call services only

Never:
- write business logic
- query DB directly

---

## Service
- business logic
- workflow processing
- reusable operations

---

## Repository
- database queries only

---

# API RESPONSE STANDARD

## Success

```json
{
  "success": true,
  "message": "Success",
  "data": {}
}
```

## Error

```json
{
  "success": false,
  "message": "Error message"
}
```

---

# DATABASE RULES

## MongoDB
- use timestamps
- add indexes when needed
- validate schema properly
- optimize searchable fields

Avoid:
- excessive populate
- duplicated field meanings
- huge embedded documents

---

# AUTH RULES

Use JWT Authentication.

Must validate:
- token validity
- user existence
- role permission

Separate:
- auth middleware
- role middleware
- permission middleware

---

# FRONTEND RULES

## Must
- reusable components
- loading states
- error states
- separate UI/business logic

## Avoid
- huge page.tsx
- duplicated UI logic

---

# CODING RULES

## Naming
- camelCase
- PascalCase for classes
- kebab-case for files

## Functions
- single responsibility
- reusable
- small and readable

Avoid:
- duplicated logic
- huge functions
- deeply nested conditions

---

# ERROR HANDLING

Must:
- centralized error handler
- meaningful error messages
- proper status codes

Never:
- empty catch blocks
- silent fail

---


# PACKAGE INSTALLATION

Before installing packages:
1. explain why needed
2. ask permission first

---

# TESTING CHECKLIST

Before finishing task:
- verify lint
- verify imports
- verify auth flow
- verify validation
- verify API response format

---

# DOCUMENTATION RULES

All docs should be written in Vietnamese.

Required docs:
- README
- workflow docs
- API docs
- usecase docs

---

# SMARTSHIFT BUSINESS RULES

## Attendance
- check-in
- check-out
- late detection
- overtime detection

## Shift
- recurring shifts
- branch-based shifts
- shift assignment

## Payroll
- overtime calculation
- attendance summary

---

# AI AGENT ROLES

## Backend Agent
Responsible for:
- API
- auth
- business logic
- database integration

---

## Frontend Agent
Responsible for:
- UI
- API integration
- reusable components

---

## Reviewer Agent
Responsible for:
- architecture review
- security review
- duplicated logic review
- maintainability review

---

# REUSABLE PROMPTS

## Create Feature

```txt
Read CODEX.md first.

Analyze architecture first.

Implement [FEATURE_NAME]
following existing conventions.
```

---

## Fix Bug

```txt
Read CODEX.md first.

Find root cause first.
Avoid temporary fixes.
Do not modify unrelated files.
```

---

## Review Code

```txt
Read CODEX.md first.

Review for:
- architecture consistency
- scalability
- security
- duplicated logic
- maintainability
```

---

# OUTPUT FORMAT AFTER TASK

After every task provide:
1. files changed
2. what changed
3. why changed
4. risks
5. how to test

---

# FINAL RULE

Always prioritize:
1. business correctness
2. architecture quality
3. maintainability
4. scalability