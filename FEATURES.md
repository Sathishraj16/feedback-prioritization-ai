# Customer Feedback Prioritizer - Feature Documentation

## 🎯 Overview

An AI-powered customer feedback management system that uses swarm intelligence to automatically prioritize and categorize feedback using 5 specialized AI agents.

## ✨ Key Features

### 1. **Dashboard** (`/`)
- **Real-time Statistics**: Track total feedback, top priority scores, active clusters, and average priorities
- **Interactive Bubble Chart**: Visualize feedback clusters with size indicating volume
  - Hover tooltips showing cluster details
  - Smooth animations and transitions
  - Color-coded by category
- **Swarm AI Animation**: Live visualization of 5 AI agents analyzing feedback
  - Urgency Agent (time-sensitivity)
  - Impact Agent (user base affected)
  - Sentiment Agent (customer emotion)
  - Novelty Agent (innovation potential)
  - Effort Agent (implementation cost)
- **Top Priorities List**: Expandable cards showing highest-ranked feedback
  - Consensus scores from all agents
  - Customer details and submission dates
  - Quick action buttons

### 2. **Submit Feedback** (`/submit`)
- **Manual Entry Form**:
  - Title and description fields with character counters
  - Optional customer name and email
  - Auto-clustering on submission
  - Success confirmation with cluster assignment
- **CSV Bulk Upload**:
  - Drag-and-drop or file browser
  - Batch processing with progress tracking
  - Success/failure reporting
  - Format validation

### 3. **Swarm Analysis** (`/swarm`)
- **On-Demand AI Analysis**:
  - Enter any feedback ID to analyze
  - Sequential agent evaluation with progress bar
  - Real-time status updates for each agent
- **Detailed Results**:
  - Individual agent scores (0-100)
  - Reasoning for each score
  - Visual progress bars
  - Consensus score calculation
  - Automatic priority ranking

### 4. **Settings** (`/settings`)
- **Integrations**:
  - Slack - Real-time notifications
  - Notion - Database sync
  - Jira - Issue creation
  - GitHub - Repository linking
  - Linear - Issue tracking
  - Discord - Channel updates
- **Notifications**:
  - Email preferences
  - Push notifications
  - Weekly digest reports
- **Automation**:
  - Auto-analyze new feedback
  - Smart clustering (coming soon)
  - Team assignment rules (coming soon)

## 🗄️ Database Schema

### Tables:
1. **feedback**: Stores all customer feedback submissions
2. **clusters**: Categorizes feedback into topics
3. **swarmScores**: Individual AI agent evaluations
4. **topPriorities**: Ranked list based on consensus scores

### Relationships:
- Feedback → Clusters (many-to-one)
- SwarmScores → Feedback (many-to-one)
- TopPriorities → Feedback (one-to-one)

## 🤖 AI Agent System

### Scoring Algorithm:
Each agent analyzes feedback text using keyword matching and contextual analysis:

- **Urgency Agent**: Detects time-sensitive language (critical, urgent, asap, blocking)
- **Impact Agent**: Identifies scope keywords (all users, everyone, widespread)
- **Sentiment Agent**: Measures emotional tone (frustrated, angry vs. love, great)
- **Novelty Agent**: Evaluates innovation potential (new, unique, innovative)
- **Effort Agent**: Estimates implementation complexity (simple, easy vs. complex, difficult)

### Consensus Score:
- Average of all 5 agent scores
- Used to rank priorities
- Updates automatically on new analysis

## 🎨 UI/UX Features

### Design System:
- Modern, clean interface with shadcn/ui components
- Smooth animations using Framer Motion
- Responsive layout for all screen sizes
- Dark mode support
- Accessible color contrasts

### Interactions:
- Hover effects on interactive elements
- Loading states during async operations
- Toast notifications for user feedback
- Skeleton loaders for data fetching
- Expandable cards for detailed views

## 📊 Data Insights

### Pre-loaded Data:
- 1000+ synthetic feedback entries
- 18 diverse feedback clusters
- 3000+ AI agent scores
- 65 pre-ranked priorities

### Topics Covered:
- Critical Bugs
- Feature Requests
- Performance Issues
- UX Improvements
- Security Concerns
- Documentation Gaps
- Integration Requests

## 🚀 Usage Workflow

1. **Collect Feedback**:
   - Manual submission via form
   - CSV bulk upload
   - API integration (future)

2. **Automatic Processing**:
   - Auto-clustering by topic
   - Swarm AI analysis (optional auto-trigger)
   - Consensus score calculation

3. **Review Priorities**:
   - Dashboard bubble chart overview
   - Sorted priority list
   - Detailed agent reasoning

4. **Take Action**:
   - Export to project management tools
   - Share with team via integrations
   - Track implementation status

## 📈 Analytics & Reporting

### Available Metrics:
- Total feedback volume
- Feedback distribution by cluster
- Average priority scores
- Top issues requiring attention
- Trend analysis over time

### Export Options:
- Integration with Slack, Jira, Notion
- CSV download (future)
- API endpoints for custom reporting

## 🔐 Security & Privacy

- Environment-based database credentials
- Secure API endpoints
- Input validation on all forms
- SQL injection protection via Drizzle ORM
- XSS prevention in user content

## 🛠️ Technical Stack

- **Framework**: Next.js 15 with App Router
- **Database**: Turso (libSQL) with Drizzle ORM
- **UI**: shadcn/ui + Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **TypeScript**: Full type safety

## 📱 Responsive Design

- Mobile-first approach
- Collapsible sidebar for small screens
- Touch-optimized interactions
- Adaptive grid layouts
- Progressive enhancement

## 🎯 Future Enhancements

- [ ] Real ML-based clustering
- [ ] Advanced sentiment analysis
- [ ] Integration webhooks
- [ ] Custom agent configuration
- [ ] Multi-language support
- [ ] Advanced filtering & search
- [ ] Historical trend analysis
- [ ] Team collaboration features
- [ ] Custom workflows
- [ ] API documentation portal