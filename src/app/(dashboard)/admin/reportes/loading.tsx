import { PageHeaderSkeleton, StatsGridSkeleton, ChartCardSkeleton } from '@/components/dashboard/skeletons'

export default function Loading() {
  return (
    <div className="space-y-8">
      <PageHeaderSkeleton />
      <StatsGridSkeleton count={3} />
      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCardSkeleton />
        <ChartCardSkeleton />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCardSkeleton />
        <ChartCardSkeleton />
      </div>
    </div>
  )
}
