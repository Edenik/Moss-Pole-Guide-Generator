import { MossPolesData } from "./types";
import { getRandomColor } from "./utils";

function wrapText(text: string, maxWidth: number): string[] {
  const words: string[] = text.split(' ');
  const lines: string[] = [];
  let currentLine = words[0];

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const testLine = `${currentLine} ${word}`;
    if (testLine.length * 6 < maxWidth) {
      currentLine = testLine;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  lines.push(currentLine);
  return lines;
}

function adjustColor(color: string, amount: number): string {
  const hex: string = color.replace('#', '');
  const r: number = Math.max(Math.min(parseInt(hex.substring(0, 2), 16) + amount, 255), 0);
  const g: number = Math.max(Math.min(parseInt(hex.substring(2, 4), 16) + amount, 255), 0);
  const b: number = Math.max(Math.min(parseInt(hex.substring(4, 6), 16) + amount, 255), 0);

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

export function generateMossPole(data: MossPolesData): string {
  const { config, poles } = data;
  const polesPerRow = config.visual.polesPerRow || 4;
  const poleSpacing = 300;
  const rowSpacing = 600; // Space between rows
  const instructionsWidth = 180;
  const topPadding: number = config.title.enabled ? 40 : 10;
  const sidePadding: number = config.careTips.enabled ? 150 : 50;
  const bottomPadding: number = 40;

  // Calculate number of rows and row dimensions
  const numRows = Math.ceil(poles.length / polesPerRow);

  // Calculate base width based on maximum poles in any row
  const baseWidth: number = Math.min(polesPerRow, poles.length) * poleSpacing +
    (config.careTips.enabled ? sidePadding + instructionsWidth : sidePadding);

  // Calculate total height including all rows
  const totalHeight: number = (numRows * rowSpacing) + topPadding + bottomPadding;

  const instructionsX: number = sidePadding + (Math.min(polesPerRow, poles.length) * poleSpacing) - 20;

  const backgroundColor = config.visual.backgroundColor || "#FFFFFF";
  const textColor = config.visual.textColor || "#333333";

  function getPositionForPole(index: number): { x: number; y: number } {
    const row = Math.floor(index / polesPerRow);
    const col = index % polesPerRow;
    return {
      x: sidePadding + (col * poleSpacing),
      y: (config.title.enabled ? 80 : 20) + (row * rowSpacing)
    };
  }

  const tips = config.careTips.tips || [
    "Mist 1-2× daily",
    "Check moisture",
    "Higher humidity in growing season",
    "Monitor moss moisture level"
  ];

  const wrappedTips: string[][] = tips.map(tip =>
    wrapText(tip, instructionsWidth - 40)
  );

  const titleHeight = 40;
  const tipsHeight = wrappedTips.reduce((acc, tip) =>
    acc + (tip.length * 20) + 10,
    0
  );
  const boxHeight = titleHeight + tipsHeight;
  const algaePercentage: number = config.visual.algaePercentage || 50;
  const shouldShowGreenSpot = () => Math.random() * 100 < algaePercentage;

  // Your existing pattern generation functions remain the same
  function generateRandomSquares(y: number): string {
    return `
    <rect width="75" height="15" fill="#f5f5f5" y="${y}"/>
    <rect x="0" y="${y}" width="10" height="10" fill="${getRandomColor(shouldShowGreenSpot())}" stroke="black" stroke-width="1"/>
    <rect x="15" y="${y}" width="10" height="10" fill="${getRandomColor(shouldShowGreenSpot())}" stroke="black" stroke-width="1"/>
    <rect x="30" y="${y}" width="10" height="10" fill="${getRandomColor(shouldShowGreenSpot())}" stroke="black" stroke-width="1"/>
    <rect x="45" y="${y}" width="10" height="10" fill="${getRandomColor(shouldShowGreenSpot())}" stroke="black" stroke-width="1"/>
    <rect x="60" y="${y}" width="10" height="10" fill="${getRandomColor(shouldShowGreenSpot())}" stroke="black" stroke-width="1"/>
  `;
  }

  function generatePolePattern(index: number): string {
    let rows = '';
    for (let y = 0; y < 420; y += 15) {
      rows += generateRandomSquares(y);
    }
    return `
    <pattern id="polePattern${index}" x="5" y="5" width="75" height="420" patternUnits="userSpaceOnUse">
      ${rows}
    </pattern>
  `;
  }

  function generateCareTips(): string {
    if (!config.careTips.enabled) return '';

    let tipsSvg = '';
    let currentY = 130;

    wrappedTips.forEach((tip) => {
      tip.forEach((line, lineIndex) => {
        const bulletPoint = lineIndex === 0 ? '•' : ' ';
        const xOffset = lineIndex === 0 ? 10 : 20;
        tipsSvg += `
        <text x="${instructionsX + xOffset}" y="${currentY}" font-size="14" fill="${textColor}">
          ${bulletPoint} ${line}
        </text>
      `;
        currentY += 20;
      });
      currentY += 10;
    });

    return `
    <rect x="${instructionsX}" y="80" width="${instructionsWidth}" height="${boxHeight}" fill="${backgroundColor}" rx="5" stroke="${textColor}" stroke-width="1"/>
    <text x="${instructionsX + 10}" y="100" font-size="16" font-weight="bold" fill="${textColor}">General Care Tips:</text>
    ${tipsSvg}
  `;
  }

  return `
  <svg viewBox="0 0 ${baseWidth} ${totalHeight}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${baseWidth}" height="${totalHeight}" fill="${backgroundColor}"/>
  
  <defs>
    ${poles.map((_, index) => generatePolePattern(index)).join('')}
    <symbol id="droplet" viewBox="0 0 30 30">
      <path d="M15,3 L21,12 A6,6 0 1,1 9,12 L15,3Z" fill="#4299e1"/>
    </symbol>
  </defs>
  
  ${config.title.enabled ? `
    <text x="${baseWidth / 2}" y="${topPadding}" text-anchor="middle" font-size="24" fill="${textColor}">
      ${config.title.text || "Moss Pole Care Guide"}
    </text>
  ` : ''}
  
  ${generateCareTips()}

  ${poles.map((pole, index) => {
    const position = getPositionForPole(index);
    return `
    <g transform="translate(${position.x},${position.y})">
      <path d="M20 420 L120 420 L110 480 L30 480 Z" fill="${pole.potColor || '#cc7f63'}"/>
      <ellipse cx="70" cy="420" rx="50" ry="10" fill="${pole.potColor ? adjustColor(pole.potColor, -20) : '#b26b52'}"/>
      <path d="M30 425 L110 425 L108 435 L32 435 Z" fill="#3a2410"/>
      <rect x="40" y="20" width="60" height="400" fill="#8B7355" rx="5"/>
      <rect x="40" y="20" width="60" height="400" fill="url(#polePattern${index})" rx="5"/>
      <rect x="40" y="20" width="60" height="400" fill="none" stroke="black" stroke-width="2" rx="5"/>
      
      <g transform="translate(95,45)">
        <use x="10" href="#droplet" width="30" height="30"/>
        <text x="35" y="16" font-size="16" fill="${textColor}">${pole.humidityTop}%</text>
      </g>
      <g transform="translate(95,215)">
        <use x="10" href="#droplet" width="30" height="30"/>
        <text x="35" y="16" font-size="16" fill="${textColor}">${pole.humidityMiddle}%</text>
      </g>
      <g transform="translate(95,385)">
        <use x="10" href="#droplet" width="30" height="30"/>
        <text x="35" y="16" font-size="16" fill="${textColor}">${pole.humidityBottom}%</text>
      </g>
      
      ${pole.displaySensorPlace ? `          
      <line x1="110" y1="240" x2="150" y2="240" stroke="${textColor}" stroke-width="2" stroke-dasharray="5,5"/>
      <circle cx="160" cy="240" r="5" fill="${textColor}"/>
      <text x="170" y="245" font-size="12" fill="${textColor}">Place</text>
      <text x="170" y="260" font-size="12" fill="${textColor}">sensor</text>
      <text x="170" y="275" font-size="12" fill="${textColor}">here</text>
      ` : ``}

      <text x="70" y="520" text-anchor="middle" font-size="16" font-weight="bold" fill="${textColor}">${pole.name}</text>
    </g>
  `}).join('')}
</svg>
`;
}