import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
import os
import base64
import numpy as np

# 1. Configuración de página avanzada
st.set_page_config(
    page_title="INIA - Dashboard de Proyectos",
    page_icon="📊",
    layout="wide",
    initial_sidebar_state="expanded"
)

# 2. Inyección de CSS Premium (Estilo World-Class Dashboard)
st.markdown("""
<style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

    html, body, [class*="css"] {
        font-family: 'Inter', sans-serif !important;
        background-color: #f8fafc;
    }
    
    /* Ocultar elementos de UI por defecto de Streamlit para look de App nativa */
    #MainMenu {visibility: hidden;}
    footer {visibility: hidden;}
    header {visibility: hidden;}
    
    /* Panel principal */
    .block-container {
        padding-top: 2rem !important;
        padding-bottom: 2rem !important;
        max-width: 1600px;
    }

    /* Header Premium Glassmorphism */
    .premium-header {
        display: flex;
        align-items: center;
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        padding: 20px 35px;
        border-radius: 16px;
        margin-bottom: 30px;
        border: 1px solid rgba(226, 232, 240, 0.8);
        box-shadow: 0 10px 40px -10px rgba(0,0,0,0.05);
    }
    
    .premium-header img {
        height: 75px;
        object-fit: contain;
        margin-right: 25px;
    }
    
    .header-text {
        display: flex;
        flex-direction: column;
    }
    
    .header-text h1 {
        margin: 0;
        font-size: 28px;
        font-weight: 800;
        color: #0f172a;
        letter-spacing: -0.03em;
        line-height: 1.2;
    }
    
    .header-text p {
        margin: 0;
        color: #64748b;
        font-size: 14px;
        font-weight: 500;
        letter-spacing: 0.5px;
        text-transform: uppercase;
    }

    /* Tarjetas KPI Premium */
    .kpi-wrapper {
        background: #ffffff;
        padding: 25px;
        border-radius: 16px;
        border: 1px solid #e2e8f0;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.02);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        display: flex;
        flex-direction: column;
        justify-content: center;
        position: relative;
        overflow: hidden;
    }
    
    .kpi-wrapper:hover {
        transform: translateY(-4px);
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02);
        border-color: #cbd5e1;
    }
    
    /* Acento decorativo superior */
    .kpi-accent {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 4px;
    }
    .accent-blue { background: linear-gradient(90deg, #3b82f6, #2563eb); }
    .accent-green { background: linear-gradient(90deg, #10b981, #059669); }
    .accent-red { background: linear-gradient(90deg, #ef4444, #dc2626); }

    .kpi-title {
        font-size: 13px;
        color: #64748b;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 8px;
    }
    
    .kpi-value {
        font-size: 36px;
        font-weight: 800;
        color: #0f172a;
        letter-spacing: -0.02em;
        line-height: 1.1;
    }
    
    /* Contenedores de Gráficos (Streamlit usa st.container/columns, estilizaremos el fondo global pero los gráficos manejarán su fondo) */
    
</style>
""", unsafe_allow_html=True)

# 3. Función para logo base64
@st.cache_data
def get_base64_of_bin_file(bin_file):
    try:
        with open(bin_file, 'rb') as f:
            data = f.read()
        return base64.b64encode(data).decode()
    except Exception:
        return ""

logo_path = os.path.join("sgpi-inia", "public", "logo-inia.png")
logo_base64 = get_base64_of_bin_file(logo_path)

if logo_base64:
    logo_html = f'<img src="data:image/png;base64,{logo_base64}" alt="INIA Logo">'
else:
    logo_html = '<div style="background-color: #00A650; padding: 10px 15px; border-radius: 8px; font-weight: 900; color: white; font-size: 24px; margin-right: 20px;">INIA</div>'

# 4. Cabecera Visual
st.markdown(f"""
<div class="premium-header">
    {logo_html}
    <div class="header-text">
        <p>Sistema de Gestión y Control</p>
        <h1>Dashboard Interactivo de Proyectos</h1>
    </div>
</div>
""", unsafe_allow_html=True)

