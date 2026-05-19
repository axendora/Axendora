import { PageHeaderSkeleton, StatsGridSkeleton, ListSkeleton } from '@/components/dashboard/skeletons'

export default function Loading() {
  return (
    <div className="space-y-8">
      <PageHeaderSkeleton />
      <StatsGridSkeleton count={4} />
      <ListSkeleton rows={5} />
    </div>
  )
}
