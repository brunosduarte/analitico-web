'use client'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { CalendarIcon } from 'lucide-react'
import { useState } from 'react'
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  subMonths,
  subWeeks,
  subDays,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface PeriodSelectorProps {
  onChange: (from: Date, to: Date) => void
}

export default function PeriodSelector({ onChange }: PeriodSelectorProps) {
  const [dateRange, setDateRange] = useState<{
    from: Date
    to: Date
  }>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  })

  // Selected period display string
  const selectedPeriodText = `${format(dateRange.from, 'dd/MM/yy')} - ${format(dateRange.to, 'dd/MM/yy')}`
  const daysDifference =
    Math.round(
      (dateRange.to.getTime() - dateRange.from.getTime()) /
        (1000 * 60 * 60 * 24),
    ) + 1

  // Update date range and trigger onChange
  const updateDateRange = (from: Date, to: Date) => {
    setDateRange({ from, to })
    onChange(from, to)
  }

  // Period preset handlers
  const selectThisMonth = () => {
    const now = new Date()
    const from = startOfMonth(now)
    const to = endOfMonth(now)
    updateDateRange(from, to)
  }

  const selectThisWeek = () => {
    const now = new Date()
    const from = startOfWeek(now, { weekStartsOn: 0 })
    const to = endOfWeek(now, { weekStartsOn: 0 })
    updateDateRange(from, to)
  }

  const selectLastWeek = () => {
    const now = subWeeks(new Date(), 1)
    const from = startOfWeek(now, { weekStartsOn: 0 })
    const to = endOfWeek(now, { weekStartsOn: 0 })
    updateDateRange(from, to)
  }

  const selectLastMonth = () => {
    const now = subMonths(new Date(), 1)
    const from = startOfMonth(now)
    const to = endOfMonth(now)
    updateDateRange(from, to)
  }

  const selectLast30Days = () => {
    const now = new Date()
    const from = subDays(now, 29)
    updateDateRange(from, now)
  }

  const selectLast3Months = () => {
    const now = new Date()
    const from = startOfMonth(subMonths(now, 2))
    const to = endOfMonth(now)
    updateDateRange(from, to)
  }

  const selectLast6Months = () => {
    const now = new Date()
    const from = startOfMonth(subMonths(now, 5))
    const to = endOfMonth(now)
    updateDateRange(from, to)
  }

  const selectLast12Months = () => {
    const now = new Date()
    const from = startOfMonth(subMonths(now, 11))
    const to = endOfMonth(now)
    updateDateRange(from, to)
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
            <Button variant="outline" size="sm" onClick={selectThisMonth}>
              Esse mês
            </Button>
            <Button variant="outline" size="sm" onClick={selectThisWeek}>
              Essa semana
            </Button>
            <Button variant="outline" size="sm" onClick={selectLastWeek}>
              Semana passada
            </Button>
            <Button variant="outline" size="sm" onClick={selectLastMonth}>
              Mês passado
            </Button>
            <Button variant="outline" size="sm" onClick={selectLast30Days}>
              Últimos 30 dias
            </Button>
            <Button variant="outline" size="sm" onClick={selectLast3Months}>
              Últimos 3 meses
            </Button>
            <Button variant="outline" size="sm" onClick={selectLast6Months}>
              Últimos 6 meses
            </Button>
            <Button variant="outline" size="sm" onClick={selectLast12Months}>
              Últimos 12 meses
            </Button>
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
        />
      </PopoverContent>
    </Popover>
  )
}
