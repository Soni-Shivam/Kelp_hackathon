'use client';

import React from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, ComposedChart } from 'recharts';
import { ChartData } from '@/types/presentation';

interface ChartBlockProps {
    heading: string;
    chartData: ChartData;
}

const COLORS = ['#4B0082', '#FF69B4', '#FF8C00', '#00FFFF', '#82ca9d'];

// Helper to parse **bold** markers in text
const parseMarkdown = (text: string): React.ReactNode => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={i}>{part.slice(2, -2)}</strong>;
        }
        return part;
    });
};

export const ChartBlock: React.FC<ChartBlockProps> = ({ heading, chartData }) => {
    // Transform Data
    const formattedData = chartData.labels.map((label, i) => {
        const obj: any = { name: label };
        chartData.datasets.forEach(ds => {
            obj[ds.label] = ds.data[i];
        });
        return obj;
    });

    // Determine primary data keys
    const keys = chartData.datasets.map(d => d.label);

    const renderChart = () => {
        switch (chartData.chart_type) {
            case 'doughnut':
                return (
                    <PieChart>
                        <Pie
                            data={formattedData}
                            dataKey={keys[0]}
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={80}
                            paddingAngle={2}
                        >
                            {formattedData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                );
            case 'combo_bar_line':
                return (
                    <ComposedChart data={formattedData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
                        <YAxis yAxisId="left" fontSize={10} axisLine={false} tickLine={false} />
                        <YAxis yAxisId="right" orientation="right" fontSize={10} axisLine={false} tickLine={false} />
                        <Tooltip />
                        <Bar yAxisId="left" dataKey={keys[0]} fill="#4B0082" radius={[4, 4, 0, 0] as any} barSize={40} />
                        {keys[1] && <Line yAxisId="right" type="monotone" dataKey={keys[1]} stroke="#FF69B4" strokeWidth={3} dot={{ r: 4 }} />}
                    </ComposedChart>
                );
            case 'stacked_bar':
                return (
                    <BarChart data={formattedData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
                        <YAxis fontSize={10} axisLine={false} tickLine={false} />
                        <Tooltip />
                        {keys.map((key, i) => (
                            <Bar key={key} dataKey={key} stackId="a" fill={COLORS[i % COLORS.length]} radius={[0, 0, 0, 0] as any} />
                        ))}
                    </BarChart>
                );
            case 'line':
                return (
                    <LineChart data={formattedData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
                        <YAxis fontSize={10} axisLine={false} tickLine={false} />
                        <Tooltip />
                        <Line type="monotone" dataKey={keys[0]} stroke="#4B0082" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    </LineChart>
                );
            default: // Simple Bar
                return (
                    <BarChart data={formattedData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
                        <YAxis fontSize={10} axisLine={false} tickLine={false} />
                        <Tooltip cursor={{ fill: 'transparent' }} />
                        <Bar dataKey={keys[0]} fill="#4B0082" radius={[4, 4, 0, 0] as any}>
                            {formattedData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                );
        }
    };

    return (
        <div className="h-full w-full flex flex-col pt-2 relative bg-white">
            {/* Heading */}
            <div className="bg-kelp-primary text-white px-3 py-2 mb-2 w-full">
                <h3 className="font-bold text-lg leading-tight truncate">{parseMarkdown(heading)}</h3>
            </div>

            {/* Chart Area */}
            <div className="flex-1 w-full min-h-0 relative">
                <ResponsiveContainer width="99%" height="100%">
                    {renderChart()}
                </ResponsiveContainer>
            </div>

            {/* Strategic Analysis */}
            {chartData.strategic_analysis && (
                <div className="mt-1 px-2 pb-2">
                    <p className="text-[10px] italic text-slate-500 text-center">
                        {chartData.strategic_analysis}
                    </p>
                </div>
            )}
        </div>
    );
};
