"use client";

// components/analytics/analytics-dashboard.tsx

import { useState } from "react";
import { TrendingUp, ChevronDown, ArrowUpRight, Calendar } from "lucide-react";

// ── Total Users chart — jagged line with dots ──
function TotalUsersChart() {
  return (
    <svg width="208" height="93" viewBox="0 0 208 93" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1.78027 84.4191L10.717 78.9733L19.4942 69.2979L28.2713 64.4901L37.2081 74.0278L45.9852 71.9083L54.922 69.2979L63.8587 53.9396H72.6359L81.5726 58.8381L90.3498 66.2563L99.2865 60.9576L108.064 37.2899L117 32.6976L125.778 39.4114L134.555 41.8821L143.491 37.2899L152.269 46.8276L161.205 48.2406L169.982 53.9396L178.919 63.4303L187.696 58.8381L196.633 44.0016L205.41 14.6875" stroke="#B2ADFF" strokeWidth="0.89" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M1.78027 84.4191L10.717 78.9733L19.4942 69.2979L28.2713 64.4901L37.2081 74.0278L45.9852 71.9083L54.922 69.2979L63.8587 53.9396H72.6359L81.5726 58.8381L90.3498 66.2563L99.2865 60.9576L108.064 37.2899L117 32.6976L125.778 39.4114L134.555 41.8821L143.491 37.2899L152.269 46.8276L161.205 48.2406L169.982 53.9396L178.919 63.4303L187.696 58.8381L196.633 44.0016L205.41 14.6875" stroke="#B2ADFF" strokeWidth="3.56" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="0 22.25"/>
      <path d="M1.78027 84.4191L10.717 78.9733L19.4942 69.2979L28.2713 64.4901L37.2081 74.0278L45.9852 71.9083L54.922 69.2979L63.8587 53.9396H72.6359L81.5726 58.8381L90.3498 66.2563L99.2865 60.9576L108.064 37.2899L117 32.6976L125.778 39.4114L134.555 41.8821L143.491 37.2899L152.269 46.8276L161.205 48.2406L169.982 53.9396L178.919 63.4303L187.696 58.8381L196.633 44.0016L205.41 14.6875" stroke="white" strokeWidth="2.67" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="0 22.25"/>
      <path d="M1.78027 90.6479L10.717 67.9401L19.4942 59.1601L28.2713 47.8715L37.2081 49.1257L45.9852 44.1086L54.922 49.1257L63.8587 44.1086L72.6359 46.6172H81.5726L90.3498 51.0072H99.2865L108.064 44.1086L117 38.7796L125.778 35.3285H134.555L143.491 31.5657L152.269 27.4892L161.205 31.5657L169.983 38.7796L178.919 53.5157L187.696 52.2615L195.671 39.2698L200.541 24.3535L205.41 1.78125" stroke="#BABABA" strokeWidth="0.89" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M1.78027 90.6479L10.717 67.9401L19.4942 59.1601L28.2713 47.8715L37.2081 49.1257L45.9852 44.1086L54.922 49.1257L63.8587 44.1086L72.6359 46.6172H81.5726L90.3498 51.0072H99.2865L108.064 44.1086L117 38.7796L125.778 35.3285H134.555L143.491 31.5657L152.269 27.4892L161.205 31.5657L169.983 38.7796L178.919 53.5157L187.696 52.2615L195.671 39.2698L200.541 24.3535L205.41 1.78125" stroke="#BABABA" strokeWidth="3.56" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="0 22.25"/>
      <path d="M1.78027 90.6479L10.717 67.9401L19.4942 59.1601L28.2713 47.8715L37.2081 49.1257L45.9852 44.1086L54.922 49.1257L63.8587 44.1086L72.6359 46.6172H81.5726L90.3498 51.0072H99.2865L108.064 44.1086L117 38.7796L125.778 35.3285H134.555L143.491 31.5657L152.269 27.4892L161.205 31.5657L169.983 38.7796L178.919 53.5157L187.696 52.2615L195.671 39.2698L200.541 24.3535L205.41 1.78125" stroke="white" strokeWidth="2.67" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="0 22.25"/>
    </svg>
  );
}
// ── New Users / Uploads chart — smooth wavy line, no dots ──
function SmoothWaveChart() {
  return (
    <svg width="150" height="35" viewBox="0 0 150 35" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path opacity="0.1" fillRule="evenodd" clipRule="evenodd" d="M1 23.3754C1 23.3754 6.82659 22.5824 13.4511 24.4875C26.0505 28.1109 26.7692 21.4756 31.4412 18.2762C35.7156 15.3491 39.2555 17.135 44.0147 20.7146C47.5248 23.3548 52.6404 27.7865 57.938 27.073C62.7807 26.4209 66.2137 21.2231 72.9261 19.9012C78.2461 18.8535 82.5695 21.7318 88.6955 20.7146C97.0059 19.3349 100.718 11.2119 106.658 11.2119C113.988 11.2119 119.149 4.3418 125.818 4.3418C132.448 4.3418 133.347 8.38159 140.599 11.2119C146.143 13.3757 148.811 11.2119 148.811 11.2119V34.3986H1V23.3754Z" fill="url(#paint0_linear_wave)"/>
      <path d="M1 19.7745C1 19.7745 6.82659 18.9929 13.4511 20.8705C26.0505 24.4414 26.7692 17.9022 31.4412 14.7491C35.7156 11.8644 39.2555 13.6244 44.0147 17.1522C47.5248 19.7541 52.6404 24.1217 57.938 23.4186C62.7807 22.7758 66.2137 17.6533 72.9261 16.3505C78.2461 15.318 82.5695 18.1546 88.6955 17.1522C97.0059 15.7924 100.718 7.78703 106.658 7.78703C113.988 7.78703 119.149 1 125.818 1C132.448 1 132.8 4.99768 140.052 7.78703C145.596 9.91951 148.811 7.78703 148.811 7.78703" stroke="#B2ADFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <defs>
        <linearGradient id="paint0_linear_wave" x1="27.7133" y1="19.5928" x2="27.7133" y2="34.3986" gradientUnits="userSpaceOnUse">
          <stop stopColor="#635BFF"/>
          <stop offset="1" stopColor="white" stopOpacity="0.01"/>
        </linearGradient>
      </defs>
    </svg>
  );
}

