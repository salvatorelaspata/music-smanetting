import os
import json
import uuid
import shutil
from flask import Flask, request, jsonify, send_file, render_template_string
from flask_cors import CORS
from werkzeug.utils import secure_filename
import cv2
import base64
from datetime import datetime
import zipfile
import tempfile

# Import delle funzioni di processamento esistenti
from src.pdf_utils import is_pdf, pdf_to_images
from src.deskewing import get_ref_lengths
from src.staffline_detection import (
    find_staffline_rows,
    find_staffline_columns,
    create_staffs,
)
from src.detection import find_clef_time_signature, find_primitive

app = Flask(__name__)
CORS(app, origins=["*"])  # Permetti accesso da qualsiasi origine per la demo

# Configurazione
UPLOAD_FOLDER = "uploads"
OUTPUT_FOLDER = "output"
MAX_FILE_SIZE = 16 * 1024 * 1024  # 16MB max file size

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.config["OUTPUT_FOLDER"] = OUTPUT_FOLDER
app.config["MAX_CONTENT_LENGTH"] = MAX_FILE_SIZE

# Assicurati che le cartelle esistano
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

# Estensioni di file permesse
ALLOWED_EXTENSIONS = {"pdf", "png", "jpg", "jpeg", "gif", "bmp", "tiff", "tif"}


def allowed_file(filename):
    """Verifica se il file ha un'estensione permessa"""
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


def get_file_info(filepath):
    """Ottiene informazioni di base su un file"""
    if not os.path.exists(filepath):
        return None

    stat = os.stat(filepath)
    return {
        "size": stat.st_size,
        "modified": datetime.fromtimestamp(stat.st_mtime).isoformat(),
        "is_pdf": is_pdf(filepath),
    }


def encode_image_to_base64(image_path):
    """Converte un'immagine in base64 per la risposta JSON"""
    try:
        with open(image_path, "rb") as img_file:
            return base64.b64encode(img_file.read()).decode("utf-8")
    except Exception as e:
        print(f"Errore nell'encoding dell'immagine {image_path}: {e}")
        return None


@app.route("/", methods=["GET"])
def home():
    """Endpoint di benvenuto - serve la demo HTML se richiesta nel browser"""
    # Se la richiesta è da un browser (ha header Accept con text/html)
    accept_header = request.headers.get("Accept", "")
    if "text/html" in accept_header:
        return demo_client()

    # Altrimenti restituisci le informazioni API
    return jsonify(
        {
            "message": "Music Sheet Processing Server",
            "version": "1.0.0",
            "endpoints": {
                "/": "GET - Home page (serve demo se richiesta da browser)",
                "/demo": "GET - Interfaccia web demo",
                "/api/docs": "GET - Documentazione API",
                "/upload": "POST - Carica e processa un file (PDF o immagine)",
                "/process/<job_id>": "GET - Ottieni il risultato di un processamento",
                "/jobs": "GET - Lista di tutti i lavori di processamento",
                "/jobs/<job_id>/download": "GET - Scarica i risultati come ZIP",
                "/jobs/<job_id>/delete": "DELETE - Elimina un lavoro",
                "/health": "GET - Stato del server",
            },
        }
    )


@app.route("/demo", methods=["GET"])
def demo_client():
    """Serve l'interfaccia web demo per il processamento di spartiti musicali"""

    # Prova prima il template nella cartella templates
    templates_path = os.path.join(os.path.dirname(__file__), "templates", "demo.html")

    # Poi prova il file client.html nella directory corrente
    client_html_path = os.path.join(os.path.dirname(__file__), "client.html")

    html_content = None

    # Prova a leggere il template
    for path in [templates_path, client_html_path]:
        try:
            with open(path, "r", encoding="utf-8") as f:
                html_content = f.read()
                break
        except FileNotFoundError:
            continue

    if html_content:
        # Modifica l'API_BASE per puntare al server corrente (se necessario)
        if "const API_BASE = 'http://localhost:5001';" in html_content:
            html_content = html_content.replace(
                "const API_BASE = 'http://localhost:5001';",
                "const API_BASE = window.location.origin;",
            )
        return html_content
    else:
        # Se nessun file è trovato, restituisci una versione inline semplificata
        return render_template_string(get_inline_demo_html())


