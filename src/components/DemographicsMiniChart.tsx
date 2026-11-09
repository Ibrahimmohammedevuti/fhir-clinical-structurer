import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell
} from 'recharts';
import { PatientDemographics } from '../types/clinical';
import { buildPatientDemographicsChartData } from '../utils/fhirBuilder';

interface DemographicsMiniChartProps {
  patient: PatientDemographics;
}

export const DemographicsMiniChart: React.FC<DemographicsMiniChartProps> = ({
  patient
}) => {
  const { cohortBracket, data } = useMemo(
    () => buildPatientDemographicsChartData(patient),
    [patient]
  );

  const sexLabel = patient.sex.toUpperCase();

  return (
    <div
      data-testid="demographics-mini-panel"
      className="rounded-md border border-slate-800 bg-[#07090E] px-4 py-3 flex flex-col justify-between"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="text-[11px] font-mono tracking-wider uppercase text-slate-400">
          Age &amp; Gender Profile
        </div>
        <span className="text-[10px] font-mono text-cyan-400 tabular-nums">
          Cohort {cohortBracket}
        </span>
      </div>

      <div className="mt-1 flex items-center justify-between gap-2">
        <div>
          <div className="flex items-baseline">
            <span className="text-2xl font-mono font-bold text-slate-100 tabular-nums">
              {patient.age}
            </span>
            <span className="ml-1.5 text-xs font-mono uppercase text-cyan-400 font-semibold">
              {sexLabel}
            </span>
          </div>
          <div className="mt-0.5 text-[11px] font-mono text-slate-400 tabular-nums whitespace-nowrap">
            M: Cyan · F: Teal
          </div>
        </div>

        {/* Compact Recharts Age & Gender Distribution Visualization */}
        <div
          aria-label={`Age and gender distribution chart highlighting ${patient.age} year old ${patient.sex} in ${cohortBracket} cohort`}
          className="shrink-0"
        >
          <BarChart
            width={126}
            height={46}
            data={data}
            margin={{ top: 2, right: 2, left: 2, bottom: 0 }}
            barGap={2}
          >
            <XAxis
              dataKey="bracket"
              tick={{ fill: '#94A3B8', fontSize: 9, fontFamily: 'JetBrains Mono' }}
              axisLine={false}
              tickLine={false}
              interval={0}
            />
            <YAxis hide domain={[0, 65]} />
            <Tooltip
              cursor={{ fill: 'rgba(148, 163, 184, 0.08)' }}
              contentStyle={{
                backgroundColor: '#0B0E17',
                borderColor: '#1E293B',
                borderRadius: '4px',
                fontSize: '10px',
                fontFamily: 'JetBrains Mono',
                padding: '4px 6px',
                color: '#F1F5F9'
              }}
              itemStyle={{ color: '#E2E8F0', padding: 0 }}
              labelStyle={{ color: '#38BDF8', fontWeight: 600 }}
            />
            <Bar dataKey="maleCount" name="Male" radius={[2, 2, 0, 0]} isAnimationActive={false}>
              {data.map((entry) => (
                <Cell
                  key={`male-${entry.bracket}`}
                  fill={
                    entry.isCurrentBracket && patient.sex === 'male'
                      ? '#06B6D4'
                      : entry.isCurrentBracket
                      ? '#0891B2'
                      : '#1E293B'
                  }
                />
              ))}
            </Bar>
            <Bar dataKey="femaleCount" name="Female" radius={[2, 2, 0, 0]} isAnimationActive={false}>
              {data.map((entry) => (
                <Cell
                  key={`female-${entry.bracket}`}
                  fill={
                    entry.isCurrentBracket && patient.sex === 'female'
                      ? '#10B981'
                      : entry.isCurrentBracket
                      ? '#0D9488'
                      : '#334155'
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </div>
      </div>
    </div>
  );
};
