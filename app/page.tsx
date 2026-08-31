import getAccount from "@/lib/api/data/users/getAccount";
import LandingPage, {
  type LandingUser,
} from "./_components/landing-page/landing-page";

export default async function Home() {
  let user: LandingUser | null = null;
  try {
    const account = await getAccount();
    if (account) {
      user = {
        username: account.username,
        avatar: account.config?.avatar_url ?? null,
      };
    }
  } catch {
    user = null;
  }

  return <LandingPage user={user} />;
}