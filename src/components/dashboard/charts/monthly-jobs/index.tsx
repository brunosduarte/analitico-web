'use client'

import { DataCard } from '@/components/common/data-card'
import { ChartDataItem } from '@/types'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { formatNumber } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { CHART_COLORS } from '@/lib/constants'

interface MonthlyJobsProps {
  data: ChartDataItem[]
  isLoading?: boolean
}

/**
 * Componente MonthlyJobs: Exibe gráfico de barras com trabalhos por mês
 */
export function MonthlyJobs({ data, isLoading = false }: MonthlyJobsProps) {
  // Componente para tooltip personalizado
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-md shadow-md p-3">
          <p className="font-medium">Mês: {label}</p>
          <p className="text-sm text-muted-foreground">
            Trabalhos: {formatNumber(payload[0].value)}
          </p>
        </div>
      )
    }
    return null
  }

  if (isLoading) {
    return (
      <DataCard
        title="Trabalhos por Mês"
        description="Quantidade de trabalhos realizados em cada mês"
        isLoading={true}
      >
        <div className="h-80">
          <Skeleton className="w-full h-full" />
        </div>
      </DataCard>
    )
  }

  if (!data || data.length === 0) {
    return (
      <DataCard
        title="Trabalhos por Mês"
        description="Quantidade de trabalhos realizados em cada mês"
      >
        <div className="flex items-center justify-center h-80">
          <p className="text-muted-foreground">
            Não há dados suficientes para exibir os trabalhos mensais
          </p>
        </div>
      </DataCard>
    )
  }

  return (
    <DataCard
      title="Trabalhos por Mês"
      description="Quantidade de trabalhos realizados em cada mês"
    >
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar
              dataKey="value"
              name="Quantidade de Trabalhos"
              fill={CHART_COLORS[0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </DataCard>
  )
}
