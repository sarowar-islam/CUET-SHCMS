import { useState, useEffect, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
} from "recharts";
import type { Complaint } from "../dummy";
import { CATEGORY_LABELS, STATUS_LABELS } from "../dummy";

/* Validated categorical palette — all 6 pass CVD + contrast checks.
   #F59E0B and #10B981 have contrast WARN → every bar/segment carries a direct label. */
const CAT_PALETTE = ["#0D9488", "#3B82F6", "#F59E0B", "#EF4444", "#8B5CF6", "#10B981"];

function derive(complaints: Complaint[]) {
  // Category counts
  const catCount: Record<string, number> = {};
  for (const c of complaints) catCount[c.category] = (catCount[c.category] ?? 0) + 1;
  const byCategory = Object.entries(catCount)
    .map(([k, v]) => ({ key: k, label: CATEGORY_LABELS[k as keyof typeof CATEGORY_LABELS], count: v }))
    .sort((a, b) => b.count - a.count);

  // Block extraction (first char of room, e.g. "A-204" → "A")
  const blockCount: Record<string, number> = {};
  for (const c of complaints) {
    const block = c.room.split("-")[0] ?? "?";
    blockCount[block] = (blockCount[block] ?? 0) + 1;
  }
  const byBlock = Object.entries(blockCount)
    .map(([block, count]) => ({ block: `Block ${block}`, count }))
    .sort((a, b) => b.count - a.count);

  // Status distribution
  const statusCount: Record<string, number> = {};
  for (const c of complaints) statusCount[c.status] = (statusCount[c.status] ?? 0) + 1;
  const byStatus = Object.entries(statusCount).map(([k, v]) => ({
    label: STATUS_LABELS[k as keyof typeof STATUS_LABELS],
    value: v,
  }));

  // Urgency distribution
  const urgencyOrder = ["critical", "high", "medium", "low"];
  const urgencyCount: Record<string, number> = {};
  for (const c of complaints) urgencyCount[c.urgency] = (urgencyCount[c.urgency] ?? 0) + 1;
  const byUrgency = urgencyOrder.map((u) => ({
    urgency: u.charAt(0).toUpperCase() + u.slice(1),
    count: urgencyCount[u] ?? 0,
  }));

  // Simulated monthly trend (past 6 months, extrapolate from data)
  const base = byCategory[0]?.count ?? 1;
  const months = ["Mar", "Apr", "May", "Jun", "Jul", "Aug"];
  const trend = months.map((month, i) => {
    const noise = () => Math.round((Math.random() - 0.5) * 1.5);
    return {
      month,
      electrical: Math.max(0, Math.round(base * 0.4 + i * 0.15 + noise())),
      plumbing: Math.max(0, Math.round(base * 0.3 + i * 0.1 + noise())),
      internet: Math.max(0, Math.round(base * 0.2 + i * 0.2 + noise())),
      others: Math.max(0, Math.round(base * 0.15 + noise())),
    };
  });

  // Radar: block × category intensity
  const radarData = Object.keys(blockCount).map((block) => {
    const blockComplaints = complaints.filter((c) => c.room.startsWith(block));
    const result: Record<string, string | number> = { block: `Block ${block}` };
    for (const key of Object.keys(catCount)) {
      result[key] = blockComplaints.filter((c) => c.category === key).length;
    }
    return result;
  });

  // Resolution rate
  const resolved = complaints.filter((c) => c.status === "resolved").length;
  const resolutionRate = complaints.length ? Math.round((resolved / complaints.length) * 100) : 0;

  // Avg time to resolve (mock — real timestamps differ by days)
  const resolvedComplaints = complaints.filter((c) => c.status === "resolved");
  const avgDays = resolvedComplaints.length
    ? Math.round(
        resolvedComplaints.reduce((acc, c) => {
          const diff = (new Date(c.updatedAt).getTime() - new Date(c.submittedAt).getTime()) / 86400000;
          return acc + Math.abs(diff);
        }, 0) / resolvedComplaints.length
      )
    : 0;

  // Top problem block
  const topBlock = byBlock[0];
  const topCategory = byCategory[0];

  // Pending urgency alert
  const criticalPending = complaints.filter(
    (c) => c.urgency === "critical" && c.status === "pending"
  ).length;

  return {
    byCategory,
    byBlock,
    byStatus,
    byUrgency,
    trend,
    radarData,
    resolutionRate,
    avgDays,
    topBlock,
    topCategory,
    criticalPending,
    total: complaints.length,
  };
}

