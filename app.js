const form = document.querySelector("form");
const tbody = document.querySelector("tbody");
const time = document.getElementById("time");
const quantum = document.getElementById("quantum");
const animateBtn = document.getElementById("animate-btn");

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

  const hiddenTable = document.getElementsByClassName("hidden-table");
  for (let element of hiddenTable) {
    element.classList.remove("hidden-table");
  }
}

function updateTable() {
  const rows = tbody.getElementsByTagName("tr");
  let i = 0;
  for (let row of rows) {
    // create td
    const td = document.createElement("td");
    td.textContent = `${i++}`;
    row.appendChild(td);
  }
}

animateBtn.addEventListener("click", (e) => {
  e.preventDefault();

  // display hidden elements
  displayHiddenElements();

  // update table with times
  updateTable();

  const processesValues = processList.map((process) => process.time);
  const dataIterations = getTimeIntervals(
    processesValues,
    parseInt(quantum.value)
  );
  const datasets = dataIterations.map(
    (data, index) => new DataSet(data, index)
  );

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
