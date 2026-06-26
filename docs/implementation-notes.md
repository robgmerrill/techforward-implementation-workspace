# Implementation Notes: TechForward Implementation Workspace

## Purpose

These notes explain how the TechForward Implementation Workspace is structured, how the Airtable data model supports the workflow, and why each feature matters from an implementation consulting perspective.

The goal of this project is not just to demonstrate React or API routes. The goal is to model a practical customer onboarding workflow for a fictional employee training platform.

## Implementation Context

TechForward is a fictional employee training platform.

A customer such as Acme Manufacturing needs to prepare for launch by:

1. Confirming customer setup details.
2. Importing employee records.
3. Linking employees to the correct customer account.
4. Assigning required training paths.
5. Tracking onboarding status before go-live.

The workspace gives the implementation consultant one place to manage those tasks.

## Airtable as the Backend

Airtable is used as the backend data source because it works well for implementation-style workflows.

In many real implementation roles, customer data may live in systems such as:

- spreadsheets
- Airtable
- CRM records
- implementation trackers
- internal admin tools
- customer data exports

Using Airtable in this project creates a realistic middle ground between a simple mock app and a full production database.

The app reads from and writes to Airtable through Next.js API routes.

## Data Model

The workspace uses four Airtable tables:

```text
Customers
Employees
Training Paths
Assignments
```

The core relationship is:

```text
Customer → Employees → Assignments → Training Paths
```

## Customers Table

The Customers table stores customer-level onboarding information.

Example fields:

- Name
- Industry
- Employee Count
- Go Live Date
- Status
- Primary Admin Name
- Primary Admin Email

This table powers the top-level customer dashboard.

The selected customer determines which employees and assignments are shown in the workspace.

## Employees Table

The Employees table stores individual employee records.

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

The Customer field links each employee to a record in the Customers table.

This link is important because the dashboard needs to show customer-specific employee data rather than all employees in the system.

## Training Paths Table

The Training Paths table stores reusable training programs.

Example fields:

- Name
- Audience
- Description

Training paths are not customer-specific by default. They represent programs that can be assigned to employees across customers.

Examples might include:

- Safety Essentials
- New Employee Orientation
- Leadership Basics
- Security Awareness

## Assignments Table

The Assignments table connects employees to training paths.

Example fields:

- Assignment Name
- Employee
- Training Path
- Status
- Assigned Date

Each assignment links:

```text
one employee → one training path
```

The app automatically creates a readable assignment name using the employee name and training path name.

Example:

```text
Nina Patel — Safety Essentials
```

## API Route Structure

The app uses Next.js route handlers to keep Airtable access on the server.

This prevents the Airtable API key from being exposed in the browser.

Current routes:

```text
app/api/customers/route.ts
app/api/employees/route.ts
app/api/training-paths/route.ts
app/api/assignments/route.ts
```

## Customer API

The customer API supports:

```text
GET /api/customers
PATCH /api/customers
```

The `GET` route fetches all customer records from Airtable.

The `PATCH` route updates the selected customer’s configuration fields, including:

- employee count
- go-live date
- implementation status
- primary administrator
- administrator email

This allows the dashboard to function as an implementation configuration tool, not just a read-only report.

## Employee API

The employee API supports:

```text
GET /api/employees
POST /api/employees
```

The `GET` route fetches all employee records from Airtable.

The `POST` route creates employee records from the CSV import workflow.

Each imported employee is linked to the selected customer by writing the selected customer’s Airtable record ID to the employee’s Customer field.

The import endpoint also supports batching because Airtable limits record creation to batches of 10 records at a time.

## Training Paths API

The training paths API supports:

```text
GET /api/training-paths
```

The app currently treats training paths as reusable reference data.

Training paths are fetched from Airtable and used in the assignment creation form.

## Assignments API

The assignments API supports:

```text
GET /api/assignments
POST /api/assignments
```

The `GET` route fetches all assignment records from Airtable.

The `POST` route creates a new training assignment.

When creating an assignment, the backend:

1. Receives the selected employee ID.
2. Receives the selected training path ID.
3. Looks up the employee name.
4. Looks up the training path name.
5. Creates a readable assignment name.
6. Saves the assignment to Airtable.
7. Returns the created assignment to the frontend.

## Frontend Workflow

The main dashboard lives in:

