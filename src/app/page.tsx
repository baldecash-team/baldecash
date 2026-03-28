import { redirect } from "next/navigation";
import PrototypesDashboard from "./PrototypesDashboard";

export default function RootPage() {
  // Production: NEXT_PUBLIC_APP_BASE_PATH is empty → redirect to /home/
  if (process.env.NEXT_PUBLIC_APP_BASE_PATH === '') {
    redirect('/home/');
  }

  // Dev: show prototypes dashboard
  return <PrototypesDashboard />;
}
