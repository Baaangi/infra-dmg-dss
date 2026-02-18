git checkout dev
git add .
git commit -m "Add authentication system"
git push origin dev

git checkout main
git pull origin main   # ← important step
git merge dev
git push origin main