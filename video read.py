import cv2
cap=cv2.VideoCapture(0)

while True:
    ret,frame = cap.read()
    
    if ret == False:
        continue
    
    cv2.imshow("video frame",frame)
  
    key = cv2.waitKey(10)

    if key == ord('q'):
        print("Exiting...")
        break
    
cap.release()
cv2.destroyAllWindows()
    