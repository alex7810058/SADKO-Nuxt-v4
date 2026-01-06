import { protocol as l, app as s, BrowserWindow as f } from "electron";
import { readFileSync as c } from "fs";
import { join as p } from "path";
const u = process.env.NODE_ENV === "development" || !!process.env.VITE_DEV_SERVER_URL;
l.registerSchemesAsPrivileged([
  {
    scheme: "app",
    privileges: {
      standard: !0,
      secure: !0,
      supportFetchAPI: !0,
      corsEnabled: !0,
      bypassCSP: !0
    }
  }
]);
function h() {
  const t = new f({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: !1,
      contextIsolation: !0,
      webSecurity: !1
    }
  });
  u && process.env.VITE_DEV_SERVER_URL ? (t.loadURL(process.env.VITE_DEV_SERVER_URL), t.webContents.openDevTools()) : t.loadURL("app://./");
}
function m() {
  l.handle("app", (t) => {
    let e = new URL(t.url).pathname;
    console.log("Request:", t.url), e.startsWith("/") && (e = e.substring(1)), (!e || e === "") && (e = "index.html");
    const r = p(process.resourcesPath, "app.asar", e);
    console.log("Looking for file:", r);
    try {
      const a = c(r), o = e.split(".").pop()?.toLowerCase() || "", i = {
        html: "text/html; charset=utf-8",
        js: "application/javascript; charset=utf-8",
        css: "text/css; charset=utf-8",
        json: "application/json; charset=utf-8",
        png: "image/png",
        jpg: "image/jpeg",
        jpeg: "image/jpeg",
        gif: "image/gif",
        svg: "image/svg+xml",
        ico: "image/x-icon",
        woff: "font/woff",
        woff2: "font/woff2",
        ttf: "font/ttf"
      }[o] || "application/octet-stream";
      return console.log(`✓ Serving: ${e} as ${i}`), new Response(a, {
        status: 200,
        headers: {
          "Content-Type": i,
          "Cache-Control": o === "html" ? "no-cache" : "public, max-age=31536000"
        }
      });
    } catch {
      console.error("File not found, falling back to index.html");
      const o = p(process.resourcesPath, "app.asar", "index.html");
      try {
        const n = c(o);
        return new Response(n, {
          status: 200,
          headers: { "Content-Type": "text/html; charset=utf-8" }
        });
      } catch {
        return new Response("Not Found", {
          status: 404,
          headers: { "Content-Type": "text/plain" }
        });
      }
    }
  });
}
s.whenReady().then(() => {
  m(), h();
});
s.on("window-all-closed", () => {
  process.platform !== "darwin" && s.quit();
});
s.on("activate", () => {
  f.getAllWindows().length === 0 && h();
});
