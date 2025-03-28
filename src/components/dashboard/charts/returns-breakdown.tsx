'use client'

import { SalaryBreakdownItem } from '@/types'
import { DataCard } from '@/components/common/data-card'
import { formatCurrency } from '@/lib/utils'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts'
import { CHART_COLORS } from '@/lib/constants'
import { Skeleton } from '@/components/ui/skeleton'

interface ReturnsBreakdownProps {
  data: SalaryBreakdownItem[]
  isLoading?: boolean
}

/**
 * Componente ReturnsBreakdown: Exibe gráfico de donut com a distribuição dos valores de retorno (Férias, 13º, FGTS)
 */
export function ReturnsBreakdown({
  data,
  isLoading = false,
}: ReturnsBreakdownProps) {
  // Calcula o total para percentuais
  const total = data.reduce((sum, item) => sum + item.value, 0)

  // Prepara dados com total para percentuais
  const chartData = data.map((item) => ({
    ...item,
    total,
  }))

  // Componente para tooltip personalizado
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload
      const percentage = ((item.value / total) * 100).toFixed(1)

      return (
        <div className="bg-background border rounded-md shadow-md p-3">
          <p className="font-medium">{item.name}</p>
          <p className="text-sm text-muted-foreground">
            {formatCurrency(item.value)}
          </p>
          <p className="text-sm text-muted-foreground">{`(${percentage}%)`}</p>
        </div>
      )
    }
    return null
  }

  if (isLoading) {
    return (
      <DataCard
        title="Retornos Totais (R$)"
        description="Distribuição entre Férias, 13º e FGTS"
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
        title="Retornos Totais (R$)"
        description="Distribuição entre Férias, 13º e FGTS"
      >
        <div className="flex items-center justify-center h-80">
          <p className="text-muted-foreground">
            Não há dados suficientes para exibir os retornos
          </p>
        </div>
      </DataCard>
    )
  }

  return (
    <DataCard
      title="Retornos Totais (R$)"
      description="Distribuição entre Férias, 13º e FGTS"
    >
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
              label={({ name, percent }) =>
                `${name} (${(percent * 100).toFixed(0)}%)`
              }
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={CHART_COLORS[index % CHART_COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </DataCard>
  )
}