def get_inline_demo_html():
    """Restituisce una versione inline dell'HTML demo"""
    return """
<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Music Sheet Processing Server - Demo</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            max-width: 800px; 
            margin: 0 auto; 
            padding: 20px; 
            background: #f5f5f5;
        }
        .container { 
            background: white; 
            padding: 30px; 
            border-radius: 10px; 
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .upload-area { 
            border: 2px dashed #ccc; 
            padding: 40px; 
            text-align: center; 
            margin: 20px 0; 
            border-radius: 10px;
        }
        .upload-area:hover { border-color: #007bff; }
        .btn { 
            background: #007bff; 
            color: white; 
            border: none; 
            padding: 12px 25px; 
            border-radius: 5px; 
            cursor: pointer; 
            margin: 10px;
        }
        .btn:hover { background: #0056b3; }
        .status { 
            padding: 15px; 
            margin: 10px 0; 
            border-radius: 5px; 
            display: none;
        }
        .status.success { background: #d4edda; color: #155724; }
        .status.error { background: #f8d7da; color: #721c24; }
        .results { margin-top: 30px; display: none; }
        .result-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
        .result-card { border: 1px solid #ddd; padding: 15px; border-radius: 8px; }
        .result-image { width: 100%; max-height: 200px; object-fit: cover; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎼 Music Sheet Processor - Demo</h1>
        <p>Carica i tuoi spartiti musicali per l'analisi automatica</p>
        
        <div class="upload-area" onclick="document.getElementById('fileInput').click()">
            <h3>📁 Carica Spartito</h3>
            <p>Clicca qui per selezionare un file PDF o immagine</p>
            <input type="file" id="fileInput" style="display: none;" accept=".pdf,.jpg,.jpeg,.png,.gif,.bmp,.tiff,.tif">
        </div>
        
        <button class="btn" id="processBtn" onclick="processFile()" style="display: none;">
            🚀 Elabora Spartito
        </button>
        
        <div class="status" id="status"></div>
        
        <div class="results" id="results">
            <h3>📊 Risultati</h3>
            <div id="stats"></div>
            <div class="result-grid" id="resultsGrid"></div>
        </div>
    </div>

    <script>
        const API_BASE = window.location.origin;
        let currentJobId = null;

        document.getElementById('fileInput').addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                document.getElementById('processBtn').style.display = 'inline-block';
                showStatus(`File selezionato: ${file.name}`, 'success');
            }
        });

        async function processFile() {
            const fileInput = document.getElementById('fileInput');
            const file = fileInput.files[0];
            
            if (!file) {
                showStatus('Seleziona un file prima di elaborare', 'error');
                return;
            }

            const processBtn = document.getElementById('processBtn');
            processBtn.disabled = true;
            processBtn.textContent = '⏳ Elaborazione in corso...';

            try {
                const formData = new FormData();
                formData.append('file', file);

                showStatus('Caricamento e processamento in corso...', 'success');

                const response = await fetch(`${API_BASE}/upload`, {
                    method: 'POST',
                    body: formData
                });

                const result = await response.json();

                if (response.ok) {
                    currentJobId = result.job_id;
                    showStatus(`Elaborazione completata! Job ID: ${currentJobId}`, 'success');
                    await loadResults(currentJobId);
                } else {
                    throw new Error(result.error || 'Errore sconosciuto');
                }
            } catch (error) {
                showStatus(`Errore: ${error.message}`, 'error');
            } finally {
                processBtn.disabled = false;
                processBtn.textContent = '🚀 Elabora Spartito';
            }
        }

        async function loadResults(jobId) {
            try {
                const response = await fetch(`${API_BASE}/process/${jobId}?include_images=true`);
                const result = await response.json();

                if (response.ok && result.status === 'completed') {
                    displayResults(result);
                } else {
                    throw new Error(result.error || 'Risultati non disponibili');
                }
            } catch (error) {
                showStatus(`Errore nel caricamento risultati: ${error.message}`, 'error');
            }
        }

        function displayResults(result) {
            const resultsDiv = document.getElementById('results');
            const statsDiv = document.getElementById('stats');
            const resultsGrid = document.getElementById('resultsGrid');

            // Mostra statistiche
            statsDiv.innerHTML = `
                <p><strong>Pentagrammi rilevati:</strong> ${result.result.staffs_detected}</p>
                <p><strong>Immagini elaborate:</strong> ${result.result.images_processed.length}</p>
                <p><strong>File generati:</strong> ${result.result.output_files.length}</p>
                <p><a href="${API_BASE}/jobs/${result.job_id}/download" class="btn">📥 Scarica Risultati ZIP</a></p>
            `;

            // Mostra immagini risultato
            resultsGrid.innerHTML = '';
            if (result.images) {
                Object.entries(result.images).forEach(([path, base64]) => {
                    const card = document.createElement('div');
                    card.className = 'result-card';
                    card.innerHTML = `
                        <h4>${path}</h4>
                        <img src="data:image/jpeg;base64,${base64}" class="result-image" alt="${path}">
                    `;
                    resultsGrid.appendChild(card);
                });
            }

            resultsDiv.style.display = 'block';
        }

        function showStatus(message, type) {
            const status = document.getElementById('status');
            status.textContent = message;
            status.className = `status ${type}`;
            status.style.display = 'block';
        }
    </script>
</body>
</html>
    """


