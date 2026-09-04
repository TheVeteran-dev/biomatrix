import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { dashboardAPI } from '../../services/api';

export default function AdherenceChart() {
  const [data, setData] = useState([]);
  
  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = async () => {
    try {
      const response = await dashboardAPI.getAdherenceHistory(7);
      setData(response.data);
    } catch (error) {
      console.error('Error loading adherence history:', error);
    }
  };
  
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis domain={[0, 100]} />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="adherence" stroke="#3B82F6" strokeWidth={2} name="Adherence %" />
      </LineChart>
    </ResponsiveContainer>
  );
}