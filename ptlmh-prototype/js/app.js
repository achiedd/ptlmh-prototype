// app.js - Fase 4 Real-time WebSocket Integration
let isConnected = false;
let ws = null;

document.addEventListener('DOMContentLoaded', () => {
    console.log("HydroSense App Initialized");
    
    // Inisialisasi koneksi WebSocket
    connectWebSocket();
});

function connectWebSocket() {
    // Mencoba terhubung ke backend pada host yang sama (port 3000 jika dijalankan via server.js)
    // Jika dibuka langsung via HTML (file://), ini mungkin akan error dan fallback ke mock data
    const wsUrl = window.location.protocol === 'file:' 
        ? 'ws://localhost:3000' 
        : `ws://${window.location.host}`;
        
    try {
        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
            console.log("✅ Terhubung ke Backend WebSocket IoT");
            isConnected = true;
            document.querySelector('.subtitle').innerHTML = 'Sistem Telemetri Real-Time <span style="color: var(--accent-success);">(LIVE - WSS Connected)</span>';
        };

        ws.onmessage = (event) => {
            try {
                const msg = JSON.parse(event.data);
                if (msg.type === 'telemetry') {
                    updateDashboardWithData(msg.data);
                }
            } catch (e) {
                console.error("Error parsing websocket message", e);
            }
        };

        ws.onerror = (error) => {
            console.warn("⚠️ WebSocket connection failed. Menggunakan fallback Mock Data lokal.");
            isConnected = false;
            initiateMockFallback();
        };

        ws.onclose = () => {
            console.warn("🔌 WebSocket disconnected. Menggunakan fallback Mock Data lokal.");
            isConnected = false;
            document.querySelector('.subtitle').innerHTML = 'Sistem Telemetri Real-Time <span style="color: var(--accent-warning);">(OFFLINE - Fallback Mode)</span>';
            initiateMockFallback();
            
            // Coba reconnect tiap 10 detik
            setTimeout(connectWebSocket, 10000);
        };
    } catch (e) {
        initiateMockFallback();
    }
}

// =========================================
// Fallback Mock Data Logic
// =========================================
function initiateMockFallback() {
    if(!window.mockInterval) {
        window.mockInterval = setInterval(() => {
            if(!isConnected) {
                const mockData = generateMockData();
                updateDashboardWithData(mockData);
            }
        }, 3000);
    }
}

function generateMockData() {
    return {
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
    };
}

// =========================================
// UI Updating Logic (Centralized)
// =========================================
function updateDashboardWithData(data) {
    // --- MAIN DASHBOARD ELEMENTS ---
    const elements = {
        debit: document.getElementById('val-debit'),
        level: document.getElementById('val-level'),
        rpm: document.getElementById('val-rpm'),
        temp: document.getElementById('val-temp'),
        voltage: document.getElementById('val-voltage'),
        current: document.getElementById('val-current'),
        freq: document.getElementById('val-freq'),
        power: document.getElementById('val-power')
    };

    if(elements.debit) elements.debit.innerHTML = data.debit + ' <small>m³/s</small>';
    if(elements.level) elements.level.innerHTML = data.level + ' <small>m</small>';
    if(elements.rpm) elements.rpm.innerHTML = data.rpm + ' <small>RPM</small>';
    if(elements.temp) elements.temp.innerHTML = data.temp + ' <small>°C</small>';
    if(elements.voltage) elements.voltage.innerHTML = data.voltage + ' <small>V</small>';
    if(elements.current) elements.current.innerHTML = data.current + ' <small>A</small>';
    if(elements.freq) elements.freq.innerHTML = data.freq + ' <small>Hz</small>';
    if(elements.power) elements.power.innerHTML = parseFloat(data.power).toFixed(1) + ' <small>kW</small>';

    // --- NEW TABS ELEMENTS ---
    // Kelistrikan
    updateEl('val-v-r', data.v_r, 'V');
    updateEl('val-v-s', data.v_s, 'V');
    updateEl('val-v-t', data.v_t, 'V');
    updateEl('val-i-r', data.i_r, 'A');
    updateEl('val-i-s', data.i_s, 'A');
    updateEl('val-i-t', data.i_t, 'A');
    updateEl('val-freq-detail', data.freq, '');
    updateEl('val-pf', data.pf, '');
    
    // Hitung KVA
    const kva = (data.power / data.pf).toFixed(1);
    updateEl('val-kva', kva, '');

    // Turbin & Mesin
    updateEl('val-rpm-detail', data.rpm, 'RPM', true);
    updateEl('val-flow', data.debit, 'm³/s');
    updateEl('val-guide-vane', data.guide_vane, '%');
    updateEl('val-temp-bearing1', data.temp_b1, '°C');
    updateEl('val-temp-bearing2', data.temp_b2, '°C');
    updateEl('val-temp-stator', data.temp_stator, '°C');
    updateEl('val-vibration', data.vibration, 'mm/s');

    // Beban Capacity Logic
    const capacity = 32; // 32 kW capacity
    const percentage = (data.power / capacity) * 100;
    
    const progressFill = document.querySelector('.progress-fill');
    const progressLabels = document.querySelector('.progress-label') ? document.querySelector('.progress-label').querySelectorAll('span') : null;
    
    if (progressFill && progressLabels && progressLabels.length > 1) {
        progressFill.style.width = percentage + '%';
        progressLabels[0].textContent = `Utilisasi Kapasitas (${percentage.toFixed(1)}%)`;
        progressLabels[1].textContent = `${parseFloat(data.power).toFixed(1)} kW / ${capacity} kW`;
        
        const statusMsg = document.querySelector('.status-message');
        const statusBadge = document.querySelector('.status-badge');
        
        if (percentage > 90) {
            progressFill.style.backgroundColor = 'var(--accent-danger)';
            if(statusMsg) {
                statusMsg.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Kritis! Beban melebihi 90%. Segera kurangi beban.';
                statusMsg.style.color = 'var(--accent-danger)';
                statusMsg.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
            }
            if(statusBadge) {
                statusBadge.className = 'status-badge'; 
                statusBadge.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                statusBadge.style.color = 'var(--accent-danger)';
                statusBadge.style.borderColor = 'rgba(239, 68, 68, 0.2)';
                statusBadge.innerHTML = '<span class="dot" style="background-color: var(--accent-danger);"></span> Status: KRITIS';
            }
        } else if (percentage > 80) {
            progressFill.style.backgroundColor = 'var(--accent-warning)';
            if(statusMsg) {
                statusMsg.innerHTML = '<i class="fa-solid fa-bell"></i> Peringatan. Beban mendekati batas kritis.';
                statusMsg.style.color = 'var(--accent-warning)';
                statusMsg.style.backgroundColor = 'rgba(245, 158, 11, 0.1)';
            }
            if(statusBadge) {
                statusBadge.className = 'status-badge';
                statusBadge.style.backgroundColor = 'rgba(245, 158, 11, 0.1)';
                statusBadge.style.color = 'var(--accent-warning)';
                statusBadge.style.borderColor = 'rgba(245, 158, 11, 0.2)';
                statusBadge.innerHTML = '<span class="dot" style="background-color: var(--accent-warning);"></span> Status: WARNING';
            }
        } else {
            progressFill.style.backgroundColor = 'var(--accent-success)';
            if(statusMsg) {
                statusMsg.innerHTML = '<i class="fa-solid fa-check-circle"></i> Beban aman. Tidak ada risiko overload.';
                statusMsg.style.color = 'var(--accent-success)';
                statusMsg.style.backgroundColor = 'rgba(16, 185, 129, 0.1)';
            }
            if(statusBadge) {
                statusBadge.className = 'status-badge normal';
                statusBadge.removeAttribute('style');
                statusBadge.innerHTML = '<span class="dot"></span> Status: NORMAL';
            }
        }
    }
}

