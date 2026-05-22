// src/components/Dashboard/Dashboard.jsx
import React, { useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, BarChart, Bar
} from "recharts";
import "../css/Dashboard.css";
import api from "../../axios";

const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

/* ---------------- CONFIG: tweak thresholds here ---------------- */
const INSIGHT_CONFIG = {
  claimRateWarn: 0.3,
  claimRateDanger: 0.7,
  lowCoveragePct: 0.2,
  spikeFactor: 2.0,
  monthsToCompare: 3,
  pendingRequestsThreshold: 5,
};
/* ---------------------------------------------------------------- */

// Full-amount formatter (no K/M shortening)
function formatPeso(value) {
  if (value == null || value === "" || isNaN(Number(value))) return "₱0.00";
  const n = Number(value);
  const sign = n < 0 ? "-" : "";
  const abs = Math.abs(n);
  return `${sign}₱${abs.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

function currencyTooltipFormatter(value) {
  return [formatPeso(value), "Amount"];
}

export default function Dashboard() {
  // core datasets
  const [events, setEvents] = useState([]);
  const [federationMembers, setFederationMembers] = useState([]);
  const [damayanMembers, setDamayanMembers] = useState([]);

  // derived / charts
  const [federationJoinData, setFederationJoinData] = useState([]);
  const [damayanJoinData, setDamayanJoinData] = useState([]);
  const [claimRecords, setClaimRecords] = useState([]);
  const [damayanPayments, setDamayanPayments] = useState([]);
  const [damayanTotalAllocated, setDamayanTotalAllocated] = useState(0);

  const [topBarangays, setTopBarangays] = useState([]);
  const [damayanBarangayData, setDamayanBarangayData] = useState([]);
  const [allocatedVsClaimedTrend, setAllocatedVsClaimedTrend] = useState([]);

  // age distribution
  const [ageBuckets, setAgeBuckets] = useState([]); // will be array of {bucket, male, female}

  // summary cards / requests
  const [memberRequests, setMemberRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // FETCH ALL DATA
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [
          citizensRes,
          eventsRes,
          claimsRes,
          paymentsRes,
        ] = await Promise.allSettled([
          api.get("/SeniorConnect/citizens/"),
          api.get("/SeniorConnect/events/"),
          api.get("/SeniorConnect/damayanclaimrecords/"),
          api.get("/SeniorConnect/damayanpayment/"),
        ]);

        // Citizens
        let citizens = [];
        if (citizensRes.status === "fulfilled") {
          citizens = citizensRes.value.data || [];
        } else {
          console.warn("Failed fetching citizens:", citizensRes.reason);
        }
        setFederationMembers(citizens);

        // Events
        if (eventsRes.status === "fulfilled") {
          setEvents(eventsRes.value.data || []);
        } else setEvents([]);

        // Claims
        if (claimsRes.status === "fulfilled") {
          setClaimRecords(claimsRes.value.data || []);
        } else setClaimRecords([]);

        // Payments (with fallback tries)
        let payments = [];
        if (paymentsRes.status === "fulfilled") {
          payments = paymentsRes.value.data || [];
        } else {
          const tryPayEndpoints = [
            "/SeniorConnect/damayanpayment/",
            "/SeniorConnect/damayan_payments/",
            "/SeniorConnect/payments/",
          ];
          for (const ep of tryPayEndpoints) {
            try {
              const r = await api.get(ep);
              if (Array.isArray(r.data)) { payments = r.data; break; }
            } catch { /* ignore */ }
          }
        }
        setDamayanPayments(payments);

        // Member requests (fallback)
        let requests = [];
        const tryReqEndpoints = [
          "/SeniorConnect/memberrequests/",
          "/SeniorConnect/membershiprequests/",
          "/SeniorConnect/requests/",
        ];
        for (const ep of tryReqEndpoints) {
          try {
            const r = await api.get(ep);
            if (Array.isArray(r.data)) { requests = r.data; break; }
          } catch { /* ignore */ }
        }
        setMemberRequests(requests);

        // Damayan members derived from citizens
        const damayanList = citizens.filter(c => c.is_damayan_member);
        setDamayanMembers(damayanList);

        // Damayan total allocated = sum of all payments (robust field names)
        const totalAllocated = payments.reduce((sum, p) => {
          const amtRaw =
            p.amount_paid ?? p.amount ?? p.payment_amount ?? p.paid_amount ?? p.contribution_amount ?? 0;
          const amt = parseFloat(amtRaw || 0);
          return sum + (isNaN(amt) ? 0 : amt);
        }, 0);
        setDamayanTotalAllocated(isNaN(totalAllocated) ? 0 : totalAllocated);
      } catch (err) {
        console.error("Unexpected fetchAll error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // FEDERATION JOINS BY MONTH
  useEffect(() => {
    const counts = Array(12).fill(0);
    federationMembers.forEach(m => {
      const dateStr = m.date_issued || m.date_joined || m.created_at || m.date_created;
      if (!dateStr) return;
      const d = new Date(dateStr);
      if (!isNaN(d)) counts[d.getMonth()]++;
    });
    setFederationJoinData(monthNames.map((m, i) => ({ month: m, value: counts[i] || 0 })));
  }, [federationMembers]);

  // DAMAYAN JOINS BY MONTH
  useEffect(() => {
    const counts = Array(12).fill(0);
    federationMembers.forEach(m => {
      const dateStr = m.date_damayan_joined || m.damayan_joined_at;
      if (!dateStr) return;
      const d = new Date(dateStr);
      if (!isNaN(d)) counts[d.getMonth()]++;
    });
    setDamayanJoinData(monthNames.map((m, i) => ({ month: m, value: counts[i] || 0 })));
  }, [federationMembers]);

  // COMBINED MULTI-LINE JOIN DATA
  const combinedJoinData = monthNames.map((m, i) => ({
    month: m,
    Federation: federationJoinData[i]?.value || 0,
    Damayan: damayanJoinData[i]?.value || 0
  }));

  // CLAIM TREND (monthly) from claimRecords
  const claimTrendData = monthNames.map((m, i) => {
    const total = claimRecords
      .filter(rec => {
        const d = new Date(rec.date_released || rec.released_at || rec.created_at);
        return !isNaN(d) && d.getMonth() === i;
      })
      .reduce((sum, rec) => sum + parseFloat(rec.claim_amount || rec.amount || 0), 0);

    return { month: m, amount: total };
  });

  // TOTAL CLAIMED & AVAILABLE BALANCE
// FULL released amount to citizens
const totalReleased = claimRecords.reduce(
  (sum, rec) =>
    sum + parseFloat(rec.claim_amount || rec.amount || 0),
  0
);

// Damayan share only (HALF)
const totalClaimed = totalReleased / 2;

// Budget office share
const budgetOfficeTotal = totalReleased / 2;

// Remaining Damayan balance
const availableBalance =
  damayanTotalAllocated - totalClaimed;

  const claimRate = damayanTotalAllocated > 0 ? totalClaimed / damayanTotalAllocated : 0;

  // ALLOCATED VS CLAIMED (last 12 months) using payments & claims by month
  useEffect(() => {
    const allocatedMonths = {};
    const claimedMonths = {};

    // allocated from payments — robust field names and fallback to current month if no date
    damayanPayments.forEach(p => {
      const dateStr = p.date_paid || p.paid_at || p.paid_on || p.created_at || p.timestamp || p.date || null;
      const amtRaw = p.amount_paid ?? p.amount ?? p.payment_amount ?? p.paid_amount ?? p.contribution_amount ?? 0;
      const amt = parseFloat(amtRaw || 0);
      const d = dateStr ? new Date(dateStr) : null;
      if (d && !isNaN(d) && !isNaN(amt)) {
        const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
        allocatedMonths[key] = (allocatedMonths[key] || 0) + amt;
      } else if (!isNaN(amt)) {
        const nowKey = `${(new Date()).getFullYear()}-${String((new Date()).getMonth()+1).padStart(2,"0")}`;
        allocatedMonths[nowKey] = (allocatedMonths[nowKey] || 0) + amt;
      }
    });

    // claimed from claimRecords — robust field names and fallback to current month if no date
    claimRecords.forEach(rec => {
      const dateStr = rec.date_released || rec.released_at || rec.released_on || rec.created_at || rec.timestamp || rec.date || null;
      const amtRaw = rec.claim_amount ?? rec.amount ?? rec.claimed_amount ?? 0;
      const amt = parseFloat(amtRaw || 0);
      const d = dateStr ? new Date(dateStr) : null;
      if (d && !isNaN(d) && !isNaN(amt)) {
        const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
        claimedMonths[key] = (claimedMonths[key] || 0) + amt;
      } else if (!isNaN(amt)) {
        const nowKey = `${(new Date()).getFullYear()}-${String((new Date()).getMonth()+1).padStart(2,"0")}`;
        claimedMonths[nowKey] = (claimedMonths[nowKey] || 0) + amt;
      }
    });

    // fallback: if walang allocated by month pero may totalAllocated, place it in current month
    const now = new Date();
    const keyNow = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}`;
    if (Object.keys(allocatedMonths).length === 0 && damayanTotalAllocated > 0) {
      allocatedMonths[keyNow] = damayanTotalAllocated;
    }

    const data = [];
    for (let i = 11; i >= 0; i--) {
      const dt = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const k = `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,"0")}`;
      data.push({
        month: `${monthNames[dt.getMonth()]} ${dt.getFullYear()}`,
        allocated: +(allocatedMonths[k] || 0).toFixed(2),
        claimed: +(claimedMonths[k] || 0).toFixed(2)
      });
    }

    setAllocatedVsClaimedTrend(data);
  }, [claimRecords, damayanPayments, damayanTotalAllocated]);

  // BARANGAY CHARTS
  useEffect(() => {
    if (!federationMembers.length) {
      setTopBarangays([]);
      setDamayanBarangayData([]);
      return;
    }

    const barangayMap = {};
    federationMembers.forEach(m => {
      const address = m.address || "";
      const barangay = address.split(",")[0]?.trim() || "Unknown";
      if (!barangay) return;
      if (!barangayMap[barangay]) barangayMap[barangay] = { count: 0, damayanCount: 0 };
      barangayMap[barangay].count++;
      if (m.is_damayan_member) barangayMap[barangay].damayanCount++;
    });

    const chartData = Object.entries(barangayMap).map(([barangay, d]) => ({
      barangay, count: d.count, damayanCount: d.damayanCount
    }));

    // sort descending by members, take top 10 (or less)
    const sorted = [...chartData].sort((a,b)=>b.count-a.count).slice(0,10);
    setTopBarangays(sorted);
    setDamayanBarangayData([...chartData].sort((a,b)=>b.damayanCount-a.damayanCount).slice(0,10));
  }, [federationMembers]);

  // AGE DISTRIBUTION (bins, male/female only, exclude unknown)
  useEffect(() => {
    // bins: 60-64, 65-69, 70-74, 75-79, 80+
    const buckets = [
      { bucket: "60-64", male: 0, female: 0 },
      { bucket: "65-69", male: 0, female: 0 },
      { bucket: "70-74", male: 0, female: 0 },
      { bucket: "75-79", male: 0, female: 0 },
      { bucket: "80+", male: 0, female: 0 },
    ];

    federationMembers.forEach(m => {
      const ageRaw = m.age ?? m.current_age ?? m.years ?? null;
      const sexRaw = (m.gender || m.sex || m.gender_identity || "").toString().toLowerCase();
      const age = ageRaw == null ? null : Number(ageRaw);
      if (isNaN(age) || age < 60) return; // skip non-seniors or invalid
      // gender: accept "male"/"m" and "female"/"f"
      let gender = null;
      if (/^(male|m)$/i.test(sexRaw)) gender = "male";
      else if (/^(female|f)$/i.test(sexRaw)) gender = "female";
      else return; // **exclude unknown/other** per request

      if (age >= 60 && age <= 64) {
        buckets[0][gender]++;
      } else if (age <= 69) {
        buckets[1][gender]++;
      } else if (age <= 74) {
        buckets[2][gender]++;
      } else if (age <= 79) {
        buckets[3][gender]++;
      } else {
        buckets[4][gender]++;
      }
    });

    setAgeBuckets(buckets);
  }, [federationMembers]);

  // SUMMARY CARD VALUES
  const totalMembers = federationMembers.length;
  const pendingRequests = memberRequests.filter(r => (r.status || r.request_status || "").toLowerCase() === "pending").length;
  const approvedRequests = memberRequests.filter(r => (r.status || r.request_status || "").toLowerCase() === "approved").length;
  const rejectedRequests = memberRequests.filter(r => (r.status || r.request_status || "").toLowerCase() === "rejected").length;

  // Recent requests (last 6)
  const recentRequests = [...memberRequests]
    .sort((a,b) => new Date(b.date_submitted || b.created_at || b.timestamp || 0) - new Date(a.date_submitted || a.created_at || a.timestamp || 0))
    .slice(0,6);

  // Activity feed: mix of events, claims, requests
  const activityItems = [
    ...recentRequests.map(r => ({
      type: "request",
      date: new Date(r.date_submitted || r.created_at || r.timestamp || 0),
      label: `${(r.status || r.request_status || "Pending").toString()} request`,
      detail: `${r.last_name || ""}, ${r.first_name || ""}`.trim() || r.email || "Membership request"
    })),
    ...claimRecords.slice(-5).map(c => ({
      type: "claim",
      date: new Date(c.date_released || c.released_at || c.created_at || 0),
      label: `Claim released`,
      detail: formatPeso(c.claim_amount || c.amount || 0)
    })),
    ...events.slice(-5).map(e => ({
      type: "event",
      date: new Date(e.date || e.created_at || 0),
      label: `Event: ${e.title || e.name || "Unnamed event"}`,
      detail: e.venue || e.location || ""
    })),
  ]
  .filter(item => !isNaN(item.date))
  .sort((a,b) => b.date - a.date)
  .slice(0,7);

  /* ---------------- DYNAMIC INSIGHTS ENGINE ---------------- */
  const computeInsights = () => {
    const out = [];

    if (damayanTotalAllocated <= 0) {
      out.push({ level: "info", text: "No Damayan payments recorded yet. Contributions data needed for financial insights." });
    } else {
      if (claimRate >= INSIGHT_CONFIG.claimRateDanger) {
        out.push({ level: "danger", text: `High claim utilization — ${Math.round(claimRate*100)}% of collected contributions have been claimed. Review fund sustainability.` });
      } else if (claimRate >= INSIGHT_CONFIG.claimRateWarn) {
        out.push({ level: "warn", text: `Moderate claim utilization — ${Math.round(claimRate*100)}% of contributions claimed.` });
      } else {
        out.push({ level: "info", text: `Damayan fund healthy — only ${Math.round(claimRate*100)}% of contributions claimed.` });
      }
    }

    const overclaimed = allocatedVsClaimedTrend.filter(d => d.claimed > d.allocated);
    if (overclaimed.length > 0) {
      const samples = overclaimed.map(m => `${m.month} (${formatPeso(m.claimed)} claimed > ${formatPeso(m.allocated)} allocated)`).slice(0,3);
      out.push({ level: "danger", text: `Over-claimed months detected: ${samples.join(", ")}.` });
    }

    try {
      const allocVals = allocatedVsClaimedTrend.map(d => d.allocated);
      const claimVals = allocatedVsClaimedTrend.map(d => d.claimed);
      const n = allocVals.length;
      const m = INSIGHT_CONFIG.monthsToCompare;
      if (n >= m + 1) {
        const lastAlloc = allocVals[n-1] || 0;
        const prevAllocAvg = allocVals.slice(n-1-m, n-1).reduce((s,x)=>s+(x||0),0)/m;
        if (prevAllocAvg > 0 && lastAlloc > prevAllocAvg * INSIGHT_CONFIG.spikeFactor) {
          out.push({ level: "warn", text: `Payment spike: latest allocated (${formatPeso(lastAlloc)}) > ${INSIGHT_CONFIG.spikeFactor}× previous ${m}-month average (${formatPeso(prevAllocAvg)}).` });
        }

        const lastClaim = claimVals[n-1] || 0;
        const prevClaimAvg = claimVals.slice(n-1-m, n-1).reduce((s,x)=>s+(x||0),0)/m;
        if (prevClaimAvg > 0 && lastClaim > prevClaimAvg * INSIGHT_CONFIG.spikeFactor) {
          out.push({ level: "warn", text: `Claim spike: latest claims (${formatPeso(lastClaim)}) > ${INSIGHT_CONFIG.spikeFactor}× previous ${m}-month average (${formatPeso(prevClaimAvg)}).` });
        }
      }
    } catch (e) { /* ignore */ }

    try {
      const low = [];
      const merged = [...topBarangays];
      merged.forEach(b => {
        const total = b.count || 0;
        const damayan = b.damayanCount || 0;
        if (total >= 5) {
          const pct = total > 0 ? damayan / total : 0;
          if (pct < INSIGHT_CONFIG.lowCoveragePct) {
            low.push(`${b.barangay} (${Math.round(pct*100)}% coverage)`);
          }
        }
      });
      if (low.length > 0) {
        out.push({ level: "warn", text: `Low Damayan coverage in barangays: ${[...new Set(low)].slice(0,4).join(", ")}.` });
      }
    } catch (e) { /* ignore */ }

    if (pendingRequests >= INSIGHT_CONFIG.pendingRequestsThreshold) {
      out.push({ level: "warn", text: `There are ${pendingRequests} pending membership requests — please review.` });
    } else if (pendingRequests > 0) {
      out.push({ level: "info", text: `${pendingRequests} pending membership request(s).` });
    }

    if (totalMembers > 0) {
      const coveragePct = (damayanMembers.length / totalMembers) * 100;
      out.push({ level: "info", text: `Damayan penetration: ${coveragePct.toFixed(1)}% of registered seniors.` });
    }

    const seen = new Set();
    const uniq = out.filter(i => { if (seen.has(i.text)) return false; seen.add(i.text); return true; });
    const priority = { danger: 2, warn: 1, info: 0 };
    uniq.sort((a,b) => priority[b.level] - priority[a.level]);

    return uniq;
  };

  const insights = computeInsights();

  // Top barangays y-axis helper:
  const topMaxCount = topBarangays && topBarangays.length
    ? Math.max(...topBarangays.map(b => b.count || 0), 1)
    : 1;
  const yAxisMax = Math.max(4, Math.ceil(topMaxCount * 1.4)); // ensure some headroom

  // --- NEW: map ageBuckets -> data used by chart
  // ageBuckets: [{bucket:"60-64", male: n, female: m}, ...]
  const ageDistributionData = ageBuckets.map(b => ({
    ageRange: b.bucket,
    male: b.male || 0,
    female: b.female || 0
  }));

  return (
    <div className="admindb-container">
      {/* HEADER */}
      <div className="admindb-header">
        <h1>Admin Dashboard</h1>
        <p className="admindb-subtitle">Overview · Members · Damayan · Events</p>
        <hr className="admindb-header-line" />
      </div>

      {/* SUMMARY CARDS - ROW 1 */}
      <div className="admindb-cards row1">
        <div className="admindb-card"><div className="card-title">Total Senior Citizens</div><div className="card-value">{loading ? "…" : totalMembers}</div></div>
        <div className="admindb-card"><div className="card-title">Pending Requests</div><div className="card-value">{loading ? "…" : pendingRequests}</div></div>
        <div className="admindb-card"><div className="card-title">Approved Requests</div><div className="card-value">{loading ? "…" : approvedRequests}</div></div>
        <div className="admindb-card"><div className="card-title">Damayan Members</div><div className="card-value">{loading ? "…" : damayanMembers.length}</div></div>
        <div className="admindb-card big">
          <div className="card-title">
            Damayan Total Collected
          </div>

          <div className="card-value">
            {loading ? "…" : formatPeso(damayanTotalAllocated)}
          </div>

          <div className="card-value-small">
            All-time contributions
          </div>
        </div>
      
      </div>

      

      {/* Top insights strip (show up to 3) */}
      <div style={{ display: "flex", gap: 12, marginTop: 10, marginBottom: 12 }}>
        {insights.slice(0,3).map((ins, idx) => (
          <div key={idx} style={{
            flex: 1,
            background: ins.level === "danger" ? "#fff1f0" : ins.level === "warn" ? "#fffbeb" : "#f0f9ff",
            border: ins.level === "danger" ? "1px solid #fecaca" : ins.level === "warn" ? "1px solid #fde68a" : "1px solid #bfdbfe",
            borderRadius: 10,
            padding: 10
          }}>
            <div style={{ fontSize: 12, color: "#374151", fontWeight: 700, marginBottom: 6 }}>{ins.level.toUpperCase()}</div>
            <div style={{ fontSize: 14, color: "#0f172a" }}>{ins.text}</div>
          </div>
        ))}
      </div>

      {/* ===================== ROW 1 ===================== */}
      <div className="admindb-chart-row">

        {/* FEDERATION VS DAMAYAN JOINS */}
        <div className="admindb-chart-section">
          <h3>Federation vs Damayan Joins (Monthly)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={combinedJoinData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="Federation" stroke="#2563eb" strokeWidth={3} />
              <Line type="monotone" dataKey="Damayan" stroke="#f59f00" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* ALLOCATED VS CLAIMED FUNDS */}
        <div className="admindb-chart-section">
          <h3>Allocated vs Claimed Funds (Last 12 Months)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={allocatedVsClaimedTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={formatPeso} />
              <Tooltip formatter={currencyTooltipFormatter} />
              <Legend />
              <Line type="monotone" dataKey="allocated" stroke="#4dabf7" strokeWidth={3} />
              <Line type="monotone" dataKey="claimed" stroke="#f03e3e" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>

      </div>
      {/* ===================== END ROW 1 ===================== */}

      <div className="admindb-chart-row" style={{ display: "flex", gap: "24px", alignItems: "stretch" }}>

        {/* TOP BARANGAYS — 70% WIDTH */}
        <div className="admindb-chart-section" style={{ flex: "0 0 60%" }}>
          <h3>Top Barangays (Members vs Damayan)</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={topBarangays}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="barangay" angle={-25} textAnchor="end" height={80} />
              <YAxis domain={[0, yAxisMax]} allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" name="Members" fill="#2563eb" />
              <Bar dataKey="damayanCount" name="Damayan Members" fill="#f59f00" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* SENIOR AGE DISTRIBUTION — 30% WIDTH */}
        <div className="admindb-chart-section" style={{ flex: "0 0 34%" }}>
          <h3>Senior Age Distribution</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={ageDistributionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="ageRange" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="male" name="Male" fill="#2563eb" />
              <Bar dataKey="female" name="Female" fill="#ec4899" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        </div>



      {/* RECENT REQUESTS + ACTIVITY + INSIGHTS */}
      <div className="admindb-chart-row">
        {/* Recent Membership Requests */}
        {/* Recent Membership Requests */}
        {/* Recent Activities */}
        <div className="admindb-chart-section">
          <h3>Recent Activities</h3>

          <div className="admindb-activity" style={{ marginTop: 6 }}>
            {activityItems.length === 0 ? (
              <div className="admindb-activity-empty">No recent activity.</div>
            ) : (
              <ul className="admindb-activity-list" style={{ maxHeight: 320 }}>
                {activityItems.map((item, idx) => (
                  <li key={idx} className="admindb-activity-item">
                    
                    {/* colored dot */}
                    <div
                      className="activity-dot"
                      style={{
                        width: 12,
                        height: 12,
                        marginTop: 6,
                        background:
                          item.type === "request" ? "#2563eb" :
                          item.type === "claim" ? "#f97316" :
                          item.type === "event" ? "#10b981" :
                          "#9ca3af"
                      }}
                    />

                    <div className="activity-main">
                      {/* Title */}
                      <div className="activity-label">{item.label}</div>

                      {/* Subtext */}
                      {item.detail && (
                        <div className="activity-detail">{item.detail}</div>
                      )}
                    </div>

                    {/* Timestamp */}
                    <div className="activity-time">
                      {item.date.toLocaleDateString()}
                      <br />
                      <span>
                        {item.date.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>



        {/* Activity & Insights */}
        <div className="admindb-chart-section">
          <h3>Recent Events</h3>


          {/* Recent Events panel */}
          <div className="admindb-activity">
            {events.length === 0 ? (
              <div className="admindb-activity-empty">No recent events.</div>
            ) : (
              <ul className="admindb-activity-list">
                {events
                  .slice()
                  .sort((a, b) => new Date(b.date || b.created_at) - new Date(a.date || a.created_at))
                  .slice(0, 6)
                  .map((evt, idx) => (
                    <li key={idx} className="admindb-activity-item">
                      <div className="activity-dot activity-event" />
                      <div className="activity-main">
                        <div className="activity-label">{evt.title || evt.name || "Untitled Event"}</div>
                        <div className="activity-detail">
                          {evt.venue || evt.location || "No venue provided"}
                        </div>
                      </div>
                      <div className="activity-time">
                        {new Date(evt.date || evt.created_at).toLocaleDateString()}<br />
                        <span>
                          {new Date(evt.date || evt.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </li>
                  ))}
              </ul>
            )}
          </div>


          {/* Insights (detailed) */}
          <div className="admindb-insights">
            <h4 className="admindb-activity-title">Insights</h4>
            <ul className="admindb-insights-list">
              {insights.length === 0 ? (
                <li className="admindb-insight-item">No insights available.</li>
              ) : insights.map((ins, idx) => (
                <li key={idx} className="admindb-insight-item">
                  <span className="insight-bullet">•</span>
                  <span style={{ fontWeight: 700, marginRight: 8 }}>{ins.text}</span>
                  <small style={{ color: "#6b7280" }}>({ins.level.toUpperCase()})</small>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

    </div>
  );
}
