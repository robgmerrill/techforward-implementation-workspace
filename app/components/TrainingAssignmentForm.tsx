"use client";

import { FormEvent, useState } from "react";

type Employee = {
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

type TrainingPath = {
  id: string;
  name?: string;
  audience?: string;
  description?: string;
};

type Assignment = {
  id: string;
  assignmentName?: string;
  employeeIds: string[];
  trainingPathIds: string[];
  status?: string;
  assignedDate?: string;
};

type TrainingAssignmentFormProps = {
  employees: Employee[];
  trainingPaths: TrainingPath[];
  customerName?: string;
  onAssignmentCreated: (assignment: Assignment) => void;
};

export default function TrainingAssignmentForm({
  employees,
  trainingPaths,
  customerName,
  onAssignmentCreated,
}: TrainingAssignmentFormProps) {
  const [employeeId, setEmployeeId] = useState("");
  const [trainingPathId, setTrainingPathId] = useState("");
  const [status, setStatus] = useState("Assigned");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!employeeId) {
      setError("Select an employee before creating an assignment.");
      return;
    }

    if (!trainingPathId) {
      setError("Select a training path before creating an assignment.");
      return;
    }

    setIsCreating(true);

    try {
      const response = await fetch("/api/assignments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          employeeId,
          trainingPathId,
          status,
        }),
      });

      const responseText = await response.text();

      let data: {
        error?: string;
        assignment?: Assignment;
      } = {};

      if (responseText) {
        data = JSON.parse(responseText);
      }

      if (!response.ok || !data.assignment) {
        console.error(data);
        throw new Error(
          data.error ??
            `Assignment could not be created. Status ${response.status}.`,
        );
      }

      onAssignmentCreated(data.assignment);

      setEmployeeId("");
      setTrainingPathId("");
      setStatus("Assigned");
      setMessage("Training assignment created in Airtable.");
    } catch (error) {
      console.error(error);
      setError(
        error instanceof Error
          ? error.message
          : "Training assignment could not be created.",
      );
    } finally {
      setIsCreating(false);
    }
  }

  function getEmployeeName(employee: Employee) {
    return (
      [employee.firstName, employee.lastName].filter(Boolean).join(" ") ||
      employee.email ||
      "Unnamed employee"
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div>
        <h2 className="text-lg font-semibold">Create Training Assignment</h2>

        <p className="mt-1 text-sm text-slate-500">
          Assign a training path to an employee at{" "}
          {customerName ?? "the selected customer"}.
        </p>
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-3">
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-slate-700">Employee</span>

          <select
            value={employeeId}
            onChange={(event) => setEmployeeId(event.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-4 py-3"
          >
            <option value="">Select an employee</option>

            {employees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {getEmployeeName(employee)}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-slate-700">
            Training Path
          </span>

          <select
            value={trainingPathId}
            onChange={(event) => setTrainingPathId(event.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-4 py-3"
          >
            <option value="">Select a training path</option>

            {trainingPaths.map((trainingPath) => (
              <option key={trainingPath.id} value={trainingPath.id}>
                {trainingPath.name ?? "Unnamed training path"}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-slate-700">Status</span>

          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-4 py-3"
          >
            <option value="Assigned">Assigned</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </label>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="submit"
          disabled={
            isCreating || employees.length === 0 || trainingPaths.length === 0
          }
          className="rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isCreating ? "Creating..." : "Create Assignment"}
        </button>

        {message && <p className="text-sm text-slate-600">{message}</p>}

        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    </form>
  );
}
