import { redirect } from "next/navigation";

export default async function DownloadPage({ params }: { params: Promise<{ token: string }> }) {
  await params;
  redirect("/");
}
