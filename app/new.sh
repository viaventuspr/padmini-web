# පද්මිනී පන්තිය - GitHub Push Script (Advanced Debugged Version)

# 1. වැරදි credential paths නිවැරදි කිරීම
git config --global --unset credential.helper 2>/dev/null

# 2. පැරණි remote එකක් ඇත්නම් එය පිරිසිදු කර අලුත් එක එක් කිරීම
git remote remove origin 2>/dev/null
git remote add origin https://github.com/viaventuspr/GENERAL-KNOWLEDGE-PADMI-WEB-APP.git

# 3. ප්‍රධාන ශාඛාව 'main' ලෙස තහවුරු කිරීම
git branch -M main

# 4. කෝඩ් එක GitHub වෙත යැවීම
# වැදගත්: Password ලෙස ඔබ ලබාගත් Personal Access Token (ghp_...) භාවිතා කරන්න.
echo "කරුණාකර Username ලෙස viaventuspr සහ Password ලෙස ඔබේ PAT එක ලබා දෙන්න."
git push -u origin main
