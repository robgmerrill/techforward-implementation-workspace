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

export async function GET() {
  const baseId = process.env.AIRTABLE_BASE_ID;
  const tableName = process.env.AIRTABLE_EMPLOYEES_TABLE;
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
      { error: "Failed to fetch employees", details: data },
      { status: response.status },
    );
  }

  const employees = data.records.map((record: AirtableEmployeeRecord) => ({
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
  }));

  return NextResponse.json({ employees });
}
