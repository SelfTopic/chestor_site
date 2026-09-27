import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DialogById } from "@/components/dialog/DialogById";
import { DIALOG_IDS, DIALOGS, isDialogId } from "@/content/dialogs";

export const dynamicParams = false;

export function generateStaticParams() {
  return DIALOG_IDS.map((id) => ({ id }));
}

export async function generateMetadata({ params }: PageProps<"/c/[id]">): Promise<Metadata> {
  const { id } = await params;
  if (!isDialogId(id)) return {};
  const dialog = DIALOGS[id];
  return { title: `${dialog.title} · CheStor`, description: dialog.description };
}

export default async function DialogPage({ params }: PageProps<"/c/[id]">) {
  const { id } = await params;
  if (!isDialogId(id)) notFound();
  return <DialogById id={id} />;
}
