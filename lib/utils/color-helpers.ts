// Color palettes for tag generation
const tagColorPalettes = {
  vibrant: [
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#96CEB4",
    "#FFEAA7",
    "#DDA0DD",
    "#98D8C8",
    "#F7DC6F",
    "#BB8FCE",
    "#F8C471",
    "#82E0AA",
    "#F1948A",
    "#85C1E9",
    "#D2B4DE",
  ],
  pastel: [
    "#FFB3BA",
    "#BAFFC9",
    "#BAE1FF",
    "#FFFFBA",
    "#FFD3E0",
    "#E0BBE4",
    "#C5E3F6",
    "#FFDFBA",
    "#B3E5D1",
    "#FFCCCB",
    "#D1C4E9",
    "#C8E6C9",
    "#FFCDD2",
    "#E1F5FE",
    "#F3E5F5",
  ],
  professional: [
    "#3498DB",
    "#2ECC71",
    "#E74C3C",
    "#F39C12",
    "#9B59B6",
    "#1ABC9C",
    "#34495E",
    "#E67E22",
    "#8E44AD",
    "#27AE60",
    "#2980B9",
    "#C0392B",
    "#D35400",
    "#7F8C8D",
    "#16A085",
  ],
  earthy: [
    "#8B4513",
    "#228B22",
    "#4682B4",
    "#CD853F",
    "#9ACD32",
    "#20B2AA",
    "#808080",
    "#B22222",
    "#32CD32",
    "#4169E1",
    "#FF8C00",
    "#8FBC8F",
    "#DC143C",
    "#00CED1",
    "#9932CC",
  ],
}

export type ColorPalette = keyof typeof tagColorPalettes

/**
 * Generate a consistent color for a tag based on its name
 * @param tagName - The name of the tag
 * @param palette - The color palette to use ('vibrant', 'pastel', 'professional', 'earthy')
 * @returns A hex color string
 */
export function generateTagColor(
  tagName: string,
  palette: ColorPalette = "pastel"
): string {
  // Create a simple hash from the tag name for consistency
  let hash = 0
  for (let i = 0; i < tagName.length; i++) {
    const char = tagName.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash >>> 0 // Convert to 32-bit unsigned integer
  }

  // Get the color palette
  const colors = tagColorPalettes[palette]

  // Use the hash to select a color (ensure positive index)
  const index = Math.abs(hash) % colors.length
  return colors[index]
}

/**
 * Generate multiple colors for a set of tag names, ensuring no duplicates
 * @param tagNames - Array of tag names
 * @param palette - The color palette to use
 * @returns Object mapping tag names to colors
 */
export function generateTagColors(
  tagNames: string[],
  palette: ColorPalette = "pastel"
): Record<string, string> {
  const colors = tagColorPalettes[palette]
  const usedColors = new Set<string>()
  const tagColorMap: Record<string, string> = {}

  // First pass: try to get unique colors using the hash method
  tagNames.forEach((tagName) => {
    const color = generateTagColor(tagName, palette)
    if (!usedColors.has(color)) {
      tagColorMap[tagName] = color
      usedColors.add(color)
    }
  })

  // Second pass: assign remaining colors to tags that got duplicates
  const remainingColors = colors.filter((color) => !usedColors.has(color))
  let colorIndex = 0

  tagNames.forEach((tagName) => {
    if (!tagColorMap[tagName]) {
      // If we've used all colors, start over
      if (colorIndex >= remainingColors.length) {
        colorIndex = 0
      }
      tagColorMap[tagName] =
        remainingColors[colorIndex] || colors[colorIndex % colors.length]
      colorIndex++
    }
  })

  return tagColorMap
}

/**
 * Get a random color from a specific palette
 * @param palette - The color palette to use
 * @returns A hex color string
 */
export function getRandomTagColor(palette: ColorPalette = "pastel"): string {
  const colors = tagColorPalettes[palette]
  return colors[Math.floor(Math.random() * colors.length)]
}

/**
 * Calculate accurate WCAG luminance for a color
 * @param r - Red value (0-255)
 * @param g - Green value (0-255)
 * @param b - Blue value (0-255)
 * @returns Luminance value (0-1)
 */
export function getLuminance(r: number, g: number, b: number): number {
  const rs = r / 255
  const gs = g / 255
  const bs = b / 255

  const rLin = rs <= 0.03928 ? rs / 12.92 : Math.pow((rs + 0.055) / 1.055, 2.4)
  const gLin = gs <= 0.03928 ? gs / 12.92 : Math.pow((gs + 0.055) / 1.055, 2.4)
  const bLin = bs <= 0.03928 ? bs / 12.92 : Math.pow((bs + 0.055) / 1.055, 2.4)

  return 0.2126 * rLin + 0.7152 * gLin + 0.0722 * bLin
}

/**
 * Check if a color is light or dark (for text contrast)
 * @param color - Hex color string
 * @returns boolean - true if light, false if dark
 */
export function isLightColor(color: string): boolean {
  const rgb = hexToRgb(color)
  if (!rgb) return false

  const luminance = getLuminance(rgb.r, rgb.g, rgb.b)
  return luminance > 0.5
}

/**
 * Convert hex color to RGB values
 * @param hex - Hex color string (with or without #)
 * @returns RGB object or null if invalid
 */
export function hexToRgb(
  hex: string
): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null
}

/**
 * Convert RGB values to hex color
 * @param r - Red value (0-255)
 * @param g - Green value (0-255)
 * @param b - Blue value (0-255)
 * @returns Hex color string
 */
export function rgbToHex(r: number, g: number, b: number): string {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
}

/**
 * Get all available color palettes
 * @returns Array of palette names
 */
export function getAvailablePalettes(): ColorPalette[] {
  return Object.keys(tagColorPalettes) as ColorPalette[]
}

/**
 * Get all colors from a specific palette
 * @param palette - The palette to get colors from
 * @returns Array of hex color strings
 */
export function getPaletteColors(palette: ColorPalette): string[] {
  return [...tagColorPalettes[palette]]
}
