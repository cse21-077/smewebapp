// For ml-regression
declare module 'ml-regression' {
  export class SimpleLinearRegression {
    constructor(x: number[], y: number[]);
    predict(x: number): number;
  }
  
  export class PolynomialRegression {
    constructor(x: number[], y: number[], degree: number);
    predict(x: number): number;
  }
}

// For TensorFlow.js if not properly typed
declare namespace tf {
  export interface Tensor {
    dataSync(): number[];
    arraySync(): number[][];
    shape: number[];
  }

  export interface Sequential {
    evaluate(x: Tensor, y: Tensor): Tensor;
  }

  export function tensor2d(data: number[][], shape?: [number, number]): Tensor;
  export function tensor1d(data: number[], dtype?: string): Tensor;
  export function concat(tensors: Tensor[]): Tensor;
  export function mean(x: Tensor, axis?: number): Tensor;
  export function moments(x: Tensor, axis?: number): { mean: Tensor; variance: Tensor };
}