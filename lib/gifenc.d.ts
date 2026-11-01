declare module "gifenc" {
  export interface GifEncoderInstance {
    writeFrame: (
      index: Uint8Array,
      width: number,
      height: number,
      opts?: {
        palette?: number[][];
        first?: boolean;
        repeat?: number;
        delay?: number;
        transparent?: boolean;
        transparentIndex?: number;
      }
    ) => void;
    finish: () => void;
    bytes: () => Uint8Array;
    reset: () => void;
  }
  export function GIFEncoder(opts?: { auto?: boolean }): GifEncoderInstance;
  export function quantize(
    data: Uint8Array | Uint8ClampedArray,
    maxColors: number,
    opts?: { format?: string }
  ): number[][];
  export function applyPalette(
    data: Uint8Array | Uint8ClampedArray,
    palette: number[][],
    format?: string
  ): Uint8Array;
}
