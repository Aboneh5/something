# Software Requirements Specification (SRS)
## Tenadam Assessment App - Baldrige Excellence Framework Assessment System

**Version**: 1.0
**Date**: 2025-09-14
**Organization**: Tenadam Training, Consultancy and Research PLC

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Overall Description](#2-overall-description)
3. [System Features](#3-system-features)
4. [External Interface Requirements](#4-external-interface-requirements)
5. [System Requirements](#5-system-requirements)
6. [Database Design](#6-database-design)
7. [Implementation Plan](#7-implementation-plan)
8. [Non-functional Requirements](#8-non-functional-requirements)
9. [Appendices](#9-appendices)

---

## 1. Introduction

### 1.1 Purpose
This document specifies the requirements for the Tenadam Assessment App, a web-based system for conducting Baldrige Excellence Framework assessments. The system provides authenticated access to structured assessments with comprehensive reporting capabilities.

### 1.2 Scope
The Tenadam Assessment App will:
- Provide secure authentication using 6-digit access codes
- Deliver structured assessments across 7 main categories with subcategories
- Store and manage assessment responses and user data
- Generate assessment reports and analytics
- Provide administrative dashboard for system management

### 1.3 Definitions and Acronyms
- **SRS**: Software Requirements Specification
- **API**: Application Programming Interface
- **UI**: User Interface
- **CRUD**: Create, Read, Update, Delete
- **JWT**: JSON Web Token
- **ORM**: Object-Relational Mapping (Prisma)

---

## 2. Overall Description

### 2.1 Product Perspective
The system consists of three main components:
- **Frontend**: Next.js React application
- **Backend**: Express.js API server with Prisma ORM
- **Database**: PostgreSQL database

### 2.2 Product Functions
1. **Authentication System**
   - 6-digit ID-based authentication
   - User registration with personal details
   - Session management

2. **Assessment Module**
   - Category-based question navigation
   - Progress tracking and validation
   - Response storage and management

3. **Admin Dashboard**
   - User management
   - Assessment monitoring
   - Report generation

### 2.3 User Classes
1. **Assessment Takers**: Users who complete assessments
2. **Administrators**: System managers with full access
3. **Report Viewers**: Stakeholders with read-only access to reports

---

## 3. System Features

### 3.1 Authentication System

#### 3.1.1 6-Digit Access Code Authentication
**Priority**: High
**Description**: Users authenticate using pre-generated 6-digit access codes.

**Functional Requirements**:
- System generates unique 6-digit access codes (e.g., 123456)
- Codes are stored in database with expiration dates
- Users enter access code to begin registration process
- Invalid codes show appropriate error messages

#### 3.1.2 User Registration
**Priority**: High
**Description**: After valid code entry, users provide personal information.

**Required Fields**:
- Full Name (required)
- Email Address (required, validated format)
- Organization Name (required)
- Phone Number (required)
- Access Code (pre-filled from authentication step)

**Validation Rules**:
- Email format validation
- Phone number format validation
- All fields mandatory
- Duplicate email prevention within same assessment session

### 3.2 Assessment Module

#### 3.2.1 Question Categories Structure
**Priority**: High
**Description**: Assessments organized into 7 main categories with subcategories.

**Main Categories**:
1. **Leadership**
   - Senior Leadership
   - Governance and Societal Responsibilities

2. **Strategy**
   - Strategy Development
   - Strategy Implementation

3. **Customers**
   - Customer Expectations
   - Customer Engagement

4. **Measurement, Analysis, and Knowledge Management**
   - Measurement and Analysis
   - Information and Knowledge Management

5. **Workforce**
   - Workforce Environment
   - Workforce Engagement

6. **Operations**
   - Work Processes
   - Operational Effectiveness

7. **Results**
   - Product and Process Results
   - Customer Results
   - Workforce Results
   - Leadership and Governance Results
   - Financial and Market Results

#### 3.2.2 Assessment Navigation
**Priority**: High
**Description**: Category-based scrollable interface with progress tracking.

**Navigation Features**:
- Scrollable question list within each category
- Category completion indicators
- Progress bar showing overall completion
- Auto-advance to next category upon completion
- Previous/Next navigation within categories
- Category overview with completion status

#### 3.2.3 Response Validation
**Priority**: High
**Description**: Ensure all questions are answered before assessment completion.

**Validation Requirements**:
- All questions must be answered (not necessarily correct)
- Visual indicators for unanswered questions
- Category completion requirements
- Final validation before submission
- Warning messages for incomplete sections

### 3.3 Data Storage and Management

#### 3.3.1 Response Storage
**Priority**: High
**Description**: All user responses and metadata stored in PostgreSQL database.

**Storage Requirements**:
- User information (name, email, organization, phone)
- Assessment responses by question ID
- Response timestamps
- Session tracking
- Assessment completion status

#### 3.3.2 Assessment Completion
**Priority**: High
**Description**: Thank you page and completion handling.

**Completion Features**:
- Validation of all answered questions
- Thank you message with completion confirmation
- Assessment ID generation for tracking
- Completion timestamp recording
- Optional feedback collection

---

## 4. External Interface Requirements

### 4.1 User Interfaces

#### 4.1.1 Authentication Interface
- **Login Page**: 6-digit code entry form
- **Registration Page**: Personal information form
- **Error Pages**: Invalid code, expired session

#### 4.1.2 Assessment Interface
- **Category Navigation**: Sidebar with category list
- **Question Display**: Scrollable question interface
- **Progress Tracking**: Visual progress indicators
- **Response Interface**: Multiple choice, text inputs

#### 4.1.3 Admin Interface
- **Dashboard**: Overview of assessments and users
- **User Management**: CRUD operations for users and codes
- **Reports**: Assessment results and analytics

### 4.2 Software Interfaces

#### 4.2.1 Frontend-Backend API
- RESTful API endpoints for all operations
- JSON data format
- JWT token authentication for admin
- Error handling and validation

#### 4.2.2 Database Interface
- Prisma ORM for database operations
- PostgreSQL database
- Connection pooling and optimization

---

## 5. System Requirements

### 5.1 Functional Requirements

#### 5.1.1 Authentication Requirements
- **FR-001**: System shall validate 6-digit access codes
- **FR-002**: System shall require user registration after code validation
- **FR-003**: System shall validate all required user information
- **FR-004**: System shall prevent duplicate access code usage

#### 5.1.2 Assessment Requirements
- **FR-005**: System shall present questions organized by categories
- **FR-006**: System shall track user progress through categories
- **FR-007**: System shall validate all questions are answered
- **FR-008**: System shall store all user responses
- **FR-009**: System shall prevent assessment submission until complete

#### 5.1.3 Admin Requirements
- **FR-010**: System shall provide admin dashboard
- **FR-011**: System shall allow admin to manage access codes
- **FR-012**: System shall provide assessment reports
- **FR-013**: System shall allow user data export

---

## 6. Database Design

### 6.1 Updated Schema Requirements

#### 6.1.1 Access Code Management
```sql
-- AccessCode table for 6-digit authentication
model AccessCode {
  id          String    @id @default(cuid())
  code        String    @unique  // 6-digit code (e.g., "123456")
  isUsed      Boolean   @default(false)
  usedAt      DateTime?
  expiresAt   DateTime
  assessmentTemplateId String?
  assessmentTemplate   AssessmentTemplate? @relation(fields: [assessmentTemplateId], references: [id])
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  // User who used this code
  userId      String?   @unique
  user        User?     @relation(fields: [userId], references: [id])
}
```

#### 6.1.2 Enhanced User Model
```sql
-- Updated User model for assessment takers
model User {
  id           String     @id @default(cuid())
  fullName     String
  email        String     @unique
  organization String
  phoneNumber  String

  // Authentication
  accessCode   AccessCode?
  accessCodeId String?    @unique

  // Assessment tracking
  assessmentAttempts AssessmentAttempt[]
  responses         Response[]

  // Metadata
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt
}
```

#### 6.1.3 Question Categorization
```sql
-- Enhanced Category structure
model Category {
  id            String        @id @default(cuid())
  name          String        @unique
  displayOrder  Int
  description   String?
  subcategories Subcategory[]

  @@map("categories")
}

model Subcategory {
  id           String     @id @default(cuid())
  name         String
  displayOrder Int
  categoryId   String
  category     Category   @relation(fields: [categoryId], references: [id])
  questions    Question[]

  @@unique([categoryId, displayOrder])
  @@map("subcategories")
}
```

---

## 7. Implementation Plan

### Phase 1: Foundation Setup ✅ (COMPLETED)
- [x] Project structure setup (frontend/backend separation)
- [x] Database schema design and implementation
- [x] Basic PostgreSQL setup with Docker
- [x] Frontend framework setup with Tailwind CSS

### Phase 2: Authentication System 🚧 (IN PROGRESS)
- [ ] **Step 2.1**: Update database schema for 6-digit access codes
- [ ] **Step 2.2**: Create access code generation and management system
- [ ] **Step 2.3**: Implement authentication API endpoints
- [ ] **Step 2.4**: Build login interface with code validation
- [ ] **Step 2.5**: Create user registration form
- [ ] **Step 2.6**: Implement session management

### Phase 3: Question Management System
- [ ] **Step 3.1**: Seed database with Baldrige Framework questions
- [ ] **Step 3.2**: Implement category and subcategory structure
- [ ] **Step 3.3**: Create question API endpoints
- [ ] **Step 3.4**: Build question management interface

### Phase 4: Assessment Interface
- [ ] **Step 4.1**: Design category navigation interface
- [ ] **Step 4.2**: Implement scrollable question display
- [ ] **Step 4.3**: Create progress tracking system
- [ ] **Step 4.4**: Build response capture and validation
- [ ] **Step 4.5**: Implement category completion logic

### Phase 5: Assessment Completion
- [ ] **Step 5.1**: Build response validation system
- [ ] **Step 5.2**: Create completion verification logic
- [ ] **Step 5.3**: Design thank you and completion page
- [ ] **Step 5.4**: Implement assessment submission

### Phase 6: Admin Dashboard
- [ ] **Step 6.1**: Create admin authentication system
- [ ] **Step 6.2**: Build access code management interface
- [ ] **Step 6.3**: Implement user management dashboard
- [ ] **Step 6.4**: Create assessment monitoring tools
- [ ] **Step 6.5**: Build reporting and analytics interface

### Phase 7: Testing and Deployment
- [ ] **Step 7.1**: Unit testing implementation
- [ ] **Step 7.2**: Integration testing
- [ ] **Step 7.3**: User acceptance testing
- [ ] **Step 7.4**: Performance optimization
- [ ] **Step 7.5**: Production deployment setup

---

## 8. Non-functional Requirements

### 8.1 Performance Requirements
- System shall support up to 100 concurrent users
- Page load times shall not exceed 3 seconds
- Database queries shall complete within 2 seconds
- API response times shall not exceed 1 second

### 8.2 Security Requirements
- Access codes shall be cryptographically secure
- User data shall be encrypted in transit and at rest
- Session tokens shall expire after 24 hours
- Input validation and sanitization for all user inputs

### 8.3 Usability Requirements
- Interface shall be responsive across devices
- System shall provide clear error messages
- Progress indicators shall be visible throughout assessment
- Interface shall be accessible (WCAG 2.1 compliance)

### 8.4 Reliability Requirements
- System uptime shall be 99.5% or higher
- Data backup shall occur daily
- System shall handle graceful error recovery
- Assessment progress shall be auto-saved every 30 seconds

---

## 9. Appendices

### 9.1 Sample Access Codes
```
123456, 234567, 345678, 456789, 567890
678901, 789012, 890123, 901234, 012345
```

### 9.2 API Endpoints Structure
```
Authentication:
POST /api/auth/validate-code
POST /api/auth/register
POST /api/auth/logout

Assessment:
GET /api/assessment/categories
GET /api/assessment/questions/:categoryId
POST /api/assessment/response
GET /api/assessment/progress/:userId
POST /api/assessment/submit

Admin:
GET /api/admin/users
POST /api/admin/access-codes
GET /api/admin/reports
DELETE /api/admin/users/:id
```

### 9.3 Question Categories Reference
Based on the Baldrige Excellence Framework, the system will implement all 7 core categories with their respective subcategories and evaluation criteria, ensuring comprehensive organizational assessment coverage.

---

**Document Status**: Draft v1.0
**Next Review**: Upon Phase 2 completion
**Approval**: Pending stakeholder review