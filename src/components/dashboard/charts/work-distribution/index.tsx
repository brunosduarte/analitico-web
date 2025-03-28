'use client'

import { DataCard } from '@/components/common/data-card'
import { Trabalho } from '@/types'
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
import { formatCurrency, formatNumber } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { CHART_COLORS } from '@/lib/constants'

interface WorkDistributionProps {
  trabalhos: Trabalho[]
  isLoading?: boolean
}

/**
 * Componente WorkDistribution: Exibe gráfico de barras com a distribuição de trabalhos por dia do mês
 */
export function WorkDistribution({
  trabalhos,
  isLoading = false,
}: WorkDistributionProps) {
  // Processar dados para o gráfico de distribuição por dia
  const distributionData = useMemo(() => {
    if (!trabalhos || trabalhos.length === 0) return []

    // Agrupar trabalhos por dia do mês
    const diasData: Record<string, { count: number; valor: number }> = {}

    trabalhos.forEach((trabalho) => {
      const dia = trabalho.dia || 'N/A'

      if (!diasData[dia]) {
        diasData[dia] = { count: 0, valor: 0 }
      }

      diasData[dia].count += 1
      diasData[dia].valor += trabalho.liquido
    })

    // Converter para formato de gráfico e ordenar por dia
    return Object.entries(diasData)
      .map(([dia, data]) => ({
        dia,
        count: data.count,
        valor: data.valor,
      }))
      .sort((a, b) => parseInt(a.dia) - parseInt(b.dia))
  }, [trabalhos])

  // Componente para tooltip personalizado
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-md shadow-md p-3">
          <p className="font-medium">Dia: {label}</p>
          <p className="text-sm text-muted-foreground">
            Trabalhos: {formatNumber(payload[0].value)}
          </p>
          <p className="text-sm text-muted-foreground">
            Valor: {formatCurrency(payload[1].value)}
          </p>
        </div>
      )
    }
    return null
  }

  if (isLoading) {
    return (
      <DataCard
        title="Distribuição por Dia"
        description="Quantidade e valor dos trabalhos por dia do mês"
        isLoading={true}
      >
        <div className="h-80">
          <Skeleton className="w-full h-full" />
        </div>
      </DataCard>
    )
  }

  if (!distributionData || distributionData.length === 0) {
    return (
      <DataCard
        title="Distribuição por Dia"
        description="Quantidade e valor dos trabalhos por dia do mês"
      >
        <div className="flex items-center justify-center h-80">
          <p className="text-muted-foreground">
            Não há dados suficientes para exibir a distribuição por dia
          </p>
        </div>
      </DataCard>
    )
  }

  return (
    <DataCard
      title="Distribuição por Dia"
      description="Quantidade e valor dos trabalhos por dia do mês"
    >
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={distributionData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="dia" />
            <YAxis yAxisId="left" orientation="left" />
            <YAxis
              yAxisId="right"
              orientation="right"
              tickFormatter={(value) => formatCurrency(value).split(',')[0]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar
              yAxisId="left"
              dataKey="count"
              name="Quantidade"
              fill={CHART_COLORS[0]}
            />
            <Bar
              yAxisId="right"
              dataKey="valor"
              name="Valor (R$)"
              fill={CHART_COLORS[1]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </DataCard>
  )
}
