import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calculateAverage(data: Record<string, number>): number {
  const values = Object.values(data);
  if (values.length === 0) return 0;
  const sum = values.reduce((acc, val) => acc + val, 0);
  return Number((sum / values.length).toFixed(2));
}

export function determineStatus(average: number, thresholds: { excellent: number; inProcess: number }): 'Excelente' | 'En Proceso' | 'Necesita Refuerzo' {
  if (average >= thresholds.excellent) return 'Excelente';
  if (average >= thresholds.inProcess) return 'En Proceso';
  return 'Necesita Refuerzo';
}

export function getStatusCode(status: 'Excelente' | 'En Proceso' | 'Necesita Refuerzo'): 'AZ' | 'MW' | 'LOW' {
  switch (status) {
    case 'Excelente': return 'AZ';
    case 'En Proceso': return 'MW';
    case 'Necesita Refuerzo': return 'LOW';
  }
}
