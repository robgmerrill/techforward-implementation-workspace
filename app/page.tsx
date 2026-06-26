"use client";

import { FormEvent, useEffect, useState } from "react";
import EmployeeCsvImport from "./components/EmployeeCsvImport";
import TrainingAssignmentForm from "./components/TrainingAssignmentForm";
import StatusBadge from "./components/StatusBadge";

type Customer = {
  id: string;
  name?: string;
  industry?: string;
  employeeCount?: number;
  goLiveDate?: string;
  status?: string;
  primaryAdminName?: string;
  primaryAdminEmail?: string;
};

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

type CustomerFormData = {
  employeeCount: string;
  goLiveDate: string;
  status: string;
  primaryAdminName: string;
  primaryAdminEmail: string;
};

const emptyCustomerForm: CustomerFormData = {
  employeeCount: "",
  goLiveDate: "",
  status: "",
  primaryAdminName: "",
  primaryAdminEmail: "",
};

function formatDate(date?: string) {
  if (!date) {
    return "Not set";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(date));
}

export default function Home() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [trainingPaths, setTrainingPaths] = useState<TrainingPath[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");

  const [customerForm, setCustomerForm] =
    useState<CustomerFormData>(emptyCustomerForm);

  const [isLoading, setIsLoading] = useState(true);
  const [isSavingCustomer, setIsSavingCustomer] = useState(false);
  const [error, setError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    async function loadImplementationData() {
      try {
        const [
          customersResponse,
          employeesResponse,
          trainingPathsResponse,
          assignmentsResponse,
        ] = await Promise.all([
          fetch("/api/customers"),
          fetch("/api/employees"),
          fetch("/api/training-paths"),
          fetch("/api/assignments"),
        ]);

        if (!customersResponse.ok) {
          throw new Error("Failed to load customer data");
        }

        if (!employeesResponse.ok) {
          throw new Error("Failed to load employee data");
        }

        if (!trainingPathsResponse.ok) {
          throw new Error("Failed to load training path data");
        }

        if (!assignmentsResponse.ok) {
          throw new Error("Failed to load assignment data");
        }

        const customersData = await customersResponse.json();
        const employeesData = await employeesResponse.json();
        const trainingPathsData = await trainingPathsResponse.json();
        const assignmentsData = await assignmentsResponse.json();

        setCustomers(customersData.customers ?? []);
        setEmployees(employeesData.employees ?? []);
        setTrainingPaths(trainingPathsData.trainingPaths ?? []);
        setAssignments(assignmentsData.assignments ?? []);

        const firstCustomer = customersData.customers?.[0];

        if (firstCustomer) {
          setSelectedCustomerId(firstCustomer.id);
        }
      } catch (error) {
        console.error(error);
        setError("Implementation data could not be loaded.");
      } finally {
        setIsLoading(false);
      }
    }

    loadImplementationData();
  }, []);

  const customer = customers.find(
    (currentCustomer) => currentCustomer.id === selectedCustomerId,
  );

  useEffect(() => {
    if (!customer) {
      setCustomerForm(emptyCustomerForm);
      return;
    }

    setCustomerForm({
      employeeCount:
        customer.employeeCount !== undefined
          ? String(customer.employeeCount)
          : "",
      goLiveDate: customer.goLiveDate ?? "",
      status: customer.status ?? "",
      primaryAdminName: customer.primaryAdminName ?? "",
      primaryAdminEmail: customer.primaryAdminEmail ?? "",
    });

    setSaveMessage("");
  }, [customer]);

  const filteredEmployees = employees.filter((employee) =>
    employee.customerIds.includes(selectedCustomerId),
  );

  const filteredEmployeeIds = new Set(
    filteredEmployees.map((employee) => employee.id),
  );

  const filteredAssignments = assignments.filter((assignment) =>
    assignment.employeeIds.some((employeeId) =>
      filteredEmployeeIds.has(employeeId),
    ),
  );

  const importedEmployeeCount = filteredEmployees.length;
  const expectedEmployeeCount = customer?.employeeCount ?? 0;

  function getEmployeeName(employeeIds: string[]) {
    const employee = employees.find((currentEmployee) =>
      employeeIds.includes(currentEmployee.id),
    );

    if (!employee) {
      return "Unknown employee";
    }

    return (
      [employee.firstName, employee.lastName].filter(Boolean).join(" ") ||
      "Unnamed employee"
    );
  }

  function getTrainingPathName(trainingPathIds: string[]) {
    const trainingPath = trainingPaths.find((currentTrainingPath) =>
      trainingPathIds.includes(currentTrainingPath.id),
    );

    return trainingPath?.name ?? "Unknown training path";
  }

  async function handleCustomerSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!customer) {
      return;
    }

    setIsSavingCustomer(true);
    setSaveMessage("");

    try {
      const response = await fetch("/api/customers", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: customer.id,
          employeeCount: customerForm.employeeCount
            ? Number(customerForm.employeeCount)
            : 0,
          goLiveDate: customerForm.goLiveDate,
          status: customerForm.status,
          primaryAdminName: customerForm.primaryAdminName,
          primaryAdminEmail: customerForm.primaryAdminEmail,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error(data);
        throw new Error("Failed to update customer");
      }

      setCustomers((currentCustomers) =>
        currentCustomers.map((currentCustomer) =>
          currentCustomer.id === data.customer.id
            ? data.customer
            : currentCustomer,
        ),
      );

      setSaveMessage("Customer configuration saved to Airtable.");
    } catch (error) {
      console.error(error);
      setSaveMessage("Customer configuration could not be saved.");
    } finally {
      setIsSavingCustomer(false);
    }
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-100 p-8 text-slate-900">
        <p>Loading implementation workspace...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-slate-100 p-8 text-slate-900">
        <p>{error}</p>
      </main>
    );
  }

  if (!customer) {
    return (
      <main className="min-h-screen bg-slate-100 p-8 text-slate-900">
        <p>No customer record was found.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 p-8 text-slate-900">
      <section className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-blue-700">
              TechForward Implementation Workspace
            </p>

            <h1 className="text-3xl font-bold">{customer.name}</h1>

            <p className="mt-2 text-slate-600">
              Customer onboarding and implementation overview
            </p>
          </div>

          <label className="flex w-full max-w-xs flex-col gap-2">
            <span className="text-sm font-medium text-slate-700">
              Select customer
            </span>

            <select
              value={selectedCustomerId}
              onChange={(event) => setSelectedCustomerId(event.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 shadow-sm"
            >
              {customers.map((currentCustomer) => (
                <option key={currentCustomer.id} value={currentCustomer.id}>
                  {currentCustomer.name ?? "Unnamed customer"}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Status</p>

            <div className="mt-3">
              <StatusBadge status={customer.status} />
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Industry</p>
            <p className="mt-2 text-xl font-semibold">
              {customer.industry ?? "Not set"}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Expected Employees</p>
            <p className="mt-2 text-xl font-semibold">
              {expectedEmployeeCount || "Not set"}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Imported Employees</p>
            <p className="mt-2 text-xl font-semibold">
              {importedEmployeeCount}
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Target Go-Live</p>
            <p className="mt-2 text-xl font-semibold">
              {formatDate(customer.goLiveDate)}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold">Primary Administrator</h2>

            <p className="mt-3">{customer.primaryAdminName ?? "Not set"}</p>

            <p className="text-sm text-slate-500">
              {customer.primaryAdminEmail ?? "Not set"}
            </p>
          </div>
        </div>

        <form
          onSubmit={handleCustomerSave}
          className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div>
            <h2 className="text-lg font-semibold">Customer Configuration</h2>

            <p className="mt-1 text-sm text-slate-500">
              Update onboarding details and save the changes to Airtable.
            </p>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-700">
                Implementation Status
              </span>

              <select
                value={customerForm.status}
                onChange={(event) =>
                  setCustomerForm((currentForm) => ({
                    ...currentForm,
                    status: event.target.value,
                  }))
                }
                className="rounded-lg border border-slate-300 bg-white px-4 py-3"
              >
                <option value="">Select a status</option>
                <option value="Onboarding">Onboarding</option>
                <option value="In Progress">In Progress</option>
                <option value="Live">Live</option>
              </select>
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-700">
                Target Go-Live Date
              </span>

              <input
                type="date"
                value={customerForm.goLiveDate}
                onChange={(event) =>
                  setCustomerForm((currentForm) => ({
                    ...currentForm,
                    goLiveDate: event.target.value,
                  }))
                }
                className="rounded-lg border border-slate-300 px-4 py-3"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-700">
                Expected Employee Count
              </span>

              <input
                type="number"
                min="0"
                value={customerForm.employeeCount}
                onChange={(event) =>
                  setCustomerForm((currentForm) => ({
                    ...currentForm,
                    employeeCount: event.target.value,
                  }))
                }
                className="rounded-lg border border-slate-300 px-4 py-3"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-700">
                Primary Administrator
              </span>

              <input
                type="text"
                value={customerForm.primaryAdminName}
                onChange={(event) =>
                  setCustomerForm((currentForm) => ({
                    ...currentForm,
                    primaryAdminName: event.target.value,
                  }))
                }
                className="rounded-lg border border-slate-300 px-4 py-3"
              />
            </label>

            <label className="flex flex-col gap-2 md:col-span-2">
              <span className="text-sm font-medium text-slate-700">
                Administrator Email
              </span>

              <input
                type="email"
                value={customerForm.primaryAdminEmail}
                onChange={(event) =>
                  setCustomerForm((currentForm) => ({
                    ...currentForm,
                    primaryAdminEmail: event.target.value,
                  }))
                }
                className="rounded-lg border border-slate-300 px-4 py-3"
              />
            </label>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="submit"
              disabled={isSavingCustomer}
              className="rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSavingCustomer ? "Saving..." : "Save Configuration"}
            </button>

            {saveMessage && (
              <p className="text-sm text-slate-600">{saveMessage}</p>
            )}
          </div>
        </form>

        <EmployeeCsvImport
          customerId={customer.id}
          customerName={customer.name}
          onEmployeesImported={(importedEmployees) => {
            setEmployees((currentEmployees) => [
              ...currentEmployees,
              ...importedEmployees,
            ]);
          }}
        />

        <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5">
            <h2 className="text-lg font-semibold">Imported Employees</h2>

            <p className="mt-1 text-sm text-slate-500">
              Employee records currently linked to {customer.name}.
            </p>
          </div>

          {filteredEmployees.length === 0 ? (
            <p className="p-5 text-slate-500">
              No employees have been imported for this customer.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead className="bg-slate-50 text-sm text-slate-600">
                  <tr>
                    <th className="px-5 py-3 font-medium">Employee</th>
                    <th className="px-5 py-3 font-medium">Email</th>
                    <th className="px-5 py-3 font-medium">Department</th>
                    <th className="px-5 py-3 font-medium">Role</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredEmployees.map((employee) => (
                    <tr
                      key={employee.id}
                      className="border-t border-slate-100 text-sm"
                    >
                      <td className="px-5 py-4 font-medium">
                        {[employee.firstName, employee.lastName]
                          .filter(Boolean)
                          .join(" ") || "Unnamed employee"}
                      </td>

                      <td className="px-5 py-4">
                        {employee.email ?? "Not set"}
                      </td>

                      <td className="px-5 py-4">
                        {employee.department ?? "Not set"}
                      </td>

                      <td className="px-5 py-4">
                        {employee.role ?? "Not set"}
                      </td>

                      <td className="px-5 py-4">
                        <StatusBadge status={employee.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <TrainingAssignmentForm
          employees={filteredEmployees}
          trainingPaths={trainingPaths}
          customerName={customer.name}
          onAssignmentCreated={(assignment) => {
            setAssignments((currentAssignments) => [
              ...currentAssignments,
              assignment,
            ]);
          }}
        />

        <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5">
            <h2 className="text-lg font-semibold">Training Assignments</h2>

            <p className="mt-1 text-sm text-slate-500">
              Training currently assigned to employees at {customer.name}.
            </p>
          </div>

          {filteredAssignments.length === 0 ? (
            <p className="p-5 text-slate-500">
              No training assignments were found for this customer.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead className="bg-slate-50 text-sm text-slate-600">
                  <tr>
                    <th className="px-5 py-3 font-medium">Employee</th>
                    <th className="px-5 py-3 font-medium">Training Path</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium">Assigned Date</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredAssignments.map((assignment) => (
                    <tr
                      key={assignment.id}
                      className="border-t border-slate-100 text-sm"
                    >
                      <td className="px-5 py-4 font-medium">
                        {getEmployeeName(assignment.employeeIds)}
                      </td>

                      <td className="px-5 py-4">
                        {getTrainingPathName(assignment.trainingPathIds)}
                      </td>

                      <td className="px-5 py-4">
                        <StatusBadge status={assignment.status} />
                      </td>

                      <td className="px-5 py-4">
                        {formatDate(assignment.assignedDate)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
