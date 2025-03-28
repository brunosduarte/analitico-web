'use client'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { CalendarIcon } from 'lucide-react'
import { useState, useCallback } from 'react'
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  subMonths,
  subWeeks,
  subDays,
  isValid,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'

export interface DateRange {
  from: Date
  to: Date
}

export interface PeriodOption {
  label: string
  getValue: () => DateRange
}

interface PeriodSelectorProps {
  onChange: (range: DateRange) => void
  initialRange?: DateRange
  className?: string
}

/**
 * Componente PeriodSelector: Seletor de período com presets
 */
export function PeriodSelector({
  onChange,
  initialRange,
  // className,
}: PeriodSelectorProps) {
  // Estado para o período selecionado
  const [dateRange, setDateRange] = useState<DateRange>(
    initialRange || {
      from: startOfMonth(new Date()),
      to: endOfMonth(new Date()),
    },
  )

  // Selected period display string
  const selectedPeriodText =
    isValid(dateRange.from) && isValid(dateRange.to)
      ? `${format(dateRange.from, 'dd/MM/yy')} - ${format(dateRange.to, 'dd/MM/yy')}`
      : 'Selecione um período'

  // Calcula o número de dias no período
  const daysDifference =
    isValid(dateRange.from) && isValid(dateRange.to)
      ? Math.round(
          (dateRange.to.getTime() - dateRange.from.getTime()) /
            (1000 * 60 * 60 * 24),
        ) + 1
      : 0

  // Função para atualizar o período selecionado
  const updateDateRange = useCallback(
    (from: Date, to: Date) => {
      const newRange = { from, to }
      setDateRange(newRange)
      onChange(newRange)
    },
    [onChange],
  )

  // Definição dos presets de período
  const periodPresets: PeriodOption[] = [
    {
      label: 'Esse mês',
      getValue: () => {
        const now = new Date()
        return {
          from: startOfMonth(now),
          to: endOfMonth(now),
        }
      },
    },
    {
      label: 'Essa semana',
      getValue: () => {
        const now = new Date()
        return {
          from: startOfWeek(now, { weekStartsOn: 0 }),
          to: endOfWeek(now, { weekStartsOn: 0 }),
        }
      },
    },
    {
      label: 'Semana passada',
      getValue: () => {
        const now = subWeeks(new Date(), 1)
        return {
          from: startOfWeek(now, { weekStartsOn: 0 }),
          to: endOfWeek(now, { weekStartsOn: 0 }),
        }
      },
    },
    {
      label: 'Mês passado',
      getValue: () => {
        const now = subMonths(new Date(), 1)
        return {
          from: startOfMonth(now),
          to: endOfMonth(now),
        }
      },
    },
    {
      label: 'Últimos 30 dias',
      getValue: () => {
        const now = new Date()
        return {
          from: subDays(now, 29),
          to: now,
        }
      },
    },
    {
      label: 'Últimos 3 meses',
      getValue: () => {
        const now = new Date()
        return {
          from: startOfMonth(subMonths(now, 2)),
          to: endOfMonth(now),
        }
      },
    },
    {
      label: 'Últimos 6 meses',
      getValue: () => {
        const now = new Date()
        return {
          from: startOfMonth(subMonths(now, 5)),
          to: endOfMonth(now),
        }
      },
    },
    {
      label: 'Últimos 12 meses',
      getValue: () => {
        const now = new Date()
        return {
          from: startOfMonth(subMonths(now, 11)),
          to: endOfMonth(now),
        }
      },
    },
  ]

  // Função para selecionar um preset
  const handlePresetSelect = (preset: PeriodOption) => {
    const range = preset.getValue()
    updateDateRange(range.from, range.to)
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-start text-left font-normal md:w-[300px]"
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selectedPeriodText}
          <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium">
            {daysDifference} dias
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end">
        <div className="p-3 border-b">
          <div className="grid grid-cols-2 gap-2">
            {periodPresets.map((preset, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => handlePresetSelect(preset)}
              >
                {preset.label}
              </Button>
            ))}
          </div>
        </div>
        <Calendar
          mode="range"
          selected={dateRange}
          onSelect={(range) => {
            if (range?.from && range?.to) {
              updateDateRange(range.from, range.to)
            }
          }}
          numberOfMonths={2}
          locale={ptBR}
          disabled={(date) =>
            date > new Date() || date < new Date('2000-01-01')
          }
        />
      </PopoverContent>
    </Popover>
  )
}
