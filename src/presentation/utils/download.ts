export function downloadFile(options: { filename: string; buffer: string }): void {
    const { filename, buffer } = options;
    const blob = new Blob([buffer], { type: "application/octet-stream" });
    const element = document.querySelector<HTMLAnchorElement>("#download") || document.createElement("a");
    element.id = "download-file";
    element.href = window.URL.createObjectURL(blob);
    element.setAttribute("download", filename);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
}
