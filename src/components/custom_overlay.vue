<script setup lang="ts">
import {onMounted, ref, watch} from 'vue';
import * as echarts from 'echarts';
import {RootObject} from '../interface/real_time_data.ts';
import roma from '../theme/roma.json';
import ReconnectingWebSocket from 'reconnecting-websocket';

const socket = new ReconnectingWebSocket("ws://127.0.0.1:24050/ws");
const socketStatus = ref<string>('CLOSED');
const realTimeData = ref<RootObject>();
const chartObj = ref<echarts.ECharts>()

type NumberArray = [number, number];
type UnStableRateTime = NumberArray[];

interface chartData {
  unStableRateTime: UnStableRateTime;
  totalTime: number;
}
const chartData = ref<chartData>({
  unStableRateTime: [],
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
  }
}, 1000); // 1秒钟检查一次WebSocket状态

function saveURHistory() {
  if (realTimeData.value!.gameplay.hits.unstableRate !== 0) {
    const unStableRate:number = Number(realTimeData.value!.gameplay.hits.unstableRate.toFixed(2));
    const newValue:NumberArray = [unStableRate,realTimeData.value!.menu.bm.time.current];
    chartData.value.unStableRateTime.push(newValue);
  }
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
      unStableRateTime: [],
      totalTime: 0
    };
    const intervalTime = 1000 + realTimeData.value!.menu.bm.time.current % 6000;
    timerId.value = setInterval(() => {
      saveURHistory();
    }, intervalTime);
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
    animationDurationUpdate: 300, // 加快动画速度到 300 毫秒
    // animationEasingUpdate: 'linear', // 使用线性动画缓动效果
    grid: {
      left: '3%',
      right: '5%',
      bottom: '10%',
      top: '10%',
      containLabel: true
    },
    visualMap: {
      show: false, // 不显示 visualMap 组件，但仍然有映射作用
      type: 'piecewise', // 分段型视觉映射
      pieces: [
          {gte: 0, lt: 75, color: '#d9f0a3'}, // gte: 大于等于, lt: 小于
          {gte: 75, lt: 100, color: '#b7e2a8'}, // gte: 大于等于, lt: 小于
          {gte: 100, lt: 125, color: '#7bc96f'},
          {gte: 125, lt: 150, color: '#ffbb22'},
          {gte: 150, lt: 175, color: '#ff8c00'},
          {gte: 175, lt: 200, color: '#d62728'},
          {gte: 200, color: '#ff0000'}
      ],
      dimension: 1 // 根据哪个维度的数据来分段，这里假设是 x 轴的数据
    },
    xAxis: {
      type: 'time',
      max: function () {
        return chartData.value.totalTime;
      },
      axisLabel: {
        formatter: function (value: number) {
          // milliseconds to minutes:seconds
          const minutes = Math.floor(value / 60000);
          const seconds = ((value % 60000) / 1000).toFixed(0);
          return `${minutes}:${parseInt(seconds) < 10 ? '0' : ''}${seconds}`;
        },
        fontSize: 10,
      }
    },
    yAxis: {
      type: 'value',
      min: 'dataMin'
    },
    series: [
      {
        data: chartData.value.unStableRateTime.map(item => [item[1], item[0]]),
        endLabel: {
          show: true,
          position: 'top',
          fontWeight: 'bold'
        },
        type: 'line',
      }
    ]
  };

  // 设置图表的初始配置
  chartObj.value.setOption(option);

  watch(realTimeData, (newVal) => {
    if (socketStatus.value === 'OPEN' && newVal && isPlaying.value) {
      // 直接使用chartData更新图表
      chartObj.value!.setOption({
        series: [{
          data: chartData.value.unStableRateTime.map(item => [item[1], item[0]]),
        }]
      });
    }
  });

  watch(isPlaying, (newVal) => {
    if (newVal) {
      // 重置chartData
      chartData.value = { unStableRateTime: [], totalTime: realTimeData.value!.menu.bm.time.full };
      // 可能不需要额外的定时器，因为realTimeData更新本身可以触发图表更新
    } else {
      if (timerId.value) {
        clearInterval(timerId.value);
      }
    }
  });
});

</script>

<template>
  <div class="bg-gray-100 rounded-2xl w-300 h-fit">
    <h1 class="text-center font-black text-gray-600 py-2">Unstable Rate Graph</h1>
    <div id="chart" class="chart-container w-300 h-60" />
    <div v-if="realTimeData" class="text-center text-sm text-gray-600 font-black">
      {{realTimeData.menu.bm.metadata.artist + ' - ' + realTimeData.menu.bm.metadata.title + ' [' + realTimeData.menu.bm.metadata.difficulty + ']'}}
    </div>
  </div>
</template>

<style scoped>

</style>
