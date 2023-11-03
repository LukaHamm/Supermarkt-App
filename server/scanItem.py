import numpy as np
import cv2 as cv
from pyzbar import pyzbar

cap = cv.VideoCapture(0)
if not cap.isOpened():
    print("Cannot open camera")
    exit()
while True:
    # Capture frame-by-frame
    ret, frame = cap.read()
    # if frame is read correctly ret is True
    if not ret:
        print("Can't receive frame (stream end?). Exiting ...")
        break
    # Our operations on the frame come here
    gray = cv.cvtColor(frame, cv.COLOR_BGR2GRAY)
    # Display the resulting frame
    barcodes = pyzbar.decode(frame)
    if(len(barcodes) > 0):
        break
    
    cv.imshow('frame', gray)
    if cv.waitKey(1) == ord('q'):
        break
    
# When everything done, release the capture
for barcode in barcodes:
    # do anything with that data
    print( barcode.data.decode("utf-8") )
cap.release()
cv.destroyAllWindows()