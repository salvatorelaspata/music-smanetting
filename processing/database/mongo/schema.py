# /processing/database/mongo/schema.py

"""
Schema MongoDB per il progetto music-smanetting.

Questo schema è stato progettato sulla base della struttura del frontend
e delle interazioni utente osservate nelle pagine e nei componenti.
"""

# -----------------
# Definizione delle Collection
# -----------------

# 1. Users Collection
#    - Memorizza le informazioni degli utenti che utilizzano l'applicazione.
#    - Ogni utente può avere più spartiti musicali.
user_schema = {
    "bsonType": "object",
    "required": ["_id", "username", "email", "createdAt", "updatedAt"],
    "properties": {
        "_id": {
            "bsonType": "objectId",
            "description": "Identificativo univoco dell'utente"
        },
        "username": {
            "bsonType": "string",
            "description": "Nome utente univoco"
        },
        "email": {
            "bsonType": "string",
            "description": "Indirizzo email univoco dell'utente"
        },
        "passwordHash": {
            "bsonType": "string",
            "description": "Hash della password dell'utente"
        },
        "createdAt": {
            "bsonType": "date",
            "description": "Data di creazione dell'utente"
        },
        "updatedAt": {
            "bsonType": "date",
            "description": "Data dell'ultimo aggiornamento dell'utente"
        }
    }
}


# 2. SheetMusic Collection
#    - Collection principale che memorizza gli spartiti musicali.
#    - Ogni documento rappresenta uno spartito completo con le sue pagine,
#      annotazioni e risultati di analisi.
sheet_music_schema = {
    "bsonType": "object",
    "required": ["_id", "userId", "name", "createdAt", "updatedAt", "status", "pages"],
    "properties": {
        "_id": {
            "bsonType": "objectId",
            "description": "Identificativo univoco dello spartito"
        },
        "userId": {
            "bsonType": "objectId",
            "description": "Riferimento all'utente proprietario dello spartito"
        },
        "name": {
            "bsonType": "string",
            "description": "Nome dello spartito (es. 'Sonata al Chiaro di Luna')"
        },
        "createdAt": {
            "bsonType": "date",
            "description": "Data di creazione dello spartito"
        },
        "updatedAt": {
            "bsonType": "date",
            "description": "Data dell'ultimo aggiornamento"
        },
        "status": {
            "bsonType": "string",
            "enum": ["scanned", "edited", "analyzed"],
            "description": "Stato attuale dello spartito"
        },
        "pages": {
            "bsonType": "array",
            "description": "Array di pagine che compongono lo spartito",
            "items": {
                "bsonType": "object",
                "required": ["_id", "pageNumber", "imageUrl"],
                "properties": {
                    "_id": {
                        "bsonType": "objectId",
                        "description": "Identificativo univoco della pagina"
                    },
                    "pageNumber": {
                        "bsonType": "int",
                        "description": "Numero di pagina progressivo"
                    },
                    "imageUrl": {
                        "bsonType": "string",
                        "description": "URL dell'immagine della pagina scansionata"
                    },
                    "annotations": {
                        "bsonType": "array",
                        "description": "Annotazioni aggiunte dall'utente a questa pagina",
                        "items": {
                            "bsonType": "object",
                            "required": ["_id", "text", "position"],
                            "properties": {
                                "_id": {
                                    "bsonType": "objectId",
                                    "description": "Identificativo univoco dell'annotazione"
                                },
                                "text": {
                                    "bsonType": "string",
                                    "description": "Testo dell'annotazione"
                                },
                                "position": {
                                    "bsonType": "object",
                                    "required": ["x", "y"],
                                    "properties": {
                                        "x": {"bsonType": "double"},
                                        "y": {"bsonType": "double"}
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        "analysis": {
            "bsonType": "object",
            "description": "Risultati dell'analisi musicale",
            "properties": {
                "key": {
                    "bsonType": "string",
                    "description": "Tonalità dello spartito (es. 'G Major')"
                },
                "timeSignature": {
                    "bsonType": "string",
                    "description": "Tempo dello spartito (es. '4/4')"
                },
                "tempo": {
                    "bsonType": "int",
                    "description": "Battiti per minuto (BPM)"
                },
                "measures": {
                    "bsonType": "int",
                    "description": "Numero di battute"
                },
                "notes": {
                    "bsonType": "array",
                    "description": "Distribuzione delle note",
                    "items": {
                        "bsonType": "object",
                        "required": ["type", "count"],
                        "properties": {
                            "type": {"bsonType": "string"},
                            "count": {"bsonType": "int"}
                        }
                    }
                }
            }
        }
    }
}

# Esempio di come si potrebbero definire le collection in un database MongoDB
# (questo codice è a scopo illustrativo)

"""
from pymongo import MongoClient

client = MongoClient('mongodb://localhost:27017/')
db = client['music_smanetting']

# Creazione delle collection con validazione dello schema
db.create_collection("users", validator={"$jsonSchema": user_schema})
db.create_collection("sheet_music", validator={"$jsonSchema": sheet_music_schema})

# Creazione di indici per ottimizzare le query
db.users.create_index("username", unique=True)
db.users.create_index("email", unique=True)
db.sheet_music.create_index("userId")

print("Collections 'users' and 'sheet_music' created with schema validation.")
"""
