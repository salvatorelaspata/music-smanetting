```markdown
# Crea la directory del progetto
mkdir -p /Users/salvatorelaspata/Documents/dev/music-smanetting/python-project
cd /Users/salvatorelaspata/Documents/dev/music-smanetting/python-project

# Crea l'ambiente virtuale
python -m venv venv

# Attiva l'ambiente virtuale
# Su macOS/Linux:
source venv/bin/activate
# Su Windows:
# venv\Scripts\activate

# Crea i file di base
touch README.md .gitignore requirements.txt
mkdir -p src/app
touch src/app/__init__.py src/app/main.py
```

```markdown
# Installa le dipendenze
pip install package_name

# Salva le dipendenze nel file requirements.txt
pip freeze > requirements.txt
```

```markdown
# Attiva l'ambiente virtuale
source venv/bin/activate  # Su macOS/Linux
# venv\Scripts\activate   # Su Windows

# Installa le dipendenze da requirements.txt
pip install -r requirements.txt

# Esegui il programma
python -m main
```


Inspiration 

https://github.com/afikanyati/cadenCV