import os
import cv2
import numpy as np
from src.utils import locate_templates, merge_boxes
from src.primitive import Primitive
from src.bar import Bar

# current directory
current_dir = os.path.dirname(os.path.abspath(__file__))
# main directory
main_dir = os.path.dirname(current_dir)
# resources directory
resources_dir = os.path.join(main_dir, "resources")
# template directory
template_dir = os.path.join(resources_dir, "template")

# -------------------------------------------------------------------------------
# Template Paths
# -------------------------------------------------------------------------------

# clef paths
clef_dir = os.path.join(template_dir, "clef")
# time signature paths
time_dir = os.path.join(template_dir, "time")

clef_paths = {
    "treble": [
        os.path.join(clef_dir, "treble_1.jpg"),
        os.path.join(clef_dir, "treble_2.jpg"),
        os.path.join(clef_dir, "treble_3.jpg"),
    ],
    "bass": [os.path.join(clef_dir, "bass_1.jpg")],
}

accidental_paths = {
    "sharp": [
        os.path.join(template_dir, "sharp-line.png"),
        os.path.join(template_dir, "sharp-space.png"),
    ],
    "flat": [
        os.path.join(template_dir, "flat-line.png"),
        os.path.join(template_dir, "flat-space.png"),
    ],
}

note_dir = os.path.join(template_dir, "note")

note_paths = {
    "quarter": [
        os.path.join(note_dir, "quarter.png"),
        os.path.join(note_dir, "solid-note.png"),
    ],
    "half": [
        os.path.join(note_dir, "half-space.png"),
        os.path.join(note_dir, "half-note-line.png"),
        os.path.join(note_dir, "half-line.png"),
        os.path.join(note_dir, "half-note-space.png"),
    ],
    "whole": [
        os.path.join(note_dir, "whole-space.png"),
        os.path.join(note_dir, "whole-note-line.png"),
        os.path.join(note_dir, "whole-line.png"),
        os.path.join(note_dir, "whole-note-space.png"),
    ],
}

flag_dir = os.path.join(template_dir, "flag")

flag_paths = [
    os.path.join(flag_dir, "eighth_flag_1.jpg"),
    os.path.join(flag_dir, "eighth_flag_2.jpg"),
    os.path.join(flag_dir, "eighth_flag_3.jpg"),
    os.path.join(flag_dir, "eighth_flag_4.jpg"),
    os.path.join(flag_dir, "eighth_flag_5.jpg"),
    os.path.join(flag_dir, "eighth_flag_6.jpg"),
]

barline_dir = os.path.join(template_dir, "barline")

barline_paths = [
    os.path.join(barline_dir, "barline_1.jpg"),
    os.path.join(barline_dir, "barline_2.jpg"),
    os.path.join(barline_dir, "barline_3.jpg"),
    os.path.join(barline_dir, "barline_4.jpg"),
]

rest_dir = os.path.join(template_dir, "rest")

rest_paths = {
    "eighth": [os.path.join(rest_dir, "eighth_rest.jpg")],
    "quarter": [os.path.join(rest_dir, "quarter_rest.jpg")],
    "half": [
        os.path.join(rest_dir, "half_rest_1.jpg"),
        os.path.join(rest_dir, "half_rest_2.jpg"),
    ],
    "whole": [os.path.join(rest_dir, "whole_rest.jpg")],
}

# -------------------------------------------------------------------------------
# Template Images
# -------------------------------------------------------------------------------

# Clefs
clef_imgs = {
    "treble": [cv2.imread(clef_file, 0) for clef_file in clef_paths["treble"]],
    "bass": [cv2.imread(clef_file, 0) for clef_file in clef_paths["bass"]],
}
# Time Signatures
time_imgs = {
    "common": [cv2.imread(time, 0) for time in [os.path.join(time_dir, "common.jpg")]],
    "44": [cv2.imread(time, 0) for time in [os.path.join(time_dir, "44.jpg")]],
    "34": [cv2.imread(time, 0) for time in [os.path.join(time_dir, "34.jpg")]],
    "24": [cv2.imread(time, 0) for time in [os.path.join(time_dir, "24.jpg")]],
    "68": [cv2.imread(time, 0) for time in [os.path.join(time_dir, "68.jpg")]],
}

