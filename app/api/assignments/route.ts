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

export async function GET() {
  const baseId = process.env.AIRTABLE_BASE_ID;
  const tableName = process.env.AIRTABLE_ASSIGNMENTS_TABLE;
  const apiKey = process.env.AIRTABLE_API_KEY;

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
    console.log("Airtable error:", data);

    return NextResponse.json(
      { error: "Failed to fetch assignments", details: data },
      { status: response.status },
    );
  }

  const assignments = data.records.map((record: AirtableAssignmentRecord) => ({
    id: record.id,
    assignmentName: record.fields["Assignment Name"],
    employeeIds: record.fields.Employee ?? [],
    trainingPathIds: record.fields["Training Path"] ?? [],
    status: record.fields.Status,
    assignedDate: record.fields["Assigned Date"],
  }));

  return NextResponse.json({ assignments });
}
