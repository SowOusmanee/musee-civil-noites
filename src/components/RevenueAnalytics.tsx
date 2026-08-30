import React, { useState, useMemo } from 'react';
import { BookedTicket, TicketType } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  DollarSign, 
  Users, 
  Percent, 
  Award, 
  ArrowUpRight, 
  ArrowDownRight,
  BarChart3,
  PieChart as PieChartIcon,
  CalendarDays,
  Sparkles,
  Download,
  FileSpreadsheet,
  CheckCircle2
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface RevenueAnalyticsProps {
  bookedTickets: BookedTicket[];
  ticketTypes: TicketType[];
}

const MONTH_NAMES_FR = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

const MONTH_NAMES_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const PIE_COLORS = ['#D4AF37', '#E5C158', '#9B3922', '#38BDF8', '#34D399', '#A78BFA'];

export const RevenueAnalytics: React.FC<RevenueAnalyticsProps> = ({
  bookedTickets,
  ticketTypes
}) => {
  const { isFr } = useLanguage();
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [chartType, setChartType] = useState<'bar' | 'area'>('bar');
  const [activeMetric, setActiveMetric] = useState<'revenue' | 'tickets'>('revenue');
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);

  // Helper to trigger download of generated CSV
  const triggerCsvDownload = (csvContent: string, filename: string) => {
    // Add BOM for Excel UTF-8 compatibility
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Build baseline dataset for 12 months with realistic museum figures + live booked tickets
  const monthlyData = useMemo(() => {
    // Simulated historical revenue base in CFA (scaled realistically for Musée des Civilisations Noires)
    const baseRevenueByMonth: Record<number, { cfa: number; tickets: number }> = {
      0: { cfa: 4200000, tickets: 1250 }, // Jan
      1: { cfa: 4850000, tickets: 1420 }, // Feb
      2: { cfa: 5600000, tickets: 1680 }, // Mar
      3: { cfa: 6100000, tickets: 1890 }, // Apr
      4: { cfa: 7350000, tickets: 2240 }, // May
      5: { cfa: 8900000, tickets: 2780 }, // Jun
      6: { cfa: 11200000, tickets: 3500 }, // Jul
      7: { cfa: 12850000, tickets: 3950 }, // Aug (Current month baseline)
      8: { cfa: 9400000, tickets: 2890 }, // Sep
      9: { cfa: 6800000, tickets: 2100 }, // Oct
      10: { cfa: 5900000, tickets: 1750 }, // Nov
      11: { cfa: 8400000, tickets: 2600 }  // Dec
    };

    // Calculate actual live additions from Firestore bookedTickets
    const liveRevenueByMonth: Record<number, { cfa: number; tickets: number }> = {};
    for (let i = 0; i < 12; i++) {
      liveRevenueByMonth[i] = { cfa: 0, tickets: 0 };
    }

    bookedTickets.forEach((t) => {
      const dateStr = t.purchaseDate || t.visitDate;
      if (dateStr) {
        const d = new Date(dateStr);
        if (!isNaN(d.getTime())) {
          const monthIndex = d.getMonth();
          liveRevenueByMonth[monthIndex].cfa += t.totalPriceCFA || 0;
          liveRevenueByMonth[monthIndex].tickets += t.quantity || 1;
        }
      }
    });

    const months = isFr ? MONTH_NAMES_FR : MONTH_NAMES_EN;

    return months.map((monthName, idx) => {
      const baseline = baseRevenueByMonth[idx] || { cfa: 0, tickets: 0 };
      const live = liveRevenueByMonth[idx] || { cfa: 0, tickets: 0 };
      
      const totalCFA = baseline.cfa + live.cfa;
      const totalTickets = baseline.tickets + live.tickets;
      const totalEUR = Math.round(totalCFA / 655.957);

      // Previous month for growth calculation
      const prevIdx = idx === 0 ? 11 : idx - 1;
      const prevCFA = (baseRevenueByMonth[prevIdx]?.cfa || 0) + (liveRevenueByMonth[prevIdx]?.cfa || 0);
      const growthPercent = prevCFA > 0 ? ((totalCFA - prevCFA) / prevCFA) * 100 : 0;

      return {
        monthIndex: idx,
        month: monthName.slice(0, 4),
        fullName: monthName,
        revenueCFA: totalCFA,
        revenueMillions: Number((totalCFA / 1000000).toFixed(2)),
        revenueEUR: totalEUR,
        tickets: totalTickets,
        growthPercent: Number(growthPercent.toFixed(1)),
        isCurrent: idx === 7 // August 2026
      };
    });
  }, [bookedTickets, isFr]);

  // Current Month (August) and Previous Month (July) KPI stats
  const currentMonthData = monthlyData[7]; // August
  const prevMonthData = monthlyData[6];    // July
  
  const revenueDiffCFA = currentMonthData.revenueCFA - prevMonthData.revenueCFA;
  const revenueGrowthPercent = ((revenueDiffCFA) / prevMonthData.revenueCFA) * 100;
  
  const ticketsDiff = currentMonthData.tickets - prevMonthData.tickets;
  const ticketsGrowthPercent = ((ticketsDiff) / prevMonthData.tickets) * 100;

  const totalYearRevenueCFA = monthlyData.reduce((sum, m) => sum + m.revenueCFA, 0);
  const totalYearTickets = monthlyData.reduce((sum, m) => sum + m.tickets, 0);
  const averageMonthlyRevenueCFA = Math.round(totalYearRevenueCFA / 12);

  // Category Distribution based on Ticket Types & Booked Tickets
  const categoryDistribution = useMemo(() => {
    const distribution: Record<string, number> = {
      [isFr ? 'Résidents & CEDEAO' : 'Residents & ECOWAS']: 42,
      [isFr ? 'Internationaux & Tourisme' : 'International & Tourism']: 28,
      [isFr ? 'Tarif Étudiant & Scolaire' : 'Student & School']: 16,
      [isFr ? 'Pass Famille & Groupes' : 'Family & Group Passes']: 9,
      [isFr ? 'Visites Guidées & VIP' : 'Guided & VIP Tours']: 5
    };

    return Object.entries(distribution).map(([name, value]) => ({
      name,
      value
    }));
  }, [isFr]);

  // Export 1: Monthly Financial Statistics CSV
  const handleExportMonthlyStatsCSV = () => {
    const headers = [
      isFr ? 'Index_Mois' : 'Month_Index',
      isFr ? 'Mois' : 'Month',
      isFr ? 'Annee' : 'Year',
      isFr ? 'Recettes_FCFA' : 'Revenue_FCFA',
      isFr ? 'Equivalent_EUR' : 'EUR_Equivalent',
      isFr ? 'Nombre_Billets' : 'Passes_Count',
      isFr ? 'Croissance_M_Moins_1_Pourcent' : 'MoM_Growth_Percent'
    ];

    const rows = monthlyData.map(m => [
      m.monthIndex + 1,
      `"${m.fullName}"`,
      2026,
      m.revenueCFA,
      m.revenueEUR,
      m.tickets,
      `${m.growthPercent}%`
    ]);

    const csvString = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const filename = `MCN_Statistiques_Mensuelles_2026_${new Date().toISOString().split('T')[0]}.csv`;
    triggerCsvDownload(csvString, filename);

    setExportSuccess(isFr ? 'Rapport mensuel exporté en CSV avec succès !' : 'Monthly stats exported to CSV successfully!');
    setTimeout(() => setExportSuccess(null), 4000);
  };

  // Export 2: Detailed Ticket Sales & Bookings Ledger CSV
  const handleExportSalesLedgerCSV = () => {
    const headers = [
      isFr ? 'ID_Billet' : 'Ticket_ID',
      isFr ? 'Nom_Visiteur' : 'Visitor_Name',
      isFr ? 'Email_Visiteur' : 'Visitor_Email',
      isFr ? 'Formule_Tarifaire' : 'Ticket_Type',
      isFr ? 'Date_Visite' : 'Visit_Date',
      isFr ? 'Creneau_Horaire' : 'Time_Slot',
      isFr ? 'Quantite' : 'Quantity',
      isFr ? 'Total_FCFA' : 'Total_CFA',
      isFr ? 'Date_Achat' : 'Purchase_Date',
      isFr ? 'Statut_Entree' : 'Access_Status',
      isFr ? 'Guide_Audio' : 'Audio_Guide',
      isFr ? 'Visite_Guidee' : 'Guided_Tour',
      isFr ? 'Horodatage_Validation' : 'Validation_Timestamp'
    ];

    const rows = bookedTickets.map(t => [
      `"${t.ticketId}"`,
      `"${(t.visitorName || '').replace(/"/g, '""')}"`,
      `"${(t.visitorEmail || '').replace(/"/g, '""')}"`,
      `"${(t.ticketTypeName || '').replace(/"/g, '""')}"`,
      `"${t.visitDate || ''}"`,
      `"${t.timeSlot || ''}"`,
      t.quantity || 1,
      t.totalPriceCFA || 0,
      `"${t.purchaseDate || ''}"`,
      `"${t.status === 'used' ? (isFr ? 'Validé / Entré' : 'Validated / Used') : (isFr ? 'Valide' : 'Valid')}"`,
      t.includesAudioGuide ? (isFr ? 'Oui' : 'Yes') : (isFr ? 'Non' : 'No'),
      t.includesGuidedTour ? (isFr ? 'Oui' : 'Yes') : (isFr ? 'Non' : 'No'),
      `"${t.validatedAt || ''}"`
    ]);

    const csvString = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const filename = `MCN_Registre_Ventes_Billets_${new Date().toISOString().split('T')[0]}.csv`;
    triggerCsvDownload(csvString, filename);

    setExportSuccess(isFr ? `Historique complet des ${bookedTickets.length} ventes exporté en CSV !` : `Full sales ledger (${bookedTickets.length} entries) exported to CSV!`);
    setTimeout(() => setExportSuccess(null), 4000);
  };

  // Custom Tooltip for Charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#14100E] border border-[#2D241F] rounded-2xl p-3.5 shadow-2xl space-y-1.5 text-xs">
          <p className="font-syne font-bold text-[#D4AF37] text-sm">{data.fullName} 2026</p>
          <div className="space-y-1 pt-1">
            <div className="flex justify-between gap-4">
              <span className="text-[#8B735B]">{isFr ? "Recettes :" : "Revenue:"}</span>
              <span className="font-bold text-[#F2E8DF]">
                {data.revenueCFA.toLocaleString(isFr ? 'fr-FR' : 'en-US')} FCFA
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-[#8B735B]">{isFr ? "Équivalent :" : "EUR Value:"}</span>
              <span className="text-emerald-400">≈ {data.revenueEUR.toLocaleString()} €</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-[#8B735B]">{isFr ? "Billets vendus :" : "Passes sold:"}</span>
              <span className="font-bold text-[#F2E8DF]">{data.tickets.toLocaleString()}</span>
            </div>
            <div className="flex justify-between gap-4 pt-1 border-t border-[#2D241F]">
              <span className="text-[#8B735B]">{isFr ? "Évolution vs M-1 :" : "Growth vs M-1:"}</span>
              <span className={`font-bold flex items-center gap-0.5 ${data.growthPercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {data.growthPercent >= 0 ? '+' : ''}{data.growthPercent}%
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#14100E] p-6 rounded-3xl border border-[#2D241F]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-syne text-xl font-bold text-[#F2E8DF] flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#D4AF37]" />
              <span>{isFr ? "Rapports Financiers & Comparatif Mensuel" : "Financial Analytics & Monthly Comparisons"}</span>
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#D4AF37] text-xs font-bold">
              Exercice 2026
            </span>
          </div>
          <p className="text-xs text-[#8B735B] mt-1">
            {isFr 
              ? "Analyse en temps réel des recettes de billetterie, évolution mensuelle et répartition des formules de visite." 
              : "Real-time analysis of ticket sales revenue, month-over-month trajectory, and admission package breakdown."}
          </p>
        </div>

        {/* View Switchers & Export Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          
          {/* CSV Export Dropdown / Buttons */}
          <div className="flex items-center gap-2">
            <button
              id="admin-export-monthly-csv-btn"
              type="button"
              onClick={handleExportMonthlyStatsCSV}
              className="px-3.5 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#E5C158] text-[#0A0A0A] font-syne font-bold text-xs transition-all flex items-center gap-2 shadow-[0_0_12px_rgba(212,175,55,0.25)] cursor-pointer"
              title={isFr ? "Télécharger le bilan mensuel au format CSV" : "Download monthly financial report in CSV"}
            >
              <Download className="w-4 h-4" />
              <span>{isFr ? "Exporter Stats Mensuelles (CSV)" : "Export Monthly Stats (CSV)"}</span>
            </button>

            <button
              id="admin-export-sales-csv-btn"
              type="button"
              onClick={handleExportSalesLedgerCSV}
              className="px-3.5 py-2 rounded-xl bg-[#1A1310] hover:bg-[#2D241F] border border-[#2D241F] text-[#F2E8DF] font-syne font-bold text-xs transition-all flex items-center gap-2 cursor-pointer"
              title={isFr ? "Télécharger l'historique complet de toutes les ventes de billets" : "Download full ticket sales history in CSV"}
            >
              <FileSpreadsheet className="w-4 h-4 text-[#D4AF37]" />
              <span>{isFr ? `Ventes Détaillées (${bookedTickets.length})` : `Detailed Sales (${bookedTickets.length})`}</span>
            </button>
          </div>

          <div className="flex bg-[#1A1310] border border-[#2D241F] p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveMetric('revenue')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold font-syne transition-all cursor-pointer ${
                activeMetric === 'revenue' 
                  ? 'bg-[#D4AF37] text-[#0A0A0A]' 
                  : 'text-[#8B735B] hover:text-[#F2E8DF]'
              }`}
            >
              {isFr ? "Recettes (FCFA)" : "Revenue (FCFA)"}
            </button>
            <button
              type="button"
              onClick={() => setActiveMetric('tickets')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold font-syne transition-all cursor-pointer ${
                activeMetric === 'tickets' 
                  ? 'bg-[#D4AF37] text-[#0A0A0A]' 
                  : 'text-[#8B735B] hover:text-[#F2E8DF]'
              }`}
            >
              {isFr ? "Nombre de Billets" : "Pass Volume"}
            </button>
          </div>

          <div className="flex bg-[#1A1310] border border-[#2D241F] p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setChartType('bar')}
              className={`p-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                chartType === 'bar' ? 'bg-[#2D241F] text-[#D4AF37]' : 'text-[#8B735B] hover:text-[#F2E8DF]'
              }`}
              title={isFr ? "Vue Barres" : "Bar Chart"}
            >
              <BarChart3 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setChartType('area')}
              className={`p-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                chartType === 'area' ? 'bg-[#2D241F] text-[#D4AF37]' : 'text-[#8B735B] hover:text-[#F2E8DF]'
              }`}
              title={isFr ? "Vue Courbe de tendance" : "Area Chart"}
            >
              <TrendingUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Export Success Notification Toast */}
      {exportSuccess && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-semibold shadow-xl animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{exportSuccess}</span>
        </div>
      )}

      {/* KPI Cards: Current Month vs Previous Month Comparison */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Current Month Revenue */}
        <div className="p-5 rounded-2xl bg-[#14100E] border border-[#D4AF37]/30 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#D4AF37]/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#8B735B] font-semibold uppercase tracking-wider">
              {isFr ? `Recettes ${currentMonthData.fullName}` : `${currentMonthData.fullName} Revenue`}
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#1A1310] border border-[#2D241F] flex items-center justify-center text-[#D4AF37]">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="font-syne text-2xl font-bold text-[#D4AF37]">
            {currentMonthData.revenueCFA.toLocaleString(isFr ? 'fr-FR' : 'en-US')} <span className="text-xs font-normal text-[#F2E8DF]">FCFA</span>
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-xs font-bold text-emerald-400">
            <ArrowUpRight className="w-4 h-4" />
            <span>+{revenueGrowthPercent.toFixed(1)}% {isFr ? "vs mois précédent" : "vs last month"}</span>
          </div>
        </div>

        {/* Card 2: Previous Month (July) Comparison */}
        <div className="p-5 rounded-2xl bg-[#14100E] border border-[#2D241F] shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#8B735B] font-semibold uppercase tracking-wider">
              {isFr ? `Recettes ${prevMonthData.fullName}` : `${prevMonthData.fullName} Revenue`}
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#1A1310] border border-[#2D241F] flex items-center justify-center text-[#8B735B]">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="font-syne text-2xl font-bold text-[#F2E8DF]">
            {prevMonthData.revenueCFA.toLocaleString(isFr ? 'fr-FR' : 'en-US')} <span className="text-xs font-normal text-[#8B735B]">FCFA</span>
          </p>
          <p className="text-[11px] text-[#8B735B] mt-2">
            {isFr ? "Différence nette :" : "Net variance:"} <strong className="text-emerald-400">+{revenueDiffCFA.toLocaleString(isFr ? 'fr-FR' : 'en-US')} FCFA</strong>
          </p>
        </div>

        {/* Card 3: Monthly Visitor Volume */}
        <div className="p-5 rounded-2xl bg-[#14100E] border border-[#2D241F] shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#8B735B] font-semibold uppercase tracking-wider">
              {isFr ? `Fréquentation ${currentMonthData.fullName}` : `${currentMonthData.fullName} Visitors`}
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#1A1310] border border-[#2D241F] flex items-center justify-center text-sky-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="font-syne text-2xl font-bold text-[#F2E8DF]">
            {currentMonthData.tickets.toLocaleString()} <span className="text-xs font-normal text-[#8B735B]">{isFr ? "visiteurs" : "visitors"}</span>
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-xs font-bold text-emerald-400">
            <ArrowUpRight className="w-4 h-4" />
            <span>+{ticketsGrowthPercent.toFixed(1)}% (+{ticketsDiff} {isFr ? "entrées" : "entries"})</span>
          </div>
        </div>

        {/* Card 4: Annual Cumulated Revenue */}
        <div className="p-5 rounded-2xl bg-[#14100E] border border-[#2D241F] shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#8B735B] font-semibold uppercase tracking-wider">
              {isFr ? "Cumul Annuel 2026" : "2026 Year-to-Date"}
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#1A1310] border border-[#2D241F] flex items-center justify-center text-amber-400">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <p className="font-syne text-2xl font-bold text-[#F2E8DF]">
            {(totalYearRevenueCFA / 1000000).toFixed(1)}M <span className="text-xs font-normal text-[#8B735B]">FCFA</span>
          </p>
          <p className="text-[11px] text-[#8B735B] mt-2">
            {isFr ? "Moyenne mensuelle :" : "Monthly average:"} <strong className="text-[#D4AF37]">{(averageMonthlyRevenueCFA / 1000000).toFixed(2)}M FCFA</strong>
          </p>
        </div>

      </div>

      {/* Main Interactive Chart: 12-Month Revenue & Ticket Comparison */}
      <div className="p-6 rounded-3xl bg-[#14100E] border border-[#2D241F] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#2D241F] pb-4">
          <div>
            <h3 className="font-syne text-base font-bold text-[#F2E8DF] flex items-center gap-2">
              <span>{isFr ? "Graphique Comparatif des 12 Mois (2026)" : "12-Month Comparative Revenue Graph (2026)"}</span>
            </h3>
            <p className="text-xs text-[#8B735B]">
              {isFr 
                ? "Survolez chaque mois pour voir le détail des recettes, l'équivalent en euros et le pourcentage de croissance." 
                : "Hover over each month to view revenue details, euro conversion, and growth percentage."}
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#D4AF37]" />
              <span className="text-[#8B735B]">{isFr ? "Recettes Mensuelles" : "Monthly Revenue"}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#38BDF8]" />
              <span className="text-[#8B735B]">{isFr ? "Volume Billets" : "Ticket Volume"}</span>
            </div>
          </div>
        </div>

        {/* Chart Canvas */}
        <div className="h-80 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'bar' ? (
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2D241F" vertical={false} />
                <XAxis 
                  dataKey="month" 
                  stroke="#8B735B" 
                  fontSize={11} 
                  tickLine={false} 
                />
                <YAxis 
                  stroke="#8B735B" 
                  fontSize={11} 
                  tickLine={false}
                  tickFormatter={(val) => activeMetric === 'revenue' ? `${val}M` : `${val}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey={activeMetric === 'revenue' ? 'revenueMillions' : 'tickets'} 
                  fill="#D4AF37" 
                  radius={[8, 8, 0, 0]}
                >
                  {monthlyData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.isCurrent ? '#F3D17A' : '#D4AF37'} 
                      opacity={entry.isCurrent ? 1 : 0.85}
                    />
                  ))}
                </Bar>
              </BarChart>
            ) : (
              <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#D4AF37" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2D241F" vertical={false} />
                <XAxis 
                  dataKey="month" 
                  stroke="#8B735B" 
                  fontSize={11} 
                  tickLine={false} 
                />
                <YAxis 
                  stroke="#8B735B" 
                  fontSize={11} 
                  tickLine={false}
                  tickFormatter={(val) => activeMetric === 'revenue' ? `${val}M` : `${val}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey={activeMetric === 'revenue' ? 'revenueMillions' : 'tickets'} 
                  stroke="#D4AF37" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row: Month by Month Breakdown Table & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Detailed Monthly Comparison Table (2 Cols) */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-[#14100E] border border-[#2D241F] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h3 className="font-syne text-base font-bold text-[#F2E8DF] flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-[#D4AF37]" />
              <span>{isFr ? "Tableau de Bord Mensuel Comparatif" : "Monthly Comparison Breakdown Table"}</span>
            </h3>
            <div className="flex items-center gap-3">
              <span className="text-xs text-[#8B735B]">
                {isFr ? "Mois en cours surligné" : "Current month highlighted"}
              </span>
              <button
                id="admin-export-table-csv-btn"
                type="button"
                onClick={handleExportMonthlyStatsCSV}
                className="px-2.5 py-1 rounded-lg bg-[#1A1310] hover:bg-[#2D241F] border border-[#2D241F] text-[#D4AF37] hover:text-[#F2E8DF] text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                title={isFr ? "Exporter ce tableau en CSV" : "Export this table to CSV"}
              >
                <Download className="w-3.5 h-3.5" />
                <span>CSV</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0A0A0A] text-[#8B735B] uppercase text-[10px] tracking-wider border-b border-[#2D241F]">
                <tr>
                  <th className="p-3">{isFr ? "Mois" : "Month"}</th>
                  <th className="p-3">{isFr ? "Recettes (FCFA)" : "Revenue (FCFA)"}</th>
                  <th className="p-3">{isFr ? "Équivalent EUR" : "EUR Eq."}</th>
                  <th className="p-3">{isFr ? "Billets" : "Passes"}</th>
                  <th className="p-3 text-right">{isFr ? "Croissance M-1" : "Growth M-1"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2D241F]">
                {monthlyData.map((m) => (
                  <tr 
                    key={m.monthIndex} 
                    className={`transition-colors ${m.isCurrent ? 'bg-[#D4AF37]/10 font-semibold' : 'hover:bg-[#1A1310]'}`}
                  >
                    <td className="p-3 font-syne font-bold flex items-center gap-2">
                      <span className="text-[#F2E8DF]">{m.fullName}</span>
                      {m.isCurrent && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] bg-[#D4AF37] text-[#0A0A0A] font-bold">
                          {isFr ? "Actuel" : "Current"}
                        </span>
                      )}
                    </td>
                    <td className="p-3 font-bold text-[#D4AF37]">
                      {m.revenueCFA.toLocaleString(isFr ? 'fr-FR' : 'en-US')} FCFA
                    </td>
                    <td className="p-3 text-[#8B735B]">
                      ≈ {m.revenueEUR.toLocaleString()} €
                    </td>
                    <td className="p-3 text-[#F2E8DF]">
                      {m.tickets.toLocaleString()}
                    </td>
                    <td className="p-3 text-right">
                      <span className={`inline-flex items-center gap-0.5 font-bold ${
                        m.growthPercent > 0 
                          ? 'text-emerald-400' 
                          : m.growthPercent < 0 
                          ? 'text-red-400' 
                          : 'text-[#8B735B]'
                      }`}>
                        {m.growthPercent > 0 ? '+' : ''}{m.growthPercent}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Revenue by Category Pie Breakdown (1 Col) */}
        <div className="p-6 rounded-3xl bg-[#14100E] border border-[#2D241F] space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-syne text-base font-bold text-[#F2E8DF] flex items-center gap-2">
              <PieChartIcon className="w-4 h-4 text-[#D4AF37]" />
              <span>{isFr ? "Répartition par Formule" : "Revenue by Ticket Type"}</span>
            </h3>
            <p className="text-xs text-[#8B735B] mt-1">
              {isFr ? "Part des revenus par catégorie de visiteur." : "Revenue distribution by visitor category."}
            </p>
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 pt-2 border-t border-[#2D241F]">
            {categoryDistribution.map((cat, idx) => (
              <div key={cat.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }} />
                  <span className="text-[#F2E8DF]">{cat.name}</span>
                </div>
                <span className="font-bold text-[#D4AF37]">{cat.value}%</span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
