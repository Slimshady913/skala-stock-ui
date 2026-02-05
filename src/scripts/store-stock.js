import { reactive } from "vue";

// 전역에서 공유할 상태 변수 (주식 정보)
const storage = reactive({
    id: "",
    stockName: "",
    stockPrice: 0
});

// StockList.vue에서 호출: 선택된 주식 정보를 저장
export const setStock = (stock) => {
    // ItemsTable에서 넘어오는 데이터 구조에 맞춰 매핑
    storage.id = stock.id;
    storage.stockName = stock.stockName;
    storage.stockPrice = stock.stockPrice;
};

// PlayerStocks.vue에서 호출: 현재 저장된 주식 정보를 가져옴
export const useStock = () => {
    return storage;
};