import os
import cv2
import numpy as np
import matplotlib.pyplot as plt
from collections import Counter

def get_ref_lengths(img):
    """
    Ottiene le lunghezze di riferimento (spessore delle linee del pentagramma e spazio tra di esse)
    analizzando la distribuzione delle sequenze di pixel bianchi e neri nell'immagine.
    
    Questa funzione è cruciale per le successive elaborazioni perché fornisce parametri
    fondamentali per la segmentazione e il riconoscimento della notazione musicale.
    """
    num_rows = img.shape[0]  # Altezza dell'immagine (numero di righe)
    num_cols = img.shape[1]  # Larghezza dell'immagine (numero di colonne)
    rle_image_white_runs = []  # Lista cumulativa di sequenze bianche
    rle_image_black_runs = []  # Lista cumulativa di sequenze nere
    sum_all_consec_runs = []  # Lista cumulativa di sequenze consecutive bianco-nero

    for i in range(num_cols):
        col = img[:, i]
        rle_col = []
        rle_white_runs = []
        rle_black_runs = []
        run_val = 0  # (Numero di pixel consecutivi dello stesso valore)
        run_type = col[0]  # Dovrebbe essere 255 (bianco) inizialmente
        for j in range(num_rows):
            if (col[j] == run_type):
                # incrementa la lunghezza della sequenza
                run_val += 1
            else:
                # aggiunge la lunghezza della sequenza precedente alla codifica rle
                rle_col.append(run_val)
                if (run_type == 0):
                    rle_black_runs.append(run_val)
                else:
                    rle_white_runs.append(run_val)

                # alterna il tipo di sequenza
                run_type = col[j]
                # incrementa run_val per il nuovo valore
                run_val = 1

        # aggiunge la lunghezza dell'ultima sequenza alla codifica
        rle_col.append(run_val)
        if (run_type == 0):
            rle_black_runs.append(run_val)
        else:
            rle_white_runs.append(run_val)

        # Calcola la somma di sequenze verticali consecutive
        sum_rle_col = [sum(rle_col[i: i + 2]) for i in range(len(rle_col))]

        # Aggiunge alla lista di accumulo delle colonne
        rle_image_white_runs.extend(rle_white_runs)
        rle_image_black_runs.extend(rle_black_runs)
        sum_all_consec_runs.extend(sum_rle_col)

    # Usa Counter per trovare i valori più comuni, che rappresenteranno
    # le dimensioni standard delle linee del pentagramma e degli spazi tra esse
    white_runs = Counter(rle_image_white_runs)
    black_runs = Counter(rle_image_black_runs)
    black_white_sum = Counter(sum_all_consec_runs)

    # Estrae i valori più comuni che rappresentano le caratteristiche del pentagramma
    line_spacing = white_runs.most_common(1)[0][0]  # Spazio tra le linee del pentagramma
    line_width = black_runs.most_common(1)[0][0]    # Spessore delle linee del pentagramma
    width_spacing_sum = black_white_sum.most_common(1)[0][0]  # Somma dei due valori precedenti

    assert (line_spacing + line_width == width_spacing_sum), "Lo spessore stimato della linea + lo spazio non corrisponde con la somma più comune"

    return line_width, line_spacing

