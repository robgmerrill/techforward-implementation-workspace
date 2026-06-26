# Demo Script: TechForward Implementation Workspace

## Purpose of the Demo

This demo explains the TechForward Implementation Workspace as a customer-facing technical implementation project.

The goal is to show how the app supports a realistic onboarding workflow:

```text
Customer setup → employee import → training assignment → launch readiness
```

This script is written for a short portfolio video, approximately 2–4 minutes long.

## Opening

Hi, I’m Rob Merrill, and this is the TechForward Implementation Workspace.

TechForward is a fictional employee training platform, and this project represents an internal workspace an implementation consultant might use while onboarding a new customer.

The goal of the project is not just to show a dashboard. It is to show a practical customer implementation workflow backed by real Airtable data.

## Project Context

In this scenario, the customer is Acme Manufacturing.

Before launching TechForward, the implementation team needs to confirm customer setup details, import employee records, and assign training paths to the correct employees.

This type of workflow is common in customer-facing technical roles because implementation work often involves both customer communication and technical configuration.

## Customer Dashboard

At the top of the workspace, I can select a customer from the dropdown.

When I switch customers, the dashboard updates to show customer-specific data from Airtable.

The dashboard includes the customer’s implementation status, industry, expected employee count, imported employee count, target go-live date, and primary administrator.

This gives the implementation consultant a quick view of where the customer stands before launch.

## Customer Configuration

Below the dashboard, there is a customer configuration form.

This allows the consultant to update onboarding details such as implementation status, go-live date, expected employee count, primary administrator, and administrator email.

When I save the configuration, the app sends the update to Airtable through a Next.js API route.

So this is not a static form. It is a real write operation to the backend data source.

## Employee CSV Import

The next part of the workflow is employee import.

A customer would often send employee data as a CSV file, so this feature allows the consultant to upload a CSV, preview the rows, validate required fields, and import employees into Airtable.

The expected CSV headers are:

```csv
firstName,lastName,email,department,role,location,manager,status
```

When employees are imported, they are automatically linked to the selected customer.

That is important because this is a multi-customer workspace. We do not want employee records from one customer appearing under another customer.

## Imported Employees

After the import, the employees appear in the Imported Employees table.

This table is filtered based on the selected customer.

The app uses Airtable linked records to connect employees to customers, and then filters the dashboard based on that relationship.

This shows the data model behind the workflow:

```text
Customer → Employees
```

## Training Assignment Creation

The next workflow is training assignment creation.

The consultant can select an employee, select a training path, choose a status, and create a new assignment.

When the assignment is created, the app writes a new assignment record to Airtable.

The backend also generates a readable assignment name using the employee name and training path name.

For example:

```text
Nina Patel — Safety Essentials
```

This keeps the Airtable data clean and easier to read.

## Training Assignments Table

The new assignment appears in the Training Assignments table.

This table shows the employee, training path, assignment status, and assigned date.

The status badges make it easier to scan implementation progress quickly.

The relationship represented here is:

```text
Customer → Employees → Assignments → Training Paths
```

## Technical Implementation

Technically, this project is built with Next.js, React, TypeScript, Tailwind CSS, and the Airtable API.

The app uses Next.js route handlers to keep Airtable access on the server so the API key is not exposed in the browser.

The project includes both read and write operations.

Read operations include fetching customers, employees, training paths, and assignments.

Write operations include updating customer configuration, importing employees from CSV, and creating training assignments.

## Why This Project Matters

I built this project to represent the kind of work involved in implementation consultant, solutions consultant, customer success engineer, and technical account manager roles.

The important part is not just the code. It is the workflow.

This project shows how I think about customer onboarding, data quality, product configuration, and making technical systems understandable for customer-facing teams.

## Closing

That is the TechForward Implementation Workspace.

Version 1 includes a working Airtable-backed dashboard, customer configuration updates, CSV employee import, customer-specific filtering, training assignment creation, status badges, and formatted dates.

Future improvements could include an implementation checklist, blocker tracking, duplicate employee detection, bulk assignment creation, and a launch readiness score.
