function graphListener(evt, item) {
  item.forEach((chartElement) => {
    if (chartElement.datasetIndex === 0) {
      const targets = evt.chart.config.data.datasets[0].target;
      const targetSet = Array.from(new Set(targets));
      const index = targetSet.indexOf(targets[chartElement.index]);
      const legendTarget = document.querySelector(
        `.target[data-target="${index}"]`
      );
      const button = legendTarget.querySelector(".accordion");
      if (!legendTarget.classList.contains("show"))
        showTargetLegend({ currentTarget: button });
    }
  });
}

function showTargetLegend(evt) {
  const button = evt.currentTarget;
  const legendTarget = button.closest(".target");
  if (!legendTarget.classList.contains("show")) {
    document.querySelectorAll(".target").forEach((content) => {
      content.classList.remove("show");
    });
    legendTarget.classList.add("show");
  } else {
    legendTarget.classList.remove("show");
  }
}

function generateLegend(landbotData) {
  const legendItem = document.querySelector(".target");
  document.querySelector("#chartjs-container").classList.add("show");
  landbotData.forEach((target, index) => {
    const clone = legendItem.cloneNode(true);
    const button = clone.querySelector(".accordion");
    clone.setAttribute("data-target", index);
    button.addEventListener("click", showTargetLegend);
    clone.querySelector(".target-name").textContent = target.target;
    button.style.backgroundColor = target.color;
    const targetContent = clone.querySelector(".target-content");
    const pillars = clone.querySelector(".target-pillars");
    target.pillars.forEach((pillar) => {
      const clonePillars = pillars.cloneNode(true);
      clonePillars.querySelector(".target-pillar-name").textContent =
        pillar.name;
      clonePillars.querySelector(".target-pillar-def").textContent +=
        pillar.def;
      clonePillars.querySelector(".target-pillar-kpis").textContent +=
        pillar.kpis.join(", ");
      targetContent.appendChild(clonePillars);
    });
    legendItem.parentElement.appendChild(clone);
  });
}

// eslint-disable-next-line no-unused-vars
function displayLogo(gDriveShareLink, brandName) {
  const figure = document.querySelector(".company_logo");
  const img = figure.querySelector("img");
  const re = /(?<=d\/).*(?=\/)/;
  if (re.test(gDriveShareLink)) {
    const fileId = gDriveShareLink.match(re)[0];
    img.setAttribute("src", "https://drive.google.com/uc?id=" + fileId);
  }
  img.setAttribute("alt", brandName + " logo");
  figure.classList.add("show");
}

function buildChartData(landbotData) {
  const chartData = [];
  landbotData.forEach((data) => {
    data.pillars.forEach((pillar) => {
      chartData.push({
        name: pillar.name,
        rate: pillar.answer,
        target: data.target,
        kpis: pillar.kpis,
        def: pillar.def,
        color: data.color,
      });
    });
  });
  return chartData;
}

// eslint-disable-next-line no-unused-vars
const updateChartData = (landbotData) => {
  // eslint-disable-next-line no-undef
  const chart = Chart.getChart("chartjs");
  // eslint-disable-next-line no-undef
  const chartData = buildChartData(landbotData);
  const chartPieceAngle = 360 / chartData.length;
  if (chart === undefined) {
    generateLegend(landbotData);
    // eslint-disable-next-line no-new, no-undef
    new Chart("chartjs", {
      type: "polarArea",
      // eslint-disable-next-line no-undef
      plugins: [ChartDataLabels],
      data: {
        labels: chartData.map((d) => d.name),
        datasets: [
          {
            target: chartData.map((d) => d.target),
            backgroundColor: chartData.map((d) => d.color),
            borderWidth: 1,
            borderColor: "rgb(255, 255, 255)",
            data: chartData.map((d) => d.rate),
            datalabels: {
              display: false,
            },
          },
          {
            name: chartData.map((d) => d.name),
            backgroundColor: chartData.map((d) => "rgb(255, 255, 255)"),
            borderWidth: 1,
            borderColor: "rgb(255, 255, 255)",
            data: chartData.map((d) => 5),
            datalabels: {
              anchor: "center",
              align: "center",
              color: "black",
              font: {
                family: "Montserrat",
                weight: 300,
                size: window.innerWidth > 600 ? 14 : 10,
              },
              formatter: (_, ctx) => ctx.dataset.name[ctx.dataIndex],
              rotation: (ctx) => {
                let angle =
                  chartPieceAngle / 2 + ctx.dataIndex * chartPieceAngle - 90;
                if (ctx.dataIndex >= ctx.dataset.name.length / 2) {
                  angle =
                    chartPieceAngle / 2 +
                    (ctx.dataIndex - ctx.dataset.name.length / 2) *
                      chartPieceAngle -
                    90;
                }
                return angle;
              },
            },
          },
        ],
      },
      options: {
        interaction: {
          mode: "index",
        },
        events: ["click"],
        aspectRatio: 1,
        onClick: graphListener,
        scales: {
          r: {
            max: 5,
            min: 0,
            ticks: {
              stepSize: 1,
              display: false,
            },
            grid: {
              z: 1,
              color: "rgba(255, 255, 255, 0.6)",
            },
          },
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            enabled: false,
          },
        },
      },
    });
  } else {
    // eslint-disable-next-line no-undef
    chart.data.datasets[0].data = chartData.map((d) => d.rate);
    // eslint-disable-next-line no-undef
    chart.update();
  }
};
