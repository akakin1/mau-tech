export function restorePreExamples(html: string, cmsSource: string) {
  const raw = cmsSource.replace(/```[\s\S]*?```/g, '').match(/<pre\b[^>]*>[\s\S]*?<\/pre>/gi) || [];
  const displayed = html.match(/<pre\b[^>]*>[\s\S]*?<\/pre>/gi) || [];
  if (!raw.length || raw.length !== displayed.length) return html;
  let index = 0;
  return html.replace(/<pre\b[^>]*>[\s\S]*?<\/pre>/gi, () => raw[index++]);
}
