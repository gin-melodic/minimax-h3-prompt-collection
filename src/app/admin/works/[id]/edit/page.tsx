import { notFound } from "next/navigation";
import { WorkForm } from "@/components/work-form";
import { getAdminWork } from "@/db/works";
import { updateWorkAction } from "../../../actions";
export default async function EditWorkPage({ params }: { params: Promise<{ id: string }> }) {
  const work = getAdminWork(Number((await params).id));
  if (!work) notFound();
  return <><div className="page-title"><div><p className="eyebrow">EDIT WORK</p><h1>{work.title}</h1></div></div><WorkForm work={work} action={updateWorkAction.bind(null, work.id)} /></>;
}
