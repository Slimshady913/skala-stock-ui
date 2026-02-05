<script setup>
import { ref, reactive, watch, onMounted } from 'vue';
import apiCall from '@/scripts/api-call';
// 주식 선택 시 스토어에 주식 정보 저장
import { setStock } from '@/scripts/store-stock';
import { notifyInfo } from '@/scripts/store-popups'; 

// 주식명, 주식가격 입력 필드
const stockName = ref('');
const stockPrice = ref('');

// 테이블 상태
const table = reactive({
  headers: [
    { label: "주식ID", value: "id" },
    { label: "주식명", value: "stockName" },
    { label: "주식가격", value: "stockPrice" },
  ],
  items: []
})

// 페이지네이터 상태
const page = reactive({
  total: 0,
  current: 1,
  count: 10,
})

// 주식 선택 시 스토어에 주식 정보 저장
const onRowSelected = (item) => {
  setStock(item);
}

// 주식 목록 조회 함수
const getStockList = async () => {
  table.items.length = 0 // 기존 목록 초기화

  const url = '/api/stocks/list'
  const queryParams = {
    count: page.count,
    offset: page.current - 1
  }
  
  try {
    const { body: pagedList } = await apiCall.get(url, null, queryParams)
    if (pagedList) {
      page.total = pagedList.total;
      page.current = pagedList.offset + 1;
      table.items = pagedList.list;
    }
  } catch (error) {
    console.error(error);
  }
}

// 주식 추가
const addStock = async () => {
  // 간단한 유효성 검사만 추가
  if (!stockName.value || !stockPrice.value) {
    notifyInfo("주식명과 가격을 입력해주세요.");
    return;
  }

  const url = '/api/stocks';
  
  const requestBody = {
    id: 0, 
    stockName: stockName.value,
    stockPrice: Number(stockPrice.value) // 가격은 숫자로 변환해서 전송
  }

  try {
    await apiCall.post(url, null, requestBody);
    
    // 추가 후 목록 갱신 및 입력창 초기화
    getStockList();
    stockName.value = '';
    stockPrice.value = '';
    notifyInfo("주식이 추가되었습니다.");
  } catch (error) {
    console.error(error);
    notifyInfo("주식 추가 중 오류가 발생했습니다.");
  }
}

// 페이지 변경 감지
watch(() => page.current, () => {
  getStockList()
})

// 페이지 크기 변경 감지
watch(() => page.count, () => {
  if (page.current === 1) {
    // 이미 1페이지라면 current 변경 감지가 안 되므로 직접 호출
    getStockList();
  } else {
    // 1페이지가 아니라면 1로 변경 -> 'page.current' 워처가 감지하여 getStockList 실행
    page.current = 1;
  }
})

// 컴포넌트 마운트 시 초기 목록 조회
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
      <button class="btn btn-sm btn-primary m-1" @click="getStockList">
        <i class="bi bi-arrow-counterclockwise m-2"></i>갱신
      </button>
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
      <InlineInput v-model="stockPrice" type="number" placeholder="주식가격" />
    </div>
    <div class="col d-flex justify-content-start">
      <button class="btn btn-sm btn-outline-primary me-2" @click="addStock">주식 추가</button>
    </div>
  </div>
</template>