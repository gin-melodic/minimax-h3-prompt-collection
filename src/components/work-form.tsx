import type { Work } from "@/lib/types";

export function WorkForm({ work, action }: { work?: Work; action: (formData: FormData) => void | Promise<void> }) {
  return <form action={action} className="editor stack">
    <div className="field-grid">
      <label className="wide">视频 URL<input name="videoUrl" type="url" required defaultValue={work?.videoUrl} placeholder="https://www.youtube.com/watch?v=…" /></label>
      <label>标题（留空则自动读取）<input name="title" defaultValue={work?.title} /></label>
      <label>路径标识（留空则自动生成）<input name="slug" defaultValue={work?.slug} /></label>
      <label>作者覆盖值<input name="remoteAuthor" defaultValue={work?.remoteAuthor || ""} /></label>
      <label>远程封面覆盖 URL<input name="remoteCoverUrl" type="url" defaultValue={work?.remoteCoverUrl || ""} /></label>
      <label>分类<input name="category" defaultValue={work?.category || ""} /></label>
      <label>标签（逗号分隔）<input name="tags" defaultValue={work?.tags.join(", ")} /></label>
      <label>播放方式<select name="videoMode" defaultValue={work?.videoMode || "auto"}><option value="auto">自动</option><option value="embed">强制内嵌</option><option value="external">仅外跳</option></select></label>
      <label>状态<select name="status" defaultValue={work?.status || "draft"}><option value="draft">草稿</option><option value="published">发布</option><option value="archived">归档</option></select></label>
      <label className="check"><input name="featured" type="checkbox" defaultChecked={work?.featured} /> 推荐作品</label>
      <label className="wide">简介<textarea name="summary" rows={3} defaultValue={work?.summary || ""} /></label>
      <label className="wide">提示词<textarea name="prompt" rows={12} required defaultValue={work?.prompt} /></label>
      <label className="wide">创作说明<textarea name="notes" rows={7} defaultValue={work?.notes || ""} /></label>
    </div>
    <div className="actions"><button className="button" type="submit">保存作品</button></div>
  </form>;
}
