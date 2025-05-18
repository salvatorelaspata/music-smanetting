```markdown
# Crea la directory del progetto
mkdir -p /Users/salvatorelaspata/Documents/dev/music-smanetting/python-project
cd /Users/salvatorelaspata/Documents/dev/music-smanetting/python-project

# Crea l'ambiente virtuale
# Gli ambienti virtuali sono essenziali per isolare le dipendenze del progetto
python -m venv venv

# Attiva l'ambiente virtuale
# Su macOS/Linux:
source venv/bin/activate
# Su Windows:
# venv\Scripts\activate

# Crea i file di base necessari per la struttura del progetto
touch README.md .gitignore requirements.txt
mkdir -p src/app
touch src/app/__init__.py src/app/main.py
```

```markdown
# Installa le dipendenze necessarie per il progetto
pip install package_name

# Salva le dipendenze nel file requirements.txt per facilitare la riproduzione dell'ambiente
pip freeze > requirements.txt
```

```markdown
# Attiva l'ambiente virtuale prima di eseguire il progetto
source venv/bin/activate  # Su macOS/Linux
# venv\Scripts\activate   # Su Windows

# Installa tutte le dipendenze da requirements.txt
pip install -r requirements.txt

# Esegui il programma principale
python -m main
```


Ispirazione 

https://github.com/afikanyati/cadenCV