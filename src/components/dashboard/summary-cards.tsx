import { formatCurrency } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

interface SummaryCardsProps {
  data: {
    totalFainas: number
    mediaFainasSemana: number
    diasTrabalhados: number
    mediaBrutoFaina: number
    mediaLiquidoFaina: number
  }
  isLoading: boolean
}

export default function SummaryCards({ data, isLoading }: SummaryCardsProps) {
  const items = [
    {
      title: 'Faina(s) realizada(s)',
      value: isLoading ? <Skeleton className="h-8 w-full" /> : data.totalFainas,
      label: 'Total no período',
    },
    {
      title: 'Média Faina(s)/Semana',
      value: isLoading ? (
        <Skeleton className="h-8 w-full" />
      ) : (
        data.mediaFainasSemana.toFixed(1)
      ),
      label: 'No período selecionado',
    },
    {
      title: 'Dom/Fer Trabalhado(s)',
      value: isLoading ? (
        <Skeleton className="h-8 w-full" />
      ) : (
        data.diasTrabalhados
      ),
      label: 'Dias efetivamente trabalhados',
    },
    {
      title: 'Média Bruto/Faina',
      value: isLoading ? (
        <Skeleton className="h-8 w-full" />
      ) : (
        formatCurrency(data.mediaBrutoFaina)
      ),
      label: 'Valor médio bruto por trabalho',
    },
    {
      title: 'Média Líquido/Faina',
      value: isLoading ? (
        <Skeleton className="h-8 w-full" />
      ) : (
        formatCurrency(data.mediaLiquidoFaina)
      ),
      label: 'Valor médio líquido por trabalho',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      {items.map((item, index) => (
        <div key={index} className="bg-background border rounded-md p-4">
          <p className="text-sm text-muted-foreground">{item.title}</p>
          <div className="text-2xl font-semibold">{item.value}</div>
          <p className="text-xs text-muted-foreground">{item.label}</p>
        </div>
      ))}
    </div>
  )
}
