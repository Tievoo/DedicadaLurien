from cv2 import cv2
from time import sleep
import requests
import sys
import json
check = True


cam = cv2.VideoCapture(int(sys.argv[1]))

detector = cv2.QRCodeDetector()
while True:
    while check:
        _, img = cam.read()
        try:
            data, bbox, _ = detector.detectAndDecode(img)
            if data:
                cv2.imwrite("testimage.png", img)
                check = False
                r = requests.get(f'http://localhost:6969/ballena/pollo/{data}')
                # reponse = json.loads(r.text)
                # print(reponse['data']['message'])
        except Exception as err:
            pass
        cv2.imshow("img", img)
        if cv2.waitKey(1) == ord("Q"):
            break
    if not check:
        sleep(1)
        check = True
        

cam.release()
cv2.destroyAllWindows()
