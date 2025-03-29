import { useQuery } from '@tanstack/react-query'
import {
  getExtratos,
  getExtratoById,
  getSalaryBreakdown,
  getShiftDistribution,
  getWeeklyWorkDistribution,
  getTopJobs,
  getReturnsData,
  getFunctionDistribution,
} from '@/lib/api'
import {
  CategoriaTotais,
  Extrato,
  ExtratoResumo,
  SalaryBreakdownItem,
  SummaryData,
  TomadorCardData,
  WeeklyWorkItem,
  ChartDataItem,
  FunctionDistributionItem, // Novo tipo
} from '@/types'
import { DashboardFiltros } from '@/types/api'
import { useExtratoPeriodos } from './use-extratos'
import { generateChartColors } from '@/lib/utils'

/**
 * Interface de retorno do hook useDashboardData
 */
interface DashboardData {
  extratos: ExtratoResumo[]
  detailedData: Extrato[]
  trabalhos: any[] // Trabalhos com campos adicionados
  periodos: { mes: string; ano: string; label: string }[]
  categoriasTotais: CategoriaTotais[]
  tomadoresData: TomadorCardData[]
  summaryData: SummaryData
  salaryBreakdown: SalaryBreakdownItem[]
  shiftDistribution: SalaryBreakdownItem[]
  weeklyDistribution: WeeklyWorkItem[]
  topJobs: ChartDataItem[]
  monthlyJobsData: ChartDataItem[]
  returnsData: SalaryBreakdownItem[]
  functionDistribution: FunctionDistributionItem[] // Nova propriedade
  chartColors: string[]
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<any> // Função para recarregar dados
}

/**
 * Hook para obter dados do dashboard
 */
