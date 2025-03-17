
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from typing import List
import uvicorn
import json

app = FastAPI()
connected_clients: List[WebSocket] = []

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    connected_clients.append(websocket)
    print(f"Client đã kết nối. Tổng client: {len(connected_clients)}")  # Log khi kết nối
    try:
        while True:
            data = await websocket.receive_text()
            print(f"Nhận từ client: {data}")
            await websocket.send_text(f"Echo: {data}")
    except WebSocketDisconnect:
        connected_clients.remove(websocket)
        print(f"Client ngắt kết nối. Tổng client còn lại: {len(connected_clients)}")

@app.post("/send-data")
async def send_data(data: dict):
    message = {"received_data": json.dumps(data)}
    message_json = json.dumps(message)
    print(f"Dữ liệu chuẩn bị gửi: {message_json}")
    print(f"Số client hiện tại: {len(connected_clients)}")  # Log số client

    if connected_clients:
        for client in connected_clients:
            try:
                await client.send_text(message_json)
                print(f"Đã gửi dữ liệu tới client: {client}")
            except Exception as e:
                print(f"Lỗi khi gửi tới client: {e}")
                connected_clients.remove(client)
    else:
        print("Không có client nào để gửi dữ liệu!")
    
    return {"message": "Dữ liệu đã được gửi qua WebSocket"}

if __name__ == "__main__":
    uvicorn.run("server:app", host="192.168.1.3", port=8000, reload=True)