@app.route("/health", methods=["GET"])
def health():
    """Endpoint per verificare lo stato del server"""
    return jsonify(
        {
            "status": "healthy",
            "timestamp": datetime.now().isoformat(),
            "upload_folder": os.path.exists(UPLOAD_FOLDER),
            "output_folder": os.path.exists(OUTPUT_FOLDER),
        }
    )


@app.route("/upload", methods=["POST"])
def upload_and_process():
    """
    Carica un file (PDF o immagine) e avvia il processamento

    Returns:
        JSON con job_id per tracciare il processamento
    """
    try:
        # Verifica che sia stato inviato un file
        if "file" not in request.files:
            return jsonify({"error": "Nessun file fornito"}), 400

        file = request.files["file"]
        if file.filename == "":
            return jsonify({"error": "Nessun file selezionato"}), 400

        if not allowed_file(file.filename):
            return (
                jsonify(
                    {
                        "error": f'Tipo di file non supportato. Formati supportati: {", ".join(ALLOWED_EXTENSIONS)}'
                    }
                ),
                400,
            )

        # Genera un ID univoco per questo lavoro
        job_id = str(uuid.uuid4())

        # Salva il file caricato
        filename = secure_filename(file.filename)
        file_path = os.path.join(UPLOAD_FOLDER, f"{job_id}_{filename}")
        file.save(file_path)

        # Ottieni informazioni sul file
        file_info = get_file_info(file_path)

        # Directory di output per questo lavoro
        job_output_dir = os.path.join(OUTPUT_FOLDER, job_id)
        os.makedirs(job_output_dir, exist_ok=True)

        # Salva i metadati del lavoro
        job_metadata = {
            "job_id": job_id,
            "filename": filename,
            "uploaded_at": datetime.now().isoformat(),
            "file_info": file_info,
            "status": "processing",
            "file_path": file_path,
            "output_dir": job_output_dir,
        }

        metadata_path = os.path.join(job_output_dir, "metadata.json")
        with open(metadata_path, "w") as f:
            json.dump(job_metadata, f, indent=2)

        # Avvia il processamento
        try:
            # Usa la funzione main esistente
            result = process_file_with_details(file_path, job_output_dir)

            # Aggiorna i metadati con il risultato
            job_metadata["status"] = "completed"
            job_metadata["completed_at"] = datetime.now().isoformat()
            job_metadata["result"] = result

        except Exception as e:
            job_metadata["status"] = "failed"
            job_metadata["error"] = str(e)
            job_metadata["failed_at"] = datetime.now().isoformat()

        # Salva i metadati aggiornati
        with open(metadata_path, "w") as f:
            json.dump(job_metadata, f, indent=2)

        return jsonify(
            {
                "job_id": job_id,
                "status": job_metadata["status"],
                "message": (
                    "Processamento completato"
                    if job_metadata["status"] == "completed"
                    else "Processamento fallito"
                ),
            }
        )

    except Exception as e:
        return jsonify({"error": f"Errore durante il caricamento: {str(e)}"}), 500


