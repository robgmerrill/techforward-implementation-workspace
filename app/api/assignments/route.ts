import { NextResponse } from "next/server";

type AirtableAssignmentRecord = {
  id: string;
  fields: {
    "Assignment Name"?: string;
    Employee?: string[];
    "Training Path"?: string[];
    Status?: string;
    "Assigned Date"?: string;
  };
};

type AirtableEmployeeRecord = {
  id: string;
  fields: {
    "First Name"?: string;
    "Last Name"?: string;
    Email?: string;
  };
};

type AirtableTrainingPathRecord = {
  id: string;
  fields: {
    Name?: string;
  };
};

type AssignmentCreateRequest = {
  employeeId?: string;
  trainingPathId?: string;
  status?: string;
  assignedDate?: string;
};

function getAirtableConfig() {
  return {
    baseId: process.env.AIRTABLE_BASE_ID,
    assignmentsTableName: process.env.AIRTABLE_ASSIGNMENTS_TABLE,
    employeesTableName: process.env.AIRTABLE_EMPLOYEES_TABLE,
    trainingPathsTableName: process.env.AIRTABLE_TRAINING_PATHS_TABLE,
    apiKey: process.env.AIRTABLE_API_KEY,
  };
}

function normalizeAssignment(record: AirtableAssignmentRecord) {
  return {
    id: record.id,
    assignmentName: record.fields["Assignment Name"],
    employeeIds: record.fields.Employee ?? [],
    trainingPathIds: record.fields["Training Path"] ?? [],
    status: record.fields.Status,
    assignedDate: record.fields["Assigned Date"],
  };
}

async function fetchEmployeeName({
  baseId,
  employeesTableName,
  apiKey,
  employeeId,
}: {
  baseId: string;
  employeesTableName: string;
  apiKey: string;
  employeeId: string;
}) {
  const employeeUrl = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(
    employeesTableName,
  )}/${employeeId}`;

  const response = await fetch(employeeUrl, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    cache: "no-store",
  });

  const data = (await response.json()) as AirtableEmployeeRecord;

  if (!response.ok) {
    console.error("Airtable employee lookup error:", data);
    return "Unknown employee";
  }

  const fullName = [data.fields["First Name"], data.fields["Last Name"]]
    .filter(Boolean)
    .join(" ");

  return fullName || data.fields.Email || "Unknown employee";
}

async function fetchTrainingPathName({
  baseId,
  trainingPathsTableName,
  apiKey,
  trainingPathId,
}: {
  baseId: string;
  trainingPathsTableName: string;
  apiKey: string;
  trainingPathId: string;
}) {
  const trainingPathUrl = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(
    trainingPathsTableName,
  )}/${trainingPathId}`;

  const response = await fetch(trainingPathUrl, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    cache: "no-store",
  });

  const data = (await response.json()) as AirtableTrainingPathRecord;

  if (!response.ok) {
    console.error("Airtable training path lookup error:", data);
    return "Unknown training path";
  }

  return data.fields.Name || "Unknown training path";
}

export async function GET() {
  const { baseId, assignmentsTableName, apiKey } = getAirtableConfig();

  if (!baseId || !assignmentsTableName || !apiKey) {
    return NextResponse.json(
      { error: "Missing Airtable environment variables" },
      { status: 500 },
    );
  }

  const airtableUrl = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(
    assignmentsTableName,
  )}`;

  const response = await fetch(airtableUrl, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    cache: "no-store",
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("Airtable assignment fetch error:", data);

    return NextResponse.json(
      { error: "Failed to fetch assignments", details: data },
      { status: response.status },
    );
  }

  const assignments = data.records.map((record: AirtableAssignmentRecord) =>
    normalizeAssignment(record),
  );

  return NextResponse.json({ assignments });
}

export async function POST(request: Request) {
  const {
    baseId,
    assignmentsTableName,
    employeesTableName,
    trainingPathsTableName,
    apiKey,
  } = getAirtableConfig();

  if (
    !baseId ||
    !assignmentsTableName ||
    !employeesTableName ||
    !trainingPathsTableName ||
    !apiKey
  ) {
    return NextResponse.json(
      { error: "Missing Airtable environment variables" },
      { status: 500 },
    );
  }

  const body = (await request.json()) as AssignmentCreateRequest;

  if (!body.employeeId) {
    return NextResponse.json(
      { error: "Employee record ID is required" },
      { status: 400 },
    );
  }

  if (!body.trainingPathId) {
    return NextResponse.json(
      { error: "Training path record ID is required" },
      { status: 400 },
    );
  }

  const assignedDate =
    body.assignedDate || new Date().toISOString().slice(0, 10);

  const [employeeName, trainingPathName] = await Promise.all([
    fetchEmployeeName({
      baseId,
      employeesTableName,
      apiKey,
      employeeId: body.employeeId,
    }),
    fetchTrainingPathName({
      baseId,
      trainingPathsTableName,
      apiKey,
      trainingPathId: body.trainingPathId,
    }),
  ]);

  const assignmentName = `${employeeName} — ${trainingPathName}`;

  const airtableUrl = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(
    assignmentsTableName,
  )}`;

  const response = await fetch(airtableUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      records: [
        {
          fields: {
            "Assignment Name": assignmentName,
            Employee: [body.employeeId],
            "Training Path": [body.trainingPathId],
            Status: body.status || "Assigned",
            "Assigned Date": assignedDate,
          },
        },
      ],
      typecast: true,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("Airtable assignment create error:", data);

    return NextResponse.json(
      {
        error: "Failed to create assignment",
        details: data,
      },
      { status: response.status },
    );
  }

  const assignment = normalizeAssignment(data.records[0]);

  return NextResponse.json({ assignment }, { status: 201 });
}
