/**
 * 批量抓取江苏本科大学校徽图（Wikipedia REST API → 原始 SVG/PNG）
 * Usage: export https_proxy=http://127.0.0.1:7890 http_proxy=http://127.0.0.1:7890
 *        npx tsx scripts/fetch-university-logos.ts
 */

import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

interface University {
  id: string;
  name: string;
  enTitle: string;
  zhTitle: string;
}

const UNIVERSITIES: University[] = [
  { id: "nju", name: "南京大学", enTitle: "Nanjing_University", zhTitle: "南京大学" },
  { id: "seu", name: "东南大学", enTitle: "Southeast_University", zhTitle: "东南大学" },
  { id: "nuaa", name: "南京航空航天大学", enTitle: "Nanjing_University_of_Aeronautics_and_Astronautics", zhTitle: "南京航空航天大学" },
  { id: "njust", name: "南京理工大学", enTitle: "Nanjing_University_of_Science_and_Technology", zhTitle: "南京理工大学" },
  { id: "hhu", name: "河海大学", enTitle: "Hohai_University", zhTitle: "河海大学" },
  { id: "njau", name: "南京农业大学", enTitle: "Nanjing_Agricultural_University", zhTitle: "南京农业大学" },
  { id: "cpu", name: "中国药科大学", enTitle: "China_Pharmaceutical_University", zhTitle: "中国药科大学" },
  { id: "njnu", name: "南京师范大学", enTitle: "Nanjing_Normal_University", zhTitle: "南京师范大学" },
  { id: "suda", name: "苏州大学", enTitle: "Soochow_University_(Suzhou)", zhTitle: "苏州大学" },
  { id: "jiangnan", name: "江南大学", enTitle: "Jiangnan_University", zhTitle: "江南大学" },
  { id: "cumt", name: "中国矿业大学", enTitle: "China_University_of_Mining_and_Technology", zhTitle: "中国矿业大学" },
  { id: "nuist", name: "南京信息工程大学", enTitle: "Nanjing_University_of_Information_Science_and_Technology", zhTitle: "南京信息工程大学" },
  { id: "njupt", name: "南京邮电大学", enTitle: "Nanjing_University_of_Posts_and_Telecommunications", zhTitle: "南京邮电大学" },
  { id: "njfu", name: "南京林业大学", enTitle: "Nanjing_Forestry_University", zhTitle: "南京林业大学" },
  { id: "njmu", name: "南京医科大学", enTitle: "Nanjing_Medical_University", zhTitle: "南京医科大学" },
  { id: "njucm", name: "南京中医药大学", enTitle: "Nanjing_University_of_Chinese_Medicine", zhTitle: "南京中医药大学" },
  { id: "njtech2", name: "南京工业大学", enTitle: "Nanjing_Tech_University", zhTitle: "南京工业大学" },
  { id: "njue", name: "南京财经大学", enTitle: "Nanjing_University_of_Finance_and_Economics", zhTitle: "南京财经大学" },
  { id: "njaudit", name: "南京审计大学", enTitle: "Nanjing_Audit_University", zhTitle: "南京审计大学" },
  { id: "njit", name: "南京工程学院", enTitle: "Nanjing_Institute_of_Technology", zhTitle: "南京工程学院" },
  { id: "njxzc", name: "南京晓庄学院", enTitle: "Nanjing_Xiaozhuang_University", zhTitle: "南京晓庄学院" },
  { id: "njty", name: "南京体育学院", enTitle: "Nanjing_Sport_Institute", zhTitle: "南京体育学院" },
  { id: "nua", name: "南京艺术学院", enTitle: "Nanjing_University_of_the_Arts", zhTitle: "南京艺术学院" },
  { id: "njpu", name: "南京警察学院", enTitle: "Nanjing_Police_University", zhTitle: "南京警察学院" },
  { id: "jssnu", name: "江苏第二师范学院", enTitle: "Jiangsu_Second_Normal_University", zhTitle: "江苏第二师范学院" },
  { id: "njtech", name: "南京工业职业技术大学", enTitle: "Nanjing_Vocational_University_of_Industry_Technology", zhTitle: "南京工业职业技术大学" },
  { id: "usts", name: "苏州科技大学", enTitle: "Suzhou_University_of_Science_and_Technology", zhTitle: "苏州科技大学" },
  { id: "cit", name: "常熟理工学院", enTitle: "Changshu_Institute_of_Technology", zhTitle: "常熟理工学院" },
  { id: "sit", name: "苏州城市学院", enTitle: "Suzhou_City_University", zhTitle: "苏州城市学院" },
  { id: "wxit", name: "无锡学院", enTitle: "Wuxi_University", zhTitle: "无锡学院" },
  { id: "thnu", name: "太湖学院", enTitle: "Taihu_University", zhTitle: "无锡太湖学院" },
  { id: "jsnu", name: "江苏师范大学", enTitle: "Jiangsu_Normal_University", zhTitle: "江苏师范大学" },
  { id: "xzmc", name: "徐州医科大学", enTitle: "Xuzhou_Medical_University", zhTitle: "徐州医科大学" },
  { id: "xzit", name: "徐州工程学院", enTitle: "Xuzhou_University_of_Technology", zhTitle: "徐州工程学院" },
  { id: "cczu", name: "常州大学", enTitle: "Changzhou_University", zhTitle: "常州大学" },
  { id: "jsut", name: "江苏理工学院", enTitle: "Jiangsu_University_of_Technology", zhTitle: "江苏理工学院" },
  { id: "czu", name: "常州工学院", enTitle: "Changzhou_Institute_of_Technology", zhTitle: "常州工学院" },
  { id: "ntu", name: "南通大学", enTitle: "Nantong_University", zhTitle: "南通大学" },
  { id: "ntit", name: "南通理工学院", enTitle: "Nantong_Institute_of_Technology", zhTitle: "南通理工学院" },
  { id: "yzu", name: "扬州大学", enTitle: "Yangzhou_University", zhTitle: "扬州大学" },
  { id: "ujs", name: "江苏大学", enTitle: "Jiangsu_University", zhTitle: "江苏大学" },
  { id: "just", name: "江苏科技大学", enTitle: "Jiangsu_University_of_Science_and_Technology", zhTitle: "江苏科技大学" },
  { id: "ycit", name: "盐城工学院", enTitle: "Yancheng_Institute_of_Technology", zhTitle: "盐城工学院" },
  { id: "yctu", name: "盐城师范学院", enTitle: "Yancheng_Teachers_University", zhTitle: "盐城师范学院" },
  { id: "hyit", name: "淮阴工学院", enTitle: "Huaiyin_Institute_of_Technology", zhTitle: "淮阴工学院" },
  { id: "hytc", name: "淮阴师范学院", enTitle: "Huaiyin_Normal_University", zhTitle: "淮阴师范学院" },
  { id: "jou", name: "江苏海洋大学", enTitle: "Jiangsu_Ocean_University", zhTitle: "江苏海洋大学" },
  { id: "tzuh", name: "泰州学院", enTitle: "Taizhou_University_(Jiangsu)", zhTitle: "泰州学院" },
  { id: "sqc", name: "宿迁学院", enTitle: "Suqian_University", zhTitle: "宿迁学院" },
  { id: "kdsu", name: "昆山杜克大学", enTitle: "Duke_Kunshan_University", zhTitle: "昆山杜克大学" },
  { id: "xjtlu", name: "西交利物浦大学", enTitle: "Xi%27an_Jiaotong-Liverpool_University", zhTitle: "西交利物浦大学" },
];

