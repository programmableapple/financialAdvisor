# Momentum - Financial Advisor Frontend

A modern, premium financial management dashboard built with React, Vite, and Tailwind CSS.

## 🚀 Features

- **Premium Design**: Modern "glassmorphism" UI with dark mode and vibrant gradients.
- **Responsive Layout**: Collapsible sidebar on desktop and full-screen drawer on mobile.
- **Smart Dashboard**: Real-time stats for income, expenses, and balance.
- **Transaction Management**: Easily track, search, and categorize your finances.
- **Security**: Secure authentication with JWT and password update functionality.
- **Clean Architecture**: Modular components and optimized asset management.

## 🛠️ Tech Stack

- **React 19** - UI Framework
- **Vite** - High-performance build tool
- **Tailwind CSS** - Utility-first styling
- **React Router 7** - Declarative routing
- **Axios** - API communication
- **React Hot Toast** - Elegant notifications
- **React Icons** - Minimalist icon set

## 🏁 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/)

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/programmableapple/financialAdvisor.git
    cd financialAdvisor/Frontend
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Set up environment variables (if applicable):
    Create a `.env` file in the `Frontend` directory and add:
    ```env
    VITE_API_BASE_URL=http://localhost:5000/api
    ```

4.  Start the development server:
    ```bash
    npm run dev
    ```

## 🏗️ Building for Production

To create an optimized production build:

```bash
npm run build
```

The output will be in the `dist` folder.

## 🧹 Code Quality

Run the linter to ensure code consistency:

```bash
npm run lint
```