# 5. Carga y Limpieza de Datos (Con Fix de formato)
@st.cache_data(ttl=600)
def load_data():
    url = "https://docs.google.com/spreadsheets/d/1EfjAt6Z2MHJuQndjd_v8i-InhL8uJior/export?format=csv"
    
    try:
        df = pd.read_csv(url, skiprows=1, encoding='utf-8')
        df.columns = df.columns.str.strip()
        
        # Renombrar columnas conflictivas
        rename_dict = {
            'Cdigo': 'Código',
            'Estado Cdigo': 'Estado Código',
            'Ttulo Proyecto': 'Título Proyecto',
            'Cdigo Externo': 'Código Externo',
            'CÃ³digo': 'Código',
            'Estado CÃ³digo': 'Estado Código',
            'TÃ\xadtulo Proyecto': 'Título Proyecto',
            'CÃ³digo Externo': 'Código Externo'
        }
        df = df.rename(columns=rename_dict)
        
        if 'Unnamed: 0' in df.columns:
            df = df.drop(columns=['Unnamed: 0'])
            
        df = df.dropna(how='all')
        
        # FIX CRÍTICO: Limpieza de moneda chilena ($ 237.071.336 -> 237071336)
        if 'MONTO FF' in df.columns:
            # Reemplazar $, puntos y espacios por nada
            clean_monto = df['MONTO FF'].astype(str).str.replace(r'[\$\.\s]', '', regex=True)
            df['MONTO FF'] = pd.to_numeric(clean_monto, errors='coerce').fillna(0)
            
        return df
        
    except Exception as e:
        st.error(f"Error al cargar datos: {e}")
        return pd.DataFrame(columns=['Dependencia', 'Nombre FF', 'Jefe Proyecto', 'Estado Proyecto', 'MONTO FF'])

df = load_data()

# Procesamiento de Fechas y Semáforo de Estado
now = pd.Timestamp.now()

def get_status_color(row):
    estado = str(row.get('Estado Proyecto', ''))
    if estado.lower() == 'terminado':
        return '🔴 Terminado'
    
    hasta = row.get('Hasta', None)
    if pd.isna(hasta) or str(hasta).strip() == '':
        return '⚪ Sin Fecha'
        
    try:
        hasta_date = pd.to_datetime(hasta, dayfirst=True)
        diff_days = (hasta_date - now).days
        if diff_days < 0:
            return '🔴 Vencido/Terminado'
        elif diff_days <= 180:
            return '🟡 Por Terminar (< 6 meses)'
        else:
            return '🟢 Vigente'
    except:
        return '⚪ Fecha Inválida'

df['Semáforo'] = df.apply(get_status_color, axis=1)

# 6. Sidebar Premium
with st.sidebar:
    st.markdown("""
        <h2 style="font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 20px;">
            ⚙️ Panel de Control
        </h2>
    """, unsafe_allow_html=True)
    
    estados = sorted(df['Estado Proyecto'].astype(str).unique())
    def_est = ['En Ejecución'] if 'En Ejecución' in estados else []
    selected_estados = st.multiselect("Estado Proyecto", options=estados, default=def_est)
    
    dependencias = sorted(df['Dependencia'].astype(str).unique())
    selected_dependencias = st.multiselect("Dependencia Centro", options=dependencias, default=dependencias)
    
    fuentes = sorted(df['Nombre FF'].astype(str).unique())
    selected_fuentes = st.multiselect("Fuente de Financiamiento", options=fuentes, default=fuentes)
    
    jefes = sorted(df['Jefe Proyecto'].astype(str).unique())
    selected_jefes = st.multiselect("Investigador Responsable (IR)", options=jefes, default=jefes)

# Filtrado global
df_filtered = df.copy()
if selected_estados:
    df_filtered = df_filtered[df_filtered['Estado Proyecto'].isin(selected_estados)]
if selected_dependencias:
    df_filtered = df_filtered[df_filtered['Dependencia'].isin(selected_dependencias)]
if selected_fuentes:
    df_filtered = df_filtered[df_filtered['Nombre FF'].isin(selected_fuentes)]
