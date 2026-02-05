<script setup>
import { ref, reactive, onMounted, watch } from 'vue';
import { usePlayer } from '@/scripts/store-player';
import apiCall from '@/scripts/api-call';
// 주식 스토어 임포트
import { useStock } from '@/scripts/store-stock';

const stockId = ref('');
const stockQuantity = ref('');
const playerMoney = ref('');

// 스토어 상태 가져오기
const selectedStockStore = useStock();

// 스토어의 주식 ID가 변경되면 입력창에 반영
watch(() => selectedStockStore.id, (newId) => {
  if (newId) {
    stockId.value = newId;
    // (선택사항) 주식이 바뀌면 수량을 1로 초기화하거나 비울 수 있음
    // stockQuantity.value = 1; 
  }
});

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

const getPlayerInfo = async () => {
  const url = '/api/players/' + player.playerId;
  const response = await apiCall.get(url, null, null);
  if (response.result === apiCall.Response.SUCCESS) {
    playerMoney.value = response.body.playerMoney
    table.items = response.body.stocks;
  }
}

const buyPlayerStock = async () => {
  // 빈 값이나 잘못된 수량 입력 시 API 호출 방지
  if (!stockId.value || !stockQuantity.value) {
    alert("주식 ID와 수량을 입력해주세요.");
    return;
  }
  if (Number(stockQuantity.value) <= 0) {
    alert("수량은 1 이상이어야 합니다.");
    return;
  }

  const url = '/api/players/buy';
  const requestBody = {
    playerId: player.playerId,
    stockId: stockId.value,
    stockQuantity: stockQuantity.value
  }

  await apiCall.post(url, null, requestBody);
  
  getPlayerInfo(); // 정보 갱신
  
  // 입력 필드 초기화
  stockId.value = ''
  stockQuantity.value = ''
}

const sellPlayerStock = async () => {
  // 빈 값이나 잘못된 수량 입력 시 API 호출 방지
  if (!stockId.value || !stockQuantity.value) {
    alert("주식 ID와 수량을 입력해주세요.");
    return;
  }
  if (Number(stockQuantity.value) <= 0) {
    alert("수량은 1 이상이어야 합니다.");
    return;
  }

  const url = '/api/players/sell';
  const requestBody = {
    playerId: player.playerId,
    stockId: stockId.value,
    stockQuantity: stockQuantity.value
  }

  await apiCall.post(url, null, requestBody);
  
  getPlayerInfo(); // 정보 갱신
  
  // 입력 필드 초기화
  stockId.value = ''
  stockQuantity.value = ''
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
      <ItemsTable :headers="table.headers" :items="table.items" :nosetting="true" />
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
      <InlineInput v-model="stockQuantity" placeholder="주식수량" />
    </div>
    <div class="col d-flex justify-content-start">
      <button class="btn btn-sm btn-outline-primary m-1" @click="buyPlayerStock">주식 구매</button>
      <button class="btn btn-sm btn-outline-primary m-1" @click="sellPlayerStock">주식 판매</button>
    </div>
  </div>
</template>