const OUT_DIR = path.resolve("public/logos");

function curlGet(url: string): string | null {
  try {
    return execSync(`curl -sL --max-time 15 "${url}"`, {
      encoding: "utf-8",
      stdio: ["ignore", "pipe", "ignore"],
    });
  } catch {
    return null;
  }
}

/**
 * Convert any Wikimedia URL (thumbnail or direct) to the original file.
 * Thumbnail: .../wikipedia/en/thumb/a/bc/File.svg/330px-File.svg.png  → .../wikipedia/en/a/bc/File.svg
 * Direct:    .../wikipedia/en/a/bc/File.svg                            → unchanged
 * Commons:   .../wikipedia/commons/thumb/a/bc/File.svg/330px-File.svg.png
 */
function toOriginalUrl(url: string): string {
  // Already a direct file URL (no /thumb/)
  if (!url.includes("/thumb/")) return url;

  // Remove /thumb and the sized-file suffix
  // .../wikipedia/en/thumb/a/bc/File.svg/330px-File.svg.png
  // → .../wikipedia/en/a/bc/File.svg
  return url
    .replace("/thumb/", "/")
    .replace(/\/\d+px-[^/]+$/, "");
}

function fetchWikiThumbnail(title: string, lang: "en" | "zh"): string | null {
  const url = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
  const raw = curlGet(url);
  if (!raw) return null;
  try {
    const data = JSON.parse(raw);
    return data?.thumbnail?.source ?? data?.originalimage?.source ?? null;
  } catch {
    return null;
  }
}

