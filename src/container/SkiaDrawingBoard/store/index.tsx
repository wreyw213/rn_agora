import { DrawingInfo, Paint, Path } from '@shopify/react-native-skia';
import { create } from 'zustand';
import utils from '../utils';

export type CurrentPath = {
  path: any;
  paint: any;
  color?: string;
  strokeWidth: number
};

interface DrawingStore {
  /**
   * Array of completed paths for redrawing
   */
  completedPaths: CurrentPath[];
  /**
   * A function to update completed paths
   */
  setCompletedPaths: (completedPaths: CurrentPath[]) => void;
  /**
   * Current stroke
   */
  stroke: typeof Paint;
  /**
   * Width of the stroke
   */
  strokeWidth: number;
  /**
   * Color of the stroke
   */
  color: string;
  setStrokeWidth: (strokeWidth: number) => void;
  setColor: (color: string) => void;
  setStroke: (stroke: typeof Paint) => void;
  canvasInfo: Partial<DrawingInfo> | null;
  setCanvasInfo: (canvasInfo: Partial<DrawingInfo>) => void;
}

const useDrawingStore = create<DrawingStore>((set, get) => ({
  completedPaths: [],
  setCompletedPaths: completedPaths => {
    console.log("completedPaths_________", completedPaths.length);

    set({ completedPaths });
  },
  strokeWidth: 2,
  color: 'black',
  stroke: utils.getPaint(2, 'black'),
  setStrokeWidth: strokeWidth => {
    set({ strokeWidth });
  },
  setColor: color => {
    set({ color });
  },
  setStroke: stroke => {
    set({ stroke });
  },
  canvasInfo: null,
  setCanvasInfo: canvasInfo => {
    set({ canvasInfo });
  },
}));

export default useDrawingStore;
