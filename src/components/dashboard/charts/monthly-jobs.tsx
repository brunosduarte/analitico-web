'use client'

import { DataCard } from '@/components/common/data-card'
import { Chart } from '@/components/common/chart'
import { ChartDataItem } from '@/types'

interface MonthlyJobsProps {
  data: ChartDataItem[]
  isLoading?: boolean
}

/**
 * Componente MonthlyJobs: Exibe gráfico de barras horizontais com trabalhos por mês
 */
export function MonthlyJobs({ data, isLoading = false }: MonthlyJobsProps) {
  return (
    <DataCard
      title="Trabalhos por Mês"
      description="Quantidade de trabalhos realizados por mês"
      isLoading={isLoading}
    >
      <div className="h-80">
        <Chart
          type="horizontalBar"
          data={data}
          isLoading={isLoading}
          height={300}
          dataKey="count"
          nameKey="month"
          valueFormatter={(value) => String(value)}
          emptyMessage="Não há dados suficientes para exibir os trabalhos mensais"
        />
      </div>
    </DataCard>
  )
}
