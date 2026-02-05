<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import apiCall from '@/scripts/api-call'; 
import { storePlayer } from '@/scripts/store-player';
import { notifyInfo } from '@/scripts/store-popups';


const router = useRouter();

const playerId = ref('');
const playerPassword = ref('');
// 서버 전송 시 빈 문자열('')이면 에러가 날 수 있어 숫자 0으로 초기화
const playerMoney = ref(0); 
const isNewPlayer = ref(false);

const login = async () => {
  const url = '/api/players/login';
  const requestBody = {
    playerId: playerId.value,
    playerPassword: playerPassword.value,
  }

  // apiCall.post(url, queryParams, body) 형식
  const response = await apiCall.post(url, null, requestBody);
  
  if (response.result === apiCall.Response.SUCCESS) {
    storePlayer(response.body); // 플레이어 정보를 저장
    router.push('/stock');
  } else {
    isNewPlayer.value = true;
    notifyInfo("ID와 비밀번호 입력후 [회원가입] 버튼을 누르세요.");
  }
}

const signup = async () => {
  const url = '/api/players';
  const requestBody = {
    id: 0,
    playerId: playerId.value,
    playerPassword: playerPassword.value,
    playerMoney: playerMoney.value // 화면에 입력란은 없지만 0으로 전송됨
  }

  const response = await apiCall.post(url, null, requestBody);
  if (response.result === apiCall.Response.SUCCESS) {
    isNewPlayer.value = false;
    login(); // 회원가입 성공 시 바로 로그인 시도
  }
}
</script>

<template>
  <div class="container-sm mt-3 border border-2 p-1" style="max-width: 600px">
    <div class="bss-background p-1 d-flex flex-column justify-content-between">
      
      <div class="mt-3 d-flex justify-content-center align-items-center" style="flex-grow: 1;">
        <span class="text-center text-danger fs-1 fw-bold" style="text-shadow: 2px 2px 4px rgba(255,255,255,0.8);">
          SKALA STOCK Market
        </span>
      </div>

      <div class="row bg-info-subtle p-3 m-1 rounded shadow-sm" style="opacity: 0.95;">
        <div class="col-12">
          <InlineInput 
            label="플레이어ID" 
            class="mb-2" 
            v-model="playerId" 
            type="text" 
            placeholder="ID 입력" 
          />
          <InlineInput 
            label="비밀번호" 
            class="mb-3" 
            v-model="playerPassword" 
            type="password" 
            placeholder="비밀번호 입력"
            @keyup.enter="isNewPlayer ? signup() : login()" 
          />
        </div>
        
        <div class="d-flex justify-content-end gap-2">
          <template v-if="isNewPlayer">
            <button class="btn btn-primary btn-sm" @click="signup">회원가입</button>
            <button class="btn btn-outline-secondary btn-sm" @click="isNewPlayer = false">취소</button>
          </template>
          <template v-else>
            <button class="btn btn-primary btn-sm" @click="login">로그인</button>
          </template>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.bss-background {
  width: 100%;
  height: 380px;
  background-image: url('/logo.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}
</style>