```text
app/page.tsx
```

The page is responsible for:

- loading Airtable-backed data
- tracking the selected customer
- filtering employees by selected customer
- filtering assignments by selected customer’s employees
- displaying dashboard cards
- rendering configuration and workflow components

## Components

The app includes these reusable components:

```text
app/components/EmployeeCsvImport.tsx
app/components/TrainingAssignmentForm.tsx
app/components/StatusBadge.tsx
```

## EmployeeCsvImport Component

This component handles the employee CSV import workflow.

It allows the user to:

1. Select a CSV file.
2. Parse the CSV in the browser.
3. Validate required fields.
4. Preview employee rows.
5. Import the rows into Airtable.

Required CSV headers:

```csv
firstName,email
```

Recommended full CSV headers:

```csv
firstName,lastName,email,department,role,location,manager,status
```

This workflow represents a common implementation task: converting customer-provided employee data into platform-ready records.

## TrainingAssignmentForm Component

This component lets the user create a training assignment from the dashboard.

It allows the user to select:

- an employee
- a training path
- a status

Then it sends the selected values to the assignments API route.

The assignment is created in Airtable and immediately added to the dashboard state.

## StatusBadge Component

The status badge component provides visual styling for implementation statuses.

It supports statuses such as:

- Live
- Active
- Completed
- In Progress
- Onboarding
- Assigned
- Pending Import
- Inactive

This makes dashboard tables easier to scan.

## Customer Filtering Logic

The selected customer controls the rest of the dashboard.

Employees are filtered with this relationship:

```text
employee.customerIds includes selectedCustomerId
```

Assignments are then filtered by checking whether the assignment belongs to one of the filtered employees.

This creates a customer-specific workspace without needing separate pages for each customer.

## Why Linked Records Matter

Airtable linked records are central to the project.

Instead of storing customer names as plain text on employees, each employee links to a customer record.

This is more reliable because:

- customer names can change
- duplicate customer names are possible
- record IDs are stable
- linked data can be queried and displayed across tables

This mirrors the kind of structured data thinking needed in implementation work.

## Important Design Decisions

### Real Airtable writes instead of mock data

The app performs real create and update operations against Airtable.

This makes the project more credible because the UI is not pretending to work.

### Customer-specific filtering

The first version of the dashboard counted all employees globally.

That was corrected by linking employees to customers and filtering by selected customer.

This better represents real multi-customer implementation work.

### CSV preview before import

The app previews CSV rows before import so the consultant can confirm the data before writing to Airtable.

This is more realistic than immediately importing a file with no review step.

### Assignment names generated automatically

The backend creates assignment names from the selected employee and training path.

This keeps Airtable records readable and reduces manual data entry.

## Known Version 1 Limitations

Version 1 is intentionally scoped.

Current limitations include:

- no duplicate employee detection
- no CSV column mapping UI
- no bulk assignment creation
- no authentication
- no implementation checklist
- no blocker tracking
- no readiness score
- no customer launch report

These are reasonable future improvements, but they are not necessary for the first portfolio version.

## Future Improvements

Potential Version 2 improvements include:

### CSV Column Mapping

Allow users to map customer-provided column names to TechForward fields.

Example:

```text
Employee Email → email
Work Location → location
Supervisor → manager
```

### Duplicate Detection

Detect whether an imported employee email already exists for the selected customer.

### Bulk Assignment Creation

Allow the consultant to assign a training path to multiple employees at once.

### Implementation Checklist

Track launch readiness tasks such as:

- customer details confirmed
- employee file received
- employee import completed
- training paths assigned
- admin training scheduled
- launch date confirmed

### Blocker Tracking

Allow the consultant to log blockers such as missing files, invalid data, or customer delays.

### Readiness Score

Calculate an implementation readiness percentage based on completed setup tasks.

## Role Relevance

This project is relevant to customer-facing technical roles because it demonstrates:

- workflow design
- customer data modeling
- technical configuration
- data import handling
- API integration
- implementation readiness thinking
- clear communication around technical systems

It shows how software engineering skills can be applied to implementation and solutions work.

## Summary

The TechForward Implementation Workspace is a practical example of a customer onboarding tool.

It connects customer setup, employee import, training assignment, and Airtable-backed data management into one implementation workflow.

The project demonstrates both technical execution and customer-facing implementation thinking.
