//Переменные логики
let interval;
let isRunning = false;
//выставлять в интервале 0.05-0.2
const animationInterval = 0.1;

//Физические переменные
let t = 0;
let k = 0;
let m = 0;
let w0 = 0;
let x0 = 0;
let x = 0;
let n = 0;

//переменная используются для подсчета количества колебаний
let fixedTime = 0;

//получение контекста канваса
const canvas = $("#canvas")[0];
const ctx = canvas.getContext("2d");

//общее обновление
update();

//добавление слушателей
addListeners();

//функция запуска, остановки анимации
function startStopAnimation() {
  isRunning = !isRunning;
  $("#start-stop-button").text(isRunning ? "Stop" : "Play");
  disableEnableInputs();

  //остановка анимации
  if (!isRunning) {
      update()
      return clearInterval(interval);
  }

  //запуск анимации
  interval = setInterval(animate, animationInterval * 1000);
}
//Функция анимации
function animate() {
  t += animationInterval;
  update();
  counter();
}

//функция подсчета количества колебаний
function counter() {
  //условие протестировано для animationInterval в интервале 0.05-0.2
  if (x0 - x < 1 && t - fixedTime > 0.8) {
    n++;
    fixedTime = t;
  }
}

function addListeners() {
  //старт, стоп анимации
  $("#start-stop-button").click(startStopAnimation);

  //обработчики на инпуты
  ["m", "k", "x0"].forEach((physVar) => {
    $(`#${physVar}-input`).on("input", function (e) {
      $(`#${physVar}-current`).text($(e.target).val());
      update();
    });
  });
}

//функция отключения/включения инпутов
function disableEnableInputs() {
  ["m", "k", "x0"].forEach((physVar) => {
    $(`#${physVar}-input`).prop("disabled", isRunning);
  });
}

//функция общего обновления
function update() {
  updatePhysicalVars();
  updateSpecifications();
  updateView();
}

//функция обновления физических переменных
function updatePhysicalVars() {
  if (isRunning) {
    x = Math.cos(w0 * t) * x0;
  } else {
    t = 0;
    k = Number($("#k-input").val());
    m = Number($("#m-input").val());
    x0 = Number($("#x0-input").val());
    w0 = Math.sqrt(k / m);
    x = Math.cos(w0 * t) * x0;
    n = 0;
    fixedTime = 0;
  }
}

//функция обновления характеристик
function updateSpecifications() {
  $("#w0-var").text(w0.toFixed(2));
  $("#t-var").text(t.toFixed(1));
  $("#n-var").text(n);
  $("#x-var").text(x.toFixed(2));
}

//функция обновления визуализации
function updateView() {
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
