"""
Modulo che definisce la classe Staff (Pentagramma) per rappresentare e analizzare
pentagrammi musicali all'interno del processo di riconoscimento della partitura.
"""

class Staff(object):
    """
    Classe che rappresenta un pentagramma musicale.
    Memorizza informazioni sulle linee, chiave musicale, indicazione di tempo
    e fornisce metodi per l'analisi degli elementi all'interno del pentagramma.
    """
    def __init__(self, staff_matrix, staff_box, line_width, line_spacing, staff_img, clef="treble", time_signature="44", instrument=-1):
        """
        Inizializza un nuovo pentagramma.
        
        Args:
            staff_matrix: Matrice che contiene gli indici delle 5 righe del pentagramma
            staff_box: Riquadro di delimitazione che contiene il pentagramma
            line_width: Spessore delle linee del pentagramma
            line_spacing: Distanza tra le linee del pentagramma
            staff_img: Immagine contenente il pentagramma
            clef: Chiave musicale (predefinita: "treble" - chiave di violino)
            time_signature: Indicazione di tempo (predefinita: "44" - quattro quarti)
            instrument: ID dello strumento associato (predefinito: -1, non specificato)
        """
        self.clef = clef
        self.time_signature = time_signature
        self.instrument = instrument
        self.line_one = staff_matrix[0]    # Prima linea (superiore) del pentagramma
        self.line_two = staff_matrix[1]    # Seconda linea del pentagramma
        self.line_three = staff_matrix[2]  # Terza linea del pentagramma
        self.line_four = staff_matrix[3]   # Quarta linea del pentagramma
        self.line_five = staff_matrix[4]   # Quinta linea (inferiore) del pentagramma
        self.staff_box = staff_box
        self.img = staff_img
        self.bars = []  # Misure musicali nel pentagramma
        self.line_width = line_width
        self.line_spacing = line_spacing

    def setClef(self, clef):
        """Imposta la chiave musicale del pentagramma"""
        self.clef = clef

    def setTimeSignature(self, time):
        """Imposta l'indicazione di tempo del pentagramma"""
        self.time_signature = time

    def setInstrument(self, instrument):
        """Imposta lo strumento associato al pentagramma"""
        self.instrument = instrument

    def addBar(self, bar):
        """Aggiunge una misura musicale al pentagramma"""
        self.bars.append(bar)

    def getClef(self):
        """Restituisce la chiave musicale del pentagramma"""
        return self.clef

    def getTimeSignature(self):
        """Restituisce l'indicazione di tempo del pentagramma"""
        return self.time_signature

    def getBox(self):
        """Restituisce il riquadro di delimitazione del pentagramma"""
        return self.staff_box

    def getImage(self):
        """Restituisce l'immagine contenente il pentagramma"""
        return self.img

    def getLineWidth(self):
        """Restituisce lo spessore delle linee del pentagramma"""
        return self.line_width

    def getLineSpacing(self):
        """Restituisce la distanza tra le linee del pentagramma"""
        return self.line_spacing

    def getBars(self):
        """Restituisce le misure musicali nel pentagramma"""
        return self.bars

    def getPitch(self, note_center_y):
        """
        Determina l'altezza (pitch) di una nota basandosi sulla sua posizione verticale nel pentagramma.
        
        Args:
            note_center_y: Coordinata y del centro della nota
            
        Returns:
            Stringa che rappresenta l'altezza della nota (es. "C4", "F5", ecc.)
            
        Note:
            Il metodo usa informazioni sulla chiave musicale (violino o basso) per determinare
            correttamente l'altezza in base al posizionamento verticale.
        """
        # Informazioni sulle altezze delle note in base alla chiave musicale
        clef_info = {
            "treble": [("F5", "E5", "D5", "C5", "B4", "A4", "G4", "F4", "E4"), (5,3), (4,2)],  # Chiave di violino
            "bass": [("A3", "G3", "F3", "E3", "D3", "C3", "B2", "A2", "G2"), (3,5), (2,4)]     # Chiave di basso
        }
        note_names = ["C", "D", "E", "F", "G", "A", "B"]  # Nomi delle note musicali

        #print("[getPitch] Using {} clef".format(self.clef))

        # Controlla prima se la nota è all'interno del pentagramma
        if (note_center_y in self.line_one):
            return clef_info[self.clef][0][0]
        elif (note_center_y in list(range(self.line_one[-1] + 1, self.line_two[0]))):
            return clef_info[self.clef][0][1]
        elif (note_center_y in self.line_two):
            return clef_info[self.clef][0][2]
        elif (note_center_y in list(range(self.line_two[-1] + 1, self.line_three[0]))):
            return clef_info[self.clef][0][3]
        elif (note_center_y in self.line_three):
            return clef_info[self.clef][0][4]
        elif (note_center_y in list(range(self.line_three[-1] + 1, self.line_four[0]))):
            return clef_info[self.clef][0][5]
        elif (note_center_y in self.line_four):
            return clef_info[self.clef][0][6]
        elif (note_center_y in list(range(self.line_four[-1] + 1, self.line_five[0]))):
            return clef_info[self.clef][0][7]
        elif (note_center_y in self.line_five):
            return clef_info[self.clef][0][8]
        else:
            # print("[getPitch] Note was not within staff")
            if (note_center_y < self.line_one[0]):
                # print("[getPitch] Note above staff ")
                # Controlla sopra il pentagramma
                line_below = self.line_one
                current_line = [pixel - self.line_spacing for pixel in self.line_one] # Va alla linea sopra
                octave = clef_info[self.clef][1][0]  # Numero dell'ottava alla prima linea
                note_index = clef_info[self.clef][1][1]  # La posizione della prima linea nell'array note_names

                while (current_line[0] > 0):
                    if (note_center_y in current_line):
                        # Prende la nota due posizioni sopra
                        octave = octave + 1 if (note_index + 2 >= 7) else octave
                        note_index = (note_index + 2) % 7
                        return note_names[note_index] + str(octave)
                    elif (note_center_y in range(current_line[-1] + 1, line_below[0])):
                        # Prende la nota una posizione sopra
                        octave = octave + 1 if (note_index + 1 >= 7) else octave
                        note_index = (note_index + 1) % 7
                        return note_names[note_index] + str(octave)
                    else:
                        # Controlla la prossima linea sopra
                        octave = octave + 1 if (note_index + 2 >= 7) else octave
                        note_index = (note_index + 2) % 7
                        line_below = current_line.copy()
                        current_line = [pixel - self.line_spacing for pixel in current_line]

                assert False, "[ERRORE] La nota è sopra il pentagramma, ma non è stata trovata"
            elif (note_center_y > self.line_five[-1]):
                # print("[getPitch] Note below staff ")
                # Controlla sotto il pentagramma
                line_above = self.line_five
                current_line = [pixel + self.line_spacing for pixel in self.line_five]  # Va alla linea sotto
                octave = clef_info[self.clef][2][0]  # Numero dell'ottava alla quinta linea
                note_index = clef_info[self.clef][2][1]  # La posizione della quinta linea nell'array note_names

                while (current_line[-1] < self.img.shape[0]):
                    if (note_center_y in current_line):
                        # Prende la nota due posizioni sotto
                        octave = octave - 1 if (note_index - 2 <= 7) else octave
                        note_index = (note_index - 2) % 7
                        return note_names[note_index] + str(octave)
                    elif (note_center_y in range(line_above[-1] + 1, current_line[0])):
                        # Prende la nota una posizione sotto
                        octave = octave - 1 if (note_index - 1 >= 7) else octave
                        note_index = (note_index - 1) % 7
                        return note_names[note_index] + str(octave)
                    else:
                        # Controlla la prossima linea sotto
                        octave = octave - 1 if (note_index - 2 <= 7) else octave
                        note_index = (note_index - 2) % 7
                        line_above = current_line.copy()
                        current_line = [pixel + self.line_spacing for pixel in current_line]
                assert False, "[ERRORE] La nota è sotto il pentagramma, ma non è stata trovata"
            else:
                # Non dovremmo mai arrivare qui
                assert False, "[ERRORE] La nota non è né dentro, né sopra, né sotto il pentagramma"