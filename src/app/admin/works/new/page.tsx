import { WorkForm } from "@/components/work-form";
import { createWorkAction } from "../../actions";
export default function NewWorkPage() { return <><div className="page-title"><div><p className="eyebrow">NEW WORK</p><h1>添加作品</h1></div></div><WorkForm action={createWorkAction} /></>; }
