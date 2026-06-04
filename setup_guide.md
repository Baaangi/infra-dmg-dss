# Project Setup Guide

Follow these steps to set up the project on a new machine.

## Prerequisites

1.  **Git**: [Download Git](https://git-scm.com/downloads)
2.  **Python** (3.8+): [Download Python](https://www.python.org/downloads/)
3.  **Node.js** (LTS version): [Download Node.js](https://nodejs.org/)

## 1. Get the Code

The best way is to clone the repository using Git:

```bash
git clone https://github.com/Baaangi/infra-dmg-dss.git
cd infra-dmg-dss (or whatever you named the folder)
```

*(Alternatively, downloading the ZIP works too, but `git clone` makes updates easier.)*

## 2. Backend Setup

Open a terminal in the project root:

1.  **Navigate to backend:**
    ```bash
    cd backend
    ```

2.  **Create a virtual environment:**
    ```bash
    python -m venv venv
    ```

3.  **Activate the virtual environment:**
    *   **Windows (PowerShell):**
        ```powershell
        .\venv\Scripts\Activate.ps1
        ```
    *   **Mac/Linux:**
        ```bash
        source venv/bin/activate
        ```

4.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

5.  **Run the server:**
    ```bash
    uvicorn main:app --reload
    ```
    The backend will start at `http://127.0.0.1:8000`.

## 3. Frontend Setup

Open a **new** terminal in the project root:

1.  **Navigate to frontend:**
    ```bash
    cd frontend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The frontend will start at `http://localhost:3000`.

## Troubleshooting

*   **Execution Policy Error (Windows):** If you can't activate the venv, run PowerShell as Administrator and execute: `Set-ExecutionPolicy RemoteSigned`.
*   **Missing `.env`:** If the project uses environment variables, check the documentation or ask the project owner for the `.env` file and place it in the `backend/` or `frontend/` folder as needed.
