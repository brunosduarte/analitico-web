'use client'

import { useMemo } from 'react'
import { DataCard } from '@/components/common/data-card'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts'
import { CHART_COLORS } from '@/lib/constants'
import { formatNumber } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

interface ShiftDistributionProps {
  trabalhos: any[] // Trabalhos com campos adicionados
  isLoading?: boolean
}

/**
 * Componente ShiftDistribution: Exibe gráfico de pizza com a distribuição de trabalhos por turno
 */
export function ShiftDistribution({
  trabalhos,
  isLoading = false,
}: ShiftDistributionProps) {
  // Processar dados para o gráfico de turnos
  const turnosData = useMemo(() => {
    if (!trabalhos || trabalhos.length === 0) {
      return []
    }

    // Agrupar trabalhos por turno (A, B, C, D)
    const turnos: Record<string, number> = {}

    trabalhos.forEach((trabalho) => {
      const turno = trabalho.tur || 'N/A'
      if (!turnos[turno]) {
        turnos[turno] = 0
      }
      turnos[turno]++
    })

    // Calcular o total para percentuais
    const total = Object.values(turnos).reduce((sum, value) => sum + value, 0)

    // Converter para formato adequado para o gráfico
    return Object.entries(turnos).map(([turno, quantidade]) => ({
      name: turno,
      value: quantidade,
      total,
    }))
  }, [trabalhos])

  // Componente para tooltip personalizado
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload
      const percentage = ((item.value / item.total) * 100).toFixed(1)

      return (
        <div className="bg-background border rounded-md shadow-md p-3">
          <p className="font-medium">Turno: {item.name}</p>
          <p className="text-sm text-muted-foreground">
            Quantidade: {formatNumber(item.value)}
          </p>
          <p className="text-sm text-muted-foreground">{`${percentage}%`}</p>
        </div>
      )
    }
    return null
  }

  // Renderizador de legenda personalizado
  const renderLegend = (props: any) => {
    const { payload } = props

    return (
      <ul className="flex flex-wrap justify-center gap-4 pt-2">
        {payload.map((entry: any, index: number) => (
          <li key={`item-${index}`} className="flex items-center gap-1">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span>{entry.value}</span>
          </li>
        ))}
      </ul>
    )
  }

  if (isLoading) {
    return (
      <DataCard
        title="Turnos Trabalhados"
        description="Distribuição de trabalhos por período (A, B, C, D)"
        isLoading={true}
      >
        <div className="h-80">
          <Skeleton className="w-full h-full" />
        </div>
      </DataCard>
    )
  }

  if (!turnosData || turnosData.length === 0) {
    return (
      <DataCard
        title="Turnos Trabalhados"
        description="Distribuição de trabalhos por período (A, B, C, D)"
      >
        <div className="flex items-center justify-center h-80">
          <p className="text-muted-foreground">
            Não há dados de turnos disponíveis
          </p>
        </div>
      </DataCard>
    )
  }

  return (
    <DataCard
      title="Turnos Trabalhados"
      description="Distribuição de trabalhos por período (A, B, C, D)"
    >
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={turnosData}
              cx="50%"
              cy="50%"
              labelLine={true}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
              label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
            >
              {turnosData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={CHART_COLORS[index % CHART_COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={renderLegend} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </DataCard>
  )
}