export function useDashboardData(filtros?: DashboardFiltros): DashboardData {
  // Buscar todos os extratos para análise
  const {
    data: extratos = [],
    isLoading: isLoadingExtratos,
    error: extratosError,
    refetch: refetchExtratos,
  } = useQuery<ExtratoResumo[], Error>({
    queryKey: ['extratos', filtros],
    queryFn: () => getExtratos(filtros),
    staleTime: 0, // Considera os dados sempre desatualizados
    refetchOnWindowFocus: false,
  })

  // Obter períodos disponíveis
  const periodos = useExtratoPeriodos(extratos)

  // Buscar detalhes completos para todos os extratos relevantes
  const {
    data: detailedData = [],
    isLoading: isLoadingDetails,
    refetch: refetchDetails,
  } = useQuery<Extrato[], Error>({
    queryKey: ['extratos-details', extratos.map((e) => e.id)],
    queryFn: async () => {
      if (!extratos || extratos.length === 0) {
        return []
      }

      // Buscar dados detalhados de cada extrato, processando em lotes para não sobrecarregar
      const extractIds = extratos.map((e) => e.id)
      const batchSize = 5
      const batches = []

      for (let i = 0; i < extractIds.length; i += batchSize) {
        const batch = extractIds.slice(i, i + batchSize)
        batches.push(batch)
      }

      const allDetails = []
      for (const batch of batches) {
        const batchDetails = await Promise.all(
          batch.map((id) => getExtratoById(id)),
        )
        allDetails.push(...batchDetails)
      }

      return allDetails
    },
    enabled: extratos.length > 0, // Só busca se tivermos extratos
    staleTime: 0,
    refetchOnWindowFocus: false,
  })

  // Extrair todos os trabalhos de todos os extratos
  const trabalhos = detailedData.flatMap((extrato) =>
    extrato.trabalhos.map((trabalho) => ({
      ...trabalho,
      extratoId: extrato.id,
      extratoNome: extrato.nome,
      extratoCategoria: extrato.categoria,
    })),
  )

  // Dados de quebra de salário bruto
  const {
    data: salaryBreakdown = [],
    isLoading: isLoadingSalary,
    refetch: refetchSalary,
  } = useQuery<SalaryBreakdownItem[], Error>({
    queryKey: ['salary-breakdown', filtros],
    queryFn: () => getSalaryBreakdown(filtros),
    enabled: !!filtros && extratos.length > 0,
    staleTime: 0,
    refetchOnWindowFocus: false,
  })

  // Distribuição de turnos
  const {
    data: shiftDistribution = [],
    isLoading: isLoadingShifts,
    refetch: refetchShifts,
  } = useQuery<SalaryBreakdownItem[], Error>({
    queryKey: ['shift-distribution', filtros],
    queryFn: () => getShiftDistribution(filtros),
    enabled: !!filtros && extratos.length > 0,
    staleTime: 0,
    refetchOnWindowFocus: false,
  })

  // Distribuição semanal de trabalhos
  const {
    data: weeklyDistribution = [],
    isLoading: isLoadingWeekly,
    refetch: refetchWeekly,
  } = useQuery<WeeklyWorkItem[], Error>({
    queryKey: ['weekly-distribution', filtros],
    queryFn: () => getWeeklyWorkDistribution(filtros),
    enabled: !!filtros && extratos.length > 0,
    staleTime: 0,
    refetchOnWindowFocus: false,
  })

  // Top trabalhos
  const {
    data: topJobs = [],
    isLoading: isLoadingTopJobs,
    refetch: refetchTopJobs,
  } = useQuery<ChartDataItem[], Error>({
    queryKey: ['top-jobs', filtros],
    queryFn: () => getTopJobs(filtros, 10),
    enabled: !!filtros && extratos.length > 0,
    staleTime: 0,
    refetchOnWindowFocus: false,
  })

  // Dados de retornos
  const {
    data: returnsData = [],
    isLoading: isLoadingReturns,
    refetch: refetchReturns,
  } = useQuery<SalaryBreakdownItem[], Error>({
    queryKey: ['returns-data', filtros],
    queryFn: () => getReturnsData(filtros),
    enabled: !!filtros && extratos.length > 0,
    staleTime: 0,
    refetchOnWindowFocus: false,
  })

  // Nova query: Distribuição por função
  const {
    data: functionDistribution = [],
    isLoading: isLoadingFunctions,
    refetch: refetchFunctions,
  } = useQuery<FunctionDistributionItem[], Error>({
    queryKey: ['function-distribution', filtros],
    queryFn: () => getFunctionDistribution(filtros),
    enabled: !!filtros && extratos.length > 0,
    staleTime: 0,
    refetchOnWindowFocus: false,
  })

  // Calcular dados processados localmente

  // Totais por categoria
  const categoriasTotais: CategoriaTotais[] = extratos.reduce(
    (acc: CategoriaTotais[], extrato) => {
      // Verificar se já temos esta categoria
      const existente = acc.find((item) => item.categoria === extrato.categoria)

      if (existente) {
        existente.count += 1
        existente.valorTotal += extrato.valorTotal
      } else {
        acc.push({
          categoria: extrato.categoria,
          count: 1,
          valorTotal: extrato.valorTotal,
        })
      }

      return acc
    },
    [],
  )

  // Cálculo de dados para tomadores
  const tomadoresData: TomadorCardData[] =
    trabalhos.length > 0 ? processOperatorData(trabalhos) : []

  // Dados mensais
  const monthlyJobsData: ChartDataItem[] = processMonthlyData(extratos)

  // Cálculo dos dados de resumo (KPIs)
  const summaryData: SummaryData =
    trabalhos.length > 0
      ? prepareSummaryData(trabalhos)
      : {
          totalFainas: 0,
          mediaFainasSemana: 0,
          diasTrabalhados: 0,
          mediaBrutoFaina: 0,
          mediaLiquidoFaina: 0,
        }

  // Final isLoading state
  const isLoading =
    isLoadingExtratos ||
    isLoadingDetails ||
    isLoadingSalary ||
    isLoadingShifts ||
    isLoadingWeekly ||
    isLoadingTopJobs ||
    isLoadingReturns ||
    isLoadingFunctions

  // Função para refazer todas as consultas
  const refetch = async () => {
    console.log('Executando refetch de dados do dashboard')

    // Primeiro refetch extratos, que é a base para as outras consultas
    await refetchExtratos()

    // Se houver extratos, refetch dos detalhes
    if (extratos.length > 0) {
      await Promise.all([
        refetchDetails(),
        refetchSalary(),
        refetchShifts(),
        refetchWeekly(),
        refetchTopJobs(),
        refetchReturns(),
        refetchFunctions(), // Nova função de refetch
      ])
    }
  }

  // Preparar dados de chart colors
  const chartColors = generateChartColors(10)

  return {
    extratos,
    detailedData,
    trabalhos,
    periodos,
    categoriasTotais,
    tomadoresData,
    summaryData,
    salaryBreakdown,
    shiftDistribution,
    weeklyDistribution,
    topJobs,
    monthlyJobsData,
    returnsData,
    functionDistribution, // Novos dados
    chartColors,
    isLoading,
    error: extratosError || null,
    refetch,
  }
}

/**
 * Processa dados para análise de operadores/tomadores
 */
