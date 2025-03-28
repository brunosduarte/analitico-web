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

interface TopJobsProps {
  trabalhos: any[] // Trabalhos com campos adicionados
  isLoading?: boolean
  limit?: number
}

/**
 * Componente TopJobs: Exibe gráfico de barras horizontais com os trabalhos de maior valor
 */
export function TopJobs({
  trabalhos,
  isLoading = false,
  limit = 10,
}: TopJobsProps) {
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

  // Calcular dados para o top de fainas
  const topJobsData = useMemo(() => {
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

  // Tooltip personalizado para top fainas
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

  // Renderizador de legenda personalizado para o eixo Y
  const yAxisTickFormatter = (value: string) => {
    if (!value) return ''

    // Extrair as partes do nome formatado
    const parts = value.split(' ')
    const pasta = parts[0] // Navio
    const dataPeriodo = parts.slice(1).join(' ') // dd/mm/aa periodo

    // Retornar em formato compacto
    return `${pasta} ${dataPeriodo}`
  }

  if (isLoading) {
    return (
      <DataCard
        title="Top Fainas (R$)"
        description="Trabalhos com maior valor bruto"
        isLoading={true}
      >
        <div className="h-80">
          <Skeleton className="w-full h-full" />
        </div>
      </DataCard>
    )
  }

  if (!topJobsData || topJobsData.length === 0) {
    return (
      <DataCard
        title="Top Fainas (R$)"
        description="Trabalhos com maior valor bruto"
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
      title="Top Fainas (R$)"
      description="Trabalhos com maior valor bruto"
    >
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={topJobsData}
            margin={{ top: 20, right: 30, left: 120, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              horizontal={true}
              vertical={false}
            />
            <XAxis
              type="number"
              tickFormatter={(value) => formatCurrency(value).split(',')[0]}
            />
            <YAxis
              dataKey="name"
              type="category"
              tick={{ fontSize: 10 }}
              width={120}
              tickFormatter={yAxisTickFormatter}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="value" name="Valor" fill={CHART_COLORS[3]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </DataCard>
  )
}
