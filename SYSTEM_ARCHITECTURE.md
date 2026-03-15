# SYSTEM ARCHITECTURE

## Project Title

A Visual Analytics Framework with Temporal Monitoring and Predictive Evaluation for Data-Driven Decision Support

---

# 1. Overview

This system is an AI-powered visual analytics platform designed to analyze tabular datasets and generate intelligent insights for decision-making.

The system architecture follows a **multi-service microservice architecture** consisting of:

- Frontend visualization dashboard
- Backend API gateway
- AI analytics engine
- Database storage
- Background processing system

The architecture is designed to support scalable analytics workflows including automated data analysis, machine learning predictions, anomaly detection, and natural language analytics.

---

# 2. System Components

## 2.1 Frontend Layer

Technology Stack:

- React.js
- TailwindCSS
- Recharts
- Lucide Icons
- Axios

Responsibilities:

- Provide interactive dashboard UI
- Display analytics charts
- Manage dataset uploads
- Display AI insights and alerts
- Handle natural language queries
- Show monitoring and predictions

Main UI Sections:

- Dashboard
- Dataset Manager
- Analytics
- Insights
- Monitoring
- Predictions
- Reports
- Settings

---

# 2.2 Backend API Layer

Technology Stack:

- Node.js
- Express.js
- Mongoose
- JWT Authentication

Responsibilities:

- User authentication
- Dataset management
- API gateway for analytics services
- Communication with AI engine
- Insight ranking
- Report generation

Main Backend Modules:

- Auth Service
- Dataset Service
- Analytics Orchestrator
- Insight Service
- Monitoring Service
- Report Service

---

# 2.3 AI Analytics Engine

Technology Stack:

- Python
- FastAPI
- Pandas
- NumPy
- Scikit-learn
- Prophet

Responsibilities:

- Exploratory Data Analysis
- Machine learning analytics
- anomaly detection
- clustering
- prediction models
- insight generation
- natural language analytics

Modules:

EDA Engine
Anomaly Detection Engine
Clustering Engine
Prediction Engine
Insight Generator
NLP Query Engine

---

# 2.4 Database Layer

Technology Stack:

MongoDB Atlas

Collections:

Users
Datasets
DatasetVersions
Insights
Reports
Alerts

Responsibilities:

- store datasets
- store analytics results
- store insights and alerts
- track dataset versions

---

# 2.5 Background Processing Layer

Technology Stack:

Redis
BullMQ

Responsibilities:

- process analytics jobs asynchronously
- trigger AI engine processing
- run monitoring tasks
- generate reports

Workflow:

Dataset upload
→ queue job created
→ worker processes dataset
→ AI engine analyzes dataset
→ insights stored in database

---

# 3. Data Processing Pipeline

1. User uploads dataset
2. Backend parses CSV file
3. Column types detected
4. Dataset stored in database
5. Analytics job sent to queue
6. AI engine performs EDA and ML analysis
7. Insights generated
8. Insights ranked
9. Dashboard displays results

---

# 4. Insight Ranking System

Insights are ranked using the formula:

InsightScore =
0.5 × statistical significance

- 0.3 × business impact
- 0.2 × anomaly severity

The dashboard displays the highest ranked insights.

---

# 5. Natural Language Analytics

Users can query datasets using natural language.

Example queries:

Show revenue trend by region
Which category has highest sales
Predict next month's revenue

The NLP engine interprets queries and generates analytics results.

---

# 6. Temporal Monitoring

The system tracks dataset changes across time.

Each dataset upload creates a new version.

Monitoring detects:

- trends
- growth
- decline
- seasonal patterns
- anomalies

Alerts are generated automatically.

---

# 7. Visualization System

The dashboard supports multiple chart types:

- Line charts
- Bar charts
- Pie charts
- Scatter plots
- Histograms
- Box plots
- Heatmaps
- Correlation matrices
- Cluster visualizations
- Time-series charts

---

# 8. Report Generation

Users can generate PDF reports containing:

- dataset summary
- EDA analysis
- visual charts
- AI insights
- predictions
- recommendations

Reports are generated using Puppeteer.

---

# 9. Deployment Architecture

Frontend → Vercel
Backend → Render
AI Engine → Render
Database → MongoDB Atlas
Queue → Upstash Redis

---

# 10. System Goals

The goal of this system is to provide an intelligent analytics platform that:

- automates data analysis
- generates insights automatically
- supports predictive analytics
- enables data-driven decision support
- works across multiple domains
