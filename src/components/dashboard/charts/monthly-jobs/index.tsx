'use client'

import { ChartDataItem } from '@/types'
import { BarChart } from '@/components/charts'
import { BarTooltip } from '@/components/charts/utils/tooltips'
import { formatNumber } from '@/lib/utils'

interface MonthlyJobsProps {
  data: ChartDataItem[]
  isLoading?: boolean
}

/**
 * Componente MonthlyJobs: Exibe gráfico de barras com trabalhos por mês
 */
export function MonthlyJobs({ data, isLoading = false }: MonthlyJobsProps) {
  return (
    <BarChart
      data={data}
      title="Trabalhos por Mês"
      description="Quantidade de trabalhos realizados em cada mês"
      isLoading={isLoading}
      emptyMessage="Não há dados suficientes para exibir os trabalhos mensais"
      tooltipContent={<BarTooltip />}
      height={320}
      yAxisFormatter={(value) => formatNumber(value)}
      series={[
        {
          key: 'value',
          name: 'Quantidade de Trabalhos',
        },
      ]}
    />
  )
}
