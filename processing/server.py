import os
import json
import uuid
import shutil
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from werkzeug.utils import secure_filename
import cv2
import base64
from datetime import datetime
import zipfile
import tempfile

# Import delle funzioni di processamento esistenti
from main import process_image, main as process_main
from src.pdf_utils import is_pdf, pdf_to_images
from src.deskewing import get_ref_lengths
from src.staffline_detection import find_staffline_rows, find_staffline_columns, create_staffs
from src.detection import find_clef_time_signature, find_primitive

app = Flask(__name__)
CORS(app)  # Abilita CORS per tutte le route

# Configurazione
UPLOAD_FOLDER = 'uploads'
OUTPUT_FOLDER = 'output'
MAX_FILE_SIZE = 16 * 1024 * 1024  # 16MB max file size

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['OUTPUT_FOLDER'] = OUTPUT_FOLDER
app.config['MAX_CONTENT_LENGTH'] = MAX_FILE_SIZE

# Assicurati che le cartelle esistano
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

# Estensioni di file permesse
ALLOWED_EXTENSIONS = {'pdf', 'png', 'jpg', 'jpeg', 'gif', 'bmp', 'tiff', 'tif'}

def allowed_file(filename):
    """Verifica se il file ha un'estensione permessa"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def get_file_info(filepath):
    """Ottiene informazioni di base su un file"""
    if not os.path.exists(filepath):
        return None
    
    stat = os.stat(filepath)
    return {
        'size': stat.st_size,
        'modified': datetime.fromtimestamp(stat.st_mtime).isoformat(),
        'is_pdf': is_pdf(filepath)
    }

def encode_image_to_base64(image_path):
    """Converte un'immagine in base64 per la risposta JSON"""
    try:
        with open(image_path, 'rb') as img_file:
            return base64.b64encode(img_file.read()).decode('utf-8')
    except Exception as e:
        print(f"Errore nell'encoding dell'immagine {image_path}: {e}")
        return None

@app.route('/', methods=['GET'])
def home():
    """Endpoint di benvenuto con informazioni sull'API"""
    return jsonify({
        'message': 'Music Sheet Processing Server',
        'version': '1.0.0',
        'endpoints': {
            '/upload': 'POST - Carica e processa un file (PDF o immagine)',
            '/process/<job_id>': 'GET - Ottieni il risultato di un processamento',
            '/jobs': 'GET - Lista di tutti i lavori di processamento',
            '/jobs/<job_id>/download': 'GET - Scarica i risultati come ZIP',
            '/health': 'GET - Stato del server'
        }
    })

