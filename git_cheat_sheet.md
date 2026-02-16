# Git Workflow Guide

Use this guide to save your changes and keep your project backed up to GitHub.

## 1. Check Status
Before doing anything, see what files have changed:
```bash
git status
```
*   **Red files:** Modified but not staged.
*   **Green files:** Staged and ready to commit.

## 2. Stage Changes
Add your changes to the staging area:
```bash
# Add all changes (easiest)
git add .

# OR add specific files
git add filename.py
```

## 3. Commit Changes
Save a snapshot of your staged changes with a message:
```bash
git commit -m "Describe what you changed here"
```
*Example: `git commit -m "fix: updated inspection form validation"`*

## 4. Push to GitHub (Backup)
Upload your commits to the remote repository:
```bash
git push origin main
```
*(If you are working on a different branch like `dev`, use `git push origin dev`)*

## Working on Multiple Computers?

### Before starting work:
Verify you have the latest code from GitHub:
```bash
git pull origin main
```

### If you have merge conflicts:
1.  Open the files with conflicts (VS Code highlights them).
2.  Choose "Accept Current Change" or "Accept Incoming Change".
3.  Save the files.
4.  Run:
    ```bash
    git add .
    git commit -m "Resolved merge conflicts"
    git push origin main
    ```
