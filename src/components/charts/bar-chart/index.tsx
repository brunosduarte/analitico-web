'use client'

import { DataCard } from '@/components/common/data-card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  BarChart as ReChartsBar,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps,
} from 'recharts'
import { CHART_COLORS } from '@/lib/constants'

interface BarChartProps {
  data: Array<{
    name: string
    value?: number
    [key: string]: any
  }>
  title: string
  description?: string
  isLoading?: boolean
  emptyMessage?: string
  height?: number
  tooltipContent?: React.ReactElement<TooltipProps<any, any>>
  colors?: string[]
  dataKey?: string
  nameKey?: string
  xAxisFormatter?: (value: any) => string
  yAxisFormatter?: (value: any) => string
  className?: string
  series?: Array<{
    key: string
    name: string
    color?: string
  }>
  layout?: 'vertical' | 'horizontal'
  showGrid?: boolean
}

/**
 * Componente BarChart: Componente reutilizável para gráficos de barras
 */
export function BarChart({
  data,
  title,
  description,
  isLoading = false,
  emptyMessage = 'Não há dados suficientes para exibir o gráfico',
  height = 300,
  tooltipContent,
  colors = CHART_COLORS,
  dataKey = 'value',
  nameKey = 'name',
  xAxisFormatter,
  yAxisFormatter,
  className,
  series,
  layout = 'horizontal',
  showGrid = true,
}: BarChartProps) {
  if (isLoading) {
    return (
      <DataCard title={title} description={description} className={className}>
        <div style={{ height: `${height}px` }}>
          <Skeleton className="w-full h-full" />
        </div>
      </DataCard>
    )
  }

  if (!data || data.length === 0) {
    return (
      <DataCard title={title} description={description} className={className}>
        <div
          style={{ height: `${height}px` }}
          className="flex items-center justify-center"
        >
          <p className="text-muted-foreground">{emptyMessage}</p>
        </div>
      </DataCard>
    )
  }

  // Configurações com base no layout
  const isVertical = layout === 'vertical'
  const xAxisProps = isVertical
    ? { type: 'number' as const, tickFormatter: xAxisFormatter }
    : { dataKey: nameKey, tickFormatter: xAxisFormatter }
  const yAxisProps = isVertical
    ? {
        dataKey: nameKey,
        tickFormatter: yAxisFormatter,
        type: 'category' as const,
      }
    : { tickFormatter: yAxisFormatter }

  // Margem padrão com base no layout
  const margin = isVertical
    ? { top: 20, right: 30, left: 80, bottom: 5 }
    : { top: 20, right: 30, left: 20, bottom: 5 }

  return (
    <DataCard title={title} description={description} className={className}>
      <div style={{ height: `${height}px` }}>
        <ResponsiveContainer width="100%" height="100%">
          <ReChartsBar data={data} layout={layout} margin={margin}>
            {showGrid && (
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={!isVertical}
                horizontal={isVertical}
              />
            )}
            <XAxis {...xAxisProps} />
            <YAxis {...yAxisProps} />
            {tooltipContent ? (
              <Tooltip content={tooltipContent} />
            ) : (
              <Tooltip />
            )}
            <Legend />
            {series && series.length > 0 ? (
              // Renderizar múltiplas séries quando fornecidas
              series.map((s, index) => (
                <Bar
                  key={`bar-${s.key}`}
                  dataKey={s.key}
                  name={s.name}
                  fill={s.color || colors[index % colors.length]}
                />
              ))
            ) : (
              // Renderizar uma única série usando dataKey
              <Bar dataKey={dataKey} name="Valor" fill={colors[0]} />
            )}
          </ReChartsBar>
        </ResponsiveContainer>
      </div>
    </DataCard>
  )
}
