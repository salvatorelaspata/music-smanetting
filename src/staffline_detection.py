from src.staff import Staff
from src.box import BoundingBox

"""
Modulo per il rilevamento dei pentagrammi in un'immagine musicale.
Fornisce funzioni per identificare la posizione delle linee orizzontali
del pentagramma e i relativi punti di inizio e fine.
"""

def find_staffline_rows(img, line_width, line_spacing):
    """
    Individua le righe che compongono i pentagrammi nell'immagine.
    
    Args:
        img: Immagine binaria della partitura (0=nero, 255=bianco)
        line_width: Spessore delle linee del pentagramma
        line_spacing: Distanza tra le linee del pentagramma
        
    Returns:
        Lista di pentagrammi, dove ogni pentagramma è composto da 5 liste di indici di riga
    """
    num_rows = img.shape[0]  # Altezza dell'immagine (numero di righe)
    num_cols = img.shape[1]  # Larghezza dell'immagine (numero di colonne)
    row_black_pixel_histogram = []

    # Determina il numero di pixel neri in ogni riga dell'immagine
    for i in range(num_rows):
        row = img[i]
        num_black_pixels = 0
        for j in range(len(row)):
            if (row[j] == 0):
                num_black_pixels += 1

        row_black_pixel_histogram.append(num_black_pixels)

    # plt.bar(np.arange(num_rows), row_black_pixel_histogram)
    # plt.show()

    all_staff_row_indices = []
    num_stafflines = 5  # Numero di linee in un pentagramma standard
    threshold = 0.4     # Soglia per determinare se una linea è parte del pentagramma
    staff_length = num_stafflines * (line_width + line_spacing) - line_spacing
    iter_range = num_rows - staff_length + 1

    # Trova i pentagrammi cercando gruppi di 5 righe che:
    # - Si verificano secondo lo schema di larghezza e spaziatura previsto
    # - Contengono un numero sufficiente di pixel neri (sopra una soglia)
    #
    # Filtra usando la condizione che tutte le linee del pentagramma
    # devono avere un numero di pixel neri superiore alla soglia
    current_row = 0
    while (current_row < iter_range):
        staff_lines = [row_black_pixel_histogram[j: j + line_width] for j in
                       range(current_row, current_row + (num_stafflines - 1) * (line_width + line_spacing) + 1,
                             line_width + line_spacing)]
        pixel_avg = sum(sum(staff_lines, [])) / (num_stafflines * line_width)

        for line in staff_lines:
            if (sum(line) / line_width < threshold * num_cols):
                current_row += 1
                break
        else:
            staff_row_indices = [list(range(j, j + line_width)) for j in
                                 range(current_row,
                                       current_row + (num_stafflines - 1) * (line_width + line_spacing) + 1,
                                       line_width + line_spacing)]
            all_staff_row_indices.append(staff_row_indices)
            current_row = current_row + staff_length

    return all_staff_row_indices


def find_staffline_columns(img, all_staffline_vertical_indices, line_width, line_spacing):
    """
    Individua l'inizio e la fine di ogni pentagramma nell'immagine.
    
    Args:
        img: Immagine binaria della partitura
        all_staffline_vertical_indices: Indici delle righe che compongono i pentagrammi
        line_width: Spessore delle linee del pentagramma
        line_spacing: Distanza tra le linee del pentagramma
        
    Returns:
        Lista di tuple (inizio, fine) che rappresentano gli estremi orizzontali di ogni pentagramma
    """
    num_rows = img.shape[0]  # Altezza dell'immagine (numero di righe)
    num_cols = img.shape[1]  # Larghezza dell'immagine (numero di colonne)
    # Crea una lista di tuple della forma (indice colonna, numero di occorrenze della somma larghezza_spaziatura)
    all_staff_extremes = []

    # Trova l'inizio e la fine di ogni pentagramma nell'immagine
    for i in range(len(all_staffline_vertical_indices)):
        begin_list = [] # Memorizza i possibili indici di inizio del pentagramma
        end_list = []   # Memorizza i possibili indici di fine del pentagramma
        begin = 0
        end = num_cols - 1

        # Trova l'inizio del pentagramma
        for j in range(num_cols // 2):
            first_staff_rows_isolated = img[all_staffline_vertical_indices[i][0][0]:all_staffline_vertical_indices[i][4][
                line_width - 1], j]
            num_black_pixels = len(list(filter(lambda x: x == 0, first_staff_rows_isolated)))

            if (num_black_pixels == 0):
                begin_list.append(j)

        # Trova la colonna massima che non ha pixel neri nella finestra del pentagramma
        list.sort(begin_list, reverse=True)
        begin = begin_list[0]

        # Trova la fine del pentagramma
        for j in range(num_cols // 2, num_cols):
            first_staff_rows_isolated = img[all_staffline_vertical_indices[i][0][0]:all_staffline_vertical_indices[i][4][
                line_width - 1], j]
            num_black_pixels = len(list(filter(lambda x: x == 0, first_staff_rows_isolated)))

            if (num_black_pixels == 0):
                end_list.append(j)

        # Trova la colonna minima che non ha pixel neri nella finestra del pentagramma
        list.sort(end_list)
        end = end_list[0]

        staff_extremes = (begin, end)
        all_staff_extremes.append(staff_extremes)

    return all_staff_extremes

def create_staffs(all_staffline_vertical_indices, all_staffline_horizontal_indices, line_width, line_spacing, img):
    """
    Crea un oggetto BoundingBox a partire dalle coordinate e dimensioni specificate.
    
    Args:
        x: Coordinata x dell'angolo superiore sinistro
        y: Coordinata y dell'angolo superiore sinistro
        width: Larghezza del box
        height: Altezza del box
        
    Returns:
        Oggetto BoundingBox creato con le specifiche fornite
    """

    staffs = []
    half_dist_between_staffs = (all_staffline_vertical_indices[1][0][0] - all_staffline_vertical_indices[0][4][line_width - 1])//2
    
    print("[INFO] Distanza media tra i pentagrammi: ", half_dist_between_staffs)

    for i in range(len(all_staffline_vertical_indices)):
        # Create Bounding Box
        x = all_staffline_horizontal_indices[i][0]
        y = all_staffline_vertical_indices[i][0][0]
        width = all_staffline_horizontal_indices[i][1] - x
        height = all_staffline_vertical_indices[i][4][line_width - 1] - y
        staff_box = BoundingBox(x, y, width, height)

        # Create Cropped Staff Image
        staff_img = img[max(0, y - half_dist_between_staffs): min(y+ height + half_dist_between_staffs, img.shape[0] - 1), x:x+width]

        # Normalize Staff line Numbers to Cropped Image
        pixel = half_dist_between_staffs
        normalized_staff_line_vertical_indices = []

        for j in range(5):
            line = []
            for k in range(line_width):
                line.append(pixel)
                pixel += 1
            normalized_staff_line_vertical_indices.append(line)
            pixel += line_spacing + 1

        staff = Staff(normalized_staff_line_vertical_indices, staff_box, line_width, line_spacing, staff_img)
        staffs.append(staff)

    return staffs