function generateInsights(stats: ReturnType<typeof derive>): string[] {
  const insights: string[] = [];
  if (stats.topCategory) {
    insights.push(
      `${stats.topCategory.label} complaints account for the highest volume (${stats.topCategory.count} cases), suggesting infrastructure wear or seasonal load increases in this domain.`
    );
  }
  if (stats.topBlock) {
    insights.push(
      `${stats.topBlock.block} is the most complaint-prone zone with ${stats.topBlock.count} reported issues. A targeted inspection of this block is recommended.`
    );
  }
  if (stats.resolutionRate < 50) {
    insights.push(
      `Resolution rate is ${stats.resolutionRate}% — below the 60% benchmark. Increasing staff bandwidth or enabling auto-assignment may improve throughput.`
    );
  } else {
    insights.push(
      `Resolution rate stands at ${stats.resolutionRate}%, above the 60% institutional benchmark. Maintain current response protocols.`
    );
  }
  if (stats.criticalPending > 0) {
    insights.push(
      `${stats.criticalPending} critical complaint${stats.criticalPending > 1 ? "s are" : " is"} still pending — these carry safety risk and require immediate staff assignment.`
    );
  }
  if (stats.avgDays <= 2) {
    insights.push(
      `Average resolution time is ${stats.avgDays} day${stats.avgDays !== 1 ? "s" : ""} — an excellent response pace for a residential facility.`
    );
  } else {
    insights.push(
      `Average resolution time is ${stats.avgDays} days. Streamlining handoff from Admin to Staff could reduce this by an estimated 30–40%.`
    );
  }
  return insights;
}

function generatePredictions(stats: ReturnType<typeof derive>): {
  title: string;
  detail: string;
  confidence: number;
  type: "risk" | "opportunity" | "trend";
}[] {
  const preds = [];
  const topCat = stats.topCategory?.label ?? "Electrical";
  const topBlock = stats.topBlock?.block ?? "Block A";

  preds.push({
    title: `${topCat} complaints likely to rise +25% in Sep–Oct`,
    detail: `Historical volume combined with monsoon season humidity and increased AC/fan usage suggests elevated ${topCat.toLowerCase()} maintenance demand. Pre-emptive inspections recommended.`,
    confidence: 82,
    type: "trend" as const,
  });
  preds.push({
    title: `${topBlock} warrants a proactive maintenance sweep`,
    detail: `Complaint density in ${topBlock} is significantly above hall average. A scheduled block-wide inspection in the next 14 days could prevent 3–5 escalations.`,
    confidence: 76,
    type: "risk" as const,
  });
  preds.push({
    title: "Internet/network issues projected to spike mid-semester",
    detail: `Submission patterns show internet complaints cluster around assignment deadlines. Infrastructure stress-testing and bandwidth scaling during peak periods is advised.`,
    confidence: 71,
    type: "trend" as const,
  });
  preds.push({
    title: "Resolution bottleneck risk if staff count stays flat",
    detail: `At current complaint growth rate, unresolved backlog is projected to exceed 12 complaints by end of semester without additional staff allocation or auto-assignment.`,
    confidence: 65,
    type: "risk" as const,
  });
  preds.push({
    title: "Opportunity to automate low-urgency complaint routing",
    detail: `35% of complaints are low or medium urgency and follow predictable patterns. Automating assignment for these categories could free staff for critical issues.`,
    confidence: 88,
    type: "opportunity" as const,
  });
  return preds;
}

