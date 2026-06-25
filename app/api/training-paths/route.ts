import { NextResponse } from "next/server";

type AirtableTrainingPathRecord = {
  id: string;
  fields: {
    Name?: string;
    Audience?: string;
    Description?: string;
  };
};

export async function GET() {
  const baseId = process.env.AIRTABLE_BASE_ID;
  const tableName = process.env.AIRTABLE_TRAINING_PATHS_TABLE;
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
      { error: "Failed to fetch training paths", details: data },
      { status: response.status },
    );
  }

  const trainingPaths = data.records.map(
    (record: AirtableTrainingPathRecord) => ({
      id: record.id,
      name: record.fields.Name,
      audience: record.fields.Audience,
      description: record.fields.Description,
    }),
  );

  return NextResponse.json({ trainingPaths });
}
