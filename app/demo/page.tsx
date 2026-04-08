import { redirect } from "next/navigation";

export default function DemoPage() {
  redirect("/api/demo-session");
}