def process_file_with_details(file_path, output_dir):
    """
    Processa un file e restituisce informazioni dettagliate sui risultati

    Args:
        file_path: Percorso del file da processare
        output_dir: Directory di output

    Returns:
        Dict con informazioni dettagliate sui risultati
    """
    result = {"images_processed": [], "staffs_detected": 0, "output_files": []}

    try:
        if is_pdf(file_path):
            # Processa PDF
            print(f"[INFO] Processamento PDF: {file_path}")
            image_paths = pdf_to_images(file_path, output_dir)

            # Processa solo la prima pagina (come nel codice originale)
            image_paths = image_paths[:1]

            for img_path in image_paths:
                img_result = process_single_image_with_details(img_path, output_dir)
                result["images_processed"].append(img_result)
                result["staffs_detected"] += img_result.get("staffs_count", 0)
        else:
            # Processa singola immagine
            print(f"[INFO] Processamento immagine: {file_path}")
            img_result = process_single_image_with_details(file_path, output_dir)
            result["images_processed"].append(img_result)
            result["staffs_detected"] = img_result.get("staffs_count", 0)

        # Raccogli tutti i file di output
        result["output_files"] = collect_output_files(output_dir)

    except Exception as e:
        print(f"[ERRORE] Errore nel processamento: {e}")
        raise e

    return result