// ── Donut chart SVG component ──
function DonutChart() {
  // Purple = 65.8%, Pink = 20.5%, rest = 13.7%
  const total = 100;
  const purple = 65.8;
  const pink = 20.5;
  const radius = 80;
  const cx = 110;
  const cy = 110;
  const circumference = 2 * Math.PI * radius;

  function getArc(startPercent: number, endPercent: number, color: string) {
    const start = (startPercent / 100) * circumference;
    const end = (endPercent / 100) * circumference;
    const startAngle = (startPercent / 100) * 360 - 90;
    const endAngle = (endPercent / 100) * 360 - 90;
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    const x1 = cx + radius * Math.cos(startRad);
    const y1 = cy + radius * Math.sin(startRad);
    const x2 = cx + radius * Math.cos(endRad);
    const y2 = cy + radius * Math.sin(endRad);
    const largeArc = endPercent - startPercent > 50 ? 1 : 0;
    return (
      <path
        d={`M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`}
        stroke={color}
        strokeWidth="40"
        fill="none"
        strokeLinecap="butt"
      />
    );
  }

  return (
    <svg width="220" height="220" viewBox="0 0 220 220">
      {/* Background circle — very light grey */}
      <circle cx={cx} cy={cy} r={radius} stroke="#f3f4f6" strokeWidth="40" fill="none" />
      {/* Purple segment - General Users 65.8% */}
      {getArc(0, 65.8, "#635bff")}
      {/* Pink segment - Sellers 20.5% */}
      {getArc(65.8, 86.3, "#ec4899")}
    </svg>
  );
}

