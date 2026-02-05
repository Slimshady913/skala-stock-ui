<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import apiCall from '@/scripts/api-call'; 
import { storePlayer } from '@/scripts/store-player';
import { notifyInfo } from '@/scripts/store-popups';

const router = useRouter();

const playerId = ref('');
const playerPassword = ref('');
const playerMoney = ref(0); 
const isNewPlayer = ref(false);
const isLoading = ref(false);

// 공통 로그인 처리 로직 (UI 로직 제외, 순수 통신/저장 로직)
const processLogin = async (id, pw) => {
  const url = '/api/players/login';
  const requestBody = {
    playerId: id,
    playerPassword: pw,
  };

  const response = await apiCall.post(url, null, requestBody);
  
  if (response.result === apiCall.Response.SUCCESS) {
    storePlayer(response.body); // 정보 저장
    return true; // 성공 여부 반환
  }
  return false;
};

const login = async () => {
  // 유효성 검사
  if (!playerId.value.trim() || !playerPassword.value.trim()) {
    notifyInfo("ID와 비밀번호를 모두 입력해주세요.");
    return;
  }

  if (isLoading.value) return;
  isLoading.value = true;

  try {
    // 분리한 로그인 로직 호출
    const isSuccess = await processLogin(playerId.value, playerPassword.value);

    if (isSuccess) {
      router.push('/stock');
    } else {
      // 로그인 실패 시 UI 처리
      isNewPlayer.value = true;
      notifyInfo("ID와 비밀번호 입력후 [회원가입] 버튼을 누르세요.");
    }
  } catch (error) {
    console.error(error);
    notifyInfo("서버 통신 중 오류가 발생했습니다.");
  } finally {
    isLoading.value = false;
  }
};

const signup = async () => {
  // 유효성 검사
  if (!playerId.value.trim() || !playerPassword.value.trim()) {
    notifyInfo("가입할 ID와 비밀번호를 입력해주세요.");
    return;
  }

  if (isLoading.value) return;
  isLoading.value = true;

  try {
    const url = '/api/players';
    const requestBody = {
      id: 0,
      playerId: playerId.value,
      playerPassword: playerPassword.value,
      playerMoney: playerMoney.value 
    };

    const response = await apiCall.post(url, null, requestBody);
    
    if (response.result === apiCall.Response.SUCCESS) {
      isNewPlayer.value = false;
      
      // 회원가입 성공 후, 분리해 둔 로그인 로직 호출
      // 여기서 isLoading을 조작할 필요가 없습니다. (signup 함수의 finally가 처리함)
      const isLoginSuccess = await processLogin(playerId.value, playerPassword.value);

      if (isLoginSuccess) {
        router.push('/stock');
      } else {
        // 혹시라도 가입은 됐는데 로그인이 안 된 경우 (드문 케이스)
        notifyInfo("회원가입 성공! 로그인 해주세요.");
      }
    } else {
       notifyInfo("회원가입에 실패했습니다. 다른 ID를 사용해보세요.");
    }
  } catch (error) {
    console.error(error);
    notifyInfo("가입 처리 중 오류가 발생했습니다.");
  } finally {
    // login()을 직접 호출하지 않았으므로, 여기서 안전하게 로딩 해제 가능
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="container-sm mt-3 border border-2 p-1" style="max-width: 600px">
    <div class="bss-background p-1 d-flex flex-column justify-content-between">
      
      <div class="mt-3 d-flex justify-content-center align-items-center" style="flex-grow: 1;">
        <span class="text-center text-danger fs-1 fw-bold title-shadow">
          SKALA STOCK Market
        </span>
      </div>

      <div class="row bg-info-subtle p-3 m-1 rounded shadow-sm login-card">
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
            <button 
              class="btn btn-primary btn-sm" 
              @click="signup" 
              :disabled="isLoading"
            >
              {{ isLoading ? '가입 중...' : '회원가입' }}
            </button>
            <button 
              class="btn btn-outline-secondary btn-sm" 
              @click="isNewPlayer = false"
              :disabled="isLoading"
            >
              취소
            </button>
          </template>
          <template v-else>
            <button 
              class="btn btn-primary btn-sm" 
              @click="login"
              :disabled="isLoading"
            >
              {{ isLoading ? '로그인 중...' : '로그인' }}
            </button>
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

/* 스타일 분리 */
.title-shadow {
  text-shadow: 2px 2px 4px rgba(255,255,255,0.8);
}

.login-card {
  opacity: 0.95;
}
</style>