import cv2
from src.utils import locate_templates, merge_boxes

#-------------------------------------------------------------------------------
# Template Paths
#-------------------------------------------------------------------------------

# get main.py path
import os
current_dir = os.path.dirname(os.path.abspath(__file__))
main_dir = os.path.dirname(current_dir)
# get resources path
resources_dir = os.path.join(main_dir, "resources")
# get template path
template_dir = os.path.join(resources_dir, "template")
# get clef path
clef_dir = os.path.join(template_dir, "clef")
# get time path
time_dir = os.path.join(template_dir, "time")

clef_paths = {
    "treble": [
        os.path.join(clef_dir, "treble_1.jpg"),
        os.path.join(clef_dir, "treble_2.jpg"),
        os.path.join(clef_dir, "treble_3.jpg")
    ],
    "bass": [
        os.path.join(clef_dir, "bass_1.jpg")
    ]
}

#-------------------------------------------------------------------------------
# Template Images
#-------------------------------------------------------------------------------

# Clefs
clef_imgs = {
    "treble": [cv2.imread(clef_file, 0) for clef_file in clef_paths["treble"]],
    "bass": [cv2.imread(clef_file, 0) for clef_file in clef_paths["bass"]]
}
# Time Signatures
time_imgs = {
    "common": [cv2.imread(time, 0) for time in [os.path.join(time_dir, "common.jpg")]],
    "44": [cv2.imread(time, 0) for time in [os.path.join(time_dir, "44.jpg")]],
    "34": [cv2.imread(time, 0) for time in [os.path.join(time_dir, "34.jpg")]],
    "24": [cv2.imread(time, 0) for time in [os.path.join(time_dir, "24.jpg")]],
    "68": [cv2.imread(time, 0) for time in [os.path.join(time_dir, "68.jpg")]]
}

#-------------------------------------------------------------------------------
# Template Thresholds
#-------------------------------------------------------------------------------

# Clefs
clef_lower, clef_upper, clef_thresh = 50, 150, 0.88

# Time
time_lower, time_upper, time_thresh = 50, 150, 0.85


#-------------------------------------------------------------------------------
# Symbol Segmentation, Object Recognition, and Semantic Reconstruction
#-------------------------------------------------------------------------------

# The score is then divided into regions of interest to localize and isolate the musical primitives.
# Music score is analyzed and split by staves
# Primitive symbols extracted

# Find all primitives on each stave first
# then move from left to right and create structure

# ============ Determine Clef, Time Signature ============

def find_clef_time_signature(staffs):
    """
    Trova la chiave e la misura in un pentagramma.
    
    Args:
        staffs: Lista di oggetti Staff che rappresentano i pentagrammi
        
    Returns:
        Tuple contenente la chiave e la misura trovate
    """
    # Implementa il rilevamento della chiave e della misura qui
    # Restituisce una tupla (clef, time_signature)
    staff_imgs_color = []

    for i in range(len(staffs)):
        red = (0, 0, 255)
        box_thickness = 2
        staff_img = staffs[i].getImage()
        staff_img_color = staff_img.copy()
        staff_img_color = cv2.cvtColor(staff_img_color, cv2.COLOR_GRAY2RGB)

        # ------- Clef -------
        for clef in clef_imgs:
            # show the clef template
            print("[INFO] Matching {} clef template on staff".format(clef), i + 1)
            clef_boxes = locate_templates(staff_img, clef_imgs[clef], clef_lower, clef_upper, clef_thresh)
            clef_boxes = merge_boxes([j for i in clef_boxes for j in i], 0.5)

            if (len(clef_boxes) == 1):
                print("[INFO] Clef Found: ", clef)
                staffs[i].setClef(clef)

                # print("[INFO] Displaying Matching Results on staff", i + 1)
                clef_boxes_img = staffs[i].getImage()
                clef_boxes_img = clef_boxes_img.copy()

                for boxes in clef_boxes:
                    boxes.draw(staff_img_color, red, box_thickness)
                    x = int(boxes.getCorner()[0] + (boxes.getWidth() // 2))
                    y = int(boxes.getCorner()[1] + boxes.getHeight() + 10)
                    cv2.putText(staff_img_color, "{} clef".format(clef), (x, y), cv2.FONT_HERSHEY_DUPLEX, 0.9, red)
                break

        else:
            # A clef should always be found
            print("[INFO] No clef found on staff", i+1)

        # # ------- Time -------
        for time in time_imgs:
            print("[INFO] Matching {} time signature template on staff".format(time), i + 1)
            time_boxes = locate_templates(staff_img, time_imgs[time], time_lower, time_upper, time_thresh)
            time_boxes = merge_boxes([j for i in time_boxes for j in i], 0.5)

            if (len(time_boxes) == 1):
                print("[INFO] Time Signature Found: ", time)
                staffs[i].setTimeSignature(time)

                # print("[INFO] Displaying Matching Results on staff", i + 1)

                for boxes in time_boxes:
                    boxes.draw(staff_img_color, red, box_thickness)
                    x = int(boxes.getCorner()[0] - (boxes.getWidth() // 2))
                    y = int(boxes.getCorner()[1] + boxes.getHeight() + 20)
                    cv2.putText(staff_img_color, "{} time".format(time), (x, y), cv2.FONT_HERSHEY_DUPLEX, 0.9, red)
                break

            elif (len(time_boxes) == 0 and i > 0):
                # Take time signature of previous staff
                previousTime = staffs[i-1].getTimeSignature()
                staffs[i].setTimeSignature(previousTime)
                print("[INFO] No time signature found on staff", i + 1, ". Using time signature from previous staff line: ", previousTime)
                break
        else:
            print("[INFO] No time signature available for staff", i + 1)

        staff_imgs_color.append(staff_img_color)

    return staffs, staff_imgs_color

def find_primitive(staffs, staff_imgs_color):
    """
    Trova le primitive musicali in un pentagramma.
    
    Args:
        staffs: Lista di oggetti Staff che rappresentano i pentagrammi
        staff_imgs_color: Lista di immagini dei pentagrammi con le primitive trovate
        
    Returns:
        Tuple contenente la chiave e la misura trovate
    """
    # Implementa il rilevamento delle primitive qui
    # Restituisce una tupla (clef, time_signature)
    return staffs, staff_imgs_color