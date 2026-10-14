/**
 * Script kiểm tra độ tương phản màu theo tiêu chuẩn WCAG 2.1 AA
 * Chữ thường: tối thiểu 4.5:1
 * Chữ lớn (>=18pt hoặc >=14pt đậm) & UI Components/Icons: tối thiểu 3.0:1
 */

function parseHex(hex) {
  hex = hex.replace("#", "").trim();
  if (hex.length === 3) {
    hex = hex.split("").map(c => c + c).join("");
  }
  const num = parseInt(hex, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  };
}

function getLuminance({ r, g, b }) {
  const [R, G, B] = [r, g, b].map(v => {
    v /= 255;
    return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

function getContrast(hex1, hex2) {
  const L1 = getLuminance(parseHex(hex1));
  const L2 = getLuminance(parseHex(hex2));
  const lighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);
  return (lighter + 0.05) / (darker + 0.05);
}

const colorPairs = [
  { name: "Active tab label & icon trên nền trắng", fg: "#0A67D1", bg: "#FFFFFF", target: 4.5, type: "Text & Component" },
  { name: "Inactive tab label & icon trên nền trắng (v2: #5E7285)", fg: "#5E7285", bg: "#FFFFFF", target: 4.5, type: "Text & Component" },
  { name: "Primary button text (trắng trên xanh #0A67D1)", fg: "#FFFFFF", bg: "#0A67D1", target: 4.5, type: "Text (Bold 15px)" },
  { name: "Brand Dark headings (#123B63 trên nền trắng)", fg: "#123B63", bg: "#FFFFFF", target: 4.5, type: "Headings" },
  { name: "Body text 900 (#162535 trên nền trắng)", fg: "#162535", bg: "#FFFFFF", target: 4.5, type: "Normal text" },
  { name: "Body text 900 (#162535 trên nền app #F6F9FC)", fg: "#162535", bg: "#F6F9FC", target: 4.5, type: "Normal text" },
  { name: "Body text 700 (#3C5268 trên nền trắng)", fg: "#3C5268", bg: "#FFFFFF", target: 4.5, type: "Normal text" },
  { name: "Body text 700 (#3C5268 trên nền app #F6F9FC)", fg: "#3C5268", bg: "#F6F9FC", target: 4.5, type: "Normal text" },
  { name: "Secondary button text (#0A67D1 trên nền xanh nhạt #E7F2FC)", fg: "#0A67D1", bg: "#E7F2FC", target: 4.5, type: "Text (Bold 15px)" },
  { name: "Success tag text (#16734B trên nền xanh lá #E4F5EC)", fg: "#16734B", bg: "#E4F5EC", target: 4.5, type: "Normal text" },
  { name: "Warning tag text (#8A5F00 trên nền vàng #FFF4D6)", fg: "#8A5F00", bg: "#FFF4D6", target: 4.5, type: "Normal text" },
  { name: "Danger button text (trắng trên nền đỏ #B42318)", fg: "#FFFFFF", bg: "#B42318", target: 4.5, type: "Bold text" },
  { name: "Danger tag text (#B42318 trên nền đỏ nhạt #FDE9E7)", fg: "#B42318", bg: "#FDE9E7", target: 4.5, type: "Normal text" },
  { name: "Info tag text (#245A93 trên nền xanh nhạt #E7F2FC)", fg: "#245A93", bg: "#E7F2FC", target: 4.5, type: "Normal text" }
];

console.log("=== BÁO CÁO KIỂM TRA ĐỘ TƯƠNG PHẢN MÀU (WCAG 2.1 AA) ===\n");
let allPass = true;

colorPairs.forEach(p => {
  const ratio = getContrast(p.fg, p.bg);
  const pass = ratio >= p.target;
  if (!pass) allPass = false;
  console.log(`${pass ? "PASS" : "FAIL"} | Ratio: ${ratio.toFixed(2)}:1 (Mục tiêu >= ${p.target}:1) | ${p.name}`);
});

console.log("\n========================================================");
if (allPass) {
  console.log("KẾT LUẬN: TẤT CẢ CÁC CẶP MÀU THỰC TẾ ĐẠT TIÊU CHUẨN WCAG 2.1 AA!");
} else {
  console.log("CẢNH BÁO: CÓ CẶP MÀU CHƯA ĐẠT!");
  process.exitCode = 1;
}