// Helper untuk update element
function updateEl(id, val, unit, isHighlight = false) {
    const el = document.getElementById(id);
    if(el) {
        if(unit !== '') {
            el.innerHTML = `${val} <small>${unit}</small>`;
        } else {
            el.innerHTML = val;
        }
    }
}

/* =========================================
   Fase 3: Logbook & Navigation Logic
   ========================================= */

function switchTab(tabId) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(el => {
        el.style.display = 'none';
    });
    
    // Remove active class from all nav items
    document.querySelectorAll('.sidebar-nav li').forEach(el => {
        el.classList.remove('active');
    });
    
    // Show selected tab and set active nav
    document.getElementById(tabId + '-section').style.display = 'block';
    
    const activeNav = document.getElementById('nav-' + tabId);
    if (activeNav) {
        activeNav.classList.add('active');
    }
}

function submitLog() {
    // Get form values
    const shift = document.getElementById('shift-select').value;
    const isSampahChecked = document.getElementById('chk-sampah').checked;
    const isPelumasChecked = document.getElementById('chk-pelumas').checked;
    const isVBeltChecked = document.getElementById('chk-vbelt').checked;
    const notes = document.getElementById('log-notes').value;
    
    // Validation
    if (!isSampahChecked || !isPelumasChecked || !isVBeltChecked) {
        alert("Mohon selesaikan semua checklist inspeksi sebelum menyimpan log!");
        return;
    }
    
    // Get current date
    const date = new Date();
    const options = { day: '2-digit', month: 'short', year: 'numeric' };
    const dateStr = date.toLocaleDateString('en-GB', options);
    const shiftLabel = shift.includes("Pagi") ? "Pagi" : "Sore";
    
    // Create new row
    const tbody = document.getElementById('log-history-table');
    const newRow = document.createElement('tr');
    
    let actionText = "Inspeksi rutin lengkap.";
    if (notes.trim() !== "") {
        actionText += " Catatan: " + notes;
    }
    
    newRow.innerHTML = `
        <td>${dateStr}</td>
        <td>${shiftLabel}</td>
        <td>${actionText}</td>
        <td><span class="badge badge-success">Selesai</span></td>
    `;
    
    // Prepend to table and add animation
    newRow.style.backgroundColor = "rgba(16, 185, 129, 0.2)";
    tbody.insertBefore(newRow, tbody.firstChild);
    
    setTimeout(() => {
        newRow.style.transition = "background-color 1s ease";
        newRow.style.backgroundColor = "transparent";
    }, 500);
    
    // Reset Form
    document.getElementById('logbook-form').reset();
    
    // Alert success
    alert("Log harian berhasil disimpan!");
}

function saveSettings() {
    const tempMax = document.getElementById('set-temp-max').value;
    const voltMin = document.getElementById('set-volt-min').value;
    const freqMin = document.getElementById('set-freq-min').value;
    
    const alsEnabled = document.getElementById('toggle-als').checked;
    
    if(!tempMax || !voltMin || !freqMin) {
        alert("Harap isi semua batas threshold!");
        return;
    }
    
    alert(`Konfigurasi Berhasil Disimpan:\n- Suhu Maks: ${tempMax}°C\n- Volt Min: ${voltMin}V\n- Freq Min: ${freqMin}Hz\n- ALS: ${alsEnabled ? 'Aktif' : 'Non-Aktif'}`);
}
