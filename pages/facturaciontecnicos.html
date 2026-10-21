<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Portal de Técnicos - Facturación</title>
    
    <!-- Hojas de estilos principales del proyecto -->
    <link rel="stylesheet" href="../css/styles.css">
    <link rel="stylesheet" href="../css/facturacion.css">
    <link rel="stylesheet" href="../css/facturaciontecnicos.css">

    <!-- Librería Chart.js -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

    <style>
        @keyframes avatarFlotar {
            0%, 100% { transform: translateY(0) scale(1); filter: drop-shadow(0 4px 8px rgba(0,0,0,0.25)); }
            50% { transform: translateY(-6px) scale(1.03); filter: drop-shadow(0 8px 14px rgba(0,0,0,0.35)); }
        }
        .avatar-animado { animation: avatarFlotar 3s ease-in-out infinite; }

        /* Estructura Full-Width para Móviles y Escritorio */
        body {
            background-color: #f1f5f9;
            margin: 0;
            padding: 0;
            font-family: 'Inter', system-ui, sans-serif;
        }

        .layout {
            display: flex;
            width: 100vw;
            min-height: 100vh;
            box-sizing: border-box;
        }

        .main-content {
            flex: 1;
            width: 100%;
            padding: 16px;
            box-sizing: border-box;
            overflow-x: hidden;
        }

        .fact-container {
            max-width: 100% !important;
            width: 100% !important;
            margin: 0 auto;
            box-sizing: border-box;
        }

        /* Sidebar con efecto Vidrio Traslúcido (Glassmorphism) idéntico a tu referencia */
        .sidebar {
            position: fixed;
            top: 0;
            left: 0;
            width: 280px;
            height: 100vh;
            background: rgba(255, 255, 255, 0.78) !important;
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border-right: 1px solid rgba(255, 255, 255, 0.4);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
            z-index: 99999;
            transform: translateX(-100%);
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            padding: 20px;
            box-sizing: border-box;
        }

        .sidebar.activo {
            transform: translateX(0);
        }

        /* Botón Hamburguesa Flotante */
        #btnAbrirSidebar {
            position: fixed;
            top: 16px;
            left: 16px;
            z-index: 99998;
            background: rgba(255, 255, 255, 0.9);
            backdrop-filter: blur(8px);
            color: #0f172a;
            border: 1px solid #cbd5e0;
            padding: 8px 12px;
            border-radius: 10px;
            font-size: 1.2rem;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
            display: flex;
            align-items: center;
            justify-content: center;
        }

        /* Ajustes adaptativos para grillas en pantallas pequeñas */
        @media (max-width: 1024px) {
            .fact-kpi-grid {
                grid-template-columns: repeat(2, 1fr) !important;
            }
            .hero {
                flex-direction: column;
                align-items: flex-start !important;
                gap: 16px;
            }
        }
        @media (max-width: 640px) {
            .fact-kpi-grid {
                grid-template-columns: 1fr !important;
            }
            .main-content {
                padding: 10px;
            }
        }
    </style>
</head>
<body>

<!-- Botón Hamburguesa Flotante para abrir el menú traslúcido -->
<button type="button" id="btnAbrirSidebar" onclick="toggleSidebar()">☰</button>

