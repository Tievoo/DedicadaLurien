import cv2
from time import sleep
import requests
import json
check = True


cam = cv2.VideoCapture(1)
detector = cv2.QRCodeDetector()
while True:
    while check:
        _, img = cam.read()
        data, bbox, _ = detector.detectAndDecode(img)
        if data:
            cv2.imwrite("testimage.png", img)
            check = False
            r = requests.get(f'http://localhost:6969/ballena/pollo/{data}')
            reponse = json.loads(r.text)
            print(reponse)

        cv2.imshow("img", img)
        if cv2.waitKey(1) == ord("Q"):
            break
    if not check:
        sleep(2)
        check = True
cam.release()
cv2.destroyAllWindows()
