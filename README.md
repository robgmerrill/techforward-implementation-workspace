# TechForward Implementation Workspace

A customer-facing implementation workspace built for a fictional employee training platform called **TechForward**.

This project demonstrates how a technical implementation consultant might configure a customer onboarding workspace, import employee data, assign training paths, and keep implementation data synchronized with Airtable.

## Project Purpose

This is not a generic CRUD app. It is designed to represent the kind of workflow used in customer-facing technical implementation roles, including:

- customer onboarding
- configuration management
- employee data import
- training assignment setup
- implementation readiness tracking
- Airtable-backed workflow data

The goal is to show how technical skills can support real customer implementation work.

## Scenario

**Customer:** Acme Manufacturing  
**Product:** TechForward employee training platform  
**Implementation goal:** Prepare the customer for launch by configuring customer details, importing employees, and assigning required training paths.

The implementation consultant needs a simple internal workspace to:

1. Review customer setup information.
2. Update onboarding details.
3. Import employees from a CSV file.
4. Link employees to the correct customer.
5. Assign training paths to employees.
6. Track assignment status and dates.

## Core Features

### Customer Dashboard

The dashboard displays customer-specific implementation data from Airtable, including:

- implementation status
- industry
- expected employee count
- imported employee count
- target go-live date
- primary administrator

A customer dropdown allows the user to switch between customer accounts.

### Customer Configuration

The customer configuration form allows the user to update onboarding details and save changes directly to Airtable.

Editable fields include:

- implementation status
- target go-live date
- expected employee count
- primary administrator
- administrator email

### Employee CSV Import

The employee import workflow allows the user to upload a CSV file, preview employee rows, validate required fields, and import employees into Airtable.

Expected CSV headers:

```csv
firstName,lastName,email,department,role,location,manager,status
```

Imported employees are automatically linked to the selected customer.

### Training Assignment Creation

The assignment form allows the user to:

- select an employee
- select a training path
- choose an assignment status
- create a new training assignment in Airtable

Assignments are displayed in a customer-specific table and include status badges and assigned dates.

## Data Model

The app uses four Airtable tables:

### Customers

Stores customer implementation records.

Example fields:

- Name
- Industry
- Employee Count
- Go Live Date
- Status
- Primary Admin Name
- Primary Admin Email

### Employees

Stores employee records imported during implementation.

Example fields:

- First Name
- Last Name
- Email
- Department
- Role
- Location
- Manager
- Status
- Customer

### Training Paths

Stores available training programs.

Example fields:

- Name
- Audience
- Description

### Assignments

Stores employee training assignments.

Example fields:

- Assignment Name
- Employee
- Training Path
- Status
- Assigned Date

## Tech Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- Airtable API

## Implementation Highlights

This project includes both read and write operations against Airtable.

Read operations:

- fetch customers
- fetch employees
- fetch training paths
- fetch assignments

Write operations:

- update customer configuration
- import employees from CSV
- create training assignments

## Why This Project Matters

Many implementation and solutions roles require more than writing code. They require understanding customer workflows, translating requirements into configuration, working with structured data, and explaining technical systems clearly.

This project is meant to show those skills in a practical, portfolio-ready way.

## Running Locally

Install dependencies:

```bash
npm install
```

Create a `.env.local` file:

```bash
AIRTABLE_API_KEY=your_airtable_personal_access_token
AIRTABLE_BASE_ID=your_airtable_base_id
AIRTABLE_CUSTOMERS_TABLE=Customers
AIRTABLE_EMPLOYEES_TABLE=Employees
AIRTABLE_TRAINING_PATHS_TABLE=Training Paths
AIRTABLE_ASSIGNMENTS_TABLE=Assignments
```

Start the development server:

```bash
npm run dev
```

Open the app:

```bash
http://localhost:3000
```

## Version 1 Scope

Version 1 includes:

- Airtable-backed customer dashboard
- customer switching
- customer configuration updates
- employee CSV import
- customer-specific employee filtering
- training assignment creation
- status badges
- formatted dates

Future improvements could include:

- implementation checklist
- blocker tracking
- CSV column mapping
- duplicate employee detection
- assignment progress summaries
- readiness score