function processOperatorData(trabalhos: any[]): TomadorCardData[] {
  // Group by 'tomador'
  const operatorData: Record<string, TomadorCardData> = trabalhos.reduce(
    (acc: Record<string, TomadorCardData>, trabalho) => {
      const tomador = trabalho.tomador
      if (!acc[tomador]) {
        acc[tomador] = {
          tomador,
          tomadorNome: trabalho.tomadorNome,
          fainas: 0,
          totalValor: 0,
          maiorBruto: 0,
          porcentagemTotal: 0,
        }
      }

      acc[tomador].fainas += 1
      acc[tomador].totalValor += trabalho.baseDeCalculo
      acc[tomador].maiorBruto = Math.max(
        acc[tomador].maiorBruto,
        trabalho.baseDeCalculo,
      )

      return acc
    },
    {},
  )

  // Calculate total value for percentage
  const totalValue = Object.values(operatorData).reduce(
    (sum, op) => sum + op.totalValor,
    0,
  )

  // Calculate percentages and averages
  return Object.values(operatorData)
    .map((op) => ({
      ...op,
      porcentagemTotal: ((op.totalValor / totalValue) * 100).toFixed(2),
      mediaValor: op.fainas > 0 ? op.totalValor / op.fainas : 0,
    }))
    .sort((a, b) => b.totalValor - a.totalValor)
}

/**
 * Processar dados mensais para gráficos
 */
function processMonthlyData(extratos: ExtratoResumo[]): ChartDataItem[] {
  // Contar por mês
  const monthCounts: Record<
    string,
    { count: number; valorTotal: number; month: string }
  > = {}

  extratos.forEach((extrato) => {
    const key = `${extrato.mes}/${extrato.ano}`

    if (!monthCounts[key]) {
      monthCounts[key] = {
        month: key,
        count: 0,
        valorTotal: 0,
      }
    }

    monthCounts[key].count += extrato.totalTrabalhos
    monthCounts[key].valorTotal += extrato.valorTotal
  })

  // Converter para array e ordenar por mês
  return Object.values(monthCounts)
    .map((item) => ({
      name: item.month,
      value: item.count,
      valorTotal: item.valorTotal,
      // Adicionar média por trabalho
      mediaValor: item.count > 0 ? item.valorTotal / item.count : 0,
    }))
    .sort((a, b) => a.name.localeCompare(b.name))
}

/**
 * Prepara dados de resumo (KPIs) para o dashboard
 * Agora com suporte para contar domingos e feriados trabalhados
 */
function prepareSummaryData(trabalhos: any[]): SummaryData {
  if (!trabalhos || trabalhos.length === 0) {
    return {
      totalFainas: 0,
      mediaFainasSemana: 0,
      diasTrabalhados: 0,
      mediaBrutoFaina: 0,
      mediaLiquidoFaina: 0,
    }
  }

  const totalFainas = trabalhos.length

  // Identificar domingos e feriados trabalhados
  // Usamos um conjunto (Set) para garantir que dias únicos sejam contados
  const domFerTrabalhados = new Set()

  trabalhos.forEach((trabalho) => {
    const dia = trabalho.dia
    const pagto = trabalho.pagto

    // Extrair data completa
    if (pagto && pagto.includes('/')) {
      const [mes, ano] = pagto.split('/')
      // Criar uma chave única para o dia
      const dataKey = `${dia}/${mes}/${ano}`

      // Verificar se é domingo ou feriado
      // Aqui verificamos baseado em dados do backend que já marcam os domingos/feriados
      // Esta lógica simples é apenas para ilustração, o backend contém a lógica completa
      if (trabalho.isDomingo || trabalho.isFeriado) {
        domFerTrabalhados.add(dataKey)
      }
    }
  })

  // Count unique days worked
  const diasTrabalhados = domFerTrabalhados.size || 0

  // Calculate number of weeks based on unique days
  const dateDiffs =
    trabalhos.length > 0
      ? Math.ceil(
          (new Date(trabalhos[0].dataFinal).getTime() -
            new Date(trabalhos[0].dataInicio).getTime()) /
            (7 * 24 * 60 * 60 * 1000),
        )
      : 1
  const weeks = Math.max(dateDiffs, 1)

  // Calculate averages
  const mediaBrutoFaina =
    trabalhos.reduce((sum, t) => sum + t.baseDeCalculo, 0) / totalFainas
  const mediaLiquidoFaina =
    trabalhos.reduce((sum, t) => sum + t.liquido, 0) / totalFainas

  return {
    totalFainas,
    mediaFainasSemana: totalFainas / weeks,
    diasTrabalhados,
    mediaBrutoFaina,
    mediaLiquidoFaina,
  }
}
