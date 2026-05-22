import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import "../css/Danalysis.css";
import api from "../.././axios";



const monthNames = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

const DamayanTotalAmount = () => {
  const [totalPayments, setTotalPayments] = useState(0);
  const [loading, setLoading] = useState(true);

  // for chart
  const [allPayments, setAllPayments] = useState([]);
  const [chartLoading, setChartLoading] = useState(true);
  const [years, setYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState(""); // "" means all years

  // Fetch total payments (for summary card)
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await api.get("/SeniorConnect/damayanpayment/", {
          params: { is_active: true }
        });

        // Set all payments for chart
        setAllPayments(res.data);

        // Calculate total payment amount across all payments
        const total = res.data.reduce(
          (sum, payment) => sum + Number(payment.amount_paid || 0),
          0
        );
        setTotalPayments(total);

        // Extract all unique years for dropdown
        const yearSet = new Set();
        res.data.forEach((p) => {
          const date = new Date(p.date_paid);
          if (!isNaN(date)) yearSet.add(date.getFullYear());
        });
        const yearArray = Array.from(yearSet).sort();
        setYears(yearArray);
        // Default select latest year
        if (yearArray.length > 0) setSelectedYear(yearArray[yearArray.length - 1]);
      } catch (error) {
        console.error("Error fetching payments:", error);
        setYears([]);
      } finally {
        setLoading(false);
        setChartLoading(false);
      }
    };

    fetchPayments();
  }, []);

  // Build chart data for selected year
  const monthlyData = React.useMemo(() => {
    if (!selectedYear) return [];
    // Init all months to 0
    const data = monthNames.map((m, i) => ({
      month: `${m} ${selectedYear}`,
      total: 0,
    }));

    // Group payments by month
    allPayments.forEach((p) => {
      const date = new Date(p.date_paid);
      if (
        !isNaN(date) &&
        date.getFullYear() === Number(selectedYear)
      ) {
        const monthIdx = date.getMonth(); // 0-based
        data[monthIdx].total += Number(p.amount_paid || 0);
      }
    });

    return data;
  }, [allPayments, selectedYear]);

  return (
    <div className="DAnalysisCont">
      <h2>Damayan Total Amount Collected</h2>
      <div className="da-row">
        <div className="da-card">
          <h3>Total Collected</h3>
          <div className="da-value">
            {loading ? "Loading..." : `₱ ${totalPayments.toLocaleString()}`}
          </div>
        </div>
      </div>

      <div className="da-row" style={{ marginTop: 40 }}>
        <div
          style={{
            width: "100%",
            background: "#eaf6ff",
            borderRadius: "14px",
            padding: "24px 10px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <h3 style={{ margin: "0 0 18px 8px", flex: 1 }}>
              Monthly Damayan Payments
            </h3>
            <label style={{ fontWeight: 600, color: "#4178b8" }}>
              Year:{" "}
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                style={{
                  padding: "4px 10px",
                  borderRadius: "6px",
                  border: "1px solid #b4d6fa",
                  fontWeight: 600,
                }}
              >
                {years.map((year) => (
                  <option value={year} key={year}>
                    {year}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div style={{ width: "100%", height: 330 }}>
            {chartLoading ? (
              <div style={{ textAlign: "center" }}>Loading chart...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" interval={0} angle={-25} textAnchor="end" height={55} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="total"
                    name="Total Paid"
                    stroke="#82ca9d"
                    strokeWidth={3}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DamayanTotalAmount;
