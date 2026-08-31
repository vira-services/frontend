import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  IconAt,
  IconConfettiFilled,
  IconEye,
  IconHash,
  IconHeartBrokenFilled,
  IconTrendingDown,
  IconTrendingUp,
} from "@tabler/icons-react";
import getAnalytics from "@/lib/api/data/analytics/getAnalytics";

type AnalyticsData = Awaited<ReturnType<typeof getAnalytics>>;

export default function OverviewCards({
  username,
  uid,
  analyticsData,
}: {
  username: string;
  uid: number;
  analyticsData: AnalyticsData;
}) {
  const totalViews =
    analyticsData?.views?.reduce((sum, view) => sum + (view.count || 0), 0) ??
    0;

  const previousTotal = analyticsData?.previousPeriodViews ?? 0;
  const viewsChange =
    previousTotal > 0
      ? ((totalViews - previousTotal) / previousTotal) * 100
      : 0;
  const isPositive = viewsChange >= 0;

  return (
    // <div className="grid grid-cols-1 grid-rows-3 md:grid-cols-3 md:grid-rows-1 mt-4 space-y-4 md:space-y-0 space-x-0 md:space-x-4">
    //       </div>
    <div className="grid grid-cols-1 grid-rows-2 md:grid-cols-4 md:grid-rows-1 mt-4 space-y-4 md:space-y-0 space-x-0 md:space-x-4">
      {/* 2x2 grid for cards */}
      <div className="grid grid-cols-2 gap-4 col-span-2">
        <Card className="relative isolate overflow-hidden">
          <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-[#E04CC8]/15 blur-2xl" />
          <CardHeader className="flex flex-row gap-1 items-center justify-between">
            <h1 className="text-base capitalize text-muted-foreground font-medium">
              username
            </h1>
            <span className="inline-flex size-8 items-center justify-center rounded-lg bg-[#E04CC8]/15 text-[#E04CC8]">
              <IconAt size={18} />
            </span>
          </CardHeader>
          <CardContent className="mb-2">
            <span className="text-xl font-extrabold flex items-end gap-2 bg-gradient-to-r from-[#E04CC8] to-[#f49be2] bg-clip-text text-transparent">
              {username}
            </span>
          </CardContent>
        </Card>
        <Card className="relative isolate overflow-hidden">
          <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-[#E04CC8]/15 blur-2xl" />
          <CardHeader className="flex flex-row gap-1 items-center justify-between">
            <h1 className="text-base capitalize text-muted-foreground font-medium">
              UID
            </h1>
            <span className="inline-flex size-8 items-center justify-center rounded-lg bg-[#E04CC8]/15 text-[#E04CC8]">
              <IconHash size={18} />
            </span>
          </CardHeader>
          <CardContent className="mb-2">
            <span className="text-xl font-extrabold flex items-end gap-2">
              {uid}
            </span>
          </CardContent>
        </Card>
        <Card className="col-span-2 overflow-hidden">
          <div
            className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-[#E04CC8] to-[#f49be2] pointer-events-none"
            aria-hidden="true"
          />
          <CardHeader className="flex flex-row gap-1 items-center justify-between">
            <h1 className="text-base capitalize text-muted-foreground font-medium">
              Views
            </h1>
            <span className="inline-flex size-8 items-center justify-center rounded-lg bg-[#E04CC8]/15 text-[#E04CC8]">
              <IconEye size={18} />
            </span>
          </CardHeader>
          <CardContent className="mb-2">
            <span className="text-xl font-extrabold flex items-end gap-2">
              {totalViews.toLocaleString()}
              <span
                className={`flex items-end gap-1 text-xs font-bold ${
                  isPositive ? "text-green-400" : "text-red-400"
                }`}
              >
                {isPositive ? (
                  <IconTrendingUp size={15} />
                ) : (
                  <IconTrendingDown size={15} />
                )}
                {Math.abs(viewsChange).toFixed(1)}%
              </span>
            </span>
          </CardContent>
        </Card>
      </div>
      {/*full card for giveaways*/}
      <Card className="w-full col-span-2 relative isolate overflow-hidden">
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-[#E04CC8]/10 blur-3xl" />
        <CardHeader className="flex flex-row gap-1 items-center">
          <span className="text-[#E04CC8]">
            <IconConfettiFilled size={20} />
          </span>
          <h1 className="text-base capitalize text-muted-foreground font-medium">
            Giveaways
          </h1>
        </CardHeader>
        <CardContent className="h-full">
          <div className="gap-2 flex flex-col items-center justify-center h-full">
            <IconHeartBrokenFilled
              size={50}
              className="text-[#E04CC8]/60"
            />
            <h1 className="font-medium text-[15px]">
              There are no active giveaways at this time
            </h1>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
