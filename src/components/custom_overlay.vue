<script setup lang="ts">
import {onMounted, ref, watch} from 'vue';
import * as echarts from 'echarts';
import {RootObject} from '../interface/real_time_data.ts';
import roma from '../theme/roma.json';
import ReconnectingWebSocket from 'reconnecting-websocket';

const socket = new ReconnectingWebSocket("ws://127.0.0.1:24050/ws");
const socketStatus = ref<string>('CLOSED');
const realTimeData = ref<RootObject>();
const chartObj = ref<echarts.ECharts>();

interface chartData {
  unStableRate: number[];
  currentTime: number[];
  totalTime: number;
}
const chartData = ref<chartData>({
  unStableRate: [],
  currentTime: [],
  totalTime: 0
});
const isPlaying = ref<boolean>(false);
const timerId = ref<NodeJS.Timeout>();
// const bgPath = ref<string>('');
// const timeStamp = Date.now();

socket.onopen = () => {
  console.log("Successfully Connected");
};

socket.onclose = (event) => {
  console.log("Socket Closed Connection: ", event);
  socket.send("Client Closed!")
};

socket.onerror = (error) => {
  console.log("Socket Error: ", error);
};

socket.onmessage = (event) => {
  realTimeData.value = JSON.parse(event.data);
};

function getWebSocketStatus() {
  if (socket.readyState === 0) {
    return 'CONNECTING';
  } else if (socket.readyState === 1) {
    return 'OPEN';
  } else if (socket.readyState === 2) {
    return 'CLOSING';
  } else if (socket.readyState === 3) {
    return 'CLOSED';
  }
}

const intervalId = setInterval(() => {
  const status = getWebSocketStatus();
  console.log('WebSocket Status:', status);

  if (status === 'OPEN') {
    socketStatus.value = 'OPEN';
    clearInterval(intervalId); // 当WebSocket状态为'OPEN'时，停止循环
    console.log('WebSocket已打开，停止监听');
  }
}, 1000); // 1秒钟检查一次WebSocket状态

function saveURHistory() {
  if (realTimeData.value!.gameplay.score === 0) {
    return;
  }
  if (chartData.value.currentTime.length > 0) {
    // if the new time is less than the last time, reset the array
    if (realTimeData.value!.menu.bm.time.current <= chartData.value.currentTime[chartData.value.currentTime.length - 1]){
      isPlaying.value = false;
    }
  }
  // get the last element of the current time array
  if (chartData.value.currentTime.length > 0) {
    const lastTime = chartData.value.currentTime[chartData.value.currentTime.length - 1];
    // if the last element is the same as the current time, return
    if (lastTime === realTimeData.value!.menu.bm.time.current) {
      return;
    }
  }
  chartData.value.totalTime = realTimeData.value!.menu.bm.time.full;
  chartData.value.unStableRate.push(realTimeData.value!.gameplay.hits.unstableRate);
  chartData.value.currentTime.push(realTimeData.value!.menu.bm.time.current);
}

watch(realTimeData, (newVal) => {
  if (socketStatus.value === 'OPEN') {
    if (newVal) {
      if (newVal.menu.state !== 2) {
        isPlaying.value = false;
      } else if (newVal.menu.state === 2) {
        isPlaying.value = true;
      }
    }
  }
});

watch(isPlaying, (newVal) => {
  if (newVal) {
    chartData.value = {
      unStableRate: [],
      currentTime: [],
      totalTime: 0
    };
    timerId.value = setInterval(() => {
      saveURHistory();
    }, 1000);
  } else {
    if (timerId.value) {
      clearInterval(timerId.value);
    }
  }
});

onMounted(() => {
  // 初始化ECharts实例并存储在chartObj中
  echarts.registerTheme('roma', roma);
  chartObj.value = echarts.init(document.getElementById('chart'), 'roma');


  // 初始的图表配置选项
  const option = {
    xAxis: {
      type: 'category',
      data: chartData.value.currentTime,
      axisLabel: {
        formatter: function (value: number) {
          // milliseconds to minutes:seconds
          const minutes = Math.floor(value / 60000);
          const seconds = ((value % 60000) / 1000).toFixed(0);
          return `${minutes}:${parseInt(seconds) < 10 ? '0' : ''}${seconds}`;
        }
      }
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        data: chartData.value.unStableRate,
        type: 'line'
      }
    ]
  };

  // 设置图表的初始配置
  chartObj.value.setOption(option);

  // 监听数据变化，根据需要更新图表
  watch(
    // 监听数据变化的数据源，可以是多个数据
    chartData,
    (newValues) => {
      if (newValues) {
        timerId.value = setInterval(() => {
          chartObj.value!.setOption({
            xAxis: {
              data: newValues.currentTime
            },
            series: [
              {
                data: newValues.unStableRate
              }
            ]
          });
        }, 1000);
      } else if (newValues === null) {
        clearInterval(timerId.value);
      }
    }
  );
});

</script>

<template>
<!--  <div class="relative h-40 w-80">-->
<!--    <div class="z-10">{{ bgPath }}</div>-->
<!--    <div class="-z-10 absolute inset-0">-->
<!--      <img :src="bgPath" alt="bg" class="object-cover w-full h-full blur-sm" />-->
<!--    </div>-->
<!--  </div>-->
  <div id="chart" class="chart-container w-240 h-60" />
</template>

<style scoped>

</style>
