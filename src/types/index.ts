/**
 * Tipos compartilhados para a aplicação de Extratos Portuários
 */

// Tipos básicos de dados financeiros
export type ValoresMonetarios = {
  baseDeCalculo: number
  inss: number
  impostoDeRenda: number
  descontoJudicial: number
  das: number
  mensal: number
  impostoSindical: number
  descontosEpiCracha: number
  liquido: number
  ferias: number
  decimoTerceiro: number
  encargosDecimo: number
  fgts: number
}

// Resumo de dados financeiros usado em vários contextos
export type ResumoExtrato = ValoresMonetarios

// Tipo para um único trabalho/faina
export type Trabalho = ValoresMonetarios & {
  dia: string
  folha: string
  tomador: string
  tomadorNome?: string
  pasta: string
  fun: string
  tur: string
  ter: string
  pagto: string
}

// Tipo para um extrato completo
export type Extrato = {
  id?: string
  matricula: string
  nome: string
  mes: string
  ano: string
  categoria: string
  trabalhos: Trabalho[]
  folhasComplementos: ResumoExtrato
  revisadas: ResumoExtrato
}

// Resumo de um extrato para listagens
export type ExtratoResumo = {
  id: string
  matricula: string
  nome: string
  mes: string
  ano: string
  categoria: string
  totalTrabalhos: number
  valorTotal: number
}

// Tipo para resumo mensal
export type ResumoMensal = {
  _id: {
    mes: string
    ano: string
  }
  totalBaseCalculo: number
  totalLiquido: number
  totalFGTS: number
  totalTrabalhos: number
  totalTrabalhadores: number
}

// Tipo para análise de tomadores
export type TomadorAnalise = {
  tomador: string
  tomadorNome?: string
  totalTrabalhos: number
  valorTotal: number
}

// Tipo para totais por categoria
export type CategoriaTotais = {
  categoria: string
  count: number
  valorTotal: number
}

// Tipo para opções de período (mês/ano)
export type MesAnoOptions = {
  mes: string
  ano: string
  label: string
}

// Tipos para dados de gráficos do dashboard
export type SalaryBreakdownItem = {
  name: string
  value: number
  total: number
}

export type ChartDataItem = {
  name: string
  value: number
}

export type WeeklyJobData = {
  week: string
  [key: string]: string | number
}

export type TomadorCardData = {
  tomador: string
  tomadorNome?: string
  totalValor: number
  maiorBruto: number
  porcentagemTotal: string | number
  mediaValor?: number
  fainas: number
}

export type SummaryData = {
  totalFainas: number
  mediaFainasSemana: number
  diasTrabalhados: number
  mediaBrutoFaina: number
  mediaLiquidoFaina: number
}

// Enums para meses e categorias
export enum Categoria {
  ESTIVADOR = 'ESTIVADOR',
  ARRUMADOR = 'ARRUMADOR',
  VIGIA = 'VIGIA',
  CONFERENTE = 'CONFERENTE',
}

export enum Mes {
  JAN = 'JAN',
  FEV = 'FEV',
  MAR = 'MAR',
  ABR = 'ABR',
  MAI = 'MAI',
  JUN = 'JUN',
  JUL = 'JUL',
  AGO = 'AGO',
  SET = 'SET',
  OUT = 'OUT',
  NOV = 'NOV',
  DEZ = 'DEZ',
}
