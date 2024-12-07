import { toast } from "react-hot-toast";

export const downloadSVG = (svgOutput: string) => {
  if (!svgOutput) {
    toast.error("Generate an SVG first!");
    return;
  }

  const blob = new Blob([svgOutput], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "moss-pole-guide.svg";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  toast.success("SVG downloaded!");
};

export const printSVG = (svgOutput: string) => {
  if (!svgOutput) {
    toast.error("Generate an SVG first!");
    return;
  }

  const printWindow = window.open("", "", "width=800,height=600");
  if (printWindow) {
    printWindow.document.write(`
      <html>
        <head>
          <title>Moss Pole Guide</title>
        </head>
        <body>
          ${svgOutput}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
    printWindow.close();
    toast.success("SVG printed successfully!");
  } else {
    toast.error("Failed to open print window.");
  }
};