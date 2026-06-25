import { NextResponse } from "next/server";

type AirtableCustomerRecord = {
  id: string;
  fields: {
    Name?: string;
    Industry?: string;
    "Employee Count"?: number;
    "Go Live Date"?: string;
    Status?: string;
    "Primary Admin Name"?: string;
    "Primary Admin Email"?: string;
  };
};

type CustomerUpdateRequest = {
  id?: string;
  name?: string;
  industry?: string;
  employeeCount?: number;
  goLiveDate?: string;
  status?: string;
  primaryAdminName?: string;
  primaryAdminEmail?: string;
};

function getAirtableConfig() {
  return {
    baseId: process.env.AIRTABLE_BASE_ID,
    tableName: process.env.AIRTABLE_CUSTOMERS_TABLE,
    apiKey: process.env.AIRTABLE_API_KEY,
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
    console.log("Airtable error:", data);

    return NextResponse.json(
      { error: "Failed to fetch customers", details: data },
      { status: response.status },
    );
  }

  const customers = data.records.map((record: AirtableCustomerRecord) => ({
    id: record.id,
    name: record.fields.Name,
    industry: record.fields.Industry,
    employeeCount: record.fields["Employee Count"],
    goLiveDate: record.fields["Go Live Date"],
    status: record.fields.Status,
    primaryAdminName: record.fields["Primary Admin Name"],
    primaryAdminEmail: record.fields["Primary Admin Email"],
  }));

  return NextResponse.json({ customers });
}

export async function PATCH(request: Request) {
  const { baseId, tableName, apiKey } = getAirtableConfig();

  if (!baseId || !tableName || !apiKey) {
    return NextResponse.json(
      { error: "Missing Airtable environment variables" },
      { status: 500 },
    );
  }

  const body = (await request.json()) as CustomerUpdateRequest;

  if (!body.id) {
    return NextResponse.json(
      { error: "Customer record ID is required" },
      { status: 400 },
    );
  }

  const fields: AirtableCustomerRecord["fields"] = {};

  if (body.name !== undefined) {
    fields.Name = body.name;
  }

  if (body.industry !== undefined) {
    fields.Industry = body.industry;
  }

  if (body.employeeCount !== undefined) {
    fields["Employee Count"] = body.employeeCount;
  }

  if (body.goLiveDate !== undefined) {
    fields["Go Live Date"] = body.goLiveDate;
  }

  if (body.status !== undefined) {
    fields.Status = body.status;
  }

  if (body.primaryAdminName !== undefined) {
    fields["Primary Admin Name"] = body.primaryAdminName;
  }

  if (body.primaryAdminEmail !== undefined) {
    fields["Primary Admin Email"] = body.primaryAdminEmail;
  }

  const airtableUrl = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(
    tableName,
  )}/${body.id}`;

  const response = await fetch(airtableUrl, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ fields }),
  });

  const data = await response.json();

  if (!response.ok) {
    console.log("Airtable update error:", data);

    return NextResponse.json(
      { error: "Failed to update customer", details: data },
      { status: response.status },
    );
  }

  const customer = {
    id: data.id,
    name: data.fields.Name,
    industry: data.fields.Industry,
    employeeCount: data.fields["Employee Count"],
    goLiveDate: data.fields["Go Live Date"],
    status: data.fields.Status,
    primaryAdminName: data.fields["Primary Admin Name"],
    primaryAdminEmail: data.fields["Primary Admin Email"],
  };

  return NextResponse.json({ customer });
}