// ── Mini line chart for revenue ──
function MiniLineChart() {
  const points = [30, 45, 35, 60, 50, 70, 65, 80, 72, 90];
  const max = Math.max(...points);
  const min = Math.min(...points);
  const width = 300;
  const height = 80;
  const coords = points.map((p, i) => ({
    x: (i / (points.length - 1)) * width,
    y: height - ((p - min) / (max - min)) * height,
  }));
  const pathD = coords.map((c, i) => `${i === 0 ? "M" : "L"} ${c.x} ${c.y}`).join(" ");
  const areaD = `${pathD} L ${width} ${height} L 0 ${height} Z`;

  return (
    <svg width="100%" height="80" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#635bff" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#635bff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill="url(#areaGrad)" />
      <path d={pathD} stroke="#635bff" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
}

// ── Bar chart for orders ──
function OrderBarChart() {
  const data = [
    { label: "Jan", value: 40 },
    { label: "Feb", value: 65 },
    { label: "Mar", value: 50 },
    { label: "Apr", value: 80 },
    { label: "May", value: 60 },
    { label: "Jun", value: 90 },
    { label: "Jul", value: 70 },
  ];
  const max = Math.max(...data.map((d) => d.value));
  const height = 100;

  return (
    <div className="flex items-end gap-2 h-[100px]">
      {data.map((d) => (
        <div key={d.label} className="flex flex-col items-center gap-1 flex-1">
          <div
            className="w-full rounded-t-sm bg-primary/80 hover:bg-primary transition-colors"
            style={{ height: `${(d.value / max) * height}px` }}
          />
          <span className="text-xs text-muted-foreground">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function AnalyticsDashboard() {
  const [topTab, setTopTab] = useState<"contents" | "sellers">("contents");

  const topPerforming = [
    { title: "The best hand made Denims", subtitle: "The best handmade Denims you can find in Lagos....", poster: "Olamade" },
    { title: "The best hand made Denims", subtitle: "The best handmade Denims you can find in Lagos....", poster: "Olamade" },
    { title: "The best hand made Denims", subtitle: "The best handmade Denims you can find in Lagos....", poster: "Olamade" },
    { title: "The best hand made Denims", subtitle: "The best handmade Denims you can find in Lagos....", poster: "Olamade" },
    { title: "The best hand made Denims", subtitle: "The best handmade Denims you can find in Lagos....", poster: "Olamade" },
  ];

  return (
    <div className="flex flex-col gap-4">

      {/* ── Row 1: 3 metric cards ── */}
      <div className="grid grid-cols-3 gap-4">

        {/* Card 1 — Total Users */}
        <div className="bg-white rounded-xl border border-border p-2 col-span-1">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-sm font-medium text-foreground">Total Users</p>
              <button className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                This week <ChevronDown size={11} />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <p className="text-3xl font-bold text-foreground">145,760</p>
            <span className="text-green-500 text-lg">▲</span>
          </div>
          <TotalUsersChart />
        </div>

        {/* Card 2 — New Users */}
        <div className="bg-white rounded-xl border border-border p-2">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-sm font-medium text-foreground">New Users</p>
              <button className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                This week <ChevronDown size={11} />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <p className="text-3xl font-bold text-foreground">28</p>
            <span className="text-green-500 text-lg">▲</span>
          </div>
          <SmoothWaveChart />
        </div>

        {/* Card 3 — Uploads */}
        <div className="bg-white rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-sm font-medium text-foreground">Uploads</p>
              <button className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                This week <ChevronDown size={11} />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <p className="text-3xl font-bold text-foreground">108</p>
            <span className="text-green-500 text-lg">▲</span>
          </div>
          <SmoothWaveChart />
        </div>
      </div>

      {/* ── Row 2: Revenue + Orders ── */}
      <div className="grid grid-cols-2 gap-4">

        {/* Revenue summary card */}
        <div className="bg-white rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-foreground">Revenue Summary</p>
              <p className="text-xs text-muted-foreground">Total earnings this period</p>
            </div>
            <button className="flex items-center gap-1 text-xs text-muted-foreground border border-border rounded px-2 py-1">
              This Month <ChevronDown size={11} />
            </button>
          </div>
          <div className="flex items-center gap-2 mb-1">
            <p className="text-3xl font-bold text-foreground">₦4,820,000</p>
            <span className="text-green-500 text-sm">▲</span>
          </div>
          <p className="text-xs text-green-600 mb-4">+12% from last month</p>
          <MiniLineChart />
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Orders</p>
              <p className="text-sm font-semibold text-foreground">1,240</p>
            </div>
            <div className="text-center border-x border-border">
              <p className="text-xs text-muted-foreground">Avg. Order</p>
              <p className="text-sm font-semibold text-foreground">₦3,887</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Refunds</p>
              <p className="text-sm font-semibold text-foreground">23</p>
            </div>
          </div>
        </div>

        {/* Order analytics card */}
        <div className="bg-white rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-foreground">Order Analytics</p>
              <p className="text-xs text-muted-foreground">Orders by month</p>
            </div>
            <button className="flex items-center gap-1 text-xs text-muted-foreground border border-border rounded px-2 py-1">
              This Year <ChevronDown size={11} />
            </button>
          </div>
          <div className="flex items-center gap-2 mb-4">
            <p className="text-3xl font-bold text-foreground">60,000</p>
            <span className="text-green-500 text-sm">▲</span>
            <span className="text-xs text-green-600">+9%</span>
          </div>
          <OrderBarChart />
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Delivered</p>
              <p className="text-sm font-semibold text-green-600">100</p>
            </div>
            <div className="text-center border-x border-border">
              <p className="text-xs text-muted-foreground">In Transit</p>
              <p className="text-sm font-semibold text-primary">600</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Pending</p>
              <p className="text-sm font-semibold text-orange-500">240</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Row 3: Top Performing + Users donut ── */}
      <div className="grid grid-cols-[1fr_380px] gap-4">

        {/* Top Performing card */}
        <div className="bg-white rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-muted-foreground" />
              <p className="text-sm font-medium text-foreground">Top Performing</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1 text-xs text-muted-foreground border border-border rounded px-2 py-1">
                <Calendar size={11} />
                Today <ChevronDown size={11} />
              </button>
              <button className="p-1 rounded border border-border hover:bg-muted transition-colors">
                <ArrowUpRight size={13} className="text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-4 border-b border-border">
            <button
              onClick={() => setTopTab("contents")}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px
                ${topTab === "contents"
                  ? "border-primary text-primary bg-primary/5 rounded-t-md"
                  : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
            >
              Contents
            </button>
            <button
              onClick={() => setTopTab("sellers")}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px
                ${topTab === "sellers"
                  ? "border-primary text-primary bg-primary/5 rounded-t-md"
                  : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
            >
              Sellers
            </button>
          </div>

          {/* List */}
          <div className="flex flex-col divide-y divide-border">
            {topPerforming.map((item, i) => (
              <div key={i} className="flex items-center gap-3 py-3">
                {/* Product image */}
                <div className="w-10 h-10 rounded-lg shrink-0 overflow-hidden">
                  <img
                    src="/images/denim.png"
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{item.subtitle}</p>
                </div>
                <p className="text-xs text-muted-foreground shrink-0">Posted by {item.poster}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Users donut chart card */}
        <div className="bg-white rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-foreground">Users</p>
            <button className="flex items-center gap-1 text-xs text-muted-foreground border border-border rounded px-2 py-1">
              This Month <ChevronDown size={11} />
            </button>
          </div>

          {/* Donut chart */}
          <div className="flex justify-center my-2">
            <DonutChart />
          </div>

          {/* Legend */}
          <div className="flex flex-col gap-3 mt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-primary" />
                <span className="text-sm text-muted-foreground">General Users</span>
              </div>
              <span className="text-sm font-semibold text-foreground">65.8%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-pink-500" />
                <span className="text-sm text-muted-foreground">Sellers</span>
              </div>
              <span className="text-sm font-semibold text-foreground">20.5%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
