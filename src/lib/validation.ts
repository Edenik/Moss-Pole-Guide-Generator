import { z } from 'zod';

// Define color schema with regex for hex colors
const ColorSchema = z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Color must be a valid hex code (e.g., #FF0000)").optional();

// Schema for care tips
const CareTipsSchema = z.object({
  enabled: z.boolean().default(true),
  tips: z.array(z.string()).min(1, "At least one care tip is required").optional(),
});

// Schema for title configuration
const TitleConfigSchema = z.object({
  enabled: z.boolean().default(true),
  text: z.string().min(1, "Title text is required when enabled").optional(),
});

// Schema for visual customization
const VisualConfigSchema = z.object({
  backgroundColor: ColorSchema.default("#FFFFFF"),
  textColor: ColorSchema.default("#333333"),
  algaePercentage: z.number().int().min(0).max(100).default(10),
  polesPerRow: z.number().int().min(1).max(4).default(4),
});

// Schema for a single moss pole
const MossPoleSchema = z.object({
  // Plant information
  name: z.string().min(1, "Name is required"),

  // Humidity levels
  humidityTop: z.string().regex(/^\d{2}-\d{2}$/, "Format should be XX-XX"),
  humidityMiddle: z.string().regex(/^\d{2}-\d{2}$/, "Format should be XX-XX"),
  humidityBottom: z.string().regex(/^\d{2}-\d{2}$/, "Format should be XX-XX"),
  displaySensorPlace: z.boolean().optional(),
  // Optional custom pot color for this specific plant
  potColor: ColorSchema,
});

// Main configuration schema
const ConfigSchema = z.object({
  // Visual customization
  visual: VisualConfigSchema.default({
    backgroundColor: "#FFFFFF",
    textColor: "#333333"
  }),

  // Title configuration
  title: TitleConfigSchema.default({
    enabled: true,
    text: "Moss Pole Care Guide"
  }),

  // Care tips configuration
  careTips: CareTipsSchema.default({
    enabled: true,
    tips: [
      "Mist 1-2× daily",
      "Check moisture",
      "Higher humidity in growing season",
      "Monitor moss moisture level"
    ]
  }),
});

// Complete schema combining poles and configuration
export const MossPolesSchema = z.object({
  config: ConfigSchema,
  poles: z.array(MossPoleSchema).min(1, "At least one moss pole is required"),
});

// Export individual schemas for reuse
export {
  CareTipsSchema, ColorSchema, ConfigSchema, MossPoleSchema, TitleConfigSchema,
  VisualConfigSchema
};
