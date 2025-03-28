'use client'

import { useMemo } from 'react'
import { DataCard } from '@/components/common/data-card'
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
import { formatCurrency } from '@/lib/utils'
import { CHART_COLORS } from '@/lib/constants'
import { Skeleton } from '@/components/ui/skeleton'

interface JobValueProps {
  trabalhos: any[] // Trabalhos com campos adicionados
  isLoading?: boolean
  limit?: number
}

/**
 * Componente JobValue: Exibe gráfico de barras com valor bruto por faina
 */
export function JobValue({
  trabalhos,
  isLoading = false,
  limit = 15,
}: JobValueProps) {
  // Formatar o nome do trabalho para incluir informações detalhadas
  const formatTrabalhoName = (trabalho: any) => {
    const dia = trabalho.dia || ''
    const pagtoSplit = trabalho.pagto?.split('/') || []
    const mes = pagtoSplit[0] || ''
    const ano = pagtoSplit[1] || ''
    const pasta = trabalho.pasta || ''
    const turno = trabalho.tur || ''

    // Formato: "navio dd/mm/aa periodo"
    return `${pasta} ${dia}/${mes}/${ano} ${turno}`
  }

  // Calcular dados para o gráfico de valor por faina
  const workValueData = useMemo(() => {
    if (!trabalhos || trabalhos.length === 0) return []

    return trabalhos
      .map((trabalho) => ({
        name: formatTrabalhoName(trabalho),
        value: trabalho.baseDeCalculo,
        pasta: trabalho.pasta || '',
        dia: trabalho.dia || '',
        mes: trabalho.pagto?.split('/')[0] || '',
        ano: trabalho.pagto?.split('/')[1] || '',
        turno: trabalho.tur || '',
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, limit)
  }, [trabalhos, limit])

  // Tooltip personalizado para valor bruto por faina
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-md shadow-md p-3">
          <p className="font-medium">Trabalho: {label}</p>
          <p className="text-sm text-muted-foreground">
            Valor: {formatCurrency(payload[0].value)}
          </p>
        </div>
      )
    }
    return null
  }

  if (isLoading) {
    return (
      <DataCard
        title="Valor Bruto por Faina (R$)"
        description="Valor bruto de cada trabalho realizado"
        isLoading={true}
      >
        <div className="h-80">
          <Skeleton className="w-full h-full" />
        </div>
      </DataCard>
    )
  }

  if (!workValueData || workValueData.length === 0) {
    return (
      <DataCard
        title="Valor Bruto por Faina (R$)"
        description="Valor bruto de cada trabalho realizado"
      >
        <div className="flex items-center justify-center h-80">
          <p className="text-muted-foreground">
            Não há dados suficientes para exibir o gráfico
          </p>
        </div>
      </DataCard>
    )
  }

  return (
    <DataCard
      title="Valor Bruto por Faina (R$)"
      description="Valor bruto de cada trabalho realizado"
    >
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={workValueData}
            margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 10 }}
              angle={-45}
              textAnchor="end"
              interval={0}
            />
            <YAxis
              tickFormatter={(value) => formatCurrency(value).split(',')[0]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="value" name="Valor Bruto" fill={CHART_COLORS[2]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </DataCard>
  )
}
