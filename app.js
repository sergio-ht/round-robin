const form = document.querySelector("form");
const tbody = document.querySelector("tbody");
const time = document.getElementById("time");
const quantum = document.getElementById("quantum");
const animateBtn = document.getElementById("animate-btn");
const standardSpan = document.getElementById("standard-deviation");
const waitingSpan = document.getElementById("waiting-time");

const processList = [
  // { id: 1, time: 1, start: 0, hue: 100 },
  // { id: 2, time: 2, start: 1, hue: 200 },
  // { id: 3, time: 3, start: 3, hue: 300 },
];

let id = 1;

form.addEventListener("submit", (e) => {
  e.preventDefault();
  addProcess();
});

function addProcess() {
  if (time.value === "") return;
  //   create process
  const process = {
    id: id++,
    time: parseInt(time.value),
    hue: Math.round(Math.random() * 360),
  };

  //   add to queue
  processList.push(process);

  //   add to table
  const tr = document.createElement("tr");

  for (key in process) {
    if (key === "hue") continue;
    const td = document.createElement("td");
    td.innerHTML = process[key];
    tr.appendChild(td);
  }

  tbody.appendChild(tr);

  //   clear inputs
  time.value = "";
}

function getTimeIntervals(processes, quantum) {
  const timestamps = [];
  const its = Math.ceil(Math.max(...processes) / quantum);
  timer = 0;

  for (let i = 0; i < its; i++) {
    const curr = [];
    processes.forEach((process, index) => {
      inc = Math.min(process, quantum);
      curr.push([timer, timer + inc]);
      timer += inc;
      processes[index] -= inc;
      last_iteration = processes[index] === 0;
    });
    timestamps.push(curr);
  }
  return timestamps;
}

function DataSet(data, index) {
  this.label = `Iteración: ${index + 1}`;
  this.data = data;
  this.backgroundColor = processList.map(
    (process) => `hsl(${process.hue}, 50%, 70%)`
  );
  this.borderColor = processList.map(
    (process) => `hsl(${process.hue}, 80%, 30%)`
  );
  this.borderWidth = 3;
  this.borderSkipped = false;
  this.borderRadius = 15;
}

function displayHiddenElements() {
  const chartBox = document
    .getElementById("chartBox")
    .classList.remove("hidden");

  const hiddenTable = document.querySelectorAll(".hidden-table");
  hiddenTable.forEach((element) => element.classList.remove("hidden-table"));
}

function getStartTimes(timeIntervals) {
  return timeIntervals[0].map((timeInterval) => timeInterval[0]);
}

function getEndTimes(timeIntervals) {
  const endTimes = [...Array(timeIntervals.length)];
  for (let i = 0; i < timeIntervals.length; i++) {
    timeIntervals[i].forEach((it, index) => {
      if (it[0] != it[1]) {
        endTimes[index] = it[1];
      }
    });
  }
  return endTimes;
}

function getWaitingTimes(endTimes) {
  return endTimes.map((endTime, index) => {
    return endTime - processList[index].time;
  });
}

function updateTable(startTimes, endTimes, waitingTimes) {
  const rows = tbody.getElementsByTagName("tr");
  let i = 0;
  for (let row of rows) {
    // add startTime
    const td_start = document.createElement("td");
    td_start.textContent = startTimes[i];
    row.appendChild(td_start);

    // add endTime
    const td_end = document.createElement("td");
    td_end.textContent = endTimes[i];
    row.appendChild(td_end);
    // add waitingTime
    const td_waiting = document.createElement("td");
    td_waiting.textContent = waitingTimes[i++];
    row.appendChild(td_waiting);
  }
}

function getStandardDeviation(array) {
  const n = array.length;
  const mean = array.reduce((a, b) => a + b) / n;
  return Math.sqrt(
    array.map((x) => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n
  );
}

animateBtn.addEventListener("click", (e) => {
  e.preventDefault();

  // display hidden elements
  displayHiddenElements();

  const processesValues = processList.map((process) => process.time);
  const dataIterations = getTimeIntervals(
    processesValues,
    parseInt(quantum.value)
  );
  const datasets = dataIterations.map(
    (data, index) => new DataSet(data, index)
  );

  // calculate start times
  const startTimes = getStartTimes(dataIterations);

  // calculate end times
  const endTimes = getEndTimes(dataIterations);

  // calculate waiting times
  const waitingTimes = getWaitingTimes(endTimes);

  // update table with times
  updateTable(startTimes, endTimes, waitingTimes);

  // avg waiting times
  const avgWaitingTimes =
    waitingTimes.reduce((a, b) => a + b) / waitingTimes.length;
  waitingSpan.textContent = avgWaitingTimes;

  // standard deviation
  const sd = getStandardDeviation(waitingTimes);
  standardSpan.textContent = sd;

  console.log(avgWaitingTimes);
  console.log(sd);

  // setup
  const data = {
    labels: processList.map((process) => process.id),
    datasets: datasets,
  };

  // config
  let delayed;
  const config = {
    type: "bar",
    data,
    options: {
      plugins: {
        legend: {
          position: "bottom",
        },
      },
      indexAxis: "y",
      scales: {
        y: {
          title: {
            display: true,
            text: "Proceso",
          },
          beginAtZero: true,
          stacked: true,
        },
        x: {
          title: {
            display: true,
            text: "tiempo",
          },
          stacked: false,
        },
      },
      animation: {
        onComplete: () => {
          delayed = true;
        },
        delay: (context) => {
          let delay = 0;
          if (
            context.type === "data" &&
            context.mode === " default" &&
            !delayed
          ) {
            delay = context.dataIndex * 300 + context.datasetIndex * 100;
          }
          return delay;
        },
      },
    },
  };

  const myChart = new Chart(document.getElementById("myChart"), config);
});

// render init block
// const myChart = new Chart(document.getElementById("myChart"), config);
