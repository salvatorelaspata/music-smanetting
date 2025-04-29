import os
import fitz  # PyMuPDF
from typing import List
import io
from PIL import Image

def is_pdf(file_path: str) -> bool:
    """Check if a file is a PDF based on its extension"""
    return file_path.lower().endswith('.pdf')

def pdf_to_images(pdf_path: str, output_dir: str, dpi: int = 300) -> List[str]:
    """
    Convert a PDF to a series of JPG images using PyMuPDF (no external dependencies)
    
    Args:
        pdf_path: Path to the PDF file
        output_dir: Directory to save the images
        dpi: Resolution for the conversion
        
    Returns:
        List of paths to the generated images
    """
    # Create output directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)
    
    # Get the PDF filename without extension
    pdf_name = os.path.basename(pdf_path).rsplit('.', 1)[0]
    
    # Create a subdirectory with the PDF name
    pdf_output_dir = os.path.join(output_dir, f"{pdf_name}_pages")
    os.makedirs(pdf_output_dir, exist_ok=True)
    
    # Convert PDF to images
    print(f"[INFO] Converting PDF to images (this may take a while)...")
    image_paths = []
    
    try:
        # Calculate the zoom factor based on DPI (72 DPI is the base)
        zoom = dpi / 72
        
        # Open the PDF
        pdf_document = fitz.open(pdf_path)
        
        # Process each page
        for page_num, page in enumerate(pdf_document):
            # Get the page as a pixmap (image)
            pix = page.get_pixmap(matrix=fitz.Matrix(zoom, zoom))
            
            # Convert pixmap to PIL Image
            img_data = pix.tobytes("jpeg")
            img = Image.open(io.BytesIO(img_data))
            
            # Save image with sequential filename
            image_path = os.path.join(pdf_output_dir, f"page_{page_num+1:03d}.jpg")
            img.save(image_path, "JPEG")
            image_paths.append(image_path)
        
    except Exception as e:
        print(f"[ERROR] Failed to convert PDF: {e}")
        print("[INFO] Install PyMuPDF with: pip install PyMuPDF")
        return []
    
    print(f"[INFO] Converted {len(image_paths)} pages from PDF to JPG")
    return image_paths