function downloadFile(url: string, filepath: string): boolean {
  try {
    execSync(`curl -sL --max-time 20 -o "${filepath}" "${url}"`, { stdio: "ignore" });
    const stat = fs.statSync(filepath);
    if (stat.size < 1024) {
      fs.unlinkSync(filepath);
      return false;
    }
    // Reject HTML/error pages
    try {
      const head = fs.readFileSync(filepath, { encoding: "utf-8" }).substring(0, 100);
      if (head.includes("<!DOCTYPE") || head.includes("<html") || head.includes("File not found")) {
        fs.unlinkSync(filepath);
        return false;
      }
    } catch { /* binary - ok */ }
    return true;
  } catch {
    return false;
  }
}

function extFromUrl(url: string): string {
  // Get extension from filename before any query params
  const clean = url.replace(/\?.*$/, "");
  const m = clean.match(/\.(svg|png|jpg|jpeg|webp|gif)(\/|$)/i);
  return m ? m[1].toLowerCase() : "png";
}

function fileExists(base: string, id: string): string | null {
  for (const ext of ["svg", "png", "jpg", "jpeg", "webp", "gif"]) {
    const p = path.join(base, `${id}.${ext}`);
    if (fs.existsSync(p)) return p;
  }
  return null;
}

function sleepSync(ms: number) {
  const end = Date.now() + ms;
  while (Date.now() < end) { /* spin */ }
}

function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const results: { id: string; name: string; url: string | null; status: string }[] = [];

  for (const uni of UNIVERSITIES) {
    if (fileExists(OUT_DIR, uni.id)) {
      console.log(`[skip] ${uni.name}`);
      results.push({ id: uni.id, name: uni.name, url: null, status: "exists" });
      continue;
    }

    console.log(`[fetch] ${uni.name}...`);

    // Try English first, then Chinese
    let thumbUrl = fetchWikiThumbnail(uni.enTitle, "en");
    if (!thumbUrl) {
      thumbUrl = fetchWikiThumbnail(uni.zhTitle, "zh");
    }

    if (!thumbUrl) {
      console.log(`  ✗ 无 Wikipedia 页面`);
      results.push({ id: uni.id, name: uni.name, url: null, status: "not_found" });
      sleepSync(300);
      continue;
    }

    const originalUrl = toOriginalUrl(thumbUrl);
    const ext = extFromUrl(originalUrl);
    const outPath = path.join(OUT_DIR, `${uni.id}.${ext}`);

    const short = originalUrl.length > 75 ? originalUrl.substring(0, 75) + "..." : originalUrl;
    console.log(`  → ${ext.toUpperCase()} ${short}`);

    if (downloadFile(originalUrl, outPath)) {
      results.push({ id: uni.id, name: uni.name, url: originalUrl, status: "ok" });
    } else {
      // Fallback: try the thumbnail itself
      const thumbExt = extFromUrl(thumbUrl);
      const thumbPath = path.join(OUT_DIR, `${uni.id}.${thumbExt}`);
      console.log(`  → fallback thumbnail...`);
      if (downloadFile(thumbUrl, thumbPath)) {
        results.push({ id: uni.id, name: uni.name, url: thumbUrl, status: "ok" });
      } else {
        console.log(`  ✗ 下载失败`);
        results.push({ id: uni.id, name: uni.name, url: originalUrl, status: "download_failed" });
      }
    }

    sleepSync(400);
  }

  const okIds = new Set(results.filter((r) => r.status === "ok" || r.status === "exists").map((r) => r.id));
  const missing = results.filter((r) => r.status !== "ok" && r.status !== "exists");

  console.log(`\n===== ${okIds.size}/${UNIVERSITIES.length} =====`);

  if (missing.length > 0) {
    console.log("\n未获取：");
    missing.forEach((m) => console.log(`  - ${m.name} (${m.id}) [${m.status}]`));
  }

  // Build index
  const logoMap: Record<string, string> = {};
  for (const f of fs.readdirSync(OUT_DIR)) {
    if (f === "index.json") continue;
    const id = f.replace(/\.[^.]+$/, "");
    logoMap[id] = `/logos/${f}`;
  }
  fs.writeFileSync(path.join(OUT_DIR, "index.json"), JSON.stringify(logoMap, null, 2));
  console.log(`\n${Object.keys(logoMap).length} logos saved → ${OUT_DIR}/`);
}

main();
