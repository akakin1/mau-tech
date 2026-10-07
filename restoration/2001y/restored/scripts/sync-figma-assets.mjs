import { mkdir, readFile, writeFile } from "node:fs/promises";
import { request as httpsRequest } from "node:https";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const manifestPath = join(root, "content/work-assets.mjs");

function readOption(name) {
  const index = process.argv.indexOf(`--${name}`);
  return index === -1 ? undefined : process.argv[index + 1];
}

function usage() {
  console.error(
    "Usage: FIGMA_ACCESS_TOKEN=... (or FIGMA_TOKEN=...) bun run assets:sync -- --slug ci-works --file G8jmXOQKLj1y2EjEg8214k --page 'Page 1' [--include-names 'Frame 35,Frame 34 (a),Frame 26']"
  );
}

const WORK_FRAME_SELECTION = {
  "ci-works": ["Frame 35", "Frame 34 (a)", "Frame 26"],
};

async function requestBuffer(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const request = httpsRequest(
      url,
      { headers, family: 4, timeout: 60_000 },
      (response) => {
        const chunks = [];
        response.on("data", (chunk) => chunks.push(chunk));
        response.on("end", () => {
          const body = Buffer.concat(chunks);
          if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
            requestBuffer(new URL(response.headers.location, url).toString(), headers).then(resolve, reject);
            return;
          }
          resolve({
            status: response.statusCode ?? 0,
            headers: response.headers,
            body,
          });
        });
      }
    );
    request.on("timeout", () => request.destroy(new Error(`HTTPS request timed out for ${url}`)));
    request.on("error", reject);
    request.end();
  });
}

async function figmaJson(path, token) {
  const response = await requestBuffer(`https://api.figma.com/v1${path}`, {
    "X-Figma-Token": token,
  });
  if (response.status < 200 || response.status >= 300) {
    const retryAfter = response.headers?.["retry-after"];
    const suffix = retryAfter ? `; retry-after=${retryAfter}s` : "";
    throw new Error(`Figma API returned HTTP ${response.status} for ${path}${suffix}`);
  }
  return JSON.parse(response.body.toString("utf8"));
}

async function download(url) {
  const response = await requestBuffer(url);
  if (response.status < 200 || response.status >= 300) {
    throw new Error(`Figma image download returned HTTP ${response.status}`);
  }
  return response.body;
}

function parseManifest(source) {
  return JSON.parse(
    source
      .replace(/^\s*const assetManifest = /, "")
      .replace(/;\s*export default assetManifest;?\s*$/, "")
  );
}

function jpegSize(buffer) {
  if (buffer[0] !== 0xff || buffer[1] !== 0xd8) {
    throw new Error("Expected a JPEG export from Figma");
  }

  let offset = 2;
  while (offset < buffer.length) {
    if (buffer[offset] !== 0xff) {
      offset += 1;
      continue;
    }
    const marker = buffer[offset + 1];
    offset += 2;
    if (marker === 0xd8 || marker === 0xd9) continue;
    const length = buffer.readUInt16BE(offset);
    if (marker >= 0xc0 && marker <= 0xc3) {
      return {
        width: buffer.readUInt16BE(offset + 5),
        height: buffer.readUInt16BE(offset + 3),
      };
    }
    offset += length;
  }
  throw new Error("Could not determine JPEG dimensions");
}

function pdfObject(objects, body) {
  objects.push(body == null ? null : Buffer.from(body));
  return objects.length;
}

function makePosterPdf(images) {
  const objects = [];
  const pagesObject = pdfObject(objects, null);
  const pageRefs = [];

  for (const image of images) {
    const { width: imageWidth, height: imageHeight } = jpegSize(image);
    const pageWidth = 595.28;
    const pageHeight = 841.89;
    const scale = Math.min(pageWidth / imageWidth, pageHeight / imageHeight);
    const width = imageWidth * scale;
    const height = imageHeight * scale;
    const x = (pageWidth - width) / 2;
    const y = (pageHeight - height) / 2;

    const imageObject = pdfObject(objects, null);
    const content = Buffer.from(`q ${width} 0 0 ${height} ${x} ${y} cm /Im1 Do Q`);
    const contentObject = pdfObject(objects, null);
    const pageObject = pdfObject(objects, null);
    pageRefs.push(pageObject);

    objects[imageObject - 1] = Buffer.concat([
      Buffer.from(
        `<< /Type /XObject /Subtype /Image /Width ${imageWidth} /Height ${imageHeight} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${image.length} >>\nstream\n`
      ),
      image,
      Buffer.from("\nendstream"),
    ]);
    objects[contentObject - 1] = Buffer.from(
      `<< /Length ${content.length} >>\nstream\n${content.toString()}\nendstream`
    );
    objects[pageObject - 1] = Buffer.from(
      `<< /Type /Page /Parent ${pagesObject} 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /XObject << /Im1 ${imageObject} 0 R >> >> /Contents ${contentObject} 0 R >>`
    );
  }

  objects[pagesObject - 1] = Buffer.from(
    `<< /Type /Pages /Kids [${pageRefs.map((ref) => `${ref} 0 R`).join(" ")}] /Count ${pageRefs.length} >>`
  );
  const catalogObject = pdfObject(objects, Buffer.from(`<< /Type /Catalog /Pages ${pagesObject} 0 R >>`));

  const chunks = [Buffer.from("%PDF-1.4\n%\xff\xff\xff\xff\n")];
  const offsets = [0];
  for (let index = 0; index < objects.length; index += 1) {
    offsets.push(Buffer.concat(chunks).length);
    chunks.push(Buffer.from(`${index + 1} 0 obj\n`), objects[index], Buffer.from("\nendobj\n"));
  }
  const xrefOffset = Buffer.concat(chunks).length;
  chunks.push(Buffer.from(`xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`));
  for (let index = 1; index < offsets.length; index += 1) {
    chunks.push(Buffer.from(`${String(offsets[index]).padStart(10, "0")} 00000 n \n`));
  }
  chunks.push(
    Buffer.from(
      `trailer\n<< /Size ${objects.length + 1} /Root ${catalogObject} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`
    )
  );
  return Buffer.concat(chunks);
}

