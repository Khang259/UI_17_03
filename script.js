let socket = new WebSocket("ws://192.168.1.3:8000/ws");

// Mảng toàn cục để lưu lịch sử orderId và cardIndex từ dữ liệu dạng 2
let orderIdHistoryFromData2 = [];

socket.onopen = function() {
    console.log("Đã kết nối WebSocket");
};

socket.onmessage = function(event) {
    console.log("Dữ liệu thô nhận được:", event.data);

    try {
        let data = JSON.parse(event.data);
        let receivedData = data.received_data;
        console.log("receivedData:", receivedData);

        let parsedData = JSON.parse(receivedData);
        console.log("parsedData:", parsedData);

        let fromSystem = parsedData.fromSystem || "MS_1";
        let cardIndex = parseInt(fromSystem.replace("MS_", "")) - 1;
        console.log("Card index:", cardIndex);

        // Kiểm tra dữ liệu trong taskOrderDetail[0] (chỉ dùng cho dạng 2)
        let taskDetail = parsedData.taskOrderDetail && parsedData.taskOrderDetail[0]
            ? parsedData.taskOrderDetail[0]
            : {};

        let cards = document.querySelectorAll(".card");

        if (cardIndex >= 0 && cardIndex < cards.length) {
            let card = cards[cardIndex];

            // Kiểm tra dạng dữ liệu
            if (parsedData.icsTaskOrderDetailId !== undefined) {
                // Dạng 1: Cập nhật trạng thái thẻ nếu orderId trùng với lịch sử
                let status = parsedData.status;
                let currentOrderId = parsedData.orderId;
                console.log("Status:", status);
                console.log("Current orderId (Data 1):", currentOrderId);
                console.log("OrderId history from Data 2:", orderIdHistoryFromData2);

                // Tìm trong lịch sử orderId từ dữ liệu dạng 2
                let matchingEntry = orderIdHistoryFromData2.find(entry => entry.orderId === currentOrderId);
                if (matchingEntry) {
                    // Trùng orderId, cập nhật trạng thái cho thẻ đúng với cardIndex đã lưu
                    let targetCardIndex = matchingEntry.cardIndex;
                    if (targetCardIndex >= 0 && targetCardIndex < cards.length) {
                        let targetCard = cards[targetCardIndex];
                        if (status === 6) {
                            targetCard.classList.add('post');
                            targetCard.classList.remove('error');
                        } else if (status === 5 || status === 7) {
                            targetCard.classList.add('error');
                            targetCard.classList.remove('post');
                        } else {
                            targetCard.classList.remove('post', 'error');
                        }
                        console.log(`Đã cập nhật trạng thái card ${targetCardIndex} - Status: ${status}`);
                    } else {
                        console.log("Card index từ lịch sử không hợp lệ:", targetCardIndex);
                    }
                } else {
                    console.log(`Không cập nhật trạng thái vì không tìm thấy orderId ${currentOrderId} trong lịch sử`);
                }
            } else if (taskDetail.shelfModel) {
                // Dạng 2: Cập nhật .text_1 và lịch sử, lưu orderId và cardIndex vào lịch sử
                let shelfModel = taskDetail.shelfModel;
                let currentOrderId = parsedData.orderId;

                // Lưu orderId và cardIndex vào lịch sử
                orderIdHistoryFromData2.push({
                    orderId: currentOrderId,
                    cardIndex: cardIndex
                });
                console.log("Shelf model (header):", shelfModel);
                console.log("Added to orderId history:", orderIdHistoryFromData2);

                // Cập nhật shelfModel trong .row3 .text_1
                let shelfHeader = card.querySelector(".row3 .text_1");
                if (shelfHeader) {
                    shelfHeader.innerText = shelfModel;
                } else {
                    console.log("Không tìm thấy .row3 .text_1 trong card:", card);
                }

                // Cập nhật lịch sử
                let displayValue = shelfModel;
                console.log("Display value (table):", displayValue);

                let now = new Date();
                let timeString = now.getHours().toString().padStart(2, '0') + ":" +
                                now.getMinutes().toString().padStart(2, '0') + ":" +
                                now.getSeconds().toString().padStart(2, '0');

                let table = card.querySelector(".history-table");
                if (table) {
                    let newRow = table.insertRow(0);
                    let cell1 = newRow.insertCell(0);
                    let cell2 = newRow.insertCell(1);

                    cell1.innerText = timeString;
                    cell2.innerText = displayValue;

                    while (table.rows.length > 5) {
                        table.deleteRow(-1);
                    }
                } else {
                    console.log("Không tìm thấy bảng trong card:", card);
                }
                console.log(`Đã cập nhật lịch sử card ${cardIndex} - Shelf: ${shelfModel}, Table: ${displayValue}`);
            } else {
                console.log("Dữ liệu không thuộc dạng 1 hoặc dạng 2, không thực hiện cập nhật.");
            }
        } else {
            console.log("Card index không hợp lệ:", cardIndex);
        }

    } catch (e) {
        console.error("Lỗi khi parse dữ liệu:", e);
    }
};

socket.onerror = function(error) {
    console.error("Lỗi WebSocket:", error);
};

socket.onclose = function() {
    console.log("Ngắt kết nối WebSocket");
};