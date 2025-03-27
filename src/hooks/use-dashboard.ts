import { useQuery } from '@tanstack/react-query'
import { getExtratos, getExtratoById } from '@/lib/api'
import { ExtratoResumo, CategoriaTotais } from '@/types'
import { useExtratoPeriodos } from './use-extratos'

// Hook para obter dados completos do dashboard
export function useDashboardData(mes?: string, ano?: string) {
  // Buscar todos os extratos para análise
  const { data: extratos = [], isLoading: isLoadingExtratos } = useQuery<
    ExtratoResumo[],
    Error
  >({
    queryKey: ['extratos', { mes, ano }],
    queryFn: () => getExtratos({ mes, ano }),
  })

  // Obter períodos disponíveis
  const periodos = useExtratoPeriodos(extratos)

  // Buscar detalhes completos para todos os extratos relevantes
  const { data: detailedData = [], isLoading: isLoadingDetails } = useQuery({
    queryKey: ['extratos-details', extratos.map((e) => e.id)],
    queryFn: async () => {
      // Buscar dados detalhados de cada extrato
      const details = await Promise.all(
        extratos.map((e) => getExtratoById(e.id)),
      )
      return details
    },
    enabled: extratos.length > 0, // Só busca se tivermos extratos
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

  // Calcular totais por categoria
  const categoriasTotais = extratos.reduce(
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

  // Calcular comparativos mensais
  const mensaisTotais = extratos.reduce(
    (acc: Record<string, number>, extrato) => {
      const key = `${extrato.mes}/${extrato.ano}`

      if (!acc[key]) {
        acc[key] = 0
      }

      acc[key] += extrato.valorTotal

      return acc
    },
    {},
  )

  // Converter para array para gráficos
  const mensaisData = Object.entries(mensaisTotais).map(([key, valor]) => {
    return {
      periodo: key,
      valor,
    }
  })

  // Obter análise de tomadores
  const { data: tomadoresAnalytics = [], isLoading: isLoadingTomadores } =
    useQuery({
      queryKey: ['tomadoresAnalise', trabalhos],
      queryFn: () => {
        // Grouping logic for operators
        const tomadores = trabalhos.reduce((acc, trabalho) => {
          const tomador = trabalho.tomador

          if (!acc[tomador]) {
            acc[tomador] = {
              tomador,
              tomadorNome: trabalho.tomadorNome || tomador,
              totalTrabalhos: 0,
              valorTotal: 0,
            }
          }

          acc[tomador].totalTrabalhos += 1
          acc[tomador].valorTotal += trabalho.baseDeCalculo

          return acc
        }, {})

        // Return as sorted array
        return Object.values(tomadores).sort(
          (a, b) => b.valorTotal - a.valorTotal,
        )
      },
      enabled: trabalhos.length > 0,
    })

  // Final isLoading state
  const isLoading = isLoadingExtratos || isLoadingDetails || isLoadingTomadores

  return {
    isLoading,
    extratos,
    periodos,
    categoriasTotais,
    mensaisData,
    tomadoresAnalytics,
    trabalhos,
    detailedData,
  }
}
