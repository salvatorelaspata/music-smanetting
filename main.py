import os
import cv2
from src.deskewing import get_ref_lengths
from src.pdf_utils import is_pdf, pdf_to_images
from src.staffline_detection import find_staffline_rows, find_staffline_columns
from src.staffline_detection import create_staffs
from src.detection import find_clef_time_signature

def process_image(img_file, output_dir):
    """Elabora una singola immagine di spartito musicale
    
    Questa funzione applica una serie di tecniche di elaborazione delle immagini per preparare
    uno spartito musicale all'analisi e al riconoscimento. Ogni passaggio è fondamentale per
    migliorare la qualità dell'immagine e ricavare informazioni strutturali importanti.
    """
    print(f"[🤖] Elaborazione dell'immagine: {img_file}")
    
    # ============ Lettura dell'Immagine ============
    # Carichiamo l'immagine originale mantenendone tutti i canali (colore)
    original_img = cv2.imread(img_file)
    if original_img is None:
        print(f"[ERRORE] Impossibile leggere l'immagine {img_file}")
        return
    
    # Crea una directory per l'output di questa specifica immagine
    # Questo aiuta a mantenere organizzati i risultati di ciascuna elaborazione
    img_basename = os.path.basename(img_file).split('.')[0]
    img_output_dir = os.path.join(output_dir, img_basename)
    os.makedirs(img_output_dir, exist_ok=True)
    
    # Salva l'immagine originale prima di qualsiasi modifica
    # Utile per confronti e debug durante il processo di sviluppo
    cv2.imwrite(os.path.join(img_output_dir, 'original.jpg'), original_img)
    
    # Converti in scala di grigi se l'immagine è a colori
    # La conversione in scala di grigi semplifica l'elaborazione e riduce la dimensionalità
    if len(original_img.shape) == 3:
        img = cv2.cvtColor(original_img, cv2.COLOR_BGR2GRAY)
    else:
        img = original_img.copy()

    # ============ Rimozione del Rumore ============
    # Utilizziamo il filtro Non-Local Means per rimuovere il rumore mantenendo i bordi
    # Questo è particolarmente importante per gli spartiti musicali dove i dettagli fini come
    # le note e le linee devono essere preservati
    img = cv2.fastNlMeansDenoising(img, None, 10, 7, 21)
    cv2.imwrite(os.path.join(img_output_dir, 'denoised.jpg'), img)
    print("[INFO] Applicata rimozione del rumore")

    # Sogliatura di Otsu
    # Questo algoritmo determina automaticamente il valore ottimale di soglia
    # per binarizzare l'immagine, separando chiaramente lo sfondo dal testo/note
    retval, img = cv2.threshold(img, 0, 255, cv2.THRESH_BINARY+cv2.THRESH_OTSU)
    cv2.imwrite(os.path.join(img_output_dir, 'binarized.jpg'), img)
    print("[INFO] Applicata sogliatura di Otsu " + str(retval))

    # ============ Deskewing (Raddrizzamento) ============
    # Raddrizziamo l'immagine per correggere eventuali inclinazioni
    # Questo è cruciale per l'analisi successiva, poiché le linee del pentagramma
    # devono essere perfettamente orizzontali
    # La funzione deskew restituisce l'angolo di raddrizzamento e l'immagine deskewed
    # angle, deskewed_img = deskew(img, output_dir=img_output_dir, debug=True)
    # print("[INFO] Angolo di raddrizzamento: {:.3f}".format(angle))
    # Utilizziamo l'immagine deskewed per i passaggi successivi
    # img = deskewed_img

    # ============ Lunghezze di Riferimento ============
    # Estrazione di parametri fondamentali per la segmentazione:
    # - Spessore delle linee del pentagramma
    # - Spazio tra le linee del pentagramma
    line_width, line_spacing = get_ref_lengths(img)
    print("[INFO] Spessore linee del pentagramma: ", line_width)
    print("[INFO] Spaziatura linee del pentagramma: ", line_spacing)

    # ============ Rilevamento delle linee del pentagramma ============
    # Ricerchiamo le linee del pentagramma nell'immagine
    all_staffline_vertical_indices = find_staffline_rows(img, line_width, line_spacing)
    print("[INFO] Trovate righe del pentagramma: ", len(all_staffline_vertical_indices))
    
    # Ricerchiamo le colonne del pentagramma

    all_staffline_horizontal_indices = find_staffline_columns(img, all_staffline_vertical_indices, line_width, line_spacing)
    print("[INFO] Trovate colonne del pentagramma: ", len(all_staffline_horizontal_indices))

    # ============ Show Detected Staffs ============
    staffs = create_staffs(all_staffline_vertical_indices, all_staffline_horizontal_indices, line_width, line_spacing, img)
    print("[INFO] Trovati pentagrammi: ", len(staffs))

    staff_boxes_img = img.copy()
    staff_boxes_img = cv2.cvtColor(staff_boxes_img, cv2.COLOR_GRAY2RGB)
    red = (0, 0, 255)
    box_thickness = 2
    for staff in staffs:
        box = staff.getBox()
        box.draw(staff_boxes_img, red, box_thickness)
        x = int(box.getCorner()[0] + (box.getWidth() // 2))
        y = int(box.getCorner()[1] + box.getHeight() + 35)
        cv2.putText(staff_boxes_img, "Staff", (x, y), cv2.FONT_HERSHEY_DUPLEX, 0.9 , red)

    # Salva l'immagine con le linee del pentagramma rilevate
    staff_boxes_img_path = os.path.join(img_output_dir, 'detected_staffs.jpg')
    cv2.imwrite(staff_boxes_img_path, staff_boxes_img)
    # open_file('output/detected_staffs.jpg')
    print("[INFO] Saving detected staffs onto disk")

    staffs, staff_imgs_color = find_clef_time_signature(staffs)
    # Salva l'immagine con le linee del pentagramma rilevate
    for i in range(len(staffs)):
        staff_img_color = staff_imgs_color[i]
        cv2.imwrite(os.path.join(img_output_dir, "staff_{}_primitives.jpg".format(i+1)), staff_img_color)

    return img

def main(file_path):
    """Funzione principale che gestisce il flusso di elaborazione
    
    Questa funzione determina se l'input è un PDF o un'immagine e avvia
    la pipeline di elaborazione appropriata. È il punto di ingresso per
    l'analisi dello spartito musicale.
    """
    output_dir = os.path.join(os.path.dirname(__file__), "output")
    # Aggiunge al percorso di output il nome del file
    file_name = os.path.basename(file_path).split('.')[0]
    output_dir = os.path.join(output_dir, file_name)
    if is_pdf(file_path):
        # Se è un PDF, converti tutte le pagine in JPG
        # Molti spartiti musicali sono distribuiti in formato PDF e devono essere
        # convertiti in immagini per l'elaborazione
        print(f"[INFO] Il file di input è un PDF, conversione in immagini in corso")
        image_paths = pdf_to_images(file_path, output_dir)
        
        # Processa ogni immagine estratta dal PDF
        # Ogni pagina viene elaborata individualmente
        for img_path in image_paths:
            process_image(img_path, output_dir)
    else:
        # Se non è un PDF, processa come una singola immagine
        process_image(file_path, output_dir)

if __name__ == "__main__":
    current_dir = os.path.dirname(os.path.abspath(__file__))
    # Torna alla directory radice
    main(os.path.join(current_dir, "input", "HAIL HOLY QUEEN- rivisto Perseveranza.pdf"))
