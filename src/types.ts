export type PerformanceStatus = 'Excelente' | 'En Proceso' | 'Necesita Refuerzo';
export type PerformanceCode = 'AZ' | 'MW' | 'LOW';
export type Gender = 'M' | 'F';

export interface PerformanceData {
  carreras: number;
  tuneles: number;
  salto: number;
  joquey: number;
  lanzamiento: number;
}

export interface Student {
  id: string;
  name: string;
  gender: Gender;
  performance: PerformanceData;
  average: number;
  status: PerformanceStatus;
  code: PerformanceCode;
}

export interface AppConfig {
  district: string;
  school: string;
  cycle: string;
  adminName: string;
  thresholds: {
    excellent: number;
    inProcess: number;
  };
}

export interface MetricSummary {
  generalAverage: number;
  percentExcellent: number;
  needsReinforcement: number;
  maleAverage: number;
  femaleAverage: number;
}