if selected_jefes:
    df_filtered = df_filtered[df_filtered['Jefe Proyecto'].isin(selected_jefes)]

# 7. KPIs Macro y Mini-Dashboards
total_presupuesto = float(df_filtered['MONTO FF'].sum())
total_proyectos = len(df_filtered)

# Contar alertas (Semáforo rojo o amarillo)
df_alertas = df_filtered[df_filtered['Semáforo'].str.contains('🔴|🟡')]
alertas = len(df_alertas)

def format_currency(value):
    try:
        return f"${value:,.0f}".replace(",", ".")
    except:
        return "$0"

if "kpi_view" not in st.session_state:
    st.session_state.kpi_view = None

k1, k2, k3 = st.columns(3)

with k1:
    st.markdown(f"""
    <div class="kpi-wrapper" style="margin-bottom: 10px;">
        <div class="kpi-accent accent-blue"></div>
        <div class="kpi-title">Presupuesto Capturado (CLP)</div>
        <div class="kpi-value" style="color: #1e40af;">{format_currency(total_presupuesto)}</div>
    </div>
    """, unsafe_allow_html=True)
    if st.button("📊 Explorar Presupuesto", key="btn_pres", use_container_width=True):
        st.session_state.kpi_view = "presupuesto" if st.session_state.kpi_view != "presupuesto" else None

with k2:
    st.markdown(f"""
    <div class="kpi-wrapper" style="margin-bottom: 10px;">
        <div class="kpi-accent accent-green"></div>
        <div class="kpi-title">Proyectos Activos</div>
        <div class="kpi-value" style="color: #047857;">{total_proyectos}</div>
    </div>
    """, unsafe_allow_html=True)
    if st.button("📋 Ver Proyectos", key="btn_proy", use_container_width=True):
        st.session_state.kpi_view = "proyectos" if st.session_state.kpi_view != "proyectos" else None

with k3:
    st.markdown(f"""
    <div class="kpi-wrapper" style="margin-bottom: 10px;">
        <div class="kpi-accent accent-red"></div>
        <div class="kpi-title">Alertas Administrativas</div>
        <div class="kpi-value" style="color: #b91c1c;">{alertas}</div>
    </div>
    """, unsafe_allow_html=True)
    if st.button("⚠️ Detalle Alertas", key="btn_alert", use_container_width=True):
        st.session_state.kpi_view = "alertas" if st.session_state.kpi_view != "alertas" else None

# Renderizado Condicional del Mini-Dashboard
if st.session_state.kpi_view:
    st.markdown("""
    <style>
    .mini-dash {
        background-color: #ffffff;
        border-radius: 12px;
        padding: 20px;
        margin-top: 10px;
        margin-bottom: 25px;
        border: 1px solid #cbd5e1;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        animation: fadeIn 0.3s ease-in-out;
    }
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    </style>
    <div class="mini-dash">
    """, unsafe_allow_html=True)
    
    if st.session_state.kpi_view == "presupuesto":
        st.markdown("<h4 style='color: #0f172a; margin-top: 0;'>Desglose de Presupuesto</h4>", unsafe_allow_html=True)
        mc1, mc2 = st.columns(2)
        with mc1:
            df_pres_estado = df_filtered.groupby('Estado Proyecto')['MONTO FF'].sum().reset_index()
            fig_pres = px.pie(df_pres_estado, values='MONTO FF', names='Estado Proyecto', hole=0.5)
            fig_pres.update_traces(textinfo='percent+label')
            fig_pres.update_layout(margin=dict(t=20, b=20, l=20, r=20), height=250, showlegend=False)
            st.plotly_chart(fig_pres, use_container_width=True, config={'displayModeBar': False})
        with mc2:
            df_pres_ff = df_filtered.groupby('Nombre FF')['MONTO FF'].sum().reset_index().sort_values('MONTO FF', ascending=False).head(5)
            df_pres_ff['MONTO FF Str'] = df_pres_ff['MONTO FF'].apply(lambda x: f"${x:,.0f}".replace(",", "."))
            st.dataframe(df_pres_ff[['Nombre FF', 'MONTO FF Str']], use_container_width=True, hide_index=True)
            
    elif st.session_state.kpi_view == "proyectos":
        st.markdown("<h4 style='color: #0f172a; margin-top: 0;'>Resumen de Proyectos</h4>", unsafe_allow_html=True)
        df_mini_proy = df_filtered[['Semáforo', 'Código', 'Jefe Proyecto', 'Estado Proyecto']].copy()
        st.dataframe(df_mini_proy.head(15), use_container_width=True, hide_index=True, height=250)
        
    elif st.session_state.kpi_view == "alertas":
        st.markdown("<h4 style='color: #b91c1c; margin-top: 0;'>⚠️ Proyectos con Alertas (Vencidos o por terminar)</h4>", unsafe_allow_html=True)
        if alertas > 0:
            df_mini_alertas = df_alertas[['Semáforo', 'Código', 'Jefe Proyecto', 'Hasta']].copy()
            st.dataframe(df_mini_alertas, use_container_width=True, hide_index=True, height=250)
        else:
            st.success("¡Excelente! No hay proyectos con alertas en los filtros actuales.")
            
    st.markdown("</div>", unsafe_allow_html=True)