# Accidentals
sharp_imgs = [cv2.imread(sharp_files, 0) for sharp_files in accidental_paths["sharp"]]
flat_imgs = [cv2.imread(flat_file, 0) for flat_file in accidental_paths["flat"]]

# Notes
quarter_note_imgs = [cv2.imread(quarter, 0) for quarter in note_paths["quarter"]]
half_note_imgs = [cv2.imread(half, 0) for half in note_paths["half"]]
whole_note_imgs = [cv2.imread(whole, 0) for whole in note_paths["whole"]]

# Rests
eighth_rest_imgs = [cv2.imread(eighth, 0) for eighth in rest_paths["eighth"]]
quarter_rest_imgs = [cv2.imread(quarter, 0) for quarter in rest_paths["quarter"]]
half_rest_imgs = [cv2.imread(half, 0) for half in rest_paths["half"]]
whole_rest_imgs = [cv2.imread(whole, 0) for whole in rest_paths["whole"]]

# Eighth Flag
eighth_flag_imgs = [cv2.imread(flag, 0) for flag in flag_paths]

# Bar line
bar_imgs = [cv2.imread(barline, 0) for barline in barline_paths]


# -------------------------------------------------------------------------------
# Template Thresholds
# -------------------------------------------------------------------------------

# Clefs
clef_lower, clef_upper, clef_thresh = 50, 150, 0.88

# Time
time_lower, time_upper, time_thresh = 50, 150, 0.85

# Accidentals
sharp_lower, sharp_upper, sharp_thresh = 50, 150, 0.70
flat_lower, flat_upper, flat_thresh = 50, 150, 0.77

# Notes
quarter_note_lower, quarter_note_upper, quarter_note_thresh = 50, 150, 0.70
half_note_lower, half_note_upper, half_note_thresh = 50, 150, 0.70
whole_note_lower, whole_note_upper, whole_note_thresh = 50, 150, 0.7011

# Rests
eighth_rest_lower, eighth_rest_upper, eighth_rest_thresh = (
    50,
    150,
    0.75,
)  # Before was 0.7
quarter_rest_lower, quarter_rest_upper, quarter_rest_thresh = 50, 150, 0.70
half_rest_lower, half_rest_upper, half_rest_thresh = 50, 150, 0.80
whole_rest_lower, whole_rest_upper, whole_rest_thresh = 50, 150, 0.80

# Eighth Flag
eighth_flag_lower, eighth_flag_upper, eighth_flag_thresh = 50, 150, 0.8

# Bar line
bar_lower, bar_upper, bar_thresh = 50, 150, 0.85

key_signature_changes = {
    "sharp": ["", "F", "FC", "FCG", "FCGD", "FCGDA", "FCGDAE", "FCGDAEB"],
    "flat": ["", "B", "BE", "BEA", "BEAD", "BEADG", "BEADGC", "BEADGCF"],
}

