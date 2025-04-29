import os
import cv2
from src.deskewing import get_ref_lengths, deskew
from src.pdf_utils import is_pdf, pdf_to_images

def process_image(img_file, output_dir):
    """Process a single image file"""
    print(f"[INFO] Processing image: {img_file}")
    
    # ============ Read Image ============
    original_img = cv2.imread(img_file)
    if original_img is None:
        print(f"[ERROR] Impossibile leggere l'immagine {img_file}")
        return
    
    # Crea una directory per l'output di questa specifica immagine
    img_basename = os.path.basename(img_file).split('.')[0]
    img_output_dir = os.path.join(output_dir, img_basename)
    os.makedirs(img_output_dir, exist_ok=True)
    
    # Salva l'immagine originale prima di qualsiasi modifica
    cv2.imwrite(os.path.join(img_output_dir, 'original.jpg'), original_img)
    
    # Converti in scala di grigi se l'immagine è a colori
    if len(original_img.shape) == 3:
        img = cv2.cvtColor(original_img, cv2.COLOR_BGR2GRAY)
    else:
        img = original_img.copy()

    # ============ Noise Removal ============
    img = cv2.fastNlMeansDenoising(img, None, 10, 7, 21)
    cv2.imwrite(os.path.join(img_output_dir, 'denoised.jpg'), img)
    print("[INFO] Noise Removal applied")

    # Otsu's Thresholding
    retval, img = cv2.threshold(img, 0, 255, cv2.THRESH_BINARY+cv2.THRESH_OTSU)
    cv2.imwrite(os.path.join(img_output_dir, 'binarized.jpg'), img)
    print("[INFO] Otsu's Thresholding applied" + str(retval))

    # ============ Deskewing ============
    # angle, deskewed_img = deskew(img, output_dir=img_output_dir, debug=True)
    # print("[INFO] Deskew Angle: {:.3f}".format(angle))
    # Utilizziamo l'immagine deskewed per i passaggi successivi
    # img = deskewed_img

    # ============ Reference Lengths ============
    line_width, line_spacing = get_ref_lengths(img)
    print("[INFO] Staff line Width: ", line_width)
    print("[INFO] Staff line Spacing: ", line_spacing)
    
    return img

def main(file_path):
    output_dir = os.path.join(os.path.dirname(__file__), "output")
    # add at output dir the name of the file
    file_name = os.path.basename(file_path).split('.')[0]
    output_dir = os.path.join(output_dir, file_name)
    if is_pdf(file_path):
        # Se è un PDF, converti tutte le pagine in JPG
        print(f"[INFO] Input file is a PDF, converting to images")
        image_paths = pdf_to_images(file_path, output_dir)
        
        # Processa ogni immagine
        for img_path in image_paths:
            process_image(img_path, output_dir )
    else:
        # Se non è un PDF, processa come una singola immagine
        process_image(file_path, output_dir)

if __name__ == "__main__":
    current_dir = os.path.dirname(os.path.abspath(__file__))
    # back to the root directory
    main(os.path.join(current_dir, "input" ,"HAIL HOLY QUEEN- rivisto Perseveranza.pdf"))
