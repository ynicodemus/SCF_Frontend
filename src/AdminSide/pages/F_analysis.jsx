import React, { useState, useEffect } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer
} from 'recharts';
import "../css/Fanalysis.css";
import api from "../.././axios";



const COLORS = ['#8884d8', '#82ca9d'];

const FAnalysis = () => {
  const [citizens, setCitizens] = useState([]);
  const [analysis, setAnalysis] = useState({
    Sex: { Male: 0, Female: 0 },
    barangays: {},
    total: 0,
  });

  useEffect(() => {
    const fetchCitizens = async () => {
      try {
        const token = localStorage.getItem("adminToken"); // kung required auth
        const response = await api.get("/SeniorConnect/citizens/", {
          headers: {
            Authorization: `Token ${token}`,
          },
        });
        const data = response.data;
        setCitizens(data);
        processAnalysis(data);
      } catch (err) {
        console.error('Error fetching citizens data:', err);
      }
    };

    fetchCitizens();
  }, []);

  const processAnalysis = (data) => {
    let Sex = { Male: 0, Female: 0 };
    let barangays = {};

    data.forEach((citizen) => {
      if (citizen.sex === 'Male') Sex.Male++;
      else if (citizen.sex === 'Female') Sex.Female++;

      const brgy = citizen.address;
      barangays[brgy] = (barangays[brgy] || 0) + 1;
    });

    setAnalysis({
      total: data.length,
      Sex,
      barangays,
    });
  };

  const genderData = [
    { name: 'Male', value: analysis.Sex.Male },
    { name: 'Female', value: analysis.Sex.Female },
  ];

  const barangayData = Object.entries(analysis.barangays).map(([key, value]) => ({
    name: key,
    value,
  }));

  const barangayBoxes = Object.entries(analysis.barangays).map(([brgy, count], index) => (
    <div className="brgy-box" key={index}>
      <h4>{brgy}</h4>
      <p>{count} members</p>
    </div>
  ));

  return (
    <div className="fanalysis-container">
      <h2>Total Members: {analysis.total}</h2>

      <div className="chart-section">
        <div className="chart-card">
          <h3>Sex Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={genderData}
                dataKey="value"
                nameKey="name"
                outerRadius={100}
                label={({ name, value }) => `${name}: ${value}`}
              >
                {genderData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                    name={entry.name}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Members per Barangay</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barangayData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <h3>Members per Barangay</h3>
      <div className="brgy-grid">
        {barangayBoxes.length > 0 ? barangayBoxes : <p>No data available.</p>}
      </div>
    </div>
  );
};

export default FAnalysis;
