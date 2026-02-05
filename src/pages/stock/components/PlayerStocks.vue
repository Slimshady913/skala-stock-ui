<script setup>
import { ref, reactive, onMounted, watch } from 'vue';
import { usePlayer } from '@/scripts/store-player';
import apiCall from '@/scripts/api-call';
import { useStock } from '@/scripts/store-stock';
// 알림창 통일
import { notifyInfo } from '@/scripts/store-popups';

const stockId = ref('');
const stockQuantity = ref('');
const playerMoney = ref(0); // 숫자로 초기화 (권장)

// 보유 주식 목록에서 행 클릭 시 실행될 함수
const onHeldStockSelected = (item) => {
  // item 객체에는 테이블에 표시된 데이터가 들어있습니다.
  // headers 설정에 따라 key값은 'stockId' 입니다.
  stockId.value = item.stockId;
  
  // (선택사항) 클릭 시 수량을 1로 초기화하거나, 
  // 판매 편의를 위해 보유 전량(item.quantity)으로 세팅할 수도 있습니다.
  stockQuantity.value = 1; 
}

// 스토어 상태 가져오기
const selectedStockStore = useStock();

// 스토어의 주식 ID가 변경되면 입력창에 반영 (좌측 목록 클릭 시 연동)
watch(() => selectedStockStore.id, (newId) => {
  if (newId) {
    stockId.value = newId;
    // (선택사항) 주식이 바뀌면 수량을 1로 초기화하거나 비움
    // 현재는 1로 초기화
    stockQuantity.value = 1; 
  }
});

// 테이블 상태
const table = reactive({
  headers: [
    { label: "주식ID", value: "stockId" },
    { label: "주식명", value: "stockName" },
    { label: "주식가격", value: "stockPrice" },
    { label: "보유수량", value: "quantity" }
  ],
  items: []
})

const player = usePlayer();

// 플레이어 정보 조회 함수
const getPlayerInfo = async () => {
  try {
    const url = '/api/players/' + player.playerId;
    const response = await apiCall.get(url, null, null);
    if (response.result === apiCall.Response.SUCCESS) {
      playerMoney.value = response.body.playerMoney;
      table.items = response.body.stocks;
    }
  } catch (error) {
    console.error("플레이어 정보 조회 실패", error);
  }
}

// 주식 구매 함수
const buyPlayerStock = async () => {
  // 유효성 검사 및 알림창 변경
  if (!stockId.value || !stockQuantity.value) {
    notifyInfo("주식 ID와 수량을 입력해주세요.");
    return;
  }
  if (Number(stockQuantity.value) <= 0) {
    notifyInfo("수량은 1 이상이어야 합니다.");
    return;
  }

  try { // 예외 처리
    const url = '/api/players/buy';
    const requestBody = {
      playerId: player.playerId,
      stockId: stockId.value,
      stockQuantity: Number(stockQuantity.value) // 숫자로 변환하여 전송
    }

    const response = await apiCall.post(url, null, requestBody);
    
    if (response.result === apiCall.Response.SUCCESS) {
        await getPlayerInfo(); // 정보 갱신
        
        // 입력 필드 초기화 및 성공 알림
        stockId.value = '';
        stockQuantity.value = '';
        notifyInfo("매수가 완료되었습니다.");
    } else {
        notifyInfo(response.message || "매수에 실패했습니다.");
    }
  } catch (error) {
    console.error(error);
    notifyInfo("매수 처리 중 오류가 발생했습니다.");
  }
}

// 주식 판매 함수
const sellPlayerStock = async () => {
  if (!stockId.value || !stockQuantity.value) {
    notifyInfo("주식 ID와 수량을 입력해주세요.");
    return;
  }
  if (Number(stockQuantity.value) <= 0) {
    notifyInfo("수량은 1 이상이어야 합니다.");
    return;
  }

  try {
    const url = '/api/players/sell';
    const requestBody = {
      playerId: player.playerId,
      stockId: stockId.value,
      stockQuantity: Number(stockQuantity.value)
    }

    const response = await apiCall.post(url, null, requestBody);
    
    if (response.result === apiCall.Response.SUCCESS) {
        await getPlayerInfo(); 
        
        stockId.value = '';
        stockQuantity.value = '';
        notifyInfo("매도가 완료되었습니다.");
    } else {
        notifyInfo(response.message || "매도에 실패했습니다.");
    }
  } catch (error) {
    console.error(error);
    notifyInfo("매도 처리 중 오류가 발생했습니다.");
  }
}

onMounted(() => {
  getPlayerInfo()
})

</script>
<template>
  <div class="row mt-2">
    <span class="fs-4"><i class="bi bi-person m-2"></i>{{ player.playerId }} 플레이어</span>
  </div>
  <div class="row border-bottom">
    <div class="col d-flex justify-content-end">
      <button class="btn btn-sm btn-primary m-1" @click="getPlayerInfo">
        <i class="bi bi-arrow-counterclockwise m-2"></i>갱신
      </button>
    </div>
  </div>
  <div class="row">
    <div class="col">
      <InlineInput class="m-2" label="플레이어ID" v-model="player.playerId" :disabled="true" />
      <InlineInput class="m-2" label="보유금액" v-model="playerMoney" :disabled="true" />
    </div>
  </div>
  <div class="row g-2 align-items-center m-2 mt-0">
    <div class="col-2 d-flex justify-content-end">
      <label class="col-form-label form-control-sm p-1">보유주식목록</label>
    </div>
    <div class="col">
      <ItemsTable 
        :headers="table.headers" 
        :items="table.items" 
        :nosetting="true" 
        @rowSelected="onHeldStockSelected" 
      />
    </div>
  </div>
  <div class="row g-2 align-items-center m-2 mt-0">
    <div class="col-2 d-flex justify-content-end">
      <label class="col-form-label form-control-sm p-1">주식선택</label>
    </div>
    <div class="col">
      <InlineInput v-model="stockId" placeholder="주식ID" />
    </div>
    <div class="col">
      <InlineInput v-model="stockQuantity" type="number" placeholder="주식수량" />
    </div>
    <div class="col d-flex justify-content-start">
      <button class="btn btn-sm btn-outline-primary m-1" @click="buyPlayerStock">주식 구매</button>
      <button class="btn btn-sm btn-outline-primary m-1" @click="sellPlayerStock">주식 판매</button>
    </div>
  </div>
</template>