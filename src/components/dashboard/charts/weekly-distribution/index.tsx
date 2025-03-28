'use client'

import { WeeklyJobData } from '@/types'
import { BarChart } from '@/components/charts'
import { BarTooltip } from '@/components/charts/utils/tooltips'
import { useMemo } from 'react'
import { CHART_COLORS } from '@/lib/constants'

interface WeeklyDistributionProps {
  data: WeeklyJobData[]
  isLoading?: boolean
}

/**
 * Componente WeeklyDistribution: Exibe gráfico de barras com a distribuição semanal de trabalhos
 */
export function WeeklyDistribution({
  data,
  isLoading = false,
}: WeeklyDistributionProps) {
  // Preparar séries para o gráfico a partir das chaves disponíveis
  const { barSeries, formattedData } = useMemo(() => {
    if (!data || data.length === 0) return { barSeries: [], formattedData: [] }

    // Pegar todas as chaves menos 'week'
    const sampleItem = data[0]
    const seriesKeys = Object.keys(sampleItem).filter((key) => key !== 'week')

    // Criar configuração para cada série
    const barSeries = seriesKeys.map((key, index) => ({
      key,
      name: `Mês ${key}`,
      color: CHART_COLORS[index % CHART_COLORS.length],
    }))

    // Formatar dados para compatibilidade com o componente Chart
    const formattedData = data.map((item) => {
      // Nome será a semana e o restante são valores
      const chartItem: Record<string, any> = {
        name: item.week,
        value: 0, // Valor dummy para satisfazer a tipagem
      }

      // Adicionar todas as propriedades do item original
      Object.keys(item).forEach((key) => {
        if (key !== 'week') {
          chartItem[key] = item[key]
        }
      })

      return chartItem
    })

    return { barSeries, formattedData }
  }, [data])

  return (
    <BarChart
      data={formattedData}
      title="Trabalhos por Semana"
      description="Quantidade de trabalhos por semana, coloridos por mês"
      isLoading={isLoading}
      emptyMessage="Não há dados suficientes para exibir a distribuição semanal"
      tooltipContent={<BarTooltip />}
      height={320}
      series={barSeries}
    />
  )
}
