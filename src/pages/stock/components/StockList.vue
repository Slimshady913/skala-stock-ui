<script setup>
import { ref, reactive, watch, onMounted } from 'vue';
import apiCall from '@/scripts/api-call';
// 주식 정보를 공유하기 위한 스토어 임포트
import { setStock } from '@/scripts/store-stock';

const stockName = ref('');
const stockPrice = ref('');
const table = reactive({
  headers: [
    { label: "주식ID", value: "id" },
    { label: "주식명", value: "stockName" },
    { label: "주식가격", value: "stockPrice" },
  ],
  items: []
})

const page = reactive({
  total: 0,
  current: 1,
  count: 10,
})

// 테이블 행 클릭(선택) 시 실행되는 함수
const onRowSelected = (item) => {
  // 스토어에 선택된 주식 정보 업데이트
  setStock(item);
}

const getStockList = async () => {
  const url = '/api/stocks/list'
  const queryParams = {
    count: page.count,
    offset: page.current - 1
  }

  const { body: pagedList } = await apiCall.get(url, null, queryParams)
  
  if (pagedList) {
    page.total = pagedList.total;
    // API에서 받은 offset을 기반으로 현재 페이지 보정 (데이터 정합성 유지)
    page.current = pagedList.offset + 1; 
    table.items = pagedList.list;
  }
}

const addStock = async () => {
  // 유효성 검사: 빈 값으로 요청 보내는 것 방지
  if (!stockName.value || !stockPrice.value) {
    alert('주식명과 가격을 입력해주세요.');
    return;
  }

  const url = '/api/stocks';
  const requestBody = {
    id: 0,
    stockName: stockName.value,
    stockPrice: stockPrice.value
  }

  await apiCall.post(url, null, requestBody);

  // 목록 갱신 시 사용자가 추가한 항목을 볼 수 있도록 1페이지로 이동하는 것이 UX상 자연스러움.
  if (page.current === 1) {
    // 이미 1페이지라면 목록만 갱신 (watcher가 동작하지 않으므로 명시적 호출)
    getStockList();
  } else {
    // 1페이지가 아니라면 1페이지로 이동 -> page.current watcher에 의해 getStockList 자동 실행
    page.current = 1;
  }

  stockName.value = '';
  stockPrice.value = '';
}

// 페이지 변경 시 목록 조회
watch(() => page.current, () => {
  getStockList();
})

// 페이지 당 개수(count) 변경 시 처리
watch(() => page.count, () => {
  // 개수가 바뀌면 무조건 1페이지로 초기화해야 함.
  if (page.current === 1) {
    // 이미 1페이지인 경우: current 변경 감지가 안 되므로 직접 조회 함수 호출
    getStockList();
  } else {
    // 1페이지가 아닌 경우: current를 1로 변경하면 위의 'current' Watcher가 동작하여 조회함수 실행됨
    // 따라서 여기서 getStockList()를 또 호출하면 중복 호출이 되므로 생략
    page.current = 1;
  }
})

onMounted(() => {
  getStockList();
})
</script>

<template>
  <div class="row mt-2">
    <span class="fs-4"><i class="bi bi-graph-up m-2"></i>주식목록</span>
  </div>
  <div class="row border-bottom">
    <div class="col d-flex justify-content-end">
      <button class="btn btn-sm btn-primary m-1" @click="getStockList"><i
          class="bi bi-arrow-counterclockwise m-2"></i>갱신</button>
    </div>
  </div>
  <div class="row g-2 align-items-center m-2 mt-0">
    <div class="col">
      <ItemsTable 
        :headers="table.headers" 
        :items="table.items" 
        :nosetting="true" 
        @rowSelected="onRowSelected"
      />
      <PageNavigator :totalCount="page.total" v-model:current="page.current" v-model:count="page.count" />
    </div>
  </div>
  <div class="row g-2 m-2 border-top">
    <div class="col-2 d-flex justify-content-end">
      <label class="col-form-label form-control-sm p-1">주식정보</label>
    </div>
    <div class="col">
      <InlineInput v-model="stockName" placeholder="주식명" />
    </div>
    <div class="col">
      <InlineInput v-model="stockPrice" placeholder="주식가격" />
    </div>
    <div class="col d-flex justify-content-start">
      <button class="btn btn-sm btn-outline-primary me-2" @click="addStock">주식 추가</button>
    </div>
  </div>
</template>