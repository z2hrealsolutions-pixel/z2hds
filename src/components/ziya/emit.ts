// Tell Ziya something happened on the page (he reacts; nothing breaks if he is hidden or not loaded).
export function ziyaEmit(name: "form-sent" | "file-dropped" | "estimate-ready" | "upload-error" | "file-invalid") {
  try { window.dispatchEvent(new CustomEvent("ziya:event", { detail: name })); } catch { /* ignore */ }
}
