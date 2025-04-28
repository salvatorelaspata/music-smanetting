import os
import cv2
import numpy as np
from src.deskewing import get_ref_lengths, deskew

output_dir = os.path.join(os.path.dirname(__file__), "output")

def main(img_file):
    # ============ Read Image ============
    original_img = cv2.imread(img_file)
    if original_img is None:
        print(f"[ERROR] Impossibile leggere l'immagine {img_file}")
        return
    
    # Salva l'immagine originale prima di qualsiasi modifica
    cv2.imwrite(os.path.join(output_dir, 'original.jpg'), original_img)
    
    # Converti in scala di grigi se l'immagine è a colori
    if len(original_img.shape) == 3:
        img = cv2.cvtColor(original_img, cv2.COLOR_BGR2GRAY)
    else:
        img = original_img.copy()

    # ============ Noise Removal ============
    img = cv2.fastNlMeansDenoising(img, None, 10, 7, 21)
    cv2.imwrite(os.path.join(output_dir, 'denoised.jpg'), img)
    print("[INFO] Noise Removal applied")

    # Otsu's Thresholding
    retval, img = cv2.threshold(img, 0, 255, cv2.THRESH_BINARY+cv2.THRESH_OTSU)
    cv2.imwrite(os.path.join(output_dir, 'binarized.jpg'), img)
    print("[INFO] Otsu's Thresholding applied" + str(retval))

    # ============ Deskewing ============
    # Per test, creiamo una versione artificialmente inclinata
    # if 'inclinata' in img_file and not os.path.exists('artificial_skew.jpg'):
    #     print("[INFO] Creazione di un'immagine artificialmente inclinata per test")
    #     rows, cols = img.shape
    #     # Creiamo una matrice di trasformazione per inclinare l'immagine di 2 gradi
    #     M = cv2.getRotationMatrix2D((cols/2, rows/2), 2, 1)
    #     artificially_skewed = cv2.warpAffine(img, M, (cols, rows))
    #     cv2.imwrite(os.path.join(output_dir, 'artificial_skew.jpg'), artificially_skewed)
        
    #     # Usiamo questa immagine artificialmente inclinata per testare il deskewing
    #     print("[INFO] Utilizzo dell'immagine artificialmente inclinata per test")
    #     img = artificially_skewed

    angle, deskewed_img = deskew(img, output_dir=output_dir, debug=True)
    print("[INFO] Deskew Angle: {:.3f}".format(angle))

    # Utilizziamo l'immagine deskewed per i passaggi successivi
    img = deskewed_img

    # show a video of the deskewed image
    # ============ Reference Lengths ============
    line_width, line_spacing = get_ref_lengths(img)
    print("[INFO] Staff line Width: ", line_width)
    print("[INFO] Staff line Spacing: ", line_spacing)

if __name__ == "__main__":
    current_dir = os.path.dirname(os.path.abspath(__file__))
    # back to the root directory
    main(os.path.join(current_dir, "img" ,"fire.jpg"))
