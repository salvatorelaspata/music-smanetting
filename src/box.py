"""
Modulo che definisce la classe BoundingBox per la gestione dei riquadri di delimitazione.
Utilizzato per identificare e manipolare elementi nelle partiture musicali.
"""
import cv2
import math

class BoundingBox(object):
    """
    Classe che rappresenta un riquadro di delimitazione (bounding box) rettangolare.
    Utilizzata per racchiudere elementi come note, simboli musicali, o altri componenti
    della partitura.
    """
    def __init__(self, x, y, w, h):
        """
        Inizializza un nuovo box di delimitazione.
        
        Args:
            x: Coordinata x dell'angolo superiore sinistro
            y: Coordinata y dell'angolo superiore sinistro
            w: Larghezza del box
            h: Altezza del box
        """
        self.x = x;
        self.y = y;
        self.w = w;
        self.h = h;
        self.middle = self.x + self.w/2, self.y + self.h/2  # Punto centrale del box
        self.area = self.w * self.h  # Area del box

    def overlap(self, other):
        """
        Calcola la percentuale di sovrapposizione con un altro box.
        
        Args:
            other: Altro oggetto BoundingBox
            
        Returns:
            Rapporto tra l'area sovrapposta e l'area di questo box
        """
        overlap_x = max(0, min(self.x + self.w, other.x + other.w) - max(self.x, other.x));
        overlap_y = max(0, min(self.y + self.h, other.y + other.h) - max(self.y, other.y));
        overlap_area = overlap_x * overlap_y
        return overlap_area / self.area

    def distance(self, other):
        """
        Calcola la distanza euclidea tra i centri di questo box e un altro.
        
        Args:
            other: Altro oggetto BoundingBox
            
        Returns:
            Distanza euclidea tra i centri
        """
        dx = self.middle[0] - other.middle[0]
        dy = self.middle[1] - other.middle[1]
        return math.sqrt(dx*dx + dy*dy)

    def merge(self, other):
        """
        Unisce questo box con un altro, creando un nuovo box che contiene entrambi.
        
        Args:
            other: Altro oggetto BoundingBox
            
        Returns:
            Nuovo oggetto BoundingBox che contiene entrambi i box originali
        """
        x = min(self.x, other.x)
        y = min(self.y, other.y)
        w = max(self.x + self.w, other.x + other.w) - x
        h = max(self.y + self.h, other.y + other.h) - y
        return BoundingBox(x, y, w, h)

    def draw(self, img, color, thickness):
        """
        Disegna il box su un'immagine.
        
        Args:
            img: Immagine su cui disegnare (formato OpenCV)
            color: Colore del rettangolo (B,G,R)
            thickness: Spessore delle linee del rettangolo
        """
        pos = ((int)(self.x), (int)(self.y))
        size = ((int)(self.x + self.w), (int)(self.y + self.h))
        cv2.rectangle(img, pos, size, color, thickness)

    def getCorner(self):
        """
        Restituisce le coordinate dell'angolo superiore sinistro.
        
        Returns:
            Tupla (x, y) dell'angolo superiore sinistro
        """
        return self.x, self.y

    def getWidth(self):
        """
        Restituisce la larghezza del box.
        
        Returns:
            Larghezza del box
        """
        return self.w

    def getHeight(self):
        """
        Restituisce l'altezza del box.
        
        Returns:
            Altezza del box
        """
        return self.h

    def getCenter(self):
        """
        Restituisce il punto centrale del box.
        
        Returns:
            Tupla (x, y) del centro del box
        """
        return self.middle