@app.route('/health', methods=['GET'])
def health():
    """Endpoint per verificare lo stato del server"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'upload_folder': os.path.exists(UPLOAD_FOLDER),
        'output_folder': os.path.exists(OUTPUT_FOLDER)
    })

@app.route('/upload', methods=['POST'])
def upload_and_process():
    """
    Carica un file (PDF o immagine) e avvia il processamento
    
    Returns:
        JSON con job_id per tracciare il processamento
    """
    try:
        # Verifica che sia stato inviato un file
        if 'file' not in request.files:
            return jsonify({'error': 'Nessun file fornito'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'Nessun file selezionato'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': f'Tipo di file non supportato. Formati supportati: {", ".join(ALLOWED_EXTENSIONS)}'}), 400
        
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
            'job_id': job_id,
            'filename': filename,
            'uploaded_at': datetime.now().isoformat(),
            'file_info': file_info,
            'status': 'processing',
            'file_path': file_path,
            'output_dir': job_output_dir
        }
        
        metadata_path = os.path.join(job_output_dir, 'metadata.json')
        with open(metadata_path, 'w') as f:
            json.dump(job_metadata, f, indent=2)
        
        # Avvia il processamento
        try:
            # Usa la funzione main esistente
            result = process_file_with_details(file_path, job_output_dir)
            
            # Aggiorna i metadati con il risultato
            job_metadata['status'] = 'completed'
            job_metadata['completed_at'] = datetime.now().isoformat()
            job_metadata['result'] = result
            
        except Exception as e:
            job_metadata['status'] = 'failed'
            job_metadata['error'] = str(e)
            job_metadata['failed_at'] = datetime.now().isoformat()
        
        # Salva i metadati aggiornati
        with open(metadata_path, 'w') as f:
            json.dump(job_metadata, f, indent=2)
        
        return jsonify({
            'job_id': job_id,
            'status': job_metadata['status'],
            'message': 'Processamento completato' if job_metadata['status'] == 'completed' else 'Processamento fallito'
        })
        
    except Exception as e:
        return jsonify({'error': f'Errore durante il caricamento: {str(e)}'}), 500

def process_file_with_details(file_path, output_dir):
    """
    Processa un file e restituisce informazioni dettagliate sui risultati
    
    Args:
        file_path: Percorso del file da processare
        output_dir: Directory di output
        
    Returns:
        Dict con informazioni dettagliate sui risultati
    """
    result = {
        'images_processed': [],
        'staffs_detected': 0,
        'output_files': []
    }
    
    try:
        if is_pdf(file_path):
            # Processa PDF
            print(f"[INFO] Processamento PDF: {file_path}")
            image_paths = pdf_to_images(file_path, output_dir)
            
            # Processa solo la prima pagina (come nel codice originale)
            image_paths = image_paths[:1]
            
            for img_path in image_paths:
                img_result = process_single_image_with_details(img_path, output_dir)
                result['images_processed'].append(img_result)
                result['staffs_detected'] += img_result.get('staffs_count', 0)
        else:
            # Processa singola immagine
            print(f"[INFO] Processamento immagine: {file_path}")
            img_result = process_single_image_with_details(file_path, output_dir)
            result['images_processed'].append(img_result)
            result['staffs_detected'] = img_result.get('staffs_count', 0)
        
        # Raccogli tutti i file di output
        result['output_files'] = collect_output_files(output_dir)
        
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
    img_basename = os.path.basename(img_file).split('.')[0]
    img_output_dir = os.path.join(output_dir, img_basename)
    os.makedirs(img_output_dir, exist_ok=True)
    
    # Carica l'immagine
    original_img = cv2.imread(img_file)
    if original_img is None:
        raise Exception(f"Impossibile leggere l'immagine {img_file}")
    
    # Salva l'immagine originale
    cv2.imwrite(os.path.join(img_output_dir, 'original.jpg'), original_img)
    
    # Converti in scala di grigi
    if len(original_img.shape) == 3:
        img = cv2.cvtColor(original_img, cv2.COLOR_BGR2GRAY)
    else:
        img = original_img.copy()
    
    # Rimozione del rumore
    img = cv2.fastNlMeansDenoising(img, None, 10, 7, 21)
    cv2.imwrite(os.path.join(img_output_dir, 'denoised.jpg'), img)
    
    # Sogliatura di Otsu
    retval, img = cv2.threshold(img, 0, 255, cv2.THRESH_BINARY+cv2.THRESH_OTSU)
    cv2.imwrite(os.path.join(img_output_dir, 'binarized.jpg'), img)
    
    # Estrazione parametri di riferimento
    line_width, line_spacing = get_ref_lengths(img)
    
    # Rilevamento linee del pentagramma
    all_staffline_vertical_indices = find_staffline_rows(img, line_width, line_spacing)
    all_staffline_horizontal_indices = find_staffline_columns(img, all_staffline_vertical_indices, line_width, line_spacing)
    
    # Creazione pentagrammi
    staffs = create_staffs(all_staffline_vertical_indices, all_staffline_horizontal_indices, line_width, line_spacing, img)
    
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
    
    cv2.imwrite(os.path.join(img_output_dir, 'detected_staffs.jpg'), staff_boxes_img)
    
    # Rilevamento chiavi e segni di tempo
    staffs, staff_imgs_color = find_clef_time_signature(staffs)
    
    # Rilevamento primitive musicali
    staffs, staff_imgs_color = find_primitive(staffs, staff_imgs_color)
    
    # Salva immagini con primitive
    for i in range(len(staffs)):
        staff_img_color = staff_imgs_color[i]
        cv2.imwrite(os.path.join(img_output_dir, f"staff_{i+1}_primitives.jpg"), staff_img_color)
    
    return {
        'image_path': img_file,
        'output_dir': img_output_dir,
        'staffs_count': len(staffs),
        'line_width': line_width,
        'line_spacing': line_spacing,
        'threshold_value': retval,
        'processing_steps': [
            'denoising',
            'binarization', 
            'staff_detection',
            'clef_time_signature_detection',
            'primitive_detection'
        ]
    }

def collect_output_files(output_dir):
    """Raccoglie tutti i file di output generati"""
    output_files = []
    
    for root, dirs, files in os.walk(output_dir):
        for file in files:
            if file.endswith(('.jpg', '.jpeg', '.png', '.json')):
                file_path = os.path.join(root, file)
                rel_path = os.path.relpath(file_path, output_dir)
                output_files.append({
                    'filename': file,
                    'path': rel_path,
                    'size': os.path.getsize(file_path),
                    'type': 'image' if file.lower().endswith(('.jpg', '.jpeg', '.png')) else 'data'
                })
    
    return output_files

@app.route('/process/<job_id>', methods=['GET'])
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
        metadata_path = os.path.join(job_output_dir, 'metadata.json')
        
        if not os.path.exists(metadata_path):
            return jsonify({'error': 'Lavoro non trovato'}), 404
        
        with open(metadata_path, 'r') as f:
            metadata = json.load(f)
        
        # Se richiesto, includi le immagini codificate in base64
        include_images = request.args.get('include_images', 'false').lower() == 'true'
        
        if include_images and metadata['status'] == 'completed':
            # Aggiungi le immagini principali codificate in base64
            images = {}
            
            for root, dirs, files in os.walk(job_output_dir):
                for file in files:
                    if file.endswith(('.jpg', '.jpeg', '.png')):
                        file_path = os.path.join(root, file)
                        rel_path = os.path.relpath(file_path, job_output_dir)
                        encoded_img = encode_image_to_base64(file_path)
                        if encoded_img:
                            images[rel_path] = encoded_img
            
            metadata['images'] = images
        
        return jsonify(metadata)
        
    except Exception as e:
        return jsonify({'error': f'Errore nel recupero del risultato: {str(e)}'}), 500

@app.route('/jobs', methods=['GET'])
def list_jobs():
    """Lista tutti i lavori di processamento"""
    try:
        jobs = []
        
        if os.path.exists(OUTPUT_FOLDER):
            for job_dir in os.listdir(OUTPUT_FOLDER):
                job_path = os.path.join(OUTPUT_FOLDER, job_dir)
                metadata_path = os.path.join(job_path, 'metadata.json')
                
                if os.path.isdir(job_path) and os.path.exists(metadata_path):
                    try:
                        with open(metadata_path, 'r') as f:
                            metadata = json.load(f)
                        
                        # Includi solo informazioni di base
                        job_summary = {
                            'job_id': metadata.get('job_id'),
                            'filename': metadata.get('filename'),
                            'status': metadata.get('status'),
                            'uploaded_at': metadata.get('uploaded_at'),
                            'completed_at': metadata.get('completed_at'),
                            'staffs_detected': metadata.get('result', {}).get('staffs_detected', 0)
                        }
                        jobs.append(job_summary)
                    except Exception as e:
                        print(f"Errore nel leggere i metadati per {job_dir}: {e}")
        
        return jsonify({
            'jobs': jobs,
            'total': len(jobs)
        })
        
    except Exception as e:
        return jsonify({'error': f'Errore nel recupero dei lavori: {str(e)}'}), 500

@app.route('/jobs/<job_id>/download', methods=['GET'])
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
        metadata_path = os.path.join(job_output_dir, 'metadata.json')
        
        if not os.path.exists(metadata_path):
            return jsonify({'error': 'Lavoro non trovato'}), 404
        
        with open(metadata_path, 'r') as f:
            metadata = json.load(f)
        
        if metadata['status'] != 'completed':
            return jsonify({'error': 'Il lavoro non è ancora completato'}), 400
        
        # Crea un file ZIP temporaneo
        temp_zip = tempfile.NamedTemporaryFile(delete=False, suffix='.zip')
        temp_zip.close()
        
        with zipfile.ZipFile(temp_zip.name, 'w', zipfile.ZIP_DEFLATED) as zipf:
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
            mimetype='application/zip'
        )
        
    except Exception as e:
        return jsonify({'error': f'Errore nel download: {str(e)}'}), 500

@app.route('/jobs/<job_id>/delete', methods=['DELETE'])
def delete_job(job_id):
    """
    Elimina un lavoro e tutti i suoi file
    
    Args:
        job_id: ID del lavoro da eliminare
    """
    try:
        job_output_dir = os.path.join(OUTPUT_FOLDER, job_id)
        
        if not os.path.exists(job_output_dir):
            return jsonify({'error': 'Lavoro non trovato'}), 404
        
        # Elimina la directory e tutti i suoi contenuti
        shutil.rmtree(job_output_dir)
        
        # Elimina anche il file caricato se esiste
        for filename in os.listdir(UPLOAD_FOLDER):
            if filename.startswith(f"{job_id}_"):
                file_path = os.path.join(UPLOAD_FOLDER, filename)
                if os.path.exists(file_path):
                    os.remove(file_path)
        
        return jsonify({'message': 'Lavoro eliminato con successo'})
        
    except Exception as e:
        return jsonify({'error': f'Errore nell\'eliminazione: {str(e)}'}), 500

if __name__ == '__main__':
    print("🎼 Avvio del Music Sheet Processing Server...")
    print("📡 Server disponibile su: http://localhost:5001")
    print("📚 Documentazione API: http://localhost:5001")
    
    app.run(debug=True, host='0.0.0.0', port=5001)
