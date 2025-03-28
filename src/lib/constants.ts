/**
 * Constantes utilizadas em toda a aplicação
 */

// Mapeamento de meses abreviados para nomes completos
export const MESES_NOME: Record<string, string> = {
  JAN: 'Janeiro',
  FEV: 'Fevereiro',
  MAR: 'Março',
  ABR: 'Abril',
  MAI: 'Maio',
  JUN: 'Junho',
  JUL: 'Julho',
  AGO: 'Agosto',
  SET: 'Setembro',
  OUT: 'Outubro',
  NOV: 'Novembro',
  DEZ: 'Dezembro',
}

// Mapeamento de meses abreviados para números
export const MESES_NUMERO: Record<string, string> = {
  JAN: '01',
  FEV: '02',
  MAR: '03',
  ABR: '04',
  MAI: '05',
  JUN: '06',
  JUL: '07',
  AGO: '08',
  SET: '09',
  OUT: '10',
  NOV: '11',
  DEZ: '12',
}

// Mapeamento de números para meses
export const NUMERO_MESES: Record<string, string> = {
  '01': 'Janeiro',
  '02': 'Fevereiro',
  '03': 'Março',
  '04': 'Abril',
  '05': 'Maio',
  '06': 'Junho',
  '07': 'Julho',
  '08': 'Agosto',
  '09': 'Setembro',
  '10': 'Outubro',
  '11': 'Novembro',
  '12': 'Dezembro',
}

// Ordem dos meses para ordenação
export const MESES_ORDEM = [
  'JAN',
  'FEV',
  'MAR',
  'ABR',
  'MAI',
  'JUN',
  'JUL',
  'AGO',
  'SET',
  'OUT',
  'NOV',
  'DEZ',
]

// Mapeamento de nomes curtos de meses
export const MESES_ABREV = {
  JAN: 'Jan',
  FEV: 'Fev',
  MAR: 'Mar',
  ABR: 'Abr',
  MAI: 'Mai',
  JUN: 'Jun',
  JUL: 'Jul',
  AGO: 'Ago',
  SET: 'Set',
  OUT: 'Out',
  NOV: 'Nov',
  DEZ: 'Dez',
}

// Mapeamento de categorias para cores
export const CATEGORIAS_CORES: Record<string, string> = {
  ESTIVADOR: 'blue',
  ARRUMADOR: 'orange',
  VIGIA: 'brown',
  CONFERENTE: 'gray',
}

// Cores para gráficos
export const CHART_COLORS = [
  '#2563eb', // blue-600
  '#10b981', // emerald-500
  '#8b5cf6', // violet-500
  '#f59e0b', // amber-500
  '#ef4444', // red-500
  '#ec4899', // pink-500
  '#6366f1', // indigo-500
  '#14b8a6', // teal-500
]

// Limites para uploads
export const UPLOAD_LIMITS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ACCEPTED_FORMATS: ['application/pdf'],
}

// Rotas da aplicação
export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  EXTRATOS: '/extratos',
  EXTRATO_DETAIL: (id: string) => `/extratos/${id}`,
  UPLOAD: '/upload',
}

// Configurações de API
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  TIMEOUT: 30000, // 30 segundos
  RETRY_ATTEMPTS: 3,
}
