export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');

  const payload = {
    type: 'telemetry',
    data: {
      debit: (0.85 + (Math.random() * 0.04 - 0.02)).toFixed(2),
      level: (1.20 + (Math.random() * 0.02 - 0.01)).toFixed(2),
      rpm: Math.floor(1500 + (Math.random() * 10 - 5)),
      temp: Math.floor(45 + (Math.random() * 2 - 1)),
      temp_b1: Math.floor(45 + (Math.random() * 2 - 1)),
      temp_b2: Math.floor(48 + (Math.random() * 2 - 1)),
      temp_stator: Math.floor(62 + (Math.random() * 3 - 1.5)),
      vibration: (1.2 + (Math.random() * 0.2 - 0.1)).toFixed(2),
      guide_vane: Math.floor(75 + (Math.random() * 2 - 1)),
      voltage: Math.floor(380 + (Math.random() * 4 - 2)),
      v_r: Math.floor(382 + (Math.random() * 3 - 1.5)),
      v_s: Math.floor(380 + (Math.random() * 3 - 1.5)),
      v_t: Math.floor(381 + (Math.random() * 3 - 1.5)),
      current: Math.floor(45 + (Math.random() * 2 - 1)),
      i_r: (14.5 + (Math.random() * 0.5 - 0.25)).toFixed(1),
      i_s: (15.2 + (Math.random() * 0.5 - 0.25)).toFixed(1),
      i_t: (14.8 + (Math.random() * 0.5 - 0.25)).toFixed(1),
      freq: (50.00 + (Math.random() * 0.04 - 0.02)).toFixed(2),
      pf: (0.85 + (Math.random() * 0.02 - 0.01)).toFixed(2),
      power: parseFloat((24.5 + (Math.random() * 0.5 - 0.25)).toFixed(1))
    },
    timestamp: new Date().toISOString()
  };

  res.status(200).json(payload);
}
