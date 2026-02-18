
document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'http://127.0.0.1:8000';
    let currentHistoryData = []; // Store history for download functionality

    // --- Main Application Logic ---

    // Image Upload and Prediction
    const imageInput = document.getElementById('imageInput');
    const uploadArea = document.getElementById('uploadArea');
    const browseBtn = document.querySelector('.browse-btn');
    const preview = document.getElementById('preview');
    const predictBtn = document.getElementById('predictBtn');
    const result = document.getElementById('result');

    if (browseBtn) {
        browseBtn.addEventListener('click', () => imageInput.click());
    }

    if (imageInput) {
        imageInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) displayImage(file);
        });
    }

    if (uploadArea) {
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) {
                displayImage(file);
                imageInput.files = e.dataTransfer.files;
            } else {
                alert('Por favor, arrastra una imagen válida.');
            }
        });
    }

    function displayImage(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            preview.innerHTML = `<img src="${e.target.result}" alt="Vista previa">`;
        };
        reader.readAsDataURL(file);
    }

    if (predictBtn) {
        predictBtn.addEventListener('click', async () => {
            const file = imageInput.files[0];
            if (!file) {
                alert('Por favor, selecciona o arrastra una imagen.');
                return;
            }

            const formData = new FormData();
            formData.append('file', file);

            try {
                console.log('Enviando solicitud de predicción...');
                const response = await fetch(`${API_URL}/predict`, {
                    method: 'POST',
                    body: formData
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Error ${response.status}: ${errorText}`);
                }

                const data = await response.json();
                // Análisis de riesgo: Si es Maligno O si tiene >20% de probabilidad de algún tipo Maligno
                let isHighRisk = false;
                if (data.type === 'Maligno') {
                    isHighRisk = true;
                } else {
                    for (const [key, value] of Object.entries(data.probabilities)) {
                        if (key.includes('Maligno') && value >= 20) {
                            isHighRisk = true;
                            break;
                        }
                    }
                }

                const alertClass = isHighRisk ? 'alert-error' : 'alert-success';
                const alertTitle = isHighRisk
                    ? '⚠️ ¡Atención! Riesgo Detectado'
                    : '✅ Resultado Benigno';

                const recommendationHtml = isHighRisk
                    ? '<p style="margin-top: 10px; font-weight: bold; border-top: 1px solid rgba(255,255,255,0.3); padding-top: 10px;">Acción Recomendada: Derivación a Dermatología</p>'
                    : '';

                result.innerHTML = `
                    <div class="${alertClass}" style="padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                        <h2 style="color: white; margin-top: 0;">${alertTitle}</h2>
                        <p style="font-size: 1.2em; margin-bottom: 0;">
                            Predicción: <strong>${data.prediction}</strong> (${data.type})
                        </p>
                        ${recommendationHtml}
                    </div>
                    
                    <h3>Detalle de Probabilidades:</h3>
                    <div class="probability-list">
                        ${Object.entries(data.probabilities).map(([key, value]) => {
                    const isRiskLine = key.includes('Maligno') && value >= 20;
                    const riskClass = isRiskLine ? 'high-risk' : '';
                    return `
                                <div class="probability-item">
                                    <div class="probability-label">
                                        <span>${key}</span>
                                        <span>${value.toFixed(2)}%</span>
                                    </div>
                                    <div class="progress-container">
                                        <div class="progress-bar ${riskClass}" style="width: ${value}%"></div>
                                    </div>
                                </div>
                            `;
                }).join('')}
                    </div>
                `;
            } catch (error) {
                console.error('Error al realizar la predicción:', error);
                result.innerHTML = `<p>Error: ${error.message}</p>`;
            }
        });
    }

    // Load History
    async function loadHistory() {
        const historyList = document.getElementById('historyList');
        if (!historyList) return;

        try {
            console.log('Cargando historial...');
            const response = await fetch(`${API_URL}/predictions`);

            if (!response.ok) throw new Error('Error al cargar el historial');

            const predictions = await response.json();
            currentHistoryData = predictions; // Store data for individual downloads
            historyList.innerHTML = predictions.map((pred, index) => {
                let isHighRisk = false;
                if (pred.type === 'Maligno') {
                    isHighRisk = true;
                } else {
                    for (const [key, value] of Object.entries(pred.probabilities)) {
                        if (key.includes('Maligno') && value >= 20) {
                            isHighRisk = true;
                            break;
                        }
                    }
                }
                const statusClass = isHighRisk ? 'danger' : 'success';
                const recommendation = isHighRisk
                    ? '<p style="color: var(--color-peligro); font-weight: bold;">Acción Recomendada: Derivación a Dermatología</p>'
                    : '';

                return `
                <div class="prediction-item ${statusClass}">
                    <img src="${pred.image_path}" alt="Imagen subida">
                    <p><strong>Usuario:</strong> ${pred.user_name}</p>
                    <p><strong>Predicción:</strong> ${pred.prediction} (${pred.type})</p>
                    ${recommendation}
                    <p><strong>Fecha:</strong> ${new Date(pred.created_at).toLocaleString()}</p>
                    <p><strong>Probabilidades:</strong></p>
                    <div class="probability-list">
                        ${Object.entries(pred.probabilities).map(([key, value]) => {
                    const isRiskLine = key.includes('Maligno') && value >= 20;
                    const riskClass = isRiskLine ? 'high-risk' : '';
                    return `
                                <div class="probability-item">
                                    <div class="probability-label">
                                        <span>${key}</span>
                                        <span>${value.toFixed(2)}%</span>
                                    </div>
                                    <div class="progress-container">
                                        <div class="progress-bar ${riskClass}" style="width: ${value}%"></div>
                                    </div>
                                </div>
                            `;
                }).join('')}
                    </div>
                    </div>
                    <button class="btn btn-primary download-single-btn" data-index="${index}" style="margin-top: 15px; width: 100%;">Descargar Información</button>
                </div>
            `}).join('');

            // Add click handlers for the new buttons
            document.querySelectorAll('.download-single-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const index = e.target.getAttribute('data-index');
                    const pred = currentHistoryData[index];
                    downloadPredictionReport(pred);
                });
            });
        } catch (error) {
            historyList.innerHTML = `<p>Error al cargar el historial: ${error.message}</p>`;
        }
    }

    // Load Profile
    async function loadProfile() {
        const profileForm = document.getElementById('profileForm');
        if (!profileForm) return;

        try {
            const response = await fetch(`${API_URL}/profile`);

            if (!response.ok) throw new Error('Error al cargar el perfil');

            const profile = await response.json();



            document.getElementById('edad').value = profile.edad || '';
            document.getElementById('antecedentes').value = profile.antecedentes || '';
            document.getElementById('profesion').value = profile.profesion || '';
            document.getElementById('cp').value = profile.cp || '';
            if (document.getElementById('newWeight')) {
                document.getElementById('newWeight').value = profile.weight || '';
            }
        } catch (error) {
            console.error('Error al cargar el perfil:', error);
        }
    }

    // Update Profile
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        // Clear errors on input
        profileForm.querySelectorAll(".input-base").forEach(input => {
            input.addEventListener("input", () => {
                input.classList.remove("error");
                const errorMsg = input.nextElementSibling;
                if (errorMsg && errorMsg.classList.contains("error-msg")) {
                    errorMsg.textContent = "";
                    errorMsg.style.display = "none";
                }
            });
            // For select elements, 'change' is better/safer than 'input' sometimes, but 'input' usually works.
            input.addEventListener("change", () => {
                input.classList.remove("error");
                const errorMsg = input.nextElementSibling;
                if (errorMsg && errorMsg.classList.contains("error-msg")) {
                    errorMsg.textContent = "";
                    errorMsg.style.display = "none";
                }
            });
        });

        profileForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Validation
            let isValid = true;
            // Fields required by user: edad, antecedentes, cp
            const requiredIds = ['edad', 'antecedentes', 'profesion', 'cp'];

            requiredIds.forEach(id => {
                const input = document.getElementById(id);
                if (input) {
                    const errorMsg = input.nextElementSibling;

                    // Check if value is empty
                    if (!input.value.trim()) {
                        input.classList.add("error");
                        if (errorMsg && errorMsg.classList.contains("error-msg")) {
                            errorMsg.textContent = "Este campo es obligatorio";
                            errorMsg.style.display = "block";
                        }
                        isValid = false;
                    } else {
                        // Clear error if valid (just in case)
                        input.classList.remove("error");
                        if (errorMsg && errorMsg.classList.contains("error-msg")) {
                            errorMsg.textContent = "";
                            errorMsg.style.display = "none";
                        }
                    }
                }
            });

            if (!isValid) {
                // Stop submission if validation fails
                return;
            }

            const profileData = {
                edad: document.getElementById('edad').value || null,
                antecedentes: document.getElementById('antecedentes').value || null,
                profesion: document.getElementById('profesion').value || null,
                cp: document.getElementById('cp').value || null
            };

            try {
                const response = await fetch(`${API_URL}/profile`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(profileData)
                });

                if (!response.ok) throw new Error('Error al actualizar el perfil');

                const data = await response.json();
                alert(data.message);
                // PASO 3: Redirect to Diagnostico (Index)
                window.location.href = 'diagnostico.html';
            } catch (error) {
                console.error('Error al actualizar el perfil:', error);
                alert(error.message);
            }
        });
    }

    // Update Weight
    const weightForm = document.getElementById('weightForm');
    if (weightForm) {
        weightForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const weight = parseFloat(document.getElementById('newWeight').value);
            if (isNaN(weight) || weight <= 0) {
                alert('Por favor, ingresa un peso válido.');
                return;
            }

            try {
                const response = await fetch(`${API_URL}/profile/weight`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ weight })
                });

                if (!response.ok) throw new Error('Error al actualizar el peso');

                const data = await response.json();
                alert(data.message);
                loadProfile();
            } catch (error) {
                console.error('Error al actualizar el peso:', error);
                alert(error.message);
            }
        });
    }

    // Initial Load
    if (window.location.pathname.includes('historial.html')) {
        loadHistory();
    }
    if (window.location.pathname.includes('perfil-del-usuario.html')) {
        loadProfile();
    }

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }

    // --- Onboarding Flow ---

    // Login Form Handler (PASO 1)
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            // Since we don't have a real backend check for this specific demo/onboarding, 
            // we'll proceed directly to consentimiento.html
            window.location.href = 'consentimiento.html';
        });
    }

    function downloadPredictionReport(pred) {
        if (!window.jspdf) {
            alert("Error: La librería de generación de PDF no se ha cargado correctamente. Por favor, recargue la página.");
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Brand Colors
        const primaryColor = [0, 46, 76]; // #002e4c
        const accentColor = [0, 168, 156]; // #00a89c
        const dangerColor = [192, 57, 43]; // #c0392b

        let yPos = 20;
        const margin = 20;

        // --- Title and Header ---
        doc.setFont("helvetica", "bold");
        doc.setFontSize(18);
        doc.setTextColor(...primaryColor);
        doc.text("REPORTE DE DIAGNÓSTICO DERMATOLÓGICO", margin, yPos);
        yPos += 10;

        doc.setLineWidth(0.5);
        doc.setDrawColor(...accentColor);
        doc.line(margin, yPos, 190, yPos);
        yPos += 15;

        // --- Patient/User Info ---
        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        doc.setTextColor(50, 50, 50);

        // Helper function for key-value pairs
        const addInfoRow = (label, value) => {
            doc.setFont("helvetica", "bold");
            doc.text(`${label}:`, margin, yPos);
            doc.setFont("helvetica", "normal");
            doc.text(`${value}`, margin + 40, yPos);
            yPos += 7;
        };

        addInfoRow("Fecha Reporte", new Date().toLocaleString());
        addInfoRow("Fecha Diagnóstico", new Date(pred.created_at).toLocaleString());
        addInfoRow("ID Referencia", pred.id || 'N/A');
        addInfoRow("Usuario", pred.user_name || 'Desconocido');
        yPos += 10;

        // --- Results Section ---
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(...primaryColor);
        doc.text("RESULTADOS DEL ANÁLISIS", margin, yPos);
        yPos += 10;

        // Main Prediction
        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text(`Predicción Principal:`, margin, yPos);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.text(`${pred.prediction}`, margin + 45, yPos);
        yPos += 8;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);
        doc.text(`Clasificación:`, margin, yPos);
        doc.setFont("helvetica", "bold");
        doc.text(`${pred.type}`, margin + 45, yPos);
        yPos += 15;

        // --- Risk Assessment Box ---
        let isHighRisk = false;
        if (pred.type === 'Maligno') isHighRisk = true;
        else {
            for (const [key, value] of Object.entries(pred.probabilities)) {
                if (key.includes('Maligno') && value >= 20) {
                    isHighRisk = true;
                    break;
                }
            }
        }

        // Draw colored box background
        if (isHighRisk) {
            doc.setFillColor(...dangerColor); // Red background
        } else {
            doc.setFillColor(...accentColor); // Green/Teal background
        }

        // Box position and size
        doc.rect(margin, yPos, 170, 25, 'F');

        // Text inside box
        doc.setTextColor(255, 255, 255); // White text
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);

        const alertTitle = isHighRisk ? "ALERTA DE RIESGO DETECTADO" : "RESULTADO CON INDICADORES BENIGNOS";
        doc.text(alertTitle, margin + 5, yPos + 8);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        const line1 = isHighRisk
            ? "Se recomienda encarecidamente la derivación a un especialista en dermatología"
            : "Recuerde que esta herramienta es de apoyo y no sustituye el consejo médico.";
        const line2 = isHighRisk
            ? "para una evaluación clínica exhaustiva."
            : "Mantenga sus revisiones periódicas.";

        doc.text(line1, margin + 5, yPos + 15);
        doc.text(line2, margin + 5, yPos + 20);

        yPos += 35;

        // --- Probabilities Breakdown ---
        doc.setTextColor(...primaryColor);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.text("DESGLOSE DE PROBABILIDADES", margin, yPos);
        yPos += 10;

        doc.setFont("helvetica", "normal");
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(11);

        for (const [key, value] of Object.entries(pred.probabilities)) {
            // Label
            doc.text(`- ${key}:`, margin + 5, yPos);

            // Percentage Text
            const percentage = value.toFixed(2) + "%";
            doc.text(percentage, margin + 120, yPos, { align: "right" });

            // Visual Progress Bar
            const barX = margin + 125;
            const maxBarWidth = 40;
            const barHeight = 4;
            const barY = yPos - 3;

            // Background bar (gray)
            doc.setFillColor(230, 230, 230);
            doc.rect(barX, barY, maxBarWidth, barHeight, 'F');

            // Foreground bar (colored)
            const fillWidth = (value / 100) * maxBarWidth;
            if (key.includes('Maligno') && value >= 20) {
                doc.setFillColor(...dangerColor);
            } else {
                doc.setFillColor(...accentColor);
            }
            if (fillWidth > 0) {
                doc.rect(barX, barY, fillWidth, barHeight, 'F');
            }

            yPos += 8;
        }

        // --- Footer ---
        const pageHeight = doc.internal.pageSize.height;
        doc.setFontSize(9);
        doc.setTextColor(128, 128, 128);
        doc.text("Generado por Proyecto Melanoma AI - Uso exclusivo personal", margin, pageHeight - 10);

        // --- Save PDF ---
        const dateStr = new Date(pred.created_at).toISOString().slice(0, 10);
        const fileName = `Diagnostico_${dateStr}_${pred.id || 'report'}.pdf`;
        doc.save(fileName);
    }
});


