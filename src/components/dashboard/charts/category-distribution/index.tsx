'use client'

import { CategoriaTotais } from '@/types'
import { DataCard } from '@/components/common/data-card'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts'
import { formatNumber, formatCurrency } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { CHART_COLORS } from '@/lib/constants'

interface CategoryDistributionProps {
  data: CategoriaTotais[]
  isLoading?: boolean
}

/**
 * Componente CategoryDistribution: Exibe gráfico de pizza com a distribuição de trabalhos por categoria
 */
export function CategoryDistribution({
  data,
  isLoading = false,
}: CategoryDistributionProps) {
  // Calcular total para percentuais
  const total = data.reduce((sum, item) => sum + item.valorTotal, 0)
  const totalCount = data.reduce((sum, item) => sum + item.count, 0)

  // Formatar dados para o gráfico
  const chartData = data.map((item) => ({
    name: item.categoria,
    value: item.count,
    totalValue: item.valorTotal,
    percentage: ((item.count / totalCount) * 100).toFixed(1),
    valuePercentage: ((item.valorTotal / total) * 100).toFixed(1),
  }))

  // Componente para tooltip personalizado
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload

      return (
        <div className="bg-background border rounded-md shadow-md p-3">
          <p className="font-medium">{item.name}</p>
          <p className="text-sm text-muted-foreground">
            Trabalhos: {formatNumber(item.value)} ({item.percentage}%)
          </p>
          <p className="text-sm text-muted-foreground">
            Valor: {formatCurrency(item.totalValue)} ({item.valuePercentage}%)
          </p>
        </div>
      )
    }
    return null
  }

  if (isLoading) {
    return (
      <DataCard
        title="Distribuição por Categoria"
        description="Distribuição de trabalhos por categoria profissional"
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
        title="Distribuição por Categoria"
        description="Distribuição de trabalhos por categoria profissional"
      >
        <div className="flex items-center justify-center h-80">
          <p className="text-muted-foreground">
            Não há dados suficientes para exibir a distribuição por categoria
          </p>
        </div>
      </DataCard>
    )
  }

  return (
    <DataCard
      title="Distribuição por Categoria"
      description="Distribuição de trabalhos por categoria profissional"
    >
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={true}
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