def process_single_image_with_details(img_file, output_dir):
    """
    Processa una singola immagine e restituisce informazioni dettagliate

    Args:
        img_file: Percorso dell'immagine
        output_dir: Directory di output

    Returns:
        Dict con informazioni sull'elaborazione
    """
    print(f"[🤖] Elaborazione dell'immagine: {img_file}")

    # Crea una directory per l'output di questa specifica immagine
    img_basename = os.path.basename(img_file).split(".")[0]
    img_output_dir = os.path.join(output_dir, img_basename)
    os.makedirs(img_output_dir, exist_ok=True)

    # Carica l'immagine
    original_img = cv2.imread(img_file)
    if original_img is None:
        raise Exception(f"Impossibile leggere l'immagine {img_file}")

    # Salva l'immagine originale
    cv2.imwrite(os.path.join(img_output_dir, "original.jpg"), original_img)

    # Converti in scala di grigi
    if len(original_img.shape) == 3:
        img = cv2.cvtColor(original_img, cv2.COLOR_BGR2GRAY)
    else:
        img = original_img.copy()

    # Rimozione del rumore
    img = cv2.fastNlMeansDenoising(img, None, 10, 7, 21)
    cv2.imwrite(os.path.join(img_output_dir, "denoised.jpg"), img)

    # Sogliatura di Otsu
    retval, img = cv2.threshold(img, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    cv2.imwrite(os.path.join(img_output_dir, "binarized.jpg"), img)

    # Estrazione parametri di riferimento
    line_width, line_spacing = get_ref_lengths(img)

    # Rilevamento linee del pentagramma
    all_staffline_vertical_indices = find_staffline_rows(img, line_width, line_spacing)
    all_staffline_horizontal_indices = find_staffline_columns(
        img, all_staffline_vertical_indices, line_width, line_spacing
    )

    # Creazione pentagrammi
    staffs = create_staffs(
        all_staffline_vertical_indices,
        all_staffline_horizontal_indices,
        line_width,
        line_spacing,
        img,
    )

    # Visualizzazione pentagrammi rilevati
    staff_boxes_img = img.copy()
    staff_boxes_img = cv2.cvtColor(staff_boxes_img, cv2.COLOR_GRAY2RGB)
    red = (0, 0, 255)
    box_thickness = 2

    for staff in staffs:
        box = staff.getBox()
        box.draw(staff_boxes_img, red, box_thickness)
        x = int(box.getCorner()[0] + (box.getWidth() // 2))
        y = int(box.getCorner()[1] + box.getHeight() + 35)
        cv2.putText(staff_boxes_img, "Staff", (x, y), cv2.FONT_HERSHEY_DUPLEX, 0.9, red)

    cv2.imwrite(os.path.join(img_output_dir, "detected_staffs.jpg"), staff_boxes_img)

    # Rilevamento chiavi e segni di tempo
    staffs, staff_imgs_color = find_clef_time_signature(staffs)

    # Rilevamento primitive musicali
    staffs, staff_imgs_color = find_primitive(staffs, staff_imgs_color)

    # Salva immagini con primitive
    for i in range(len(staffs)):
        staff_img_color = staff_imgs_color[i]
        cv2.imwrite(
            os.path.join(img_output_dir, f"staff_{i+1}_primitives.jpg"), staff_img_color
        )

    return {
        "image_path": img_file,
        "output_dir": img_output_dir,
        "staffs_count": len(staffs),
        "line_width": line_width,
        "line_spacing": line_spacing,
        "threshold_value": retval,
        "processing_steps": [
            "denoising",
            "binarization",
            "staff_detection",
            "clef_time_signature_detection",
            "primitive_detection",
        ],
    }


def collect_output_files(output_dir):
    """Raccoglie tutti i file di output generati"""
    output_files = []

    for root, dirs, files in os.walk(output_dir):
        for file in files:
            if file.endswith((".jpg", ".jpeg", ".png", ".json")):
                file_path = os.path.join(root, file)
                rel_path = os.path.relpath(file_path, output_dir)
                output_files.append(
                    {
                        "filename": file,
                        "path": rel_path,
                        "size": os.path.getsize(file_path),
                        "type": (
                            "image"
                            if file.lower().endswith((".jpg", ".jpeg", ".png"))
                            else "data"
                        ),
                    }
                )

    return output_files


@app.route("/process/<job_id>", methods=["GET"])
def get_process_result(job_id):
    """
    Ottieni il risultato di un processamento

    Args:
        job_id: ID del lavoro di processamento

    Returns:
        JSON con i risultati del processamento
    """
    try:
        job_output_dir = os.path.join(OUTPUT_FOLDER, job_id)
        metadata_path = os.path.join(job_output_dir, "metadata.json")

        if not os.path.exists(metadata_path):
            return jsonify({"error": "Lavoro non trovato"}), 404

        with open(metadata_path, "r") as f:
            metadata = json.load(f)

        # Se richiesto, includi le immagini codificate in base64
        include_images = request.args.get("include_images", "false").lower() == "true"

        if include_images and metadata["status"] == "completed":
            # Aggiungi le immagini principali codificate in base64
            images = {}

            for root, dirs, files in os.walk(job_output_dir):
                for file in files:
                    if file.endswith((".jpg", ".jpeg", ".png")):
                        file_path = os.path.join(root, file)
                        rel_path = os.path.relpath(file_path, job_output_dir)
                        encoded_img = encode_image_to_base64(file_path)
                        if encoded_img:
                            images[rel_path] = encoded_img

            metadata["images"] = images

        return jsonify(metadata)

    except Exception as e:
        return jsonify({"error": f"Errore nel recupero del risultato: {str(e)}"}), 500


@app.route("/jobs", methods=["GET"])
def list_jobs():
    """Lista tutti i lavori di processamento"""
    try:
        jobs = []

        if os.path.exists(OUTPUT_FOLDER):
            for job_dir in os.listdir(OUTPUT_FOLDER):
                job_path = os.path.join(OUTPUT_FOLDER, job_dir)
                metadata_path = os.path.join(job_path, "metadata.json")

                if os.path.isdir(job_path) and os.path.exists(metadata_path):
                    try:
                        with open(metadata_path, "r") as f:
                            metadata = json.load(f)

                        # Includi solo informazioni di base
                        job_summary = {
                            "job_id": metadata.get("job_id"),
                            "filename": metadata.get("filename"),
                            "status": metadata.get("status"),
                            "uploaded_at": metadata.get("uploaded_at"),
                            "completed_at": metadata.get("completed_at"),
                            "staffs_detected": metadata.get("result", {}).get(
                                "staffs_detected", 0
                            ),
                        }
                        jobs.append(job_summary)
                    except Exception as e:
                        print(f"Errore nel leggere i metadati per {job_dir}: {e}")

        return jsonify({"jobs": jobs, "total": len(jobs)})

    except Exception as e:
        return jsonify({"error": f"Errore nel recupero dei lavori: {str(e)}"}), 500


@app.route("/jobs/<job_id>/download", methods=["GET"])
def download_job_results(job_id):
    """
    Scarica tutti i risultati di un lavoro come file ZIP

    Args:
        job_id: ID del lavoro

    Returns:
        File ZIP con tutti i risultati
    """
    try:
        job_output_dir = os.path.join(OUTPUT_FOLDER, job_id)
        metadata_path = os.path.join(job_output_dir, "metadata.json")

        if not os.path.exists(metadata_path):
            return jsonify({"error": "Lavoro non trovato"}), 404

        with open(metadata_path, "r") as f:
            metadata = json.load(f)

        if metadata["status"] != "completed":
            return jsonify({"error": "Il lavoro non è ancora completato"}), 400

        # Crea un file ZIP temporaneo
        temp_zip = tempfile.NamedTemporaryFile(delete=False, suffix=".zip")
        temp_zip.close()

        with zipfile.ZipFile(temp_zip.name, "w", zipfile.ZIP_DEFLATED) as zipf:
            # Aggiungi tutti i file della directory di output
            for root, dirs, files in os.walk(job_output_dir):
                for file in files:
                    file_path = os.path.join(root, file)
                    arcname = os.path.relpath(file_path, job_output_dir)
                    zipf.write(file_path, arcname)

        filename = f"music_processing_results_{job_id}.zip"

        return send_file(
            temp_zip.name,
            as_attachment=True,
            download_name=filename,
            mimetype="application/zip",
        )

    except Exception as e:
        return jsonify({"error": f"Errore nel download: {str(e)}"}), 500


@app.route("/jobs/<job_id>/delete", methods=["DELETE"])
def delete_job(job_id):
    """
    Elimina un lavoro e tutti i suoi file

    Args:
        job_id: ID del lavoro da eliminare
    """
    try:
        job_output_dir = os.path.join(OUTPUT_FOLDER, job_id)

        if not os.path.exists(job_output_dir):
            return jsonify({"error": "Lavoro non trovato"}), 404

        # Elimina la directory e tutti i suoi contenuti
        shutil.rmtree(job_output_dir)

        # Elimina anche il file caricato se esiste
        for filename in os.listdir(UPLOAD_FOLDER):
            if filename.startswith(f"{job_id}_"):
                file_path = os.path.join(UPLOAD_FOLDER, filename)
                if os.path.exists(file_path):
                    os.remove(file_path)

        return jsonify({"message": "Lavoro eliminato con successo"})

    except Exception as e:
        return jsonify({"error": f"Errore nell'eliminazione: {str(e)}"}), 500


@app.route("/api/docs", methods=["GET"])
def api_docs():
    """Documentazione dettagliata delle API"""
    return jsonify(
        {
            "title": "Music Sheet Processing Server API",
            "version": "1.0.0",
            "description": "API per il processamento automatico di spartiti musicali",
            "base_url": request.host_url.rstrip("/"),
            "endpoints": {
                "/": {
                    "method": "GET",
                    "description": "Home page - serve la demo HTML se richiesta da browser, altrimenti informazioni API",
                    "returns": "HTML (demo) o JSON (info API)",
                },
                "/demo": {
                    "method": "GET",
                    "description": "Interfaccia web demo per il caricamento e processamento di spartiti",
                    "returns": "HTML - Interface utente completa",
                },
                "/health": {
                    "method": "GET",
                    "description": "Verifica lo stato del server",
                    "returns": "JSON con status, timestamp e stato delle cartelle",
                },
                "/upload": {
                    "method": "POST",
                    "description": "Carica un file (PDF o immagine) e avvia il processamento",
                    "parameters": {"file": "File da caricare (multipart/form-data)"},
                    "accepted_formats": list(ALLOWED_EXTENSIONS),
                    "max_file_size": f"{MAX_FILE_SIZE // (1024*1024)}MB",
                    "returns": "JSON con job_id per tracciare il processamento",
                },
                "/process/<job_id>": {
                    "method": "GET",
                    "description": "Ottiene i risultati di un processamento specifico",
                    "parameters": {
                        "job_id": "ID del lavoro (path parameter)",
                        "include_images": "true/false - include immagini in base64 (query parameter)",
                    },
                    "returns": "JSON con metadati e risultati del processamento",
                },
                "/jobs": {
                    "method": "GET",
                    "description": "Lista tutti i lavori di processamento",
                    "returns": "JSON con array di tutti i lavori e contatore totale",
                },
                "/jobs/<job_id>/download": {
                    "method": "GET",
                    "description": "Scarica tutti i risultati di un lavoro come file ZIP",
                    "parameters": {"job_id": "ID del lavoro (path parameter)"},
                    "returns": "File ZIP con tutti i file generati",
                },
                "/jobs/<job_id>/delete": {
                    "method": "DELETE",
                    "description": "Elimina un lavoro e tutti i suoi file",
                    "parameters": {"job_id": "ID del lavoro (path parameter)"},
                    "returns": "JSON con messaggio di conferma",
                },
            },
            "processing_steps": [
                "1. Conversione PDF in immagini (se necessario)",
                "2. Conversione in scala di grigi",
                "3. Rimozione del rumore (denoising)",
                "4. Binarizzazione con soglia di Otsu",
                "5. Rilevamento linee del pentagramma",
                "6. Creazione strutture pentagramma",
                "7. Rilevamento chiavi e indicazioni di tempo",
                "8. Rilevamento primitive musicali (note, pause, etc.)",
            ],
            "output_files": [
                "original.jpg - Immagine originale",
                "denoised.jpg - Immagine dopo rimozione rumore",
                "binarized.jpg - Immagine binarizzata",
                "detected_staffs.jpg - Pentagrammi rilevati",
                "staff_N_primitives.jpg - Primitive musicali per ogni pentagramma",
                "metadata.json - Metadati del processamento",
            ],
        }
    )


def check_dependencies():
    """Verifica che tutte le dipendenze siano installate"""
    missing_deps = []

    try:
        import cv2
    except ImportError:
        missing_deps.append("opencv-python")

    try:
        import flask
    except ImportError:
        missing_deps.append("flask")

    try:
        import flask_cors
    except ImportError:
        missing_deps.append("flask-cors")

    if missing_deps:
        print("❌ Dipendenze mancanti:")
        for dep in missing_deps:
            print(f"   - {dep}")
        print("\n💡 Installa con: pip install " + " ".join(missing_deps))
        return False

    print("✅ Tutte le dipendenze sono installate")
    return True


if __name__ == "__main__":
    # Verifica dipendenze prima di avviare
    if not check_dependencies():
        exit(1)

    # Configuration for production/development
    port = int(os.environ.get("PORT", 5001))
    debug = os.environ.get("FLASK_ENV", "production") == "development"

    print("🎼 Avvio del Music Sheet Processing Server...")
    print(f"📡 Server disponibile su: http://0.0.0.0:{port}")
    print(f"🌐 Demo web integrata: http://0.0.0.0:{port}/demo")
    print(f"📚 Documentazione API: http://0.0.0.0:{port}/api/docs")
    print(f"🏠 Home page (demo): http://0.0.0.0:{port}/")
    print("✨ Funzionalità disponibili:")
    print("  - Caricamento file via drag & drop")
    print("  - Processamento automatico spartiti")
    print("  - Visualizzazione risultati in tempo reale")
    print("  - Download risultati in formato ZIP")
    print("  - Gestione lavori multipli")

    app.run(debug=debug, host="0.0.0.0", port=port)
