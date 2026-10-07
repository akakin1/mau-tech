// Exact public WordPress records; fallback only when the original CMS fails.
export function selectSnapshot(collections, pathname, search) {
  const name = pathname.split('/').filter(Boolean).pop();
  const query = new URLSearchParams(search);
  let records = collections[name];
  if (!records) return null;
  records = records.slice();
  const slug = query.get('slug');
  if (slug) records = records.filter(record => decodeURIComponent(record.slug) === decodeURIComponent(slug));
  const tagIds = query.get('tags')?.split(',').map(Number);
  if (tagIds?.length) {
    const slugs = new Set((collections.tags || []).filter(tag => tagIds.includes(tag.id)).map(tag => tag.slug));
    records = records.filter(record => record.tags?.some(tag => slugs.has(tag.slug)));
  }
  const terms = query.get('search')?.toLocaleLowerCase().split(/\s+/).filter(Boolean);
  if (terms?.length) records = records.filter(record => terms.every(term =>
    (record.title + ' ' + (record.content || '')).toLocaleLowerCase().includes(term)));
  if (name === 'tags' && query.get('orderby') === 'count' && collections.tagsByCount) {
    const order = new Map(collections.tagsByCount.map((tag, index) => [tag.id, index]));
    records.sort((a, b) => (order.get(a.id) ?? 1000) - (order.get(b.id) ?? 1000));
    if (query.get('order') === 'asc') records.reverse();
  }
  const total = records.length;
  const pageSize = Number(query.get('per_page') || 10);
  const page = Number(query.get('page') || 1);
  const totalpages = Math.max(1, Math.ceil(total / pageSize));
  records = records.slice((page - 1) * pageSize, page * pageSize);
  const fields = query.get('_fields')?.split(',');
  if (fields) records = records.map(record => Object.fromEntries(fields.filter(field => field in record).map(field => [field, record[field]])));
  return { records, total, totalpages };
}
const snapshotPromises = new Map();
export async function snapshotResponse(url) {
  if (typeof window === 'undefined') return null;
  const location = new URL(url);
  const name = location.pathname.split('/').filter(Boolean).pop();
  const names = [name, ...(location.searchParams.has('tags') ? ['tags'] : [])];
  const collections = {};
  for (const entry of names) {
    if (!snapshotPromises.has(entry)) snapshotPromises.set(entry,
      fetch('/content/wp-' + entry + '.json').then(response => {
        if (!response.ok) throw new Error('Snapshot unavailable'); return response.json();
      }).catch(error => { snapshotPromises.delete(entry); throw error; }));
    collections[entry] = await snapshotPromises.get(entry);
  }
  const result = selectSnapshot(collections, location.pathname, location.search);
  if (!result) return null;
  return new Response(JSON.stringify(result.records), { headers: {
    'content-type': 'application/json', 'x-wp-total': String(result.total),
    'x-wp-totalpages': String(result.totalpages), 'x-content-source': 'public-wordpress-snapshot'
  }});
}
