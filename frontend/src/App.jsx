import { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  ArrowDownToLine,
  ArrowRight,
  Bell,
  BookOpenCheck,
  CalendarDays,
  Check,
  ChevronDown,
  CircleHelp,
  CloudUpload,
  FileSpreadsheet,
  GraduationCap,
  LayoutDashboard,
  Menu,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
  TrendingUp,
  Users,
  X,
  XCircle,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const navigation = [
  { name: "Overview", icon: LayoutDashboard },
  { name: "Student Records", icon: Users },
  { name: "Upload Dataset", icon: CloudUpload },
  { name: "Predictions", icon: Activity },
  { name: "Analytics", icon: TrendingUp },
  { name: "Settings", icon: Settings },
];

const apiUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

function Sidebar({ activePage, onNavigate, open, onClose }) {
  return (
    <>
      {open && <button className="sidebar-backdrop" onClick={onClose} aria-label="Close navigation" />}
      <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-mark"><GraduationCap size={24} /></div>
          <div>
            <div className="brand-name">V3R<span>A</span></div>
            <p>ADMISSION INTELLIGENCE</p>
          </div>
          <button className="icon-button sidebar-close" onClick={onClose} aria-label="Close navigation"><X size={19} /></button>
        </div>

        <div className="workspace-label">WORKSPACE</div>
        <nav className="sidebar-navigation" aria-label="Main navigation">
          {navigation.map(({ name, icon: Icon }) => (
            <button
              key={name}
              onClick={() => onNavigate(name)}
              className={`nav-item ${activePage === name ? "active" : ""}`}
            >
              <Icon size={19} strokeWidth={1.9} />
              <span>{name}</span>
              {name === "Upload Dataset" && <span className="nav-new">CSV</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-tip">
            <span className="tip-icon"><Sparkles size={16} /></span>
            <strong>Smarter decisions</strong>
            <p>Turn student performance into clear admission insights.</p>
            <button onClick={() => onNavigate("Analytics")}>Explore analytics <ArrowRight size={14} /></button>
          </div>
          <div className="profile">
            <div className="avatar">V</div>
            <div className="profile-copy"><strong>V3R@ User</strong><small><i className="online-dot" /> Online</small></div>
            <ChevronDown size={16} className="profile-chevron" />
          </div>
        </div>
      </aside>
    </>
  );
}

function Topbar({ activePage, onMenu, onNavigate, backendStatus }) {
  const [query, setQuery] = useState("");
  const [noticeOpen, setNoticeOpen] = useState(false);

  function searchSubmit(event) {
    event.preventDefault();
    const match = navigation.find(({ name }) => name.toLowerCase().includes(query.trim().toLowerCase()));
    if (match && query.trim()) {
      onNavigate(match.name);
      setQuery("");
    }
  }

  return (
    <header className="topbar">
      <button className="icon-button mobile-menu" onClick={onMenu} aria-label="Open navigation"><Menu size={21} /></button>
      <div className="topbar-title">
        <span className="breadcrumb">Workspace <span>/</span></span>
        <h1>{activePage === "Overview" ? "Admission overview" : activePage}</h1>
      </div>
      <form className="search-box" onSubmit={searchSubmit}>
        <Search size={17} />
        <input aria-label="Search navigation" placeholder="Search pages..." value={query} onChange={(event) => setQuery(event.target.value)} />
        <kbd>↵</kbd>
      </form>
      <div className="topbar-divider" />
      <div className={`system-status ${backendStatus}`}><i /> <span>{backendStatus === "online" ? "System online" : backendStatus === "checking" ? "Checking API" : "API offline"}</span></div>
      <div className="notice-wrap">
        <button className={`icon-button notification-button ${noticeOpen ? "selected" : ""}`} onClick={() => setNoticeOpen(!noticeOpen)} aria-label="Notifications">
          <Bell size={19} /><i className="notification-dot" />
        </button>
        {noticeOpen && <div className="notification-popover"><strong>You’re all caught up</strong><p>Dataset predictions and system updates will appear here.</p></div>}
      </div>
      <button className="top-user" onClick={() => onNavigate("Settings")} aria-label="Open user settings">
        <span className="avatar top-avatar">V</span><span className="top-user-copy"><strong>V3R@ User</strong><small>Administrator</small></span><ChevronDown size={15} />
      </button>
    </header>
  );
}

function MetricCard({ title, value, caption, icon: Icon, tone }) {
  return (
    <article className={`metric-card ${tone}`}>
      <div className="metric-card-top"><span className="metric-icon"><Icon size={19} /></span><span className="metric-period">CURRENT DATA</span></div>
      <div className="metric-number">{value}</div>
      <div className="metric-bottom"><strong>{title}</strong><span>{caption}</span></div>
      <div className="metric-accent" />
    </article>
  );
}

function EmptyChart({ onUpload }) {
  return (
    <div className="empty-chart">
      <span className="empty-chart-icon"><Activity size={21} /></span>
      <strong>Your admission trends will show here</strong>
      <p>Upload a student dataset to generate your first prediction report.</p>
      <button className="empty-state-button" onClick={onUpload}>Upload a dataset <ArrowRight size={15} /></button>
    </div>
  );
}

function AdmissionChart({ summary, onUpload }) {
  const chartData = summary ? [{ batch: "Latest batch", admitted: summary.admitted, rejected: summary.rejected }] : [];
  return (
    <section className="panel chart-panel">
      <div className="panel-heading">
        <div><span className="eyebrow">MODEL OUTPUT</span><h2>Admission prediction</h2><p>Student outcomes from your latest dataset</p></div>
        {summary && <span className="batch-pill"><span /> Latest batch</span>}
      </div>
      {chartData.length ? (
        <div className="chart-area">
          <div className="chart-legend"><span><i className="legend-admitted" /> Admitted <b>{summary.admitted}</b></span><span><i className="legend-rejected" /> Rejected <b>{summary.rejected}</b></span></div>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barGap={18} margin={{ top: 16, right: 12, left: -18, bottom: 0 }}>
              <CartesianGrid stroke="#edf0f6" vertical={false} />
              <XAxis dataKey="batch" axisLine={false} tickLine={false} tick={{ fill: "#8992a5", fontSize: 12 }} dy={10} />
              <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: "#8992a5", fontSize: 12 }} />
              <Tooltip cursor={{ fill: "#f7f8fc" }} contentStyle={{ border: "1px solid #e8ebf2", borderRadius: 12, boxShadow: "0 8px 24px #17203312" }} />
              <Bar dataKey="admitted" name="Admitted" fill="#064e59" radius={[7, 7, 0, 0]} maxBarSize={72} />
              <Bar dataKey="rejected" name="Rejected" fill="#a4d0cc" radius={[7, 7, 0, 0]} maxBarSize={72} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : <EmptyChart onUpload={onUpload} />}
    </section>
  );
}

function Overview({ summary, onNavigate }) {
  return (
    <div className="page-content">
      <section className="welcome-banner">
        <div className="welcome-banner-copy">
          <span className="welcome-greeting">Welcome back,</span>
          <h2>V3RA Admission Intelligence</h2>
          <p>Here’s how your student admission predictions and batch analytics are performing.</p>
        </div>
        <div className="welcome-banner-actions">
          <span className="batch-selector"><CalendarDays size={15} /> Batch: Fall 2026 Dataset</span>
          <button className="welcome-primary" onClick={() => onNavigate("Upload Dataset")}><CloudUpload size={16} /> Upload CSV Dataset</button>
        </div>
        <div className="welcome-visual" aria-hidden="true">
          <span className="visual-orb visual-orb-large" />
          <span className="visual-orb visual-orb-small" />
          <div className="visual-chart"><span /><span /><span /><span /></div>
        </div>
      </section>
      <div className="section-heading"><div><span className="eyebrow"></span><h2>Admission at a glance</h2></div><span className="data-note"><i /> Updates when you upload data</span></div>
      <div className="metrics-grid">
        <MetricCard title="Total students" value={summary?.total ?? 0} caption={summary ? "In latest dataset" : "Awaiting dataset"} icon={Users} tone="metric-blue" />
        <MetricCard title="Admitted" value={summary?.admitted ?? 0} caption={summary ? "Predicted eligible" : "No predictions yet"} icon={Check} tone="metric-green" />
        <MetricCard title="Rejected" value={summary?.rejected ?? 0} caption={summary ? "Predicted not eligible" : "No predictions yet"} icon={XCircle} tone="metric-orange" />
        <MetricCard title="Admission rate" value={summary ? `${summary.admission_rate}%` : "0%"} caption={summary ? "From latest dataset" : "Calculated after upload"} icon={TrendingUp} tone="metric-purple" />
      </div>
      <div className="dashboard-lower">
        <AdmissionChart summary={summary} onUpload={() => onNavigate("Upload Dataset")} />
        <section className="panel insight-panel">
          <span className="quote-mark" aria-hidden="true">“</span>
          <blockquote>Smarter data is more than numbers—it’s fairness, clarity, and student potential.</blockquote>
          <div className="insight-rule" />
          <p className="mission-note">Our mission is to help admissions teams make responsible, informed decisions for every learner.</p>
        </section>
      </div>
      <section className="workflow-banner">
        <div className="workflow-ready">
          <span className="workflow-ready-icon"><Trophy size={19} /></span>
          <div><strong>Ready to Predict!</strong><p>Your AI admission model is calibrated and awaiting student records.</p></div>
        </div>
        <div className="workflow-steps">
          <div className="workflow-step"><span className="workflow-step-icon"><FileSpreadsheet size={18} /></span><div><strong>1. Upload CSV</strong><p>Import student scores &amp; demographics</p></div></div>
          <div className="workflow-step"><span className="workflow-step-icon"><Sparkles size={18} /></span><div><strong>2. Run AI Model</strong><p>Generate instant admission outcomes</p></div></div>
          <div className="workflow-step"><span className="workflow-step-icon"><Target size={18} /></span><div><strong>3. Export Insights</strong><p>Review acceptance rates &amp; trends</p></div></div>
        </div>
      </section>
    </div>
  );
}

function UploadPage({ onResults }) {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submitFile(selectedFile) {
    if (!selectedFile) return;
    setError("");
    if (!selectedFile.name.toLowerCase().endsWith(".csv")) {
      setError("Please choose a CSV file.");
      return;
    }
    setFile(selectedFile);
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      const response = await fetch(`${apiUrl}/predict-batch`, { method: "POST", body: formData });
      const contentType = response.headers.get("content-type") || "";
      const result = contentType.includes("application/json") ? await response.json() : null;
      if (!response.ok) {
        throw new Error(result?.detail || `Prediction request failed (${response.status}). Please try again.`);
      }
      if (!result?.summary || !Array.isArray(result.results)) {
        throw new Error("The backend returned an invalid prediction response.");
      }
      onResults(result);
    } catch (requestError) {
      if (requestError instanceof TypeError) {
        setError(`Unable to connect to the prediction service at ${apiUrl}. Start the backend on port 8000, then retry.`);
      } else {
        setError(requestError.message || "Unable to process the dataset.");
      }
    } finally {
      setLoading(false);
    }
  }

  function onDrop(event) {
    event.preventDefault();
    setDragging(false);
    submitFile(event.dataTransfer.files?.[0]);
  }

  return (
    <div className="page-content secondary-page">
      <div className="page-intro"><span className="eyebrow">DATA WORKSPACE</span><h2>Upload a dataset</h2><p>Run admission predictions on student scores with a CSV file.</p></div>
      <section className="panel upload-panel">
        <div className="upload-title"><div className="upload-title-icon"><CloudUpload size={21} /></div><div><h3>Import student data</h3><p>Your file is securely processed by the V3RA prediction API.</p></div></div>
        <button className={`drop-zone ${dragging ? "dragging" : ""}`} onClick={() => inputRef.current?.click()} onDragOver={(event) => { event.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={onDrop}>
          <span className="drop-icon"><CloudUpload size={27} /></span>
          <strong>{file ? file.name : "Drop your CSV file here"}</strong>
          <span>{file ? "Click to choose a different file" : "or click to browse from your computer"}</span>
          <small>CSV files only · Required columns: Score1, Score2</small>
          <input ref={inputRef} type="file" accept=".csv,text/csv" hidden onChange={(event) => submitFile(event.target.files?.[0])} />
        </button>
        {error && <div className="error-message" role="alert"><CircleHelp size={17} />{error}</div>}
        {loading && <div className="loading-message"><span className="spinner" />Analyzing student scores…</div>}
        <div className="upload-help"><ShieldCheck size={16} /><span><b>Data stays under your control.</b> Only score columns are sent to the configured backend for prediction.</span></div>
      </section>
      <section className="panel format-panel"><div><span className="eyebrow">FILE FORMAT</span><h3>Prepare your CSV</h3><p>Use a header row with the two score columns. Column names are case-insensitive.</p></div><div className="csv-preview"><div className="csv-preview-head"><span><FileSpreadsheet size={15} /> students.csv</span><span>Example</span></div><div className="csv-row csv-header"><span>Score1</span><span>Score2</span></div><div className="csv-row"><span>80</span><span>70</span></div><div className="csv-row"><span>90</span><span>85</span></div></div></section>
    </div>
  );
}

function ResultsTable({ records }) {
  if (!records?.length) return <div className="empty-state"><span className="empty-chart-icon"><Users size={20} /></span><strong>No student records yet</strong><p>Upload a CSV dataset to see prediction results here.</p></div>;
  return <div className="table-scroll"><table><thead><tr><th>#</th><th>Score 1</th><th>Score 2</th><th>Prediction</th><th>Confidence</th></tr></thead><tbody>{records.map((record) => <tr key={record.id}><td className="muted-cell">{String(record.id).padStart(2, "0")}</td><td>{record.score1}</td><td>{record.score2}</td><td><span className={`result-badge ${record.prediction === "Admitted" ? "admitted" : "rejected"}`}><i />{record.prediction}</span></td><td>{record.confidence}%</td></tr>)}</tbody></table></div>;
}

function ResultsPage({ activePage, results }) {
  const records = results?.results || [];
  return <div className="page-content secondary-page"><div className="page-intro"><span className="eyebrow">PREDICTION WORKSPACE</span><h2>{activePage}</h2><p>{activePage === "Student Records" ? "Review student scores and their predicted admission outcomes." : "Prediction results from your latest uploaded dataset."}</p></div><section className="panel records-panel"><div className="records-heading"><div><h3>{results ? `${results.summary.total} student results` : "Latest predictions"}</h3><p>{results ? `${results.summary.admitted} admitted · ${results.summary.rejected} rejected` : "Your latest dataset results will appear here."}</p></div><span className="table-status"><i />{results ? "Complete" : "Waiting for data"}</span></div><ResultsTable records={records} /></section></div>;
}

function AnalyticsPage({ summary, results, onNavigate }) {
  return <div className="page-content secondary-page"><div className="page-intro"><span className="eyebrow">INSIGHT CENTER</span><h2>Analytics</h2><p>Explore a clear breakdown of your latest admission predictions.</p></div><div className="analytics-summary"><MetricCard title="Students analyzed" value={summary?.total ?? 0} caption="Latest dataset" icon={Users} tone="metric-blue" /><MetricCard title="Admission rate" value={summary ? `${summary.admission_rate}%` : "0%"} caption="Latest dataset" icon={TrendingUp} tone="metric-green" /></div><AdmissionChart summary={summary} onUpload={() => onNavigate("Upload Dataset")} /><section className="panel analytics-table"><div className="records-heading"><div><h3>Prediction details</h3><p>Individual student outcomes</p></div></div><ResultsTable records={results?.results || []} /></section></div>;
}

function SettingsPage() {
  return <div className="page-content secondary-page"><div className="page-intro"><span className="eyebrow">PREFERENCES</span><h2>Settings</h2><p>Application connection details and workspace information.</p></div><section className="panel settings-panel"><div className="settings-row"><span className="settings-icon"><Activity size={18} /></span><div><strong>Prediction API</strong><p>Frontend requests are sent to the configured V3RA backend.</p></div><span className="settings-value">{apiUrl}</span></div><div className="settings-row"><span className="settings-icon green"><ShieldCheck size={18} /></span><div><strong>Workspace status</strong><p>Backend status can be checked from the health endpoint.</p></div><a className="settings-link" href={`${apiUrl}/health`} target="_blank" rel="noreferrer">Check health <ArrowRight size={14} /></a></div></section></div>;
}

export default function App() {
  const [activePage, setActivePage] = useState("Overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [results, setResults] = useState(null);
  const [backendStatus, setBackendStatus] = useState("checking");
  const summary = useMemo(() => results?.summary || null, [results]);

  useEffect(() => {
    let active = true;
    async function checkBackend() {
      try {
        const response = await fetch(`${apiUrl}/health`);
        if (!response.ok) throw new Error("Health check failed");
        const health = await response.json();
        if (!health.model_loaded || !health.scaler_loaded) throw new Error("Prediction artifacts are not loaded");
        if (active) setBackendStatus("online");
      } catch {
        if (active) setBackendStatus("offline");
      }
    }

    checkBackend();
    const intervalId = window.setInterval(checkBackend, 30000);
    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, []);

  function navigate(page) {
    setActivePage(page);
    setSidebarOpen(false);
  }

  let page;
  if (activePage === "Overview") page = <Overview summary={summary} onNavigate={navigate} />;
  else if (activePage === "Upload Dataset") page = <UploadPage onResults={setResults} />;
  else if (activePage === "Analytics") page = <AnalyticsPage summary={summary} results={results} onNavigate={navigate} />;
  else if (activePage === "Student Records" || activePage === "Predictions") page = <ResultsPage activePage={activePage} results={results} />;
  else page = <SettingsPage />;

  return <div className="app-shell"><Sidebar activePage={activePage} onNavigate={navigate} open={sidebarOpen} onClose={() => setSidebarOpen(false)} /><main className="main-area"><Topbar activePage={activePage} onMenu={() => setSidebarOpen(true)} onNavigate={navigate} backendStatus={backendStatus} />{page}<footer className="footer"><span>V3RA <span>·</span> Student Admission &amp; Batch Analytics Hub</span><span>Thoughtful insights for every student.</span></footer></main></div>;
}
