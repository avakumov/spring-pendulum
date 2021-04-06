//Переменные логики
const logic = {
  interval: null,
  isRunning: false,
  //выставлять в интервале 0.05-0.2
  animationInterval: 0.1,
};

//Физические переменные
const phys = {
  t: 0,
  k: 0,
  m: 0,
  w0: 0,
  x0: 0,
  x: 0,
  n: 0,
  fixedTime: 0,
};

const selectors = {
  
  //приводятся к виду селекторов: "#"+х+"-input", "#"+x+"-current",
  //!!!!!!должны совпадать с названиями физических переменных!!!!!!!
  inputs: ["m", "k", "x0"],

  //вывод переменных с округлением приводятся к виду селектора: "#"+х.value+"-output"
  //!!!!!!должны совпадать с названиями физических переменных!!!!!!!
  outputs: [
    { value: "w0", fixed: 2 },
    { value: "t", fixed: 1 },
    { value: "n", fixed: 0 },
    { value: "x", fixed: 2 },
  ],
  startStop: "#start-stop-button",
  canvas: "#canvas",
};

//получение контекста канваса
const canvas = $(selectors.canvas)[0];
const ctx = canvas.getContext("2d");

//общее обновление
update(logic.isRunning, phys, selectors);

//добавление слушателей
addListeners(logic, phys, selectors);

//функция запуска, остановки анимации
function startStopAnimation(logic, phys, selectors) {
  logic.isRunning = !logic.isRunning;
  $(selectors.startStop).text(logic.isRunning ? "Stop" : "Play");
  disableEnableInputs(logic.isRunning, selectors.inputs);

  //остановка анимации
  if (!logic.isRunning) {
    update(logic.isRunning, phys, selectors);
    return clearInterval(logic.interval);
  }

  //запуск анимации
  logic.interval = setInterval(
    () => animate(logic, phys, selectors),
    logic.animationInterval * 1000
  );
}

//Функция анимации
function animate(logic, phys, selectors) {
  phys.t += logic.animationInterval;
  update(logic.isRunning, phys, selectors);
  counter(phys);
}

//функция подсчета количества колебаний
function counter(phys) {
  //условие протестировано для animationInterval в интервале 0.05-0.2
  if (phys.x0 - phys.x < 1 && phys.t - phys.fixedTime > 0.8) {
    phys.n++;
    phys.fixedTime = phys.t;
  }
}

function addListeners(logic, phys, selectors) {
  //старт, стоп анимации
  $(selectors.startStop).click(() =>
    startStopAnimation(logic, phys, selectors)
  );

  //обработчики на инпуты
  selectors.inputs.forEach((physVar) => {
    $(`#${physVar}-input`).on("input", function (e) {
      $(`#${physVar}-current`).text($(e.target).val());
      update(logic.isRunning, phys, selectors);
    });
  });
}

//функция отключения/включения инпутов
function disableEnableInputs(isRunning, inputs) {
  inputs.forEach((physVar) => {
    $(`#${physVar}-input`).prop("disabled", isRunning);
  });
}

//функция общего обновления
function update(isRunning, phys, selectors) {
  updatePhysicalVars(isRunning, phys, selectors.inputs);
  updateSpecifications(phys, selectors.outputs);
  updateView(phys);
}

//функция обновления физических переменных
function updatePhysicalVars(isRunning, phys, inputs) {
  if (isRunning) {
    phys.x = Math.cos(phys.w0 * phys.t) * phys.x0;
  } else {
    phys.t = 0;
    inputs.forEach(
      (physVar) => (phys[physVar] = Number($(`#${physVar}-input`).val()))
    );
    phys.w0 = Math.sqrt(phys.k / phys.m);
    phys.x = Math.cos(phys.w0 * phys.t) * phys.x0;
    phys.n = 0;
    phys.fixedTime = 0;
  }
}

//функция обновления характеристик
function updateSpecifications(phys, outputs) {
  outputs.forEach((output) =>
    $(`#${output.value}-output`).text(phys[output.value].toFixed(output.fixed))
  );
}

//функция обновления визуализации
function updateView({ x, m }) {
  //очистить предыдущий рендер
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  //длина пружины в см
  const len = 40;
  //перевод в пиксели с коэффициентом для лучшего отображения
  const y = (x + len) * 0.35;
  //смещение пружины
  const dy = 40;

  ctx.filter = "opacity(50%)";

  //подвес
  ctx.beginPath();
  ctx.moveTo(0, 20);
  ctx.lineTo(300, 20);
  for (let i = 0; i < 20; i++) {
    ctx.moveTo(17 * i, 17);
    ctx.lineTo(17 * (i + 1), 5);
  }
  ctx.moveTo(150, 20);
  ctx.lineTo(150, 38);
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.stroke();

  //пружина
  ctx.beginPath();
  ctx.moveTo(5 * 30, dy);
  for (let i = 0; i < 4; i++) {
    ctx.lineTo(3 * 30, dy + (1 + 4 * i) * y);
    ctx.lineTo(7 * 30, dy + (3 + 4 * i) * y);
  }
  ctx.lineTo(5 * 30, dy + 16 * y);
  ctx.lineTo(5 * 30, dy + 16 * y + 18);
  ctx.lineWidth = 2;
  ctx.lineJoin = "round";
  ctx.stroke();

  //шарик
  ctx.beginPath();
  ctx.filter = "opacity(100%)";
  ctx.arc(150, dy + 16 * y + 45, 35 * Math.cbrt(m), 0, 2 * Math.PI, true);
  ctx.fillStyle = "#4caf50";
  ctx.fill();
  ctx.filter = "opacity(50%)";
  ctx.lineWidth = 2;
  ctx.stroke();
}
