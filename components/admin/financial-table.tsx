"use client";

import { cn } from "@/lib/utils";

const subscriptions = [
  {
    id: "SUB-001",
    student: "Aria Chen",
    plan: "Pro Annual",
    amount: "$199.00",
    commission: "$29.85",
    date: "Mar 3, 2026",
    status: "Active",
  },
  {
    id: "SUB-002",
    student: "Marcus Rivera",
    plan: "Pro Monthly",
    amount: "$19.99",
    commission: "$3.00",
    date: "Mar 3, 2026",
    status: "Active",
  },
  {
    id: "SUB-003",
    student: "Yuki Tanaka",
    plan: "Pro Annual",
    amount: "$199.00",
    commission: "$29.85",
    date: "Mar 2, 2026",
    status: "Active",
  },
  {
    id: "SUB-004",
    student: "Lena Kowalski",
    plan: "Basic Monthly",
    amount: "$9.99",
    commission: "$1.50",
    date: "Mar 2, 2026",
    status: "Active",
  },
  {
    id: "SUB-005",
    student: "Devon Okafor",
    plan: "Pro Monthly",
    amount: "$19.99",
    commission: "$3.00",
    date: "Mar 1, 2026",
    status: "Pending",
  },
  {
    id: "SUB-006",
    student: "Sofia Bergmann",
    plan: "Pro Annual",
    amount: "$199.00",
    commission: "$29.85",
    date: "Feb 28, 2026",
    status: "Active",
  },
  {
    id: "SUB-007",
    student: "James Oduya",
    plan: "Basic Monthly",
    amount: "$9.99",
    commission: "$1.50",
    date: "Feb 27, 2026",
    status: "Cancelled",
  },
  {
    id: "SUB-008",
    student: "Priya Sharma",
    plan: "Pro Monthly",
    amount: "$19.99",
    commission: "$3.00",
    date: "Feb 26, 2026",
    status: "Active",
  },
];

interface FinancialTableProps {
  isAdminMode?: boolean;
}

const adminSubscriptions = [
  {
    id: "ORG-001",
    student: "Art Academy NYC",
    plan: "Enterprise",
    amount: "$4,990.00",
    commission: "$748.50",
    date: "Mar 3, 2026",
    status: "Active",
  },
  {
    id: "ORG-002",
    student: "Berlin Design School",
    plan: "Enterprise",
    amount: "$4,990.00",
    commission: "$748.50",
    date: "Mar 2, 2026",
    status: "Active",
  },
  {
    id: "ORG-003",
    student: "Tokyo Institute of Arts",
    plan: "Enterprise Plus",
    amount: "$9,990.00",
    commission: "$1,498.50",
    date: "Mar 1, 2026",
    status: "Active",
  },
  {
    id: "ORG-004",
    student: "London Creative Hub",
    plan: "Enterprise",
    amount: "$4,990.00",
    commission: "$748.50",
    date: "Feb 28, 2026",
    status: "Pending",
  },
  {
    id: "ORG-005",
    student: "Paris Arts Academy",
    plan: "Enterprise Plus",
    amount: "$9,990.00",
    commission: "$1,498.50",
    date: "Feb 26, 2026",
    status: "Active",
  },
];

export function FinancialTable({ isAdminMode = false }: FinancialTableProps) {
  const data = isAdminMode ? adminSubscriptions : subscriptions;
  const entityLabel = isAdminMode ? "Institution" : "Student";

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="border-b border-border px-5 py-4">
        <h3 className="text-sm font-semibold text-foreground">
          {isAdminMode ? "Recent Institutional Subscriptions" : "Recent Student Subscriptions"}
        </h3>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {isAdminMode
            ? "Platform-wide institutional plans and commissions"
            : "School commission from each subscription"}
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground">
                ID
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground">
                {entityLabel}
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground">
                Plan
              </th>
              <th className="px-5 py-3 text-right text-xs font-semibold text-muted-foreground">
                Amount
              </th>
              <th className="px-5 py-3 text-right text-xs font-semibold text-muted-foreground">
                Commission
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground">
                Date
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.map((sub) => (
              <tr
                key={sub.id}
                className="transition-colors hover:bg-muted/30"
              >
                <td className="whitespace-nowrap px-5 py-3 text-xs font-mono text-muted-foreground">
                  {sub.id}
                </td>
                <td className="whitespace-nowrap px-5 py-3 text-sm font-medium text-foreground">
                  {sub.student}
                </td>
                <td className="whitespace-nowrap px-5 py-3 text-sm text-muted-foreground">
                  {sub.plan}
                </td>
                <td className="whitespace-nowrap px-5 py-3 text-right text-sm font-medium text-foreground">
                  {sub.amount}
                </td>
                <td className="whitespace-nowrap px-5 py-3 text-right text-sm font-semibold text-emerald-600">
                  {sub.commission}
                </td>
                <td className="whitespace-nowrap px-5 py-3 text-sm text-muted-foreground">
                  {sub.date}
                </td>
                <td className="whitespace-nowrap px-5 py-3">
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                      sub.status === "Active" && "bg-emerald-500/10 text-emerald-600",
                      sub.status === "Pending" && "bg-amber-500/10 text-amber-600",
                      sub.status === "Cancelled" && "bg-red-500/10 text-red-500"
                    )}
                  >
                    {sub.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