st.markdown("<br>", unsafe_allow_html=True)

# 8. Gráficos Premium (Plotly Theming)
# Configuración global de plotly para look premium
plotly_template = "plotly_white"
chart_font = dict(family="Inter", size=12, color="#475569")
bg_transparent = 'rgba(0,0,0,0)'

def apply_premium_layout(fig, title=""):
    fig.update_layout(
        title=dict(text=title, font=dict(family="Inter", size=16, color="#0f172a", weight="bold")),
        plot_bgcolor=bg_transparent,
        paper_bgcolor=bg_transparent,
        font=chart_font,
        margin=dict(t=50, b=20, l=20, r=20),
        hoverlabel=dict(bgcolor="white", font_size=13, font_family="Inter", bordercolor="#e2e8f0"),
        coloraxis_showscale=False
    )
    fig.update_xaxes(showgrid=False, linecolor="#cbd5e1")
    fig.update_yaxes(showgrid=True, gridcolor="#f1f5f9", linecolor="#cbd5e1")
    return fig

colors = ['#0ea5e9', '#10b981', '#6366f1', '#f59e0b', '#3b82f6', '#8b5cf6']
corporate_blue = "#0A3B5C"
corporate_green = "#00A650"

# Render de Gráficos y Tablas usando Pestañas
tab1, tab2 = st.tabs(["📊 Dashboard Gráfico", "📋 Informe Resumen"])

