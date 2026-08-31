import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  IconClickFilled,
  IconEye,
  IconFlagFilled,
  IconWorldFilled,
} from "@tabler/icons-react";

export default function TotalCards({
  days,
  totalViews,
  totalClickRate,
  totalLinkClicks,
  totalProfileViews,
}: {
  days: string;
  topCountry?: string;
  totalViews?: number;
  totalLinkClicks?: number;
  totalClickRate?: number;
  totalProfileViews?: number;
}) {
  // because of days being like 24hrs 3d 7d yk we need to auto format dat
  function autoFormatDays(days: string) {
    const map: Record<string, string> = {
      "24hrs": "the last 24 hours",
      "3d": "the last 3 days",
      "7d": "the last 7 days",
      "14d": "the last 2 weeks",
      "30d": "the last month",
      "365d": "the last year",
    };
    return map[days] ?? `the last ${days}`;
  }
  return (
    <div className="grid grid-cols-1 grid-rows-4 md:grid-cols-4 md:grid-rows-1 gap-4 mt-5">
      <Card className="relative isolate overflow-hidden">
        <div className="pointer-events-none absolute -top-10 -right-10 h-24 w-24 rounded-full bg-[#E04CC8]/10 blur-2xl" />
        <CardHeader className="flex items-center justify-between">
          <h1 className="text-base capitalize text-muted-foreground font-medium">
            Total Link Clicks
          </h1>
          <span className="inline-flex size-8 items-center justify-center rounded-lg bg-[#E04CC8]/15 text-[#E04CC8]">
            <IconClickFilled size={18} />
          </span>
        </CardHeader>
        <CardContent>
          <span className="text-2xl font-extrabold flex items-end gap-2">40</span>
        </CardContent>
        <CardFooter className="p-0 px-4 pb-4 text-muted-foreground">
          In the last {autoFormatDays(days)}
        </CardFooter>
      </Card>
      <Card className="relative isolate overflow-hidden">
        <div className="pointer-events-none absolute -top-10 -right-10 h-24 w-24 rounded-full bg-[#E04CC8]/10 blur-2xl" />
        <CardHeader className="flex items-center justify-between">
          <h1 className="text-base capitalize text-muted-foreground font-medium">
            Total Profile Views
          </h1>
          <span className="inline-flex size-8 items-center justify-center rounded-lg bg-[#E04CC8]/15 text-[#E04CC8]">
            <IconEye size={18} />
          </span>
        </CardHeader>
        <CardContent>
          <span className="text-2xl font-extrabold flex items-end gap-2">
            {totalProfileViews}
          </span>
        </CardContent>
        <CardFooter className="p-0 px-4 pb-4 text-muted-foreground">
          {/*<p>
            <span className="text-green-700">+500{" "}</span>In the last {autoFormatDays(days)}
          </p>*/}
          In the last {autoFormatDays(days)}
        </CardFooter>
      </Card>
      <Card className="relative isolate overflow-hidden">
        <div className="pointer-events-none absolute -top-10 -right-10 h-24 w-24 rounded-full bg-[#E04CC8]/10 blur-2xl" />
        <CardHeader className="flex items-center justify-between">
          <h1 className="text-base capitalize text-muted-foreground font-medium">
            Click Rate
          </h1>
          <span className="inline-flex size-8 items-center justify-center rounded-lg bg-[#E04CC8]/15 text-[#E04CC8]">
            <IconFlagFilled size={18} />
          </span>
        </CardHeader>
        <CardContent>
          <span className="text-2xl font-extrabold flex items-end gap-2">5.3%</span>
        </CardContent>
        <CardFooter className="p-0 px-4 pb-4 text-muted-foreground">
          In the last {autoFormatDays(days)}
        </CardFooter>
      </Card>
      <Card className="relative isolate overflow-hidden">
        <div className="pointer-events-none absolute -top-10 -right-10 h-24 w-24 rounded-full bg-[#E04CC8]/10 blur-2xl" />
        <CardHeader className="flex items-center justify-between">
          <h1 className="text-base capitalize text-muted-foreground font-medium">
            Top Viewed Country
          </h1>
          <span className="inline-flex size-8 items-center justify-center rounded-lg bg-[#E04CC8]/15 text-[#E04CC8]">
            <IconWorldFilled size={18} />
          </span>
        </CardHeader>
        <CardContent>
          <span className="text-2xl font-extrabold flex items-end gap-2">
            <h1>United States</h1>
          </span>
        </CardContent>
        <CardFooter className="p-0 px-4 pb-4 text-muted-foreground">
          In the last {autoFormatDays(days)}
        </CardFooter>
      </Card>
    </div>
  );
}