<div class="layout">
    <!-- Sidebar Flotante con Efecto Vidrio Traslúcido -->
    <aside class="sidebar" id="appSidebar">
        <div>
            <div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 15px; border-bottom: 1px solid rgba(0,0,0,0.08); margin-bottom: 15px;">
                <div class="logo-box" style="background: transparent !important; border: none !important; box-shadow: none !important; padding: 0 !important; display: flex !important; align-items: center !important;">
                    <img src="../assets/dominion_logo.png" class="logo-img" alt="Dominion" style="width: 110px !important; height: auto !important; object-fit: contain !important; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.08));">
                </div>
                <!-- Botón de cierre (✕) -->
                <button type="button" onclick="toggleSidebar()" style="background: rgba(0,0,0,0.05); border: none; width: 32px; height: 32px; border-radius: 50%; font-size: 1rem; font-weight: bold; color: #334155; cursor: pointer; display: flex; align-items: center; justify-content: center;" title="Cerrar menú">✕</button>
            </div>
            
            <nav class="sidebar-nav" style="display: flex; flex-direction: column; gap: 6px;">
                <a href="facturacion.html" style="padding: 10px 12px; border-radius: 8px; color: #334155; text-decoration: none; font-weight: 700; display: flex; align-items: center; gap: 10px;"><span class="nav-icon">💰</span> Módulo Principal</a>
                <a href="facturaciontecnicos.html" class="active" style="padding: 10px 12px; border-radius: 8px; background: #2563eb; color: white; text-decoration: none; font-weight: 700; display: flex; align-items: center; gap: 10px;"><span class="nav-icon">👷‍♂️</span> Portal Técnicos</a>
            </nav>
        </div>

        <div style="border-top: 1px solid rgba(0,0,0,0.08); padding-top: 12px;">
            <a href="facturacion.html" style="text-decoration: none;">
                <button type="button" style="width: 100%; background: #0f172a; color: white; border: none; padding: 10px; border-radius: 8px; cursor: pointer; font-size: 0.85rem; font-weight: bold; display: flex; align-items: center; justify-content: center; gap: 6px;">
                    ⬅ Volver a Admin
                </button>
            </a>
        </div>
    </aside>

    <!-- Main Content Ocupando Toda la Pantalla (Full-Width) -->
    <main class="main-content">
        <div class="fact-container">
            
            <!-- Hero Banner Tecnológico -->
            <header class="hero" style="position: relative; background: url('../assets/hero_bg.png') center/cover no-repeat #1e3a8a; padding: 28px 35px; margin-bottom: 20px; border-radius: 18px; display: flex; justify-content: space-between; align-items: center; overflow: hidden; box-shadow: 0 10px 25px rgba(37, 99, 235, 0.15); width: 100%; box-sizing: border-box;">
                <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(90deg, rgba(15, 23, 42, 0.85) 0%, rgba(30, 58, 138, 0.65) 100%); z-index: 1;"></div>
                
                <div class="hero-content" style="position: relative; z-index: 2; color: white; max-width: 600px;">
                    <div class="hero-badge" style="background: #0ea5e9; color: white; padding: 3px 10px; border-radius: 6px; font-size: 0.72rem; font-weight: 800; display: inline-block; margin-bottom: 8px;"><span></span> PORTAL DE TÉCNICOS</div>
                    <h1 style="font-size: 1.8rem; margin: 0 0 6px 0; font-weight: 900; color: #ffffff;">Mi Rendimiento Financiero</h1>
                    <p style="font-size: 0.9rem; margin: 0; color: rgba(255,255,255,0.9);">Panel personalizado de control de metas, montos aprobados y seguimiento de órdenes en tiempo real.</p>
                </div>

                <!-- Avatar Dominic -->
                <div style="position: relative; z-index: 2; display: flex; align-items: center; gap: 14px;">
                    <div style="background: rgba(15, 23, 42, 0.6); padding: 10px 16px; border-radius: 12px; backdrop-filter: blur(6px); border: 1px solid rgba(255,255,255,0.15); text-align: right;">
                        <div style="font-weight: 900; font-size: 0.85rem; color: #ffffff;">¡Hola, soy Dominic!</div>
                        <div style="font-weight: 600; font-size: 0.7rem; color: rgba(255, 255, 255, 0.85);">Revisando tus metas financieras</div>
                    </div>
                    <div style="width: 75px; height: 75px; display: flex; align-items: center; justify-content: center;">
                        <img src="../assets/assistant_casco.png" alt="Dominic" class="avatar-animado" style="width: 100%; height: 100%; object-fit: contain;">
                    </div>
                </div>
            </header>

            <!-- Selector de Técnico -->
            <div class="fact-panel" style="background: white; padding: 16px 24px; border-radius: 14px; border: 1px solid #e2e8f0; margin-bottom: 16px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02); display: flex; align-items: center; gap: 14px; width: 100%; box-sizing: border-box;">
                <span style="font-size: 1.2rem; background: #eff6ff; padding: 8px; border-radius: 10px;">👤</span>
                <div style="flex: 1;">
                    <label for="selectTecnico" style="font-size: 0.68rem; font-weight: 800; color: #64748b; text-transform: uppercase; display: block; margin-bottom: 2px;">Selecciona tu perfil de técnico:</label>
                    <select id="selectTecnico" onchange="cambiarTecnicoSeleccionado()" style="width: 100%; border: none; background: transparent; font-size: 0.95rem; font-weight: 900; color: #0f172a; outline: none; cursor: pointer;">
                        <option value="">-- Cargando técnicos... --</option>
                    </select>
                </div>
            </div>

            <!-- Grid de KPIs -->
            <div class="fact-kpi-grid" style="grid-template-columns: repeat(4, 1fr); margin-bottom: 16px; width: 100%;">
                <!-- 1. Meta -->
                <div class="fact-kpi-card">
                    <div class="fact-kpi-top">
                        <div class="fact-kpi-icon-container" style="background: #0062ff;">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="#ffffff"/><path d="M17 7l4-4"/><path d="M17 3h4v4"/></svg>
                        </div>
                        <div>
                            <div style="font-size: 0.68rem; color: #64748b; font-weight: 800; text-transform: uppercase;">Meta Asignada</div>
                            <div style="font-size: 1.15rem; font-weight: 900; color: #0f172a; margin-top: 3px;" id="techMeta">$ 0</div>
                        </div>
                    </div>
                </div>

                <!-- 2. Aprobado -->
                <div class="fact-kpi-card">
                    <div class="fact-kpi-top">
                        <div class="fact-kpi-icon-container" style="background: #00b087;">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="18" height="12" rx="2"/><path d="M6 11h2"/><path d="M14 11h2"/><circle cx="11" cy="11" r="2.5"/><path d="M20 9h1a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1h-1"/></svg>
                        </div>
                        <div>
                            <div style="font-size: 0.68rem; color: #64748b; font-weight: 800; text-transform: uppercase;">Monto Aprobado</div>
                            <div style="font-size: 1.15rem; font-weight: 900; color: #0f172a; margin-top: 3px;" id="techAprobado">$ 0</div>
                        </div>
                    </div>
                    <div>
                        <div style="background: #e2e8f0; height: 6px; border-radius: 4px; overflow: hidden;"><div id="techBarAprobado" style="background: #00b087; width: 0%; height: 100%;"></div></div>
                        <div style="display: flex; justify-content: flex-end; margin-top: 3px;"><span style="background: #f0fdf4; color: #00b087; font-size: 0.65rem; font-weight: 800; padding: 1px 5px; border-radius: 6px;" id="techPorcentajeCumplimiento">0%</span></div>
                    </div>
                </div>

                <!-- 3. Rechazado -->
                <div class="fact-kpi-card" onclick="filtrarTablaEstado('RECHAZADO')" style="cursor: pointer; transition: transform 0.2s ease;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                    <div class="fact-kpi-top">
                        <div class="fact-kpi-icon-container" style="background: #dc2626;">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                        </div>
                        <div>
                            <div style="font-size: 0.68rem; color: #64748b; font-weight: 800; text-transform: uppercase; display: flex; gap: 4px;">Rechazado <span style="font-size: 0.72rem; color: #dc2626;">(ver 🔍)</span></div>
                            <div style="font-size: 1.15rem; font-weight: 900; color: #0f172a; margin-top: 3px;" id="techRechazado">$ 0</div>
                        </div>
                    </div>
                    <div style="font-size: 0.7rem; color: #64748b; font-weight: 700; margin-top: 6px;">Requiere revisión en campo</div>
                </div>

                <!-- 4. Subsanado -->
                <div class="fact-kpi-card">
                    <div class="fact-kpi-top">
                        <div class="fact-kpi-icon-container" style="background: #f59e0b;">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        </div>
                        <div>
                            <div style="font-size: 0.68rem; color: #64748b; font-weight: 800; text-transform: uppercase;">Monto Subsanado</div>
                            <div style="font-size: 1.15rem; font-weight: 900; color: #0f172a; margin-top: 3px;" id="techSubsanado">$ 0</div>
                        </div>
                    </div>
                    <div style="font-size: 0.7rem; color: #64748b; font-weight: 700; margin-top: 6px;">En proceso de rescate</div>
                </div>
            </div>

            <!-- Estado general del periodo -->
            <div class="fact-panel" style="display: flex; align-items: center; gap: 20px; padding: 18px 24px; margin-bottom: 16px; width: 100%; box-sizing: border-box;">
                <div style="font-weight: 800; font-size: 0.9rem; color: #0f172a; min-width: 190px;">Estado general del periodo</div>
                <div style="flex: 1; background: #e2e8f0; height: 10px; border-radius: 5px; overflow: hidden;">
                    <div id="techBarraProgreso" style="background: #16a34a; width: 0%; height: 100%; transition: width 0.4s ease;"></div>
                </div>
                <div id="techBadgeEstado" style="background: #dcfce7; color: #16a34a; padding: 4px 12px; border-radius: 6px; font-size: 0.75rem; font-weight: 900; white-space: nowrap;">
                    ¡Meta Cumplida! 🏆
                </div>
            </div>

            <!-- Detalle de Órdenes de Trabajo -->
            <div class="fact-panel" style="width: 100%; box-sizing: border-box;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
                    <h3 style="margin: 0; font-size: 1.05rem; font-weight: 800; color: #0f172a;">📋 Detalle de Mis Órdenes de Trabajo</h3>
                    <button type="button" onclick="resetFiltroTabla()" style="background: #f8fafc; border: 1px solid #cbd5e0; color: #334155; padding: 6px 14px; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 0.82rem;">Ver todas ›</button>
                </div>
                <div class="table-wrapper-fact" style="width: 100%; overflow-x: auto;">
                    <table class="fact-table" style="width: 100%;">
                        <thead>
                            <tr>
                                <th>ID / OT</th>
                                <th>Departamento</th>
                                <th>Estado Reg.</th>
                                <th>Causa Rechazo</th>
                                <th style="text-align: right;">Estimado</th>
                                <th style="text-align: right;">Aprobado</th>
                            </tr>
                        </thead>
                        <tbody id="techTableBody">
                            <tr>
                                <td colspan="6" style="text-align: center; color: #64748b; padding: 25px;">Selecciona tu perfil en la parte superior para cargar los registros.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    </main>
</div>

<!-- Script del Sidebar Traslúcido con efecto deslizante -->
<script>
    function toggleSidebar() {
        const sidebar = document.getElementById('appSidebar');
        sidebar.classList.toggle('activo');
    }
</script>

<!-- Scripts de lógica -->
<script src="../js/facturaciontecnicos.js"></script>
</body>
</html>