with tab1:
    r1c1, r1c2, r1c3 = st.columns([1.2, 1.4, 1.4])

    with r1c1:
        df_dep = df_filtered.groupby('Dependencia').size().reset_index(name='Proyectos')
        fig_dep = px.pie(df_dep, values='Proyectos', names='Dependencia', hole=0.7,
                         color_discrete_sequence=[corporate_blue, corporate_green, '#cbd5e1'])
        fig_dep.update_traces(textposition='outside', textinfo='value', hovertemplate="<b>%{label}</b><br>Proyectos: %{value}<extra></extra>")
        fig_dep = apply_premium_layout(fig_dep, "Distribución por Dependencia")
        fig_dep.update_layout(showlegend=True, legend=dict(orientation="h", y=-0.2, x=0))
        st.plotly_chart(fig_dep, use_container_width=True, config={'displayModeBar': False})

    with r1c2:
        df_ir = df_filtered.groupby('Jefe Proyecto').size().reset_index(name='Proyectos').sort_values('Proyectos', ascending=False).head(10)
        fig_ir = px.bar(df_ir, x='Jefe Proyecto', y='Proyectos', text='Proyectos',
                        color_discrete_sequence=[corporate_blue])
        fig_ir.update_traces(textposition='outside', hovertemplate="<b>%{x}</b><br>Proyectos: %{y}<extra></extra>")
        fig_ir = apply_premium_layout(fig_ir, "Top 10 IR por Cantidad de Proyectos")
        fig_ir.update_layout(xaxis_tickangle=-45, xaxis_title=None, yaxis_title=None)
        st.plotly_chart(fig_ir, use_container_width=True, config={'displayModeBar': False})

    with r1c3:
        df_ir_money = df_filtered.groupby('Jefe Proyecto')['MONTO FF'].sum().reset_index().sort_values('MONTO FF', ascending=False).head(10)
        fig_ir_m = px.bar(df_ir_money, x='Jefe Proyecto', y='MONTO FF',
                          color_discrete_sequence=[corporate_green])
        fig_ir_m.update_traces(hovertemplate="<b>%{x}</b><br>Monto Capturado: $%{y:,.0f}<extra></extra>")
        fig_ir_m = apply_premium_layout(fig_ir_m, "Top 10 IR por Monto Capturado ($)")
        fig_ir_m.update_layout(xaxis_tickangle=-45, xaxis_title=None, yaxis_title=None)
        fig_ir_m.update_yaxes(tickprefix="$", tickformat=",.0f")
        st.plotly_chart(fig_ir_m, use_container_width=True, config={'displayModeBar': False})

    r2c1, r2c2, r2c3 = st.columns([1.5, 1.5, 1])

    with r2c1:
        df_ff_money = df_filtered.groupby('Nombre FF')['MONTO FF'].sum().reset_index().sort_values('MONTO FF', ascending=False)
        fig_ff_money = px.line(df_ff_money, x='Nombre FF', y='MONTO FF', markers=True,
                               color_discrete_sequence=['#f59e0b'])
        fig_ff_money.update_traces(line=dict(width=4, shape='spline'), marker=dict(size=10, symbol='circle', line=dict(width=2, color='white')), hovertemplate="<b>%{x}</b><br>Capturado: $%{y:,.0f}<extra></extra>")
        fig_ff_money = apply_premium_layout(fig_ff_money, "Evolución Presupuesto por Fuente (F.F)")
        fig_ff_money.update_layout(xaxis_tickangle=-45, xaxis_title=None, yaxis_title=None)
        fig_ff_money.update_yaxes(tickprefix="$", tickformat=",.0f")
        st.plotly_chart(fig_ff_money, use_container_width=True, config={'displayModeBar': False})

    with r2c2:
        fig_ir_money_line = px.line(df_ir_money.sort_values('Jefe Proyecto'), x='Jefe Proyecto', y='MONTO FF', markers=True,
                               color_discrete_sequence=['#6366f1'])
        fig_ir_money_line.update_traces(line=dict(width=4, shape='spline'), marker=dict(size=10, symbol='circle', line=dict(width=2, color='white')), hovertemplate="<b>%{x}</b><br>Total: $%{y:,.0f}<extra></extra>")
        fig_ir_money_line = apply_premium_layout(fig_ir_money_line, "Perfil de Inversión por IR")
        fig_ir_money_line.update_layout(xaxis_tickangle=-45, xaxis_title=None, yaxis_title=None)
        fig_ir_money_line.update_yaxes(tickprefix="$", tickformat=",.0f")
        st.plotly_chart(fig_ir_money_line, use_container_width=True, config={'displayModeBar': False})

    with r2c3:
        df_ff_count = df_filtered.groupby('Nombre FF').size().reset_index(name='Proyectos').sort_values('Proyectos', ascending=True)
        fig_ff_count = px.bar(df_ff_count, y='Nombre FF', x='Proyectos', text='Proyectos', orientation='h',
                              color_discrete_sequence=[corporate_blue])
        fig_ff_count.update_traces(textposition='outside')
        fig_ff_count = apply_premium_layout(fig_ff_count, "Volumen por F.F")
        fig_ff_count.update_layout(xaxis_title=None, yaxis_title=None, margin=dict(l=10))
        st.plotly_chart(fig_ff_count, use_container_width=True, config={'displayModeBar': False})

    # Grilla Dinámica Premium
    st.markdown("""
    <div style="margin-top: 2rem; padding-bottom: 1rem;">
        <h3 style="font-family: 'Inter'; font-weight: 700; color: #0f172a; font-size: 20px;">
            📑 Base de Datos Filtrada
        </h3>
    </div>
    """, unsafe_allow_html=True)

    df_display = df_filtered.copy()
    if 'MONTO FF' in df_display.columns:
        df_display['MONTO FF'] = df_display['MONTO FF'].apply(lambda x: f"${x:,.0f}".replace(",", "."))

    cols_to_show = ['Semáforo', 'Código', 'Título Proyecto', 'Jefe Proyecto', 'Nombre FF', 'Estado Proyecto', 'Hasta', 'MONTO FF']
    existing_cols = [c for c in cols_to_show if c in df_display.columns]

    st.dataframe(
        df_display[existing_cols].reset_index(drop=True),
        use_container_width=True,
        height=300,
        hide_index=True
    )