# -------------------------------------------------------------------------------
# Symbol Segmentation, Object Recognition, and Semantic Reconstruction
# -------------------------------------------------------------------------------

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
            clef_boxes = locate_templates(
                staff_img, clef_imgs[clef], clef_lower, clef_upper, clef_thresh
            )
            clef_boxes = merge_boxes([j for i in clef_boxes for j in i], 0.5)

            if len(clef_boxes) == 1:
                print("[INFO] Clef Found: ", clef)
                staffs[i].setClef(clef)

                # print("[INFO] Displaying Matching Results on staff", i + 1)
                clef_boxes_img = staffs[i].getImage()
                clef_boxes_img = clef_boxes_img.copy()

                for boxes in clef_boxes:
                    boxes.draw(staff_img_color, red, box_thickness)
                    x = int(boxes.getCorner()[0] + (boxes.getWidth() // 2))
                    y = int(boxes.getCorner()[1] + boxes.getHeight() + 10)
                    cv2.putText(
                        staff_img_color,
                        "{} clef".format(clef),
                        (x, y),
                        cv2.FONT_HERSHEY_DUPLEX,
                        0.9,
                        red,
                    )
                break

        else:
            # A clef should always be found
            print("[INFO] No clef found on staff", i + 1)

        # # ------- Time -------
        for time in time_imgs:
            print(
                "[INFO] Matching {} time signature template on staff".format(time),
                i + 1,
            )
            time_boxes = locate_templates(
                staff_img, time_imgs[time], time_lower, time_upper, time_thresh
            )
            time_boxes = merge_boxes([j for i in time_boxes for j in i], 0.5)

            if len(time_boxes) == 1:
                print("[INFO] Time Signature Found: ", time)
                staffs[i].setTimeSignature(time)

                # print("[INFO] Displaying Matching Results on staff", i + 1)

                for boxes in time_boxes:
                    boxes.draw(staff_img_color, red, box_thickness)
                    x = int(boxes.getCorner()[0] - (boxes.getWidth() // 2))
                    y = int(boxes.getCorner()[1] + boxes.getHeight() + 20)
                    cv2.putText(
                        staff_img_color,
                        "{} time".format(time),
                        (x, y),
                        cv2.FONT_HERSHEY_DUPLEX,
                        0.9,
                        red,
                    )
                break

            elif len(time_boxes) == 0 and i > 0:
                # Take time signature of previous staff
                previousTime = staffs[i - 1].getTimeSignature()
                staffs[i].setTimeSignature(previousTime)
                print(
                    "[INFO] No time signature found on staff",
                    i + 1,
                    ". Using time signature from previous staff line: ",
                    previousTime,
                )
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
    for i in range(len(staffs)):
        print("[INFO] Finding Primitives on Staff ", i + 1)
        staff_primitives = []
        staff_img = staffs[i].getImage()
        staff_img_color = staff_imgs_color[i]
        red = (0, 0, 255)
        box_thickness = 2

        # ------- Find primitives on staff -------
        print("[INFO] Matching sharp accidental template...")
        sharp_boxes = locate_templates(
            staff_img, sharp_imgs, sharp_lower, sharp_upper, sharp_thresh
        )
        sharp_boxes = merge_boxes([j for i in sharp_boxes for j in i], 0.5)

        print("[INFO] Displaying Matching Results on staff", i + 1)
        for box in sharp_boxes:
            box.draw(staff_img_color, red, box_thickness)
            text = "sharp"
            font = cv2.FONT_HERSHEY_DUPLEX
            textsize = cv2.getTextSize(text, font, fontScale=0.7, thickness=1)[0]
            x = int(box.getCorner()[0] - (textsize[0] // 2))
            y = int(box.getCorner()[1] + box.getHeight() + 20)
            cv2.putText(
                staff_img_color,
                text,
                (x, y),
                font,
                fontScale=0.7,
                color=red,
                thickness=1,
            )
            sharp = Primitive("sharp", 0, box)
            staff_primitives.append(sharp)

        print("[INFO] Matching flat accidental template...")
        flat_boxes = locate_templates(
            staff_img, flat_imgs, flat_lower, flat_upper, flat_thresh
        )
        flat_boxes = merge_boxes([j for i in flat_boxes for j in i], 0.5)

        print("[INFO] Displaying Matching Results on staff", i + 1)
        for box in flat_boxes:
            box.draw(staff_img_color, red, box_thickness)
            text = "flat"
            font = cv2.FONT_HERSHEY_DUPLEX
            textsize = cv2.getTextSize(text, font, fontScale=0.7, thickness=1)[0]
            x = int(box.getCorner()[0] - (textsize[0] // 2))
            y = int(box.getCorner()[1] + box.getHeight() + 20)
            cv2.putText(
                staff_img_color,
                text,
                (x, y),
                font,
                fontScale=0.7,
                color=red,
                thickness=1,
            )
            flat = Primitive("flat", 0, box)
            staff_primitives.append(flat)

        print("[INFO] Matching quarter note template...")
        quarter_boxes = locate_templates(
            staff_img,
            quarter_note_imgs,
            quarter_note_lower,
            quarter_note_upper,
            quarter_note_thresh,
        )
        quarter_boxes = merge_boxes([j for i in quarter_boxes for j in i], 0.5)

        print("[INFO] Displaying Matching Results on staff", i + 1)
        for box in quarter_boxes:
            box.draw(staff_img_color, red, box_thickness)
            text = "1/4 note"
            font = cv2.FONT_HERSHEY_DUPLEX
            textsize = cv2.getTextSize(text, font, fontScale=0.7, thickness=1)[0]
            x = int(box.getCorner()[0] - (textsize[0] // 2))
            y = int(box.getCorner()[1] + box.getHeight() + 20)
            cv2.putText(
                staff_img_color,
                text,
                (x, y),
                font,
                fontScale=0.7,
                color=red,
                thickness=1,
            )
            pitch = staffs[i].getPitch(round(box.getCenter()[1]))
            quarter = Primitive("note", 1, box, pitch)
            staff_primitives.append(quarter)

        print("[INFO] Matching half note template...")
        half_boxes = locate_templates(
            staff_img,
            half_note_imgs,
            half_note_lower,
            half_note_upper,
            half_note_thresh,
        )
        half_boxes = merge_boxes([j for i in half_boxes for j in i], 0.5)

        print("[INFO] Displaying Matching Results on staff", i + 1)
        for box in half_boxes:
            box.draw(staff_img_color, red, box_thickness)
            text = "1/2 note"
            font = cv2.FONT_HERSHEY_DUPLEX
            textsize = cv2.getTextSize(text, font, fontScale=0.7, thickness=1)[0]
            x = int(box.getCorner()[0] - (textsize[0] // 2))
            y = int(box.getCorner()[1] + box.getHeight() + 20)
            cv2.putText(
                staff_img_color,
                text,
                (x, y),
                font,
                fontScale=0.7,
                color=red,
                thickness=1,
            )
            pitch = staffs[i].getPitch(round(box.getCenter()[1]))
            half = Primitive("note", 2, box, pitch)
            staff_primitives.append(half)

        print("[INFO] Matching whole note template...")
        whole_boxes = locate_templates(
            staff_img,
            whole_note_imgs,
            whole_note_lower,
            whole_note_upper,
            whole_note_thresh,
        )
        whole_boxes = merge_boxes([j for i in whole_boxes for j in i], 0.5)

        print("[INFO] Displaying Matching Results on staff", i + 1)
        for box in whole_boxes:
            box.draw(staff_img_color, red, box_thickness)
            text = "1 note"
            font = cv2.FONT_HERSHEY_DUPLEX
            textsize = cv2.getTextSize(text, font, fontScale=0.7, thickness=1)[0]
            x = int(box.getCorner()[0] - (textsize[0] // 2))
            y = int(box.getCorner()[1] + box.getHeight() + 20)
            cv2.putText(
                staff_img_color,
                text,
                (x, y),
                font,
                fontScale=0.7,
                color=red,
                thickness=1,
            )
            pitch = staffs[i].getPitch(round(box.getCenter()[1]))
            whole = Primitive("note", 4, box, pitch)
            staff_primitives.append(whole)

        print("[INFO] Matching eighth rest template...")
        eighth_boxes = locate_templates(
            staff_img,
            eighth_rest_imgs,
            eighth_rest_lower,
            eighth_rest_upper,
            eighth_rest_thresh,
        )
        eighth_boxes = merge_boxes([j for i in eighth_boxes for j in i], 0.5)

        print("[INFO] Displaying Matching Results on staff", i + 1)
        for box in eighth_boxes:
            box.draw(staff_img_color, red, box_thickness)
            text = "1/8 rest"
            font = cv2.FONT_HERSHEY_DUPLEX
            textsize = cv2.getTextSize(text, font, fontScale=0.7, thickness=1)[0]
            x = int(box.getCorner()[0] - (textsize[0] // 2))
            y = int(box.getCorner()[1] + box.getHeight() + 20)
            cv2.putText(
                staff_img_color,
                text,
                (x, y),
                font,
                fontScale=0.7,
                color=red,
                thickness=1,
            )
            eighth = Primitive("rest", 0.5, box)
            staff_primitives.append(eighth)

        print("[INFO] Matching quarter rest template...")
        quarter_boxes = locate_templates(
            staff_img,
            quarter_rest_imgs,
            quarter_rest_lower,
            quarter_rest_upper,
            quarter_rest_thresh,
        )
        quarter_boxes = merge_boxes([j for i in quarter_boxes for j in i], 0.5)

        print("[INFO] Displaying Matching Results on staff", i + 1)
        for box in quarter_boxes:
            box.draw(staff_img_color, red, box_thickness)
            text = "1/4 rest"
            font = cv2.FONT_HERSHEY_DUPLEX
            textsize = cv2.getTextSize(text, font, fontScale=0.7, thickness=1)[0]
            x = int(box.getCorner()[0] - (textsize[0] // 2))
            y = int(box.getCorner()[1] + box.getHeight() + 20)
            cv2.putText(
                staff_img_color,
                text,
                (x, y),
                font,
                fontScale=0.7,
                color=red,
                thickness=1,
            )
            quarter = Primitive("rest", 1, box)
            staff_primitives.append(quarter)

        print("[INFO] Matching half rest template...")
        half_boxes = locate_templates(
            staff_img,
            half_rest_imgs,
            half_rest_lower,
            half_rest_upper,
            half_rest_thresh,
        )
        half_boxes = merge_boxes([j for i in half_boxes for j in i], 0.5)

        print("[INFO] Displaying Matching Results on staff", i + 1)
        for box in half_boxes:
            box.draw(staff_img_color, red, box_thickness)
            text = "1/2 rest"
            font = cv2.FONT_HERSHEY_DUPLEX
            textsize = cv2.getTextSize(text, font, fontScale=0.7, thickness=1)[0]
            x = int(box.getCorner()[0] - (textsize[0] // 2))
            y = int(box.getCorner()[1] + box.getHeight() + 20)
            cv2.putText(
                staff_img_color,
                text,
                (x, y),
                font,
                fontScale=0.7,
                color=red,
                thickness=1,
            )
            half = Primitive("rest", 2, box)
            staff_primitives.append(half)

        print("[INFO] Matching whole rest template...")
        whole_boxes = locate_templates(
            staff_img,
            whole_rest_imgs,
            whole_rest_lower,
            whole_rest_upper,
            whole_rest_thresh,
        )
        whole_boxes = merge_boxes([j for i in whole_boxes for j in i], 0.5)

        print("[INFO] Displaying Matching Results on staff", i + 1)
        for box in whole_boxes:
            box.draw(staff_img_color, red, box_thickness)
            text = "1 rest"
            font = cv2.FONT_HERSHEY_DUPLEX
            textsize = cv2.getTextSize(text, font, fontScale=0.7, thickness=1)[0]
            x = int(box.getCorner()[0] - (textsize[0] // 2))
            y = int(box.getCorner()[1] + box.getHeight() + 20)
            cv2.putText(
                staff_img_color,
                text,
                (x, y),
                font,
                fontScale=0.7,
                color=red,
                thickness=1,
            )
            whole = Primitive("rest", 4, box)
            staff_primitives.append(whole)

        print("[INFO] Matching eighth flag template...")
        flag_boxes = locate_templates(
            staff_img,
            eighth_flag_imgs,
            eighth_flag_lower,
            eighth_flag_upper,
            eighth_flag_thresh,
        )
        flag_boxes = merge_boxes([j for i in flag_boxes for j in i], 0.5)

        print("[INFO] Displaying Matching Results on staff", i + 1)

        for box in flag_boxes:
            box.draw(staff_img_color, red, box_thickness)
            text = "1/8 flag"
            font = cv2.FONT_HERSHEY_DUPLEX
            textsize = cv2.getTextSize(text, font, fontScale=0.7, thickness=1)[0]
            x = int(box.getCorner()[0] - (textsize[0] // 2))
            y = int(box.getCorner()[1] + box.getHeight() + 20)
            cv2.putText(
                staff_img_color,
                text,
                (x, y),
                font,
                fontScale=0.7,
                color=red,
                thickness=1,
            )
            flag = Primitive("eighth_flag", 0, box)
            staff_primitives.append(flag)

        print("[INFO] Matching bar line template...")
        bar_boxes = locate_templates(
            staff_img, bar_imgs, bar_lower, bar_upper, bar_thresh
        )
        bar_boxes = merge_boxes([j for i in bar_boxes for j in i], 0.5)

        print("[INFO] Displaying Matching Results on staff", i + 1)
        for box in bar_boxes:
            box.draw(staff_img_color, red, box_thickness)
            text = "line"
            font = cv2.FONT_HERSHEY_DUPLEX
            textsize = cv2.getTextSize(text, font, fontScale=0.7, thickness=1)[0]
            x = int(box.getCorner()[0] - (textsize[0] // 2))
            y = int(box.getCorner()[1] + box.getHeight() + 20)
            cv2.putText(
                staff_img_color,
                text,
                (x, y),
                font,
                fontScale=0.7,
                color=red,
                thickness=1,
            )
            line = Primitive("line", 0, box)
            staff_primitives.append(line)

        # print("[INFO] Saving detected primitives in staff {} onto disk".format(i + 1))
        # cv2.imwrite("output/staff_{}_primitives.jpg".format(i + 1), staff_img_color)
        # open_file("output/staff_{}_primitives.jpg".format(i+1))

        # ------- Sort primitives on staff from left to right -------

        staff_primitives.sort(key=lambda primitive: primitive.getBox().getCenter())

        print("[INFO] Staff primitives sorted in time")
        eighth_flag_indices = []
        for j in range(len(staff_primitives)):

            if staff_primitives[j].getPrimitive() == "eighth_flag":
                # Find all eighth flags
                eighth_flag_indices.append(j)

            if staff_primitives[j].getPrimitive() == "note":
                print(staff_primitives[j].getPitch(), end=", ")
            else:
                print(staff_primitives[j].getPrimitive(), end=", ")

        print("\n")

        # ------- Correct for eighth notes -------
        print("[INFO] Correcting for misclassified eighth notes")
        # Sort out eighth flags
        # Assign to closest note
        for j in eighth_flag_indices:

            distances = []
            distance = (
                staff_primitives[j].getBox().distance(staff_primitives[j - 1].getBox())
            )
            distances.append(distance)
            if j + 1 < len(staff_primitives):
                distance = (
                    staff_primitives[j]
                    .getBox()
                    .distance(staff_primitives[j + 1].getBox())
                )
                distances.append(distance)

            if distances[1] and distances[0] > distances[1]:
                staff_primitives[j + 1].setDuration(0.5)
            else:
                staff_primitives[j - 1].setDuration(0.5)

            print(
                "[INFO] Primitive {} was a eighth note misclassified as a quarter note".format(
                    j + 1
                )
            )
            del staff_primitives[j]

        # Correct for beamed eighth notes
        # If number of pixels in center row of two notes
        # greater than 5 * line_width, then notes are
        # beamed
        for j in range(len(staff_primitives)):
            if (
                j + 1 < len(staff_primitives)
                and staff_primitives[j].getPrimitive() == "note"
                and staff_primitives[j + 1].getPrimitive() == "note"
                and (
                    staff_primitives[j].getDuration() == 1
                    or staff_primitives[j].getDuration() == 0.5
                )
                and staff_primitives[j + 1].getDuration() == 1
            ):

                # Notes of interest
                note_1_center_x = staff_primitives[j].getBox().getCenter()[0]
                note_2_center_x = staff_primitives[j + 1].getBox().getCenter()[0]

                # Regular number of black pixels in staff column
                num_black_pixels = 5 * staffs[i].getLineWidth()

                # Actual number of black pixels in mid column
                center_column = (note_2_center_x - note_1_center_x) // 2
                mid_col = staff_img[:, int(note_1_center_x + center_column)]
                num_black_pixels_mid = len(np.where(mid_col == 0)[0])

                if num_black_pixels_mid > num_black_pixels:
                    # Notes beamed
                    # Make eighth note length
                    staff_primitives[j].setDuration(0.5)
                    staff_primitives[j + 1].setDuration(0.5)
                    print(
                        "[INFO] Primitive {} and {} were eighth notes misclassified as quarter notes".format(
                            j + 1, j + 2
                        )
                    )

        # ------- Account for Key Signature -------
        print("[INFO] Applying key signature note value changes")
        num_sharps = 0
        num_flats = 0
        j = 0
        while staff_primitives[j].getDuration() == 0:
            accidental = staff_primitives[j].getPrimitive()
            if accidental == "sharp":
                num_sharps += 1
                j += 1

            elif accidental == "flat":
                num_flats += 1
                j += 1

        # Check if last accidental belongs to note

        if j != 0:
            # Determine if accidental coupled with first note
            # Center of accidental should be within a note width from note
            max_accidental_offset_x = (
                staff_primitives[j].getBox().getCenter()[0]
                - staff_primitives[j].getBox().getWidth()
            )
            accidental_center_x = staff_primitives[j - 1].getBox().getCenter()[0]
            accidental_type = staff_primitives[j - 1].getPrimitive()

            if accidental_center_x > max_accidental_offset_x:
                print("[INFO] Last accidental belongs to first note")
                num_sharps = (
                    num_sharps - 1 if accidental_type == "sharp" else num_sharps
                )
                num_flats = num_flats - 1 if accidental_type == "flat" else num_flats

            # Modify notes in staff
            # notes_to_modify = []
            if accidental_type == "sharp":
                print(
                    "[INFO] Key signature has {} sharp accidentals: ".format(num_sharps)
                )
                # notes_to_modify = key_signature_changes[accidental_type][num_sharps]
                # Remove accidentals from primitive list
                staff_primitives = staff_primitives[num_sharps:]
            else:
                print(
                    "[INFO] Key signature has {} flat accidentals: ".format(num_flats)
                )
                # notes_to_modify = key_signature_changes[accidental_type][num_flats]
                # Remove accidentals from primitive list
                staff_primitives = staff_primitives[num_flats:]

            print("[INFO] Corrected note values after key signature: ")
            for primitive in staff_primitives:
                # type = primitive.getPrimitive()
                # note = primitive.getPitch()
                # if (type == "note" and note[0] in notes_to_modify):
                # new_note = MIDI_to_pitch[pitch_to_MIDI[note] + 1] if accidental_type == "sharp" else MIDI_to_pitch[pitch_to_MIDI[note] - 1]
                # primitive.setPitch(new_note)

                if primitive.getPrimitive() == "note":
                    print(primitive.getPitch(), end=", ")
                else:
                    print(primitive.getPrimitive(), end=", ")

            print("\n")

        # ------- Apply Sharps and Flats -------
        print("[INFO] Applying any accidental to neighboring note")
        primitive_indices_to_remove = []
        for j in range(len(staff_primitives)):
            accidental_type = staff_primitives[j].getPrimitive()

            if accidental_type == "flat" or accidental_type == "sharp":
                max_accidental_offset_x = (
                    staff_primitives[j + 1].getBox().getCenter()[0]
                    - staff_primitives[j + 1].getBox().getWidth()
                )
                accidental_center_x = staff_primitives[j].getBox().getCenter()[0]
                primitive_type = staff_primitives[j + 1].getPrimitive()

                if (
                    accidental_center_x > max_accidental_offset_x
                    and primitive_type == "note"
                ):
                    print("Primitive has accidental associated with it")
                    # note = staff_primitives[j + 1].getPitch()
                    # new_note = MIDI_to_pitch[pitch_to_MIDI[note] + 1] if accidental_type == "sharp" else MIDI_to_pitch[pitch_to_MIDI[note] - 1]
                    # staff_primitives[j+1].setPitch(new_note)
                    primitive_indices_to_remove.append(i)

        # Removed actioned accidentals
        for j in primitive_indices_to_remove:
            del staff_primitives[j]

        print("[INFO] Corrected note values after accidentals: ")
        for j in range(len(staff_primitives)):
            if staff_primitives[j].getPrimitive() == "note":
                print(staff_primitives[j].getPitch(), end=", ")
            else:
                print(staff_primitives[j].getPrimitive(), end=", ")

        print("\n")

        # ------- Assemble Staff -------

        print("[INFO] Assembling current staff")
        bar = Bar()
        while len(staff_primitives) > 0:
            primitive = staff_primitives.pop(0)

            if primitive.getPrimitive() != "line":
                bar.addPrimitive(primitive)
            else:
                staffs[i].addBar(bar)
                bar = Bar()
        # Add final bar in staff
        staffs[i].addBar(bar)

    return staffs, staff_imgs_color
