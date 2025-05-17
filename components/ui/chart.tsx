"use client"

import {
  LineChart as RechartsLineChart,
  Line,
  BarChart as RechartsBarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

interface ChartProps {
  data: any[]
  index: string
  categories: string[]
  colors: string[]
  valueFormatter?: (value: number) => string
  className?: string
}

export function LineChart({ 
  data, 
  categories, 
  index, 
  colors, 
  valueFormatter, 
  className 
}: ChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsLineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={index} />
        <YAxis tickFormatter={valueFormatter} />
        <Tooltip formatter={valueFormatter} />
        <Legend />
        {categories.map((category, idx) => (
          <Line
            key={category}
            type="monotone"
            dataKey={category}
            stroke={colors[idx]}
            dot={false}
          />
        ))}
      </RechartsLineChart>
    </ResponsiveContainer>
  )
}

export function BarChart({ 
  data, 
  categories, 
  index, 
  colors, 
  valueFormatter, 
  className 
}: ChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsBarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={index} />
        <YAxis tickFormatter={valueFormatter} />
        <Tooltip formatter={valueFormatter} />
        <Legend />
        {categories.map((category, idx) => (
          <Bar
            key={category}
            dataKey={category}
            fill={colors[idx]}
          />
        ))}
      </RechartsBarChart>
    </ResponsiveContainer>
  )
}

export function DonutChart({ 
  data, 
  index, 
  category, 
  colors = ['#0088FE', '#00C49F', '#FFBB28'], 
  valueFormatter 
}: any) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          dataKey="value"
          nameKey={index}
          label={(entry) => `${entry[index]}: ${valueFormatter(entry.value)}`}
        >
          {data.map((entry: any, index: number) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip formatter={valueFormatter} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}
