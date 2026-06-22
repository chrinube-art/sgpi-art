import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
import numpy as np

# 1. Configuración de página avanzada
st.set_page_config(
    page_title="Dashboard Raihuén V4",
    page_icon="📊",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# 2. Inyección de CSS Institucional INIA
st.markdown("""
<style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
    html, body, [class*="css"] { font-family: 'Inter', sans-serif !important; background-color: #ffffff; }
    [data-testid="collapsedControl"] {display: none;}
    section[data-testid="stSidebar"] {display: none;}
    
    /* Colores Institucionales INIA */
    .stApp { background-color: #ffffff; }
    .top-bar { background-color: #0033a0; padding: 25px; text-align: center; color: white; font-weight: 800; font-size: 38px; letter-spacing: 2px; border-radius: 8px; margin-bottom: 0px;}
    img[data-testid="stImage"] { mix-blend-mode: multiply; }
    .kpi-card { background: white; padding: 20px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; text-align: center; margin-bottom: 15px; cursor: pointer; transition: 0.3s;}
    .kpi-card:hover { border-color: #009639; box-shadow: 0 4px 12px rgba(0,150,57,0.2); }
    .kpi-card.active { border: 2px solid #009639; background-color: #f0fdf4; }
    .kpi-value { font-size: 26px; font-weight: 700; color: #009639; margin-top: 5px; }
    .kpi-label { font-size: 15px; color: #1e293b; text-transform: uppercase; font-weight: 700;}
    .alert-elegante { background-color: #ffffff; color: #334155; padding: 12px 20px; border-radius: 8px; border-left: 4px solid #009639; font-size: 14px; font-weight: 500; box-shadow: 0 1px 2px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; margin-bottom: 20px;}
    
    /* Tabs a todo el ancho y más grandes */
    .stTabs [data-baseweb="tab-list"] {
        display: flex;
        width: 100%;
        gap: 2px;
    }
    .stTabs [data-baseweb="tab"] {
        flex: 1;
        text-align: center;
        padding-top: 15px !important;
        padding-bottom: 15px !important;
        border-radius: 8px 8px 0 0;
        white-space: pre-wrap;
    }
    .stTabs [data-baseweb="tab"] p, .stTabs [data-baseweb="tab"] span {
        font-size: 18px !important;
        font-weight: 800 !important;
    }
</style>
""", unsafe_allow_html=True)

# 3. Carga de Datos (Caché optimizado)
@st.cache_data(ttl=600)
def load_data():
    urls = {
        'db_main': 'https://docs.google.com/spreadsheets/d/1mO_4CyDLbeRBfYQh6tuUAJF79qwxbBWq/export?format=xlsx',
        'cuotas': 'https://docs.google.com/spreadsheets/d/1BaadTVwhe7kEHeKFkNnI3-FVMoNgdDpY/export?format=xlsx',
        'cat': 'https://docs.google.com/spreadsheets/d/1pv8cxzqljDlw_HZOBSJpMFTi8LCfn9zU/export?format=xlsx',
        'informes': 'https://docs.google.com/spreadsheets/d/1GoZ8ZeTLCxyJIrgUhOo7bM4iw8Q6B56X/export?format=xlsx'
    }
    data = {}
    try:
        df_main = pd.read_excel(urls['db_main'], sheet_name='BBDD PY', skiprows=1)
        df_main.columns = df_main.columns.str.strip()
        for col in ['MONTO FF', 'PECUNIO INIA', 'NO PECUNIO INIA', 'TOTAL PROYECTO']:
            if col in df_main.columns:
                df_main[col] = pd.to_numeric(df_main[col].astype(str).str.replace(r'[\$\.\s]', '', regex=True), errors='coerce').fillna(0)
        data['main'] = df_main

        df_cuotas = pd.read_excel(urls['cuotas'], sheet_name=0, skiprows=1)
        df_cuotas.columns = df_cuotas.columns.str.strip()
        data['cuotas'] = df_cuotas

        df_cat = pd.read_excel(urls['cat'], sheet_name=0, skiprows=1)
        df_cat.columns = df_cat.columns.str.strip()
        data['cat'] = df_cat

        df_informes = pd.read_excel(urls['informes'], sheet_name=0, skiprows=1)
        df_informes.columns = df_informes.columns.str.strip()
        if 'Fecha Vencimiento' in df_informes.columns:
            df_informes['Fecha Vencimiento'] = pd.to_datetime(df_informes['Fecha Vencimiento'], errors='coerce')
        data['informes'] = df_informes
    except Exception as e:
        st.error(f"Error al cargar datos: {e}")
    return data

def format_currency_clp(val):
    if pd.isna(val): return ""
    try:
        return f"${int(float(val)):,}".replace(",", ".")
    except:
        return val

with st.spinner("Sincronizando con bases de datos en Google Drive..."):
    data = load_data()

df_main = data.get('main', pd.DataFrame())
df_cuotas = data.get('cuotas', pd.DataFrame())
df_cat = data.get('cat', pd.DataFrame())
df_informes = data.get('informes', pd.DataFrame())

def sync_dark_mode(tab_id):
    st.session_state.master_dark = st.session_state.get(f"dark_{tab_id}", False)

def render_header(tab_id):
    if 'master_dark' not in st.session_state:
        st.session_state.master_dark = False
        
    import os
    if os.path.exists("Logo INIA Minagri.jpg"):
        col_logo, col_title, col_toggle = st.columns([1.2, 3, 1.2], vertical_alignment="center")
        with col_logo:
            st.image("Logo INIA Minagri.jpg", width=250)
        with col_title:
            st.markdown('<div class="top-bar">DASHBOARD RAIHUÉN</div>', unsafe_allow_html=True)
        with col_toggle:
            dark_mode = st.toggle("🌙 Panel Oscuro Profesional", key=f"dark_{tab_id}", value=st.session_state.master_dark, on_change=sync_dark_mode, args=(tab_id,))
            if st.session_state.master_dark:
                st.markdown("""
                <style>
                    .stApp { background-color: #0f172a !important; color: #f8fafc !important; }
                    .top-bar { background-color: #1e293b !important; color: #38bdf8 !important; border-bottom: 2px solid #38bdf8; }
                    .kpi-card { background-color: #1e293b !important; border-color: #334155 !important; color: white !important; }
                    .kpi-card.active { border: 2px solid #38bdf8 !important; background-color: #0f172a !important; }
                    .kpi-value { color: #38bdf8 !important; }
                    .kpi-label { color: #94a3b8 !important; }
                    .alert-elegante { background-color: #1e293b !important; color: #f8fafc !important; border-left: 4px solid #38bdf8 !important; border-color: #334155 !important;}
                    .stTabs [data-baseweb="tab"] { background-color: #1e293b !important; color: #cbd5e1 !important; border-bottom: 1px solid #334155; }
                    .stTabs [aria-selected="true"] { color: #38bdf8 !important; border-bottom: 2px solid #38bdf8 !important; background-color: #0f172a !important;}
                    img[data-testid="stImage"] { mix-blend-mode: normal !important; background-color: white !important; border-radius: 12px; padding: 10px; }
                    .marquee-container { background-color: #1e293b !important; border-color: #334155 !important; box-shadow: none !important; }
                    marquee { color: #38bdf8 !important; }
                    
                    /* Corrección de Fuentes, Headers y Widgets en Dark Mode */
                    h1, h2, h3, h4, h5, h6, p, span, label, div[data-testid="stMarkdownContainer"] { color: #f8fafc !important; }
                    .kpi-label { color: #94a3b8 !important; } /* Excepción para mantener gris tenue */
                    marquee { color: #38bdf8 !important; } /* Excepción para marquee */
                    
                    /* Botones Secundarios (Inactivos) */
                    .stButton > button { background-color: #1e293b !important; border-color: #334155 !important; }
                    .stButton > button p { color: #f8fafc !important; }
                    .stButton > button:hover { background-color: #334155 !important; border-color: #38bdf8 !important; }
                    .stButton > button:hover p { color: #38bdf8 !important; }
                    
                    /* Botones Primarios (Activos) - Evitar el rojo genérico */
                    .stButton > button[kind="primary"] { background-color: #0ea5e9 !important; border-color: #0ea5e9 !important; }
                    .stButton > button[kind="primary"] p { color: #ffffff !important; font-weight: bold !important; }
                    .stButton > button[kind="primary"]:hover { background-color: #0284c7 !important; border-color: #0284c7 !important; }
                    
                    /* Selectbox y Dropdowns */
                    div[data-baseweb="select"] > div { background-color: #1e293b !important; border-color: #334155 !important; color: #f8fafc !important; }
                    div[data-baseweb="select"] * { color: #f8fafc !important; }
                    
                    /* Tablas (st.table) */
                    div[data-testid="stTable"] { background-color: #1e293b !important; color: #f8fafc !important; }
                    div[data-testid="stTable"] th { background-color: #0f172a !important; color: #38bdf8 !important; border-bottom: 2px solid #38bdf8 !important; }
                    div[data-testid="stTable"] td { border-bottom: 1px solid #334155 !important; color: #f8fafc !important; }
                    table { background-color: #1e293b !important; color: #f8fafc !important; }
                    th { background-color: #0f172a !important; color: #38bdf8 !important; border-bottom: 2px solid #38bdf8 !important; }
                    td { border-bottom: 1px solid #334155 !important; color: #f8fafc !important; }
                </style>
                """, unsafe_allow_html=True)
    else:
        st.markdown('<div class="top-bar">DASHBOARD RAIHUÉN</div>', unsafe_allow_html=True)

    if not df_main.empty:
        top_ir = df_main['Jefe Proyecto'].value_counts().head(10)
        top_ir_str = " • ".join([f"{name} ({count})" for name, count in top_ir.items()])
        estado_counts = df_main['Estado Proyecto'].value_counts()
        estado_str = " • ".join([f"{est}: {count}" for est, count in estado_counts.items()])
        top_ff = df_main['Nombre FF'].value_counts().head(10)
        top_ff_str = " • ".join([f"{ff} ({count})" for ff, count in top_ff.items()])
        
        ticker_text = f"🏆 TOP 10 INVESTIGADORES: {top_ir_str} &nbsp;&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp; 📊 ESTADOS: {estado_str} &nbsp;&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp; 💰 PRINCIPALES FF: {top_ff_str}"
        
        st.markdown(f"""
        <div class="marquee-container" style="background-color: #f0fdf4; border: 2px solid #bbf7d0; padding: 15px; border-radius: 8px; margin-top: -45px; margin-bottom: 30px; box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.05); position: relative; z-index: 5;">
            <marquee behavior="scroll" direction="left" scrollamount="10" style="color: #166534; font-weight: 800; font-size: 24px; font-family: 'Inter', sans-serif;">
                {ticker_text}
            </marquee>
        </div>
        """, unsafe_allow_html=True)

# 4. Arquitectura de 5 Pestañas Superiores
t1, t2, t3, t4, t5 = st.tabs([
    "🏠 Portada Resumen", 
    "📊 Dashboard de Proyectos", 
    "💰 Cuotas de Proyectos", 
    "📅 Seguimiento de Informes", 
    "👥 Carga Anual de Tiempo (CAT)"
])

# --- PESTAÑA 1: Portada Resumen (Cerebro Institucional) ---
with t1:
    render_header(1)
    if not df_main.empty:
        # Estado Inicial
        if 'master_estado' not in st.session_state: st.session_state.master_estado = "Todos los Proyectos"
        if 'master_dinero' not in st.session_state: st.session_state.master_dinero = "TOTAL PROYECTO"
        if 'master_dep' not in st.session_state: st.session_state.master_dep = "Todos"
        
        st.write("### 🎛️ Panel de Control Ejecutivo")
        
        # Fila 1: Dependencias y Métrica
        col_dep, col_met = st.columns([1.5, 1])
        
        with col_dep:
            st.markdown("**📍 Dependencia Territorial:**")
            dep1, dep2, dep3 = st.columns(3)
            with dep1:
                if st.button("Todos", use_container_width=True, type="primary" if st.session_state.master_dep == "Todos" else "secondary"):
                    st.session_state.master_dep = "Todos"
                    st.rerun()
            with dep2:
                if st.button("Raihuén", use_container_width=True, type="primary" if st.session_state.master_dep == "Solo Raihuén" else "secondary"):
                    st.session_state.master_dep = "Solo Raihuén"
                    st.rerun()
            with dep3:
                if st.button("Cauquenes", use_container_width=True, type="primary" if st.session_state.master_dep == "Solo Cauquenes" else "secondary"):
                    st.session_state.master_dep = "Solo Cauquenes"
                    st.rerun()
                    
        with col_met:
            st.markdown("**💰 Métrica Financiera:**")
            met1, met2 = st.columns(2)
            with met1:
                if st.button("TOTAL PROYECTO", use_container_width=True, type="primary" if st.session_state.master_dinero == "TOTAL PROYECTO" else "secondary"):
                    st.session_state.master_dinero = "TOTAL PROYECTO"
                    st.rerun()
            with met2:
                if st.button("$ FF", use_container_width=True, type="primary" if st.session_state.master_dinero == "$ FF" else "secondary"):
                    st.session_state.master_dinero = "$ FF"
                    st.rerun()
                    
        st.markdown("<br>", unsafe_allow_html=True)
        
        col_dinero = 'TOTAL PROYECTO' if st.session_state.master_dinero == "TOTAL PROYECTO" else 'MONTO FF'
        
        # Filtrar base de datos según Dependencia
        df_base = df_main.copy()
        if st.session_state.master_dep == "Solo Raihuén":
            df_base = df_base[df_base['Dependencia'].astype(str).str.contains('Raihuén/Raihuén', case=False, na=False)]
        elif st.session_state.master_dep == "Solo Cauquenes":
            df_base = df_base[df_base['Dependencia'].astype(str).str.contains('Cauquenes', case=False, na=False)]
        
        # Data agregada para botones
        tot_all = len(df_base)
        monto_all = df_base[col_dinero].sum()
        
        df_ejec = df_base[df_base['Estado Proyecto'] == 'En Ejecución']
        tot_ejec = len(df_ejec)
        monto_ejec = df_ejec[col_dinero].sum()
        
        df_term = df_base[df_base['Estado Proyecto'] == 'Terminado']
        tot_term = len(df_term)
        monto_term = df_term[col_dinero].sum()
        
        # Botonera Activa (Usamos st.button para simular tarjetas que mutan el estado)
        st.markdown("**📊 Filtro de Estados de Proyectos:**")
        b1, b2, b3 = st.columns(3)
        with b1:
            if st.button(f"TODOS: {tot_all} Proy. | {format_currency_clp(monto_all)}", use_container_width=True, type="primary" if st.session_state.master_estado == "Todos los Proyectos" else "secondary"):
                st.session_state.master_estado = "Todos los Proyectos"
                st.rerun()
        with b2:
            if st.button(f"EN EJECUCIÓN: {tot_ejec} Proy. | {format_currency_clp(monto_ejec)}", use_container_width=True, type="primary" if st.session_state.master_estado == "En Ejecución" else "secondary"):
                st.session_state.master_estado = "En Ejecución"
                st.rerun()
        with b3:
            if st.button(f"TERMINADOS: {tot_term} Proy. | {format_currency_clp(monto_term)}", use_container_width=True, type="primary" if st.session_state.master_estado == "Terminados" else "secondary"):
                st.session_state.master_estado = "Terminados"
                st.rerun()
                
        # Filtrar DF Maestro para los gráficos
        if st.session_state.master_estado == "En Ejecución":
            df_dash = df_ejec
        elif st.session_state.master_estado == "Terminados":
            df_dash = df_term
        else:
            df_dash = df_base
            
        st.markdown("---")
        
        # BLOQUE A y B: Gráficos
        col_g1, col_g2 = st.columns(2)
        
        with col_g1:
            st.markdown("#### A. Fuentes de Financiamiento (FF)")
            
            # Layout dinámico para modo oscuro
            is_dark = st.session_state.get('master_dark', False)
            chart_bg = '#0f172a' if is_dark else 'rgba(0,0,0,0)'
            chart_font = '#f8fafc' if is_dark else '#1e293b'
            
            # Cantidad FF
            df_ff_cant = df_dash.groupby('Nombre FF').size().reset_index(name='Cantidad').sort_values('Cantidad', ascending=True)
            fig_ff_cant = px.bar(df_ff_cant, x='Cantidad', y='Nombre FF', orientation='h', title="N° Proyectos por FF", color_discrete_sequence=['#009639'], text='Cantidad')
            fig_ff_cant.update_traces(textfont_weight='bold', textfont_size=14, textposition='inside', insidetextanchor='middle', textfont_color='white', textangle=0)
            fig_ff_cant.update_layout(height=600, margin=dict(l=0, r=0, t=30, b=0), bargap=0.1, yaxis=dict(tickfont=dict(size=13)), paper_bgcolor=chart_bg, plot_bgcolor=chart_bg, font=dict(color=chart_font))
            st.plotly_chart(fig_ff_cant, use_container_width=True)
            
            # Montos FF
            df_ff_monto = df_dash.groupby('Nombre FF')[col_dinero].sum().reset_index().sort_values(col_dinero, ascending=True)
            df_ff_monto['Monto_MM'] = df_ff_monto[col_dinero] / 1000000
            fig_ff_monto = px.bar(df_ff_monto, x='Monto_MM', y='Nombre FF', orientation='h', title=f"Monto ({st.session_state.master_dinero}) en $MM", color_discrete_sequence=['#0033a0'], text='Monto_MM')
            fig_ff_monto.update_traces(texttemplate='$%{text:,.0f}MM', textposition='inside', textfont_size=14, textfont_weight='bold', textfont_color='white', textangle=0)
            fig_ff_monto.update_layout(height=600, margin=dict(l=0, r=0, t=30, b=0), bargap=0.1, xaxis_title="", yaxis=dict(tickfont=dict(size=13)), paper_bgcolor=chart_bg, plot_bgcolor=chart_bg, font=dict(color=chart_font))
            st.plotly_chart(fig_ff_monto, use_container_width=True)
            
        with col_g2:
            st.markdown("#### B. Por Investigador Responsable (IR)")
            # Cantidad IR
            df_ir_cant = df_dash.groupby('Jefe Proyecto').size().reset_index(name='Cantidad').sort_values('Cantidad', ascending=True)
            fig_ir_cant = px.bar(df_ir_cant, x='Cantidad', y='Jefe Proyecto', orientation='h', title="N° Proyectos por IR", color_discrete_sequence=['#009639'], text='Cantidad')
            fig_ir_cant.update_traces(textfont_weight='bold', textfont_size=14, textposition='inside', insidetextanchor='middle', textfont_color='white', textangle=0)
            fig_ir_cant.update_layout(height=600, margin=dict(l=0, r=0, t=30, b=0), bargap=0.1, yaxis=dict(tickfont=dict(size=13)), paper_bgcolor=chart_bg, plot_bgcolor=chart_bg, font=dict(color=chart_font))
            st.plotly_chart(fig_ir_cant, use_container_width=True)
            
            # Montos IR
            df_ir_monto = df_dash.groupby('Jefe Proyecto')[col_dinero].sum().reset_index().sort_values(col_dinero, ascending=True)
            df_ir_monto['Monto_MM'] = df_ir_monto[col_dinero] / 1000000
            fig_ir_monto = px.bar(df_ir_monto, x='Monto_MM', y='Jefe Proyecto', orientation='h', title=f"Monto ({st.session_state.master_dinero}) en $MM", color_discrete_sequence=['#0033a0'], text='Monto_MM')
            fig_ir_monto.update_traces(texttemplate='$%{text:,.0f}MM', textposition='inside', textfont_size=14, textfont_weight='bold', textfont_color='white', textangle=0)
            fig_ir_monto.update_layout(height=600, margin=dict(l=0, r=0, t=30, b=0), bargap=0.1, xaxis_title="", yaxis=dict(tickfont=dict(size=13)), paper_bgcolor=chart_bg, plot_bgcolor=chart_bg, font=dict(color=chart_font))
            st.plotly_chart(fig_ir_monto, use_container_width=True)

        # BLOQUE C: Resumen Territorial
        st.markdown("#### C. Resumen Territorial por Dependencia")
        if 'Dependencia' in df_dash.columns:
            dep_resumen = df_dash.groupby('Dependencia').agg(
                Proyectos=('Código', 'count'),
                Monto=(col_dinero, 'sum')
            ).reset_index()
            
            # Agregar Fila de Total
            total_fila = pd.DataFrame({
                'Dependencia': ['TOTAL GENERAL'],
                'Proyectos': [dep_resumen['Proyectos'].sum()],
                'Monto': [dep_resumen['Monto'].sum()]
            })
            dep_resumen = pd.concat([dep_resumen, total_fila], ignore_index=True)
            
            # Renombrar para presentación
            dep_resumen.columns = ['Territorio / Dependencia', 'N° de Proyectos', f'Total {st.session_state.master_dinero}']
            st.table(dep_resumen.style.format({f'Total {st.session_state.master_dinero}': format_currency_clp}))

# --- PESTAÑA 2: Dashboard de Proyectos ---
with t2:
    render_header(2)
    if not df_main.empty:
        # Filtros Superiores Horizontales Inline
        f1, f2, f3, f4 = st.columns(4)
        jefes = ["Todos"] + list(df_main['Jefe Proyecto'].dropna().unique())
        ffs = ["Todas"] + list(df_main['Nombre FF'].dropna().unique())
        dependencias = ["Todas"] + list(df_main['Dependencia'].dropna().unique())
        estados = ["Todos"] + list(df_main['Estado Proyecto'].dropna().unique())
        
        filtro_jp = f1.selectbox("Investigador / Jefe Proyecto:", jefes)
        filtro_ff = f2.selectbox("Fuente Financiamiento (FF):", ffs)
        filtro_dep = f3.selectbox("Dependencia / Territorio:", dependencias)
        filtro_estado = f4.selectbox("Estado de Proyecto:", estados)
        
        df_show = df_main.copy()
        if filtro_jp != "Todos": df_show = df_show[df_show['Jefe Proyecto'] == filtro_jp]
        if filtro_ff != "Todas": df_show = df_show[df_show['Nombre FF'] == filtro_ff]
        if filtro_dep != "Todas": df_show = df_show[df_show['Dependencia'] == filtro_dep]
        if filtro_estado != "Todos": df_show = df_show[df_show['Estado Proyecto'] == filtro_estado]
        
        st.subheader(f"Proyectos Filtrados ({len(df_show)})")
        cols_mostrar = ['Código', 'Título Proyecto', 'Jefe Proyecto', 'Estado Proyecto', 'Dependencia', 'TOTAL PROYECTO', 'PECUNIO INIA']
        cols_exist = [c for c in cols_mostrar if c in df_show.columns]
        
        # Aplicamos estilo CLP
        format_dict = {col: format_currency_clp for col in ['TOTAL PROYECTO', 'PECUNIO INIA', 'MONTO FF', 'NO PECUNIO INIA'] if col in cols_exist}
        with st.container(height=400):
            st.table(df_show[cols_exist].style.format(format_dict))
        
        st.markdown("---")
        st.subheader("Análisis Visual de Proyectos Filtrados")
        
        is_dark = st.session_state.get('master_dark', False)
        chart_bg = '#0f172a' if is_dark else 'rgba(0,0,0,0)'
        chart_font = '#f8fafc' if is_dark else '#1e293b'
        
        c_chart1, c_chart2 = st.columns(2)
        
        with c_chart1:
            if not df_show.empty:
                st.markdown("**Resumen Financiero por Fuente**")
                
                df_calc = df_show.copy()
                df_calc['TOTAL PROYECTO'] = pd.to_numeric(df_calc['TOTAL PROYECTO'], errors='coerce').fillna(0)
                
                # Agrupar por Nombre FF
                df_ff_res = df_calc.groupby('Nombre FF').agg(
                    Proyectos=('Nombre FF', 'count'),
                    Monto=('TOTAL PROYECTO', 'sum')
                ).reset_index()
                
                df_ff_res = df_ff_res.sort_values('Monto', ascending=False)
                # Guardamos los totales antes de modificar el dataframe
                total_proyectos = df_ff_res['Proyectos'].sum()
                total_monto = df_ff_res['Monto'].sum()
                
                # Renombrar para mostrar
                df_ff_res.columns = ['Fuente de Financiamiento', 'N° Proyectos', 'Monto Total']
                
                # Estilos condicionales para dataframe
                styled_df = df_ff_res.style.format({'Monto Total': format_currency_clp})
                if is_dark:
                    styled_df = styled_df.set_properties(**{
                        'background-color': '#1e293b',
                        'color': '#f8fafc',
                        'border-color': '#334155',
                        'font-family': 'Inter, sans-serif'
                    })
                else:
                    styled_df = styled_df.set_properties(**{
                        'font-family': 'Inter, sans-serif'
                    })
                    
                st.dataframe(styled_df, use_container_width=True, hide_index=True)
                
                # Resumen consolidado abajo para evitar que se ordene junto con la tabla
                st.markdown(f"""
                <div style="background-color: {'#1e293b' if is_dark else '#f1f5f9'}; padding: 10px; border-radius: 8px; text-align: center; border: 1px solid {'#334155' if is_dark else '#cbd5e1'};">
                    <strong>TOTAL GENERAL:</strong> {total_proyectos} Proyectos &nbsp;|&nbsp; {format_currency_clp(total_monto)}
                </div>
                """, unsafe_allow_html=True)
                
        with c_chart2:
            if not df_show.empty:
                df_ff = df_show.groupby('Nombre FF').size().reset_index(name='Cantidad').sort_values('Cantidad', ascending=True)
                # Tomamos solo el top 7 para que no sea inmenso verticalmente
                df_ff = df_ff.tail(7)
                fig_ff = px.bar(df_ff, x='Cantidad', y='Nombre FF', orientation='h', title="Top 7 Fuentes de Financiamiento", color_discrete_sequence=['#0033a0'], text='Cantidad')
                fig_ff.update_traces(textfont_weight='bold', textfont_size=14, textposition='inside', insidetextanchor='middle', textfont_color='white')
                fig_ff.update_layout(height=400, margin=dict(l=0, r=0, t=40, b=0), bargap=0.2, yaxis=dict(tickfont=dict(size=12)), xaxis_title="", yaxis_title="", paper_bgcolor=chart_bg, plot_bgcolor=chart_bg, font=dict(color=chart_font))
                st.plotly_chart(fig_ff, use_container_width=True)

# --- PESTAÑA 3: Cuotas de Proyectos ---
with t3:
    render_header(3)
    st.subheader("Control de Consumo de Cuotas")
    if not df_cuotas.empty:
        # Buscamos columnas de asginación
        cols = df_cuotas.columns.tolist()
        col_asig = [c for c in cols if 'Asignad' in c or 'Presupuesto' in c or 'Monto' in c]
        col_cons = [c for c in cols if 'Consumid' in c or 'Gasto' in c or 'Ejecutad' in c]
        
        with st.container(height=400):
            st.table(df_cuotas)
        
        if col_asig and col_cons:
            st.markdown("---")
            st.markdown("### Termómetros de Gasto (Top 10)")
            for idx, row in df_cuotas.head(10).iterrows():
                asig = pd.to_numeric(row[col_asig[0]], errors='coerce')
                cons = pd.to_numeric(row[col_cons[0]], errors='coerce')
                if pd.notna(asig) and asig > 0 and pd.notna(cons):
                    pct = (cons / asig) * 100
                    st.write(f"**{row.get('Títuloproyecto', row.get('Código', 'Proyecto Item'))}** - Consumo: {pct:.1f}%")
                    if pct > 90:
                        st.markdown(f'<div class="alert-roja">ALERTA ROJA: Consumo del {pct:.1f}% supera el umbral crítico.</div>', unsafe_allow_html=True)
                    else:
                        st.progress(min(pct / 100, 1.0))

# --- PESTAÑA 4: Seguimiento de Informes ---
with t4:
    render_header(4)
    st.subheader("Cronograma de Vencimientos e Informes")
    if not df_informes.empty and 'Fecha Vencimiento' in df_informes.columns:
        df_inf = df_informes.dropna(subset=['Fecha Vencimiento']).copy()
        df_inf = df_inf.sort_values('Fecha Vencimiento')
        
        # Filtro opcional por proyecto
        proys_inf = ["Todos"] + list(df_inf.get('Proyecto', df_inf.get('Títuloproyecto', pd.Series([]))).dropna().unique())
        f_proy = st.selectbox("Filtrar por Proyecto:", proys_inf)
        if f_proy != "Todos":
            col_p = 'Proyecto' if 'Proyecto' in df_inf.columns else 'Títuloproyecto'
            df_inf = df_inf[df_inf[col_p] == f_proy]
        
        now = pd.Timestamp.now()
        for idx, row in df_inf.head(25).iterrows():
            dias = (row['Fecha Vencimiento'] - now).days
            if dias < 5: color = "🔴"
            elif dias < 15: color = "🟡"
            else: color = "🟢"
                
            fecha_str = row['Fecha Vencimiento'].strftime('%d-%m-%Y')
            titulo = row.get('Título proyecto', row.get('Proyecto', row.get('Títuloproyecto', 'Informe')))
            estado = row.get('Estado', 'Pendiente')
            
            st.markdown(f"**{color} {fecha_str}** | **{estado}** | {titulo}")
    else:
        st.info("No se encontraron fechas de vencimiento en el archivo de Informes.")

# --- PESTAÑA 5: Carga Anual de Tiempo (CAT) ---
with t5:
    render_header(5)
    st.subheader("Directorio de Investigadores y Carga Laboral")
    if not df_main.empty and not df_cat.empty and 'Jefe Proyecto' in df_main.columns:
        investigadores = df_main['Jefe Proyecto'].dropna().unique()
        inv_sel = st.selectbox("Buscar Investigador:", sorted(investigadores))
        
        if inv_sel:
            df_inv_proy = df_main[df_main['Jefe Proyecto'] == inv_sel]
            
            if 'Empleado' in df_cat.columns or 'Nombres' in df_cat.columns:
                col_emp = 'Empleado' if 'Empleado' in df_cat.columns else 'Nombres'
                apellidos = inv_sel.split(',')[0].strip() if ',' in inv_sel else inv_sel.split(' ')[0]
                df_inv_cat = df_cat[df_cat[col_emp].str.contains(apellidos, case=False, na=False)]
                
                c1, c2 = st.columns([1,2])
                with c1:
                    st.markdown(f"### 📋 {inv_sel}")
                    st.write(f"Proyectos Asignados: **{len(df_inv_proy)}**")
                    
                    col_porc = [c for c in df_cat.columns if '%' in c or 'Particip' in c or 'Dedicacion' in c or 'Asignad' in c]
                    if col_porc:
                        carga_total = pd.to_numeric(df_inv_cat[col_porc[0]], errors='coerce').sum()
                        st.markdown(f"### Carga Estimada: {carga_total}%")
                        if carga_total > 100:
                            st.markdown('<div class="alert-roja">⚠️ SOBRECARGA LABORAL DETECTADA (>100%)</div>', unsafe_allow_html=True)
                with c2:
                    st.write("**Desglose Consola Anual de Tiempos (CAT)**")
                    with st.container(height=300):
                        st.table(df_inv_cat)
                    
            st.markdown("---")
            st.write("**Detalle Proyectos Liderados (Base de Datos Principal)**")
            cols_proy = ['Código', 'Título Proyecto', 'Desde', 'Hasta', 'TOTAL PROYECTO']
            cols_exist = [c for c in cols_proy if c in df_inv_proy.columns]
            format_dict = {col: format_currency_clp for col in ['TOTAL PROYECTO', 'PECUNIO INIA'] if col in cols_exist}
            with st.container(height=300):
                st.table(df_inv_proy[cols_exist].style.format(format_dict))
