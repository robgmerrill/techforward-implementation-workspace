"use client";

import { ChangeEvent, useState } from "react";

type ImportedEmployee = {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  department?: string;
  role?: string;
  location?: string;
  manager?: string;
  status?: string;
  customerIds: string[];
};

type EmployeeImportRow = {
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  role: string;
  location: string;
  manager: string;
  status: string;
};

type EmployeeCsvImportProps = {
  customerId: string;
  customerName?: string;
  onEmployeesImported: (employees: ImportedEmployee[]) => void;
};

const requiredHeaders = ["firstName", "email"];

const expectedHeaders = [
  "firstName",
  "lastName",
  "email",
  "department",
  "role",
  "location",
  "manager",
  "status",
];

export default function EmployeeCsvImport({
  customerId,
  customerName,
  onEmployeesImported,
}: EmployeeCsvImportProps) {
  const [rows, setRows] = useState<EmployeeImportRow[]>([]);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isImporting, setIsImporting] = useState(false);

  function parseCsvLine(line: string) {
    const values: string[] = [];
    let currentValue = "";
    let insideQuotes = false;

    for (let index = 0; index < line.length; index += 1) {
      const character = line[index];

      if (character === '"') {
        insideQuotes = !insideQuotes;
      } else if (character === "," && !insideQuotes) {
        values.push(currentValue.trim());
        currentValue = "";
      } else {
        currentValue += character;
      }
    }

    values.push(currentValue.trim());

    return values;
  }

  function parseCsv(text: string) {
    const lines = text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    if (lines.length < 2) {
      throw new Error(
        "CSV must include a header row and at least one employee.",
      );
    }

    const headers = parseCsvLine(lines[0]);

    const missingHeaders = requiredHeaders.filter(
      (requiredHeader) => !headers.includes(requiredHeader),
    );

    if (missingHeaders.length > 0) {
      throw new Error(
        `Missing required CSV header: ${missingHeaders.join(", ")}`,
      );
    }

    return lines.slice(1).map((line) => {
      const values = parseCsvLine(line);

      const row = expectedHeaders.reduce(
        (employeeRow, header) => {
          const headerIndex = headers.indexOf(header);

          return {
            ...employeeRow,
            [header]: headerIndex >= 0 ? (values[headerIndex] ?? "") : "",
          };
        },
        {
          firstName: "",
          lastName: "",
          email: "",
          department: "",
          role: "",
          location: "",
          manager: "",
          status: "",
        } as EmployeeImportRow,
      );

      return row;
    });
  }

  function validateRows(importRows: EmployeeImportRow[]) {
    const invalidRows = importRows.filter(
      (row) => !row.firstName.trim() || !row.email.trim(),
    );

    if (invalidRows.length > 0) {
      throw new Error("Every employee must include firstName and email.");
    }
  }

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    setRows([]);
    setError("");
    setMessage("");

    if (!file) {
      return;
    }

    setFileName(file.name);

    try {
      const text = await file.text();
      const parsedRows = parseCsv(text);

      validateRows(parsedRows);

      setRows(parsedRows);
      setMessage(`${parsedRows.length} employee rows ready to import.`);
    } catch (error) {
      console.error(error);
      setError(
        error instanceof Error
          ? error.message
          : "CSV file could not be parsed.",
      );
    }
  }

  async function handleImport() {
    setError("");
    setMessage("");

    if (!customerId) {
      setError("Select a customer before importing employees.");
      return;
    }

    if (rows.length === 0) {
      setError("Choose a CSV file before importing employees.");
      return;
    }

    setIsImporting(true);

    try {
      const response = await fetch("/api/employees", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerId,
          employees: rows,
        }),
      });

      const responseText = await response.text();

      let data: {
        error?: string;
        employees?: ImportedEmployee[];
        importedCount?: number;
      } = {};

      if (responseText) {
        data = JSON.parse(responseText);
      }

      if (!response.ok) {
        console.error(data);
        throw new Error(
          data.error ??
            `Employee import failed with status ${response.status}.`,
        );
      }

      onEmployeesImported(data.employees ?? []);
      setRows([]);
      setFileName("");
      setMessage(
        `${data.importedCount ?? 0} employees imported into Airtable.`,
      );
    } catch (error) {
      console.error(error);
      setError(
        error instanceof Error
          ? error.message
          : "Employees could not be imported.",
      );
    } finally {
      setIsImporting(false);
    }
  }

  return (
    <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold">Employee CSV Import</h2>

        <p className="mt-1 text-sm text-slate-500">
          Upload employee records for {customerName ?? "the selected customer"}.
        </p>
      </div>

      <div className="mt-5 rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
        <p className="font-medium text-slate-700">Expected CSV headers:</p>

        <p className="mt-1 font-mono text-xs">
          firstName,lastName,email,department,role,location,manager,status
        </p>
      </div>

      <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center">
        <input
          type="file"
          accept=".csv,text/csv"
          onChange={handleFileChange}
          className="block w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm"
        />

        <button
          type="button"
          onClick={handleImport}
          disabled={isImporting || rows.length === 0}
          className="rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isImporting ? "Importing..." : "Import Employees"}
        </button>
      </div>

      {fileName && (
        <p className="mt-3 text-sm text-slate-500">Selected file: {fileName}</p>
      )}

      {message && <p className="mt-3 text-sm text-slate-600">{message}</p>}

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      {rows.length > 0 && (
        <div className="mt-5 overflow-hidden rounded-lg border border-slate-200">
          <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-sm font-medium">
              Previewing {rows.length} employee rows
            </p>
          </div>

          <div className="max-h-72 overflow-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-white text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Department</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>

              <tbody>
                {rows.map((row, index) => (
                  <tr key={`${row.email}-${index}`} className="border-t">
                    <td className="px-4 py-3">
                      {[row.firstName, row.lastName].filter(Boolean).join(" ")}
                    </td>

                    <td className="px-4 py-3">{row.email}</td>

                    <td className="px-4 py-3">{row.department || "Not set"}</td>

                    <td className="px-4 py-3">{row.role || "Not set"}</td>

                    <td className="px-4 py-3">
                      {row.status || "Pending Import"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