function selectFrames(page, slug, includeNamesValue) {
  const candidates = page?.children
    ?.filter((node) => node.type === "FRAME" && node.id && node.absoluteBoundingBox) || [];
  const requestedNames = includeNamesValue
    ? includeNamesValue.split(",").map((name) => name.trim()).filter(Boolean)
    : WORK_FRAME_SELECTION[slug];

  if (!requestedNames) {
    return candidates.sort((a, b) =>
      a.absoluteBoundingBox.x - b.absoluteBoundingBox.x ||
      a.absoluteBoundingBox.y - b.absoluteBoundingBox.y
    );
  }

  const byName = new Map(candidates.map((frame) => [frame.name, frame]));
  const missingNames = requestedNames.filter((name) => !byName.has(name));
  if (missingNames.length > 0) {
    throw new Error(`Figma page is missing selected frame(s): ${missingNames.join(", ")}`);
  }
  return requestedNames.map((name) => byName.get(name));
}

async function main() {
  const token = process.env.FIGMA_ACCESS_TOKEN || process.env.FIGMA_TOKEN;
  const slug = readOption("slug");
  const file = readOption("file");
  const pageName = readOption("page");
  const includeNames = readOption("include-names");
  if (!token || !slug || !file || !pageName) {
    usage();
    process.exitCode = 2;
    return;
  }

  const document = await figmaJson(`/files/${encodeURIComponent(file)}`, token);
  const page = document.document?.children?.find((node) => node.name === pageName);
  const frames = selectFrames(page, slug, includeNames);
  if (!frames?.length) throw new Error(`No FRAME nodes found on Figma page ${pageName}`);

  const imageResponse = await figmaJson(
    `/images/${encodeURIComponent(file)}?ids=${frames.map((frame) => encodeURIComponent(frame.id)).join(",")}&format=jpg&scale=1`,
    token
  );
  const outputDirectory = join(root, "public/images/works", slug);
  await mkdir(outputDirectory, { recursive: true });
  const images = [];
  const embeds = [];
  for (let index = 0; index < frames.length; index += 1) {
    const frame = frames[index];
    const imageUrl = imageResponse.images?.[frame.id];
    if (!imageUrl) throw new Error(`Figma did not return an image for frame ${frame.id}`);
    const image = await download(imageUrl);
    const filename = `${String(index + 1).padStart(2, "0")}.jpg`;
    await writeFile(join(outputDirectory, filename), image);
    images.push(image);
    const dimensions = jpegSize(image);
    embeds.push({
      image: `/images/works/${slug}/${filename}`,
      name: frame.name,
      width: dimensions.width,
      height: dimensions.height,
      aspect: dimensions.width / dimensions.height,
    });
  }

  const pdfPath = join(root, "public/works", `${slug}.pdf`);
  await mkdir(dirname(pdfPath), { recursive: true });
  await writeFile(pdfPath, makePosterPdf(images));

  let manifest = {};
  try {
    manifest = parseManifest(await readFile(manifestPath, "utf8"));
  } catch {
    // The manifest is created on the first successful sync.
  }
  manifest[slug] = {
    cover: manifest[slug]?.cover || embeds[0].image,
    embeds,
    pdf: `/works/${slug}.pdf`,
    expectedPosters: embeds.length,
    source: { figmaFileId: file, figmaPageName: pageName },
  };
  await mkdir(dirname(manifestPath), { recursive: true });
  await writeFile(
    manifestPath,
    `const assetManifest = ${JSON.stringify(manifest, null, 2)};\n\nexport default assetManifest;\n`
  );

  console.log(`Synced ${embeds.length} posters for ${slug}`);
  console.log(`Assets: ${relative(root, outputDirectory)}`);
  console.log(`PDF: ${relative(root, pdfPath)}`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}

export { jpegSize, makePosterPdf, selectFrames };