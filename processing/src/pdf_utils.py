import os
import fitz  # PyMuPDF
from typing import List
import io
from PIL import Image

def is_pdf(file_path: str) -> bool:
    """Verifica se un file è un PDF basandosi sulla sua estensione
    
    Questa funzione controlla semplicemente l'estensione del file per determinare se è un PDF,
    costituendo un controllo preliminare rapido prima di elaborazioni più complesse.
    """
    return file_path.lower().endswith('.pdf')

def pdf_to_images(pdf_path: str, output_dir: str, dpi: int = 300) -> List[str]:
    """
    Converte un PDF in una serie di immagini JPG utilizzando PyMuPDF (senza dipendenze esterne)
    
    Questa funzione è essenziale per pre-elaborare spartiti musicali in formato PDF.
    La conversione in immagini permette l'applicazione di algoritmi di computer vision
    che possono analizzare la struttura visiva dello spartito.
    
    Args:
        pdf_path: Percorso del file PDF
        output_dir: Directory dove salvare le immagini
        dpi: Risoluzione per la conversione (300dpi è ottimale per l'OCR e il riconoscimento di dettagli musicali)
        
    Returns:
        Lista dei percorsi delle immagini generate
    """
    # Crea la directory di output se non esiste
    os.makedirs(output_dir, exist_ok=True)
    
    # Ottiene il nome del file PDF senza estensione
    pdf_name = os.path.basename(pdf_path).rsplit('.', 1)[0]
    
    # Crea una sottodirectory con il nome del PDF
    pdf_output_dir = os.path.join(output_dir, f"{pdf_name}_pages")
    os.makedirs(pdf_output_dir, exist_ok=True)
    
    # Converte il PDF in immagini
    print(f"[INFO] Conversione del PDF in immagini (potrebbe richiedere tempo)...")
    image_paths = []
    
    try:
        # Calcola il fattore di zoom basato sul DPI (72 DPI è la base standard per PDF)
        zoom = dpi / 72
        
        # Apre il documento PDF
        pdf_document = fitz.open(pdf_path)
        
        # Elabora ogni pagina
        for page_num, page in enumerate(pdf_document):
            # Ottiene la pagina come pixmap (immagine)
            pix = page.get_pixmap(matrix=fitz.Matrix(zoom, zoom))
            
            # Converte il pixmap in un'immagine PIL
            img_data = pix.tobytes("jpeg")
            img = Image.open(io.BytesIO(img_data))
            
            # Salva l'immagine con un nome sequenziale
            image_path = os.path.join(pdf_output_dir, f"page_{page_num+1:03d}.jpg")
            img.save(image_path, "JPEG")
            image_paths.append(image_path)
        
    except Exception as e:
        print(f"[ERRORE] Impossibile convertire il PDF: {e}")
        print("[INFO] Installa PyMuPDF con: pip install PyMuPDF")
        return []
    
    print(f"[INFO] Convertite {len(image_paths)} pagine da PDF a JPG")
    return image_paths
