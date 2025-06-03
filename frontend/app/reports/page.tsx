import { ReportHeader } from "@/components/reports/report-header"
import { ReportForm } from "@/components/reports/report-form"

export default function ReportsPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <ReportHeader />
      <ReportForm />
    </div>
  )
}
