import { NextResponse } from "next/server";

type AirtableEmployeeRecord = {
  id: string;
  fields: {
    "First Name"?: string;
    "Last Name"?: string;
    Email?: string;
    Department?: string;
    Role?: string;
    Location?: string;
    Manager?: string;
    Status?: string;
    Customer?: string[];
  };
};

type EmployeeImportRow = {
  firstName?: string;
  lastName?: string;
  email?: string;
  department?: string;
  role?: string;
  location?: string;
  manager?: string;
  status?: string;
};

type EmployeeImportRequest = {
  customerId?: string;
  employees?: EmployeeImportRow[];
};

function getAirtableConfig() {
  return {
    baseId: process.env.AIRTABLE_BASE_ID,
    tableName: process.env.AIRTABLE_EMPLOYEES_TABLE,
    apiKey: process.env.AIRTABLE_API_KEY,
  };
}

function normalizeEmployee(record: AirtableEmployeeRecord) {
  return {
    id: record.id,
    firstName: record.fields["First Name"],
    lastName: record.fields["Last Name"],
    email: record.fields.Email,
    department: record.fields.Department,
    role: record.fields.Role,
    location: record.fields.Location,
    manager: record.fields.Manager,
    status: record.fields.Status,
    customerIds: record.fields.Customer ?? [],
  };
}

export async function GET() {
  const { baseId, tableName, apiKey } = getAirtableConfig();

  if (!baseId || !tableName || !apiKey) {
    return NextResponse.json(
      { error: "Missing Airtable environment variables" },
      { status: 500 },
    );
  }

  const airtableUrl = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(
    tableName,
  )}`;

  const response = await fetch(airtableUrl, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    cache: "no-store",
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("Airtable employee fetch error:", data);

    return NextResponse.json(
      { error: "Failed to fetch employees", details: data },
      { status: response.status },
    );
  }

  const employees = data.records.map((record: AirtableEmployeeRecord) =>
    normalizeEmployee(record),
  );

  return NextResponse.json({ employees });
}

export async function POST(request: Request) {
  const { baseId, tableName, apiKey } = getAirtableConfig();

  if (!baseId || !tableName || !apiKey) {
    return NextResponse.json(
      { error: "Missing Airtable environment variables" },
      { status: 500 },
    );
  }

  const body = (await request.json()) as EmployeeImportRequest;

  if (!body.customerId) {
    return NextResponse.json(
      { error: "Customer record ID is required" },
      { status: 400 },
    );
  }

  if (!body.employees || body.employees.length === 0) {
    return NextResponse.json(
      { error: "At least one employee is required" },
      { status: 400 },
    );
  }

  const invalidEmployee = body.employees.find(
    (employee) => !employee.firstName?.trim() || !employee.email?.trim(),
  );

  if (invalidEmployee) {
    return NextResponse.json(
      { error: "Every employee must have a first name and email address" },
      { status: 400 },
    );
  }

  const airtableRecords = body.employees.map((employee) => ({
    fields: {
      "First Name": employee.firstName?.trim(),
      "Last Name": employee.lastName?.trim() || "",
      Email: employee.email?.trim(),
      Department: employee.department?.trim() || "",
      Role: employee.role?.trim() || "",
      Location: employee.location?.trim() || "",
      Manager: employee.manager?.trim() || "",
      Status: employee.status?.trim() || "Pending Import",
      Customer: [body.customerId],
    },
  }));

  const createdEmployees = [];

  for (let index = 0; index < airtableRecords.length; index += 10) {
    const batch = airtableRecords.slice(index, index + 10);

    const airtableUrl = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(
      tableName,
    )}`;

    const response = await fetch(airtableUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        records: batch,
        typecast: true,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Airtable employee import error:", data);

      return NextResponse.json(
        {
          error: "Failed to import employees",
          details: data,
        },
        { status: response.status },
      );
    }

    createdEmployees.push(
      ...data.records.map((record: AirtableEmployeeRecord) =>
        normalizeEmployee(record),
      ),
    );
  }

  return NextResponse.json(
    {
      employees: createdEmployees,
      importedCount: createdEmployees.length,
    },
    { status: 201 },
  );
}
