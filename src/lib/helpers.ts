import { jsPDF } from 'jspdf';
import { toast } from "react-hot-toast";

const downloadFile = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

enum FileType {
  svg = 'svg',
  png = 'png',
  jpg = 'jpg',
  pdf = 'pdf'
}

const downloadImage = async (svgOutput: string, type: FileType) => {
  if (!svgOutput) {
    toast.error("Generate an SVG first!");
    return;
  }

  try {
    if (type === FileType.svg) {
      const blob = new Blob([svgOutput], { type: "image/svg+xml" });
      downloadFile(blob, `moss-pole-guide.${type}`);
      toast.success("SVG downloaded!");
      return;
    }

    // Get SVG dimensions from the viewBox
    const viewBox = svgOutput.match(/viewBox="([^"]*)"/)![1].split(' ');
    const width = parseFloat(viewBox[2]);
    const height = parseFloat(viewBox[3]);

    const blob = new Blob([svgOutput], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    // Set canvas to SVG dimensions
    canvas.width = width;
    canvas.height = height;

    await new Promise((resolve, reject) => {
      img.onload = () => {
        // Add white background for jpg and pdf
        if ((type === FileType.jpg || type === FileType.pdf) && ctx) {
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, width, height);
        }

        ctx?.drawImage(img, 0, 0, width, height);

        if (type === FileType.pdf) {
          const imgData = canvas.toDataURL('image/jpeg', 1.0);
          const pdf = new jsPDF({
            orientation: width > height ? 'l' : 'p',
            unit: 'px',
            format: [width, height]
          });
          pdf.addImage(imgData, 'JPEG', 0, 0, width, height);
          pdf.save('moss-pole-guide.pdf');
          toast.success('PDF downloaded!');
          resolve(null);
          return;
        }

        canvas.toBlob(
          (blob) => {
            if (blob) {
              downloadFile(blob, `moss-pole-guide.${type}`);
              toast.success(`${type.toUpperCase()} downloaded!`);
            }
            resolve(null);
          },
          `image/${type}`,
          1.0  // Maximum quality
        );
      };
      img.onerror = reject;
      img.src = url;
    });

    URL.revokeObjectURL(url);
  } catch (error) {
    toast.error(`Error downloading ${type.toUpperCase()}!`);
    console.error(error);
  }
};

export const downloadPDF = (svgOutput: string) => downloadImage(svgOutput, FileType.pdf);
export const downloadSVG = (svgOutput: string) => downloadImage(svgOutput, FileType.svg);
export const downloadPNG = (svgOutput: string) => downloadImage(svgOutput, FileType.png);
export const downloadJPG = (svgOutput: string) => downloadImage(svgOutput, FileType.jpg);

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