# PROJECT CONTEXT

## Project Title

A Visual Analytics Framework with Temporal Monitoring and Predictive Evaluation for Data-Driven Decision Support

## Project Description

This project is a full-stack AI-powered visual analytics platform designed to automatically analyze tabular datasets and generate intelligent insights for decision-making.

The system allows users to upload datasets (CSV files) and automatically performs:

- Automated exploratory data analysis (EDA)
- Machine learning analytics
- Visual dashboards
- AI insight generation
- Natural language analytics
- Temporal monitoring
- Predictive analysis
- Automated report generation

The platform should work with datasets from domains such as business analytics, healthcare, education, finance, and research.

---

# SYSTEM ARCHITECTURE

The system follows a microservice-based architecture:

Frontend → React.js Dashboard
Backend → Node.js Express API
AI Engine → Python FastAPI Analytics Service
Database → MongoDB Atlas
Queue System → Redis + BullMQ

Data flow:

User Upload Dataset
→ Backend Processes File
→ Job Sent to Analytics Engine
→ AI Engine Performs Analysis
→ Insights Stored in Database
→ Dashboard Displays Visualizations

---

# TECH STACK

Frontend

- React.js
- TailwindCSS
- Recharts
- Lucide React Icons
- Axios

Backend

- Node.js
- Express.js
- MongoDB Atlas
- Mongoose

AI Analytics Engine

- Python
- FastAPI
- Pandas
- NumPy
- Scikit-learn
- Prophet

Queue System

- Redis
- BullMQ

---

# CORE FEATURES

User Authentication

- Register
- Login
- JWT authentication
- Password hashing (bcrypt)

Dataset Management

- CSV dataset upload
- Dataset preview
- Metadata detection
- Dataset version tracking

Automated Data Analysis

- Mean, median, standard deviation
- Missing value detection
- Correlation analysis
- Distribution analysis
- Outlier detection

Machine Learning Analytics

- Isolation Forest (anomaly detection)
- KMeans clustering
- Linear regression predictions
- Prophet time series forecasting

AI Insight Generation
Generate insights such as:

"Revenue increased 18% in Q2."

"Customer age group 25–34 generates the highest purchases."

"An anomaly was detected in hospital admissions."

---

# AUTO INSIGHT RANKING

Each insight receives a score based on:

InsightScore =
0.5 × statistical significance

- 0.3 × business impact
- 0.2 × anomaly severity

The system should display the Top 5 insights.

---

# NATURAL LANGUAGE ANALYTICS

Users can query datasets using natural language.

Example queries:

Show revenue trend by region
Which product category has highest sales
Predict next month's revenue

The system should interpret the query and generate appropriate visualizations.

---

# TEMPORAL MONITORING

The platform tracks dataset changes across time.

Features:

- Dataset version tracking
- Trend detection
- Growth and decline analysis
- Seasonal pattern detection
- Automated anomaly alerts

---

# VISUAL ANALYTICS DASHBOARD

Frontend layout:

Sidebar Navigation

- Dashboard
- Datasets
- Analytics
- Insights
- Monitoring
- Predictions
- Reports
- Settings

Dashboard components:

- Summary cards
- Trend charts
- Correlation heatmap
- Distribution charts
- Insights panel
- Alerts panel

---

# CHART TYPES

The dashboard supports:

- Line charts
- Bar charts
- Pie charts
- Scatter plots
- Histograms
- Box plots
- Heatmaps
- Correlation matrix
- Cluster visualization
- Time-series charts

---

# REPORT GENERATION

Users can generate downloadable PDF reports containing:

- Dataset summary
- EDA results
- Visual charts
- AI insights
- Predictions
- Recommendations

---

# DEPLOYMENT

Frontend → Vercel
Backend → Render
AI Engine → Render
Database → MongoDB Atlas
Queue → Upstash Redis

---

# GOAL

The goal of this system is to build a scalable AI-driven visual analytics platform that enables automated data analysis and intelligent decision support across multiple domains.
