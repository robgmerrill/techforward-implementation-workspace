type StatusBadgeProps = {
  status?: string;
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const normalizedStatus = status ?? "Not set";

  const badgeClassName = getBadgeClassName(normalizedStatus);

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${badgeClassName}`}
    >
      {normalizedStatus}
    </span>
  );
}

function getBadgeClassName(status: string) {
  switch (status) {
    case "Live":
    case "Active":
    case "Completed":
      return "bg-green-100 text-green-800";

    case "In Progress":
      return "bg-blue-100 text-blue-800";

    case "Onboarding":
    case "Assigned":
      return "bg-purple-100 text-purple-800";

    case "Pending Import":
      return "bg-yellow-100 text-yellow-800";

    case "Inactive":
      return "bg-slate-200 text-slate-700";

    default:
      return "bg-slate-100 text-slate-600";
  }
}
