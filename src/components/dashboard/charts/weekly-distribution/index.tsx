'use client'

import { WeeklyJobData, ChartDataItem } from '@/types'
import { DataCard } from '@/components/common/data-card'
import { useMemo } from 'react'
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
      const chartItem: ChartDataItem & Record<string, any> = {
        name: item.week,
        value: 0, // Este valor não será usado diretamente, já que usamos barSeries
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

  // Componente para tooltip personalizado
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-md shadow-md p-3">
          <p className="font-medium">Semana: {label}</p>
          {payload.map((item: any, index: number) => (
            <p key={index} className="text-sm text-muted-foreground">
              {item.name}: {formatNumber(item.value)}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  if (isLoading) {
    return (
      <DataCard
        title="Trabalhos por Semana"
        description="Quantidade de trabalhos por semana, coloridos por mês"
        isLoading={true}
      >
        <div className="h-80">
          <Skeleton className="w-full h-full" />
        </div>
      </DataCard>
    )
  }

  if (!data || data.length === 0 || barSeries.length === 0) {
    return (
      <DataCard
        title="Trabalhos por Semana"
        description="Quantidade de trabalhos por semana, coloridos por mês"
      >
        <div className="flex items-center justify-center h-80">
          <p className="text-muted-foreground">
            Não há dados suficientes para exibir a distribuição semanal
          </p>
        </div>
      </DataCard>
    )
  }

  return (
    <DataCard
      title="Trabalhos por Semana"
      description="Quantidade de trabalhos por semana, coloridos por mês"
    >
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={formattedData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {barSeries.map((series) => (
              <Bar
                key={series.key}
                dataKey={series.key}
                name={series.name}
                fill={series.color}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </DataCard>
  )
}
