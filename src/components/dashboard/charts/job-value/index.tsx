'use client'

import { useMemo } from 'react'
import { BarChart } from '@/components/charts'
import { WorkTooltip } from '@/components/charts/utils/tooltips'
import { formatCurrency } from '@/lib/utils'

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

  return (
    <BarChart
      data={workValueData}
      title="Valor Bruto por Faina (R$)"
      description="Valor bruto de cada trabalho realizado"
      isLoading={isLoading}
      emptyMessage="Não há dados suficientes para exibir o gráfico"
      tooltipContent={<WorkTooltip />}
      height={320}
      yAxisFormatter={(value) => formatCurrency(value).split(',')[0]}
      xAxisFormatter={(name) => {
        // Simplificar nomes muito longos
        if (typeof name === 'string' && name.length > 15) {
          return name.substring(0, 12) + '...'
        }
        return name
      }}
    />
  )
}