# unused
def deskew(img, output_dir, debug=False):
    """
    Corregge l'inclinazione di un'immagine di spartito musicale, fondamentale per il successivo
    riconoscimento delle note e delle linee del pentagramma.
    
    Il processo utilizza la trasformata di Hough per rilevare le linee del pentagramma
    e calcolare l'angolo di rotazione necessario per raddrizzare l'immagine.
    """
    # Assicuriamoci di avere un'immagine binaria
    if len(img.shape) > 2:  # Controllo se l'immagine è a colori
        img = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # Standardizziamo l'immagine: testo nero su sfondo bianco
    # La standardizzazione è necessaria per garantire che gli algoritmi di rilevamento
    # funzionino correttamente con uno schema di colori previsto
    if np.mean(img[0:20, 0:20]) < 127:  # Se l'angolo superiore sinistro è scuro
        skew_img = img  # L'immagine è già nel formato corretto
    else:
        skew_img = cv2.bitwise_not(img)  # Invertiamo l'immagine
    
    # Parametri ottimizzati per spartiti musicali
    # Il rilevamento dei bordi è il primo passo per identificare le linee del pentagramma
    edges = cv2.Canny(skew_img, 50, 150, apertureSize=3)  # Valori più sensibili per catturare linee sottili
    
    # Debug: salviamo le edges per analisi
    if debug:
        cv2.imwrite(os.path.join(output_dir, 'debug_edges.jpg'), edges)
    
    # Parametri ottimizzati per spartiti: le linee del pentagramma sono lunghe
    # quindi aumentiamo la soglia minima e ottimizziamo per linee orizzontali
    lines = cv2.HoughLinesP(edges, 1, np.pi/180, 
                           threshold=100,  # Soglia più alta per filtrare rumore
                           minLineLength=img.shape[1]//3,  # Almeno 1/3 della larghezza dell'immagine
                           maxLineGap=10)  # Consentiamo piccoli gap nella linea
    
    if lines is not None:
        # Array per memorizzare gli angoli delle linee
        angles = []
        
        # Immagine di debug per visualizzare le linee rilevate
        debug_img = cv2.cvtColor(skew_img, cv2.COLOR_GRAY2BGR) if len(skew_img.shape) == 2 else skew_img.copy()
        
        for line in lines:
            x1, y1, x2, y2 = line[0]
            # Filtriamo per linee quasi orizzontali (comuni in spartiti)
            # Questo è importante perché negli spartiti musicali le linee del pentagramma
            # sono prevalentemente orizzontali, anche se inclinate
            if abs(y2 - y1) < img.shape[0] // 10:  # Linea con inclinazione minima
                cv2.line(debug_img, (x1, y1), (x2, y2), (0, 0, 255), 2)  # Disegniamo linea rossa
                
                # Calcoliamo l'angolo della linea rispetto all'orizzontale
                angle = np.degrees(np.arctan2(y2 - y1, x2 - x1))
                # Questo angolo ci dirà quanto ruotare l'immagine per raddrizzarla
                angles.append(angle)
        
        # Salviamo l'immagine con le linee rilevate per debug
        if debug:
            cv2.imwrite(os.path.join(output_dir, 'debug_hough_lines.jpg'), debug_img)
        
        # Se abbiamo trovato linee orizzontali
        if angles:
            # Plottiamo l'istogramma degli angoli per l'analisi
            # Questo ci aiuta a visualizzare la distribuzione degli angoli e verificare
            # se c'è una chiara tendenza che indica l'inclinazione generale
            plt.figure(figsize=(10, 5))
            plt.hist(angles, bins=50)
            plt.title('Istogramma degli angoli delle linee')
            plt.savefig(os.path.join(output_dir, 'angle_histogram.jpg'))
            plt.close()
            
            # Per spartiti musicali, usiamo la mediana degli angoli
            # poiché le linee del pentagramma dovrebbero essere parallele
            # La mediana è più robusta della media in presenza di outlier
            angle = np.median(angles)
            print(f"[DEBUG] Angoli rilevati: min={min(angles):.2f}, max={max(angles):.2f}, mediana={angle:.2f}")
            
            # Correggiamo l'angolo - per spartiti vogliamo linee perfettamente orizzontali (0°)
            angle_correction = angle
            
            # Riduciamo la soglia a 0.1 gradi per essere più sensibili
            # Se l'inclinazione è minima, potrebbe non valere la pena correggerla
            if abs(angle_correction) < 0.1:
                return 0, img
        else:
            # Se non troviamo linee orizzontali, proviamo con il metodo dell'inviluppo
            print("[DEBUG] Nessuna linea orizzontale trovata con la trasformata di Hough, provo il metodo dei contorni")
            angle_correction = 0
    else:
        # Fallback: usiamo il metodo del minimo rettangolo circoscritto
        # Questo è un approccio alternativo quando il metodo Hough non rileva linee
        print("[DEBUG] Nessuna linea trovata con la trasformata di Hough, utilizzo il metodo del rettangolo di area minima")
        contours, _ = cv2.findContours(skew_img, cv2.RETR_LIST, cv2.CHAIN_APPROX_SIMPLE)
        
        # Se ci sono troppi contorni, filtriamo per dimensione
        if contours:
            # Troviamo il contorno più grande (presumibilmente il pentagramma)
            largest_contour = max(contours, key=cv2.contourArea)
            
            # Calcoliamo il rettangolo minimo che contiene il contorno
            rect = cv2.minAreaRect(largest_contour)
            
            # Estraiamo l'angolo dal rettangolo - cv2.minAreaRect restituisce angoli in [-90, 0]
            angle_correction = rect[2]
            
            # Normalizziamo l'angolo per ottenere la correzione appropriata
            if angle_correction < -45:
                angle_correction = -(90 + angle_correction)
            else:
                angle_correction = -angle_correction
                
            print(f"[DEBUG] Angolo dal metodo dei contorni: {angle_correction:.2f}")
        else:
            angle_correction = 0
    
    print(f"[DEBUG] Angolo di correzione finale: {angle_correction:.2f}")
    
    # Per rotazioni molto piccole, potremmo voler comunque applicare la correzione
    # Riduciamo la soglia a 0.1 gradi per essere più sensibili
    if abs(angle_correction) < 0.1:
        return 0, img
        
    # Ruotiamo l'immagine per correggerla
    # La rotazione è il passo finale per raddrizzare l'immagine usando l'angolo calcolato
    (h, w) = img.shape[:2]
    center = (w // 2, h // 2)  # Centro dell'immagine, punto attorno al quale ruotare
    M = cv2.getRotationMatrix2D(center, angle_correction, 1.0)  # Matrice di rotazione
    rotated = cv2.warpAffine(img, M, (w, h),
                             flags=cv2.INTER_CUBIC,  # Interpolazione cubica per qualità superiore
                             borderMode=cv2.BORDER_REPLICATE)  # Replica i bordi per evitare aree nere

    if debug:
        # Salviamo le immagini prima e dopo per confronto
        cv2.imwrite(os.path.join(output_dir, 'before_deskew.jpg'), img)
        cv2.imwrite(os.path.join(output_dir, 'after_deskew.jpg'), rotated)
        
        # Visualizziamo un confronto side-by-side per valutare visivamente la correzione
        plt.figure(figsize=(12, 6))
        plt.subplot(121)
        plt.title('Prima del deskewing')
        plt.imshow(img, cmap='gray')
        plt.subplot(122)
        plt.title('Dopo il deskewing')
        plt.imshow(rotated, cmap='gray')
        plt.tight_layout()
        plt.savefig(os.path.join(output_dir, 'deskew_comparison.jpg'))
        plt.close()

    return angle_correction, rotated