with tab2:
    st.markdown("""
        <h3 style="font-family: 'Inter'; font-weight: 700; color: #0f172a; font-size: 24px; margin-bottom: 20px;">
            📋 Resumen Consolidado de Cartera
        </h3>
    """, unsafe_allow_html=True)
    
    col_t1, col_t2 = st.columns(2)
    
    # Estilo de tablas dinámicas
    st.markdown("""
    <style>
    [data-testid="stDataFrame"] {
        border-radius: 8px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        border: 1px solid #e2e8f0;
    }
    </style>
    """, unsafe_allow_html=True)
    
    with col_t1:
        st.markdown("**1. Proyectos por Fuente de Financiamiento**")
        df_ff_resumen = df_filtered.groupby('Nombre FF').agg(
            N_Proyectos=('Código', 'count'),
            Total_FF=('MONTO FF', 'sum')
        ).reset_index()
        
        # Fila Total General
        df_ff_resumen.loc['Total General'] = ['Total general', df_ff_resumen['N_Proyectos'].sum(), df_ff_resumen['Total_FF'].sum()]
        df_ff_resumen['Total_FF'] = df_ff_resumen['Total_FF'].apply(lambda x: f"${x:,.0f}".replace(",", "."))
        df_ff_resumen.rename(columns={'Nombre FF': 'Fuente F.', 'N_Proyectos': 'N° de Proyectos', 'Total_FF': '$ Total FF'}, inplace=True)
        st.dataframe(df_ff_resumen, use_container_width=True, hide_index=True)
        
        st.markdown("<br>**2. Proyectos por Dependencia**", unsafe_allow_html=True)
        df_dep_resumen = df_filtered.groupby('Dependencia').agg(
            N_Proyectos=('Código', 'count'),
            Total_FF=('MONTO FF', 'sum')
        ).reset_index()
        
        df_dep_resumen.loc['Total General'] = ['Total general', df_dep_resumen['N_Proyectos'].sum(), df_dep_resumen['Total_FF'].sum()]
        df_dep_resumen['Total_FF'] = df_dep_resumen['Total_FF'].apply(lambda x: f"${x:,.0f}".replace(",", "."))
        df_dep_resumen.rename(columns={'N_Proyectos': 'N° de Proyectos', 'Total_FF': '$ Total FF'}, inplace=True)
        st.dataframe(df_dep_resumen, use_container_width=True, hide_index=True)
        
    with col_t2:
        st.markdown("**3. Proyectos por Investigador Responsable (IR)**")
        df_ir_resumen = df_filtered.groupby('Jefe Proyecto').agg(
            N_Proyectos=('Código', 'count'),
            Total_FF=('MONTO FF', 'sum')
        ).reset_index()
        
        df_ir_resumen.loc['Total General'] = ['Total general', df_ir_resumen['N_Proyectos'].sum(), df_ir_resumen['Total_FF'].sum()]
        df_ir_resumen['Total_FF'] = df_ir_resumen['Total_FF'].apply(lambda x: f"${x:,.0f}".replace(",", "."))
        df_ir_resumen.rename(columns={'Jefe Proyecto': 'IR', 'N_Proyectos': 'N° de Proyectos', 'Total_FF': 'Total $'}, inplace=True)
        st.dataframe(df_ir_resumen, use_container_width=True, height=400, hide_index=True)
