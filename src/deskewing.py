import os
import cv2
import numpy as np
import matplotlib.pyplot as plt
from collections import Counter

def get_ref_lengths(img):
    num_rows = img.shape[0]  # Image Height (number of rows)
    num_cols = img.shape[1]  # Image Width (number of columns)
    rle_image_white_runs = []  # Cumulative white run list
    rle_image_black_runs = []  # Cumulative black run list
    sum_all_consec_runs = []  # Cumulative consecutive black white runs

    for i in range(num_cols):
        col = img[:, i]
        rle_col = []
        rle_white_runs = []
        rle_black_runs = []
        run_val = 0  # (The number of consecutive pixels of same value)
        run_type = col[0]  # Should be 255 (white) initially
        for j in range(num_rows):
            if (col[j] == run_type):
                # increment run length
                run_val += 1
            else:
                # add previous run length to rle encoding
                rle_col.append(run_val)
                if (run_type == 0):
                    rle_black_runs.append(run_val)
                else:
                    rle_white_runs.append(run_val)

                # alternate run type
                run_type = col[j]
                # increment run_val for new value
                run_val = 1

        # add final run length to encoding
        rle_col.append(run_val)
        if (run_type == 0):
            rle_black_runs.append(run_val)
        else:
            rle_white_runs.append(run_val)

        # Calculate sum of consecutive vertical runs
        sum_rle_col = [sum(rle_col[i: i + 2]) for i in range(len(rle_col))]

        # Add to column accumulation list
        rle_image_white_runs.extend(rle_white_runs)
        rle_image_black_runs.extend(rle_black_runs)
        sum_all_consec_runs.extend(sum_rle_col)

    white_runs = Counter(rle_image_white_runs)
    black_runs = Counter(rle_image_black_runs)
    black_white_sum = Counter(sum_all_consec_runs)

    line_spacing = white_runs.most_common(1)[0][0]
    line_width = black_runs.most_common(1)[0][0]
    width_spacing_sum = black_white_sum.most_common(1)[0][0]

    assert (line_spacing + line_width == width_spacing_sum), "Estimated Line Thickness + Spacing doesn't correspond with Most Common Sum "

    return line_width, line_spacing

def deskew(img, output_dir, debug=False):
    # Assicuriamoci di avere un'immagine binaria
    if len(img.shape) > 2:  # Controllo se l'immagine è a colori
        img = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # Standardizziamo l'immagine: testo nero su sfondo bianco
    if np.mean(img[0:20, 0:20]) < 127:  # Se l'angolo superiore sinistro è scuro
        skew_img = img  # L'immagine è già nel formato corretto
    else:
        skew_img = cv2.bitwise_not(img)  # Invertiamo l'immagine
    
    # Parametri ottimizzati per spartiti musicali
    edges = cv2.Canny(skew_img, 30, 200, apertureSize=3)  # Valori più sensibili
    
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
        
        # Debug image to visualize detected lines
        debug_img = cv2.cvtColor(skew_img, cv2.COLOR_GRAY2BGR) if len(skew_img.shape) == 2 else skew_img.copy()
        
        for line in lines:
            x1, y1, x2, y2 = line[0]
            # Filtriamo per linee quasi orizzontali (comuni in spartiti)
            if abs(y2 - y1) < img.shape[0] // 10:  # Linea con inclinazione minima
                cv2.line(debug_img, (x1, y1), (x2, y2), (0, 0, 255), 2)  # Disegniamo linea rossa
                
                # Calcoliamo l'angolo della linea
                angle = np.degrees(np.arctan2(y2 - y1, x2 - x1))
                # Normalizziamo l'angolo per ottenere la rotazione dallo zero
                angles.append(angle)
        
        # Salviamo l'immagine con le linee rilevate per debug
        if debug:
            cv2.imwrite(os.path.join(output_dir, 'debug_hough_lines.jpg'), debug_img)
        
        # Se abbiamo trovato linee orizzontali
        if angles:
            # Plottiamo l'istogramma degli angoli per l'analisi
            plt.figure(figsize=(10, 5))
            plt.hist(angles, bins=50)
            plt.title('Histogram of line angles')
            plt.savefig(os.path.join(output_dir, 'angle_histogram.jpg'))
            plt.close()
            
            # Per spartiti musicali, possiamo usare la media degli angoli
            # poiché le linee del pentagramma dovrebbero essere parallele
            angle = np.median(angles)
            print(f"[DEBUG] Detected angles: min={min(angles):.2f}, max={max(angles):.2f}, median={angle:.2f}")
            
            # Correggiamo l'angolo - per spartiti vogliamo linee perfettamente orizzontali (0°)
            angle_correction = angle
            
            # Riduciamo la soglia a 0.1 gradi per essere più sensibili
            if abs(angle_correction) < 0.1:
                return 0, img
        else:
            # Se non troviamo linee orizzontali, proviamo con il metodo dell'inviluppo
            print("[DEBUG] No horizontal lines found with Hough transform, trying contour method")
            angle_correction = 0
    else:
        # Fallback: usiamo il metodo del minimo rettangolo circoscritto
        print("[DEBUG] No lines found with Hough transform, using minimum area rectangle method")
        contours, _ = cv2.findContours(skew_img, cv2.RETR_LIST, cv2.CHAIN_APPROX_SIMPLE)
        
        # Se ci sono troppi contorni, filtriamo per dimensione
        if contours:
            # Troviamo il contorno più grande (presumibilmente il pentagramma)
            largest_contour = max(contours, key=cv2.contourArea)
            
            # Calcoliamo il rettangolo minimo che contiene il contorno
            rect = cv2.minAreaRect(largest_contour)
            
            # Estraiamo l'angolo dal rettangolo - cv2.minAreaRect restituisce angoli in [-90, 0]
            angle_correction = rect[2]
            
            if angle_correction < -45:
                angle_correction = -(90 + angle_correction)
            else:
                angle_correction = -angle_correction
                
            print(f"[DEBUG] Angle from contour method: {angle_correction:.2f}")
        else:
            angle_correction = 0
    
    print(f"[DEBUG] Final correction angle: {angle_correction:.2f}")
    
    # Per rotazioni molto piccole, potremmo voler comunque applicare la correzione
    # Riduciamo la soglia a 0.1 gradi per essere più sensibili
    if abs(angle_correction) < 0.1:
        return 0, img
        
    # Ruotiamo l'immagine per correggerla
    (h, w) = img.shape[:2]
    center = (w // 2, h // 2)
    M = cv2.getRotationMatrix2D(center, angle_correction, 1.0)
    rotated = cv2.warpAffine(img, M, (w, h),
                             flags=cv2.INTER_CUBIC, 
                             borderMode=cv2.BORDER_REPLICATE)

    if debug:
        # Salviamo le immagini prima e dopo per confronto
        cv2.imwrite(os.path.join(output_dir, 'before_deskew.jpg'), img)
        cv2.imwrite(os.path.join(output_dir, 'after_deskew.jpg'), rotated)
        
        # Visualizziamo un confronto side-by-side
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