// Custom tooltip shared styles
const tooltipStyle: React.CSSProperties = {
  backgroundColor: "#fff",
  border: "1px solid #D1D9E6",
  borderRadius: "6px",
  padding: "8px 12px",
  fontSize: "12px",
  fontFamily: "var(--font-mono)",
  color: "#111827",
  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
};

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={tooltipStyle}>
      {label && <p style={{ color: "#6B7280", marginBottom: "4px" }}>{label}</p>}
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color ?? "#111827" }}>
          <span style={{ color: "#6B7280" }}>{p.name ?? p.dataKey}: </span>
          {p.value}
        </p>
      ))}
    </div>
  );
}

interface Props {
  complaints: Complaint[];
}

export default function AIAnalysis({ complaints }: Props) {
  const [analysing, setAnalysing] = useState(true);
  const [progress, setProgress] = useState(0);
  const [streamedInsights, setStreamedInsights] = useState<string[]>([]);

  const stats = useMemo(() => derive(complaints), [complaints]);
  const insights = useMemo(() => generateInsights(stats), [stats]);
  const predictions = useMemo(() => generatePredictions(stats), [stats]);

  // Simulated AI "analysis" loading
  useEffect(() => {
    setAnalysing(true);
    setProgress(0);
    setStreamedInsights([]);
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) { clearInterval(interval); return 100; }
        return p + 4;
      });
    }, 60);
    return () => clearInterval(interval);
  }, [complaints]);

  useEffect(() => {
    if (progress >= 100) {
      setTimeout(() => setAnalysing(false), 200);
    }
  }, [progress]);

  // Stream insights one by one after analysis
  useEffect(() => {
    if (analysing) return;
    let i = 0;
    const t = setInterval(() => {
      if (i < insights.length) {
        setStreamedInsights((prev) => [...prev, insights[i]]);
        i++;
      } else {
        clearInterval(t);
      }
    }, 420);
    return () => clearInterval(t);
  }, [analysing, insights]);

  if (analysing) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-6">
        <div className="relative w-20 h-20">
          <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="34" fill="none" stroke="#EEF0F4" strokeWidth="6" />
            <circle
              cx="40" cy="40" r="34"
              fill="none"
              stroke="#0D9488"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 34}`}
              strokeDashoffset={`${2 * Math.PI * 34 * (1 - progress / 100)}`}
              style={{ transition: "stroke-dashoffset 0.1s ease" }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "14px", color: "#0D9488", fontWeight: 500 }}>
              {progress}%
            </span>
          </div>
        </div>
        <div className="text-center space-y-1.5">
          <p className="text-sm font-semibold" style={{ fontFamily: "var(--font-display)", color: "#111827" }}>
            AI Analysing Complaints…
          </p>
          <p className="text-xs" style={{ color: "#9CA3AF", fontFamily: "var(--font-mono)" }}>
            {progress < 30 && "Parsing complaint records…"}
            {progress >= 30 && progress < 55 && "Identifying hotspots and patterns…"}
            {progress >= 55 && progress < 75 && "Computing category frequency distributions…"}
            {progress >= 75 && progress < 92 && "Running predictive models…"}
            {progress >= 92 && "Generating insights and recommendations…"}
          </p>
        </div>
      </div>
    );
  }

  const { byCategory, byBlock, byStatus, byUrgency, trend, resolutionRate, avgDays, criticalPending, total } = stats;

  return (
    <div className="space-y-8 pb-8">
      {/* Header banner */}
      <div
        className="rounded-xl px-6 py-5 flex items-center gap-4"
        style={{
          background: "linear-gradient(135deg, #0F1B2D 0%, #1A3A5C 60%, #0D9488 100%)",
        }}
      >
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
          style={{ backgroundColor: "rgba(255,255,255,0.12)" }}
        >
          <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12" />
          </svg>
        </div>
        <div className="flex-1">
          <h2
            className="text-base font-bold text-white mb-0.5"
            style={{ fontFamily: "var(--font-display)" }}
          >
            AI-Powered Complaint Analysis
          </h2>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.55)", fontFamily: "var(--font-mono)" }}>
            Analysed {total} complaint records · Kaveri Hall · Updated just now
          </p>
        </div>
        <div className="flex gap-3 shrink-0">
          {[
            { label: "Resolution", value: `${resolutionRate}%`, good: resolutionRate >= 50 },
            { label: "Avg. Resolve", value: `${avgDays}d`, good: avgDays <= 3 },
            { label: "Critical Pending", value: String(criticalPending), good: criticalPending === 0 },
          ].map((kpi) => (
            <div
              key={kpi.label}
              className="px-4 py-2.5 rounded-lg text-center"
              style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
            >
              <p
                className="text-lg font-bold"
                style={{
                  fontFamily: "var(--font-display)",
                  color: kpi.good ? "#10B981" : "#EF4444",
                }}
              >
                {kpi.value}
              </p>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-mono)" }}>
                {kpi.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* AI Insights stream */}
      <div
        className="rounded-xl p-6"
        style={{ backgroundColor: "#fff", border: "1px solid var(--border)" }}
      >
        <div className="flex items-center gap-2 mb-4">
          <div
            className="w-5 h-5 rounded flex items-center justify-center"
            style={{ backgroundColor: "#F0FDF4" }}
          >
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="#0D9488" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h3 className="text-sm font-semibold" style={{ fontFamily: "var(--font-display)", color: "#111827" }}>
            AI Key Findings
          </h3>
        </div>
        <ul className="space-y-3">
          {streamedInsights.map((insight, i) => (
            <li
              key={i}
              className="flex gap-3 text-sm leading-relaxed"
              style={{
                color: "#374151",
                fontFamily: "var(--font-body)",
                animation: "fadeSlideIn 0.35s ease both",
              }}
            >
              <span
                className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold mt-0.5"
                style={{ backgroundColor: "#EEF0F4", color: "#6B7280", fontFamily: "var(--font-mono)" }}
              >
                {i + 1}
              </span>
              {insight}
            </li>
          ))}
          {streamedInsights.length < insights.length && (
            <li className="flex gap-2 items-center">
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: "#EEF0F4" }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-pulse" />
              </span>
              <span className="text-xs" style={{ color: "#9CA3AF" }}>Generating next insight…</span>
            </li>
          )}
        </ul>
      </div>

      {/* Row 1: Category bar + Block bar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category frequency */}
        <div className="rounded-xl p-6" style={{ backgroundColor: "#fff", border: "1px solid var(--border)" }}>
          <ChartHeader
            title="Complaints by Category"
            subtitle="Ranked by volume — direct labels shown"
          />
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={byCategory}
              layout="vertical"
              margin={{ left: 12, right: 32, top: 4, bottom: 4 }}
              barSize={14}
            >
              <CartesianGrid horizontal={false} stroke="#EEF0F4" strokeDasharray="3 3" />
              <XAxis
                type="number"
                tick={{ fontSize: 11, fontFamily: "var(--font-mono)", fill: "#9CA3AF" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                dataKey="label"
                type="category"
                width={110}
                tick={{ fontSize: 11, fontFamily: "var(--font-body)", fill: "#374151" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "#F4F5F7" }} />
              <Bar dataKey="count" name="Complaints" radius={[0, 4, 4, 0]} label={{ position: "right", fontSize: 11, fontFamily: "var(--font-mono)", fill: "#6B7280" }}>
                {byCategory.map((_, i) => (
                  <Cell key={i} fill={CAT_PALETTE[i % CAT_PALETTE.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Block distribution */}
        <div className="rounded-xl p-6" style={{ backgroundColor: "#fff", border: "1px solid var(--border)" }}>
          <ChartHeader
            title="Complaints by Block"
            subtitle="Which residential wings report the most issues"
          />
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={byBlock}
              margin={{ left: 8, right: 16, top: 4, bottom: 4 }}
              barSize={36}
            >
              <CartesianGrid vertical={false} stroke="#EEF0F4" strokeDasharray="3 3" />
              <XAxis
                dataKey="block"
                tick={{ fontSize: 11, fontFamily: "var(--font-body)", fill: "#374151" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fontFamily: "var(--font-mono)", fill: "#9CA3AF" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "#F4F5F7" }} />
              <Bar dataKey="count" name="Complaints" radius={[4, 4, 0, 0]} label={{ position: "top", fontSize: 11, fontFamily: "var(--font-mono)", fill: "#6B7280" }}>
                {byBlock.map((_, i) => (
                  <Cell key={i} fill={CAT_PALETTE[i % CAT_PALETTE.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 2: Trend line + Urgency + Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly trend */}
        <div
          className="lg:col-span-2 rounded-xl p-6"
          style={{ backgroundColor: "#fff", border: "1px solid var(--border)" }}
        >
          <ChartHeader
            title="Monthly Complaint Trend"
            subtitle="Top 4 categories over 6 months (simulated from current data)"
          />
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={trend} margin={{ left: 0, right: 16, top: 8, bottom: 4 }}>
              <CartesianGrid stroke="#EEF0F4" strokeDasharray="3 3" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fontFamily: "var(--font-body)", fill: "#374151" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fontFamily: "var(--font-mono)", fill: "#9CA3AF" }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<ChartTooltip />} />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: "11px", fontFamily: "var(--font-body)", paddingTop: "8px" }}
              />
              {[
                { key: "electrical", color: CAT_PALETTE[0], label: "Electrical" },
                { key: "plumbing", color: CAT_PALETTE[1], label: "Plumbing" },
                { key: "internet", color: CAT_PALETTE[2], label: "Internet" },
                { key: "others", color: CAT_PALETTE[3], label: "Others" },
              ].map((s) => (
                <Line
                  key={s.key}
                  type="monotone"
                  dataKey={s.key}
                  name={s.label}
                  stroke={s.color}
                  strokeWidth={2}
                  dot={{ r: 4, fill: s.color, strokeWidth: 2, stroke: "#fff" }}
                  activeDot={{ r: 6 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Urgency breakdown */}
        <div className="rounded-xl p-6" style={{ backgroundColor: "#fff", border: "1px solid var(--border)" }}>
          <ChartHeader title="Urgency Distribution" subtitle="Current complaint pool" />
          <div className="space-y-3 mt-4">
            {byUrgency.map((u, i) => {
              const colors = ["#EF4444", "#F59E0B", "#0D9488", "#6B7280"];
              const pct = total ? Math.round((u.count / total) * 100) : 0;
              return (
                <div key={u.urgency}>
                  <div className="flex justify-between text-xs mb-1">
                    <span style={{ color: "#374151", fontFamily: "var(--font-body)", fontWeight: 500 }}>
                      {u.urgency}
                    </span>
                    <span style={{ color: "#9CA3AF", fontFamily: "var(--font-mono)" }}>
                      {u.count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full rounded-full h-2" style={{ backgroundColor: "#EEF0F4" }}>
                    <div
                      className="h-2 rounded-full"
                      style={{ width: `${pct}%`, backgroundColor: colors[i] }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Status donut surrogate — simple stat tiles */}
          <div className="mt-6 pt-5 border-t" style={{ borderColor: "var(--border)" }}>
            <p className="text-xs font-semibold mb-3" style={{ fontFamily: "var(--font-display)", color: "#6B7280" }}>
              STATUS SPLIT
            </p>
            <div className="grid grid-cols-2 gap-2">
              {byStatus.map((s, i) => (
                <div
                  key={s.label}
                  className="rounded-lg px-3 py-2 text-center"
                  style={{ backgroundColor: "#F4F5F7" }}
                >
                  <p
                    className="text-lg font-bold"
                    style={{ color: CAT_PALETTE[i % CAT_PALETTE.length], fontFamily: "var(--font-display)" }}
                  >
                    {s.value}
                  </p>
                  <p className="text-xs" style={{ color: "#9CA3AF", fontFamily: "var(--font-mono)" }}>
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Radar */}
      <div
        className="rounded-xl p-6"
        style={{ backgroundColor: "#fff", border: "1px solid var(--border)" }}
      >
        <ChartHeader
          title="Block × Category Intensity Radar"
          subtitle="Reveals which problem types cluster in which residential blocks"
        />
        <div className="flex justify-center">
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={stats.radarData} margin={{ top: 8, right: 40, bottom: 8, left: 40 }}>
              <PolarGrid stroke="#EEF0F4" />
              <PolarAngleAxis
                dataKey="block"
                tick={{ fontSize: 11, fontFamily: "var(--font-body)", fill: "#374151" }}
              />
              <Tooltip content={<ChartTooltip />} />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: "11px", fontFamily: "var(--font-body)", paddingTop: "8px" }}
              />
              {Object.keys(stats.byCategory.reduce((a, c) => ({ ...a, [c.key]: true }), {} as Record<string, boolean>)).map((key, i) => (
                <Radar
                  key={key}
                  name={CATEGORY_LABELS[key as keyof typeof CATEGORY_LABELS]}
                  dataKey={key}
                  stroke={CAT_PALETTE[i % CAT_PALETTE.length]}
                  fill={CAT_PALETTE[i % CAT_PALETTE.length]}
                  fillOpacity={0.12}
                  strokeWidth={2}
                />
              ))}
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Predictions */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          <h3
            className="text-sm font-semibold"
            style={{ fontFamily: "var(--font-display)", color: "#111827" }}
          >
            Predictive Insights
          </h3>
          <span
            className="text-xs px-2 py-0.5 rounded"
            style={{
              backgroundColor: "#F5F3FF",
              color: "#6D28D9",
              fontFamily: "var(--font-mono)",
              border: "1px solid #DDD6FE",
            }}
          >
            AI-generated
          </span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {generatePredictions(stats).map((pred, i) => {
            const typeStyle = {
              risk: { bg: "#FEF2F2", border: "#FECACA", dot: "#EF4444", label: "Risk" },
              opportunity: { bg: "#F0FDF4", border: "#6EE7B7", dot: "#10B981", label: "Opportunity" },
              trend: { bg: "#EFF6FF", border: "#BFDBFE", dot: "#3B82F6", label: "Trend" },
            }[pred.type];
            return (
              <div
                key={i}
                className="rounded-xl p-5 space-y-3"
                style={{
                  backgroundColor: typeStyle.bg,
                  border: `1px solid ${typeStyle.border}`,
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded"
                    style={{
                      backgroundColor: typeStyle.dot,
                      color: "#fff",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {typeStyle.label}
                  </span>
                  <span
                    className="text-xs font-medium"
                    style={{ color: "#6B7280", fontFamily: "var(--font-mono)" }}
                  >
                    {pred.confidence}% confidence
                  </span>
                </div>
                <p
                  className="text-sm font-semibold leading-snug"
                  style={{ fontFamily: "var(--font-display)", color: "#111827" }}
                >
                  {pred.title}
                </p>
                <p
                  className="text-xs leading-relaxed"
                  style={{ color: "#4B5563", fontFamily: "var(--font-body)" }}
                >
                  {pred.detail}
                </p>
                {/* Confidence bar */}
                <div>
                  <div className="w-full rounded-full h-1" style={{ backgroundColor: "rgba(0,0,0,0.08)" }}>
                    <div
                      className="h-1 rounded-full"
                      style={{ width: `${pred.confidence}%`, backgroundColor: typeStyle.dot }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

function ChartHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-4">
      <h3
        className="text-sm font-semibold"
        style={{ fontFamily: "var(--font-display)", color: "#111827" }}
      >
        {title}
      </h3>
      <p className="text-xs mt-0.5" style={{ color: "#9CA3AF", fontFamily: "var(--font-body)" }}>
        {subtitle}
      </p>
    </div>
  );
}
