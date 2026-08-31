import { getProfile } from "@/lib/api/data/profiles/getProfile";
import ProfilePageProvider from "@/components/profile/PageProvider";
import EntryScreen from "@/components/profile/EntryScreen";
import ProfileContent from "@/components/profile/ProfileContent";
import Overlay from "@/components/profile/overlay";
import { TrackView } from "@/components/profile/TrackView";
import { headers } from "next/headers";
import NotFound from "./not-found";
import { generateMetadata } from "@/lib/api/data/profiles/metadata";

export { generateMetadata };

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ url: string }>;
}) {
  const { url } = await params;
  const profile = await getProfile({ url: url.toLowerCase() });
  if (!profile) {
    return <NotFound url={url.toLowerCase()} />;
  }
  const headersList = await headers();
  const userAgent = headersList.get("user-agent") ?? "";
  const device = /mobile/i.test(userAgent) ? "mobile" : "desktop";
  return (
    <ProfilePageProvider
      background={profile.config.backgrounds[0] ?? null}
      config={profile.config}
    >
      <TrackView userId={profile.id} device={device} />
      <Overlay config={profile.config} />
      <EntryScreen showEnterscreen={true} config={profile.config} />
      <ProfileContent config={profile.config} user={profile} />
    </ProfilePageProvider>
  );
}
